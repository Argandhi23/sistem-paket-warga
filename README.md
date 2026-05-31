# 📦 Sistem Paket Warga

Sistem Paket Warga adalah aplikasi manajemen logistik internal perumahan/apartemen yang memfasilitasi pencatatan paket masuk oleh petugas keamanan (satpam) dan pengambilan paket oleh warga secara **aman**, **transparan**, dan **realtime**.

> **Project**: Sistem Distribusi Paket Rumahan (SDPR)
> **Role**: Backend Developer
> **Stack**: Next.js · Prisma · Supabase · PostgreSQL · NextAuth.js

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Persyaratan Awal](#️-persyaratan-awal-prerequisites)
- [Cara Instalasi & Setup Lokal](#️-cara-instalasi--setup-lokal)
- [Environment Variables](#-environment-variables)
- [Kredensial Akun Contoh](#-kredensial-akun-contoh-seed-data)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Testing](#-menjalankan-uji-coba-testing)
- [Deployment ke Vercel](#-deployment-ke-vercel)
- [Struktur Folder](#-struktur-folder-utama)
- [Arsitektur & Aturan Pengembangan](#-arsitektur--aturan-pengembangan)

---

## 🚀 Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router) |
| **Runtime & Library** | React 19, TypeScript |
| **Database ORM** | [Prisma](https://www.prisma.io/) |
| **Database Engine** | PostgreSQL via [Supabase](https://supabase.com/) (Connection Pooling & Direct) |
| **Autentikasi** | [NextAuth.js](https://next-auth.js.org/) + JWT |
| **Styling** | Tailwind CSS & Lucide Icons |
| **Realtime** | Supabase Realtime Client Broadcasts |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 🛠️ Persyaratan Awal (Prerequisites)

Pastikan sudah menginstal perkakas berikut sebelum memulai:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **NPM** >= 9.x (sudah termasuk dalam Node.js)
- **Git** — [Download](https://git-scm.com/)
- Akun **Supabase** (gratis) — [Daftar di sini](https://supabase.com/)

Cek versi Node.js yang terinstal:
```bash
node -v   # harus >= 18.x
npm -v    # harus >= 9.x
```

---

## ⚙️ Cara Instalasi & Setup Lokal

Ikuti langkah-langkah berikut secara berurutan:

### 1. Clone Repository & Masuk Direktori

```bash
git clone https://github.com/Argandhi23/sistem-paket-warga.git
cd sistem-paket-warga
```

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin file template `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` yang baru dibuat, lalu isi setiap variabel sesuai dengan konfigurasi Supabase dan project kamu. Lihat panduan lengkap di bagian [Environment Variables](#-environment-variables) di bawah.

### 4. Sinkronisasi Database (Prisma Migration)

Jalankan migrasi untuk membuat seluruh tabel di database:

```bash
npx prisma migrate dev
```

Generate Prisma Client agar TypeScript mengenali tipe data dari skema:

```bash
npx prisma generate
```

### 5. Seeding Database (Data Awal)

Isi database dengan data contoh (akun Admin, Security, Warga, Unit Rumah, dan paket dummy):

```bash
npx prisma db seed
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🔐 Environment Variables

Berikut adalah seluruh variabel yang dibutuhkan di file `.env`:

```dotenv
# ============================================================
# DATABASE — Supabase PostgreSQL
# ============================================================

# Connection pooling via PgBouncer (digunakan oleh Prisma Client / runtime)
# Port: 6543 | Tambahkan ?pgbouncer=true di akhir URL
DATABASE_URL="postgresql://username:password@pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (digunakan khusus untuk prisma migrate)
# Port: 5432
DIRECT_URL="postgresql://username:password@db.supabase.com:5432/postgres"

# ============================================================
# NEXTAUTH — Autentikasi
# ============================================================

# Generate dengan: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-key-at-least-32-chars"

# URL aplikasi (lokal: http://localhost:3000 | production: https://domain-kamu.vercel.app)
NEXTAUTH_URL="http://localhost:3000"

# ============================================================
# SUPABASE CLIENT — Realtime & Client-side
# ============================================================

NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# ============================================================
# CRON JOB — Vercel Cron Authentication
# ============================================================

# Untuk testing lokal, isi bebas. Di production, Vercel set ini otomatis.
CRON_SECRET="your-local-cron-secret"

# ============================================================
# KONFIGURASI APLIKASI
# ============================================================

# Batas hari sebelum paket dianggap kadaluarsa dan dikenakan denda
PACKAGE_EXPIRY_DAYS=3
```

> **Tips:** Nilai `DATABASE_URL` dan `DIRECT_URL` bisa didapat dari dashboard Supabase → **Project Settings** → **Database** → **Connection String**.
> Untuk generate `NEXTAUTH_SECRET`, jalankan perintah ini di terminal:
> ```bash
> openssl rand -base64 32
> ```

---

## 🔑 Kredensial Akun Contoh (Seed Data)

Setelah menjalankan `npx prisma db seed`, gunakan akun berikut untuk login:

| Role | Email | Password | Akses |
|---|---|---|---|
| **ADMIN** | `admin@sistem.com` | `password123` | Manajemen User, Rumah, dan Penghapusan Paket |
| **SECURITY** | `security@sistem.com` | `password123` | Pencatatan Paket Masuk & Verifikasi Penyerahan |
| **WARGA (Blok A-1)** | `warga.a@sistem.com` | `password123` | Melihat Paket Sendiri & Histori Denda |
| **WARGA (Blok B-2)** | `warga.b@sistem.com` | `password123` | Melihat Paket Sendiri & Histori Denda |

> ⚠️ **Jangan gunakan kredensial ini di environment production.**

---

## 🏃 Menjalankan Aplikasi

### Mode Pengembangan (Development)

```bash
npm run dev
```

Server berjalan di [http://localhost:3000](http://localhost:3000) dengan hot-reload aktif.

### Mode Produksi (Production Build)

```bash
npm run build   # Kompilasi & optimasi project
npm run start   # Jalankan hasil build
```

### Mengakses Database secara Visual (Prisma Studio)

```bash
npx prisma studio
```

Buka browser di [http://localhost:5555](http://localhost:5555) untuk melihat dan mengedit data langsung.

---

## 🧪 Menjalankan Uji Coba (Testing)

Project ini menggunakan **Vitest** untuk pengujian unit dan integrasi, mencakup:
- Role-Based Access Control (RBAC)
- Isolasi data antar warga
- Kalkulasi denda keterlambatan (Penalty)

Jalankan seluruh test suite:

```bash
npm test -- --run
```

Jalankan dalam mode watch (otomatis re-run saat file berubah):

```bash
npm test
```

> ✅ Pastikan semua test pass sebelum melakukan commit atau pull request.

---

## ☁️ Deployment ke Vercel

Sebelum deploy, pastikan sudah menyelesaikan setup **Supabase khusus production** (project terpisah dari development).

### Langkah-langkah Deploy:

1. **Push repository** ke GitHub (jika belum).

2. **Buka [vercel.com](https://vercel.com)** → **New Project** → Import repository GitHub ini.

3. **Isi Environment Variables** di dashboard Vercel (Settings → Environment Variables), masukkan semua variabel dari `.env` dengan nilai production:
   - `DATABASE_URL` → gunakan pooler URL Supabase production
   - `DIRECT_URL` → gunakan direct URL Supabase production
   - `NEXTAUTH_SECRET` → generate baru yang aman
   - `NEXTAUTH_URL` → URL Vercel kamu (contoh: `https://sistem-paket-warga.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL` → URL project Supabase production
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Anon key Supabase production
   - `CRON_SECRET` → Vercel akan set ini otomatis
   - `PACKAGE_EXPIRY_DAYS` → `3` (atau sesuai kebutuhan)

4. **Klik Deploy** dan tunggu proses build selesai.

5. Setelah deploy berhasil, jalankan migrasi ke database production:
   ```bash
   npx prisma migrate deploy
   ```

---

## 📁 Struktur Folder Utama

```
sistem-paket-warga/
├── prisma/
│   ├── schema.prisma       # Definisi skema database
│   ├── migrations/         # Riwayat migrasi database
│   └── seed.ts             # Script data awal (seed)
│
├── src/
│   ├── app/                # Halaman Next.js App Router
│   │   ├── admin/          # Halaman & API untuk role ADMIN
│   │   ├── security/       # Halaman & API untuk role SECURITY
│   │   ├── warga/          # Halaman & API untuk role WARGA
│   │   └── api/            # API route handlers (Next.js)
│   │
│   ├── components/         # Komponen UI reusable
│   │   ├── ui/             # Komponen dasar (Button, Input, Modal, dsb)
│   │   ├── admin/          # Komponen khusus halaman Admin
│   │   └── modal/          # Komponen modal/dialog
│   │
│   ├── services/           # Business Logic & Service Layer
│   ├── repositories/       # Data Access Layer (query Prisma)
│   └── lib/                # Helper & konfigurasi global
│       ├── supabase.ts     # Supabase client (Realtime)
│       ├── auth.ts         # Konfigurasi NextAuth
│       ├── logger.ts       # Logger utility
│       └── error-handler.ts
│
├── .env.example            # Template environment variables
├── .env                    # Environment variables lokal (jangan di-commit!)
└── README.md
```

---

## 🏛️ Arsitektur & Aturan Pengembangan

Proyek ini mengikuti pola arsitektur **Repository–Service–Controller** agar kode tetap terorganisir dan mudah di-test.

### Aturan Wajib:

- **Service Layer** (`src/services/`) — Semua business logic (kalkulasi denda, pengecekan expiry, validasi otorisasi) **harus** ditempatkan di sini.
- **Repository Layer** (`src/repositories/`) — Semua query database menggunakan Prisma **harus** ditulis di sini. Jangan query Prisma langsung dari route handler.
- **Type Safety** — Semua object dan field baru **harus** memiliki tipe TypeScript yang lengkap. Tidak boleh ada `any`.
- **Realtime** — Fitur update list paket menggunakan Supabase Realtime Broadcast. Perubahan yang berdampak pada list paket harus mempertimbangkan trigger realtime.

---

## 🤝 Kontribusi

1. Buat branch baru dari `main`: `git checkout -b feat/nama-fitur`
2. Commit dengan pesan yang deskriptif: `git commit -m "feat: tambah fitur export data"`
3. Push dan buat Pull Request ke branch `main`
4. Pastikan semua test pass sebelum meminta review

---

*Dokumentasi ini dibuat untuk keperluan pengembangan project **Sistem Distribusi Paket Rumahan (SDPR)** — Kelompok RPL.*