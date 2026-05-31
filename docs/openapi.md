# Swagger-Style API Reference

## Common response envelope

Most endpoints return JSON in this shape:

```json
{
  "success": true,
  "data": {}
}
```

Error responses use the project error handler or direct `NextResponse.json(...)` with an error payload in this shape:

```json
{
  "error": "Error message description"
}
```

---

## Packages

### GET /api/packages

List packages with filters. Warga role is automatically isolated to view only packages within their own unit.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `unit` | string | no | Filter by unit number |
| `status` | string | no | Filter by package status (`RECEIVED_BY_SECURITY`, `DELIVERED_TO_WARGA`, `EXPIRED`) |
| `sort` | string | no | `lama` maps to ascending order, otherwise descending |
| `courier` | string | no | Filter by courier name |
| `startDate` | string | no | Start of date range (Format: `YYYY-MM-DD`) |
| `endDate` | string | no | End of date range (Format: `YYYY-MM-DD`) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_1",
      "trackingNumber": "JNE123456",
      "courierName": "JNE Express",
      "recipientName": "Andi",
      "unitNumber": "A-1",
      "status": "RECEIVED_BY_SECURITY",
      "receivedAt": "2026-05-28T10:00:00.000Z",
      "pickedUpAt": null,
      "pickedUpBy": null,
      "penaltyAmount": 0,
      "penaltyPaid": false,
      "securityId": "sec_1",
      "wargaId": "warga_1",
      "security": { "name": "Budi" },
      "warga": { "name": "Andi" },
      "penalty": 0
    }
  ]
}
```

### POST /api/packages

Create/register a new package. Accessible by Security and Admin roles.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courierName` | string | yes | Name of the courier/expedition |
| `recipientName` | string | yes | Name of the resident recipient |
| `unitNumber` | string | yes | Destination unit number |
| `trackingNumber` | string | no | Tracking receipt number |
| `wargaId` | string | no | Linked resident ID |

Response:

```json
{
  "success": true,
  "data": {
    "id": "pkg_2",
    "trackingNumber": "JNT987654",
    "courierName": "J&T Express",
    "recipientName": "Andi",
    "unitNumber": "A-1",
    "status": "RECEIVED_BY_SECURITY",
    "receivedAt": "2026-05-28T11:00:00.000Z",
    "pickedUpAt": null,
    "pickedUpBy": null,
    "penaltyAmount": 0,
    "penaltyPaid": false,
    "securityId": "sec_1",
    "wargaId": "warga_1"
  }
}
```

### PUT /api/packages

Update package details. Accessible by Security and Admin roles.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the package to update |
| `courierName` | string | no | Updated courier name |
| `trackingNumber` | string | no | Updated tracking receipt number |
| `recipientName` | string | no | Updated recipient name |
| `unitNumber` | string | no | Updated destination unit number |

Response:

```json
{
  "success": true,
  "data": {
    "id": "pkg_2",
    "trackingNumber": "JNT987654-UPDATED",
    "courierName": "J&T Express",
    "recipientName": "Andi Wijaya",
    "unitNumber": "A-1",
    "status": "RECEIVED_BY_SECURITY",
    "receivedAt": "2026-05-28T11:00:00.000Z",
    "pickedUpAt": null,
    "pickedUpBy": null,
    "penaltyAmount": 0,
    "penaltyPaid": false,
    "securityId": "sec_1",
    "wargaId": "warga_1"
  }
}
```

### DELETE /api/packages

Delete a package log. Accessible by Admin role only.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the package to delete |

Response:

```json
{
  "success": true,
  "message": "Log paket berhasil dihapus."
}
```

---

## Package Operations

### PATCH /api/packages/handover

Record package handover (collection) to warga and handle denda payments. Accessible by Security and Admin roles.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the package being collected |
| `pickedUpBy` | string | yes | Name of the person picking up the package |
| `penaltyAmount` | number | yes | Calculated penalty amount |
| `penaltyPaid` | boolean | yes | Status of penalty payment |

Response:

```json
{
  "success": true,
  "data": {
    "id": "pkg_1",
    "status": "DELIVERED_TO_WARGA",
    "pickedUpAt": "2026-05-28T14:30:00.000Z",
    "pickedUpBy": "Andi",
    "penaltyAmount": 4000,
    "penaltyPaid": true
  }
}
```

