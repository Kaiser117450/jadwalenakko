# Requirements: Website Pemberitahuan Jadwal Terpadu Enakko

**Defined:** 2026-03-23
**Core Value:** Status operasional yang tampil ke publik harus selalu cepat dibaca dan mudah diperbarui oleh admin saat kondisi lapangan berubah.

## v1 Requirements

### Public Status

- [ ] **PUB-01**: Visitor can open the public homepage and immediately see the current overall operational status
- [ ] **PUB-02**: Visitor can see which branches are open, limited, or closed for the currently active status period
- [ ] **PUB-03**: Visitor can still see a clear "normal operation" message when no special announcement is active
- [ ] **PUB-04**: Visitor sees public status updates from database-backed realtime data without waiting for a code redeploy
- [ ] **PUB-05**: Visitor sees status that follows a defined effective period and canonical operational timezone
- [ ] **PUB-06**: Visitor can read the current operational status clearly on both mobile and desktop layouts

### Admin Operations

- [ ] **ADMN-01**: Admin can authenticate before accessing operational management features
- [ ] **ADMN-02**: Admin can create, edit, activate, and deactivate branch records without editing source code
- [ ] **ADMN-03**: Admin can create, edit, publish, unpublish, and schedule operational announcements
- [ ] **ADMN-04**: Admin can target an announcement to all branches or to selected branches only
- [ ] **ADMN-05**: Admin can set whether an announcement represents normal operation, limited operation, half-day operation, or full closure

### Data And Access

- [ ] **DATA-01**: System stores branch master data and operational schedule data in SpacetimeDB instead of hard-coded arrays
- [ ] **DATA-02**: Only authorized admins can mutate operational data, while public visitors can read only the safe public status model
- [ ] **DATA-03**: Public website reads from a stable public read model so the UI does not rebuild business rules from raw admin tables

## v2 Requirements

### Operator Safeguards

- **SAFE-01**: Admin can preview the public output before publishing a change
- **SAFE-02**: Admin can review an audit trail of operational changes
- **SAFE-03**: Admin can trigger an emergency override that clearly supersedes scheduled announcements

### Expansion

- **EXPD-01**: System supports outbound notifications beyond the website
- **EXPD-02**: System supports multiple brands or tenants from one control panel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Food ordering or checkout | This product is an operational notice board, not a commerce flow |
| Native mobile app | Web-first delivery is faster and sufficient for the current need |
| Full-page CMS for all marketing content | The main problem is operational status management, not general content authoring |
| Separate custom backend beside SpacetimeDB | Would duplicate state and complexity before the core product is proven |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| ADMN-01 | Phase 1 | Pending |
| DATA-03 | Phase 2 | Pending |
| PUB-01 | Phase 2 | Pending |
| PUB-03 | Phase 2 | Pending |
| PUB-04 | Phase 2 | Pending |
| ADMN-02 | Phase 3 | Pending |
| ADMN-04 | Phase 3 | Pending |
| PUB-02 | Phase 3 | Pending |
| ADMN-03 | Phase 4 | Pending |
| ADMN-05 | Phase 4 | Pending |
| PUB-05 | Phase 4 | Pending |
| PUB-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*
