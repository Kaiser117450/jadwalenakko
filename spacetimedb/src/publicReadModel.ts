import type { AnnouncementRecord, OperationalState, StatusKind } from "./schema.ts";
import { seedNormalOperation } from "./schema.ts";

export interface PublicBranchVisibility {
  branchId: string;
  slug: string;
  name: string;
  statusKind: StatusKind;
  isOpen: boolean;
  isTargeted: boolean;
}

export interface PublicCurrentStatusPayload {
  announcementId: string;
  statusKind: StatusKind;
  title: string;
  message: string;
  bannerText: string;
  startsAt: string | null;
  endsAt: string | null;
  isFallbackNormal: boolean;
  openBranchCount: number;
  closedBranchCount: number;
  branches: PublicBranchVisibility[];
}

export interface PublicReadModelContract<TName extends string, TResult> {
  name: TName;
  description: string;
  project: (state: OperationalState, now?: Date) => TResult;
}

function announcementAppliesNow(announcement: AnnouncementRecord, now: Date): boolean {
  if (!announcement.isPublished) {
    return false;
  }

  const nowMs = now.getTime();

  if (announcement.startsAt !== null && Date.parse(announcement.startsAt) > nowMs) {
    return false;
  }

  if (announcement.endsAt !== null && Date.parse(announcement.endsAt) < nowMs) {
    return false;
  }

  return true;
}

function selectAnnouncement(state: OperationalState, now: Date): AnnouncementRecord {
  const activeAnnouncements = state.announcements
    .filter((announcement) => announcementAppliesNow(announcement, now))
    .sort((left, right) => {
      const priorityDelta = right.priority - left.priority;

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const leftStartsAt = left.startsAt === null ? Number.NEGATIVE_INFINITY : Date.parse(left.startsAt);
      const rightStartsAt =
        right.startsAt === null ? Number.NEGATIVE_INFINITY : Date.parse(right.startsAt);

      return rightStartsAt - leftStartsAt;
    });

  return activeAnnouncements[0] ?? seedNormalOperation;
}

function resolveBranchStatusKind(
  announcement: AnnouncementRecord,
  isTargeted: boolean,
  hasTargets: boolean,
): StatusKind {
  if (announcement.statusKind === "normal") {
    return "normal";
  }

  if (announcement.statusKind === "closed") {
    return !hasTargets || isTargeted ? "closed" : "normal";
  }

  if (!hasTargets || isTargeted) {
    return announcement.statusKind;
  }

  return "closed";
}

function isFallbackNormalAnnouncement(announcement: AnnouncementRecord): boolean {
  return announcement.announcementId === seedNormalOperation.announcementId;
}

export const publicCurrentStatus: PublicReadModelContract<
  "publicCurrentStatus",
  PublicCurrentStatusPayload
> = {
  name: "publicCurrentStatus",
  description: "Public-safe current status projection without unpublished drafts or internal reducer metadata.",
  project: (state, now = new Date()) => {
    const announcement = selectAnnouncement(state, now);
    const isFallbackNormal = isFallbackNormalAnnouncement(announcement);
    const targetedBranchIds = new Set(
      state.announcementBranchTargets
        .filter((target) => target.announcementId === announcement.announcementId)
        .map((target) => target.branchId),
    );
    const hasTargets = targetedBranchIds.size > 0;
    const message = isFallbackNormal
      ? "Semua gerai buka normal sesuai jam operasional reguler."
      : announcement.message;
    const bannerText = isFallbackNormal ? message : `${announcement.title}: ${message}`;
    const branches = [...state.branches]
      .filter((branch) => branch.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
      .map((branch) => {
        const isTargeted = targetedBranchIds.has(branch.branchId);
        const statusKind = resolveBranchStatusKind(announcement, isTargeted, hasTargets);

        return {
          branchId: branch.branchId,
          slug: branch.slug,
          name: branch.name,
          statusKind,
          isOpen: statusKind !== "closed",
          isTargeted,
        };
      });
    const openBranchCount = branches.filter((branch) => branch.isOpen).length;
    const closedBranchCount = branches.length - openBranchCount;

    return {
      announcementId: announcement.announcementId,
      statusKind: announcement.statusKind,
      title: announcement.title,
      message,
      bannerText,
      startsAt: announcement.startsAt,
      endsAt: announcement.endsAt,
      isFallbackNormal,
      openBranchCount,
      closedBranchCount,
      branches,
    };
  },
};

export const publicReadModels = {
  publicCurrentStatus,
};

export default publicReadModels;
