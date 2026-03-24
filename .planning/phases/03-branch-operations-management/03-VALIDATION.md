---
phase: 3
slug: branch-operations-management
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 3 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build smoke validation plus Node built-in tests for branch-management and public-visibility mapping |
| **Config file** | `package.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `node --test --test-isolation=none tests/branch-management.test.mjs tests/branch-targeting.test.mjs tests/public-status-view-model.test.mjs && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`.
- **After every plan wave:** Run `node --test --test-isolation=none tests/branch-management.test.mjs tests/branch-targeting.test.mjs tests/public-status-view-model.test.mjs && npm run build`.
- **Before `$gsd-verify-work`:** Full suite must be green, including new Phase 3 tests.
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ADMN-02 | artifact + build smoke | `npm run spacetimedb:generate && npm run build` | ✅ repo | ⬜ pending |
| 03-01-02 | 01 | 1 | ADMN-02 | Node test + build smoke | `node --test --test-isolation=none tests/branch-management.test.mjs && npm run build` | ❌ plan 01 | ⬜ pending |
| 03-02-01 | 02 | 2 | ADMN-04 / PUB-02 | Node test + build smoke | `node --test --test-isolation=none tests/public-status-view-model.test.mjs tests/branch-targeting.test.mjs && npm run build` | ❌ plan 02 | ⬜ pending |
| 03-03-01 | 03 | 3 | ADMN-04 / PUB-02 | targeted artifact check + build smoke | `rg -n "announcement.statusKind === \"closed\"|return !hasTargets \\|\\| isTargeted \\? \"closed\" : \"normal\"|announcement.statusKind === \"normal\"" spacetimedb/src/publicReadModel.ts && npm run build` | ❌ plan 03 | ⬜ pending |
| 03-03-02 | 03 | 3 | ADMN-04 / PUB-02 | live projector regression suite + build smoke | `node --test --test-isolation=none tests/branch-targeting.test.mjs tests/public-status-view-model.test.mjs && npm run build` | ❌ plan 03 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers the start of the phase. No framework install is required before execution.

Planned during execution:

- `tests/branch-management.test.mjs` — verifies branch lifecycle normalization and activation/deactivation behavior
- `tests/branch-targeting.test.mjs` — verifies targeted branch selections preserve the expected visitor-facing open and closed grouping

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Authorized admin can create, edit, activate, and deactivate a branch through the real admin route | ADMN-02 | Requires a real auth token and live reducer connection, not just pure-module checks | Start the local app and SpacetimeDB module, open the admin route with an authorized token, create a new branch, edit it, toggle it inactive, then reactivate it and confirm the branch list updates without source edits. |
| Admin can target a status to all branches or a selected subset | ADMN-04 | Requires end-to-end reducer calls plus the admin selection UI | In the admin route, apply one branch-targeted status and one all-branches status, then confirm the saved targeting mode and selected branch list match the admin input. |
| Visitors can see the active branch split correctly after a targeted change | PUB-02 | Needs a live backend-to-public-page propagation check | With the public homepage open, perform a targeted status change from the admin route and confirm the visitor-facing open and closed branch lists update to the expected branch names without a rebuild. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing repeatable validation commands
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned 2026-03-24
