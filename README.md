# Sistem Paket Warga 📦

Sistem Paket Warga adalah aplikasi manajemen logistik internal perumahan/apartemen yang memfasilitasi pencatatan paket masuk oleh petugas keamanan (satpam) dan pengambilan paket oleh warga secara aman, transparan, dan realtime.

---

## 🚀 Tech Stack
- **Framework**: [Next.js 16.2 (App Router)](https://nextjs.org/)
- **Runtime & Library**: React 19, TypeScript
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database Engine**: PostgreSQL (Supabase Connection Pooling & Direct Connections)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: Tailwind CSS & Lucide Icons
- **Realtime Updates**: Supabase Realtime Client Broadcasts
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🛠️ Persyaratan Awal (Prerequisites)
Pastikan Anda sudah menginstal perkakas berikut pada perangkat lokal Anda:
- **Node.js** >= 18.x
- **NPM** atau **Yarn** / **PNPM** / **Bun**
- Database PostgreSQL (Lokal atau Cloud seperti Supabase)

---

## ⚙️ Cara Instalasi & Setup Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek di lingkungan pengembangan lokal:

### 1. Clone Repository & Masuk Direktori
```bash
git clone https://github.com/Argandhi23/sistem-paket-warga.git
cd sistem-paket-warga
```

### 2. Instalasi Dependensi
Instal seluruh package Node.js yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` yang baru dibuat dan sesuaikan nilainya:
- **DATABASE_URL**: URL Connection String PostgreSQL dengan port pooler (contoh Supabase port 6543) dan pgbouncer enabled.
- **DIRECT_URL**: URL Connection String PostgreSQL langsung (direct) untuk migrasi database (contoh Supabase port 5432).
- **NEXTAUTH_SECRET**: Generate token acak yang aman untuk sesi JWT NextAuth.
- **NEXTAUTH_URL**: Atur ke `http://localhost:3000` untuk pengembangan lokal.
- **NEXT_PUBLIC_SUPABASE_URL** & **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Konfigurasi client Supabase untuk fitur realtime listener.

### 4. Sinkronisasi Database (Prisma Migration)
Jalankan migrasi untuk membuat tabel-tabel di database Anda:
```bash
npx prisma migrate dev
```
Setelah migrasi selesai, generate Prisma Client agar TypeScript mengenali tipe data skema:
```bash
npx prisma generate
```

### 5. Seeding Database (Data Contoh)
Gunakan skrip seed untuk mengisi data awal (Admin, Security, Warga, Unit Rumah, dan Log Paket contoh):
```bash
npx prisma db seed
```

---

## 🔑 Kredensial Akun Contoh (Seed Data)
Setelah melakukan seeding, Anda dapat masuk ke aplikasi menggunakan akun berikut (semua akun menggunakan password: `password123`):

| Role | Email | Password | Kegunaan |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@sistem.com` | `password123` | Manajemen User, Rumah, dan Penghapusan Paket |
| **SECURITY** | `security@sistem.com` | `password123` | Pencatatan Paket Masuk & Verifikasi Penyerahan |
| **WARGA (Blok A-1)** | `warga.a@sistem.com` | `password123` | Melihat Paket Sendiri & Histori Denda |
| **WARGA (Blok B-2)** | `warga.b@sistem.com` | `password123` | Melihat Paket Sendiri & Histori Denda |

---

## 🏃 Menjalankan Aplikasi

### Mode Pengembangan (Development)
Menjalankan local development server dengan hot-reloads:
```bash
npm run dev
```
Aplikasi akan online di [http://localhost:3000](http://localhost:3000).

### Menjalankan Uji Coba (Testing)
Proyek ini menggunakan **Vitest** untuk pengujian unit, integrasi role-based access (RBAC), serta isolasi data warga.
```bash
npm test -- --run
```

### Mode Produksi (Production Build)
Untuk melakukan kompilasi proyek dan menjalankannya seperti di server live:
```bash
npm run build
npm run start
```

### Mengakses Prisma Studio (Database Viewer UI)
Untuk melihat isi database PostgreSQL Anda secara visual lewat browser:
```bash
npx prisma studio
```

---

## 📁 Struktur Folder Utama
- `src/app/` - Halaman Next.js App Router (Admin, Security, Warga, API endpoints)
- `src/components/` - Komponen UI reusable (Tabel, Modal, Input, dsb)
- `src/services/` - Lapisan Service/Business Logic utama
- `src/repositories/` - Lapisan Repository untuk manipulasi Prisma Database
- `src/lib/` - Konfigurasi helper seperti Supabase client, auth (NextAuth), logger, dan error-handler.
- `prisma/` - Skema basis data Prisma, migrasi, dan seed data.
