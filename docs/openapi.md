# API Documentation (OpenAPI / Swagger Specification) 📖

Dokumen ini berisi spesifikasi API proyek **Sistem Paket Warga** yang mengikuti format **OpenAPI Specification (OAS) 3.0.0**. 

Anda dapat menyalin blok YAML di bawah ini dan menempelkannya ke [Swagger Editor](https://editor.swagger.io/) untuk melihatnya secara interaktif dan melakukan uji coba (*test request*).

---

## 📄 OpenAPI 3.0.0 YAML Specification

```yaml
openapi: 3.0.0
info:
  title: Sistem Paket Warga API
  description: Dokumentasi API untuk manajemen logistik paket, manajemen hunian warga, dan audit trail sistem.
  version: 1.0.0
servers:
  - url: http://localhost:3000
    description: Development Server
paths:
  /api/packages:
    get:
      summary: Mendapatkan daftar paket
      description: Mengambil data paket dengan opsi filter. Warga hanya dapat melihat paket miliknya sendiri (terisolasi otomatis).
      parameters:
        - name: unit
          in: query
          description: Nomor unit rumah (contoh: A-1)
          schema:
            type: string
        - name: status
          in: query
          description: Status paket (RECEIVED_BY_SECURITY, DELIVERED_TO_WARGA, EXPIRED)
          schema:
            type: string
        - name: courier
          in: query
          description: Nama kurir/ekspedisi pencarian
          schema:
            type: string
        - name: startDate
          in: query
          description: Batas awal tanggal masuk (YYYY-MM-DD)
          schema:
            type: string
        - name: endDate
          in: query
          description: Batas akhir tanggal masuk (YYYY-MM-DD)
          schema:
            type: string
        - name: sort
          in: query
          description: Urutan waktu (baru, lama)
          schema:
            type: string
      responses:
        '200':
          description: Berhasil mengambil daftar paket.
        '401':
          description: Unauthorized (User belum login).
        '403':
          description: Forbidden (Unit belum ditautkan untuk Warga).

    post:
      summary: Mencatat paket baru
      description: Hanya dapat diakses oleh Security atau Admin untuk mendaftarkan paket yang baru sampai di pos.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - courierName
                - recipientName
                - unitNumber
              properties:
                courierName:
                  type: string
                  example: JNE Express
                recipientName:
                  type: string
                  example: Budi Utomo
                unitNumber:
                  type: string
                  example: A-1
                trackingNumber:
                  type: string
                  example: JNE123456789
                wargaId:
                  type: string
                  example: user-uuid-123
      responses:
        '201':
          description: Paket berhasil dibuat.
        '400':
          description: Bad Request (Input kurang/tidak valid).
        '403':
          description: Forbidden (Bukan Security/Admin).
        '404':
          description: Not Found (Unit rumah tidak terdaftar).

    put:
      summary: Mengubah data paket
      description: Mengupdate data kurir, resi, nama penerima, atau unit rumah. Hanya untuk Security / Admin.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
              properties:
                id:
                  type: string
                courierName:
                  type: string
                trackingNumber:
                  type: string
                recipientName:
                  type: string
                unitNumber:
                  type: string
      responses:
        '200':
          description: Paket berhasil diperbarui.
        '400':
          description: ID paket wajib diisi.
        '403':
          description: Forbidden.

    delete:
      summary: Menghapus log data paket
      description: Hanya diperbolehkan untuk Role ADMIN.
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Log paket berhasil dihapus.
        '400':
          description: ID paket wajib diisi.
        '403':
          description: Forbidden (Bukan Admin).

  /api/packages/handover:
    patch:
      summary: Memproses penyerahan paket ke warga
      description: Digunakan satpam untuk melakukan serah terima paket dan mencatat denda jika ada keterlambatan.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
                - pickedUpBy
              properties:
                id:
                  type: string
                  description: ID paket yang diserahkan
                pickedUpBy:
                  type: string
                  description: Nama penerima yang mengambil paket
                  example: Istri Budi
                penaltyAmount:
                  type: number
                  description: Jumlah denda yang dibebankan
                  example: 4000
                penaltyPaid:
                  type: boolean
                  description: Status pembayaran denda
                  example: true
      responses:
        '200':
          description: Penyerahan paket sukses.
        '400':
          description: Input tidak lengkap.
        '403':
          description: Hak akses ditolak.

  /api/packages/penalty:
    get:
      summary: Kalkulator hitung denda keterlambatan paket
      description: Menghitung denda secara otomatis. 3 Hari pertama gratis (Free), mulai hari ke-4 denda Rp 2.000 / hari.
      parameters:
        - name: hariTerlambat
          in: query
          required: true
          schema:
            type: integer
            minimum: 0
            example: 5
      responses:
        '200':
          description: Perhitungan denda berhasil dikembalikan.
        '400':
          description: Parameter terlambat tidak valid.

  /api/packages/analytics:
    get:
      summary: Mengambil data visualisasi tren analitik (Dashboard Admin)
      description: Mengambil volume harian, persentase status paket, distribusi per blok, dan tren denda.
      parameters:
        - name: days
          in: query
          schema:
            type: integer
            default: 30
      responses:
        '200':
          description: Sukses mengambil statistik grafik.
        '403':
          description: Forbidden (Hanya untuk ADMIN).

  /api/packages/statistics:
    get:
      summary: Statistik log paket hari ini (Satpam Dashboard)
      description: Menampilkan total paket hari ini, status breakdown (satpam), dan daftar 5 paket terbaru.
      responses:
        '200':
          description: Sukses mengambil summary hari ini.
        '401':
          description: Unauthorized.

  /api/packages/stats:
    get:
      summary: Summary box paket untuk dashboard (Semua Role)
      description: Menampilkan jumlah paket total, menunggu pengambilan, sudah diambil, kadaluarsa, dan total denda.
      responses:
        '200':
          description: Sukses.

  /api/rumah:
    get:
      summary: Mendapatkan data unit rumah
      parameters:
        - name: q
          in: query
          description: Query pencarian blok atau nomor rumah
          schema:
            type: string
      responses:
        '200':
          description: Berhasil mengambil unit rumah.
    post:
      summary: Membuat unit rumah baru
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - blok
                - nomor
              properties:
                blok:
                  type: string
                nomor:
                  type: string
      responses:
        '201':
          description: Rumah berhasil dibuat.
    put:
      summary: Mengedit data unit rumah
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
                - blok
                - nomor
      responses:
        '200':
          description: Sukses update.
    delete:
      summary: Menghapus unit rumah
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Sukses terhapus.

  /api/users:
    get:
      summary: Mendapatkan daftar user warga dan petugas
      parameters:
        - name: role
          in: query
          schema:
            type: string
        - name: sort
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Sukses.
    post:
      summary: Registrasi user baru oleh Admin
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
                - role
      responses:
        '201':
          description: User sukses dibuat.
    put:
      summary: Mengubah informasi user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: Sukses diupdate.
    delete:
      summary: Menghapus user
      parameters:
        - name: id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Sukses dihapus.

  /api/users/link-rumah:
    put:
      summary: Menautkan/memutuskan relasi User dengan Unit Rumah
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - userId
              properties:
                userId:
                  type: string
                rumahId:
                  type: string
                  nullable: true
      responses:
        '200':
          description: Pemetaan unit berhasil diubah.

  /api/users/search-warga:
    get:
      summary: Autocomplete pencarian warga untuk penerimaan paket
      parameters:
        - name: q
          in: query
          required: true
          description: Pencarian nama warga minimal 2 karakter
          schema:
            type: string
      responses:
        '200':
          description: Mengembalikan daftar warga yang cocok.

  /api/cron/expire-packages:
    get:
      summary: Menjalankan pemindaian otomatis paket kadaluarsa
      description: Dipanggil terjadwal via Vercel Crons. Memverifikasi CRON_SECRET lewat Authorization Header.
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Pemindaian selesai dan status paket diperbarui.
        '401':
          description: Cron secret tidak valid / hilang.
```

---

## 📖 Ringkasan Endpoint & Format Data (Markdown Format)

### 📦 Endpoint Manajemen Paket

#### 1. `GET /api/packages`
- **Tujuan**: Mengambil daftar paket berdasarkan filter.
- **Autentikasi**: Ya (Semua Role). *Data warga diisolasi secara otomatis berdasarkan unit session.*
- **Query Parameters**:
  - `unit` (string, optional) - Nomor unit rumah (contoh: `A-1`).
  - `status` (string, optional) - Status paket (`RECEIVED_BY_SECURITY`, `DELIVERED_TO_WARGA`, `EXPIRED`).
  - `courier` (string, optional) - Nama kurir.
  - `startDate` (string, optional) - Rentang awal tanggal (Format: `YYYY-MM-DD`).
  - `endDate` (string, optional) - Rentang akhir tanggal (Format: `YYYY-MM-DD`).
  - `sort` (string, optional) - Urutan waktu (`baru` atau `lama`).
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "package-uuid",
        "trackingNumber": "JNE123456",
        "courierName": "JNE",
        "recipientName": "Budi",
        "unitNumber": "A-1",
        "status": "RECEIVED_BY_SECURITY",
        "receivedAt": "2026-05-28T09:00:00.000Z",
        "penalty": 0
      }
    ]
  }
  ```

#### 2. `POST /api/packages`
- **Tujuan**: Satpam/Admin mencatat paket masuk yang baru datang di pos.
- **Autentikasi**: Ya (Hanya `SECURITY` / `ADMIN`).
- **Request Body (JSON)**:
  ```json
  {
    "courierName": "JNE Express",
    "recipientName": "Budi Utomo",
    "unitNumber": "A-1",
    "trackingNumber": "JNE123456789", // Opsional
    "wargaId": "warga-user-uuid" // Opsional (jika ditautkan langsung)
  }
  ```
- **Respon Sukses (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "package-uuid",
      "courierName": "JNE Express",
      "recipientName": "Budi Utomo",
      "unitNumber": "A-1",
      "status": "RECEIVED_BY_SECURITY"
    }
  }
  ```

