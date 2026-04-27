import 'dotenv/config';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { GET } from '../../app/api/packages/route';
import { PackageRepository } from '../../repositories/package.repository';
import { getServerSession } from 'next-auth';
import prisma from '../prisma';

// --- MOCKING UNTUK UNIT TEST API ---
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('../../repositories/package.repository', () => ({
  PackageRepository: {
    findWithFilters: vi.fn(),
    findAll: vi.fn(),
  },
}));

describe('Warga Data Isolation - Unit & Integration Test', () => {
  
  describe('1. Unit Test API Route (IDOR Prevention)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('✅ Warga A hanya boleh mengambil paket dari unit rumahnya sendiri (Abaikan query unit dari URL)', async () => {
      // Skenario: Warga A (Unit A-1) mencoba mengintip paket Warga B (Unit B-2) via URL Parameter
      const mockSessionWargaA = {
        user: { role: 'WARGA', unitNumber: 'A-1' }
      };
      (getServerSession as any).mockResolvedValue(mockSessionWargaA);
      
      const mockPackagesForA1 = [{ id: 'pkg-1', recipientName: 'Warga A', unitNumber: 'A-1', receivedAt: new Date() }];
      (PackageRepository.findWithFilters as any).mockResolvedValue(mockPackagesForA1);

      // Manipulasi URL Parameter seakan-akan Warga A nge-hit API dengan ?unit=B-2 (IDOR attempt)
      const request = new Request('http://localhost:3000/api/packages?unit=B-2');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      
      // PASTIKAN: Repositori dipanggil dengan unit milik session ('A-1'), BUKAN parameter URL ('B-2')
      expect(PackageRepository.findWithFilters).toHaveBeenCalledWith(expect.objectContaining({ unitNumber: 'A-1' }));
      expect(PackageRepository.findWithFilters).not.toHaveBeenCalledWith(expect.objectContaining({ unitNumber: 'B-2' }));
      
      // Pastikan data yang bocor bukan data Warga B
      expect(json.data[0].unitNumber).toBe('A-1');
    });

    it('❌ Harus menolak akses jika Warga belum memiliki relasi dengan Rumah', async () => {
      const mockSessionWargaNoUnit = {
        user: { role: 'WARGA', unitNumber: null } // Belum punya rumah
      };
      (getServerSession as any).mockResolvedValue(mockSessionWargaNoUnit);

      const request = new Request('http://localhost:3000/api/packages');
      const response = await GET(request);
      const json = await response.json();

      // Harus di-block oleh sistem sebelum query ke database
      expect(response.status).toBe(403);
      expect(json.error).toBe('Unit belum ditautkan');
      expect(PackageRepository.findWithFilters).not.toHaveBeenCalled();
    });
  });

  describe('2. Integration Test DB (Validasi Integritas Relasi Warga-Paket-Rumah)', () => {
    const uniqueSuffix = Date.now().toString();
    let securityId: string;
    let wargaAId: string;
    let wargaBId: string;

    beforeAll(async () => {
      // Setup minimal untuk test isolasi
      const security = await prisma.user.create({
        data: { name: 'Satpam', email: 'satpam.' + uniqueSuffix + '@test.com', role: 'SECURITY' },
      });
      securityId = security.id;

      const wargaA = await prisma.user.create({
        data: { name: 'Warga A', email: 'wa.' + uniqueSuffix + '@test.com', role: 'WARGA', unitNumber: 'ISO-A1-' + uniqueSuffix },
      });
      wargaAId = wargaA.id;

      const wargaB = await prisma.user.create({
        data: { name: 'Warga B', email: 'wb.' + uniqueSuffix + '@test.com', role: 'WARGA', unitNumber: 'ISO-B2-' + uniqueSuffix },
      });
      wargaBId = wargaB.id;

      // Insert 2 Paket untuk A, 1 Paket untuk B
      await prisma.package.createMany({
        data: [
          { trackingNumber: 'PKG-A1-1-' + uniqueSuffix, courierName: 'JNE', recipientName: 'Warga A', unitNumber: 'ISO-A1-' + uniqueSuffix, wargaId: wargaAId, securityId },
          { trackingNumber: 'PKG-A1-2-' + uniqueSuffix, courierName: 'JNT', recipientName: 'Warga A', unitNumber: 'ISO-A1-' + uniqueSuffix, wargaId: wargaAId, securityId },
          { trackingNumber: 'PKG-B2-1-' + uniqueSuffix, courierName: 'Sicepat', recipientName: 'Warga B', unitNumber: 'ISO-B2-' + uniqueSuffix, wargaId: wargaBId, securityId },
        ]
      });
    });

    afterAll(async () => {
      // Cleanup
      if (securityId) {
        await prisma.package.deleteMany({ where: { securityId } });
        await prisma.user.deleteMany({ where: { id: { in: [securityId, wargaAId, wargaBId] } } });
      }
    });

    it('✅ Query ke database harus sepenuhnya terisolasi berdasarkan unitNumber/wargaId', async () => {
      // Query persis seperti yang digunakan repository
      const packagesForWargaA = await prisma.package.findMany({
        where: { unitNumber: 'ISO-A1-' + uniqueSuffix }
      });

      // Validasi: Hanya mendapatkan paket milik unitnya sendiri (2 paket)
      expect(packagesForWargaA.length).toBe(2);
      packagesForWargaA.forEach(pkg => {
        expect(pkg.unitNumber).toBe('ISO-A1-' + uniqueSuffix);
        expect(pkg.wargaId).toBe(wargaAId);
        
        // Anti-leak check: Pastikan paket warga B tidak pernah terambil
        expect(pkg.unitNumber).not.toBe('ISO-B2-' + uniqueSuffix);
        expect(pkg.wargaId).not.toBe(wargaBId);
      });
    });
  });
});
