# Project Research Summary

**Project:** Website Pemberitahuan Jadwal Terpadu Enakko
**Domain:** Realtime operational schedule and announcement website
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Executive Summary

Produk ini paling masuk akal dibangun sebagai website Astro yang tetap ringan di sisi publik, dengan SpacetimeDB sebagai pusat state realtime, mutasi admin, dan read model publik. Pola ini cocok dengan kebutuhan inti: admin mengubah status lewat database, lalu pengunjung langsung melihat status operasional terbaru tanpa deploy ulang.

Temuan paling penting adalah bahwa "hari normal" harus dimodelkan sebagai state eksplisit. Jika status default tidak jadi bagian dari model data, produk akan rapuh justru di kasus yang paling sering terjadi. Risiko teknis terbesar berikutnya adalah boundary publik/admin: write path harus dijaga di reducer, sedangkan public page sebaiknya membaca satu view atau query yang sudah diringkas.

Ada satu area yang perlu divalidasi sejak awal: kematangan pilihan server module SpacetimeDB. Dokumen 2.0.0 sekarang menampilkan quickstart TypeScript module, tetapi beberapa halaman resmi lain masih menekankan Rust sebagai jalur server yang paling matang. Karena repo ini sudah berbasis Astro/TypeScript, jalur paling pragmatis adalah memulai dengan scaffold TypeScript module sambil menjaga fallback ke Rust bila tooling lokal tidak mulus.

## Key Findings

### Recommended Stack

Gunakan Astro yang sudah ada untuk website publik dan admin web shell, lalu pindahkan state operasional ke SpacetimeDB. Pakai reducer untuk semua mutasi, public view atau focused public table untuk payload publik, dan `spacetimedb` client package untuk koneksi browser serta binding yang dihasilkan CLI.

**Core technologies:**
- Astro 5.6.x: public/admin web shell - already proven in the repo
- SpacetimeDB 2.0.x: realtime database plus server logic - good fit for reducer-driven ops updates
- `spacetimedb`: client package and generated bindings - current official package
- Tailwind 4.1.x: UI styling - already installed and sufficient

### Expected Features

**Must have (table stakes):**
- Public current status board - users come to get the answer quickly
- Branch-specific open/closed state - ops changes are often partial, not global
- Admin-authenticated CRUD - required to avoid code edits
- Realtime public updates - core product promise
- Explicit normal/default state - the common case must still be informative

**Should have (competitive):**
- Scheduled future announcements - reduce operational friction
- Emergency override - useful for unexpected closures
- Preview and audit trail - helps operators publish safely

**Defer (v2+):**
- Multi-brand support - not needed yet
- Outbound notifications - useful later, not required for launch

### Architecture Approach

Pisahkan sistem menjadi lima bagian: public Astro frontend, admin UI, SpacetimeDB module, public read model, dan auth/identity layer. Data mengalir dari aksi admin ke reducer, reducer menulis state otoritatif, lalu public read model di-subscribe oleh website publik untuk menampilkan status saat ini.

**Major components:**
1. Public website - display current operational status
2. Admin management surface - edit branches, schedules, and announcements
3. SpacetimeDB schema/reducers/views - enforce write rules and emit realtime reads
4. Auth boundary - decide who can mutate data
5. Test and operator-safety layer - reduce publication mistakes

### Critical Pitfalls

1. **Missing explicit normal state** - fix by modeling normal operation in the schema
2. **Public/private leakage** - fix by exposing only a minimal public read model
3. **Auth delayed too long** - fix by reducer-side auth checks in the first backend phase
4. **Browser/database date drift** - fix by defining a canonical operational timezone
5. **Monolithic frontend migration** - fix by decomposing `src/pages/index.astro` during the data migration

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data Model And Access Control
**Rationale:** Everything else depends on normalized branches, explicit operational state, and safe write rules.
**Delivers:** Initial SpacetimeDB schema, reducer guards, auth validation, and branch/status foundations.
**Addresses:** Public/private boundary, admin security, explicit normal-state modeling.
**Avoids:** Insecure CRUD and ambiguous default-state behavior.

### Phase 2: Public Realtime Status Board
**Rationale:** Once the read model is stable, the existing public site can migrate away from hard-coded arrays.
**Delivers:** Public subscriptions or views plus the public Astro page wired to realtime data.
**Uses:** SpacetimeDB subscriptions, generated bindings, current Astro UI shell.
**Implements:** Public website plus public read model.

### Phase 3: Admin Operations Surface
**Rationale:** After the public read path works, admin tooling can safely write into the same model.
**Delivers:** Admin CRUD for branches, announcements, and effective windows.
**Uses:** Authenticated reducers and validated schema.
**Implements:** Admin web interface.

### Phase 4: Scheduling, Safeguards, And Verification
**Rationale:** Once the core loop works, operator polish and regression protection become the main leverage.
**Delivers:** Preview, validation rules, audit trail foundations, test coverage, and timezone hardening.

### Phase Ordering Rationale

- Schema and auth must precede both public and admin UI work.
- Public realtime delivery should land before admin UX expansion so the data contract is proven early.
- Validation and operator safety come after the main loop exists, but before the project is considered trustworthy.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** SpacetimeDB module-language choice and auth-provider choice need validation against the local setup
- **Phase 4:** Timezone policy and audit requirements may need business clarification

Phases with standard patterns:
- **Phase 2:** Public realtime read model and Astro consumption follow documented subscription/view patterns
- **Phase 3:** CRUD admin flows are standard once schema and auth are in place

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official docs are strong, but module-language maturity signals are mixed |
| Features | HIGH | Product need is clear from the user description and brownfield state |
| Architecture | MEDIUM | Core pattern is clear, but auth/module implementation details still need local validation |
| Pitfalls | HIGH | The main failure modes are directly visible from the current app and the official docs |

**Overall confidence:** MEDIUM

### Gaps to Address

- TypeScript-vs-Rust module choice: validate using the actual local SpacetimeDB scaffold during phase planning
- Auth provider choice: confirm whether SpacetimeAuth beta is acceptable or whether another OIDC path is preferred
- Canonical timezone: decide whether operational truth follows Bali time or visitor-local time

## Sources

### Primary (HIGH confidence)
- https://spacetimedb.com/docs/quickstarts/typescript/ - current 2.0.0 TypeScript module quickstart
- https://spacetimedb.com/docs/subscriptions/ - realtime subscription model
- https://spacetimedb.com/docs/functions/views/ - public read-model pattern
- https://spacetimedb.com/docs/how-to/using-auth-claims - reducer-side auth checks
- https://spacetimedb.com/docs/spacetimeauth/ - auth service capabilities and beta warning

### Secondary (MEDIUM confidence)
- https://spacetimedb.com/docs/intro/language-support/ - current language-support positioning
- https://spacetimedb.com/docs/modules/ - cautionary signal on server-module maturity wording
- Existing `.planning/codebase/` documents - brownfield context

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
