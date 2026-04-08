# SDPR-9 - Catatan Prompt dan Response (Untuk Komentar Jira)

Tanggal: 2026-04-08

## Versi Ringkas (siap tempel ke komentar Jira)

Update SDPR-9 (FE):

- Prompt user: "yes seusaikan semua CRUD dengan api, jika ada yang perlu di imporove apinya bikin aja file docsnya"
- Response AI: FE sudah disesuaikan API-first untuk CRUD User dan Rumah (create/list/update/delete + linkage user-rumah), dengan fallback status UI jika endpoint belum siap.

- Prompt user: "coba improvisasi lagi bagian ui management rumah tampilin yang perlu sesuai di @prisma/schema.prisma yang penting saja"
- Response AI: UI Manajemen Hunian ditingkatkan berdasarkan field penting schema (`Rumah.blok`, `Rumah.nomor`, relasi `penghuni`, `createdAt`) termasuk ringkasan statistik, pencarian hunian, dan detail penghuni pada modal.

- Prompt user: "ini kan berdasarkan perumahan/apart"
- Response AI: Terminologi UI disesuaikan menjadi netral perumahan/apartemen (Manajemen Hunian, Blok/Tower, Nomor Rumah/Unit, dan copy terkait).

- Prompt user: "untuk backend coba liat @prisma/schema.prisma terus liat next-auth konfigurasinya udah bener belum sesuaikan berdasarkan semua judul story dan subtasks dari jira"
- Response AI: Dilakukan review alignment backend terhadap Prisma + Jira; dibuat handoff detail ke backend pada:
  `docs/superpowers/updates/2026-04-08-backend-handoff-auth-crud-alignment.md`.

## Versi Detail (jika dibutuhkan)

### Prompt 1
"yes seusaikan semua CRUD dengan api, jika ada yang perlu di imporove apinya bikin aja file docsnya"

### Response 1
- FE user management sekarang API-first:
  - `GET /api/users?role=...&sort=...`
  - `POST /api/users`
  - `PUT /api/users`
  - `DELETE /api/users`
- FE rumah management sekarang API-first:
  - `GET /api/rumah`
  - `POST /api/rumah`
  - `PUT /api/rumah`
  - `DELETE /api/rumah?id=...`
  - `PUT /api/users/link-rumah`
- Dokumen improvement API dibuat pada:
  `docs/superpowers/updates/2026-04-08-sdpr-9-api-improvement-note.md`.

### Prompt 2
"coba improvisasi lagi bagian ui management rumah tampilin yang perlu sesuai di @prisma/schema.prisma yang penting saja"

### Response 2
- UI rumah difokuskan ke data inti schema:
  - identitas hunian (`blok`, `nomor`)
  - relasi penghuni (`User[]`)
  - metadata `createdAt`
- Ditambahkan statistik ringkas, pencarian hunian, dan list penghuni aktif di modal detail hunian.

### Prompt 3
"ini kan berdasarkan perumahan/apart"

### Response 3
- Copy UI disesuaikan konteks perumahan/apartemen:
  - Manajemen Hunian
  - Blok/Tower
  - Nomor Rumah/Unit
  - Tambah Hunian

### Prompt 4
"untuk backend coba liat @prisma/schema.prisma terus liat next-auth konfigurasinya udah bener belum sesuaikan berdasarkan semua judul story dan subtasks dari jira"

### Response 4
- Review alignment NextAuth + schema + Jira sudah dilakukan.
- Gap utama backend yang ditemukan:
  - endpoint CRUD user/rumah belum lengkap
  - hardening auth sesuai SDPR-67 belum complete (password policy, role validation, generic error, rate limit)
- Semua detail teknis dan rekomendasi kontrak API sudah didokumentasikan pada handoff backend.
