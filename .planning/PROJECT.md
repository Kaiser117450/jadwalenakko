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

### Active

- [ ] Admin dapat mengelola master gerai dan status operasionalnya dari database
- [ ] Website publik menampilkan status operasional realtime dari SpacetimeDB tanpa redeploy
- [ ] Admin dapat membuat pengumuman umum maupun pengumuman khusus per periode atau per gerai
- [ ] Sistem tetap menampilkan keadaan normal dengan jelas saat tidak ada libur atau event khusus
- [ ] Akses ubah data dibatasi untuk admin, sementara data publik tetap aman dibaca pengunjung
- [ ] Pengalaman baca status tetap cepat dan jelas di mobile maupun desktop

### Out of Scope

- Pemesanan makanan, checkout, atau delivery flow — bukan tujuan website ini
- Aplikasi mobile native — web publik lebih cepat untuk dikirim dan dikelola
- Multi-brand atau multi-tenant control panel — fokus hanya untuk operasional Enakko saat ini

## Context

Codebase saat ini adalah microsite Astro satu halaman dengan seluruh data jadwal masih hard-coded di `src/pages/index.astro`. Mapping brownfield menunjukkan bahwa UI, data, dan logika tanggal masih menyatu dalam satu file, belum ada backend, belum ada test suite, dan belum ada jalur admin untuk update data.

Secara produk, kebutuhan utamanya bergeser dari "halaman event musiman" menjadi "website pemberitahuan jadwal realtime" yang tetap berguna pada hari normal. Hari tanpa event adalah kondisi paling sering, jadi model datanya tidak boleh menganggap ketiadaan pengumuman sebagai keadaan error; sistem harus punya status normal sebagai state yang sah.

Folder project ini sudah disiapkan untuk SpacetimeDB. Berdasarkan dokumentasi resmi SpacetimeDB terbaru, data publik cocok diekspos melalui tabel atau view publik yang bisa disubscribe secara realtime, sedangkan perubahan data harus lewat reducer transaksional. Ini cocok untuk kebutuhan publik-read/admin-write pada website ini.

Pengguna utama ada dua:
- Pengunjung publik yang hanya ingin tahu apakah gerai buka normal, ada jam khusus, atau ada gerai tertentu yang tutup
- Admin operasional yang perlu mengubah status, jadwal, dan pengumuman secara cepat dari database

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
| Pertahankan website publik yang sudah ada lalu migrasikan datanya ke model realtime | Lebih cepat daripada membangun ulang dari nol, dan UI publik dasar sudah terbukti bekerja | — Pending |
| Status normal dijadikan state data eksplisit, bukan sekadar "tidak ada pengumuman" | Kondisi normal adalah kasus utama dan harus tampil konsisten walau tidak ada event khusus | — Pending |
| Pisahkan jalur baca publik dan jalur ubah admin di level data model | Dokumentasi SpacetimeDB menunjukkan baca publik dan mutasi via reducer adalah pola yang tepat untuk app realtime | — Pending |
| Admin panel dibuat web-first di repo yang sama | Kebutuhan utama adalah kecepatan operasi dan konsistensi data, bukan ekspansi kanal | — Pending |
| Gunakan autentikasi admin yang kompatibel dengan identitas/claim SpacetimeDB | Reducer context dan auth claims SpacetimeDB memberi fondasi untuk pembatasan akses admin | — Pending |

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
*Last updated: 2026-03-23 after initialization*
