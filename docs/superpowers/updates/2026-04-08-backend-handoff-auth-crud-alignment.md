# Handoff Backend: Alignment Auth + CRUD (SDPR)

Tanggal: 2026-04-08  
Requester: FE/PM (Randy)  
Tujuan: Ringkasan siap-kirim ke backend (Faqih/Argandhi) + detail teknis gap implementasi.

## 1) Template Chat Singkat (Siap Copas)

Halo Faqih/Argandhi, aku update kebutuhan backend biar selaras sama UI FE terbaru.

Status FE:
- UI Admin User/Rumah sudah API-first (kalau endpoint ready langsung kepakai).
- Alur yang dipakai FE: create/list/update/delete user, create/list/update/delete rumah, dan mapping user-rumah.

Gap backend yang masih perlu dilengkapi:
- `/api/users`: baru ada `POST`, belum ada `GET/PUT/DELETE`.
- `/api/rumah`: baru ada `GET/POST`, belum ada `PUT/DELETE`.
- Hardening auth (SDPR-67 BE): validasi password minimum, proteksi create user hanya admin, validasi enum role, pesan login generik anti-enumerasi, dan rate limit login.

Mohon bantu implement endpoint + hardening sesuai detail di dokumen:  
`docs/superpowers/updates/2026-04-08-backend-handoff-auth-crud-alignment.md`

Kalau endpoint sudah ready, FE langsung bisa verifikasi end-to-end tanpa ubah UX utama.

## 2) Konteks Story/Subtask Jira yang Relevan

### SDPR-4 (Story)
"Sebagai Admin, aku ingin mengelola data Rumah (Blok/No) dan User (Resident), serta menautkan User ke rumah tersebut"

Subtask terkait:
- SDPR-8: UI CRUD Rumah & User + Mapping Resident ke Rumah
- SDPR-9: Slicing UI Management Rumah & User
- SDPR-10: API CRUD Rumah & User + Linkage via Prisma

### SDPR-67 (Bug Parent)
Fokus hardening keamanan auth/login + endpoint sensitif.

Subtask backend yang terbuka:
- SDPR-68: Tolak GET login dengan kredensial
- SDPR-69: Validasi panjang password sebelum hashing
- SDPR-70: Lindungi endpoint create user + validasi role
- SDPR-71: Seragamkan pesan error login (anti enumerasi)
- SDPR-73: Rate limiting login
- SDPR-74: Proteksi endpoint akses informasi paket

Subtask FE yang sudah done:
- SDPR-72: Pastikan kredensial login dikirim via POST

## 3) Kondisi Saat Ini di Kode

### Auth/NextAuth
- `src/lib/auth.ts`: NextAuth Credentials + Prisma Adapter sudah aktif.
- `middleware.ts`: RBAC route-level (`/admin`, `/security`, `/warga`) sudah ada.
- `src/lib/require-admin-session.ts`: guard admin page-level sudah ada.

Catatan risiko:
- `src/lib/auth.ts` masih memunculkan variasi error detail pada authorize (berpotensi enumerasi akun kalau tidak distandardisasi output ke client).

### API User
- `src/app/api/users/route.ts`: saat ini hanya `POST`.
- FE sudah mencoba consume:
  - `GET /api/users?role=...&sort=...`
  - `PUT /api/users`
  - `DELETE /api/users?id=...` (fallback body `{ id }`)

### API Rumah
- `src/app/api/rumah/route.ts`: saat ini `GET` + `POST`.
- FE sudah mencoba consume:
  - `PUT /api/rumah`
  - `DELETE /api/rumah?id=...`

### Linkage
- `src/app/api/users/link-rumah/route.ts`: `PUT` sudah ada dan dipakai FE.

## 4) Kontrak Endpoint Minimum yang Diminta FE

## 4.1 `/api/users`

### GET `/api/users?role=<WARGA|SATPAM>&sort=<terbaru|lama>`
Tujuan: list user untuk tabel manajemen user.

Response sukses:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nama",
      "email": "email@domain.com",
      "role": "WARGA",
      "rumah": { "id": "uuid", "blok": "A", "nomor": "12" },
      "createdAt": "2026-04-08T10:00:00.000Z"
    }
  ]
}
```

### PUT `/api/users`
Body minimum:
```json
{
  "id": "uuid",
  "name": "Nama Baru",
  "email": "baru@domain.com",
  "role": "WARGA"
}
```

Response sukses:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nama Baru",
    "email": "baru@domain.com",
    "role": "WARGA"
  }
}
```

### DELETE `/api/users?id=<uuid>`
Atau body:
```json
{ "id": "uuid" }
```

Response sukses:
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

## 4.2 `/api/rumah`

### PUT `/api/rumah`
Body minimum:
```json
{
  "id": "uuid",
  "blok": "Blok A",
  "nomor": "12"
}
```

### DELETE `/api/rumah?id=<uuid>`
Response sukses:
```json
{
  "success": true,
  "message": "Rumah berhasil dihapus"
}
```

## 4.3 `/api/users/link-rumah`

Sudah ada (`PUT`), mohon dipertahankan kontraknya:
```json
{
  "userId": "uuid-user",
  "rumahId": "uuid-rumah"
}
```

## 5) Validasi & Security Rules (Selaras Prisma + Jira)

Berdasarkan `prisma/schema.prisma`:
- Enum role valid: `ADMIN | SECURITY | WARGA`
- `User.password` nullable di schema, tapi untuk akun credentials harus dipaksa valid saat create/update via endpoint yang relevan.

Rules minimum:
- Hanya role `ADMIN` yang boleh create/update/delete user.
- Role input harus strict ke enum Prisma.
- Password credentials: minimum length (sesuai SDPR-69), hash sebelum simpan.
- Error login wajib generik: "Email atau password salah" (hindari bocor detail).
- Tambahkan rate limiting login (SDPR-73), return `429` jika limit tercapai.

## 6) Dampak Jika Belum Dikerjakan

- FE tetap menampilkan fallback status dan tidak crash, tapi:
  - aksi edit/hapus user tidak benar-benar persist,
  - aksi edit/hapus rumah tidak benar-benar persist,
  - acceptance SDPR-4/SDPR-10 belum bisa dinyatakan end-to-end complete.

## 7) Definition of Done (Backend Side)

Checklist backend dianggap selesai jika:
- [ ] `GET/PUT/DELETE /api/users` berfungsi sesuai kontrak.
- [ ] `PUT/DELETE /api/rumah` berfungsi sesuai kontrak.
- [ ] Proteksi admin untuk endpoint manajemen user aktif.
- [ ] Validasi role strict sesuai enum Prisma.
- [ ] Validasi password + hashing berjalan.
- [ ] Error login sudah generik anti enumerasi.
- [ ] Rate limit login aktif.
