# Handoff Backend Login Auth - SDPR-13

## Ringkasan Konteks
- Frontend saat ini sudah menyediakan halaman `/login` berbasis slicing UI.
- Sistem menggunakan model **admin-managed users** (akun dibuat lewat CRUD user oleh admin).
- Fitur register publik dan social login **tidak** diaktifkan.

## Kondisi Frontend Saat Ini (UI Stub)
- Form login memuat:
  - `email`
  - `password`
  - `remember me` (boolean lokal UI)
  - aksi `forgot password` (stub status)
- Validasi frontend saat submit:
  - Email wajib + format email
  - Password wajib + minimal 8 karakter
- Status UI:
  - Klik forgot password: `Not implemented yet`
  - Submit valid: `Auth API not connected yet`

## Draft Kontrak API Login

### Endpoint
- `POST /api/auth/login`

### Request Body
```json
{
  "email": "user@domain.com",
  "password": "string"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Nama User",
      "email": "user@domain.com",
      "role": "WARGA"
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Pesan error",
  "code": "ERROR_CODE"
}
```

## Mapping Error Backend -> Slot UI Frontend
- `INVALID_CREDENTIALS` -> tampilkan status form umum: "Email atau password salah."
- `USER_DISABLED` -> status form umum: "Akun dinonaktifkan. Hubungi admin."
- `ROLE_NOT_ALLOWED` -> status form umum: "Role akun belum diizinkan login."
- `VALIDATION_ERROR` -> gunakan detail field dari backend untuk `email` / `password`.
- `INTERNAL_ERROR` -> status form umum: "Terjadi gangguan server. Coba lagi."

## Checklist Integrasi Backend
1. Implement endpoint `POST /api/auth/login` dengan response contract di atas.
2. Pastikan cek kredensial menggunakan sumber data user yang sudah dipakai CRUD admin.
3. Pastikan role (`WARGA`, `ADMIN`, `SEKURITI`) ikut dikembalikan.
4. Sediakan strategy session/token (cookie httpOnly atau bearer token) dan dokumentasikan.
5. Kirim error code yang konsisten agar mapping frontend stabil.
6. Koordinasikan redirect pasca-login per role:
   - WARGA -> dashboard warga
   - ADMIN -> dashboard admin
   - SEKURITI -> dashboard sekuriti

## Catatan untuk Lead Programmer
- Frontend siap menerima wiring API login tanpa perlu perubahan layout besar.
- Fokus lanjutan backend ada di subtask auth/API testing (`SDPR-12` dan `SDPR-14`) agar alur login end-to-end cepat ditutup.
