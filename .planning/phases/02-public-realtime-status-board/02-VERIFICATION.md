---
phase: 02-public-realtime-status-board
verified: 2026-03-23T15:40:33Z
status: passed
score: 4/4 must-haves verified
---

# Phase 02: Public Realtime Status Board Verification Report

**Phase Goal:** Migrate the public website from hard-coded schedule arrays to a realtime public read model without losing clarity on normal days.
**Verified:** 2026-03-23T15:40:33Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Visitors can open the homepage and see the current operational status from live database-backed data. | ✓ VERIFIED | `src/pages/index.astro:277-472` imports `subscribePublicCurrentStatus`, renders dedicated `data-public-*` containers, and updates the DOM from the live subscription; `src/lib/public-status/view-model.ts:53-107` maps the backend payload into the homepage state object. |
| 2 | The public page clearly communicates normal operation even when no special event is active. | ✓ VERIFIED | `src/lib/public-status/view-model.ts:88-105` resolves normal payloads to `presentationState: "ready-normal"` with headline `Operasional Normal`; `src/pages/index.astro:145-151` and `src/pages/index.astro:401-405` surface that explicit normal-state chip in the page. |
| 3 | Public status changes appear without a rebuild or manual source edit. | ✓ VERIFIED | `src/pages/index.astro:455-472` subscribes through `subscribePublicCurrentStatus` rather than embedded schedule data; `src/lib/spacetimedb/public-status-client.ts:171-201` owns the live SpacetimeDB subscription lifecycle; `src/pages/index.astro` no longer contains `const schedule = [`, `schedule-data`, `data-date`, or `todayKey`. |
| 4 | The public UI consumes a stable read model instead of reconstructing rules from raw admin tables. | ✓ VERIFIED | `src/lib/public-status/view-model.ts` is the single payload-to-UI adapter, `src/pages/index.astro` imports only the adapter and client wrapper, and the page does not read raw `announcements`, `branches`, or `announcementBranchTargets` directly. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/lib/spacetimedb/public-status-client.ts` | Stable frontend-owned realtime wrapper | ✓ VERIFIED | The wrapper exports `createPublicStatusClient`, `subscribePublicCurrentStatus`, and `disconnectPublicStatusClient` and hides generated-binding internals. |
| `src/lib/public-status/view-model.ts` | UI-ready status mapping layer | ✓ VERIFIED | The file exports `buildPublicStatusViewModel` and `getStatusTone`, plus the presentation-state contract. |
| `src/pages/index.astro` | Homepage wired to the live public status contract | ✓ VERIFIED | The page renders the live status shell, open/closed branch panels, and the `data-public-*` hooks required by the phase plans. |
| `tests/public-status-view-model.test.mjs` | Lightweight automated coverage for mapping rules | ✓ VERIFIED | The test file uses `node:test` to verify ready-normal, ready-special, and unavailable mappings. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/pages/index.astro` | `src/lib/spacetimedb/public-status-client.ts` | Page subscribes to the published public contract | ✓ WIRED | `src/pages/index.astro:277` imports `subscribePublicCurrentStatus`; `src/pages/index.astro:455` subscribes and renders the live payload. |
| `src/pages/index.astro` | `src/lib/public-status/view-model.ts` | Page renders from a prepared public-status view model | ✓ WIRED | `src/pages/index.astro:2` and `src/pages/index.astro:278` import `buildPublicStatusViewModel`; `src/pages/index.astro:374-424` renders through `presentationState`, grouped branches, and derived counts. |
| `tests/public-status-view-model.test.mjs` | `src/lib/public-status/view-model.ts` | Tests assert the exact mapping behavior exported by the adapter | ✓ WIRED | `tests/public-status-view-model.test.mjs:4` imports the view model directly and verifies normal, limited, and unavailable branches. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Astro site still builds after the live public-board migration | `npm run build` | Passed. Astro builds the public page and client bundle successfully; only the pre-existing CSS minify warning about the unsupported `"file"` property remains. | ✓ PASS |
| View-model mapping rules are covered by repeatable automated checks | `node --test --test-isolation=none tests/public-status-view-model.test.mjs` | Passed. All three tests succeeded for ready-normal, ready-special, and unavailable states. | ✓ PASS |
| Legacy schedule truth is removed from the public page | `rg -n 'const schedule = \[|schedule-data|data-date|todayKey' src/pages/index.astro` | No matches. The route no longer keeps hard-coded schedule arrays or browser-date highlight logic. | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `DATA-03` | `02-01`, `02-02` | Public website reads from a stable public read model so the UI does not rebuild business rules from raw admin tables | ✓ SATISFIED | `src/lib/spacetimedb/public-status-client.ts` subscribes to `publicCurrentStatus`; `src/lib/public-status/view-model.ts` maps that payload into the UI state; `src/pages/index.astro` renders from the adapter only. |
| `PUB-01` | `02-02`, `02-03` | Visitor can open the public homepage and immediately see the current overall operational status | ✓ SATISFIED | `src/pages/index.astro` now renders one live status shell, branch counts, and open/closed branch panels from the prepared state object. |
| `PUB-03` | `02-01`, `02-03` | Visitor can still see a clear "normal operation" message when no special announcement is active | ✓ SATISFIED | `src/lib/public-status/view-model.ts:88-105` maps normal payloads to `Operasional Normal`; `src/pages/index.astro:149` and `src/pages/index.astro:405` keep the exact normal-state copy visible in the page source and runtime render. |
| `PUB-04` | `02-01`, `02-02`, `02-03` | Visitor sees public status updates from database-backed realtime data without waiting for a code redeploy | ✓ SATISFIED | `src/pages/index.astro:455-472` listens to the realtime client wrapper, `src/lib/spacetimedb/public-status-client.ts:171-201` owns the subscription lifecycle, and the live database/view contract was already published and seeded in Plan 01. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | No remaining hard-coded public schedule array, `schedule-data` JSON payload, or browser-date card-highlighting logic was found in the homepage route. | ℹ️ Info | The main Phase 2 brownfield anti-pattern is removed. |

### Human Verification Required

None for phase pass. Two non-blocking follow-ups are still recommended:

1. Observe the public page against a live status change in a browser once the admin-facing mutation flow exists, to confirm the end-to-end realtime UX outside the static build.
2. Re-check the final public layout on mobile and desktop widths as part of Phase 5 readability hardening.

### Gaps Summary

No blocking gaps found. Phase 2 achieved its goal: the public route now renders from the published `publicCurrentStatus` contract, normal days are explicit first-class states, and the core mapping rules have repeatable automated coverage.

One environment-specific note remains non-blocking:

- In this sandbox, the exact command `node --test tests/public-status-view-model.test.mjs` fails before executing the file because Node's default test isolation tries to spawn a child process and hits `EPERM`. The same test file passes with `--test-isolation=none`, so the code path is verified even though the default runner mode is restricted here.

---

_Verified: 2026-03-23T15:40:33Z_
_Verifier: Codex (local phase verification)_ 
