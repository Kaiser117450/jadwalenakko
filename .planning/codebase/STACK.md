# Stack

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
