# 📦 Sistem Paket Warga (Residential Package Management System)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-123a50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Realtime-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-76b900?style=for-the-badge&logo=vitest)](https://vitest.dev/)

**Sistem Paket Warga** adalah aplikasi manajemen logistik internal perumahan/apartemen yang memfasilitasi pencatatan paket masuk oleh petugas keamanan (satpam), pengelolaan hunian & penghuni oleh administrator, serta pemantauan dan pengambilan paket oleh warga secara **aman**, **transparan**, dan **real-time**.

Aplikasi ini dirancang untuk meminimalkan penumpukan paket di pos satpam, mempermudah pelacakan status kiriman ekspedisi, mencegah salah serah-terima melalui validasi unit hunian, serta memberikan transparansi kalkulasi denda penitipan otomatis apabila paket tidak diambil melewati batas waktu toleransi.

> 📝 **Informasi Project**
> - **Nama Proyek**: Sistem Distribusi Paket Rumahan (SDPR) — Kelompok RPL
> - **Peran**: Backend Developer & UI Engineer
> - **Teknologi Utama**: Next.js 16 (App Router) · React 19 · TypeScript · Prisma ORM (`@prisma/adapter-pg`) · Supabase (PostgreSQL & Realtime) · NextAuth.js (JWT RBAC) · Tailwind CSS v4 · Vitest

---

