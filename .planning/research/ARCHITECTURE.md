# Architecture Research

**Domain:** Realtime operational schedule and announcement website with admin management
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Recommended Architecture

### Proposed Components

| Component | Responsibility | Why It Exists |
|-----------|----------------|---------------|
| Public Astro frontend | Render the schedule board and consume realtime public data | Preserves the current brownfield UI direction and keeps the public site fast |
| Admin web interface | Create, update, schedule, and deactivate operational messages and branch states | Replaces manual code edits with operational tooling |
| SpacetimeDB module | Own schema, reducers, auth checks, and public read models | Centralizes write rules and realtime data propagation |
| Public view or public table layer | Expose only the fields the public page needs | Reduces client complexity and avoids leaking admin-only structure |
| Auth provider / identity layer | Assert who is an admin and who is a public visitor | Required before admin reducers can be trusted |

## Data Flow

1. Admin authenticates and connects to SpacetimeDB.
2. Admin actions call reducers to create or update branches, announcements, or effective windows.
3. Reducers validate auth claims and write authoritative records.
4. Public tables or views expose the current operational state in a minimal read shape.
5. The Astro frontend subscribes to the public read model and updates the visitor UI in realtime.

## Recommended Database Modeling

- Keep `branch` as normalized master data instead of repeated string arrays.
- Store operational events or announcements separately from branch definitions.
- Model effective periods explicitly with start/end fields instead of encoding meaning in page logic.
- Represent "normal operation" as valid data, not merely the absence of rows.
- Keep admin-only metadata private if it is not required on the public page.

## Why Public Views Matter

Official SpacetimeDB docs state that views compute results server-side, reduce data sent to clients, provide consistent formatting, and can be subscribed to like tables. For this product, that suggests a strong pattern:

- private or internal tables for raw admin state
- reducer logic for all writes
- one public "current operational status" view for the website

That keeps the public client simple and lowers the risk of rebuilding business rules in browser code.

## Build Order Implications

1. First establish schema, auth, and reducer boundaries.
2. Then expose a stable public read model for the website.
3. Then migrate the public Astro page from hard-coded data to subscribed realtime data.
4. Then build the admin interface against the same reducers and read models.
5. Finish with testing, polish, and operator safeguards.

## Major Risks In The Architecture

- If public UI subscribes to too many raw tables, browser logic becomes fragile again.
- If auth is delayed, admin CRUD work will accumulate insecure shortcuts.
- If date logic stays duplicated in both database and frontend, public results can drift from admin intent.
- If the existing single-file Astro page is not decomposed, the realtime migration will stay hard to maintain.

## Suggested Module Strategy

- Preferred path: validate the current TypeScript module scaffold first, because the official 2.0.0 quickstart supports it and it matches the repo's TypeScript-heavy ecosystem.
- Fallback path: move module code to Rust if the local TypeScript module workflow proves immature or too limiting.

This fallback recommendation is an inference from official docs that appear to be in transition: current 2.0.0 quickstart and language-support pages show TypeScript module support, while some other official pages still emphasize Rust as the most mature server path.

## Sources

- https://spacetimedb.com/docs/quickstarts/typescript/ - verified current module structure and server-side TypeScript example
- https://spacetimedb.com/docs/functions/views/ - verified public view capabilities and realtime behavior
- https://spacetimedb.com/docs/subscriptions/ - verified client subscription lifecycle and local cache model
- https://spacetimedb.com/docs/intro/language-support/ - checked current module language support
- https://spacetimedb.com/docs/modules/ - used as a cautionary signal on server-module maturity wording

---
*Architecture research for: realtime operational schedule website*
*Researched: 2026-03-23*
