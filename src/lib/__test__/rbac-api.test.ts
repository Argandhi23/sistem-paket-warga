import 'dotenv/config';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { POST } from '../../app/api/packages/route';
import { getServerSession } from 'next-auth';
import prisma from '../prisma';

// Mock next-auth khusus untuk menyuntikkan (inject) session
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('Integration Test: API RBAC Input Paket', () => {
  const uniqueSuffix = Date.now().toString();
  let rumahId: string;
  let securityId: string;

  beforeAll(async () => {
    // Siapkan Rumah riil di DB agar validasi di PackageService lulus
    const rumah = await prisma.rumah.create({
      data: { blok: 'RBAC', nomor: 'UNIT-' + uniqueSuffix }
    });
    rumahId = rumah.id;
    
    // Siapkan User Security riil di DB agar validasi Foreign Key lulus
    const security = await prisma.user.create({
      data: {
        name: 'Satpam RBAC',
        email: 'satpam.rbac.' + uniqueSuffix + '@example.com',
        role: 'SECURITY',
      }
    });
    securityId = security.id;
  });

  afterAll(async () => {
    // Cleanup DB (Karena POST api membuat paket secara nyata, kita bersihkan di sini)
    await prisma.package.deleteMany({
      where: { unitNumber: 'UNIT-' + uniqueSuffix }
    });
    await prisma.user.delete({
      where: { id: securityId }
    });
    await prisma.rumah.delete({
      where: { id: rumahId }
    });
  });

  it('❌ Harus menolak request (403 Forbidden) jika role adalah WARGA', async () => {
    // Simulasi Warga mencoba memanggil API POST (Hanya Satpam/Admin yang boleh)
    (getServerSession as any).mockResolvedValue({
      user: { role: 'WARGA', name: 'Warga Nakal' }
    });

    const mockPayload = {
      courierName: 'JNE',
      recipientName: 'Ujian RBAC',
      unitNumber: 'UNIT-' + uniqueSuffix,
      securityId: securityId
    };

    const request = new Request('http://localhost:3000/api/packages', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Hanya Security atau Admin yang dapat menerima paket.');
    
    // Verifikasi Database: Paket tidak benar-benar tersimpan!
    const packagesInDb = await prisma.package.count({
      where: { unitNumber: 'UNIT-' + uniqueSuffix }
    });
    expect(packagesInDb).toBe(0);
  });

  it('✅ Harus menerima request (201 Created) jika role adalah SECURITY, dan simpan riil ke DB', async () => {
    // Simulasi Satpam memanggil API POST
    (getServerSession as any).mockResolvedValue({
      user: { role: 'SECURITY', name: 'Bapak Satpam' }
    });

    const mockPayload = {
      courierName: 'JNE',
      recipientName: 'Ujian RBAC Sukses',
      unitNumber: 'UNIT-' + uniqueSuffix,
      securityId: securityId
    };

    const request = new Request('http://localhost:3000/api/packages', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.courierName).toBe('JNE');
    
    // Verifikasi Database: Paket BENAR-BENAR TERSIMPAN! (Integration test nyata)
    const packagesInDb = await prisma.package.count({
      where: { unitNumber: 'UNIT-' + uniqueSuffix }
    });
    expect(packagesInDb).toBe(1);
  });
});
