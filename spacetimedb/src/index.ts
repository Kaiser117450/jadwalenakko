import { schema, table, t } from "spacetimedb/server";

import { authEnvContract, type ReducerAuthContext, type ReducerClaims } from "./auth";
import { publicCurrentStatus as publicCurrentStatusProjector } from "./publicReadModel";
import {
  createBranch as createBranchReducer,
  deactivateBranch as deactivateBranchReducer,
  type ReducerContract,
  setAnnouncementBranchTargets as setAnnouncementBranchTargetsReducer,
  updateBranch as updateBranchReducer,
  upsertAnnouncement as upsertAnnouncementReducer,
} from "./reducers";
import { type OperationalState, seedNormalOperation, type StatusKind } from "./schema";
import { seedBranches } from "./seeds";

const statusKindType = t.enum("StatusKind", {
  normal: t.unit(),
  limited: t.unit(),
  halfday: t.unit(),
  closed: t.unit(),
});

const branchRow = t.row("BranchRow", {
  branchId: t.string().primaryKey(),
  slug: t.string().unique(),
  name: t.string(),
  isActive: t.bool(),
  sortOrder: t.u32().index("btree"),
});

const announcementRow = t.row("AnnouncementRow", {
  announcementId: t.string().primaryKey(),
  title: t.string(),
  message: t.string(),
  statusKind: statusKindType,
  startsAt: t.option(t.string()),
  endsAt: t.option(t.string()),
  isPublished: t.bool(),
  priority: t.i32().index("btree"),
});

const announcementBranchTargetRow = t.row("AnnouncementBranchTargetRow", {
  targetId: t.string().primaryKey(),
  announcementId: t.string().index("btree"),
  branchId: t.string().index("btree"),
});

const publicBranchVisibilityRow = t.row("PublicBranchVisibilityRow", {
  branchId: t.string(),
  slug: t.string(),
  name: t.string(),
  statusKind: statusKindType,
  isOpen: t.bool(),
  isTargeted: t.bool(),
});

const publicCurrentStatusRow = t.row("PublicCurrentStatusRow", {
  announcementId: t.string(),
  statusKind: statusKindType,
  title: t.string(),
  message: t.string(),
  bannerText: t.string(),
  startsAt: t.option(t.string()),
  endsAt: t.option(t.string()),
  isFallbackNormal: t.bool(),
  openBranchCount: t.u32(),
  closedBranchCount: t.u32(),
  branches: t.array(publicBranchVisibilityRow),
});

const createBranchParams = {
  branchId: t.string(),
  slug: t.string(),
  name: t.string(),
  isActive: t.option(t.bool()),
  sortOrder: t.u32(),
};

const updateBranchParams = {
  branchId: t.string(),
  slug: t.option(t.string()),
  name: t.option(t.string()),
  isActive: t.option(t.bool()),
  sortOrder: t.option(t.u32()),
};

const deactivateBranchParams = {
  branchId: t.string(),
};

const upsertAnnouncementParams = {
  announcementId: t.string(),
  title: t.string(),
  message: t.string(),
  statusKind: statusKindType,
  startsAt: t.option(t.string()),
  endsAt: t.option(t.string()),
  isPublished: t.bool(),
  priority: t.i32(),
};

const setAnnouncementBranchTargetsParams = {
  announcementId: t.string(),
  branchIds: t.array(t.string()),
};

const branches = table({ name: "branches" }, branchRow);
const announcements = table({ name: "announcements" }, announcementRow);
const announcementBranchTargets = table(
  { name: "announcementBranchTargets" },
  announcementBranchTargetRow,
);

const spacetimedb = schema({
  branches,
  announcements,
  announcementBranchTargets,
});

type RuntimeStatusKind = { tag: "normal" | "limited" | "halfday" | "closed" };

function toRuntimeStatusKind(statusKind: StatusKind): RuntimeStatusKind {
  switch (statusKind) {
    case "normal":
      return statusKindType.normal;
    case "limited":
      return statusKindType.limited;
    case "halfday":
      return statusKindType.halfday;
    case "closed":
      return statusKindType.closed;
  }
}

function toDomainStatusKind(statusKind: RuntimeStatusKind): StatusKind {
  return statusKind.tag;
}

function applyPhaseOneSeed(ctx: {
  db: {
    branches: { count(): bigint; insert(row: (typeof seedBranches)[number]): unknown };
    announcements: {
      count(): bigint;
      insert(row: {
        announcementId: string;
        title: string;
        message: string;
        statusKind: RuntimeStatusKind;
        startsAt?: string;
        endsAt?: string;
        isPublished: boolean;
        priority: number;
      }): unknown;
    };
  };
}): void {
  if (ctx.db.branches.count() === 0n) {
    seedBranches.forEach((branch) => {
      ctx.db.branches.insert(branch);
    });
  }

  if (ctx.db.announcements.count() === 0n) {
    ctx.db.announcements.insert({
      ...seedNormalOperation,
      statusKind: toRuntimeStatusKind(seedNormalOperation.statusKind),
      startsAt: seedNormalOperation.startsAt ?? undefined,
      endsAt: seedNormalOperation.endsAt ?? undefined,
    });
  }
}

