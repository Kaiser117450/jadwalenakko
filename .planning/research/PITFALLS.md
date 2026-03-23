# Pitfalls Research

**Domain:** Realtime operational schedule and announcement website with admin management
**Researched:** 2026-03-23
**Confidence:** HIGH

## Critical Pitfalls

| Pitfall | Warning Signs | Prevention Strategy | Phase |
|---------|---------------|---------------------|-------|
| Treating "normal day" as no data | Public page goes blank or ambiguous when no event is active | Make normal operation an explicit status in the schema and read model | Phase 1 |
| Exposing admin structure directly to the public client | Public UI needs many queries and starts knowing too much about internal state | Create a single public view or table for current operational status | Phase 1-2 |
| Delaying reducer-side auth | Early admin screens rely only on hidden buttons or frontend checks | Gate admin mutations inside reducers using auth claims and roles from day one | Phase 1 |
| Keeping schedule logic split between browser and DB | Admin says one thing, UI computes another | Put effective-period rules in the authoritative backend model and keep frontend rendering-focused | Phase 2 |
| Over-subscribing raw data | Public page opens many subscriptions or pulls more rows than needed | Subscribe only to a focused public query or view | Phase 2 |
| Migrating the UI without decomposing the monolith | `src/pages/index.astro` becomes harder to reason about as realtime logic grows | Split display sections and data access concerns during the migration | Phase 2-3 |
| Depending blindly on SpacetimeAuth beta | Admin auth becomes a delivery blocker if beta limitations surface | Validate auth choice early; keep room to swap to another OIDC flow if needed | Phase 1 |

## Deep Notes

### 1. Default-state ambiguity

The user explicitly said most days have no libur or event. That means the common path is "normal operation." If the schema treats announcements as optional rows and does not encode the baseline state, operators will end up fighting edge cases and the public page may not know what to show when nothing special is active.

### 2. Public/private boundary leaks

SpacetimeDB tables can be made public and views can also be public. That power is useful, but it creates a temptation to make everything public just to move faster. For this product, that would leak internal editing structure and make the frontend depend on implementation details that should stay private.

### 3. Auth maturity assumptions

Official docs show a clear pattern for checking JWT claims and issuer/audience inside reducers. They also describe SpacetimeAuth as beta. The correct conclusion is not "auth is solved forever"; it is "authorization patterns are documented, but the chosen identity provider should be validated early."

### 4. Browser-time drift

The current site derives status from the visitor's local date. That is acceptable for a static campaign page, but a realtime operational board should decide whether the canonical timezone is operational timezone or visitor timezone. If this is left implicit, admins and visitors may see different answers around day boundaries.

### 5. Brownfield migration risk

The existing Astro page works today. Replacing everything at once would create unnecessary risk. A staged migration that keeps the public UI working while the data source moves to SpacetimeDB is safer.

## Phase Mapping

- **Phase 1 should eliminate:** missing explicit normal state, missing auth boundary, and unnormalized branch data
- **Phase 2 should eliminate:** raw-table subscription sprawl and duplicated date logic
- **Phase 3 should eliminate:** manual operational edits and lack of admin workflow safeguards
- **Phase 4 should eliminate:** low confidence around validation, regression risk, and operator error

## Sources

- https://spacetimedb.com/docs/how-to/using-auth-claims - checked reducer-side auth claim access and issuer/audience checks
- https://spacetimedb.com/docs/spacetimeauth/ - checked SpacetimeAuth beta status and role support
- https://spacetimedb.com/docs/functions/views/ - checked public view behavior
- https://spacetimedb.com/docs/subscriptions/ - checked subscription behavior and client-cache model
- Existing brownfield codebase map in `.planning/codebase/`

---
*Pitfall research for: realtime operational schedule website*
*Researched: 2026-03-23*
