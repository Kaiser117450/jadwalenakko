# Structure

## Top-Level Layout
- `src/` contains application source code.
- `public/` contains static assets served as-is.
- `dist/` contains generated build output and is ignored by `.gitignore`.
- `.astro/` contains Astro working artifacts and is ignored by `.gitignore`.
- `node_modules/` contains installed dependencies and is ignored by `.gitignore`.

## Source Tree
- `src/pages/index.astro` is the only application page and the effective application root.
- There are no `src/components/`, `src/layouts/`, `src/lib/`, or `src/content/` directories yet.
- Because there is only one route file, route structure is currently flat.

## Asset Tree
- `public/logo.png` stores the logo used in the hero and end screen.
- `public/Digitalt.ttf` stores the display font loaded through `@font-face`.
- Asset naming is short and direct rather than namespaced or versioned.

## Project Configuration Files
- `package.json` defines package metadata and scripts.
- `package-lock.json` pins dependency resolution.
- `astro.config.mjs` configures Astro's Vite plugin list.
- `tsconfig.json` inherits Astro strict TypeScript defaults.
- `.gitignore` excludes generated directories only.

## Naming Patterns
- Page routing follows Astro conventions, where `src/pages/index.astro` maps to `/`.
- Source identifiers in `src/pages/index.astro` use camelCase such as `allBranches`, `limitedOpenBranches`, and `currentDateLabel`.
- Schedule entry fields also use camelCase, for example `displayDate`, `bannerMessage`, `openBranches`, and `closedBranches`.
- DOM hook IDs are descriptive and page-specific, such as `schedule-content`, `status-shell`, and `end-screen`.

## Organization Characteristics
- Data constants are placed at the top of `src/pages/index.astro`.
- Presentation markup occupies the middle of the file.
- Browser behavior is appended at the end of the file in an inline script.
- Styling is colocated with the page through an inline global style block.

## Generated Vs Maintained Files
- The maintained codebase is effectively the tracked files returned by `git ls-files`.
- `dist/` and `.astro/` are generated and should not be treated as hand-maintained architecture.
- There is no test directory, CI configuration, or documentation directory outside the generated `.planning/codebase/` map.

## Practical Read Path
- Start with `package.json` to understand tooling.
- Read `astro.config.mjs` and `tsconfig.json` for framework configuration.
- Read `src/pages/index.astro` for almost all product logic.
- Read `public/` assets last because they support branding rather than behavior.
