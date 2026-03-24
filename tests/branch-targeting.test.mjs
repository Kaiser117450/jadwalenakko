import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeLiveStatusInput,
  resolveTargetBranchIds,
} from "../src/lib/admin/live-status-form.ts";
import { buildPublicStatusViewModel } from "../src/lib/public-status/view-model.ts";

function createBranch({
  branchId,
  name,
  statusKind = "normal",
  isOpen = statusKind !== "closed",
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

test("publicCurrentStatus payload groups targeted limited branches into explicit visitor buckets", () => {
  const payload = {
    announcementId: "mudik-limited",
    statusKind: "limited",
    title: "Crew Mudik",
    message: "Sebagian gerai tetap buka.",
    bannerText: "Crew Mudik: sebagian gerai tetap buka.",
    startsAt: "2026-03-24T00:00:00+08:00",
    endsAt: "2026-03-24T23:59:59+08:00",
    isFallbackNormal: false,
    openBranchCount: 3,
    closedBranchCount: 1,
    branches: [
      createBranch({ branchId: "panjer", name: "Panjer", statusKind: "normal" }),
      createBranch({ branchId: "kuta", name: "Kuta", statusKind: "limited", isTargeted: true }),
      createBranch({ branchId: "renon", name: "Renon", statusKind: "halfday", isTargeted: true }),
      createBranch({ branchId: "mengwi", name: "Mengwi", statusKind: "closed", isTargeted: false }),
    ],
  };

  const viewModel = buildPublicStatusViewModel(payload, "ready");

  assert.deepEqual(
    viewModel.normalBranches.map((branch) => branch.name),
    ["Panjer"],
  );
  assert.deepEqual(
    viewModel.limitedBranches.map((branch) => branch.name),
    ["Kuta", "Renon"],
  );
  assert.deepEqual(
    viewModel.closedBranches.map((branch) => branch.name),
    ["Mengwi"],
  );
  assert.equal(
    viewModel.normalBranches.some((branch) => branch.name === "Kuta" || branch.name === "Mengwi"),
    false,
  );
});
