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
  openBranches: PublicBranchVisibility[];
  closedBranches: PublicBranchVisibility[];
  openBranchCount: number;
  closedBranchCount: number;
  isNormalFallback: boolean;
}

const STATUS_LABELS: Record<StatusKind, string> = {
  normal: "Operasional Normal",
  limited: "Operasional Terbatas",
  halfday: "Buka Setengah Hari",
  closed: "Tutup Total",
};

function splitBranches(branches: PublicBranchVisibility[]) {
  return {
    openBranches: branches.filter((branch) => branch.isOpen),
    closedBranches: branches.filter((branch) => !branch.isOpen),
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
      openBranches: [],
      closedBranches: [],
      openBranchCount: 0,
      closedBranchCount: 0,
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
      openBranches: [],
      closedBranches: [],
      openBranchCount: 0,
      closedBranchCount: 0,
      isNormalFallback: false,
    };
  }

  const { openBranches, closedBranches } = splitBranches(payload.branches);
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
    openBranches,
    closedBranches,
    openBranchCount: payload.openBranchCount,
    closedBranchCount: payload.closedBranchCount,
    isNormalFallback,
  };
}
