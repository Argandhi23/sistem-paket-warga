-- Supabase Database Data Export
-- Generated on: 2026-06-04T14:50:03.394Z

BEGIN;

-- Disable triggers to prevent foreign key violations during restore
SET session_replication_role = 'replica';

-- Clean existing data in reverse order of dependency
TRUNCATE TABLE "ActivityLog" CASCADE;
TRUNCATE TABLE "Package" CASCADE;
TRUNCATE TABLE "Session" CASCADE;
TRUNCATE TABLE "Account" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "Rumah" CASCADE;

-- Data for table: Rumah (3 rows)
INSERT INTO "Rumah" ("id", "blok", "nomor", "createdAt", "updatedAt") VALUES ('07970ec7-caaf-47f2-ab74-3c384d1f1dea', 'A', '1', '2026-06-03T03:23:04.638Z', '2026-06-03T03:23:04.638Z');
INSERT INTO "Rumah" ("id", "blok", "nomor", "createdAt", "updatedAt") VALUES ('cf16f25a-338d-48ea-bf37-fe8f0739cff6', 'B', '2', '2026-06-03T03:23:04.681Z', '2026-06-03T03:23:04.681Z');
INSERT INTO "Rumah" ("id", "blok", "nomor", "createdAt", "updatedAt") VALUES ('0a997aad-fe68-4bee-ae5d-51d22af75cae', 'C', '3', '2026-06-03T03:23:04.715Z', '2026-06-03T03:23:04.715Z');

-- Data for table: User (4 rows)
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password", "role", "unitNumber", "createdAt", "updatedAt", "rumahId") VALUES ('c22d9cf8-20e1-45fe-b537-2d73db3fedea', 'Administrator', 'admin@sistem.com', NULL, NULL, '$2b$10$FgRzzNhwLzBtOO9jhf05hOUdTFLNRoczAkgVwpAvSJK5Xby5ZRyXu', 'ADMIN', NULL, '2026-06-03T03:23:04.812Z', '2026-06-03T03:23:04.812Z', NULL);
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password", "role", "unitNumber", "createdAt", "updatedAt", "rumahId") VALUES ('aba609d7-fc25-41f2-b8d3-23cef7469390', 'Pak Satpam', 'security@sistem.com', NULL, NULL, '$2b$10$FgRzzNhwLzBtOO9jhf05hOUdTFLNRoczAkgVwpAvSJK5Xby5ZRyXu', 'SECURITY', NULL, '2026-06-03T03:23:04.854Z', '2026-06-03T03:23:04.854Z', NULL);
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password", "role", "unitNumber", "createdAt", "updatedAt", "rumahId") VALUES ('42507c01-c11e-4da1-af9c-a2103df8da96', 'Warga Blok A1', 'warga.a@sistem.com', NULL, NULL, '$2b$10$FgRzzNhwLzBtOO9jhf05hOUdTFLNRoczAkgVwpAvSJK5Xby5ZRyXu', 'WARGA', 'A-1', '2026-06-03T03:23:04.891Z', '2026-06-03T03:23:04.891Z', '07970ec7-caaf-47f2-ab74-3c384d1f1dea');
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password", "role", "unitNumber", "createdAt", "updatedAt", "rumahId") VALUES ('0d40966c-d43f-4d04-8cdd-7b083f6e928b', 'Warga Blok B2', 'warga.b@sistem.com', NULL, NULL, '$2b$10$FgRzzNhwLzBtOO9jhf05hOUdTFLNRoczAkgVwpAvSJK5Xby5ZRyXu', 'WARGA', 'B-2', '2026-06-03T03:23:04.925Z', '2026-06-03T03:23:04.925Z', 'cf16f25a-338d-48ea-bf37-fe8f0739cff6');

-- Data for table: Package (4 rows)
INSERT INTO "Package" ("id", "trackingNumber", "courierName", "recipientName", "unitNumber", "status", "receivedAt", "pickedUpAt", "wargaId", "securityId", "penaltyAmount", "penaltyPaid", "pickedUpBy") VALUES ('9464fdad-c07d-4aa6-beb0-98245a7f15ca', 'SPW-JNE-1001', 'JNE Express', 'Warga Blok A1', 'A-1', 'RECEIVED_BY_SECURITY', '2026-06-03T01:23:04.957Z', NULL, '42507c01-c11e-4da1-af9c-a2103df8da96', 'aba609d7-fc25-41f2-b8d3-23cef7469390', 0, false, NULL);
INSERT INTO "Package" ("id", "trackingNumber", "courierName", "recipientName", "unitNumber", "status", "receivedAt", "pickedUpAt", "wargaId", "securityId", "penaltyAmount", "penaltyPaid", "pickedUpBy") VALUES ('78bf4993-247e-4791-8799-017c18205fae', 'SPW-JNT-2002', 'J&T Express', 'Warga Blok A1', 'A-1', 'DELIVERED_TO_WARGA', '2026-05-29T03:23:04.999Z', '2026-05-30T03:23:04.999Z', '42507c01-c11e-4da1-af9c-a2103df8da96', 'aba609d7-fc25-41f2-b8d3-23cef7469390', 0, false, 'Warga Blok A1');
INSERT INTO "Package" ("id", "trackingNumber", "courierName", "recipientName", "unitNumber", "status", "receivedAt", "pickedUpAt", "wargaId", "securityId", "penaltyAmount", "penaltyPaid", "pickedUpBy") VALUES ('7b45a857-2aa2-4378-830e-689cc26b8360', 'SPW-SIC-3003', 'SiCepat', 'Warga Blok B2', 'B-2', 'EXPIRED', '2026-05-24T03:23:05.037Z', NULL, '0d40966c-d43f-4d04-8cdd-7b083f6e928b', 'aba609d7-fc25-41f2-b8d3-23cef7469390', 0, false, NULL);
INSERT INTO "Package" ("id", "trackingNumber", "courierName", "recipientName", "unitNumber", "status", "receivedAt", "pickedUpAt", "wargaId", "securityId", "penaltyAmount", "penaltyPaid", "pickedUpBy") VALUES ('038b32ca-87d9-46a3-9475-c26f46b6b94f', 'TEST-RES-999', 'JNE', 'Warga Blok A1', 'A-1', 'RECEIVED_BY_SECURITY', '2026-06-03T03:25:04.224Z', NULL, '42507c01-c11e-4da1-af9c-a2103df8da96', 'aba609d7-fc25-41f2-b8d3-23cef7469390', 0, false, NULL);

-- Data for table: ActivityLog (1 rows)
INSERT INTO "ActivityLog" ("id", "action", "entityType", "entityId", "details", "userId", "createdAt") VALUES ('8bd12c22-a4d3-4a09-9be1-3ed133470f3f', 'PACKAGE_REGISTRATION', 'Package', '038b32ca-87d9-46a3-9475-c26f46b6b94f', '{"courier":"JNE","recipient":"Warga Blok A1"}', 'aba609d7-fc25-41f2-b8d3-23cef7469390', '2026-06-03T03:25:04.260Z');

-- Re-enable triggers
SET session_replication_role = 'origin';

COMMIT;
