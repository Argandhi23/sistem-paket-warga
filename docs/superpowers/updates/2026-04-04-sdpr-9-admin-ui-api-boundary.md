# SDPR-9 Admin UI API Boundary Note

Tanggal: 2026-04-04
Issue: Penyelarasan batas arsitektur pada SDPR-9 (UI vs API)

## Ringkasan

Pada implementasi saat ini, halaman admin untuk manajemen user masih melakukan akses data langsung ke Prisma dari layer page (server component/server action), sehingga belum sepenuhnya mengikuti pola "UI -> API -> DB".

## Temuan Teknis

Bagian yang masih direct Prisma:

- `src/app/admin/warga/page.tsx`
  - import `prisma` dari `@/lib/prisma`
  - query `prisma.user.findMany(...)`
- `src/app/admin/warga/tambah/page.tsx`
  - import `prisma` dari `@/lib/prisma`
  - create `prisma.user.create(...)` di server action

## Dampak

- Layer UI belum konsisten dengan boundary arsitektur yang diinginkan.
- Potensi duplikasi logika validasi/otorisasi jika endpoint API dan server action berjalan paralel.
- Sulit menjaga satu sumber kontrak data bila sebagian flow lewat API, sebagian direct DB.

## Keputusan Scope Saat Ini

- SDPR-9 tetap difokuskan ke **Slicing UI Management Rumah & User** (khusus user lebih dulu, rumah menyusul sesuai arahan).
- Area packages **tidak** dimasukkan ke SDPR-9 agar tidak over-engineering/over-scope.

## Rencana Lanjutan (Setelah Konfirmasi)

Refactor bertahap agar konsisten "UI -> API":

1. `/admin/warga` membaca data lewat endpoint API user.
2. `/admin/warga/tambah` submit ke endpoint API create user.
3. Halaman admin hanya menangani presentasi/state UI, tanpa akses Prisma langsung.

Catatan: hardening akses admin (`require-admin-session`) tetap dipertahankan sebagai defense-in-depth di level route/page.

## Update FE-Only (2026-04-08)

- Sesuai arahan PM, scope agent dibatasi ke frontend saja.
- UI aksi `Edit` dan `Hapus` pada halaman manajemen user kini aktif sebagai frontend interaction
  (modal edit dan konfirmasi hapus).
- Semua aksi tersebut masih mode preview UI: menampilkan validasi/form/status tanpa memanggil endpoint backend,
  sesuai pembagian tugas dengan tim backend (Faqih/Argandhi).
- Tidak ada perubahan pada route API/backend untuk update/delete user di update ini.
