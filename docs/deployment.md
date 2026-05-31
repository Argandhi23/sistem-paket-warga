# Panduan Deployment: Supabase & Vercel 🚀

Dokumen ini memandu Anda dalam melakukan setup database Supabase serta men-deploy aplikasi Sistem Paket Warga ke platform Vercel.

---

## Bagian 1: Cara Setup Database di Supabase 🗄️

Supabase digunakan sebagai penyedia database PostgreSQL serta penyedia layanan Realtime Broadcast untuk pembaruan data paket secara instan di sisi warga.

### 1. Buat Proyek Baru
1. Masuk ke [Supabase Dashboard](https://supabase.com/).
2. Klik **New Project** dan pilih organisasi Anda.
3. Masukkan nama proyek (contoh: `sistem-paket-warga`), tentukan kata sandi database (catat kata sandi ini), dan pilih lokasi server terdekat (misalnya: *Singapore*).
4. Klik **Create new project** dan tunggu proses inisiasi server selesai (sekitar 1-2 menit).

### 2. Dapatkan Connection String Database
1. Buka menu **Project Settings** (ikon roda gigi) di pojok kiri bawah, lalu masuk ke tab **Database**.
2. Gulir ke bawah ke bagian **Connection String**.
3. **Penting (Dua Jenis Connection String)**:
   - **DATABASE_URL (Transaction Connection)**:
     - Pilih mode **Transaction** (port `6543`).
     - Pastikan parameter `?pgbouncer=true` disematkan di akhir URL.
     - Contoh: `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **DIRECT_URL (Session Connection)**:
     - Pilih mode **Session** atau dapatkan direct connection langsung (port `5432`).
     - Port ini digunakan untuk sinkronisasi migrasi skema database (Prisma Migration).
     - Contoh: `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

### 3. Aktifkan Fitur Supabase Realtime (Sangat Penting!)
Aplikasi Sistem Paket Warga menggunakan realtime listener untuk mendeteksi perubahan data paket di dashboard secara instan.
1. Di sidebar Supabase, buka menu **Database** (ikon silinder/database).
2. Pilih tab **Replication**.
3. Pada tabel publikasi `supabase_realtime` (atau publikasi default), klik tombol **Source** atau **Tables**.
4. Cari tabel bernama **Package**, lalu aktifkan (toggle ke **Enabled**).
5. Dengan ini, setiap kali satpam melakukan insert atau update paket, Supabase akan memancarkan event perubahan langsung ke aplikasi warga di frontend.

### 4. Dapatkan API Keys untuk Frontend
1. Buka tab **API** di bawah Project Settings.
2. Catat **Project URL** (contoh: `https://[ref].supabase.co`).
3. Catat **anon (public)** key JWT token Anda.
4. Nilai-nilai ini akan dimasukkan ke environment variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Bagian 2: Cara Setup & Deployment di Vercel ⚡

Vercel digunakan sebagai host aplikasi frontend Next.js dan API serverless endpoints.

### 1. Hubungkan Repository GitHub
1. Masuk ke [Vercel Dashboard](https://vercel.com/).
2. Klik **Add New...** -> **Project**.
3. Pilih repository GitHub Anda yang berisi kode `sistem-paket-warga` dan klik **Import**.

### 2. Konfigurasi Environment Variables
Di panel **Configure Project**, buka tab **Environment Variables** lalu tambahkan variabel berikut satu per satu sesuai dengan konfigurasi Supabase Anda:

| Key | Value (Contoh) | Catatan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@pooler.supabase.com:6543/postgres?pgbouncer=true` | URL Supabase Transaction (Port 6543) |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pass]@pooler.supabase.com:5432/postgres` | URL Supabase Direct (Port 5432) |
| `NEXTAUTH_SECRET` | `rahasia-token-acak-minimal-32-karakter` | Jalankan `openssl rand -base64 32` untuk membuatnya |
| `NEXTAUTH_URL` | `https://sistem-paket-warga.vercel.app` | Ganti dengan URL domain Vercel Anda setelah online |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI...` | Supabase Anon Key |
| `CRON_SECRET` | `token-cron-pribadi-bebas` | Token autentikasi untuk memicu cron job lokal / Vercel |
| `PACKAGE_EXPIRY_DAYS` | `3` | Jumlah batas hari sebelum paket dianggap kadaluarsa |

### 3. Jalankan Deploy
1. Pada **Build and Development Settings**, biarkan default (Vercel otomatis mendeteksi Next.js).
2. Klik tombol **Deploy**.
3. Vercel akan mengunduh kode, melakukan instalasi dependensi, menjalankan type-checking, memproses Prisma generate, membangun halaman statis, dan mempublikasikan aplikasi Anda secara langsung.

### 4. Setup Cron Job otomatis
Berkas konfigurasi `vercel.json` di dalam proyek sudah mendefinisikan cron job berikut:
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-packages",
      "schedule": "0 0 * * *"
    }
  ]
}
```
Cron job ini akan dijalankan otomatis oleh Vercel setiap tengah malam (pukul 00:00 UTC) untuk mengubah status paket yang sudah lewat batas `PACKAGE_EXPIRY_DAYS` menjadi `EXPIRED`.
- **Langkah Aktivasi**: Setelah deploy berhasil, masuk ke menu **Settings** -> **Cron Jobs** di dashboard proyek Vercel Anda, lalu verifikasi bahwa cron job `/api/cron/expire-packages` sudah terdaftar dan berstatus aktif.
