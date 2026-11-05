# Sistem Distribusi Paket Warga (Residential Package Management System)

Aplikasi manajemen penerimaan, pemantauan, dan distribusi paket penghuni perumahan berbasis **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM (PostgreSQL / Supabase)**, dan **NextAuth.js** dengan kontrol akses berbasis peran (**RBAC**: Admin, Security/Satpam, dan Warga).

---

## Fitur Utama

- **Multi-Role Access Control (RBAC)**:
  - **Admin (`/admin`)**: Dashboard analitik, manajemen akun warga & satpam, manajemen unit/hunian & pemetaan penghuni, manajemen paket, laporan statistik ekspedisi, serta audit activity log.
  - **Security / Satpam (`/security`)**: Monitor manifest paket real-time, registrasi paket masuk dengan pencarian unit/warga otomatis, serahterima paket (*handover*), dan kalkulasi denda penitipan otomatis.
  - **Warga (`/warga`)**: Ringkasan paket unit hunian sendiri, inventaris paket aktif dengan isolasi data ketat (*IDOR prevention*), dan riwayat pengambilan paket.
- **Sistem Denda Penitipan Otomatis**:
  - Gratis 3 hari pertama sejak paket diterima di Pos Satpam.
  - Hari ke-4 dan seterusnya dikenakan biaya penitipan Rp 2.000/hari secara otomatis.
- **Resilient Database Architecture**:
  - Terintegrasi dengan PostgreSQL (Supabase) melalui `@prisma/adapter-pg` dengan *singleton connection pool* dan *automatic in-memory fallback* (`prisma/backup/supabase_backup.json`) sehingga demo portofolio tetap berjalan cepat meskipun database cloud sedang *paused* atau offline.

---

## Akun Demo (Login Kredensial)

Halaman `/login` dilengkapi tombol **Akses Cepat Demo Portofolio (Klik untuk Isi Otomatis)**, atau Anda dapat menggunakan kredensial berikut secara manual:

| Peran (Role) | Email | Password | Unit Hunian | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sistem.com` | `password123` | - | Manajemen penuh (Warga, Hunian, Paket, Laporan, Audit Log) |
| **Security (Satpam)** | `security@sistem.com` | `password123` | - | Monitor manifest, registrasi paket baru, serahterima paket |
| **Warga Blok A-1** | `warga.a@sistem.com` | `password123` | `A-1` | Portal warga & riwayat paket khusus Unit A-1 |
| **Warga Blok B-2** | `warga.b@sistem.com` | `password123` | `B-2` | Portal warga & riwayat paket khusus Unit B-2 |

---

## Arsitektur Kode (Layered Architecture)

```text
src/
├── app/                  # Next.js App Router (Server Pages, Loading Skeletons, & API Routes)
│   ├── admin/            # Portal Administrator
│   ├── security/         # Portal Petugas Keamanan (Satpam)
│   ├── warga/            # Portal Warga Penghuni
│   ├── login/            # Halaman Autentikasi + Quick Demo Login
│   └── api/              # REST API Endpoints (Auth, Users, Rumah, Packages, Logs)
├── components/           # Reusable UI, Shell, Modal, & Domain Components
├── services/             # Business Logic Layer (UserService, RumahService, PackageService)
├── repositories/         # Data Access Layer (UserRepository, RumahRepository, PackageRepository)
├── lib/                  # Core Utilities (Prisma Singleton + Fallback, NextAuth, Error Handler, Tests)
└── utils/                # Helper Functions (Kalkulasi Denda & Format Rupiah)
```

---

## Cara Menjalankan Project

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Menjalankan Mode Development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

3. **Menjalankan Pengujian (Unit & Integration Tests)**:
   ```bash
   npm test -- --run
   ```

4. **Menjalankan Linter & Build Production**:
   ```bash
   npm run lint
   npm run build
   ```
