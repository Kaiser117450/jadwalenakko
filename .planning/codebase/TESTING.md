# Testing

## Current State
- There are no automated tests in the repository.
- No `test/`, `tests/`, or `__tests__/` directories exist in tracked files.
- `package.json` does not define a `test` script.
- No test runner, assertion library, browser automation tool, or coverage tool is listed in `package.json`.

## Existing Validation Paths
- The main validation path today is manual review in the browser during `astro dev` or after `astro build`.
- Astro compilation provides a limited structural check that `src/pages/index.astro` is syntactically valid.
- TypeScript strict defaults from `tsconfig.json` may catch some issues surfaced through Astro tooling, but there is no standalone typecheck script.

## What Is Currently Untested
- The date-window logic in the inline script in `src/pages/index.astro` is untested.
- The boundary behavior for `startDate` and `endDate` in `src/pages/index.astro` is untested.
- The schedule highlighting logic for the matching `data-date` card is untested.
- The fallback state before `2026-03-16` and after `2026-03-25` is untested.
- The integrity of the hard-coded schedule objects is untested.
- Asset availability for `public/logo.png` and `public/Digitalt.ttf` is untested beyond manual visual inspection.

## Missing Test Infrastructure
- There is no CI workflow in tracked files.
- There is no snapshot or visual regression setup for the styled schedule cards.
- There is no content validation step that checks for duplicate or missing branch names.
- There is no accessibility test coverage for semantics, focus order, or contrast.

## Recommended First Tests
- Extract schedule data and date helpers from `src/pages/index.astro` into a small module so they can be unit tested.
- Add tests for "before schedule", "matching schedule day", and "after schedule" behavior.
- Add a smoke test that confirms the page renders key text and the serialized schedule payload.
- Add a regression test for the end-screen transition after the configured range ends.

## Risk Level
- The current testing posture is acceptable only because the codebase is tiny and time-bounded.
- The biggest risk is silent content or date regressions that only surface on specific calendar days.
- If this microsite is reused for future campaigns, testing should be added before copying the current pattern forward.