#### 3. `PATCH /api/packages/handover`
- **Tujuan**: Memproses serah terima paket ke warga dan mencatat denda.
- **Autentikasi**: Ya (Hanya `SECURITY` / `ADMIN`).
- **Request Body (JSON)**:
  ```json
  {
    "id": "package-uuid",
    "pickedUpBy": "Istri Budi",
    "penaltyAmount": 4000,
    "penaltyPaid": true
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "package-uuid",
      "status": "DELIVERED_TO_WARGA",
      "pickedUpAt": "2026-05-28T10:15:00.000Z",
      "pickedUpBy": "Istri Budi",
      "penaltyAmount": 4000,
      "penaltyPaid": true
    }
  }
  ```

#### 4. `GET /api/packages/penalty`
- **Tujuan**: Menghitung denda keterlambatan paket secara cepat di pos.
- **Autentikasi**: Tidak (Terbuka untuk umum/kalkulator pos).
- **Query Parameters**:
  - `hariTerlambat` (integer, required) - Jumlah hari keterlambatan paket.
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "hariTerlambat": 5,
      "penalty": 4000
    }
  }
  ```

---

### 🏡 Endpoint Manajemen Unit Rumah (Admin Only)

#### 1. `GET /api/rumah`
- **Query Parameters**: `q` atau `search` (pencarian nama blok / nomor).
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "rumah-uuid",
        "blok": "A",
        "nomor": "1",
        "penghuni": [
          { "name": "Budi", "email": "budi@example.com" }
        ]
      }
    ]
  }
  ```

#### 2. `POST /api/rumah`
- **Request Body**: `{ "blok": "D", "nomor": "5" }`
- **Respon Sukses (201 Created)**

---

### ⏰ Background Cron Endpoint

#### 1. `GET /api/cron/expire-packages`
- **Tujuan**: Menjalankan pengecekan terjadwal untuk paket kadaluarsa.
- **Header Autentikasi**: `Authorization: Bearer <CRON_SECRET>`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Background task cron executed successfully",
    "updatedCount": 3
  }
  ```
