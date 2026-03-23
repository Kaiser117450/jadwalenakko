import { schema, table, t } from "spacetimedb/server";

import { publicCurrentStatus as publicCurrentStatusProjector } from "./publicReadModel";
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

export default spacetimedb;
