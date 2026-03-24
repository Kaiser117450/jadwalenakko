import test from "node:test";
import assert from "node:assert/strict";

import {
  branchFormDefaults,
  normalizeBranchInput,
  toActivationPatch,
} from "../src/lib/admin/branch-form.ts";

test("normalizeBranchInput trims and preserves the exact branch payload fields", () => {
  const normalized = normalizeBranchInput({
    branchId: " panjer ",
    slug: " panjer-barat ",
    name: " Panjer Barat ",
    sortOrder: "7",
    isActive: false,
  });

  assert.deepEqual(normalized, {
    branchId: "panjer",
    slug: "panjer-barat",
    name: "Panjer Barat",
    sortOrder: 7,
    isActive: false,
  });
  assert.deepEqual(Object.keys(normalized), [
    "branchId",
    "slug",
    "name",
    "sortOrder",
    "isActive",
  ]);
});

test("normalizeBranchInput falls back to branchFormDefaults for blank numeric input", () => {
  const normalized = normalizeBranchInput({
    branchId: "kreneng",
    slug: "kreneng",
    name: "Kreneng",
    sortOrder: "",
    isActive: null,
  });

  assert.equal(normalized.sortOrder, branchFormDefaults.sortOrder);
  assert.equal(normalized.isActive, branchFormDefaults.isActive);
});

test("activate existing branch with updateBranch", () => {
  assert.deepEqual(toActivationPatch("panjer"), {
    branchId: "panjer",
    isActive: true,
  });
});
