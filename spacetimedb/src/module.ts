import {
  announcementBranchTargets,
  announcements,
  branches,
  operationalSchema,
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
import {
  phaseOneNormalBaseline,
  phaseOneSeedDescription,
  phaseOneSeedState,
  seedAnnouncementBranchTargets,
  seedBranches,
} from "./seeds";

export {
  announcementBranchTargets,
  announcements,
  branches,
  createBranch,
  deactivateBranch,
  operationalSchema,
  phaseOneNormalBaseline,
  phaseOneSeedDescription,
  phaseOneSeedState,
  publicCurrentStatus,
  publicReadModels,
  reducers,
  seedNormalOperation,
  seedAnnouncementBranchTargets,
  seedBranches,
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
  entrypoint: "spacetimedb/src/index.ts",
  schema: operationalSchema,
  readModels: publicReadModels,
  reducers,
  seedData: phaseOneSeedState,
  seeds: {
    source: "spacetimedb/src/seeds.ts",
    description: phaseOneSeedDescription,
    baseline: phaseOneNormalBaseline,
  },
};

export default moduleContract;
