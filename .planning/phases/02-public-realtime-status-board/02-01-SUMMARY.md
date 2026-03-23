---
phase: 02-public-realtime-status-board
plan: 01
subsystem: database
tags: [spacetimedb, astro, realtime, bindings, public-status]
requires:
  - phase: 01-03
    provides: "Seeded branch baseline, explicit normal announcement, and the repo-facing module contract surface"
provides:
  - "Homepage-ready publicCurrentStatus payload with explicit normal fallback copy"
  - "Published TypeScript SpacetimeDB runtime entrypoint plus fresh-database seed path"
  - "App-owned public status subscription wrapper that hides generated binding internals"
affects: [02-02, 02-03, 03-branch-operations-management]
tech-stack:
  added: [SpacetimeDB TypeScript runtime entrypoint, Windows-safe CLI wrapper]
  patterns:
    [
      Runtime module entrypoint in spacetimedb/src/index.ts,
      App-owned wrapper over generated module bindings,
      Repo-level CLI wrapper that resolves the Windows SpacetimeDB install automatically
    ]
key-files:
  created: [scripts/spacetimedb-cli.mjs, spacetimedb/src/index.ts, spacetimedb/tsconfig.json, src/lib/spacetimedb/public-status-client.ts]
  modified: [package.json, scripts/generate-spacetimedb-bindings.mjs, spacetimedb/README.md, spacetimedb/package.json, spacetimedb/src/module.ts]
key-decisions:
  - "Keep spacetimedb/src/module.ts as the repo-facing contract surface, but move the publishable SpacetimeDB runtime into spacetimedb/src/index.ts so the current CLI can build and publish the module honestly."
  - "Resolve the SpacetimeDB CLI through repo-owned Node wrappers so Windows development does not depend on PATH configuration."
patterns-established:
  - "Public status client pattern: UI files import src/lib/spacetimedb/public-status-client.ts instead of generated bindings directly."
  - "Fresh database bootstrap pattern: publish the module, then seed the live database through seed_baseline before consuming publicCurrentStatus."
requirements-completed: [DATA-03, PUB-04]
duration: 58 min
completed: 2026-03-23
---

# Phase 02 Plan 01: Public Realtime Contract Summary

**Published a real `publicCurrentStatus` SpacetimeDB view with explicit normal fallback copy, seeded the fresh live database, and added one app-owned realtime client wrapper for later Astro integration**

## Performance

- **Duration:** 58 min
- **Started:** 2026-03-23T14:24:31Z
- **Completed:** 2026-03-23T15:22:22Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Finalized `spacetimedb/src/publicReadModel.ts` so the homepage contract now exposes `announcementId`, `isFallbackNormal`, branch visibility, and explicit normal-operation copy instead of seed/debug wording.
- Repaired the repo into a publishable TypeScript SpacetimeDB module with `spacetimedb/src/index.ts`, updated CLI wiring, and seeded the fresh database `c2005fe19a7ffd63d4d7f94d3971b38bce7c4ae5fd50810f3ab5831e42ba22ad` with 12 branches plus one published normal announcement.
- Added `src/lib/spacetimedb/public-status-client.ts` as the single app-owned realtime wrapper, so later UI work can subscribe to `publicCurrentStatus` without importing generated binding internals directly.

## Task Commits

Each task was committed atomically:

1. **Task 1: Finalize the public current-status payload for the homepage** - `fdd96e0` (feat)
2. **Task 2: Add one frontend-owned realtime wrapper around generated bindings** - `e92cc5a` (feat)

## Files Created/Modified

