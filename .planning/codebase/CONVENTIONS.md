# Conventions

## General Style
- The project favors a compact, single-file implementation in `src/pages/index.astro`.
- Data declarations, template markup, CSS, and client JavaScript are intentionally colocated.
- Most identifiers are written in camelCase, including `limitedClosedBranches`, `scheduleItems`, and `formatKey`.

## Content Conventions
- UI copy is written in Indonesian in `src/pages/index.astro`.
- Variable and field names are written in English even when the displayed content is Indonesian.
- Daily schedule objects follow a stable shape with fields such as `date`, `label`, `hours`, `title`, `note`, `openBranches`, and `closedBranches`.

## Markup And Styling Patterns
- The Astro template uses direct markup rather than extracted components.
- Tailwind utility classes are heavily used inline in `src/pages/index.astro`.
- Conditional styling relies on Astro's `class:list` helper in repeated schedule cards.
- Global theme tokens are defined as CSS custom properties in the page-level `<style is:global>`.
- Animation is handled with a custom `@keyframes rise-in` definition and a shared `.rise-card` class.

## Script Patterns
- Browser logic is plain JavaScript in an inline `<script>` block at the bottom of `src/pages/index.astro`.
- DOM elements are cached once into constants like `statusShell`, `statusBanner`, and `cardElements`.
- Small helper functions, such as `formatKey`, are defined near the top of the script.
- Conditional branches are used directly rather than abstracted into reusable utilities.

## Data Handling
- Repeated branch lists are extracted into shared constants before they are referenced by schedule entries.
- Derived presentation fields are added by mapping over the base schedule array once.
- The schedule array is serialized into JSON and re-read on the client instead of duplicated manually.

## Error Handling And Validation
- There is essentially no formal error handling layer.
- The client script assumes DOM nodes exist because they are defined in the same file.
- JSON parsing falls back to `"[]"` if the script tag content is empty, which is the main defensive guard present today.
- There are no runtime assertions for malformed schedule entries or invalid dates.

## Repository Conventions
- Generated directories are kept out of version control via `.gitignore`.
- There is no linting, formatting, or commit-hook configuration in tracked files.
- There are no documented code review or testing conventions inside the repository itself.

## Implications
- The current conventions are efficient for a short-lived microsite.
- As the page grows, the lack of extracted components and shared utilities will make changes harder to isolate.
- Any future contributors should expect to refactor `src/pages/index.astro` before adding substantially more behavior.
