import {
  announcementBranchTargets,
  announcements,
  branches,
  operationalSchema,
  phaseOneSeedState,
  seedNormalOperation,
  statusKinds,
} from "./schema";
import {
  createBranch,
  deactivateBranch,
  reducers,
  setAnnouncementBranchTargets,
  updateBranch,
  upsertAnnouncement,
} from "./reducers";
import { publicCurrentStatus, publicReadModels } from "./publicReadModel";

export {
  announcementBranchTargets,
  announcements,
  branches,
  createBranch,
  deactivateBranch,
  operationalSchema,
  phaseOneSeedState,
  publicCurrentStatus,
  publicReadModels,
  reducers,
  seedNormalOperation,
  setAnnouncementBranchTargets,
  statusKinds,
  updateBranch,
  upsertAnnouncement,
};

export type {
  AnnouncementBranchTargetRecord,
  AnnouncementRecord,
  BranchRecord,
  JoinTableContract,
  OperationalState,
  StatusKind,
  TableContract,
} from "./schema";
export type {
  CreateBranchInput,
  DeactivateBranchInput,
  ReducerContract,
  SetAnnouncementBranchTargetsInput,
  UpdateBranchInput,
  UpsertAnnouncementInput,
} from "./reducers";
export type {
  PublicBranchVisibility,
  PublicCurrentStatusPayload,
  PublicReadModelContract,
} from "./publicReadModel";

export const moduleContract = {
  moduleRoot: "spacetimedb",
  entrypoint: "spacetimedb/src/module.ts",
  schema: operationalSchema,
  readModels: publicReadModels,
  reducers,
  seedData: phaseOneSeedState,
};

export default moduleContract;
