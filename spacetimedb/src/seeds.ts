import type { AnnouncementBranchTargetRecord, BranchRecord, OperationalState } from "./schema";
import { seedNormalOperation } from "./schema";

export const seedBranches: BranchRecord[] = [
  { branchId: "panjer", slug: "panjer", name: "Panjer", isActive: true, sortOrder: 1 },
  {
    branchId: "ahmad-yani",
    slug: "ahmad-yani",
    name: "Ahmad Yani",
    isActive: true,
    sortOrder: 2,
  },
  {
    branchId: "monang-maning",
    slug: "monang-maning",
    name: "Monang Maning",
    isActive: true,
    sortOrder: 3,
  },
  {
    branchId: "tukad-pakerisan",
    slug: "tukad-pakerisan",
    name: "Tukad Pakerisan",
    isActive: true,
    sortOrder: 4,
  },
  { branchId: "dalung-1", slug: "dalung-1", name: "Dalung 1", isActive: true, sortOrder: 5 },
  {
    branchId: "pulau-kawe",
    slug: "pulau-kawe",
    name: "Pulau Kawe",
    isActive: true,
    sortOrder: 6,
  },
  { branchId: "kuta", slug: "kuta", name: "Kuta", isActive: true, sortOrder: 7 },
  {
    branchId: "tangkuban-perahu",
    slug: "tangkuban-perahu",
    name: "Tangkuban Perahu",
    isActive: true,
    sortOrder: 8,
  },
  { branchId: "pemogan", slug: "pemogan", name: "Pemogan", isActive: true, sortOrder: 9 },
  { branchId: "mengwi", slug: "mengwi", name: "Mengwi", isActive: true, sortOrder: 10 },
  {
    branchId: "dalung-2",
    slug: "dalung-2",
    name: "Dalung 2",
    isActive: true,
    sortOrder: 11,
  },
  { branchId: "kreneng", slug: "kreneng", name: "Kreneng", isActive: true, sortOrder: 12 },
];

export const seedAnnouncementBranchTargets: AnnouncementBranchTargetRecord[] = [];

export const phaseOneNormalBaseline = {
  announcementId: seedNormalOperation.announcementId,
  statusKind: seedNormalOperation.statusKind,
  isPublished: seedNormalOperation.isPublished,
  closedBranchIds: [] as string[],
};

export const phaseOneSeedDescription =
  "Phase 1 local baseline with the current 12 Enakko branches and one published normal-operating status.";

export const phaseOneSeedState: OperationalState = {
  branches: seedBranches,
  announcements: [seedNormalOperation],
  announcementBranchTargets: seedAnnouncementBranchTargets,
};

export default phaseOneSeedState;
