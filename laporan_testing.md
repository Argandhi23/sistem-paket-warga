# Laporan Implementasi & Black Box Testing

Berikut adalah laporan lengkap uji fungsionalitas (*Black Box Testing*) beserta dokumentasi tangkapan layar (screenshots) dari setiap halaman yang telah selesai diimplementasikan.

## 1. Tabel Hasil Uji (Black Box Testing)

| ID | Fitur | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| **TC-01** | **Autentikasi Login** | Pengguna masuk menggunakan email & password valid. | Berhasil login dan dialihkan ke dashboard sesuai role masing-masing (Admin, Security, Warga). | Berhasil masuk ke halaman dashboard yang ditargetkan tanpa kendala. | ✅ **PASS** |
| **TC-02** | **Keamanan Login (Anti-Enumeration)** | Percobaan masuk dengan email salah atau password yang tidak cocok. | Sistem menampilkan error generik "Email tidak terdaftar atau password salah" dan mencatat percobaan gagal. | Menampilkan pesan kegagalan generik tanpa membocorkan ketersediaan akun. | ✅ **PASS** |
| **TC-03** | **Input Paket (Unit Tidak Valid)** | Satpam mencari unit perumahan fiktif (contoh: `Z-99`) pada kolom pencarian warga. | Kolom pencarian menampilkan pesan kosong dan satpam tidak bisa memilih unit tersebut untuk didaftarkan. | Daftar dropdown pencarian tidak memunculkan data warga, registrasi diblokir. | ✅ **PASS** |
| **TC-04** | **Input Paket (Unit Valid)** | Satpam menginput nomor resi, memilih kurir, mencari unit valid (`A-1`), dan mengklik tombol simpan. | Paket tersimpan ke database, satpam diredirect kembali ke daftar paket, dan notifikasi update dipicu. | Paket sukses tersimpan dengan kode status 201, otomatis terhubung ke warga Unit A-1. | ✅ **PASS** |
| **TC-05** | **Keamanan Data (IDOR Check)** | Warga Unit A-1 (`warga.a@sistem.com`) menembak API `/api/packages?unit=B-2` untuk mengintip paket unit lain. | Sistem mendeteksi role Warga, mengabaikan parameter manipulasi `unit=B-2`, dan hanya menyajikan data Unit A-1. | API merespons dengan menyaring data warga agar tetap pada unitnya sendiri, mencegah kebocoran data. | ✅ **PASS** |
| **TC-06** | **Denda Overdue (Gratis < 3 Hari)** | Sistem menghitung denda untuk paket yang baru diterima di pos satpam kurang dari 3 hari. | Denda terhitung sebesar Rp 0,- (berstatus Gratis). | Paket berumur kurang dari 3 hari menampilkan denda Rp 0 di dashboard warga dan admin. | ✅ **PASS** |
| **TC-07** | **Denda Overdue (Denda >= 3 Hari)** | Sistem menghitung denda untuk paket berumur 5 hari di pos satpam (lewat dari batas gratis 3 hari). | Denda terakumulasi Rp 2.000 / hari mulai hari ke-4 (Total denda 2 hari terlambat = Rp 4.000,-). | Paket mendeteksi keterlambatan dan secara otomatis menghitung denda Rp 4.000 sesuai rumus bisnis. | ✅ **PASS** |
| **TC-08** | **Real-time Notifikasi** | Satpam mendaftarkan paket baru, dan warga membuka dashboard-nya secara bersamaan. | Halaman dashboard warga langsung terupdate menampilkan paket baru secara real-time via Supabase Broadcast tanpa refresh. | UI Warga terupdate seketika begitu satpam berhasil mensubmit data paket di pos. | ✅ **PASS** |
| **TC-09** | **Penyerahan Paket (Handover)** | Satpam menyerahkan paket ke warga dengan mengisi nama penerima asli dan menekan tombol konfirmasi. | Status paket berubah dari `RECEIVED_BY_SECURITY` menjadi `DELIVERED_TO_WARGA`, mencatat nama penerima dan waktu serah terima. | Paket sukses terupdate, riwayat penyerahan tercatat rapi di database. | ✅ **PASS** |
| **TC-10** | **Validasi Handover (Nama Kosong)** | Satpam mencoba mengonfirmasi penyerahan paket tanpa mengisi nama penerima pada form konfirmasi. | Sistem memberikan pesan validasi error bahwa nama penerima wajib diisi dan memblokir aksi konfirmasi. | Muncul error validasi di modal penyerahan paket, status paket tetap belum diambil. | ✅ **PASS** |

---

## 2. Dokumentasi Screenshot Halaman
*Tangkapan layar di bawah disimpan dalam direktori `./screenshots/` pada project root.*

### Halaman Login
![Halaman Login](./screenshots/login_page.png)

### Dashboard Admin
![Dashboard Admin](./screenshots/admin_dashboard.png)

### Dashboard Security
![Dashboard Security](./screenshots/security_dashboard.png)

### Form Registrasi Paket (Kosong)
![Form Registrasi Paket Kosong](./screenshots/security_form_empty.png)

### Pencarian Unit Tidak Ditemukan (Z-99)
![Validasi Unit Tidak Ditemukan](./screenshots/security_form_invalid_unit.png)

### Form Terhubung ke Warga Terdaftar (A-1)
![Form Valid Warga](./screenshots/security_form_filled.png)

### Dashboard Warga (Unit A-1)
![Dashboard Warga](./screenshots/warga_dashboard.png)
