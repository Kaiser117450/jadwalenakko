import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeLiveStatusInput,
  resolveTargetBranchIds,
} from "../src/lib/admin/live-status-form.ts";
import { buildPublicStatusViewModel } from "../src/lib/public-status/view-model.ts";
import { publicCurrentStatus } from "../spacetimedb/src/publicReadModel.ts";

function createBranchRecord({
  branchId,
  name,
  slug = branchId,
  isActive = true,
  sortOrder = 0,
}) {
  return {
    branchId,
    slug,
    name,
    isActive,
    sortOrder,
  };
}

function createLiveAnnouncement(statusKind) {
  return {
    announcementId: "admin-live-status",
    title: "Status Operasional Live",
    message: "Pembaruan dari admin.",
    statusKind,
    startsAt: "2026-03-24T00:00:00+08:00",
    endsAt: "2026-03-24T23:59:59+08:00",
    isPublished: true,
    priority: 10,
  };
}

function createOperationalState({ statusKind, targetedBranchIds }) {
  return {
    branches: [
      createBranchRecord({ branchId: "panjer", name: "Panjer", sortOrder: 1 }),
      createBranchRecord({ branchId: "kuta", name: "Kuta", sortOrder: 2 }),
      createBranchRecord({ branchId: "renon", name: "Renon", sortOrder: 3 }),
    ],
    announcements: [createLiveAnnouncement(statusKind)],
    announcementBranchTargets: targetedBranchIds.map((branchId) => ({
      announcementId: "admin-live-status",
      branchId,
    })),
  };
}

function indexBranchesById(branches) {
  return Object.fromEntries(branches.map((branch) => [branch.branchId, branch]));
}

test("selected target mode maps limited branches explicitly", () => {
  const input = normalizeLiveStatusInput({
    title: " Crew Mudik ",
    message: " Sebagian gerai tetap buka. ",
    statusKind: "limited",
    targetMode: "selected",
    selectedBranchIds: [" panjer ", "kuta", "panjer"],
  });

  assert.equal(input.announcementId, "admin-live-status");
  assert.deepEqual(resolveTargetBranchIds(input), ["panjer", "kuta"]);
});

test("all target mode clears branch ids for global status", () => {
  const input = normalizeLiveStatusInput({
    title: "Normal Lagi",
    message: "Semua gerai kembali normal.",
    statusKind: "normal",
    targetMode: "all",
    selectedBranchIds: ["panjer", "kuta"],
  });

  assert.deepEqual(resolveTargetBranchIds(input), []);
});

test("selected closed announcement only closes targeted branches in publicCurrentStatus projector", () => {
  const payload = publicCurrentStatus.project(
    createOperationalState({
      statusKind: "closed",
      targetedBranchIds: ["panjer", "kuta"],
    }),
    new Date("2026-03-24T09:00:00+08:00"),
  );
  const branchesById = indexBranchesById(payload.branches);
  const viewModel = buildPublicStatusViewModel(payload, "ready");

  assert.equal(payload.announcementId, "admin-live-status");
  assert.equal(branchesById.panjer.statusKind, "closed");
  assert.equal(branchesById.panjer.isOpen, false);
  assert.equal(branchesById.kuta.statusKind, "closed");
  assert.equal(branchesById.kuta.isOpen, false);
  assert.equal(branchesById.renon.statusKind, "normal");
  assert.equal(branchesById.renon.isOpen, true);

  assert.deepEqual(
    viewModel.normalBranches.map((branch) => branch.name),
    ["Renon"],
  );
  assert.deepEqual(
    viewModel.limitedBranches.map((branch) => branch.name),
    [],
  );
  assert.deepEqual(
    viewModel.closedBranches.map((branch) => branch.name),
    ["Panjer", "Kuta"],
  );
});

test("selected limited announcement keeps targeted branches limited and untargeted branches closed in publicCurrentStatus projector", () => {
  const payload = publicCurrentStatus.project(
    createOperationalState({
      statusKind: "limited",
      targetedBranchIds: ["panjer", "kuta"],
    }),
    new Date("2026-03-24T09:00:00+08:00"),
  );
  const branchesById = indexBranchesById(payload.branches);
  const viewModel = buildPublicStatusViewModel(payload, "ready");

  assert.equal(payload.announcementId, "admin-live-status");
  assert.equal(branchesById.panjer.statusKind, "limited");
  assert.equal(branchesById.panjer.isOpen, true);
  assert.equal(branchesById.kuta.statusKind, "limited");
  assert.equal(branchesById.kuta.isOpen, true);
  assert.equal(branchesById.renon.statusKind, "closed");
  assert.equal(branchesById.renon.isOpen, false);

  assert.deepEqual(
    viewModel.normalBranches.map((branch) => branch.name),
    [],
  );
  assert.deepEqual(
    viewModel.limitedBranches.map((branch) => branch.name),
    ["Panjer", "Kuta"],
  );
  assert.deepEqual(
    viewModel.closedBranches.map((branch) => branch.name),
    ["Renon"],
  );
});
