# Roadmap: Website Pemberitahuan Jadwal Terpadu Enakko

## Overview

Roadmap ini mengubah microsite Astro yang masih hard-coded menjadi website pemberitahuan jadwal realtime berbasis SpacetimeDB dengan jalur admin yang aman. Urutannya sengaja dimulai dari fondasi data dan akses, lalu memigrasikan pembacaan publik ke realtime, baru menambah surface admin dan safeguard supaya perilaku publik tetap stabil selama transisi brownfield.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: SpacetimeDB Foundation And Access Control** - Validate module path, model core tables, and lock down write access
- [ ] **Phase 2: Public Realtime Status Board** - Replace hard-coded public state with a live public read model
- [ ] **Phase 3: Branch Operations Management** - Manage branch data and branch-targeted status changes from admin flows
- [ ] **Phase 4: Announcement Scheduling And Status Rules** - Publish scheduled operational announcements with explicit status types and time rules
- [ ] **Phase 5: Readability And Launch Hardening** - Make the public/admin experience trustworthy across devices and regression checks

## Phase Details

### Phase 1: SpacetimeDB Foundation And Access Control
**Goal**: Establish the authoritative SpacetimeDB schema, reducer boundaries, and admin access rules that every later phase depends on.
**Depends on**: Nothing (first phase)
**Requirements**: [DATA-01, DATA-02, ADMN-01]
**UI hint**: no
**Success Criteria** (what must be TRUE):
  1. Branch and operational-status data are stored in SpacetimeDB instead of only in `src/pages/index.astro`
  2. Unauthorized clients cannot mutate operational data, while authenticated admins can reach the intended write paths
  3. The project has a validated module strategy and a safe public/private data boundary ready for frontend integration
**Plans**: 3 plans

Plans:
- [x] 01-01: Validate the local SpacetimeDB module path, auth approach, and generated binding workflow
- [x] 01-02: Design and implement normalized branch, status, and announcement schema plus reducers
- [x] 01-03: Establish admin authorization checks and seed/dev data needed for downstream UI work

### Phase 2: Public Realtime Status Board
**Goal**: Migrate the public website from hard-coded schedule arrays to a realtime public read model without losing clarity on normal days.
**Depends on**: Phase 1
**Requirements**: [DATA-03, PUB-01, PUB-03, PUB-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitors can open the homepage and see the current operational status from live database-backed data
  2. The public page clearly communicates normal operation even when no special event is active
  3. Public status changes appear without a rebuild or manual source edit
  4. The public UI consumes a stable read model instead of reconstructing rules from raw admin tables
**Plans**: 3 plans

Plans:
- [ ] 02-01: Create the public read model or public view for current operational status
- [ ] 02-02: Refactor the Astro homepage to consume generated bindings and live status data
- [ ] 02-03: Rebuild public loading, empty, and normal-state UX around the realtime contract

### Phase 3: Branch Operations Management
**Goal**: Add admin flows for branch master data and branch-targeted operational visibility.
**Depends on**: Phase 2
**Requirements**: [ADMN-02, ADMN-04, PUB-02]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Admin can create, edit, activate, and deactivate branch records without touching source code
  2. Admin can target operational changes to all branches or selected branches only
  3. Visitors can see which branches are open, limited, or closed for the active status period
**Plans**: 2 plans

Plans:
- [ ] 03-01: Build branch management reducers and admin UI for branch lifecycle operations
- [ ] 03-02: Connect branch-targeted announcements to the public rendering and branch-status presentation

### Phase 4: Announcement Scheduling And Status Rules
**Goal**: Let admin publish scheduled operational announcements with explicit status types and a canonical operational time policy.
**Depends on**: Phase 3
**Requirements**: [ADMN-03, ADMN-05, PUB-05]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Admin can create, edit, publish, unpublish, and schedule announcements from the management interface
  2. Each announcement can be classified as normal, limited, half-day, or full closure
  3. Public status follows a defined effective-period and timezone rule instead of ambiguous browser-only logic
**Plans**: 3 plans

Plans:
- [ ] 04-01: Implement announcement CRUD reducers and persistence model for effective windows
- [ ] 04-02: Define and apply the canonical operational timezone and status-evaluation rules
- [ ] 04-03: Build the admin announcement workflow for publish, unpublish, and scheduling actions

### Phase 5: Readability And Launch Hardening
**Goal**: Make the product trustworthy for real operators and clearly readable for public visitors across devices.
**Depends on**: Phase 4
**Requirements**: [PUB-06]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitors can read the current operational status clearly on mobile and desktop
  2. Public and admin flows have regression coverage around core status logic
  3. The launch path includes validation that the live public output matches admin intent
**Plans**: 2 plans

Plans:
- [ ] 05-01: Polish responsive readability, state presentation, and admin-to-public feedback loops
- [ ] 05-02: Add verification coverage and launch checks for the core realtime status workflow

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. SpacetimeDB Foundation And Access Control | 3/3 | Complete | 01-01, 01-02, 01-03 |
| 2. Public Realtime Status Board | 0/3 | Not started | - |
| 3. Branch Operations Management | 0/2 | Not started | - |
| 4. Announcement Scheduling And Status Rules | 0/3 | Not started | - |
| 5. Readability And Launch Hardening | 0/2 | Not started | - |
