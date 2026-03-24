import type {
  PublicBranchVisibility,
  PublicCurrentStatusPayload,
  StatusKind,
} from "../../../spacetimedb/src/publicReadModel";

export type PublicStatusTone = StatusKind | "unavailable";
export type PublicStatusPresentationState =
  | "loading"
  | "ready-normal"
  | "ready-special"
  | "unavailable";
export type PublicStatusConnectionState = "loading" | "ready" | "unavailable";

export interface PublicStatusViewModel {
  headline: string;
  banner: string;
  statusLabel: string;
  statusTone: PublicStatusTone;
  presentationState: PublicStatusPresentationState;
  normalBranches: PublicBranchVisibility[];
  limitedBranches: PublicBranchVisibility[];
  closedBranches: PublicBranchVisibility[];
  normalBranchCount: number;
  limitedBranchCount: number;
  closedBranchCount: number;
  openBranches: PublicBranchVisibility[];
  openBranchCount: number;
  isNormalFallback: boolean;
}

const STATUS_LABELS: Record<StatusKind, string> = {
  normal: "Operasional Normal",
  limited: "Operasional Terbatas",
  halfday: "Buka Setengah Hari",
  closed: "Tutup Total",
};

function groupBranches(branches: PublicBranchVisibility[]) {
  const normalBranches = branches.filter((branch) => branch.statusKind === "normal");
  const limitedBranches = branches.filter(
    (branch) => branch.statusKind === "limited" || branch.statusKind === "halfday",
  );
  const closedBranches = branches.filter((branch) => branch.statusKind === "closed");
  const openBranches = branches.filter((branch) => branch.statusKind !== "closed");

  return {
    normalBranches,
    limitedBranches,
    closedBranches,
    openBranches,
  };
}

export function getStatusTone(
  statusKind?: StatusKind | null,
  connectionState: PublicStatusConnectionState = "ready",
): PublicStatusTone {
  if (connectionState !== "ready" || !statusKind) {
    return "unavailable";
  }

  return statusKind;
}

export function buildPublicStatusViewModel(
  payload: PublicCurrentStatusPayload | null,
  connectionState: PublicStatusConnectionState = payload ? "ready" : "loading",
): PublicStatusViewModel {
  if (connectionState === "loading") {
    return {
      headline: "Memuat status operasional...",
      banner: "Memuat status operasional...",
      statusLabel: "Menghubungkan data live",
      statusTone: "unavailable",
      presentationState: "loading",
      normalBranches: [],
      limitedBranches: [],
      closedBranches: [],
      normalBranchCount: 0,
      limitedBranchCount: 0,
      closedBranchCount: 0,
      openBranches: [],
      openBranchCount: 0,
      isNormalFallback: false,
    };
  }

  if (connectionState === "unavailable" || !payload) {
    return {
      headline: "Status operasional belum tersedia.",
      banner: "Status operasional belum tersedia.",
      statusLabel: "Koneksi tidak tersedia",
      statusTone: "unavailable",
      presentationState: "unavailable",
      normalBranches: [],
      limitedBranches: [],
      closedBranches: [],
      normalBranchCount: 0,
      limitedBranchCount: 0,
      closedBranchCount: 0,
      openBranches: [],
      openBranchCount: 0,
      isNormalFallback: false,
    };
  }

  const { normalBranches, limitedBranches, closedBranches, openBranches } = groupBranches(payload.branches);
  const isNormalFallback = payload.isFallbackNormal || payload.statusKind === "normal";
  const presentationState: PublicStatusPresentationState = isNormalFallback
    ? "ready-normal"
    : "ready-special";
  const statusTone = getStatusTone(payload.statusKind, connectionState);
  const headline = isNormalFallback ? "Operasional Normal" : payload.title;

  return {
    headline,
    banner: payload.bannerText,
    statusLabel: STATUS_LABELS[payload.statusKind],
    statusTone,
    presentationState,
    normalBranches,
    limitedBranches,
    closedBranches,
    normalBranchCount: normalBranches.length,
    limitedBranchCount: limitedBranches.length,
    closedBranchCount: closedBranches.length,
    openBranches,
    openBranchCount: openBranches.length,
    isNormalFallback,
  };
}
