# Phase 2 Research: Public Realtime Status Board

**Phase:** 2  
**Researched:** 2026-03-23  
**Requirements:** DATA-03, PUB-01, PUB-03, PUB-04  
**Context source:** No phase `CONTEXT.md` yet; synthesized from roadmap, requirements, state, Phase 1 artifacts, and the current Astro/SpacetimeDB code  
**Confidence:** MEDIUM

## Planning Answer

Phase 2 needs to connect two halves of the product that now exist separately:

1. The public Astro homepage still renders from hard-coded schedule arrays in `src/pages/index.astro`.
2. Phase 1 already defined a safe backend read contract in `spacetimedb/src/publicReadModel.ts`.

Planning should focus on replacing the public page's embedded schedule logic with a thin realtime consumer of the existing public contract. The public UI should render from one stable payload, not reconstruct business rules from raw tables or duplicate the branch/status rules from Phase 1 in browser code.

If planning skips that contract boundary, the homepage will drift into a second business-rules engine and Phase 4 will need to untangle it again when timezone and scheduling rules become stricter.

## Brownfield Starting Point

The current public site is still a single Astro page with inline data, styles, and client logic.

- `src/pages/index.astro` declares branch rosters and dated schedule entries directly in frontmatter.
- The inline browser script derives the "today" state from the visitor's local browser date.
- The public page serializes the schedule into `#schedule-data` JSON and re-parses it client-side.
- The page has polished presentation already, but all operational truth is still static content embedded in the route.

This means Phase 2 is primarily a data-source and rendering-contract migration, not a visual redesign from zero.

## Existing Backend Contract From Phase 1

Phase 1 already created the contract Phase 2 should consume.

### Public Read Model

`spacetimedb/src/publicReadModel.ts` exposes `publicCurrentStatus`, which currently returns:

- `statusKind`
- `title`
- `message`
- `bannerText`
- `startsAt`
- `endsAt`
- `branches[]` with `branchId`, `slug`, `name`, `statusKind`, `isOpen`, and `isTargeted`

This is the correct boundary for DATA-03 because it already hides raw reducer/auth metadata and selects one current announcement instead of exposing internal tables directly.

### Important Existing Behavior

- The read model selects only published announcements.
- It sorts by `priority`, then by latest `startsAt`.
- It falls back to `seedNormalOperation` when no announcement applies.
- For targeted limited/halfday announcements, untargeted branches currently resolve to `closed`.
- The payload is intentionally narrow and public-safe.

### Current Gaps That Matter For Planning

- No frontend subscription/bootstrap code exists yet for Astro.
- The current payload does not expose display-specific fields like `hours`, `note`, or grouped branch buckets; the frontend will need an adapter layer or the read model will need a small contract expansion.
- Effective-time evaluation still uses `Date` and `Date.parse` without a canonical operational timezone policy. Phase 4 is meant to lock that policy, so Phase 2 should not overfit browser-local rules again.

## Recommended Planning Decisions To Lock

### 1. Keep The Public UI On A Dedicated Adapter Layer

Do not bind `src/pages/index.astro` directly to raw read-model objects inside large inline conditionals.

Preferred direction:

- Extract a small public-status client/adapter module under `src/lib/` that:
  - subscribes or fetches the `publicCurrentStatus` payload
  - maps the contract into UI-ready groups such as open branches, closed branches, banner copy, and tone
  - owns loading, empty, and error state translation
- Keep Astro markup focused on rendering a prepared view model instead of re-deriving operational rules

This preserves Phase 1's public/private boundary and keeps future changes to the read model isolated.

### 2. Treat "Normal Operation" As A First-Class UI State

PUB-03 is not satisfied by showing nothing when no announcement is active.

The plan should require:

- an explicit normal-state banner and headline
- an explicit normal-state branch summary
- copy that makes it clear the system is live even when there is no special event

The backend already supports this through `seedNormalOperation`; the frontend should surface it clearly instead of treating it as the absence of data.

### 3. Separate Realtime Transport From Rendering

Phase 2 needs live updates without redeploy, but the brownfield page should not bury connection lifecycle logic in a long inline `<script>`.

Preferred split:

- one module for SpacetimeDB connection/subscription lifecycle
- one module for view-model mapping
- Astro page/components responsible only for rendering and DOM state transitions

This makes PUB-04 implementable without turning `src/pages/index.astro` into a larger monolith.

### 4. Preserve The Existing Visual Direction While Refactoring Incrementally

The project constraint is brownfield Astro/Tailwind, not a greenfield rebuild.

Planning should preserve:

