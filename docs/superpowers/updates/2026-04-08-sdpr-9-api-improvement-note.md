# SDPR-9 Catatan Improvement API (Frontend Alignment)

Tanggal: 2026-04-08
Scope: Sinkronisasi UI CRUD Admin (User + Rumah) terhadap endpoint API yang tersedia.

## Ringkasan

Frontend sudah disesuaikan untuk **memanggil API terlebih dahulu** pada seluruh aksi CRUD.
Jika endpoint belum tersedia, UI menampilkan fallback status yang informatif (tanpa memblokir alur pengguna).

## Mapping Endpoint yang Dipakai Frontend

### Manajemen Pengguna

- `POST /api/users` -> dipakai untuk tambah user (halaman tambah user).
- `GET /api/users?role=...&sort=...` -> dipakai untuk refresh tabel user sesuai filter/sort.
- `PUT /api/users` -> dipakai untuk update user dari modal edit.
- `DELETE /api/users?id=...` atau `DELETE /api/users` body `{ id }` -> dipakai untuk hapus user.

Status backend saat ini:

- Yang terkonfirmasi tersedia: `POST /api/users`.
- Yang belum terkonfirmasi/masih perlu implementasi: `GET/PUT/DELETE /api/users`.

### Manajemen Rumah

- `GET /api/rumah` -> dipakai untuk load daftar rumah.
- `POST /api/rumah` -> dipakai untuk tambah rumah.
- `PUT /api/rumah` -> dipakai untuk update rumah dari modal Detail Unit.
- `DELETE /api/rumah?id=...` -> dipakai untuk hapus rumah.
- `PUT /api/users/link-rumah` -> dipakai untuk mapping user ke rumah.

Status backend saat ini:

- Yang terkonfirmasi tersedia: `GET/POST /api/rumah`, `PUT /api/users/link-rumah`.
- Yang belum terkonfirmasi/masih perlu implementasi: `PUT/DELETE /api/rumah`.

## Rekomendasi Kontrak API Minimum

Untuk menutup gap antara UI dan API, backend disarankan menyediakan kontrak berikut:

1. `GET /api/users`
   - Query opsional: `role`, `sort`
   - Response: `{ success: true, data: User[] }`
2. `PUT /api/users`
   - Body minimum: `{ id, name, email, role }`
   - Response: `{ success: true, data: User }`
3. `DELETE /api/users`
   - Query atau body minimum: `id`
   - Response: `{ success: true, message }`
4. `PUT /api/rumah`
   - Body minimum: `{ id, blok, nomor }`
   - Response: `{ success: true, data: Rumah }`
5. `DELETE /api/rumah`
   - Query minimum: `id`
   - Response: `{ success: true, message }`

## Catatan FE

- FE tidak mengubah backend route handler pada update ini.
- FE sudah siap consume endpoint-endpoint di atas begitu backend tersedia.
- Semua pesan fallback ditampilkan dalam Bahasa Indonesia agar user/admin paham status sistem.
