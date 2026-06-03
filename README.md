# 📦 Sistem Paket Warga

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-123a50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-76b900?style=for-the-badge&logo=vitest)](https://vitest.dev/)

**Sistem Paket Warga** adalah aplikasi manajemen logistik internal perumahan/apartemen yang memfasilitasi pencatatan paket masuk oleh petugas keamanan (satpam) dan pengambilan paket oleh warga secara **aman**, **transparan**, dan **realtime**.

Aplikasi ini dibangun untuk meminimalkan penumpukan paket di pos satpam, mempermudah pelacakan status paket, serta memberikan transparansi denda keterlambatan jika paket tidak diambil dalam batas waktu yang ditentukan.

> 📝 **Informasi Project**
> - **Nama Proyek**: Sistem Distribusi Paket Rumahan (SDPR) - Kelompok RPL
> - **Peran**: Backend Developer & UI Engineer
> - **Teknologi Utama**: Next.js · Prisma · Supabase · PostgreSQL · NextAuth.js · Tailwind CSS v4

---

## 📋 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🖼️ Dokumentasi Visual (Tangkapan Layar)](#️-dokumentasi-visual-tangkapan-layar)
- [🏛️ Arsitektur & Pola Pengembangan](#️-arsitektur--pola-pengembangan)
- [🛠️ Persyaratan Awal (Prerequisites)](#️-persyaratan-awal-prerequisites)
- [⚙️ Cara Instalasi & Setup Lokal](#️-cara-instalasi--setup-lokal)
- [🔐 Environment Variables](#-environment-variables)
- [🔑 Kredensial Akun Contoh (Seed Data)](#-kredensial-akun-contoh-seed-data)
- [🧪 Hasil Uji Coba (Quality Assurance)](#-hasil-uji-coba-quality-assurance)
- [☁️ Deployment ke Vercel](#-deployment-ke-vercel)
- [📁 Struktur Folder Utama](#-struktur-folder-utama)

---

## ✨ Fitur Utama

- 🔐 **Role-Based Access Control (RBAC)**: Pembagian akses spesifik untuk Admin, Petugas Keamanan (Security), dan Warga.
- ⚡ **Realtime Broadcast**: Warga menerima notifikasi langsung di dashboard mereka saat ada paket baru didaftarkan satpam, tanpa harus me-refresh halaman.
- 💰 **Kalkulasi Denda Otomatis**: Menghitung denda secara otomatis (misal: Rp 2.000 / hari) setelah paket mengendap melebihi batas waktu gratis (default: 3 hari).
- 🔍 **Autokomplet Pencarian Unit**: Mencegah kesalahan input oleh satpam dengan mencocokkan nomor unit warga yang terdaftar.
- 🛡️ **Keamanan API**: Dilengkapi proteksi IDOR (*Insecure Direct Object Reference*); warga hanya dapat mengakses data paket miliknya sendiri.

---

## 🖼️ Dokumentasi Visual (Tangkapan Layar)

Berikut adalah beberapa tampilan halaman dari Sistem Paket Warga:

<details>
  <summary>🔑 <b>Halaman Login (Multi-Role Auth)</b></summary>
  <br/>
  <p align="center">
    <img src="./screenshots/login_page.png" alt="Halaman Login" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

<details>
  <summary>📊 <b>Dashboard Admin (Manajemen Master Data)</b></summary>
  <br/>
  <p align="center">
    <img src="./screenshots/admin_dashboard.png" alt="Dashboard Admin" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

<details>
  <summary>🛡️ <b>Dashboard Security & Alur Registrasi Paket</b></summary>
  <br/>
  <h4>1. Daftar Paket & Aksi Serah Terima (Handover)</h4>
  <p align="center">
    <img src="./screenshots/security_dashboard.png" alt="Dashboard Security" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
  <br/>
  <h4>2. Form Registrasi Paket Baru</h4>
  <p align="center">
    <img src="./screenshots/security_form_empty.png" alt="Form Registrasi Paket Kosong" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
  <br/>
  <h4>3. Deteksi Unit Tidak Valid (Mencegah Salah Input)</h4>
  <p align="center">
    <img src="./screenshots/security_form_invalid_unit.png" alt="Validasi Unit Tidak Ditemukan" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
  <br/>
  <h4>4. Unit Warga Valid & Terdaftar</h4>
  <p align="center">
    <img src="./screenshots/security_form_filled.png" alt="Form Terisi Valid" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

<details>
  <summary>🏡 <b>Dashboard Warga (Riwayat & Denda)</b></summary>
  <br/>
  <p align="center">
    <img src="./screenshots/warga_dashboard.png" alt="Dashboard Warga" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

---

## 🏛️ Arsitektur & Pola Pengembangan

Proyek ini menggunakan pola arsitektur **Repository–Service–Controller (Next.js Routes)** untuk menjaga kode tetap modular, modularitas tinggi, dan mudah diuji secara independen.

```mermaid
graph TD
    Client[Browser / Client UI] -->|API Routes / Components| Controller[Controller / Next.js API Routes]
    Controller -->|Validation & Auth| Service[Service Layer - Business Logic]
    Service -->|Data Query Mapping| Repository[Repository Layer]
    Repository -->|Database Operations| Prisma[Prisma ORM Client]
    Prisma -->|Direct / Connection Pooling| DB[(Supabase PostgreSQL)]
    DB -.->|Supabase Broadcast Realtime| Client
```

### Aturan Pengembangan:
*   **Service Layer** (`src/services/`): Semua aturan bisnis (seperti kalkulasi denda, validasi otorisasi, logika masa kadaluarsa) **wajib** ditempatkan di sini.
*   **Repository Layer** (`src/repositories/`): Seluruh query database menggunakan Prisma **wajib** ditulis di sini. Hindari memanggil query Prisma secara langsung di route handler.
*   **Type Safety**: Keharusan menggunakan tipe TypeScript yang lengkap tanpa menggunakan tipe `any`.

---

## 🛠️ Persyaratan Awal (Prerequisites)

Sebelum memulai development, pastikan Anda telah memasang modul-modul berikut:

- **Node.js** (Versi `>= 18.x` disarankan)
- **NPM** (Versi `>= 9.x` atau package manager alternatif seperti Yarn/Bun)
- **Git**
- Akun dan project **Supabase** aktif.

Verifikasi kesiapan environment Anda dengan perintah:
```bash
node -v   # Output disarankan >= 18.x
npm -v    # Output disarankan >= 9.x
```

---

## ⚙️ Cara Instalasi & Setup Lokal

Ikuti petunjuk di bawah untuk menyiapkan server lokal Anda:

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
Salin berkas template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Buka berkas `.env` dan lengkapi konfigurasi database serta kredensial Supabase Anda (lihat bagian [Environment Variables](#-environment-variables)).

### 4. Sinkronisasi Database (Prisma Migration)
Jalankan migrasi database untuk membuat tabel:
```bash
npx prisma migrate dev
```
Kompilasi Prisma Client untuk mengenali definisi skema pada TypeScript:
```bash
npx prisma generate
```

### 5. Seeding Database (Data Awal)
Isi database lokal/staging dengan data pengujian (Admin, Warga, Unit Rumah, Satpam, dan Paket):
```bash
npx prisma db seed
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Aplikasi Anda sekarang dapat diakses secara lokal di **[http://localhost:3000](http://localhost:3000)**! 🎉

---

## 🔐 Environment Variables

Berikut konfigurasi variabel lingkungan yang wajib didefinisikan pada file `.env`:

```dotenv
# ============================================================
# DATABASE — Supabase PostgreSQL
# ============================================================

# Connection pooling via PgBouncer (Port: 6543 | Tambahkan ?pgbouncer=true di akhir URL)
DATABASE_URL="postgresql://postgres.your-id:password@pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (khusus migrasi skema database | Port: 5432)
DIRECT_URL="postgresql://postgres.your-id:password@db.supabase.com:5432/postgres"

# ============================================================
# NEXTAUTH — Autentikasi Sesi
# ============================================================

# Token acak, generate via: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ============================================================
# SUPABASE CLIENT — Realtime & Client-side
# ============================================================

NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# ============================================================
# CRON JOB — Vercel Cron Authentication
# ============================================================

CRON_SECRET="your-local-cron-secret"

# ============================================================
# KONFIGURASI APLIKASI
# ============================================================

# Batas toleransi hari sebelum denda keterlambatan diberlakukan
PACKAGE_EXPIRY_DAYS=3
```

---

## 🔑 Kredensial Akun Contoh (Seed Data)

Setelah melakukan `npx prisma db seed`, Anda dapat menggunakan akun di bawah ini untuk mencoba aplikasi:

| Role | Email | Password | Hak Akses Utama |
| :---: | :--- | :--- | :--- |
| **ADMIN** | `admin@sistem.com` | `password123` | Mengelola User, Unit Rumah, & Penghapusan Paket |
| **SECURITY** | `security@sistem.com` | `password123` | Registrasi Paket Masuk & Konfirmasi Pengambilan |
| **WARGA (Blok A-1)** | `warga.a@sistem.com` | `password123` | Melihat Paket Milik Unitnya & Status Denda |
| **WARGA (Blok B-2)** | `warga.b@sistem.com` | `password123` | Melihat Paket Milik Unitnya & Status Denda |

> ⚠️ **PENTING**: Jangan gunakan akun-akun dummy di atas untuk keperluan server production.

---

## 🧪 Hasil Uji Coba (Quality Assurance)

Aplikasi ini telah melalui pengujian fungsionalitas menyeluruh (*Black Box Testing* & *Unit Testing* menggunakan Vitest) untuk menjamin kualitas kode.

### Rangkuman Hasil Pengujian:

| ID | Fitur | Skenario Pengujian | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | **Autentikasi Login** | Pengguna masuk dengan email & password terdaftar. | Berhasil dialihkan ke dashboard sesuai perannya. | ✅ **PASS** |
| **TC-02** | **Anti-Enumeration** | Login dengan email/password salah. | Menampilkan pesan error umum tanpa membocorkan ketersediaan email. | ✅ **PASS** |
| **TC-03** | **Input Paket (Invalid)** | Security mendaftarkan paket ke unit fiktif (`Z-99`). | Form menolak pengiriman dan menonaktifkan tombol submit. | ✅ **PASS** |
| **TC-04** | **Input Paket (Valid)** | Security mendaftarkan paket ke unit terdaftar (`A-1`). | Paket tersimpan di database dan status berubah menjadi diterima. | ✅ **PASS** |
| **TC-05** | **IDOR Prevention** | Warga Unit A-1 menembak endpoint `/api/packages?unit=B-2`. | Sistem mendeteksi bypass, mengembalikan data Unit A-1. | ✅ **PASS** |
| **TC-06** | **Denda (Gratis)** | Sistem menghitung denda paket berumur kurang dari 3 hari. | Denda terhitung sebesar **Rp 0,-** (Berstatus Gratis). | ✅ **PASS** |
| **TC-07** | **Denda (Keterlambatan)**| Paket mengendap selama 5 hari (melewati batas gratis 3 hari). | Denda otomatis dihitung sebesar **Rp 4.000,-** (Rp 2.000/hari). | ✅ **PASS** |
| **TC-08** | **Real-time Broadcast**| Satpam mendaftarkan paket baru ke warga. | Halaman Warga langsung terupdate secara instan tanpa refresh. | ✅ **PASS** |
| **TC-09** | **Handover Paket** | Satpam menyerahkan paket ke warga dengan nama penerima. | Paket berubah status menjadi `DELIVERED_TO_WARGA` beserta nama penerima. | ✅ **PASS** |
| **TC-10** | **Validasi Handover** | Satpam memproses penahbisan paket dengan nama penerima kosong. | Sistem menolak aksi dan memunculkan error validasi. | ✅ **PASS** |

### Perintah Menjalankan Pengujian:
```bash
# Menjalankan seluruh test suite
npm test -- --run

# Menjalankan test dalam mode watch
npm test
```

---

## ☁️ Deployment ke Vercel

Untuk melakukan deployment ke Vercel, ikuti instruksi berikut:

1. Push perubahan kode Anda ke repositori GitHub.
2. Buat proyek baru di [Vercel](https://vercel.com) dan impor repositori Anda.
3. Masukkan seluruh **Environment Variables** dari file `.env` ke konfigurasi Environment Variables Vercel. Pastikan nilainya mengarah ke database Supabase Production Anda.
4. Klik **Deploy** dan tunggu hingga selesai.
5. Jalankan migrasi schema ke database production:
   ```bash
   npx prisma migrate deploy
   ```

---

## 📁 Struktur Folder Utama

```
sistem-paket-warga/
├── prisma/
│   ├── schema.prisma       # Definisi skema database PostgreSQL
│   ├── migrations/         # Riwayat berkas migrasi database
│   └── seed.ts             # Data inisialisasi awal (seeding)
├── src/
│   ├── app/                # Next.js App Router (Halaman & Endpoint API)
│   │   ├── admin/          # Fitur & Kontroler khusus Admin
│   │   ├── security/       # Fitur & Kontroler khusus Security / Satpam
│   │   ├── warga/          # Fitur & Kontroler khusus Warga / Penerima
│   │   └── api/            # API Route Handlers
│   ├── components/         # Komponen UI Reusable
│   │   ├── ui/             # Desain Atom (Button, Input, Modal, dsb)
│   │   ├── admin/          # Komponen spesifik halaman Admin
│   │   └── modal/          # Modul dialog pop-up
│   ├── services/           # Logika Bisnis & Penghitungan Aturan Proyek
│   ├── repositories/       # Abstraksi Database (Prisma Queries)
│   └── lib/                # Konfigurasi & Utility Global (logger, error-handler, auth)
├── screenshots/            # Berkas visual dokumentasi aplikasi
├── package.json            # Daftar dependensi dan modul
└── README.md               # Dokumentasi Proyek
```

---

*Dokumentasi ini dibuat untuk keperluan pengembangan project **Sistem Distribusi Paket Rumahan (SDPR)** — Kelompok RPL.*