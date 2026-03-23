import type { AnnouncementRecord, BranchRecord, OperationalState, StatusKind } from "./schema";
import { statusKinds } from "./schema";

export interface ReducerContract<TName extends string, TInput> {
  name: TName;
  description: string;
  apply: (state: OperationalState, input: TInput) => OperationalState;
}

export interface CreateBranchInput {
  branchId: string;
  slug: string;
  name: string;
  isActive?: boolean;
  sortOrder: number;
}

export interface UpdateBranchInput {
  branchId: string;
  slug?: string;
  name?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface DeactivateBranchInput {
  branchId: string;
}

export interface UpsertAnnouncementInput extends AnnouncementRecord {}

export interface SetAnnouncementBranchTargetsInput {
  announcementId: string;
  branchIds: string[];
}

function assertKnownStatusKind(statusKind: StatusKind): void {
  if (!statusKinds.includes(statusKind)) {
    throw new Error(`Unsupported statusKind '${statusKind}'.`);
  }
}

function assertValidEffectiveWindow(startsAt: string | null, endsAt: string | null): void {
  if (startsAt === null || endsAt === null) {
    return;
  }

  if (Date.parse(startsAt) > Date.parse(endsAt)) {
    throw new Error("Announcement startsAt must be earlier than or equal to endsAt.");
  }
}

function assertSortOrder(sortOrder: number): void {
  if (!Number.isFinite(sortOrder)) {
    throw new Error("Branch sortOrder must be a finite number.");
  }
}

function assertBranchExists(state: OperationalState, branchId: string): BranchRecord {
  const branch = state.branches.find((item) => item.branchId === branchId);

  if (!branch) {
    throw new Error(`Unknown branch '${branchId}'.`);
  }

  return branch;
}

function assertAnnouncementExists(state: OperationalState, announcementId: string): AnnouncementRecord {
  const announcement = state.announcements.find((item) => item.announcementId === announcementId);

  if (!announcement) {
    throw new Error(`Unknown announcement '${announcementId}'.`);
  }

  return announcement;
}

function assertUniqueBranchSlug(
  state: OperationalState,
  slug: string,
  currentBranchId?: string,
): void {
  const duplicate = state.branches.find(
    (branch) => branch.slug === slug && branch.branchId !== currentBranchId,
  );

  if (duplicate) {
    throw new Error(`Branch slug '${slug}' is already in use.`);
  }
}

function sortBranches(branches: BranchRecord[]): BranchRecord[] {
  return [...branches].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}

function dedupeBranchIds(branchIds: string[]): string[] {
  return [...new Set(branchIds)];
}

export const createBranch: ReducerContract<"createBranch", CreateBranchInput> = {
  name: "createBranch",
  description: "Create a normalized branch master record.",
  apply: (state, input) => {
    if (state.branches.some((branch) => branch.branchId === input.branchId)) {
      throw new Error(`Branch '${input.branchId}' already exists.`);
    }

    assertUniqueBranchSlug(state, input.slug);
    assertSortOrder(input.sortOrder);

    return {
      ...state,
      branches: sortBranches([
        ...state.branches,
        {
          branchId: input.branchId,
          slug: input.slug,
          name: input.name,
          isActive: input.isActive ?? true,
          sortOrder: input.sortOrder,
        },
      ]),
    };
  },
};

export const updateBranch: ReducerContract<"updateBranch", UpdateBranchInput> = {
  name: "updateBranch",
  description: "Update branch lifecycle fields without bypassing reducer validation.",
  apply: (state, input) => {
    const current = assertBranchExists(state, input.branchId);
    const nextSlug = input.slug ?? current.slug;
    const nextSortOrder = input.sortOrder ?? current.sortOrder;

    assertUniqueBranchSlug(state, nextSlug, current.branchId);
    assertSortOrder(nextSortOrder);

    return {
      ...state,
      branches: sortBranches(
        state.branches.map((branch) =>
          branch.branchId === input.branchId
            ? {
                ...branch,
                ...input,
                slug: nextSlug,
                sortOrder: nextSortOrder,
              }
            : branch,
        ),
      ),
    };
  },
};

export const deactivateBranch: ReducerContract<"deactivateBranch", DeactivateBranchInput> = {
  name: "deactivateBranch",
  description: "Deactivate a branch without deleting historical announcement targeting data.",
  apply: (state, input) => {
    assertBranchExists(state, input.branchId);

    return {
      ...state,
      branches: state.branches.map((branch) =>
        branch.branchId === input.branchId ? { ...branch, isActive: false } : branch,
      ),
    };
  },
};

export const upsertAnnouncement: ReducerContract<"upsertAnnouncement", UpsertAnnouncementInput> = {
  name: "upsertAnnouncement",
  description: "Create or update an announcement record with explicit operational state.",
  apply: (state, input) => {
    assertKnownStatusKind(input.statusKind);
    assertValidEffectiveWindow(input.startsAt, input.endsAt);

    const nextRecord: AnnouncementRecord = {
      announcementId: input.announcementId,
      title: input.title,
      message: input.message,
      statusKind: input.statusKind,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isPublished: input.isPublished,
      priority: input.priority,
    };

    const announcements = state.announcements.some(
      (announcement) => announcement.announcementId === input.announcementId,
    )
      ? state.announcements.map((announcement) =>
          announcement.announcementId === input.announcementId ? nextRecord : announcement,
        )
      : [...state.announcements, nextRecord];

    return {
      ...state,
      announcements: [...announcements].sort(
        (left, right) => right.priority - left.priority || left.title.localeCompare(right.title),
      ),
    };
  },
};

export const setAnnouncementBranchTargets: ReducerContract<
  "setAnnouncementBranchTargets",
  SetAnnouncementBranchTargetsInput
> = {
  name: "setAnnouncementBranchTargets",
  description: "Replace branch-target join rows for a given announcement.",
  apply: (state, input) => {
    assertAnnouncementExists(state, input.announcementId);

    const branchIds = dedupeBranchIds(input.branchIds);

    branchIds.forEach((branchId) => {
      assertBranchExists(state, branchId);
    });

    return {
      ...state,
      announcementBranchTargets: [
        ...state.announcementBranchTargets.filter(
          (target) => target.announcementId !== input.announcementId,
        ),
        ...branchIds.map((branchId) => ({
          announcementId: input.announcementId,
          branchId,
        })),
      ],
    };
  },
};

export const reducers = {
  createBranch,
  updateBranch,
  deactivateBranch,
  upsertAnnouncement,
  setAnnouncementBranchTargets,
};

export default reducers;
