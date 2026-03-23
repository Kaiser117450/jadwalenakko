export const statusKinds = ["normal", "limited", "halfday", "closed"] as const;

export type StatusKind = (typeof statusKinds)[number];

export interface TableContract<TName extends string, TPrimaryKey extends string> {
  tableName: TName;
  description: string;
  primaryKey: TPrimaryKey;
  fields: readonly string[];
}

export interface JoinTableContract<TName extends string, TKeys extends readonly string[]> {
  tableName: TName;
  description: string;
  keys: TKeys;
  fields: readonly string[];
}

export interface BranchRecord {
  branchId: string;
  slug: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AnnouncementRecord {
  announcementId: string;
  title: string;
  message: string;
  statusKind: StatusKind;
  startsAt: string | null;
  endsAt: string | null;
  isPublished: boolean;
  priority: number;
}

export interface AnnouncementBranchTargetRecord {
  announcementId: string;
  branchId: string;
}

export interface OperationalState {
  branches: BranchRecord[];
  announcements: AnnouncementRecord[];
  announcementBranchTargets: AnnouncementBranchTargetRecord[];
}

export const branches: TableContract<"branches", "branchId"> = {
  tableName: "branches",
  description: "Normalized branch master data for Enakko branch lifecycle records.",
  primaryKey: "branchId",
  fields: ["branchId", "slug", "name", "isActive", "sortOrder"],
};

export const announcements: TableContract<"announcements", "announcementId"> & {
  statusKinds: readonly StatusKind[];
} = {
  tableName: "announcements",
  description: "Operational announcements with explicit statusKind and effective windows.",
  primaryKey: "announcementId",
  fields: [
    "announcementId",
    "title",
    "message",
    "statusKind",
    "startsAt",
    "endsAt",
    "isPublished",
    "priority",
  ],
  statusKinds,
};

export const announcementBranchTargets: JoinTableContract<
  "announcementBranchTargets",
  ["announcementId", "branchId"]
> = {
  tableName: "announcementBranchTargets",
  description: "Join records mapping announcements to targeted branches without duplicated name arrays.",
  keys: ["announcementId", "branchId"],
  fields: ["announcementId", "branchId"],
};

export const seedNormalOperation: AnnouncementRecord = {
  announcementId: "seed-normal-operation",
  title: "Operasional Normal",
  message: "Default published baseline for days without special announcements.",
  statusKind: "normal",
  startsAt: null,
  endsAt: null,
  isPublished: true,
  priority: 0,
};

export const phaseOneSeedState: OperationalState = {
  branches: [],
  announcements: [seedNormalOperation],
  announcementBranchTargets: [],
};

export const operationalSchema = {
  branches,
  announcements,
  announcementBranchTargets,
  statusKinds,
};

export default operationalSchema;
