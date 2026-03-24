import { statusKinds, type StatusKind } from "../../../spacetimedb/src/schema.ts";

type LiveStatusTargetMode = "all" | "selected";

type LiveStatusFormInput = {
  announcementId?: string | null;
  title?: string | null;
  message?: string | null;
  statusKind?: StatusKind | null;
  targetMode?: LiveStatusTargetMode | null;
  selectedBranchIds?: string[] | string | null;
};

const LIVE_STATUS_ANNOUNCEMENT_ID = "admin-live-status";

export const liveStatusFormDefaults = {
  announcementId: LIVE_STATUS_ANNOUNCEMENT_ID,
  title: "",
  message: "",
  statusKind: "limited" as StatusKind,
  targetMode: "all" as LiveStatusTargetMode,
  selectedBranchIds: [] as string[],
};

function normalizeStatusKind(statusKind?: StatusKind | null): StatusKind {
  return statusKinds.includes(statusKind as StatusKind)
    ? (statusKind as StatusKind)
    : liveStatusFormDefaults.statusKind;
}

function normalizeTargetMode(targetMode?: LiveStatusTargetMode | null): LiveStatusTargetMode {
  return targetMode === "selected" ? "selected" : "all";
}

function normalizeSelectedBranchIds(
  selectedBranchIds: LiveStatusFormInput["selectedBranchIds"],
): string[] {
  const rawBranchIds = Array.isArray(selectedBranchIds)
    ? selectedBranchIds
    : typeof selectedBranchIds === "string"
      ? selectedBranchIds.split(",")
      : [];

  return [...new Set(rawBranchIds.map((branchId) => String(branchId).trim()).filter(Boolean))];
}

export function normalizeLiveStatusInput(input: LiveStatusFormInput = {}) {
  return {
    announcementId: LIVE_STATUS_ANNOUNCEMENT_ID,
    title: String(input.title ?? liveStatusFormDefaults.title).trim(),
    message: String(input.message ?? liveStatusFormDefaults.message).trim(),
    statusKind: normalizeStatusKind(input.statusKind),
    targetMode: normalizeTargetMode(input.targetMode),
    selectedBranchIds: normalizeSelectedBranchIds(input.selectedBranchIds),
  };
}

export function resolveTargetBranchIds(input: LiveStatusFormInput = {}) {
  const normalizedInput = normalizeLiveStatusInput(input);
  return normalizedInput.targetMode === "selected" ? normalizedInput.selectedBranchIds : [];
}