- `package.json` - updates the root SpacetimeDB scripts to use the live database identity and the repo-owned CLI wrapper.
- `scripts/generate-spacetimedb-bindings.mjs` - switches generation to the current CLI argument shape and auto-detects the Windows CLI install.
- `scripts/spacetimedb-cli.mjs` - resolves the CLI path and runs `spacetime` commands without relying on shell PATH setup.
- `spacetimedb/README.md` - documents the new runtime entrypoint and repo-level CLI wrapper behavior.
- `spacetimedb/package.json` - points the module workspace at the live database and the real runtime entrypoint.
- `spacetimedb/src/index.ts` - defines the actual publishable SpacetimeDB schema, anonymous view, and seed reducer.
- `spacetimedb/src/module.ts` - keeps the repo-facing contract aligned with the new runtime entrypoint.
- `spacetimedb/tsconfig.json` - provides the TypeScript build configuration expected by the current SpacetimeDB toolchain.
- `src/lib/spacetimedb/public-status-client.ts` - wraps connection, subscription, listener cleanup, and payload normalization for `publicCurrentStatus`.

## Decisions Made

- Kept `spacetimedb/src/module.ts` as the repo-facing contract surface for types, seeds, and read models, but moved the actual runtime module to `spacetimedb/src/index.ts` because the current SpacetimeDB CLI expects a real publishable module entrypoint.
- Hid direct generated-binding usage behind `src/lib/spacetimedb/public-status-client.ts` so the Astro page refactor in `02-02` can depend on one stable subscription surface.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt the outdated SpacetimeDB runtime wiring so the fresh database could be published and seeded**
- **Found during:** Task 2 (Add one frontend-owned realtime wrapper around generated bindings)
- **Issue:** The fresh database had no schema or data, and the repo still relied on older CLI/project assumptions that could not generate bindings or publish a live public view from the current SpacetimeDB toolchain.
- **Fix:** Added `spacetimedb/src/index.ts` and `spacetimedb/tsconfig.json`, updated module metadata and generator scripts to the current CLI shape, added `scripts/spacetimedb-cli.mjs`, published the live module, and seeded the database through `seed_baseline`.
- **Files modified:** `package.json`, `scripts/generate-spacetimedb-bindings.mjs`, `scripts/spacetimedb-cli.mjs`, `spacetimedb/README.md`, `spacetimedb/package.json`, `spacetimedb/src/index.ts`, `spacetimedb/src/module.ts`, `spacetimedb/tsconfig.json`
- **Verification:** `npm run spacetimedb:dev -- --help`, `npm run spacetimedb:publish -- --help`, `npm run spacetimedb:generate`, `npm run build`, and live database row-count checks after seeding
- **Committed in:** `e92cc5a`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The deviation was required for correctness. Without it, the wrapper work would have pointed at a contract that did not exist in the live database.

## Issues Encountered

- The live database started empty, so plan verification was only meaningful after publishing the module and running `seed_baseline`.
- `npm run spacetimedb:generate` still emits SpacetimeDB toolchain warnings about `tsc not found in node_modules` and `CONFIGURATION_FIELD_CONFLICT`, but generation succeeds and the app build passes.
- `npm run build` still emits the pre-existing Vite CSS minify warning about the unsupported `"file"` property while building `src/pages/index.astro`.

## User Setup Required

None - the live database is already published and seeded, and the repo scripts now resolve the local Windows SpacetimeDB CLI automatically.

## Next Phase Readiness

- `02-02` can now subscribe to `publicCurrentStatus` through `src/lib/spacetimedb/public-status-client.ts` and focus on mapping/rendering the live payload.
- The fresh database `c2005fe19a7ffd63d4d7f94d3971b38bce7c4ae5fd50810f3ab5831e42ba22ad` already contains the 12 seeded branches and the explicit normal fallback announcement, so the homepage refactor can work against live data immediately.

## Self-Check: PASSED

- Confirmed `02-01-SUMMARY.md` exists at `.planning/phases/02-public-realtime-status-board/02-01-SUMMARY.md`.
- Confirmed task commits exist in git history: `fdd96e0` and `e92cc5a`.
- Verified `npm run spacetimedb:generate` and `npm run build` both succeed after the final task commit.

---
*Phase: 02-public-realtime-status-board*
*Completed: 2026-03-23*
