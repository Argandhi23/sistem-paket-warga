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

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rumah.deleteMany({});

  // 2. Create Rumah/Units
  const rumahA1 = await prisma.rumah.create({
    data: { blok: 'A', nomor: '1' }
  });
  const rumahB2 = await prisma.rumah.create({
    data: { blok: 'B', nomor: '2' }
  });
  const rumahC3 = await prisma.rumah.create({
    data: { blok: 'C', nomor: '3' }
  });

  console.log('Created Rumah/Units.');

  // 3. Create Users with hashed passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@sistem.com',
      password: passwordHash,
      role: Role.ADMIN,
    }
  });

  // Security User
  const security = await prisma.user.create({
    data: {
      name: 'Pak Satpam',
      email: 'security@sistem.com',
      password: passwordHash,
      role: Role.SECURITY,
    }
  });

  // Warga Users
  const wargaA = await prisma.user.create({
    data: {
      name: 'Warga Blok A1',
      email: 'warga.a@sistem.com',
      password: passwordHash,
      role: Role.WARGA,
      unitNumber: 'A-1',
      rumahId: rumahA1.id,
    }
  });

  const wargaB = await prisma.user.create({
    data: {
      name: 'Warga Blok B2',
      email: 'warga.b@sistem.com',
      password: passwordHash,
      role: Role.WARGA,
      unitNumber: 'B-2',
      rumahId: rumahB2.id,
    }
  });

  console.log('Created Users.');

  // 4. Create Packages
  // Package 1: Received by security (A-1)
  await prisma.package.create({
    data: {
      trackingNumber: 'SPW-JNE-1001',
      courierName: 'JNE Express',
      recipientName: 'Warga Blok A1',
      unitNumber: 'A-1',
      status: PackageStatus.RECEIVED_BY_SECURITY,
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      securityId: security.id,
      wargaId: wargaA.id,
    }
  });

  // Package 2: Delivered to warga (A-1)
  await prisma.package.create({
    data: {
      trackingNumber: 'SPW-JNT-2002',
      courierName: 'J&T Express',
      recipientName: 'Warga Blok A1',
      unitNumber: 'A-1',
      status: PackageStatus.DELIVERED_TO_WARGA,
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      pickedUpAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      pickedUpBy: 'Warga Blok A1',
      securityId: security.id,
      wargaId: wargaA.id,
    }
  });

  // Package 3: Expired (B-2)
  await prisma.package.create({
    data: {
      trackingNumber: 'SPW-SIC-3003',
      courierName: 'SiCepat',
      recipientName: 'Warga Blok B2',
      unitNumber: 'B-2',
      status: PackageStatus.EXPIRED,
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago (expired since threshold is 3 days)
      securityId: security.id,
      wargaId: wargaB.id,
    }
  });

  console.log('Created sample Packages.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
