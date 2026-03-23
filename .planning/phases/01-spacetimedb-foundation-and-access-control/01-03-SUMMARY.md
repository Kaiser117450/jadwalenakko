---
phase: 01-spacetimedb-foundation-and-access-control
plan: 03
subsystem: auth
tags: [spacetimedb, auth, reducers, seeds, astro]
requires:
  - phase: 01-02
    provides: "Normalized schema, write reducers, and public read-model contracts"
provides:
  - "Centralized reducer-side admin claim validation"
  - "Seeded 12-branch Enakko baseline with an explicit published normal state"
  - "Documented authorized-versus-unauthorized reducer verification flow"
affects: [02-public-realtime-status-board, 03-branch-operations-management, 04-announcement-scheduling-and-status-rules]
tech-stack:
  added: [.env.example auth surface, reducer auth helper, seed data module]
  patterns:
    [
      Centralized reducer auth checks via assertAdminClaims,
      Dedicated seeds.ts baseline exported through module.ts,
      Documentation-first reducer verification for admin and non-admin claims
    ]
key-files:
  created: [.env.example, spacetimedb/src/auth.ts, spacetimedb/src/seeds.ts]
  modified: [spacetimedb/src/reducers.ts, spacetimedb/src/module.ts, spacetimedb/README.md]
key-decisions:
  - "Pass issuer, audience, and admin allowlist data into reducer execution context so auth stays provider-agnostic while still enforcing admin-only writes."
  - "Move realistic branch and normal-state seed fixtures into seeds.ts and expose them through module.ts as the Phase 1 baseline."
patterns-established:
  - "Reducer guard pattern: every mutating reducer runs through createAdminReducer before touching state."
  - "Seed baseline pattern: moduleContract.seeds documents the source and meaning of the local Phase 1 dataset."
requirements-completed: [DATA-02, ADMN-01]
duration: 6 min
completed: 2026-03-23
---

# Phase 01 Plan 03: Admin Access And Seed Baseline Summary

**Reducer-side admin claim enforcement with issuer/audience validation, a seeded 12-branch Enakko baseline, and a documented authorized-versus-unauthorized verification flow**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-23T13:27:00Z
- **Completed:** 2026-03-23T13:33:22Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added `.env.example` and `spacetimedb/src/auth.ts` so reducer writes now validate issuer, audience, and admin authorization through one `assertAdminClaims` helper.
- Seeded the current 12 Enakko branches and an explicit published `normal` baseline in `spacetimedb/src/seeds.ts`, then exposed that seed contract from `spacetimedb/src/module.ts`.
- Extended `spacetimedb/README.md` with the local auth config and explicit unauthorized/authorized checks for `createBranch`, `updateBranch`, `deactivateBranch`, `upsertAnnouncement`, and `setAnnouncementBranchTargets`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Centralize the reducer auth guard and its config surface** - `a0deb8f` (feat)
2. **Task 2: Seed the current Enakko branch roster and explicit normal baseline** - `b23efee` (feat)
3. **Task 3: Document the authorized-versus-unauthorized verification flow** - `69be54d` (docs)

## Files Created/Modified

- `.env.example` - declares the reducer auth issuer, audience, and admin email allowlist placeholders.
- `spacetimedb/src/auth.ts` - centralizes reducer-side issuer, audience, and admin authorization checks.
- `spacetimedb/src/reducers.ts` - routes all mutating reducers through the shared admin-claim guard.
- `spacetimedb/src/seeds.ts` - provides the 12-branch Enakko seed roster and explicit normal baseline.
- `spacetimedb/src/module.ts` - re-exports the Phase 1 seed baseline and documents it in `moduleContract.seeds`.
- `spacetimedb/README.md` - documents local auth setup and reducer verification for unauthorized and authorized writes.

## Decisions Made

- Kept reducer auth provider-agnostic by requiring issuer, audience, and admin allowlist data through the reducer execution context rather than hard-coding a single identity provider integration in reducer bodies.
- Promoted the seed roster into a dedicated `seeds.ts` module so later phases can reuse a stable local baseline without reopening schema definitions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Preserved the existing `seedNormalOperation` module export while moving the seed source**
- **Found during:** Task 2 (Seed the current Enakko branch roster and explicit normal baseline)
- **Issue:** Wiring `module.ts` to `spacetimedb/src/seeds.ts` initially dropped the existing `seedNormalOperation` export, which would have been an avoidable module-surface regression for later phase work.
- **Fix:** Restored the `seedNormalOperation` re-export while keeping `phaseOneSeedState` and the new `seeds` metadata sourced from `spacetimedb/src/seeds.ts`.
- **Files modified:** `spacetimedb/src/module.ts`
- **Verification:** `Get-Content -Raw spacetimedb/src/module.ts`
- **Committed in:** `b23efee`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix prevented a regression in the module contract without widening scope.

## Issues Encountered

- `npm run build` succeeds, but Astro/Vite still emits the pre-existing CSS minify warning about an unsupported `"file"` property while building `src/pages/index.astro`. This plan did not touch that page, so the warning remains deferred.

## User Setup Required

None - no external service configuration required beyond copying `.env.example` when local reducer verification is needed.

## Next Phase Readiness

- Phase 1 is complete: reducer writes now have an admin-only guard, and local development has realistic branch/status seed data.
- Phase 2 can consume the seeded/public contract without relying on blank state assumptions, and Phase 3 can build admin flows on top of the documented reducer guard behavior.

## Self-Check: PASSED

- Confirmed `01-03-SUMMARY.md` exists at `.planning/phases/01-spacetimedb-foundation-and-access-control/01-03-SUMMARY.md`.
- Confirmed task commits exist in git history: `a0deb8f`, `b23efee`, and `69be54d`.
- No stub markers (`TODO`, `FIXME`, `placeholder`, `coming soon`, `not available`) were found in the files touched by this plan.

---
*Phase: 01-spacetimedb-foundation-and-access-control*
*Completed: 2026-03-23*
