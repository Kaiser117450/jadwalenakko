# Stack Research

**Domain:** Realtime operational schedule and announcement website with admin management
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.6.x | Public website and admin-facing web shell | Already present in the brownfield repo, fast for content-heavy pages, and a good fit for a web-first control panel plus public site |
| SpacetimeDB module | 2.0.x | Realtime data model, reducers, subscriptions, and server-side logic | Official 2.0.0 quickstart shows end-to-end app scaffolding with tables, reducers, generated bindings, and local dev flow |
| `spacetimedb` package | Match deployed SpacetimeDB version | Browser client bindings and reducer calls | Official docs call this the current package and explicitly deprecate `@clockworklabs/spacetimedb-sdk` |
| Tailwind CSS | 4.1.x | Existing UI styling system | Already installed and sufficient for both public status views and an internal admin panel |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Generated `module_bindings` | Match module publish output | Type-safe table, reducer, and event bindings | Required whenever the frontend consumes SpacetimeDB data |
| Public views in SpacetimeDB | 2.0.x feature | Derived read models for the public site | Use when the public UI needs a clean, pre-joined "current status" payload instead of raw admin tables |
| `spacetimedb/react` hooks | Match `spacetimedb` package | Realtime hook-based consumption | Use only if the admin UI becomes state-heavy enough to justify React islands or a React sub-app |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `spacetime` CLI | Local server, publish, SQL, logs, and binding generation | Official docs use `spacetime dev`, `spacetime call`, `spacetime sql`, and `spacetime logs` as the core workflow |
| Node.js 18+ | Astro runtime and TypeScript toolchain | Required by the current Astro app and by the TypeScript quickstart prerequisites |
| Git | Track planning and schema evolution | Important because database model changes and UI changes need to move together |

## Installation

```bash
# Existing frontend
npm install

# SpacetimeDB local workflow
spacetime dev --template basic-ts

# Frontend client package, if not already present in the app workspace
npm install spacetimedb
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TypeScript SpacetimeDB module | Rust SpacetimeDB module | Use Rust if the local TypeScript module workflow proves immature for this project, or if reducer performance and ecosystem stability become higher priorities |
| Astro public/admin web app | Separate frontend plus standalone custom API | Only choose this if SpacetimeDB cannot satisfy access-control or deployment constraints; otherwise it adds unnecessary surface area |
| Public views for read models | Direct subscription to many raw tables | Direct table subscriptions are acceptable only for very small datasets and simple UIs |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@clockworklabs/spacetimedb-sdk` | Official docs mark it deprecated in favor of `spacetimedb` | `spacetimedb` |
| Hard-coded schedule arrays in `src/pages/index.astro` | Requires code edits and rebuilds for operational changes | Database-backed tables plus public views |
| Client-side only authorization checks | Admin writes must be enforced server-side | Reducer-side auth claim checks and role gating |

## Stack Patterns by Variant

**If public pages only need read access:**
- Keep Astro pages mostly static in structure
- Subscribe to a small public view or public table for the current operational payload

**If admin screens become form-heavy and highly interactive:**
- Introduce isolated interactive islands for admin surfaces
- Keep the public microsite mostly server-rendered and lightweight

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Astro 5.6.x | Tailwind 4.1.x | Already proven by the existing repo |
| `spacetimedb` client | Matching SpacetimeDB CLI/server version | Keep client bindings aligned with the module generation toolchain |
| TypeScript SpacetimeDB module quickstart | Node.js 18+ | Explicit prerequisite in the official 2.0.0 quickstart |

## Sources

- https://spacetimedb.com/docs/quickstarts/typescript/ - verified TypeScript module quickstart and project structure
- https://spacetimedb.com/docs/subscriptions/ - verified realtime subscription model and local client cache
- https://spacetimedb.com/docs/functions/views/ - verified public view pattern for derived realtime read models
- https://spacetimedb.com/docs/intro/language-support/ - checked current 2.0.0 language support page
- https://spacetimedb.com/docs/getting-started/ - checked local dev workflow and CLI expectations

---
*Stack research for: realtime operational schedule website*
*Researched: 2026-03-23*
