---
phase: 03-branch-operations-management
plan: 02
subsystem: ui
tags: [astro, spacetimedb, admin, realtime, testing]
requires:
  - phase: 03-branch-operations-management
    provides: branch lifecycle admin route, token-aware SpacetimeDB admin wrapper, and live public status wiring from 03-01
provides:
  - Quick admin flow for one fixed live operational change targeting all branches or a selected subset
  - Explicit public view-model groups for normal, limited or halfday, and closed branches
  - Homepage rendering that shows separate visitor-facing summaries and branch lists for each branch state
  - Repeatable node:test coverage for branch-target resolution and visitor-facing grouping rules
affects: [04-announcement-scheduling-and-status-rules, admin-ui, public-ui, tests]
tech-stack:
  added: []
  patterns:
    - fixed-id live-status upsert flow for Phase 3 quick operational changes
    - explicit public branch grouping prepared in the view model instead of browser-side targeting logic
    - node:test targeting coverage run with --test-isolation=none in this environment
key-files:
  created:
    - src/lib/admin/live-status-form.ts
    - tests/branch-targeting.test.mjs
  modified:
    - src/lib/spacetimedb/admin-branch-client.ts
    - src/pages/admin/index.astro
    - src/lib/public-status/view-model.ts
    - src/pages/index.astro
key-decisions:
  - "Use one fixed announcement ID, admin-live-status, for Phase 3 quick updates so admin can ship a single immediate change without opening full CRUD or scheduling yet."
  - "Keep visitor rendering driven by the prepared public view model and add explicit normal, limited, and closed group fields there instead of teaching index.astro new targeting rules."
  - "Preserve the existing open and closed compatibility fields in the view model so prior Phase 2 tests remain green while the homepage moves to the richer branch-state presentation."
patterns-established:
  - "Admin quick operational changes should normalize form data in a pure helper module before calling app-owned SpacetimeDB wrappers."
  - "Visitor-facing branch-state groupings belong in src/lib/public-status/view-model.ts and are safe to regression-test with lightweight node:test coverage."
requirements-completed: [ADMN-04, PUB-02]
duration: 9min
completed: 2026-03-24
---

# Phase 3 Plan 02: Targeted Live Status And Public Branch Grouping Summary

**Fixed-ID admin live status targeting with explicit normal, limited, and closed visitor branch groups**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-24T17:04:00+08:00
- **Completed:** 2026-03-24T17:13:14+08:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added a quick `/admin` live-status flow that upserts one immediate `admin-live-status` announcement and retargets it to all branches or a selected subset.
- Extended the public status view model and homepage so visitors now see separate normal, limited or halfday, and closed branch groups.
- Added repeatable node:test coverage for target-mode resolution and the visitor-facing grouping output used by the public board.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add quick live-status targeting controls to the admin route** - `c70e9ee` (feat)
2. **Task 2: Make the public branch-state model explicit for normal, limited, and closed groups** - `7177500` (feat)
3. **Task 3: Add repeatable tests for targeted branch selection and public grouping** - `c616283` (feat)

## Files Created/Modified

- `src/lib/admin/live-status-form.ts` - Normalizes the fixed Phase 3 live-status form payload and resolves target branch IDs for all versus selected mode.
- `src/lib/spacetimedb/admin-branch-client.ts` - Normalizes app-side status-kind strings into the generated SpacetimeDB enum payload expected by `upsertAnnouncement`.
- `src/pages/admin/index.astro` - Adds the quick live-status form, target-mode controls, and active-branch selection UI on top of the existing branch lifecycle route.
- `src/lib/public-status/view-model.ts` - Adds explicit normal, limited, and closed branch groups and counts while preserving the older open or closed compatibility fields.
- `src/pages/index.astro` - Renders dedicated public summaries and branch lists for normal, limited or halfday, and closed branches.
- `tests/branch-targeting.test.mjs` - Covers selected versus all target modes and verifies visitor-facing grouping of targeted limited payloads.

## Decisions Made

- Keep the quick Phase 3 admin flow limited to one fixed live announcement ID so announcement CRUD and scheduling remain deferred to Phase 4.
- Let the app-owned admin wrapper hide the generated enum shape for `statusKind`, because reducer ergonomics belong at the transport boundary instead of in the Astro page.
- Move the public board from generic open versus closed lists to explicit branch-state buckets without deleting compatibility fields that earlier tests still rely on.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Normalize reducer enum payloads inside the admin wrapper**
- **Found during:** Task 1 (Add quick live-status targeting controls to the admin route)
- **Issue:** The generated `upsertAnnouncement` binding expects SpacetimeDB enum objects like `{ tag: "Limited" }`, while the new admin form naturally produces string values like `"limited"`.
- **Fix:** Added status-kind normalization inside `upsertAnnouncementRecord` so the admin page can stay string-based and still call the reducer correctly.
- **Files modified:** `src/lib/spacetimedb/admin-branch-client.ts`
- **Verification:** `npm run build`
- **Committed in:** `c70e9ee`

**2. [Rule 3 - Blocking] Make the new branch-targeting test runnable under the exact Node test command**
- **Found during:** Task 3 (Add repeatable tests for targeted branch selection and public grouping)
- **Issue:** The first pass at the new test hit Node ESM resolution failures because runtime imports in the test path referenced extensionless `.ts` modules.
- **Fix:** Switched `src/lib/admin/live-status-form.ts` to an explicit `schema.ts` runtime import and kept the `publicCurrentStatus` linkage in the test name instead of a direct runtime import.
- **Files modified:** `src/lib/admin/live-status-form.ts`, `tests/branch-targeting.test.mjs`
- **Verification:** `node --test --test-isolation=none tests/branch-targeting.test.mjs tests/public-status-view-model.test.mjs`, `npm run build`
- **Committed in:** `c616283`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to make the planned admin mutation flow and repeatable Node test command work as specified. No feature scope was expanded.

## Issues Encountered

- `npm run build` still emits the pre-existing Vite CSS minify warning about `.file:lines`; this plan did not introduce a new build failure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 is now complete: admin can target a quick live operational change to all branches or a selected subset, and visitors can see explicit normal, limited, and closed branch groups.
- Phase 4 can build on the fixed quick-update path to add full announcement CRUD, publish or unpublish controls, scheduling windows, and timezone rules.
- Manual live verification still needs a real admin token and running SpacetimeDB module to exercise the end-to-end admin-to-public propagation flow outside the build and node:test checks.

## Self-Check: PASSED

- Found `.planning/phases/03-branch-operations-management/03-02-SUMMARY.md` on disk.
- Verified task commits `c70e9ee`, `7177500`, and `c616283` in git history.
