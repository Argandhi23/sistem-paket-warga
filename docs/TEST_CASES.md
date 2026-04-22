# Document Test Cases
Sistem Manajemen Paket Warga

## Skenario 1: Satpam Input Paket ke Rumah yang Tidak Ada
**Tujuan:** Memastikan bahwa sistem menolak atau memberikan peringatan ketika Security (Satpam) mencoba mendaftarkan paket ke unit rumah yang belum terdaftar di database.
**Pre-condition:** 
- Akun Satpam sudah login.
- Rumah dengan unit "Z-99" tidak ada di dalam database.
**Langkah-langkah:**
1. Satpam masuk ke halaman pendaftaran paket baru.
2. Satpam mengisi form data paket (Nama kurir, Nama penerima).
3. Satpam mengisi "Nomor Unit" dengan "Z-99".
4. Satpam menekan tombol "Simpan".
**Expected Result:**
Sistem memberikan pesan error "Rumah/Unit tidak ditemukan" dan data paket tidak tersimpan di database, atau paket tersimpan namun gagal ditautkan (tergantung *business rule*, dalam kasus ini diwajibkan Gagal).

## Skenario 2: Warga Mencoba Melihat Paket Milik Warga Lain via API (IDOR Check)
**Tujuan:** Mencegah Insecure Direct Object Reference (IDOR) di mana seorang warga bisa melihat paket milik unit/rumah orang lain dengan cara memanipulasi *request* API.
**Pre-condition:**
- Terdapat dua Warga: Warga A (Unit A-1) dan Warga B (Unit B-2).
- Terdapat paket X yang ditujukan untuk Unit B-2.
- Warga A sedang login dan memiliki *session token* aktif.
**Langkah-langkah:**
1. Warga A mencoba melakukan *request GET* ke endpoint `/api/packages?unit=B-2` atau mengakses ID paket X secara langsung.
2. Sistem melakukan validasi token *session* Warga A dan mencocokkan dengan data Rumah (A-1).
**Expected Result:**
Sistem merespons dengan HTTP Status `403 Forbidden` atau `401 Unauthorized`. Warga A hanya bisa melihat data paket untuk Unit A-1.
