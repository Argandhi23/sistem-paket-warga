# SDPR-13 Update - Sinkronisasi Login Frontend ke API Auth

## Ringkasan
Dokumen ini mencatat update terbaru SDPR-13 setelah perubahan besar pada `origin/main`.

Fokus pekerjaan:
- Frontend-only
- Menyesuaikan halaman login agar terhubung ke API auth yang sudah tersedia
- Tidak mengubah layer backend/API

## Perubahan yang Diterapkan
- Integrasi login form dengan `next-auth` Credentials menggunakan `signIn("credentials")`
- Menambahkan state submit (`isSubmitting`) untuk UX loading
- Menambahkan error handling untuk:
  - kredensial salah
  - fallback gangguan server
- Redirect ke callback URL/fallback root saat sukses login

## File Frontend yang Diubah
- `src/app/login/page.tsx`
- `src/components/auth/AuthShell.tsx`
- `src/components/auth/AuthCard.tsx`
- `src/components/auth/AuthInput.tsx`
- `src/components/auth/PasswordField.tsx`
- `src/components/auth/AuthActions.tsx`

## Scope yang Tidak Diubah
- `src/app/api/**`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- Skema database Prisma

## Validasi
- Lint frontend terkait login: PASS
- Build global: masih terdampak issue existing backend (`src/lib/prisma.ts` / export `PrismaClient`)

## Branch dan PR
- Branch: `feat/sdpr-13-login-api-sync-clean`
- PR: `https://github.com/Argandhi23/sistem-paket-warga/pull/2`

## Catatan Kolaborasi
- Komentar Jira dan deskripsi PR tetap menggunakan Bahasa Indonesia sesuai arahan.