### GET /api/packages/penalty

Calculate penalty amount based on the number of late days. Unauthenticated.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `hariTerlambat` | number | yes | Number of days delayed |

Response:

```json
{
  "success": true,
  "data": {
    "hariTerlambat": 5,
    "penalty": 4000
  }
}
```

### GET /api/packages/analytics

Fetch overall package analytical summaries for graphs (daily volume, status breakdown, block distribution, denda history). Accessible by Admin role only.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `days` | integer | no | Number of past days to fetch (Default: `30`) |

Response:

```json
{
  "success": true,
  "data": {
    "dailyVolume": [
      { "date": "2026-05-27", "entry": 5, "pickup": 3 },
      { "date": "2026-05-28", "entry": 8, "pickup": 6 }
    ],
    "distributionByBlock": [
      { "name": "A", "value": 15 },
      { "name": "B", "value": 8 }
    ],
    "statusStats": [
      { "name": "RECEIVED_BY_SECURITY", "value": 5 },
      { "name": "DELIVERED_TO_WARGA", "value": 18 }
    ],
    "penaltyHistory": [
      { "name": "Jan", "value": 0 },
      { "name": "Mei", "value": 12000 }
    ]
  }
}
```

### GET /api/packages/statistics

Fetch today's summary statistics and top 5 recent packages for the Satpam dashboard. Accessible by Security and Admin roles.

Response:

```json
{
  "success": true,
  "data": {
    "date": "2026-05-28",
    "total": 3,
    "byStatus": {
      "RECEIVED_BY_SECURITY": 1,
      "DELIVERED_TO_WARGA": 2,
      "EXPIRED": 0
    },
    "recent": [
      {
        "id": "pkg_1",
        "trackingNumber": "JNE123456",
        "courierName": "JNE Express",
        "recipientName": "Andi",
        "unitNumber": "A-1",
        "status": "RECEIVED_BY_SECURITY",
        "receivedAt": "2026-05-28T10:00:00.000Z",
        "warga": {
          "name": "Andi",
          "unitNumber": "A-1"
        }
      }
    ]
  }
}
```

### GET /api/packages/stats

Fetch overall system package metrics (total, pending, pickedUp, expired, totalPenalty) filtered by the authenticated user's scope. All roles.

Response:

```json
{
  "success": true,
  "data": {
    "total": 23,
    "pending": 5,
    "pickedUp": 15,
    "expired": 3,
    "totalPenalty": 24000
  }
}
```

---

## Rumah (Housing Units)

### GET /api/rumah

List housing units. Accessible by Admin role only.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `q` | string | no | Search query for block or unit number |
| `search` | string | no | Alias for `q` |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "rumah_uuid_1",
      "blok": "A",
      "nomor": "1",
      "createdAt": "2026-05-28T10:00:00.000Z",
      "updatedAt": "2026-05-28T10:00:00.000Z",
      "penghuni": [
        {
          "id": "user_uuid_1",
          "name": "Warga Blok A1",
          "email": "warga.a@sistem.com",
          "role": "WARGA"
        }
      ]
    }
  ]
}
```

### POST /api/rumah

Create a new housing unit. Accessible by Admin role only.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `blok` | string | yes | Block code (e.g., A) |
| `nomor` | string | yes | Unit number (e.g., 1) |

Response:

```json
{
  "success": true,
  "data": {
    "id": "rumah_uuid_2",
    "blok": "D",
    "nomor": "5",
    "createdAt": "2026-05-28T15:00:00.000Z",
    "updatedAt": "2026-05-28T15:00:00.000Z"
  }
}
```

### PUT /api/rumah

Update an existing housing unit. Accessible by Admin role only.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the housing unit to update |
| `blok` | string | no | Updated block code |
| `nomor` | string | no | Updated unit number |

Response:

```json
{
  "success": true,
  "data": {
    "id": "rumah_uuid_2",
    "blok": "D-UPDATED",
    "nomor": "5",
    "createdAt": "2026-05-28T15:00:00.000Z",
    "updatedAt": "2026-05-28T15:05:00.000Z"
  }
}
```

### DELETE /api/rumah

Delete a housing unit. Accessible by Admin role only.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the housing unit to delete |

Response:

```json
{
  "success": true,
  "data": {
    "id": "rumah_uuid_2",
    "blok": "D-UPDATED",
    "nomor": "5"
  },
  "message": "Rumah berhasil dihapus"
}
```

---

## Users

### GET /api/users

List registered users. Accessible by Admin role only.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `role` | string | no | Filter by user role (`ADMIN`, `SECURITY`, `WARGA`) |
| `sort` | string | no | Sort direction for creation date (`asc`, `desc`) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "user_uuid_1",
      "name": "Warga Blok A1",
      "email": "warga.a@sistem.com",
      "role": "WARGA",
      "unitNumber": "A-1",
      "rumahId": "rumah_uuid_1",
      "createdAt": "2026-05-28T10:00:00.000Z",
      "updatedAt": "2026-05-28T10:00:00.000Z",
      "rumah": {
        "id": "rumah_uuid_1",
        "blok": "A",
        "nomor": "1"
      }
    }
  ]
}
```

