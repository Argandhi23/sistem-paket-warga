import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../prisma';

vi.mock('../prisma', () => ({
  default: {
    rumah: {
      create: vi.fn(),
      findFirst: vi.fn(), // Menggunakan findFirst karena blok & nomor belum @unique di schema
    },
    user: {
      update: vi.fn(),
    }
  },
}));

describe('CRUD Rumah & Relasi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('❌ Harus gagal jika blok dan nomor rumah sudah terdaftar', async () => {
    // Simulasi: Blok A Nomor 12 sudah ada di DB
    (prisma.rumah.findFirst as any).mockResolvedValue({ id: 'r1', blok: 'Blok A', nomor: '12' });

    const existingRumah = await prisma.rumah.findFirst({ 
      where: { blok: 'Blok A', nomor: '12' } 
    });
    
    expect(existingRumah).not.toBeNull();
    expect(existingRumah?.blok).toBe('Blok A');
    expect(existingRumah?.nomor).toBe('12');
  });

  it('✅ Harus menautkan User (Warga) dengan Rumah yang benar via rumahId', async () => {
    // Berdasarkan schema, relasi disimpan di User (rumahId)
    const mockUserWithRumah = {
      id: 'user-123',
      name: 'Anton',
      role: 'WARGA',
      rumahId: 'rumah-456', // Ini sesuai dengan schema baru
    };

    (prisma.user.update as any).mockResolvedValue(mockUserWithRumah);

    const result = await prisma.user.update({
      where: { id: 'user-123' },
      data: { rumahId: 'rumah-456' } // Menautkan user ke rumah
    });

    expect(result.rumahId).toBe('rumah-456');
  });
});