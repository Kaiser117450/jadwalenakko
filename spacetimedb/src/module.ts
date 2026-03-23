import {
  announcementBranchTargets,
  announcements,
  branches,
  operationalSchema,
  phaseOneSeedState,
  seedNormalOperation,
  statusKinds,
} from "./schema";

export {
  announcementBranchTargets,
  announcements,
  branches,
  operationalSchema,
  phaseOneSeedState,
  seedNormalOperation,
  statusKinds,
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

export const moduleContract = {
  moduleRoot: "spacetimedb",
  entrypoint: "spacetimedb/src/module.ts",
  schema: operationalSchema,
  seedData: phaseOneSeedState,
};

export default moduleContract;
