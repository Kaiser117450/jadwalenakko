# Feature Research

**Domain:** Realtime operational schedule and announcement website with admin management
**Researched:** 2026-03-23
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Current operational status banner | Visitors come for the answer "buka atau tutup sekarang?" | LOW | Must work even when there is no special event |
| Branch-level open/closed visibility | Different gerai may have different status on the same day | MEDIUM | Needs normalized branch data and selected-branch targeting |
| Effective time window for announcements | Status changes often apply only during a date/time range | MEDIUM | Needs start/end date handling and fallback behavior |
| Admin-authenticated CRUD for status and announcements | Without this, the product falls back to code deploys | MEDIUM | Core write path for the business |
| Realtime public updates | "Jadwal realtime" is central to the user request | MEDIUM | Strong fit for SpacetimeDB subscriptions |
| Clear normal/default state | Most days have no event, so the page still needs to communicate useful normal status | LOW | This should be a first-class state, not an empty screen |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Scheduled future announcements | Lets ops prepare for holiday periods ahead of time | MEDIUM | Helps reduce last-minute manual edits |
| Emergency override | Lets admin quickly force a new public status during unexpected closures | MEDIUM | Should supersede scheduled content safely |
| Admin preview of public output | Reduces mistakes before publishing | MEDIUM | Useful once the basic admin flow works |
| Change history or audit trail | Helps ops understand who changed what | MEDIUM | Strong operational value, but can follow after launch |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full WYSIWYG CMS for all page sections | Sounds flexible | Adds a lot of surface area when the real problem is operational status data | Structured announcement fields plus targeted message blocks |
| Real-time editing presence and collaboration | Feels modern | Not necessary for a small ops team and adds conflict complexity | Single-admin mutations plus simple audit history |
| Separate custom backend beside SpacetimeDB | Feels more familiar to web teams | Duplicates state and weakens the value of SpacetimeDB reducers/subscriptions | Keep write logic in reducers and public reads in views/tables |

## Feature Dependencies

```text
Admin authentication / authorization
    └──requires──> role-aware reducer checks
                       └──requires──> stable admin identity model

Branch-level closure management
    └──requires──> branch master data
                       └──requires──> normalized public read model

Realtime public status
    └──requires──> public subscriptions or views
                       └──requires──> clear effective-date rules
```

### Dependency Notes

- **Admin writes require auth first:** Admin CRUD is not safe until reducer-side authorization exists.
- **Branch closures require branch master data:** You cannot cleanly target gerai if branches remain hard-coded arrays.
- **Realtime public status requires a read model:** The public page should subscribe to a simple payload, not reconstruct logic from many admin tables.

## MVP Definition

### Launch With (v1)

- [ ] Public page shows current operational status from database - essential product value
- [ ] Admin can manage branch list and branch availability - required for selective closures
- [ ] Admin can publish and edit normal/special announcements - required for day-to-day use
- [ ] Public site updates without code redeploy - required by the "realtime" goal
- [ ] Admin access is restricted by authenticated role checks - required for safe operations

### Add After Validation (v1.x)

- [ ] Scheduled announcement drafts and preview - add once the core flow is stable
- [ ] Audit log of operational changes - add when the ops team starts needing accountability
- [ ] Emergency override workflow - add when edge-case events happen often enough to justify it

### Future Consideration (v2+)

- [ ] Multi-brand support - defer until there is a real need beyond Enakko
- [ ] Push notifications or outbound messaging - defer until the website alone is insufficient
- [ ] Rich analytics dashboard - defer until operational questions outgrow the status board

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Public realtime status | HIGH | MEDIUM | P1 |
| Branch master and closures | HIGH | MEDIUM | P1 |
| Admin CRUD for announcements | HIGH | MEDIUM | P1 |
| Auth and admin authorization | HIGH | MEDIUM | P1 |
| Audit log | MEDIUM | MEDIUM | P2 |
| Preview and scheduling UX | MEDIUM | MEDIUM | P2 |
| Multi-brand support | LOW | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Common restaurant notice boards | Internal ops dashboards | Our Approach |
|---------|---------------------------------|-------------------------|--------------|
| Public current status | Usually static text or poster-style pages | Usually hidden behind staff tools | Public-first realtime board |
| Branch detail | Often incomplete or manual | Usually available internally | Branch-targeted public messaging |
| Admin editing | Often absent | Usually available but not public-safe | Small focused admin panel tied directly to the public read model |

## Sources

- Existing brownfield codebase map in `.planning/codebase/`
- User problem statement in this initialization session
- https://spacetimedb.com/docs/subscriptions/ - used to confirm realtime delivery expectations
- https://spacetimedb.com/docs/functions/views/ - used to confirm derived public read-model options

---
*Feature research for: realtime operational schedule website*
*Researched: 2026-03-23*
