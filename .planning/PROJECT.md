# Website Pemberitahuan Jadwal Terpadu Enakko

## What This Is

Website ini adalah papan pemberitahuan jadwal operasional terpadu untuk Ayam Guling Enakko. Pengunjung harus bisa langsung melihat status operasional yang berlaku saat ini, dan admin harus bisa mengubah jadwal normal, pengumuman khusus, atau penutupan beberapa gerai melalui database tanpa perlu edit kode atau deploy ulang.

## Core Value

Status operasional yang tampil ke publik harus selalu cepat dibaca dan mudah diperbarui oleh admin saat kondisi lapangan berubah.

## Requirements

### Validated

- ✓ Pengunjung dapat melihat halaman publik jadwal operasional yang terbrand untuk Enakko — existing
- ✓ Halaman dapat menyorot status hari ini berdasarkan tanggal browser pengunjung — existing
- ✓ Halaman dapat menampilkan status normal, terbatas, setengah hari, atau tutup total lengkap dengan daftar gerai buka/tutup — existing
- ✓ Branch master data dan baseline status operasional sekarang sudah dimodelkan di fondasi SpacetimeDB repo ini — validated in Phase 1
- ✓ Akses ubah data operasional sekarang dibatasi di level reducer admin-only dengan validasi claim terpusat — validated in Phase 1
- ✓ Jalur baca publik sudah dipersempit ke kontrak read model yang aman untuk integrasi frontend berikutnya — validated in Phase 1
- ✓ Website publik sekarang menampilkan status operasional realtime dari SpacetimeDB tanpa redeploy — validated in Phase 2
- ✓ Sistem sekarang tetap menampilkan keadaan normal dengan jelas saat tidak ada libur atau event khusus — validated in Phase 2

### Active

- [ ] Admin dapat mengelola master gerai dan status operasionalnya dari database
- [ ] Admin dapat membuat pengumuman umum maupun pengumuman khusus per periode atau per gerai
- [ ] Pengalaman baca status tetap cepat dan jelas di mobile maupun desktop

### Out of Scope

- Pemesanan makanan, checkout, atau delivery flow — bukan tujuan website ini
- Aplikasi mobile native — web publik lebih cepat untuk dikirim dan dikelola
- Multi-brand atau multi-tenant control panel — fokus hanya untuk operasional Enakko saat ini

## Context

Codebase ini bermula sebagai microsite Astro satu halaman dengan seluruh data jadwal hard-coded di `src/pages/index.astro`. Brownfield migration sekarang sudah memindahkan jalur baca publik ke SpacetimeDB realtime, tetapi surface admin, scheduling rules, dan hardening lintas-device masih menjadi pekerjaan fase berikutnya.

Secara produk, kebutuhan utamanya bergeser dari "halaman event musiman" menjadi "website pemberitahuan jadwal realtime" yang tetap berguna pada hari normal. Hari tanpa event adalah kondisi paling sering, jadi model datanya tidak boleh menganggap ketiadaan pengumuman sebagai keadaan error; sistem harus punya status normal sebagai state yang sah.

Folder project ini sudah disiapkan untuk SpacetimeDB. Berdasarkan dokumentasi resmi SpacetimeDB terbaru, data publik cocok diekspos melalui tabel atau view publik yang bisa disubscribe secara realtime, sedangkan perubahan data harus lewat reducer transaksional. Ini cocok untuk kebutuhan publik-read/admin-write pada website ini.

Pengguna utama ada dua:
- Pengunjung publik yang hanya ingin tahu apakah gerai buka normal, ada jam khusus, atau ada gerai tertentu yang tutup
- Admin operasional yang perlu mengubah status, jadwal, dan pengumuman secara cepat dari database

## Current State

Phase 2 selesai pada 2026-03-23. Repo sekarang punya fondasi SpacetimeDB yang konkret dari Phase 1 plus homepage publik yang sudah membaca `publicCurrentStatus` secara live melalui `src/lib/spacetimedb/public-status-client.ts` dan `src/lib/public-status/view-model.ts`.

`src/pages/index.astro` tidak lagi menyimpan array jadwal hard-coded sebagai source of truth. Halaman publik sekarang merender state loading, normal, special, dan unavailable dari kontrak read model yang dipublish, dan aturan mapping intinya sudah dicakup oleh `tests/public-status-view-model.test.mjs`.

## Constraints

- **Tech stack**: Pertahankan Astro/Tailwind sebagai basis frontend brownfield — sudah ada UI publik yang bisa dievolusi
- **Dependency**: Gunakan project SpacetimeDB yang sudah diinisialisasi sebagai source of truth data operasional — user sudah menentukan arah ini
- **Realtime**: Perubahan status harus bisa tampil ke publik tanpa edit file statis dan tanpa rebuild manual — ini inti kebutuhan baru
- **Access control**: Jalur tulis data harus dibatasi ke admin, sedangkan konsumsi data publik harus aman untuk visitor — mencegah perubahan liar
- **Product behavior**: "Normal / tidak ada event" adalah skenario default yang paling sering terjadi — model data dan UI harus mengutamakan kasus ini
- **Brownfield scope**: Struktur satu-file di `src/pages/index.astro` perlu dipecah bertahap, bukan dirombak membabi buta dalam satu langkah — supaya migrasi tetap terkendali

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pertahankan website publik yang sudah ada lalu migrasikan datanya ke model realtime | Lebih cepat daripada membangun ulang dari nol, dan UI publik dasar sudah terbukti bekerja | Phase 1 validated the brownfield path by keeping the Astro page intact while moving new source-of-truth contracts into SpacetimeDB |
| Status normal dijadikan state data eksplisit, bukan sekadar "tidak ada pengumuman" | Kondisi normal adalah kasus utama dan harus tampil konsisten walau tidak ada event khusus | Validated in Phase 1 through the explicit `normal` status kind and seeded normal baseline |
| Pisahkan jalur baca publik dan jalur ubah admin di level data model | Dokumentasi SpacetimeDB menunjukkan baca publik dan mutasi via reducer adalah pola yang tepat untuk app realtime | Validated in Phase 1 through guarded reducers and the `publicCurrentStatus` read model |
| Gunakan prepared public-status view model di antara kontrak realtime dan render Astro | Halaman publik perlu menerima data yang sudah siap tampil, supaya `index.astro` tidak kembali menjadi tempat business rules operasional | Validated in Phase 2 through `src/lib/public-status/view-model.ts` and the live homepage migration |
| Gunakan presentation state eksplisit untuk board publik (`loading`, `ready-normal`, `ready-special`, `unavailable`) | Keadaan normal dan unavailable harus sama jelasnya dengan event khusus, dan perlu satu kontrak yang juga bisa dites | Validated in Phase 2 through the shared view-model contract and lightweight `node:test` coverage |
| Admin panel dibuat web-first di repo yang sama | Kebutuhan utama adalah kecepatan operasi dan konsistensi data, bukan ekspansi kanal | — Pending |
| Gunakan autentikasi admin yang kompatibel dengan identitas/claim SpacetimeDB | Reducer context dan auth claims SpacetimeDB memberi fondasi untuk pembatasan akses admin | Validated in Phase 1 through issuer, audience, and admin-allowlist claim checks at reducer boundaries |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 2 completion*