function buildOperationalState(ctx: {
  db: {
    branches: { iter(): Iterable<OperationalState["branches"][number]> };
    announcements: {
      iter(): Iterable<
        Omit<OperationalState["announcements"][number], "statusKind"> & {
          statusKind: RuntimeStatusKind;
        }
      >;
    };
    announcementBranchTargets: {
      iter(): Iterable<{ targetId: string; announcementId: string; branchId: string }>;
    };
  };
}): OperationalState {
  return {
    branches: Array.from(ctx.db.branches.iter()),
    announcements: Array.from(ctx.db.announcements.iter()).map((announcement) => ({
      ...announcement,
      statusKind: toDomainStatusKind(announcement.statusKind),
      startsAt: announcement.startsAt ?? null,
      endsAt: announcement.endsAt ?? null,
    })),
    announcementBranchTargets: Array.from(ctx.db.announcementBranchTargets.iter()).map(
      ({ announcementId, branchId }) => ({
        announcementId,
        branchId,
      }),
    ),
  };
}

function readStringClaim(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readBooleanClaim(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readStringArrayClaim(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function buildReducerAuthConfig(): ReducerAuthContext["config"] {
  return {
    issuer: process.env[authEnvContract.issuer] ?? "",
    audience: process.env[authEnvContract.audience] ?? "",
    adminEmails: (process.env[authEnvContract.adminEmails] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

function buildReducerClaims(ctx: {
  senderAuth: {
    jwt:
      | {
          issuer: string;
          subject: string;
          audience: readonly string[];
          fullPayload: Record<string, unknown>;
        }
      | null;
  };
}): ReducerClaims | null {
  const jwt = ctx.senderAuth.jwt;

  if (!jwt) {
    return null;
  }

  const payload = jwt.fullPayload;

  return {
    issuer: jwt.issuer,
    audience: jwt.audience,
    email: readStringClaim(payload.email),
    subject: jwt.subject,
    roles: readStringArrayClaim(payload.roles),
    isAdmin: readBooleanClaim(payload.isAdmin),
  };
}

function replaceOperationalState(ctx: {
  db: {
    branches: {
      iter(): Iterable<OperationalState["branches"][number]>;
      insert(row: OperationalState["branches"][number]): unknown;
      delete(row: OperationalState["branches"][number]): boolean;
    };
    announcements: {
      iter(): Iterable<
        Omit<OperationalState["announcements"][number], "statusKind"> & {
          statusKind: RuntimeStatusKind;
        }
      >;
      insert(row: {
        announcementId: string;
        title: string;
        message: string;
        statusKind: RuntimeStatusKind;
        startsAt?: string;
        endsAt?: string;
        isPublished: boolean;
        priority: number;
      }): unknown;
      delete(row: {
        announcementId: string;
        title: string;
        message: string;
        statusKind: RuntimeStatusKind;
        startsAt?: string;
        endsAt?: string;
        isPublished: boolean;
        priority: number;
      }): boolean;
    };
    announcementBranchTargets: {
      iter(): Iterable<{ targetId: string; announcementId: string; branchId: string }>;
      insert(row: { targetId: string; announcementId: string; branchId: string }): unknown;
      delete(row: { targetId: string; announcementId: string; branchId: string }): boolean;
    };
  };
}, nextState: OperationalState): void {
  Array.from(ctx.db.announcementBranchTargets.iter()).forEach((row) => {
    ctx.db.announcementBranchTargets.delete(row);
  });
  Array.from(ctx.db.announcements.iter()).forEach((row) => {
    ctx.db.announcements.delete(row);
  });
  Array.from(ctx.db.branches.iter()).forEach((row) => {
    ctx.db.branches.delete(row);
  });

  nextState.branches.forEach((branch) => {
    ctx.db.branches.insert(branch);
  });
  nextState.announcements.forEach((announcement) => {
    ctx.db.announcements.insert({
      ...announcement,
      statusKind: toRuntimeStatusKind(announcement.statusKind),
      startsAt: announcement.startsAt ?? undefined,
      endsAt: announcement.endsAt ?? undefined,
    });
  });
  nextState.announcementBranchTargets.forEach((target) => {
    ctx.db.announcementBranchTargets.insert({
      targetId: `${target.announcementId}:${target.branchId}`,
      announcementId: target.announcementId,
      branchId: target.branchId,
    });
  });
}

function applyAdminReducer<TInput>(
  ctx: {
    db: {
      branches: {
        iter(): Iterable<OperationalState["branches"][number]>;
        insert(row: OperationalState["branches"][number]): unknown;
        delete(row: OperationalState["branches"][number]): boolean;
      };
      announcements: {
        count(): bigint;
        iter(): Iterable<
          Omit<OperationalState["announcements"][number], "statusKind"> & {
            statusKind: RuntimeStatusKind;
          }
        >;
        insert(row: {
          announcementId: string;
          title: string;
          message: string;
          statusKind: RuntimeStatusKind;
          startsAt?: string;
          endsAt?: string;
          isPublished: boolean;
          priority: number;
        }): unknown;
        delete(row: {
          announcementId: string;
          title: string;
          message: string;
          statusKind: RuntimeStatusKind;
          startsAt?: string;
          endsAt?: string;
          isPublished: boolean;
          priority: number;
        }): boolean;
      };
      announcementBranchTargets: {
        iter(): Iterable<{ targetId: string; announcementId: string; branchId: string }>;
        insert(row: { targetId: string; announcementId: string; branchId: string }): unknown;
        delete(row: { targetId: string; announcementId: string; branchId: string }): boolean;
      };
    };
    senderAuth: {
      jwt:
        | {
            issuer: string;
            subject: string;
            audience: readonly string[];
            fullPayload: Record<string, unknown>;
          }
        | null;
    };
  },
  reducer: ReducerContract<string, TInput>,
  input: TInput,
): void {
  const nextState = reducer.apply(buildOperationalState(ctx), input, {
    config: buildReducerAuthConfig(),
    claims: buildReducerClaims(ctx),
  });

  replaceOperationalState(ctx, nextState);
}

spacetimedb.init((ctx) => {
  applyPhaseOneSeed(ctx);
});

export const seedBaseline = spacetimedb.reducer((ctx) => {
  applyPhaseOneSeed(ctx);
});

export const publicCurrentStatus = spacetimedb.anonymousView(
  { name: "publicCurrentStatus", public: true },
  t.option(publicCurrentStatusRow),
  (ctx) => {
    const payload = publicCurrentStatusProjector.project(buildOperationalState(ctx));

    return {
      ...payload,
      statusKind: toRuntimeStatusKind(payload.statusKind),
      startsAt: payload.startsAt ?? undefined,
      endsAt: payload.endsAt ?? undefined,
      branches: payload.branches.map((branch) => ({
        ...branch,
        statusKind: toRuntimeStatusKind(branch.statusKind),
      })),
    };
  },
);

export const adminBranchDirectory = spacetimedb.anonymousView(
  { name: "adminBranchDirectory", public: true },
  t.array(branchRow),
  (ctx) => {
    return Array.from(ctx.db.branches.iter()).sort(
      (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
    );
  },
);

export const createBranch = spacetimedb.reducer(
  { name: "createBranch" },
  createBranchParams,
  (ctx, input) => {
    applyAdminReducer(ctx, createBranchReducer, {
      branchId: input.branchId,
      slug: input.slug,
      name: input.name,
      isActive: input.isActive ?? undefined,
      sortOrder: input.sortOrder,
    });
  },
);

export const updateBranch = spacetimedb.reducer(
  { name: "updateBranch" },
  updateBranchParams,
  (ctx, input) => {
    applyAdminReducer(ctx, updateBranchReducer, {
      branchId: input.branchId,
      slug: input.slug ?? undefined,
      name: input.name ?? undefined,
      isActive: input.isActive ?? undefined,
      sortOrder: input.sortOrder ?? undefined,
    });
  },
);

export const deactivateBranch = spacetimedb.reducer(
  { name: "deactivateBranch" },
  deactivateBranchParams,
  (ctx, input) => {
    applyAdminReducer(ctx, deactivateBranchReducer, input);
  },
);

export const upsertAnnouncement = spacetimedb.reducer(
  { name: "upsertAnnouncement" },
  upsertAnnouncementParams,
  (ctx, input) => {
    applyAdminReducer(ctx, upsertAnnouncementReducer, {
      announcementId: input.announcementId,
      title: input.title,
      message: input.message,
      statusKind: toDomainStatusKind(input.statusKind),
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      isPublished: input.isPublished,
      priority: input.priority,
    });
  },
);

export const setAnnouncementBranchTargets = spacetimedb.reducer(
  { name: "setAnnouncementBranchTargets" },
  setAnnouncementBranchTargetsParams,
  (ctx, input) => {
    applyAdminReducer(ctx, setAnnouncementBranchTargetsReducer, input);
  },
);

export default spacetimedb;
