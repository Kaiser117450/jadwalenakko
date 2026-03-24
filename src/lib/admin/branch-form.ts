export interface BranchFormInput {
  branchId?: string | null;
  slug?: string | null;
  name?: string | null;
  sortOrder?: number | string | null;
  isActive?: boolean | null;
}

export const branchFormDefaults = {
  branchId: "",
  slug: "",
  name: "",
  sortOrder: 0,
  isActive: true,
};

export function normalizeBranchInput(input: BranchFormInput = {}) {
  const sortOrderValue =
    typeof input.sortOrder === "number"
      ? input.sortOrder
      : Number.parseInt(String(input.sortOrder ?? branchFormDefaults.sortOrder), 10);

  return {
    branchId: String(input.branchId ?? branchFormDefaults.branchId).trim(),
    slug: String(input.slug ?? branchFormDefaults.slug).trim(),
    name: String(input.name ?? branchFormDefaults.name).trim(),
    sortOrder: Number.isFinite(sortOrderValue) ? sortOrderValue : branchFormDefaults.sortOrder,
    isActive: input.isActive ?? branchFormDefaults.isActive,
  };
}

export function toActivationPatch(branchId: string) {
  return { branchId, isActive: true };
}
