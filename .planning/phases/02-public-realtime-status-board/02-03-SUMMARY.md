---
phase: 02-public-realtime-status-board
plan: 03
subsystem: testing
tags: [astro, realtime, public-status, node-test, ux]
requires:
  - phase: 02-02
    provides: "Live homepage wiring and the public-status view-model adapter"
provides:
  - "Deterministic loading, ready-normal, ready-special, and unavailable presentation states"
  - "Explicit normal and unavailable copy in the public route"
  - "Repeatable node:test coverage for the contract-to-UI mapping rules"
affects: [05-readability-and-launch-hardening]
tech-stack:
  added: [Node built-in test coverage for public status mapping]
  patterns:
    [
      Presentation-state driven public rendering,
      Lightweight node:test verification for pure view-model logic,
      Environment-aware fallback to test isolation none when the sandbox blocks child-process spawning
    ]
key-files:
  created: [tests/public-status-view-model.test.mjs]
  modified: [src/lib/public-status/view-model.ts, src/pages/index.astro]
key-decisions:
  - "Keep the public-state rules inside the existing view-model instead of scattering separate loading and unavailable branches across the page script."
  - "Use Node's built-in test runner for the public-status adapter instead of introducing a heavier frontend test framework mid-migration."
patterns-established:
  - "Presentation-state contract: loading, ready-normal, ready-special, unavailable."
  - "View-model test pattern: assert pure payload-to-UI mapping in node:test before relying on full-browser verification."
requirements-completed: [PUB-01, PUB-03, PUB-04]
duration: 7 min
completed: 2026-03-23
---

# Phase 02 Plan 03: Public State Hardening Summary

**Added deterministic presentation states for the live public board and lightweight node:test coverage for normal, limited, and unavailable mapping behavior**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-23T23:33:00+08:00
- **Completed:** 2026-03-23T23:40:09+08:00
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Finalized the public view-model around `loading`, `ready-normal`, `ready-special`, and `unavailable` so the live page never falls back to ambiguous empty-state behavior.
- Ensured `src/pages/index.astro` contains explicit public-facing loading, normal, and unavailable copy while routing the branch panels through `presentationState`.
- Added `tests/public-status-view-model.test.mjs` to verify the normal fallback, targeted limited grouping, and unavailable-state branches with `node:test`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Finalize deterministic presentation states in the public status view model** - `7f61065` (feat)
2. **Task 2: Render explicit loading, normal, and unavailable states in the homepage** - `7f61065` (feat)
3. **Task 3: Add lightweight automated coverage for public status mapping rules** - `57895de` (test)

## Files Created/Modified

- `src/lib/public-status/view-model.ts` - defines the explicit presentation-state contract and the copy/tone rules used by the page and tests.
- `src/pages/index.astro` - renders the presentation states explicitly and keeps the main status region `aria-live="polite"`.
- `tests/public-status-view-model.test.mjs` - covers normal fallback, targeted limited grouping, and unavailable-state handling with Node's built-in test runner.

## Decisions Made

- Kept the state hardening in the same view-model introduced by Plan 02 so both rendering and tests read one deterministic contract.
- Used `node:test` because the view-model is pure enough to verify without introducing a heavier frontend test harness during the brownfield migration.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used Node test isolation `none` for automated verification in this sandbox**
- **Found during:** Task 3 (Add lightweight automated coverage for public status mapping rules)
- **Issue:** The exact command `node --test tests/public-status-view-model.test.mjs` fails in this environment with `spawn EPERM` before the test file runs, because the default Node test-runner isolation tries to spawn a child process that the sandbox forbids.
- **Fix:** Verified the same test file with `node --test --test-isolation=none tests/public-status-view-model.test.mjs`, which runs in-process and passes all assertions without changing the test logic itself.
- **Files modified:** None
- **Verification:** `node --test --test-isolation=none tests/public-status-view-model.test.mjs`
- **Committed in:** None - environment-only workaround

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The code and test file are correct, but the exact default `node --test` invocation remains sandbox-sensitive on this machine.

## Issues Encountered

- The direct `node --test tests/public-status-view-model.test.mjs` command still fails in this sandbox with `spawn EPERM`; the in-process `--test-isolation=none` fallback passes and was used for plan verification.
- `npm run build` continues to emit the pre-existing Vite CSS minify warning about the unsupported `"file"` property while building the Astro page.

## User Setup Required

None - no external setup is needed beyond the existing repo dependencies and the published SpacetimeDB database.

## Next Phase Readiness

- Phase 2 now has deterministic presentation-state rules and lightweight repeatable coverage, so later readability/polish work can focus on UX rather than rebuilding state logic.
- Phase 3 can build admin-facing flows on top of a live public board that already renders branch visibility from the published contract.

## Self-Check: PASSED

- Confirmed `02-03-SUMMARY.md` exists at `.planning/phases/02-public-realtime-status-board/02-03-SUMMARY.md`.
- Confirmed `7f61065` and `57895de` exist in git history.
- Verified `node --test --test-isolation=none tests/public-status-view-model.test.mjs` and `npm run build` pass after the final test commit.

---
*Phase: 02-public-realtime-status-board*
*Completed: 2026-03-23*
