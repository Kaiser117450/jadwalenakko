# Integrations

## Snapshot
- There are no external service integrations in the current codebase.
- The site works as a self-contained static page with embedded schedule data.
- All user-visible behavior is derived from local browser state and bundled source files.

## Third-Party Packages
- `astro` from `package.json` provides the application framework and build pipeline.
- `tailwindcss` from `package.json` provides utility-class styling.
- `@tailwindcss/vite` from `package.json` connects Tailwind to the Astro Vite pipeline in `astro.config.mjs`.

## Browser APIs
- The client script in `src/pages/index.astro` uses `Date` to determine the visitor's local date.
- The same script uses `Intl.DateTimeFormat("id-ID", ...)` to render the current date label.
- DOM APIs such as `document.getElementById`, `document.querySelectorAll`, `classList`, and `textContent` are used to update the page after load.
- JSON serialization is used by embedding schedule data in `<script id="schedule-data" type="application/json">` inside `src/pages/index.astro`.

## Static Asset Loading
- The custom font is loaded from `public/Digitalt.ttf`.
- The brand image is loaded from `public/logo.png`.
- Both assets are referenced directly by path from `src/pages/index.astro`.

## Absent Integrations
- No external HTTP API calls are present in `src/pages/index.astro`.
- No database client, ORM, or storage SDK is installed in `package.json`.
- No authentication provider, session library, or identity flow exists in tracked files.
- No analytics, tag manager, error reporting, or observability SDK is present.
- No webhook handlers, form backends, or server endpoints exist under `src/`.
- No payment, email, SMS, or messaging integration is present.

## Build And Distribution Touchpoints
- The only package-resolution integration is `npm` dependency installation represented by `package-lock.json`.
- Astro build output is materialized into `dist/`, but that is generated output rather than a runtime integration.

## Data Ownership
- Schedule data is owned directly in source code at `src/pages/index.astro`.
- Branch availability and holiday states are not loaded from a CMS, spreadsheet, or config file.
- Updating operational dates requires a code change and rebuild.

## Future Integration Seams
- If the schedule needs non-developer updates, the first likely seam is to move schedule data out of `src/pages/index.astro`.
- If location-specific logic becomes dynamic, the browser-date logic in `src/pages/index.astro` is the place that would need timezone or API-backed rules.
- Because there are no current integrations, adding one later will require introducing both configuration and error handling patterns from scratch.
