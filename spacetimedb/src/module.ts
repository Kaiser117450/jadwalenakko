export type StatusKind = "normal" | "limited" | "halfday" | "closed";

export interface BranchContract {
  tableName: "branches";
  description: string;
  primaryKey: "branchId";
}

export interface AnnouncementContract {
  tableName: "announcements";
  description: string;
  primaryKey: "announcementId";
  statusKinds: StatusKind[];
}

export interface AnnouncementBranchTargetContract {
  tableName: "announcementBranchTargets";
  description: string;
  keys: ["announcementId", "branchId"];
}

export interface NormalOperationSeed {
  announcementId: string;
  statusKind: "normal";
  title: string;
  message: string;
  isPublished: true;
  targetScope: "all-branches";
}

export const branches: BranchContract = {
  tableName: "branches",
  description: "Normalized branch master data will live here in Phase 1.",
  primaryKey: "branchId",
};

export const announcements: AnnouncementContract = {
  tableName: "announcements",
  description: "Operational status records and effective windows will be stored here.",
  primaryKey: "announcementId",
  statusKinds: ["normal", "limited", "halfday", "closed"],
};

export const announcementBranchTargets: AnnouncementBranchTargetContract = {
  tableName: "announcementBranchTargets",
  description: "Join records will connect announcements to targeted branches.",
  keys: ["announcementId", "branchId"],
};

export const seedNormalOperation: NormalOperationSeed = {
  announcementId: "seed-normal-operation",
  statusKind: "normal",
  title: "Operasional Normal",
  message: "Default published baseline for days without special announcements.",
  isPublished: true,
  targetScope: "all-branches",
};

export const moduleContract = {
  moduleRoot: "spacetimedb",
  entrypoint: "spacetimedb/src/module.ts",
  branches,
  announcements,
  announcementBranchTargets,
  seedNormalOperation,
};

export default moduleContract;
