# SpacetimeDB Module Workspace

This directory is the agreed TypeScript SpacetimeDB module root for Phase 1. The canonical entrypoint for the workspace is `spacetimedb/src/module.ts`, and generated browser bindings are written to `src/lib/spacetimedb/module_bindings`.

## Prerequisites

- Node.js 18 or newer for the Astro workspace and helper scripts
- A `spacetime` CLI install available on `PATH`

## Repo Script Contract

Run these commands from the repository root:

- `npm run spacetimedb:dev`
- `npm run spacetimedb:publish`
- `npm run spacetimedb:generate`

`npm run spacetimedb:generate` uses `scripts/generate-spacetimedb-bindings.mjs` and writes generated output into `src/lib/spacetimedb/module_bindings`. Treat that directory as generated code and do not hand-edit it.

## Local Workflow

1. Install root dependencies with `npm install`.
2. Iterate on the TypeScript module rooted at `spacetimedb/` with `npm run spacetimedb:dev`.
3. Publish the local module contract with `npm run spacetimedb:publish`.
4. Regenerate browser bindings with `npm run spacetimedb:generate`.

The phase baseline stays in TypeScript so the Astro app and the module workflow share one toolchain and one repeatable command surface.

## Auth Direction

Phase 1 will validate admin writes through reducer-side claim checks, not frontend-only guards. Start with a SpacetimeAuth-compatible issuer and audience flow so reducers can stay provider-agnostic while still enforcing admin-only mutations.

If SpacetimeAuth beta behavior blocks local development or rollout, keep the reducer claim contract and switch to another OIDC-compatible issuer before changing reducer call sites.

## Fallback Rule

Stay on the TypeScript scaffold unless the local TypeScript scaffold, publish, or binding-generation flow is blocked in a way that cannot be cleared inside the current delivery plan. Only then should the module implementation switch to Rust, and that fallback should preserve the same module root, reducer boundaries, and binding target at `src/lib/spacetimedb/module_bindings`.
