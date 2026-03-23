# Concerns

## Highest-Risk Issues
- `src/pages/index.astro` hard-codes a campaign window from `2026-03-16` through `2026-03-25`, so the site will become stale unless a developer updates and redeploys it.
- The client script in `src/pages/index.astro` switches to the "operasional telah kembali normal" end screen after `endDate`, which means the page stops showing the detailed schedule once the configured period passes.
- All schedule content, styling, and runtime behavior live in `src/pages/index.astro`, creating a monolithic file that will become fragile if more events or interactions are added.

## Data Maintenance Risks
- Schedule entries are maintained manually in source code, so copy mistakes or inconsistent branch lists can be introduced without automated checks.
- Operational data is duplicated across several day objects, especially for repeated "limited" states in `src/pages/index.astro`.
- There is no external content source, admin UI, or config file to allow non-developers to update dates safely.

## Time And Locale Risks
- The page intentionally follows the visitor's browser date rather than a fixed Bali timezone, as stated in the hero copy and implemented with `new Date()` in `src/pages/index.astro`.
- Users outside the intended timezone may see a different operational status than staff in Bali at the same moment.
- Boundary comparisons rely on local browser midnight behavior, which is simple but not explicit about timezone policy.

## Quality Risks
- There are no automated tests for date logic, DOM updates, or content integrity.
- There is no linting or formatting configuration, so style drift can accumulate if the file changes repeatedly.
- The inline script assumes key DOM elements exist and does not guard against accidental markup refactors that remove those IDs.

## UX And Accessibility Risks
- The schedule cards and hero are highly visual, but there is no automated accessibility review for contrast, reduced motion, or screen reader behavior.
- The custom font in `public/Digitalt.ttf` is a single static asset with no fallback loading strategy beyond `font-display: swap`.
- Important operational messaging depends on color coding and visual prominence, which may need stronger non-color cues if the page evolves.

## Scaling Risks
- There are no reusable components, so adding more pages or seasonal schedules will likely duplicate patterns from `src/pages/index.astro`.
- There is no content abstraction layer, which makes future reuse harder than it needs to be.
- If integrations are added later, the repo currently has no established patterns for secrets, configuration, or runtime error handling.

## Recommended Follow-Up
- Extract schedule data into a dedicated module or content file before the next event cycle.
- Decide whether the canonical timezone should remain "visitor browser time" or become a fixed operational timezone.
- Add a small automated test suite around date selection and end-screen behavior.
- Split `src/pages/index.astro` into smaller components if the microsite is expected to survive beyond this one campaign window.