## 📋 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🚀 Optimisasi Performa & Ketahanan Sistem (Vercel + Supabase Free Tier)](#-optimisasi-performa--ketahanan-sistem-vercel--supabase-free-tier)
- [🖼️ Dokumentasi Visual (Tangkapan Layar)](#️-dokumentasi-visual-tangkapan-layar)
- [🏛️ Arsitektur & Skema Database](#️-arsitektur--skema-database)
- [🔌 Daftar Endpoint API](#-daftar-endpoint-api)
- [🛠️ Persyaratan Awal (Prerequisites)](#️-persyaratan-awal-prerequisites)
- [⚙️ Cara Instalasi & Setup Lokal](#️-cara-instalasi--setup-lokal)
- [🔐 Environment Variables](#-environment-variables)
- [🔑 Kredensial Akun Contoh (Demo Portofolio)](#-kredensial-akun-contoh-demo-portofolio)
- [🧪 Hasil Uji Coba (Quality Assurance)](#-hasil-uji-coba-quality-assurance)
- [☁️ Deployment ke Vercel & Anti-Pause Supabase](#-deployment-ke-vercel--anti-pause-supabase)
- [📁 Struktur Folder Utama](#-struktur-folder-utama)

---

## ✨ Fitur Utama

- 🔐 **Multi-Role Access Control (RBAC)**:
  - **Administrator (`/admin`)**: Dashboard ringkasan metrik logistik, manajemen akun warga & satpam, manajemen unit/hunian & pemetaan penghuni, manajemen inventaris paket penuh, laporan analitik kurir/ekspedisi, serta *audit trail* (`ActivityLog`).
  - **Petugas Keamanan / Security (`/security`)**: Monitor manifest paket secara *real-time* dengan pencarian & filter instan, registrasi paket baru dengan *autocomplete* pencarian warga/unit, serahterima (*handover*) paket, dan penandaan pelunasan denda.
  - **Warga Penghuni (`/warga`)**: Dashboard ringkasan paket unit hunian sendiri, inventaris paket aktif yang menunggu diambil di pos satpam, serta riwayat pengambilan paket lengkap dengan detail waktu dan penerima.
- ⚡ **Realtime Broadcast (Supabase Realtime)**: Daftar manifest paket otomatis ter-update secara langsung di layar petugas maupun warga ketika ada paket baru yang didaftarkan atau diserahterimakan tanpa perlu memuat ulang (*refresh*) halaman.
- 💰 **Kalkulasi Denda Penitipan Otomatis**: Menghitung biaya penitipan secara otomatis sebesar **Rp 2.000 / hari** mulai hari ke-4 setelah masa penitipan gratis **3 hari pertama** berakhir.
- 🔍 **Autokomplet & Validasi Unit Hunian**: Mencegah kesalahan input oleh satpam dengan mencocokkan nomor unit/blok rumah yang benar-benar terdaftar di database.
- 🛡️ **Keamanan Berlapis & Proteksi IDOR**: Dilengkapi proteksi *Insecure Direct Object Reference* (IDOR) pada API dan Server Components—warga yang memanipulasi parameter URL (`?unit=B-2`) tetap hanya dapat mengakses paket milik unit rumahnya sendiri yang terikat pada sesi JWT.
- 🎯 **One-Click Quick Demo Login**: Halaman `/login` dilengkapi panel **Akses Cepat Demo Portofolio** agar penguji atau perekrut dapat berpindah peran (`Admin`, `Satpam`, `Warga A-1`, `Warga B-2`) hanya dengan satu klik.

---

## 🚀 Optimisasi Performa & Ketahanan Sistem (Vercel + Supabase Free Tier)

Proyek ini telah dioptimalkan secara khusus untuk berjalan cepat dan stabil di atas infrastruktur **Vercel Hobby (Free Tier)** dan **Supabase Free Tier**:

1. **Co-location Region Singapura (`sin1`)**: Konfigurasi `vercel.json` menempatkan eksekusi Serverless Function Vercel di Singapura (`sin1`), satu lokasi dengan cluster database Supabase (`ap-southeast-1`), memangkas latensi jaringan lintas benua hingga **>90%**.
2. **Parallel Server-Side Data Fetching (`Promise.all`)**: Seluruh halaman Server Component memanggil layer `Service` secara paralel di sisi server tanpa *HTTP loopback waterfall* dan tanpa kueri autentikasi berulang.
3. **Database Indexing (`@@index`)**: Skema PostgreSQL dilengkapi indeks pada kolom pencarian dan *foreign key* (`status`, `unitNumber`, `receivedAt`, `role`, `wargaId`, `securityId`, `createdAt`) untuk menjaga eksekusi kueri tetap di bawah milidetik.
4. **Serverless-Safe Connection Pool & URL Sanitizer**: Menggunakan `pg.Pool` singleton dengan batas koneksi hemat (`max: 2` di lingkungan serverless, `allowExitOnIdle: true`) melalui Supavisor Pooler IPv4 serta normalisasi URL otomatis (`URLSearchParams`).
5. **Sistem Anti-Pause Berlapis (Keep-Alive)**:
   - **Vercel Cron (`/api/cron/expire-packages`)**: Berjalan otomatis setiap hari (`0 0 * * *`) untuk memperbarui status paket kedaluwarsa, mencatat *heartbeat* ke PostgreSQL, dan mem-ping Supabase REST API Gateway.
   - **Endpoint Health & Keep-Alive (`/api/keep-alive`)**: Endpoint publik ber-cooldown 5 menit untuk pemantauan uptime eksternal.
   - **GitHub Actions Keep-Alive (`.github/workflows/supabase-keepalive.yml`)**: Berjalan otomatis setiap 2 hari sekali untuk memastikan database Supabase Free Tier tidak pernah terkena *auto-pause* 7 hari.
6. **Automatic In-Memory Fallback Store**: Jika terjadi gangguan jaringan pada database cloud, sistem secara transparan beralih sementara ke *In-Memory Fallback Store* berbasis snapshot data sehingga demo portofolio tidak pernah mengalami *downtime*.

---

## 🖼️ Dokumentasi Visual (Tangkapan Layar)

Berikut adalah tampilan antarmuka dari **Sistem Paket Warga**:

<details>
  <summary>🔑 <b>Halaman Login (Multi-Role Auth & Quick Demo Access)</b></summary>
  <br/>
  <p align="center">
    <img src="./screenshots/login_page.png" alt="Halaman Login" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

<details>
  <summary>📊 <b>Dashboard Admin (Manajemen Master Data & Statistik)</b></summary>
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
  <summary>🏡 <b>Dashboard Warga (Inventaris Paket, Riwayat & Informasi Denda)</b></summary>
  <br/>
  <p align="center">
    <img src="./screenshots/warga_dashboard.png" alt="Dashboard Warga" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  </p>
</details>

---

## 🏛️ Arsitektur & Skema Database

### 1. Pola Arsitektur Berlapis (Layered Architecture)
Proyek ini menerapkan pola **Repository – Service – Controller (Next.js App Router & API Routes)** agar logika bisnis terpisah secara bersih dari akses data dan mudah diuji secara independen.

```mermaid
graph TD
    Client["Browser / Client UI"] -->|Server Render & Fetch API| Controller["Next.js App Router Pages & API Routes"]
    Controller -->|RBAC & Session Check| Service["Service Layer (Business Logic)"]
    Service -->|Query Mapping| Repository["Repository Layer (Data Access)"]
    Repository -->|Type-Safe Queries| Prisma["Prisma ORM Client + pg.Pool"]
    Prisma -->|Supavisor Pooler| DB[("Supabase PostgreSQL")]
    Prisma -.->|Auto Failover| Fallback["In-Memory Fallback Store"]
    DB -.->|Supabase Broadcast Realtime| Client
```

### 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    RUMAH ||--o{ USER : "dihuni oleh (penghuni)"
    USER ||--o{ PACKAGE : "menerima (wargaPackages)"
    USER ||--o{ PACKAGE : "mencatat (securityPackages)"
    USER ||--o{ ACTIVITY_LOG : "melakukan aksi"

    RUMAH {
        string id PK
        string blok
        string nomor
        datetime createdAt
        datetime updatedAt
    }

    USER {
        string id PK
        string name
        string email UK
        string password
        enum role "ADMIN | SECURITY | WARGA"
        string unitNumber
        string rumahId FK
        datetime createdAt
    }

    PACKAGE {
        string id PK
        string trackingNumber
        string courierName
        string recipientName
        string unitNumber
        enum status "RECEIVED_BY_SECURITY | DELIVERED_TO_WARGA | EXPIRED"
        int penaltyAmount
        boolean penaltyPaid
        datetime receivedAt
        datetime pickedUpAt
        string pickedUpBy
        string securityId FK
        string wargaId FK
    }

    ACTIVITY_LOG {
        string id PK
        string action
        string entityType
        string entityId
        string details
        string userId FK
        datetime createdAt
    }
```

### Prinsip Pengembangan:
- **Service Layer (`src/services/`)**: Seluruh aturan bisnis (kalkulasi denda, validasi otorisasi unit, logika masa kedaluwarsa, pencatatan log aktivitas) ditempatkan di layer ini.
- **Repository Layer (`src/repositories/`)**: Seluruh operasi query database menggunakan Prisma ditulis secara terpusat di sini.
- **Strict Type Safety**: Bebas dari penggunaan tipe `any` (`0 ESLint errors`, `0 warnings`, `strict: true`).

---

## 🔌 Daftar Endpoint API

| Method | Endpoint | Akses Role | Deskripsi |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/packages` | `ADMIN`, `SECURITY`, `WARGA` | Mengambil daftar paket (otomatis terisolasi per `unitNumber` untuk `WARGA`). |
| `POST` | `/api/packages` | `ADMIN`, `SECURITY` | Mendaftarkan paket baru masuk ke pos keamanan. |
| `PUT` | `/api/packages` | `ADMIN`, `SECURITY` | Memperbarui informasi paket (kurir, resi, penerima, unit). |
| `DELETE` | `/api/packages?id=...` | `ADMIN`, `SECURITY` | Menghapus data log paket. |
| `PATCH` | `/api/packages/handover` | `ADMIN`, `SECURITY` | Memproses serah-terima paket ke warga & pelunasan denda. |
| `GET` | `/api/packages/stats` | `ADMIN`, `SECURITY`, `WARGA` | Ringkasan jumlah paket (`total`, `pending`, `pickedUp`, `expired`, `totalPenalty`). |
| `GET` | `/api/packages/statistics` | `ADMIN`, `SECURITY` | Statistik distribusi paket berdasarkan ekspedisi/kurir. |
| `GET` | `/api/packages/analytics` | `ADMIN` | Data analitik grafik harian, distribusi blok, dan histori denda bulanan. |
| `GET` | `/api/rumah` | `ADMIN`, `SECURITY` | Daftar seluruh unit hunian beserta penghuni aktif. |
| `POST / PUT / DELETE` | `/api/rumah` | `ADMIN` | Membuat, mengubah, atau menghapus unit hunian perumahan. |
| `GET / POST / PUT / DELETE` | `/api/users` | `ADMIN` | Manajemen akun pengguna (`WARGA` dan `SECURITY`). |
| `PUT` | `/api/users/link-rumah` | `ADMIN` | Menautkan atau melepas tautan akun warga ke unit rumah. |
| `GET` | `/api/users/search-warga` | `ADMIN`, `SECURITY` | Pencarian *autocomplete* warga & unit saat registrasi paket. |
| `GET` | `/api/activity-logs` | `ADMIN` | Riwayat log audit aktivitas sistem. |
| `GET` | `/api/cron/expire-packages` | `CRON` / System | Job harian pembaruan paket kedaluwarsa & *heartbeat* database. |
| `GET` | `/api/keep-alive` | Public (Rate-limited) | Health-check & pemicu *keep-alive* database Supabase + REST Gateway. |

---

## 🛠️ Persyaratan Awal (Prerequisites)

Pastikan perangkat Anda telah terpasang:

- **Node.js** (Versi `>= 18.x` atau `20.x / 22.x LTS` disarankan)
- **NPM** (Versi `>= 9.x`)
- **Git**
- Akun dan project **Supabase** (PostgreSQL)

Verifikasi kesiapan environment Anda dengan perintah:
```bash
node -v   # Output disarankan >= 18.x
npm -v    # Output disarankan >= 9.x
```

---

## ⚙️ Cara Instalasi & Setup Lokal

Ikuti langkah-langkah berikut untuk menjalankan project di komputer lokal Anda:

### 1. Clone Repository & Masuk ke Direktori
```bash
git clone https://github.com/Argandhi23/sistem-paket-warga.git
cd sistem-paket-warga
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka berkas `.env` dan isi variabel koneksi database serta kredensial Supabase Anda (lihat bagian [Environment Variables](#-environment-variables)).

### 4. Sinkronisasi Skema Database & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 5. Seeding Database (Data Awal)
Isi database dengan data contoh (Admin, Satpam, Warga Blok A-1 & B-2, Unit Rumah, dan Paket):
```bash
npx prisma db seed
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Aplikasi sekarang dapat diakses di **[http://localhost:3000](http://localhost:3000)**! 🎉

---

## 🔐 Environment Variables

Berikut konfigurasi variabel lingkungan yang wajib didefinisikan pada file `.env` (dan pada menu **Environment Variables** di Vercel):

```dotenv
# ============================================================
# DATABASE — Supabase PostgreSQL
# ============================================================

# Connection pooling via Supavisor (Mendukung IPv4 untuk Vercel Serverless)
DATABASE_URL="postgresql://postgres.your-project-id:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session Pooler / Direct connection (Digunakan untuk migrasi skema Prisma CLI)
DIRECT_URL="postgresql://postgres.your-project-id:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ============================================================
# NEXTAUTH — Autentikasi Sesi JWT
# ============================================================

# Token rahasia acak, generate via: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ============================================================
# SUPABASE CLIENT — Realtime & REST Gateway Keep-Alive
# ============================================================

NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# ============================================================
# CRON JOB & KONFIGURASI APLIKASI
# ============================================================

# Secret untuk mengamankan endpoint /api/cron/expire-packages
CRON_SECRET="your-local-cron-secret"

# Batas hari penitipan gratis sebelum dikenakan denda Rp 2.000/hari
PACKAGE_EXPIRY_DAYS=3
```

---

## 🔑 Kredensial Akun Contoh (Demo Portofolio)

Setelah menjalankan `npx prisma db seed` (atau langsung melalui fitur **Akses Cepat Demo Portofolio** di halaman `/login`), Anda dapat masuk menggunakan akun berikut:

| Role | Email | Password | Unit Hunian | Hak Akses Utama |
| :---: | :--- | :--- | :---: | :--- |
| **ADMIN** | `admin@sistem.com` | `password123` | `-` | Mengelola User, Unit Rumah, Paket, Laporan Analitik, & Log Aktivitas |
| **SECURITY** | `security@sistem.com` | `password123` | `-` | Monitor Manifest, Registrasi Paket Masuk, & Konfirmasi Serah-Terima |
| **WARGA (Blok A-1)** | `warga.a@sistem.com` | `password123` | `A-1` | Melihat Paket Milik Unit `A-1`, Riwayat Pengambilan, & Status Denda |
| **WARGA (Blok B-2)** | `warga.b@sistem.com` | `password123` | `B-2` | Melihat Paket Milik Unit `B-2`, Riwayat Pengambilan, & Status Denda |

> ⚠️ **Catatan Keamanan**: Kredensial di atas disediakan khusus untuk demonstrasi portofolio dan lingkungan pengujian.

---

## 🧪 Hasil Uji Coba (Quality Assurance)

Aplikasi ini telah melalui pengujian fungsionalitas menyeluruh (*Black Box Testing*, *Unit Testing*, dan *Database Integration Testing* menggunakan **Vitest**) untuk menjamin kualitas dan keamanan kode.

### Rangkuman Skenario Pengujian:

| ID | Fitur | Skenario Pengujian | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | **Autentikasi Login** | Pengguna masuk dengan email & password terdaftar. | Berhasil dialihkan ke dashboard sesuai perannya (`ADMIN`, `SECURITY`, `WARGA`). | ✅ **PASS** |
| **TC-02** | **Anti-Enumeration** | Login dengan email/password yang tidak cocok. | Menampilkan pesan error terstandarisasi tanpa membocorkan eksistensi email. | ✅ **PASS** |
| **TC-03** | **Input Paket (Invalid)** | Security mendaftarkan paket ke unit fiktif (`Z-99`). | Sistem menolak penyimpanan karena unit tidak terdaftar di tabel `Rumah`. | ✅ **PASS** |
| **TC-04** | **Input Paket (Valid)** | Security mendaftarkan paket ke unit terdaftar (`A-1`). | Paket tersimpan di database dan tercatat pada `ActivityLog`. | ✅ **PASS** |
| **TC-05** | **IDOR Prevention** | Warga Unit `A-1` memanggil `/api/packages?unit=B-2`. | Sistem mengabaikan parameter URL dan hanya mengembalikan data Unit `A-1`. | ✅ **PASS** |
| **TC-06** | **RBAC Enforcement** | Warga mencoba menembak endpoint `POST /api/packages`. | Ditolak dengan status `403 Forbidden` (Hanya Security/Admin). | ✅ **PASS** |
| **TC-07** | **Denda (Gratis)** | Sistem menghitung denda paket berumur `≤ 3 hari`. | Denda terhitung sebesar **Rp 0** (Status Gratis). | ✅ **PASS** |
| **TC-08** | **Denda (Keterlambatan)** | Paket mengendap selama 5 hari (melewati batas gratis 3 hari). | Denda otomatis dihitung sebesar **Rp 4.000** (`2 hari × Rp 2.000`). | ✅ **PASS** |
| **TC-09** | **Real-time Broadcast** | Satpam mendaftarkan paket baru ke warga. | Tabel manifest langsung ter-update secara instan melalui Supabase Realtime. | ✅ **PASS** |
| **TC-10** | **Handover Paket** | Satpam menyerahkan paket ke warga dengan nama penerima. | Status paket berubah menjadi `DELIVERED_TO_WARGA` beserta waktu & nama pengambil. | ✅ **PASS** |

### Perintah Menjalankan Pengujian & Pemeriksaan Kualitas:
```bash
# Menjalankan seluruh unit & integration test (Vitest)
npm test -- --run

# Menjalankan pengecekan ESLint & TypeScript
npm run lint
npx tsc --noEmit

# Menjalankan build production Next.js
npm run build
```

---

## ☁️ Deployment ke Vercel & Anti-Pause Supabase

1. **Push kode ke GitHub** dan impor repositori ke [Vercel](https://vercel.com).
2. Pada **Vercel Project Settings -> Environment Variables**, tambahkan seluruh variabel dari `.env` (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CRON_SECRET`).
3. File `vercel.json` secara otomatis mengatur:
   - Lokasi fungsi serverless di Singapura (`"regions": ["sin1"]`).
   - Eksekusi **Vercel Cron** harian (`0 0 * * *`) ke `/api/cron/expire-packages`.
4. (Opsional) Pada repositori GitHub Anda, buka **Settings -> Secrets and variables -> Actions** dan tambahkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, serta `NEXTAUTH_URL` (URL domain Vercel Anda) agar workflow `.github/workflows/supabase-keepalive.yml` ikut melakukan ping otomatis setiap 2 hari sekali.

---

## 📁 Struktur Folder Utama

```text
sistem-paket-warga/
├── .github/
│   └── workflows/
│       └── supabase-keepalive.yml  # GitHub Actions anti-pause Supabase (tiap 2 hari)
├── prisma/
│   ├── schema.prisma               # Definisi skema & index database PostgreSQL
│   ├── migrations/                 # Riwayat berkas migrasi database
│   ├── backup/                     # Snapshot data fallback (supabase_backup.json)
│   └── seed.ts                     # Skrip inisialisasi data awal (seeding)
├── src/
│   ├── app/                        # Next.js 16 App Router (Server Pages, Loading, & API)
│   │   ├── admin/                  # Portal Administrator (Dashboard, Warga, Rumah, Paket, Laporan, Log)
│   │   ├── security/               # Portal Petugas Keamanan / Satpam
│   │   ├── warga/                  # Portal Warga Penghuni (Dashboard, Paket Saya, Riwayat)
│   │   ├── login/                  # Halaman Login Multi-Role + Quick Demo Selector
│   │   └── api/                    # REST API Route Handlers (packages, rumah, users, cron, keep-alive)
│   ├── components/                 # Komponen UI & Domain Reusable
│   │   ├── admin/                  # Tabel manajemen paket, warga, hunian, & grafik analitik
│   │   ├── security/               # Form registrasi paket dengan autocomplete warga
│   │   ├── shell/                  # AppShell, navigasi responsif, filter, & histori paket
│   │   ├── modal/                  # Modal detail paket & konfirmasi serah-terima (handover)
│   │   └── ui/                     # Komponen dasar (Button, Input, Select, Badge, Card, Skeleton)
│   ├── services/                   # Business Logic Layer (PackageService, RumahService, UserService)
│   ├── repositories/               # Data Access Layer (PackageRepository, RumahRepository, UserRepository)
│   ├── hooks/                      # Custom React Hooks (usePackageRealtime)
│   ├── lib/                        # Core Utilities (Prisma singleton + fallback, NextAuth, Tests)
│   └── utils/                      # Fungsi kalkulasi denda & pemformatan mata uang
├── screenshots/                    # Dokumentasi tangkapan layar aplikasi
├── vercel.json                     # Konfigurasi region Singapura (sin1) & Vercel Cron
└── README.md                       # Dokumentasi utama proyek
```

---

*Dokumentasi ini disusun untuk proyek **Sistem Distribusi Paket Rumahan (SDPR)** — Kelompok RPL.*
