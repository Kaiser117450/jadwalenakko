---
phase: 2
slug: public-realtime-status-board
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 2 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build smoke validation plus a Node built-in test introduced in Plan 03 for public view-model rules |
| **Config file** | `package.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`.
- **After every plan wave:** Run `npm run build` and re-check phase artifacts by file read / grep.
- **Before `$gsd-verify-work`:** Run `npm run build`, then run `node --test tests/public-status-view-model.test.mjs` after Plan 03 creates the file.
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DATA-03 / PUB-04 | artifact + contract smoke | `npm run build` | ✅ repo | ⬜ pending |
| 02-02-01 | 02 | 2 | DATA-03 / PUB-01 | smoke + artifact | `npm run build` | ✅ repo | ⬜ pending |
| 02-03-01 | 03 | 3 | PUB-03 | smoke + targeted test | `node --test tests/public-status-view-model.test.mjs && npm run build` | ❌ plan 03 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

None. Existing `npm run build` coverage is sufficient for Waves 1 and 2, and Plan 03 introduces the dedicated `node --test` check before phase verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Public page updates after live status change without redeploy | PUB-04 | Requires a running realtime backend/client path that is not covered by the current repo build alone | Start the local public/client flow, publish or simulate a changed public status in the backend, refresh or observe the public page, and confirm the rendered banner/branch state updates without editing source files or rebuilding. |
| Normal operation is clearly communicated when no special announcement is active | PUB-03 | This is partly copy and presentation quality, not just data presence | Load the page against a payload that falls back to the normal baseline and confirm the banner, headline, and branch summary explicitly indicate normal operation rather than an empty or error-like state. |
| Public status remains readable on mobile and desktop after the realtime migration | PUB-01 | Responsive readability is visual and layout-dependent | Verify the live status shell, branch lists, and fallback states at mobile and desktop widths and confirm the main status remains immediately scannable. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing repeatable validation commands
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned 2026-03-23
