# SpacetimeDB Module Workspace

This directory is the agreed TypeScript SpacetimeDB module root for Phase 1. The canonical runtime entrypoint for the workspace is `spacetimedb/src/index.ts`, while `spacetimedb/src/module.ts` remains the repo-facing contract surface for types, seeds, and read-model exports. Generated browser bindings are written to `src/lib/spacetimedb/module_bindings`.

## Prerequisites

- Node.js 18 or newer for the Astro workspace and helper scripts
- A `spacetime` CLI install available on `PATH` or the default Windows install at `%LOCALAPPDATA%\SpacetimeDB\spacetime.exe`

## Repo Script Contract

Run these commands from the repository root:

- `npm run spacetimedb:dev`
- `npm run spacetimedb:publish`
- `npm run spacetimedb:generate`

`npm run spacetimedb:dev` and `npm run spacetimedb:publish` resolve the SpacetimeDB CLI through `scripts/spacetimedb-cli.mjs`, so Windows installs under `%LOCALAPPDATA%\SpacetimeDB\spacetime.exe` work even when `spacetime` is not on `PATH`.

`npm run spacetimedb:generate` uses `scripts/generate-spacetimedb-bindings.mjs` and writes generated output into `src/lib/spacetimedb/module_bindings`. Treat that directory as generated code and do not hand-edit it.

## Local Workflow

1. Install root dependencies with `npm install`.
2. Iterate on the TypeScript module rooted at `spacetimedb/` with `npm run spacetimedb:dev`.
3. Publish the live module contract with `npm run spacetimedb:publish`.
4. Regenerate browser bindings with `npm run spacetimedb:generate`.

The phase baseline stays in TypeScript so the Astro app and the module workflow share one toolchain and one repeatable command surface.

## Local Auth Config

Copy the repository root `.env.example` to `.env` before validating reducer writes. The reducer auth helper reads its config from the same values you provide to your local claim/test harness:

- `SPACETIMEDB_AUTH_ISSUER` - expected OIDC issuer for reducer claims
- `SPACETIMEDB_AUTH_AUDIENCE` - audience that every write claim must include
- `ENAKKO_ADMIN_EMAILS` - comma-separated admin allowlist used by `assertAdminClaims`

## Local Seed Baseline

`spacetimedb/src/seeds.ts` is the Phase 1 baseline. It exports the current 12 Enakko branches and one explicit published normal announcement, so local development starts from a real `statusKind: "normal"` state instead of an empty database.

## Auth Direction

Phase 1 will validate admin writes through reducer-side claim checks, not frontend-only guards. Start with a SpacetimeAuth-compatible issuer and audience flow so reducers can stay provider-agnostic while still enforcing admin-only mutations.

If SpacetimeAuth beta behavior blocks local development or rollout, keep the reducer claim contract and switch to another OIDC-compatible issuer before changing reducer call sites.

## Reducer Access Verification

Use the seeded state from `spacetimedb/src/seeds.ts` and the guarded reducers in `spacetimedb/src/reducers.ts` to validate both unauthorized and authorized writes before Phase 2 or Phase 3 work starts.

### 1. Build a shared auth config from `.env`

```ts
const authConfig = {
  issuer: process.env.SPACETIMEDB_AUTH_ISSUER ?? "",
  audience: process.env.SPACETIMEDB_AUTH_AUDIENCE ?? "",
  adminEmails: (process.env.ENAKKO_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
};
```

### 2. Verify an unauthorized write is rejected

```ts
import { createBranch, phaseOneSeedState } from "./src/module";

const unauthorizedContext = {
  config: authConfig,
  claims: {
    issuer: authConfig.issuer,
    audience: authConfig.audience,
    email: "viewer@example.com",
    roles: [],
  },
};

createBranch.apply(
  phaseOneSeedState,
  {
    branchId: "unauthorized-branch",
    slug: "unauthorized-branch",
    name: "Unauthorized Branch",
    sortOrder: 99,
  },
  unauthorizedContext,
);
```

Expected result:

- `createBranch` throws before state changes because the email is not in `ENAKKO_ADMIN_EMAILS`
- The same unauthorized behavior must hold for `updateBranch`, `deactivateBranch`, `upsertAnnouncement`, and `setAnnouncementBranchTargets`
- Any issuer mismatch or missing `SPACETIMEDB_AUTH_AUDIENCE` match must also fail before a reducer returns a new state

### 3. Verify an authorized admin write succeeds

```ts
import {
  createBranch,
  deactivateBranch,
  phaseOneSeedState,
  setAnnouncementBranchTargets,
  updateBranch,
  upsertAnnouncement,
} from "./src/module";

const adminEmail = authConfig.adminEmails[0];
const authorizedContext = {
  config: authConfig,
  claims: {
    issuer: authConfig.issuer,
    audience: [authConfig.audience],
    email: adminEmail,
    roles: ["admin"],
  },
};

const withCreatedBranch = createBranch.apply(
  phaseOneSeedState,
  {
    branchId: "test-admin-branch",
    slug: "test-admin-branch",
    name: "Test Admin Branch",
    sortOrder: 20,
  },
  authorizedContext,
);

const withUpdatedBranch = updateBranch.apply(
  withCreatedBranch,
  {
    branchId: "test-admin-branch",
    name: "Test Admin Branch Updated",
  },
  authorizedContext,
);

const withDeactivatedBranch = deactivateBranch.apply(
  withUpdatedBranch,
  { branchId: "test-admin-branch" },
  authorizedContext,
);

const withAnnouncement = upsertAnnouncement.apply(
  withDeactivatedBranch,
  {
    announcementId: "authorized-check",
    title: "Authorized reducer check",
    message: "Admin-only reducer flow is working.",
    statusKind: "limited",
    startsAt: null,
    endsAt: null,
    isPublished: true,
    priority: 5,
  },
  authorizedContext,
);

const finalState = setAnnouncementBranchTargets.apply(
  withAnnouncement,
  {
    announcementId: "authorized-check",
    branchIds: ["panjer", "kreneng"],
  },
  authorizedContext,
);
```

Expected result:

- `createBranch`, `updateBranch`, and `deactivateBranch` all return a new state without auth errors
- `upsertAnnouncement` stores the explicit published announcement
- `setAnnouncementBranchTargets` writes the branch target join rows for `panjer` and `kreneng`
- Comparing `phaseOneSeedState` with `finalState` should show only the authorized mutations above

## Fallback Rule

Stay on the TypeScript scaffold unless the local TypeScript scaffold, publish, or binding-generation flow is blocked in a way that cannot be cleared inside the current delivery plan. Only then should the module implementation switch to Rust, and that fallback should preserve the same module root, reducer boundaries, and binding target at `src/lib/spacetimedb/module_bindings`.
