---
phase: 02-public-realtime-status-board
plan: 02
subsystem: ui
tags: [astro, spacetimedb, realtime, public-status, view-model]
requires:
  - phase: 02-01
    provides: "Published publicCurrentStatus contract and the app-owned SpacetimeDB client wrapper"
provides:
  - "Prepared public-status view model for homepage rendering"
  - "Homepage subscription flow wired to live publicCurrentStatus data"
  - "Removal of static schedule-array and browser-date truth from the public route"
affects: [02-03, 03-branch-operations-management]
tech-stack:
  added: [src/lib/public-status/view-model.ts]
  patterns:
    [
      Prepared public-status view model between transport and Astro rendering,
      Data-attribute driven public status shell updates,
      Browser script subscribes to the app-owned public-status client instead of generated bindings directly
    ]
key-files:
  created: [src/lib/public-status/view-model.ts]
  modified: [src/pages/index.astro]
key-decisions:
  - "Keep the Astro page focused on rendering and DOM state transitions by moving branch grouping, tone mapping, and copy selection into src/lib/public-status/view-model.ts."
  - "Replace the dated schedule-card flow entirely instead of trying to patch live data into the old browser-date highlighting logic."
patterns-established:
  - "Public route pattern: index.astro renders dedicated live containers and subscribes through subscribePublicCurrentStatus."
  - "Presentation adapter pattern: buildPublicStatusViewModel prepares headline, banner, counts, and grouped branches before the page touches the payload."
requirements-completed: [DATA-03, PUB-01, PUB-04]
duration: 15 min
completed: 2026-03-23
---

# Phase 02 Plan 02: Live Homepage Migration Summary

**Replaced the static schedule timeline with a realtime public-status board driven by one prepared view model and the published SpacetimeDB read contract**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-23T23:25:00+08:00
- **Completed:** 2026-03-23T23:39:56+08:00
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `src/lib/public-status/view-model.ts` so the homepage consumes a prepared state object instead of re-deriving branch grouping, banner copy, and status tones inline.
- Rebuilt `src/pages/index.astro` around the live `publicCurrentStatus` contract, dedicated `data-public-*` containers, and the app-owned `subscribePublicCurrentStatus` wrapper.
- Removed the old `schedule` array, `schedule-data` serialization, and browser-local date-card highlighting logic from the public route.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the UI-ready public status view model** - `7f61065` (feat)
2. **Task 2: Replace the static schedule-driven homepage with live public status rendering** - `7f61065` (feat)

## Files Created/Modified

- `src/lib/public-status/view-model.ts` - prepares UI-ready headline, banner, tone, branch grouping, counts, and normal/unavailable state data from `publicCurrentStatus`.
- `src/pages/index.astro` - renders the live public status shell, open/closed branch panels, and the realtime subscription-driven DOM updates.

## Decisions Made

- Moved payload-to-UI rules into `src/lib/public-status/view-model.ts` so later phases can evolve presentation without turning `src/pages/index.astro` back into a second business-rules engine.
- Preserved the existing Enakko visual language while removing the old schedule-card architecture entirely, because patching live data into the dated-card flow would have kept the wrong source of truth alive.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Landed the public presentation-state foundation together with the live homepage refactor**
- **Found during:** Task 2 (Replace the static schedule-driven homepage with live public status rendering)
- **Issue:** The page needed explicit loading and unavailable state handling immediately to avoid flashing empty branch panels or treating the first null callback from the realtime client as a stable state.
- **Fix:** Added `presentationState` and unavailable/loading branches inside the view-model while wiring the live homepage, so the page could render deterministic states from the first subscription attempt.
- **Files modified:** `src/lib/public-status/view-model.ts`, `src/pages/index.astro`
- **Verification:** `npm run build` and the plan grep checks for `buildPublicStatusViewModel`, `data-public-status-banner`, `data-public-open-branches`, and absence of `schedule-data`
- **Committed in:** `7f61065`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The change kept the live page stable during connection startup and reduced follow-up churn for Plan 03.

## Issues Encountered

- `npm run build` still emits the pre-existing Vite CSS minify warning about the unsupported `"file"` property while building `src/pages/index.astro`, but the Astro build completes successfully.

## User Setup Required

None - the page now consumes the live status contract already published in the existing SpacetimeDB database.

## Next Phase Readiness

- `02-03` can build directly on the new view-model and live homepage shell to harden loading, normal, and unavailable states.
- The core brownfield migration is done: the homepage no longer depends on embedded schedule arrays or browser-local date matching for operational truth.

## Self-Check: PASSED

- Confirmed `02-02-SUMMARY.md` exists at `.planning/phases/02-public-realtime-status-board/02-02-SUMMARY.md`.
- Confirmed `7f61065` exists in git history.
- Verified `npm run build` and the plan grep checks pass after the live homepage refactor.

---
*Phase: 02-public-realtime-status-board*
*Completed: 2026-03-23*
