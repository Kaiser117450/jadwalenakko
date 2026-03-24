---
phase: 03-branch-operations-management
plan: 03
subsystem: api
tags: [spacetimedb, projector, targeting, node-test, astro]
requires:
  - phase: 03-branch-operations-management
    provides: quick live-status targeting flow, public branch grouping, and initial targeting regression coverage from 03-02
provides:
  - Target-aware selected closed branch projection in publicCurrentStatus
  - Live projector regression coverage for selected closed and selected limited announcements
  - Node-test-executable projector coverage for branch-targeting rules
affects: [04-announcement-scheduling-and-status-rules, public-ui, tests]
tech-stack:
  added: []
  patterns:
    - publicCurrentStatus remains the targeting source of truth for visitor branch states
    - projector-first node:test fixtures protect public status regressions end-to-end
key-files:
  created: []
  modified:
    - spacetimedb/src/publicReadModel.ts
    - tests/branch-targeting.test.mjs
key-decisions:
  - "Keep selected closed targeting rules in publicCurrentStatus instead of recreating them in Astro or the public view model."
  - "Execute publicCurrentStatus.project(...) directly in node:test so targeting regressions fail on the live projection path."
patterns-established:
  - "Targeting regressions should build OperationalState fixtures, assert projector branch states, and then assert buildPublicStatusViewModel buckets."
requirements-completed: [ADMN-04, PUB-02]
duration: 3min
completed: 2026-03-24
---

# Phase 3 Plan 03: Targeted Closed Projector Gap Closure Summary

**Target-aware closed-branch projection in publicCurrentStatus with live node:test regression coverage for selected branch announcements**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T18:30:29+08:00
- **Completed:** 2026-03-24T18:32:57+08:00
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Corrected `publicCurrentStatus` so selected-target `closed` announcements only close targeted active branches.
- Preserved the existing targeted `limited` and `halfday` semantics while leaving untargeted active branches normal for selected `closed` announcements.
- Replaced the synthetic targeting regression with live projector fixtures that assert both projector output and visitor-facing branch buckets.

## Task Commits

Each task was committed atomically:

1. **Task 1: Repair selected-target closed semantics in the live public projector** - `bda8406` (fix)
2. **Task 2: Replace the synthetic targeting regression with live projector coverage** - `28b19fb` (test)

## Files Created/Modified

- `spacetimedb/src/publicReadModel.ts` - applies target-aware `closed` resolution and uses a Node-runnable `schema.ts` runtime import for live projector execution in tests.
- `tests/branch-targeting.test.mjs` - builds real `OperationalState` fixtures, executes `publicCurrentStatus.project(...)`, and asserts the resulting public view-model buckets.

## Decisions Made

- Kept the selected-target `closed` rule in `publicCurrentStatus` so the homepage and `buildPublicStatusViewModel` continue consuming a single prepared source of truth.
- Upgraded the regression suite to execute the live projector path instead of validating only synthetic payloads, because the verified gap existed above the view-model layer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Made the live projector import path executable under node:test**
- **Found during:** Task 2 (Replace the synthetic targeting regression with live projector coverage)
- **Issue:** Importing `publicCurrentStatus` into the test suite failed because `spacetimedb/src/publicReadModel.ts` still referenced `./schema` without the explicit `.ts` extension required by the Node ESM test path.
- **Fix:** Updated `publicReadModel.ts` to import `./schema.ts`, then reran the live projector tests and build.
- **Files modified:** `spacetimedb/src/publicReadModel.ts`
- **Verification:** `node --test --test-isolation=none tests/branch-targeting.test.mjs tests/public-status-view-model.test.mjs`, `npm run build`
- **Committed in:** `28b19fb`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to execute the exact live projector regression path the plan asked for. No feature scope changed.

## Issues Encountered

- `npm run build` still emits the pre-existing Vite CSS minify warning about `[file:lines]`; the plan completed successfully and did not introduce a new build failure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The verified Phase 03 gap is closed: selected-target `closed` announcements now preserve untargeted active branches as normal and open in the live public read model.
- `ADMN-04` and `PUB-02` now have real projector-level regression coverage, so Phase 4 can build announcement scheduling on top of a corrected branch-targeting baseline.

## Self-Check: PASSED

- Found `.planning/phases/03-branch-operations-management/03-03-SUMMARY.md`, `spacetimedb/src/publicReadModel.ts`, and `tests/branch-targeting.test.mjs` on disk.
- Verified task commits `bda8406` and `28b19fb` in git history.
