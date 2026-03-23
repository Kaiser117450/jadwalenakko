---
phase: 01-spacetimedb-foundation-and-access-control
plan: 02
subsystem: database
tags: [spacetimedb, schema, reducers, read-model, astro]
requires:
  - phase: 01-01
    provides: "Root SpacetimeDB workspace, repo scripts, and documented binding workflow"
provides:
  - "Normalized branch, announcement, and announcement-target schema contracts"
  - "Reducer-owned write surface for branch lifecycle and announcement mutations"
  - "publicCurrentStatus projection that narrows public status reads to safe website fields"
affects: [01-03, 02-public-realtime-status-board, 03-branch-operations-management]
tech-stack:
  added: [SpacetimeDB schema module, reducer module, public read-model module]
  patterns:
    [
      Schema-first contract composition through spacetimedb/src/module.ts,
      Reducer-owned mutation validation over normalized records,
      Narrow public read-model projection derived from published announcements
    ]
key-files:
  created:
    [
      spacetimedb/src/schema.ts,
      spacetimedb/src/reducers.ts,
      spacetimedb/src/publicReadModel.ts
    ]
  modified: [spacetimedb/src/module.ts]
key-decisions:
  - "Keep module.ts as a thin composition entrypoint that re-exports schema, reducers, and public read models instead of embedding implementation details."
  - "Select the public status payload from published announcements with an explicit normal fallback so public consumers never infer state from missing rows."
patterns-established:
  - "Schema-first pattern: normalized table descriptors and record shapes live in schema.ts, while module.ts only wires exported surfaces."
  - "Public boundary pattern: publicCurrentStatus exposes banner/title/message, effective window, and branch visibility without leaking isPublished, priority, or reducer-only metadata."
requirements-completed: [DATA-01, DATA-02]
duration: 4 min
completed: 2026-03-23
---

# Phase 01 Plan 02: Normalized Operational Data Summary

**Normalized branch and announcement contracts with reducer-owned writes and a safe `publicCurrentStatus` projection for the realtime status board**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-23T13:17:45Z
- **Completed:** 2026-03-23T13:22:07Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Moved the Phase 1 source of truth for operational data into `spacetimedb/src/schema.ts` with normalized `branches`, `announcements`, and `announcementBranchTargets` contracts plus explicit `normal`, `limited`, `halfday`, and `closed` status values.
- Added stable reducer entrypoints for branch lifecycle and announcement mutation flows so later admin work can target reducer names instead of mutating raw tables.
- Added `spacetimedb/src/publicReadModel.ts` and wired `publicCurrentStatus` through the module entrypoint so the public site can subscribe to a narrow read contract in Phase 2.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define the normalized operational schema** - `6673069` (feat)
2. **Task 2: Implement reducer-owned write paths for branch and announcement data** - `6815a4e` (feat)
3. **Task 3: Establish the safe public read model contract** - `de22e49` (feat)

## Files Created/Modified

- `spacetimedb/src/schema.ts` - defines normalized records, explicit status kinds, table descriptors, and baseline seed state.
- `spacetimedb/src/reducers.ts` - centralizes validated mutation entrypoints for branches, announcements, and branch-target relationships.
- `spacetimedb/src/publicReadModel.ts` - projects a public-safe current status payload with branch visibility derived from published announcements.
- `spacetimedb/src/module.ts` - composes schema, reducers, and read models into the Phase 1 module contract.

## Decisions Made

- Kept `module.ts` as composition-only glue so later phases can evolve schema, reducers, and read models independently without reintroducing hard-coded data shape decisions in the entrypoint.
- Treated the public read surface as a derived projection from published announcement rows and targeted branches, not a direct export of internal table state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added reducer-side data validation for normalized writes**
- **Found during:** Task 2 (Implement reducer-owned write paths for branch and announcement data)
- **Issue:** The plan named reducer entrypoints but did not explicitly require the correctness checks needed to keep the normalized tables coherent.
- **Fix:** Added validation for duplicate branch slugs, finite branch sort order, valid announcement windows, supported `statusKind` values, and branch/announcement existence before replacing target rows.
- **Files modified:** `spacetimedb/src/reducers.ts`
- **Verification:** `rg -n "assertUniqueBranchSlug|assertSortOrder|assertValidEffectiveWindow|assertAnnouncementExists|assertBranchExists" spacetimedb/src/reducers.ts`
- **Committed in:** `6815a4e`

**2. [Rule 2 - Missing Critical] Added a safe normal fallback in the public read model**
- **Found during:** Task 3 (Establish the safe public read model contract)
- **Issue:** Without an explicit fallback, a public consumer would have to infer "normal" from missing active announcement rows, which conflicts with the phase requirement to model normal operation explicitly.
- **Fix:** The `publicCurrentStatus` selector now falls back to `seedNormalOperation` when no published announcement matches the current time.
- **Files modified:** `spacetimedb/src/publicReadModel.ts`
- **Verification:** `rg -n "seedNormalOperation|activeAnnouncements\\[0\\] \\?\\? seedNormalOperation" spacetimedb/src/publicReadModel.ts`
- **Committed in:** `de22e49`

**3. [Rule 1 - Bug] Corrected stale human-readable planning status after GSD tooling updates**
- **Found during:** Final planning-state updates
- **Issue:** `state update-progress` and `roadmap update-plan-progress` advanced machine-readable counters, but the visible velocity summary in `STATE.md` and the progress row in `ROADMAP.md` still showed `1/3`.
- **Fix:** Manually aligned the human-readable totals, recent trend, and roadmap progress row with the new `01-02` summary.
- **Files modified:** `.planning/STATE.md`, `.planning/ROADMAP.md`
- **Verification:** `Get-Content -Raw .planning/STATE.md` and `Get-Content -Raw .planning/ROADMAP.md`
- **Committed in:** final docs commit for this plan

---

**Total deviations:** 3 auto-fixed (2 missing critical, 1 bug)
**Impact on plan:** The reducer/read-model fixes protect correctness, and the planning-file fix keeps workflow state consistent with the completed plan.

## Issues Encountered

- `npm run build` succeeds, but the build still emits a pre-existing Vite CSS minification warning tied to generated styles from `src/pages/index.astro`. This plan did not modify that file, so the warning remains deferred.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan `01-03` can now add authorization checks and realistic seed/dev data on top of stable schema, reducer, and public-read boundaries.
- Phase 2 can consume `publicCurrentStatus` without subscribing directly to draft state, priority metadata, or raw branch-target joins.

## Self-Check: PASSED

- Confirmed `01-02-SUMMARY.md` exists at `.planning/phases/01-spacetimedb-foundation-and-access-control/01-02-SUMMARY.md`.
- Confirmed task commits exist in git history: `6673069`, `6815a4e`, and `de22e49`.

---
*Phase: 01-spacetimedb-foundation-and-access-control*
*Completed: 2026-03-23*
