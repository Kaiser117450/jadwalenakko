---
status: partial
phase: 03-branch-operations-management
source: [03-VERIFICATION.md]
started: 2026-03-24T18:36:24.7645237+08:00
updated: 2026-03-24T18:36:24.7645237+08:00
---

## Current Test

Awaiting live admin and realtime verification.

## Tests

### 1. Authorized Admin Branch Lifecycle
expected: Create, edit, deactivate, and reactivate a branch from `/admin`, and the branch list updates without source edits.
result: pending

### 2. Selected-Branch Live Status Flow
expected: Save one all-branch live status and one selected-branch live status from `/admin`; the selected branch set persists and the targeted status is reflected publicly.
result: pending

### 3. Public Branch Buckets After Admin Change
expected: Keep `/` open while changing status from `/admin`; the normal, limited, and closed groups update live without rebuild and match the selected branch intent.
result: pending

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

None yet.