- the current public route (`src/pages/index.astro`)
- the current readable status hierarchy
- the current mobile-first responsive layout direction

Planning should change:

- embedded schedule arrays
- inline "today" rule reconstruction
- direct reliance on static JSON script tags as the source of truth

### 5. Keep The Phase Scope Narrow To Current Overall Status

Phase 2 requirements are about the current overall operational state, not full historical schedule browsing.

The plan should avoid expanding into:

- admin editing flows
- historical archive views
- full timezone policy design
- preview/audit/safeguard features from later phases

The public contract only needs to render the current live status clearly and safely.

## Implications For The Three Roadmap Plans

### Plan 02-01: Create The Public Read Model Or Public View

This plan should confirm the public contract is sufficient for the public homepage without leaking raw admin structures.

Likely deliverables:

- finalize or refine `publicCurrentStatus`
- ensure the payload contains everything the homepage needs for one live snapshot
- document or codify how the public client subscribes to that view safely

The plan should not teach the UI to rebuild announcement logic from `announcements` and `announcementBranchTargets`.

### Plan 02-02: Refactor The Astro Homepage To Consume Live Status Data

This plan should migrate the route from hard-coded frontmatter data to a realtime data source.

Likely deliverables:

- extract the current inline schedule/status logic into small reusable modules
- connect the page to generated bindings and the public read-model subscription/fetch path
- replace static `schedule`/`scheduleItems` assumptions with live payload rendering

The most important outcome is not visual change. It is replacing static truth with live truth.

### Plan 02-03: Rebuild Loading, Empty, And Normal-State UX

This plan should make the live experience trustworthy.

Likely deliverables:

- loading state while the public contract connects
- explicit normal-operation rendering when no special announcement applies
- fallback/error messaging when live data is temporarily unavailable
- UX rules for branch visibility summaries derived from the public contract

This plan is essential because moving to realtime introduces uncertainty states that the current static page never had to represent.

## Risks To Guard Against In Planning

1. Rebuilding rules in the browser.
   If the frontend re-derives active announcements, priority, or targeting from raw tables, DATA-03 fails.

2. Keeping browser-local date logic as the source of truth.
   The current page uses the visitor's local date. Phase 2 should not cement that as the final rule because Phase 4 still needs to define canonical timezone behavior.

3. Treating normal state as empty state.
   The public product is used mostly on normal days. Empty visuals or vague fallback copy would fail PUB-03.

4. Overloading `src/pages/index.astro` with connection and mapping logic.
   The repo already warns against letting the single-file page keep growing unchecked.

5. Designing only for success cases.
   Realtime UI must also define loading, stale, and unavailable states or the page will feel broken during connection/setup problems.

## Recommended Planning Bias

- Prefer a thin realtime client over a larger inline browser script.
- Prefer a stable view-model adapter over contract-specific conditionals scattered across the page.
- Prefer explicit normal, loading, and unavailable states over implicit fallbacks.
- Prefer preserving the current public visual language over redesign churn.
- Prefer incremental file extraction from `src/pages/index.astro` over a one-shot rewrite.

## Validation Architecture

Phase 2 still has no formal frontend test harness in the repo, so the validation strategy should stay lightweight and repeatable.

### Automated Validation

- `npm run build` remains the primary smoke gate for Astro and shared-module changes.
- Any extracted public view-model adapter should be kept in a standalone JS/TS module so it can be verified outside the page.
- If the phase introduces testable pure functions, prefer Node's built-in `node --test` for contract-to-UI mapping checks rather than adding a heavy new framework in the middle of a brownfield migration.

### What Should Be Verified Repeatedly

- the public contract symbol and binding path still exist after changes
- the homepage no longer contains the hard-coded operational schedule array as its source of truth
- the page contains explicit rendering for loading, normal, and unavailable states
- the public adapter can map a normal baseline payload and a targeted limited payload into the expected UI groups

### Manual Validation That Will Still Be Needed

- confirm a live status change appears in the public UI without editing source files or rebuilding
- confirm the public UI remains readable on mobile and desktop after the realtime refactor
- confirm normal-operation messaging is explicit and not confused with missing data

## Sources

Local project sources:

- `AGENTS.md`
- `CLAUDE.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/01-spacetimedb-foundation-and-access-control/01-RESEARCH.md`
- `src/pages/index.astro`
- `spacetimedb/src/schema.ts`
- `spacetimedb/src/publicReadModel.ts`
- `spacetimedb/src/module.ts`
- `spacetimedb/src/seeds.ts`

---
*Phase research generated for planning on 2026-03-23*
