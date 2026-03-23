import test from "node:test";
import assert from "node:assert/strict";

import { buildPublicStatusViewModel } from "../src/lib/public-status/view-model.ts";

function createBranch({
  branchId,
  name,
  statusKind = "normal",
  isOpen = true,
  isTargeted = false,
}) {
  return {
    branchId,
    slug: branchId,
    name,
    statusKind,
    isOpen,
    isTargeted,
  };
}

test("normal fallback payload maps to ready-normal", () => {
  const payload = {
    announcementId: "seed-normal-operation",
    statusKind: "normal",
    title: "Operasional Normal",
    message: "Semua gerai buka normal sesuai jam operasional reguler.",
    bannerText: "Semua gerai buka normal sesuai jam operasional reguler.",
    startsAt: null,
    endsAt: null,
    isFallbackNormal: true,
    openBranchCount: 2,
    closedBranchCount: 0,
    branches: [
      createBranch({ branchId: "panjer", name: "Panjer" }),
      createBranch({ branchId: "kreneng", name: "Kreneng" }),
    ],
  };

  const viewModel = buildPublicStatusViewModel(payload, "ready");

  assert.equal(viewModel.presentationState, "ready-normal");
  assert.equal(viewModel.headline, "Operasional Normal");
  assert.equal(viewModel.isNormalFallback, true);
  assert.deepEqual(
    viewModel.openBranches.map((branch) => branch.name),
    ["Panjer", "Kreneng"],
  );
  assert.equal(viewModel.closedBranches.length, 0);
});

test("targeted limited payload maps open and closed branch groups into ready-special", () => {
  const payload = {
    announcementId: "mudik-limited",
    statusKind: "limited",
    title: "Crew Mudik",
    message: "Sebagian gerai tetap buka.",
    bannerText: "Crew Mudik: sebagian gerai tetap buka.",
    startsAt: "2026-03-23T00:00:00+08:00",
    endsAt: "2026-03-24T00:00:00+08:00",
    isFallbackNormal: false,
    openBranchCount: 2,
    closedBranchCount: 1,
    branches: [
      createBranch({ branchId: "panjer", name: "Panjer", statusKind: "limited", isTargeted: true }),
      createBranch({ branchId: "kuta", name: "Kuta", statusKind: "limited", isTargeted: true }),
      createBranch({
        branchId: "mengwi",
        name: "Mengwi",
        statusKind: "closed",
        isOpen: false,
        isTargeted: false,
      }),
    ],
  };

  const viewModel = buildPublicStatusViewModel(payload, "ready");

  assert.equal(viewModel.presentationState, "ready-special");
  assert.equal(viewModel.statusTone, "limited");
  assert.deepEqual(
    viewModel.openBranches.map((branch) => branch.name),
    ["Panjer", "Kuta"],
  );
  assert.deepEqual(
    viewModel.closedBranches.map((branch) => branch.name),
    ["Mengwi"],
  );
});

test("unavailable state returns explicit unavailable presentation", () => {
  const viewModel = buildPublicStatusViewModel(null, "unavailable");

  assert.equal(viewModel.presentationState, "unavailable");
  assert.equal(viewModel.statusTone, "unavailable");
  assert.equal(viewModel.headline, "Status operasional belum tersedia.");
  assert.equal(viewModel.banner, "Status operasional belum tersedia.");
});
