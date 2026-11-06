import { Role, PackageStatus, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new pg.Pool({ connectionString });
// @ts-expect-error: Type mismatch from internal library dependencies
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

function daysAgo(days: number, hoursOffset = 0): Date {
  return new Date(Date.now() - days * DAY - hoursOffset * HOUR);
}

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rumah.deleteMany({});

  // 2. Create Rumah/Units across Blok A, B, C, D (12 units)
  const unitsSpec = [
    { blok: 'A', nomor: '1' },
    { blok: 'A', nomor: '2' },
    { blok: 'A', nomor: '3' },
    { blok: 'B', nomor: '1' },
    { blok: 'B', nomor: '2' },
    { blok: 'B', nomor: '3' },
    { blok: 'C', nomor: '1' },
    { blok: 'C', nomor: '2' },
    { blok: 'C', nomor: '3' },
    { blok: 'D', nomor: '1' },
    { blok: 'D', nomor: '2' },
    { blok: 'D', nomor: '3' },
  ];

  const rumahMap: Record<string, { id: string; blok: string; nomor: string }> = {};
  for (const u of unitsSpec) {
    const created = await prisma.rumah.create({ data: u });
    rumahMap[`${u.blok}-${u.nomor}`] = created;
  }

  console.log('Created 12 Rumah/Units.');

  // 3. Create Users with hashed passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User (Demo Login)
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@sistem.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // Security Users (Demo Login + Shift Malam)
  const security = await prisma.user.create({
    data: {
      name: 'Pak Satpam Hendra',
      email: 'security@sistem.com',
      password: passwordHash,
      role: Role.SECURITY,
    },
  });

  const security2 = await prisma.user.create({
    data: {
      name: 'Agus Pratama (Satpam)',
      email: 'security.malam@sistem.com',
      password: passwordHash,
      role: Role.SECURITY,
    },
  });

  // Demo Warga Users (A-1 & B-2)
  const wargaA1 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'warga.a@sistem.com',
      password: passwordHash,
      role: Role.WARGA,
      unitNumber: 'A-1',
      rumahId: rumahMap['A-1'].id,
    },
  });

  const wargaB2 = await prisma.user.create({
    data: {
      name: 'Siti Rahmawati',
      email: 'warga.b@sistem.com',
      password: passwordHash,
      role: Role.WARGA,
      unitNumber: 'B-2',
      rumahId: rumahMap['B-2'].id,
    },
  });

  // Additional Residents (8 more residents -> 10 of 12 units occupied = 83%)
  const extraResidentsSpec = [
    { name: 'Rizky Pratama', email: 'rizky.a2@sistem.com', unit: 'A-2' },
    { name: 'Dewi Lestari', email: 'dewi.a3@sistem.com', unit: 'A-3' },
    { name: 'Andi Wijaya', email: 'andi.b1@sistem.com', unit: 'B-1' },
    { name: 'Nadia Putri', email: 'nadia.b3@sistem.com', unit: 'B-3' },
    { name: 'Fajar Nugroho', email: 'fajar.c1@sistem.com', unit: 'C-1' },
    { name: 'Rina Kartika', email: 'rina.c2@sistem.com', unit: 'C-2' },
    { name: 'Dimas Saputra', email: 'dimas.d1@sistem.com', unit: 'D-1' },
    { name: 'Maya Sari', email: 'maya.d2@sistem.com', unit: 'D-2' },
  ];

  const wargaByUnit: Record<string, { id: string; name: string; unit: string }> = {
    'A-1': { id: wargaA1.id, name: wargaA1.name || 'Budi Santoso', unit: 'A-1' },
    'B-2': { id: wargaB2.id, name: wargaB2.name || 'Siti Rahmawati', unit: 'B-2' },
  };

  for (const r of extraResidentsSpec) {
    const u = await prisma.user.create({
      data: {
        name: r.name,
        email: r.email,
        password: passwordHash,
        role: Role.WARGA,
        unitNumber: r.unit,
        rumahId: rumahMap[r.unit].id,
      },
    });
    wargaByUnit[r.unit] = { id: u.id, name: r.name, unit: r.unit };
  }

  console.log('Created Users (1 Admin, 2 Security, 10 Warga).');

  // 4. Create Packages (Active, Delivered, and Overdue/Expired across blocks & dates)
  const packagesData = [
    // --- ACTIVE PACKAGES (RECEIVED_BY_SECURITY, <= 2 days old) ---
    {
      trackingNumber: 'SPW-JNE-88201',
      courierName: 'JNE Express',
      unit: 'A-1',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(0, 2),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SPX-88204',
      courierName: 'Shopee Express',
      unit: 'A-1',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(1, 3),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNT-88209',
      courierName: 'J&T Express',
      unit: 'B-2',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(0, 5),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SIC-88212',
      courierName: 'SiCepat',
      unit: 'A-2',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(0, 7),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-ANT-88215',
      courierName: 'AnterAja',
      unit: 'C-1',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(1, 6),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNE-88219',
      courierName: 'JNE Express',
      unit: 'D-1',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: daysAgo(2, 1),
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security2.id,
    },

    // --- OVERDUE / EXPIRED PACKAGES (> 3 days in pos satpam) ---
    {
      trackingNumber: 'SPW-JNT-77102',
      courierName: 'J&T Express',
      unit: 'A-1',
      status: PackageStatus.EXPIRED,
      receivedAt: daysAgo(6, 2), // 6 days ago -> 3 days late -> Rp 6.000
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 6000,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SIC-77105',
      courierName: 'SiCepat',
      unit: 'B-2',
      status: PackageStatus.EXPIRED,
      receivedAt: daysAgo(8, 4), // 8 days ago -> 5 days late -> Rp 10.000
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 10000,
      penaltyPaid: false,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-SPX-77109',
      courierName: 'Shopee Express',
      unit: 'B-3',
      status: PackageStatus.EXPIRED,
      receivedAt: daysAgo(5, 1), // 5 days ago -> 2 days late -> Rp 4.000
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 4000,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-POS-77114',
      courierName: 'Pos Indonesia',
      unit: 'C-2',
      status: PackageStatus.EXPIRED,
      receivedAt: daysAgo(7, 3), // 7 days ago -> 4 days late -> Rp 8.000
      pickedUpAt: null,
      pickedUpBy: null,
      penaltyAmount: 8000,
      penaltyPaid: false,
      secId: security2.id,
    },

    // --- DELIVERED PACKAGES (Picked up across recent days) ---
    {
      trackingNumber: 'SPW-JNE-66001',
      courierName: 'JNE Express',
      unit: 'A-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(3, 4),
      pickedUpAt: daysAgo(2, 1),
      pickedUpBy: 'Budi Santoso',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNT-66004',
      courierName: 'J&T Express',
      unit: 'A-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(9, 2),
      pickedUpAt: daysAgo(4, 2),
      pickedUpBy: 'Budi Santoso',
      penaltyAmount: 4000,
      penaltyPaid: true,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SIC-66008',
      courierName: 'SiCepat',
      unit: 'A-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(12, 5),
      pickedUpAt: daysAgo(11, 2),
      pickedUpBy: 'Ibu Ratna (Istri)',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-SPX-66011',
      courierName: 'Shopee Express',
      unit: 'B-2',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(4, 6),
      pickedUpAt: daysAgo(3, 2),
      pickedUpBy: 'Siti Rahmawati',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-ANT-66015',
      courierName: 'AnterAja',
      unit: 'B-2',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(14, 3),
      pickedUpAt: daysAgo(8, 4),
      pickedUpBy: 'Siti Rahmawati',
      penaltyAmount: 6000,
      penaltyPaid: true,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-JNE-66019',
      courierName: 'JNE Express',
      unit: 'A-3',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(2, 8),
      pickedUpAt: daysAgo(1, 2),
      pickedUpBy: 'Dewi Lestari',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNT-66022',
      courierName: 'J&T Express',
      unit: 'B-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(5, 4),
      pickedUpAt: daysAgo(4, 1),
      pickedUpBy: 'Andi Wijaya',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SPX-66025',
      courierName: 'Shopee Express',
      unit: 'C-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(7, 5),
      pickedUpAt: daysAgo(6, 2),
      pickedUpBy: 'Fajar Nugroho',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-SIC-66029',
      courierName: 'SiCepat',
      unit: 'D-2',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(10, 3),
      pickedUpAt: daysAgo(5, 1),
      pickedUpBy: 'Maya Sari',
      penaltyAmount: 4000,
      penaltyPaid: true,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNE-66033',
      courierName: 'JNE Express',
      unit: 'C-2',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(15, 4),
      pickedUpAt: daysAgo(14, 1),
      pickedUpBy: 'Rina Kartika',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-ANT-66037',
      courierName: 'AnterAja',
      unit: 'D-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(18, 2),
      pickedUpAt: daysAgo(12, 3),
      pickedUpBy: 'Dimas Saputra',
      penaltyAmount: 6000,
      penaltyPaid: true,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-JNT-66041',
      courierName: 'J&T Express',
      unit: 'A-2',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(21, 5),
      pickedUpAt: daysAgo(20, 2),
      pickedUpBy: 'Rizky Pratama',
      penaltyAmount: 0,
      penaltyPaid: false,
      secId: security.id,
    },
    {
      trackingNumber: 'SPW-SPX-66045',
      courierName: 'Shopee Express',
      unit: 'B-3',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(40, 3),
      pickedUpAt: daysAgo(34, 2),
      pickedUpBy: 'Nadia Putri',
      penaltyAmount: 6000,
      penaltyPaid: true,
      secId: security2.id,
    },
    {
      trackingNumber: 'SPW-JNE-66049',
      courierName: 'JNE Express',
      unit: 'C-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: daysAgo(68, 4),
      pickedUpAt: daysAgo(61, 2),
      pickedUpBy: 'Fajar Nugroho',
      penaltyAmount: 8000,
      penaltyPaid: true,
      secId: security.id,
    },
  ];

  const createdPackages = [];
  for (const pkg of packagesData) {
    const resident = wargaByUnit[pkg.unit];
    const created = await prisma.package.create({
      data: {
        trackingNumber: pkg.trackingNumber,
        courierName: pkg.courierName,
        recipientName: resident.name,
        unitNumber: pkg.unit,
        status: pkg.status,
        receivedAt: pkg.receivedAt,
        pickedUpAt: pkg.pickedUpAt,
        pickedUpBy: pkg.pickedUpBy,
        penaltyAmount: pkg.penaltyAmount,
        penaltyPaid: pkg.penaltyPaid,
        securityId: pkg.secId,
        wargaId: resident.id,
      },
    });
    createdPackages.push(created);
  }

  console.log(`Created ${createdPackages.length} sample Packages.`);

  // 5. Create Activity Logs (Audit Trail)
  const logsData = [
    {
      action: 'PACKAGE_REGISTRATION',
      entityType: 'Package',
      entityId: createdPackages[0].id,
      userId: security.id,
      details: JSON.stringify({
        trackingNumber: 'SPW-JNE-88201',
        courier: 'JNE Express',
        recipient: 'Budi Santoso',
        unitNumber: 'A-1',
      }),
      createdAt: daysAgo(0, 2),
    },
    {
      action: 'PACKAGE_REGISTRATION',
      entityType: 'Package',
      entityId: createdPackages[2].id,
      userId: security.id,
      details: JSON.stringify({
        trackingNumber: 'SPW-JNT-88209',
        courier: 'J&T Express',
        recipient: 'Siti Rahmawati',
        unitNumber: 'B-2',
      }),
      createdAt: daysAgo(0, 5),
    },
    {
      action: 'PACKAGE_HANDOVER',
      entityType: 'Package',
      entityId: createdPackages[15].id,
      userId: security.id,
      details: JSON.stringify({
        trackingNumber: 'SPW-JNE-66019',
        pickedUpBy: 'Dewi Lestari',
        unitNumber: 'A-3',
        penaltyPaid: 0,
      }),
      createdAt: daysAgo(1, 2),
    },
    {
      action: 'PACKAGE_HANDOVER',
      entityType: 'Package',
      entityId: createdPackages[10].id,
      userId: security.id,
      details: JSON.stringify({
        trackingNumber: 'SPW-JNE-66001',
        pickedUpBy: 'Budi Santoso',
        unitNumber: 'A-1',
        penaltyPaid: 0,
      }),
      createdAt: daysAgo(2, 1),
    },
    {
      action: 'PACKAGE_HANDOVER',
      entityType: 'Package',
      entityId: createdPackages[11].id,
      userId: security.id,
      details: JSON.stringify({
        trackingNumber: 'SPW-JNT-66004',
        pickedUpBy: 'Budi Santoso',
        unitNumber: 'A-1',
        penaltyAmount: 4000,
        penaltyPaid: true,
      }),
      createdAt: daysAgo(4, 2),
    },
    {
      action: 'USER_LINK_RUMAH',
      entityType: 'User',
      entityId: wargaA1.id,
      userId: admin.id,
      details: JSON.stringify({
        resident: 'Budi Santoso',
        unitNumber: 'A-1',
        status: 'TERTAUT',
      }),
      createdAt: daysAgo(5, 3),
    },
  ];

  for (const log of logsData) {
    await prisma.activityLog.create({ data: log });
  }

  console.log(`Created ${logsData.length} ActivityLog entries.`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