### POST /api/users

Register/create a new user. Accessible by Admin role only.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | yes | User's full name |
| `email` | string | yes | User's unique email address |
| `password` | string | yes | User's account password |
| `role` | string | yes | User's role (`ADMIN`, `SECURITY`, `WARGA`) |
| `unitNumber` | string | no | Unit number (Required for `WARGA` role) |

Response:

```json
{
  "success": true,
  "data": {
    "id": "user_uuid_3",
    "name": "Satpam Baru",
    "email": "satpam.baru@sistem.com",
    "role": "SECURITY",
    "unitNumber": null
  }
}
```

### PUT /api/users

Update user account information. Accessible by Admin role only.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the user to update |
| `name` | string | no | Updated name |
| `email` | string | no | Updated email |
| `password` | string | no | Updated password (will be hashed automatically) |
| `role` | string | no | Updated role |
| `unitNumber` | string | no | Updated unit number |

Response:

```json
{
  "success": true,
  "data": {
    "id": "user_uuid_3",
    "name": "Satpam Baru - Updated",
    "email": "satpam.baru.upd@sistem.com",
    "role": "SECURITY",
    "unitNumber": null
  }
}
```

### DELETE /api/users

Delete a user account. Accessible by Admin role only.

| Query Param / Body | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | ID of the user to delete (can be passed in URL query or request body) |

Response:

```json
{
  "success": true,
  "data": {
    "id": "user_uuid_3"
  },
  "message": "User berhasil dihapus"
}
```

### PUT /api/users/link-rumah

Link or unlink a user to/from a unit (Rumah). Accessible by Admin role only.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | string | yes | ID of the user to link |
| `rumahId` | string | yes | ID of the unit to link (send `null` to unlink) |

Response (Link):

```json
{
  "success": true,
  "message": "User berhasil dihubungkan ke Rumah",
  "data": {
    "id": "user_uuid_1",
    "rumahId": "rumah_uuid_1",
    "rumah": {
      "id": "rumah_uuid_1",
      "blok": "A",
      "nomor": "1"
    }
  }
}
```

Response (Unlink):

```json
{
  "success": true,
  "message": "Pemetaan rumah pengguna berhasil dibatalkan",
  "data": {
    "id": "user_uuid_1",
    "rumahId": null,
    "rumah": null
  }
}
```

### GET /api/users/search-warga

Autocomplete endpoint for searching residents by name or unit. Accessible by Security and Admin roles.

| Query Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | Search keyword (Minimum 2 characters) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "user_uuid_1",
      "name": "Warga Blok A1",
      "unitNumber": "A-1",
      "activePackages": 1,
      "floor": "Blok A"
    }
  ]
}
```

---

## Background Tasks

### GET /api/cron/expire-packages

Verify and transition all packages that have passed the expiry limit threshold to the `EXPIRED` status. Triggered daily.

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | string | yes | Authorization token header (`Bearer <CRON_SECRET>`) |

Response:

```json
{
  "success": true,
  "message": "Background task cron executed successfully",
  "updatedCount": 3
}
```
