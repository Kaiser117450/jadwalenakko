<!-- GSD:project-start source:PROJECT.md -->
## Project

**Website Pemberitahuan Jadwal Terpadu Enakko**

Website ini adalah papan pemberitahuan jadwal operasional terpadu untuk Ayam Guling Enakko. Pengunjung harus bisa langsung melihat status operasional yang berlaku saat ini, dan admin harus bisa mengubah jadwal normal, pengumuman khusus, atau penutupan beberapa gerai melalui database tanpa perlu edit kode atau deploy ulang.

**Core Value:** Status operasional yang tampil ke publik harus selalu cepat dibaca dan mudah diperbarui oleh admin saat kondisi lapangan berubah.

### Constraints

- **Tech stack**: Pertahankan Astro/Tailwind sebagai basis frontend brownfield — sudah ada UI publik yang bisa dievolusi
- **Dependency**: Gunakan project SpacetimeDB yang sudah diinisialisasi sebagai source of truth data operasional — user sudah menentukan arah ini
- **Realtime**: Perubahan status harus bisa tampil ke publik tanpa edit file statis dan tanpa rebuild manual — ini inti kebutuhan baru
- **Access control**: Jalur tulis data harus dibatasi ke admin, sedangkan konsumsi data publik harus aman untuk visitor — mencegah perubahan liar
- **Product behavior**: "Normal / tidak ada event" adalah skenario default yang paling sering terjadi — model data dan UI harus mengutamakan kasus ini
- **Brownfield scope**: Struktur satu-file di `src/pages/index.astro` perlu dipecah bertahap, bukan dirombak membabi buta dalam satu langkah — supaya migrasi tetap terkendali
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Snapshot
- Project type: static Astro site for an operational schedule microsite.
- Primary entry point: `src/pages/index.astro`.
- Package manager state is recorded in `package-lock.json`.
- Source assets are served from `public/`.
## Languages
- JavaScript runs in Astro frontmatter and the inline browser script inside `src/pages/index.astro`.
- HTML markup is authored inside the Astro page template in `src/pages/index.astro`.
- CSS is authored inline in the same Astro file through `<style is:global>`.
- TypeScript is configured indirectly through `tsconfig.json`, even though the current source file is `.astro` rather than `.ts`.
## Runtime And Frameworks
- Astro is the site framework, declared in `package.json`.
- The project uses ESM mode via `"type": "module"` in `package.json`.
- Astro strict TypeScript defaults are enabled with `"extends": "astro/tsconfigs/strict"` in `tsconfig.json`.
- The runtime target is a Node-based Astro build and preview workflow exposed through `npm` scripts in `package.json`.
## Styling Stack
- Tailwind CSS v4 is installed through `tailwindcss` in `package.json`.
- Tailwind is wired into Vite through `@tailwindcss/vite` in `astro.config.mjs`.
- Tailwind utilities are used directly in markup in `src/pages/index.astro`.
- Global CSS variables and keyframes are also defined inline in `src/pages/index.astro`.
- A custom font file lives at `public/Digitalt.ttf` and is loaded with `@font-face`.
## Build And Dev Tooling
- `npm run dev` and `npm start` both launch `astro dev` from `package.json`.
- `npm run build` runs `astro build`.
- `npm run preview` runs `astro preview`.
- Astro build output is written to `dist/`, which is ignored by `.gitignore`.
- Astro working files are written to `.astro/`, which is also ignored by `.gitignore`.
## Content And Data Model
- Schedule content is hard-coded as JavaScript arrays in `src/pages/index.astro`.
- Branch lists such as `allBranches`, `limitedOpenBranches`, and `limitedClosedBranches` are declared once and reused.
- Daily schedule entries are normalized with `.map(...)` in `src/pages/index.astro` to add `dayNumber`, `openCount`, and `closedCount`.
## Configuration Surface
- `astro.config.mjs` only configures the Tailwind Vite plugin.
- `tsconfig.json` only extends the Astro strict preset.
- No `.env`, adapter config, deployment config, lint config, formatter config, or test config is present in tracked files.
## Operational Implications
- The stack is intentionally minimal and easy to host as a static site.
- Most project behavior is concentrated in one file, `src/pages/index.astro`, rather than being distributed across modules.
- Any future backend, CMS, or API integration would require new configuration because none exists today.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

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
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Summary
- The application is a single-route static Astro site.
- Nearly all behavior lives in one file: `src/pages/index.astro`.
- The page combines content data, presentational markup, global styles, and client-side enhancement in a single module.
## Main Building Blocks
- Frontmatter in `src/pages/index.astro` defines branch lists and the full schedule dataset.
- The same frontmatter derives presentation helpers with `.map(...)`, adding `dayNumber`, `openCount`, and `closedCount`.
- The HTML body in `src/pages/index.astro` renders the hero, status panel, schedule cards, and post-event end screen.
- Global CSS in `<style is:global>` handles theme variables, font loading, animation, and base page styling.
- A client-side `<script>` at the end of `src/pages/index.astro` applies runtime behavior after the page loads in the browser.
## Data Flow
- Static schedule records are declared in frontmatter in `src/pages/index.astro`.
- Astro renders those records into repeated schedule cards through `schedule.map(...)`.
- The same `schedule` array is serialized into the `#schedule-data` script tag in `src/pages/index.astro`.
- The browser script parses that JSON payload and compares each entry against the visitor's current local date.
- Runtime DOM updates then set the status banner, apply tone classes, reveal the "Hari Ini" chip, and optionally swap to the `#end-screen`.
## Rendering Model
- Initial markup is server-rendered or statically generated by Astro from `src/pages/index.astro`.
- The page does not use Astro islands, React, Vue, or component hydration.
- Client logic is plain browser JavaScript embedded inline in the page.
- The site can be served as static files after `astro build`.
## Routing
- `src/pages/index.astro` maps to the root route `/`.
- No additional pages, nested routes, API routes, layouts, or content collections are present in tracked source files.
## State Management
- There is no global store or shared module state.
- State is derived locally from the hard-coded schedule array and the current browser date.
- DOM state is mutated imperatively through `classList` and `textContent` in the inline script.
## Architectural Strengths
- The architecture is easy to reason about because there is only one source page.
- Build complexity is low because there are no adapters, endpoints, or framework islands.
- Deployment should be straightforward as a static artifact from `dist/`.
## Architectural Constraints
- The current design couples data, UI, and runtime logic tightly inside `src/pages/index.astro`.
- Reuse is low because there are no extracted components, utilities, or content modules.
- Any new page or richer feature will likely require refactoring before the codebase scales cleanly.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
