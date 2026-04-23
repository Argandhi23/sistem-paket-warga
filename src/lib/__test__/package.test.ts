import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../prisma';

describe('Integration Test: Package, User, dan Rumah', () => {
  // Simpan ID yang digenerate untuk cleanup
  let securityId: string;
  let rumah1Id: string;
  let rumah2Id: string;
  let warga1Id: string;
  let warga2Id: string;

  const uniqueSuffix = Date.now().toString();

  beforeAll(async () => {
    // 1. Buat Security
    const security = await prisma.user.create({
      data: {
        name: 'Satpam Test',
        email: "satpam.test." + uniqueSuffix + "@example.com",
        role: 'SECURITY',
      },
    });
    securityId = security.id;

    // 2. Buat Rumah 1 & Rumah 2
    const rumah1 = await prisma.rumah.create({
      data: { blok: "TEST-A-" + uniqueSuffix, nomor: '1' },
    });
    rumah1Id = rumah1.id;

    const rumah2 = await prisma.rumah.create({
      data: { blok: "TEST-B-" + uniqueSuffix, nomor: '2' },
    });
    rumah2Id = rumah2.id;

    // 3. Buat Warga 1 (Rumah 1) & Warga 2 (Rumah 2)
    const warga1 = await prisma.user.create({
      data: {
        name: 'Warga A',
        email: "wargaa.test." + uniqueSuffix + "@example.com",
        role: 'WARGA',
        unitNumber: "TEST-A-1-" + uniqueSuffix,
        rumahId: rumah1.id,
      },
    });
    warga1Id = warga1.id;

    const warga2 = await prisma.user.create({
      data: {
        name: 'Warga B',
        email: "wargab.test." + uniqueSuffix + "@example.com",
        role: 'WARGA',
        unitNumber: "TEST-B-2-" + uniqueSuffix,
        rumahId: rumah2.id,
      },
    });
    warga2Id = warga2.id;
  });

  afterAll(async () => {
    // Cleanup data test
    if (securityId) {
      await prisma.package.deleteMany({
        where: { securityId },
      });
    }
    const userIds = [securityId, warga1Id, warga2Id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    const rumahIds = [rumah1Id, rumah2Id].filter(Boolean);
    if (rumahIds.length > 0) {
      await prisma.rumah.deleteMany({
        where: { id: { in: rumahIds } },
      });
    }
  });

  it('❌ Skenario 1: Satpam input paket ke rumah yang tidak ada (Harus Gagal)', async () => {
    const invalidRumahId = 'rumah-tidak-ada-123';
    
    // Test ini memastikan relasi DB menolak insert ketika referensi warga/rumah tidak valid
    // Kita simulasikan dengan mencoba menautkan ke warga yang ID-nya salah
    const createPackageAction = prisma.package.create({
      data: {
        trackingNumber: 'TRX-INVALID',
        courierName: 'JNE',
        recipientName: 'Budi',
        unitNumber: 'Z-99',
        status: 'RECEIVED_BY_SECURITY',
        wargaId: invalidRumahId, // ID tidak ada di DB
        securityId: securityId,
      },
    });

    await expect(createPackageAction).rejects.toThrow(); // Prisma akan throw constraint error
  });

  it('✅ Relasi: Paket berhasil ditautkan dengan User Warga dan Security yang valid', async () => {
    const validPackage = await prisma.package.create({
      data: {
        trackingNumber: 'TRX-VALID-1',
        courierName: 'Sicepat',
        recipientName: 'Warga A',
        unitNumber: 'TEST-A-1',
        status: 'RECEIVED_BY_SECURITY',
        wargaId: warga1Id,
        securityId: securityId,
      },
    });

    expect(validPackage).toBeDefined();
    expect(validPackage.wargaId).toBe(warga1Id);
    expect(validPackage.securityId).toBe(securityId);
  });

  it('UAT: Input 10 paket berbeda, filter berdasarkan 1 unit rumah (Hanya paket unit tersebut yang muncul)', async () => {
    // 1. Input 10 paket (7 paket untuk warga 1, 3 paket untuk warga 2)
    const packagesToInsert = [];
    for (let i = 1; i <= 7; i++) {
      packagesToInsert.push({
        trackingNumber: "UAT-W1-" + i + "-" + uniqueSuffix,
        courierName: 'Kurir',
        recipientName: 'Warga A',
        unitNumber: "TEST-A-1-" + uniqueSuffix,
        status: 'RECEIVED_BY_SECURITY' as const,
        wargaId: warga1Id,
        securityId: securityId,
      });
    }
    for (let i = 1; i <= 3; i++) {
      packagesToInsert.push({
        trackingNumber: "UAT-W2-" + i + "-" + uniqueSuffix,
        courierName: 'Kurir',
        recipientName: 'Warga B',
        unitNumber: "TEST-B-2-" + uniqueSuffix,
        status: 'RECEIVED_BY_SECURITY' as const,
        wargaId: warga2Id,
        securityId: securityId,
      });
    }

    await prisma.package.createMany({ data: packagesToInsert });

    // 2. Filter berdasarkan 1 unit rumah (Warga 1)
    const filteredPackages = await prisma.package.findMany({
      where: {
        wargaId: warga1Id,
      },
      include: {
        warga: true,
      }
    });

    // 3. Pastikan yang muncul hanya paket unit tersebut
    expect(filteredPackages.length).toBe(8); // 7 dari UAT + 1 dari test sebelumnya
    filteredPackages.forEach(pkg => {
      expect(pkg.wargaId).toBe(warga1Id);
      expect(pkg.warga?.unitNumber).toBe("TEST-A-1-" + uniqueSuffix);
    });
    
    // Pastikan tidak ada paket punya Warga 2 yang terambil
    const w2PackagesInFilter = filteredPackages.filter(p => p.wargaId === warga2Id);
    expect(w2PackagesInFilter.length).toBe(0);
  });
});
