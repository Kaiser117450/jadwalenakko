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

export {
  announcementBranchTargets,
  announcements,
  branches,
  createBranch,
  deactivateBranch,
  operationalSchema,
  phaseOneSeedState,
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

export const moduleContract = {
  moduleRoot: "spacetimedb",
  entrypoint: "spacetimedb/src/module.ts",
  schema: operationalSchema,
  reducers,
  seedData: phaseOneSeedState,
};

export default moduleContract;
