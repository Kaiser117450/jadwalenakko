import type { AnnouncementRecord, OperationalState, StatusKind } from "./schema";
import { seedNormalOperation } from "./schema";

export interface PublicBranchVisibility {
  branchId: string;
  slug: string;
  name: string;
  statusKind: StatusKind;
  isOpen: boolean;
  isTargeted: boolean;
}

export interface PublicCurrentStatusPayload {
  statusKind: StatusKind;
  title: string;
  message: string;
  bannerText: string;
  startsAt: string | null;
  endsAt: string | null;
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
  if (announcement.statusKind === "normal" || announcement.statusKind === "closed") {
    return announcement.statusKind;
  }

  if (!hasTargets || isTargeted) {
    return announcement.statusKind;
  }

  return "closed";
}

export const publicCurrentStatus: PublicReadModelContract<
  "publicCurrentStatus",
  PublicCurrentStatusPayload
> = {
  name: "publicCurrentStatus",
  description: "Public-safe current status projection without unpublished drafts or internal reducer metadata.",
  project: (state, now = new Date()) => {
    const announcement = selectAnnouncement(state, now);
    const targetedBranchIds = new Set(
      state.announcementBranchTargets
        .filter((target) => target.announcementId === announcement.announcementId)
        .map((target) => target.branchId),
    );
    const hasTargets = targetedBranchIds.size > 0;

    return {
      statusKind: announcement.statusKind,
      title: announcement.title,
      message: announcement.message,
      bannerText: `${announcement.title}: ${announcement.message}`,
      startsAt: announcement.startsAt,
      endsAt: announcement.endsAt,
      branches: [...state.branches]
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
        }),
    };
  },
};

export const publicReadModels = {
  publicCurrentStatus,
};

export default publicReadModels;
