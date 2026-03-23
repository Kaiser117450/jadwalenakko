# Deferred Items

## 2026-03-23

- `npm run build` emits an existing Vite CSS warning from `src/pages/index.astro` about the generated selector `.[file:lines]{file:lines}`. This plan did not touch that file, so the warning remains deferred for a future cleanup pass.
