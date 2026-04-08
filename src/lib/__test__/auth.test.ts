import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '../auth';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';

// 1. MOCKING MENGGUNAKAN HOISTED
const { mockIsRateLimited, mockRecordFailedAttempt, mockClearRateLimit } = vi.hoisted(() => ({
  mockIsRateLimited: vi.fn(),
  mockRecordFailedAttempt: vi.fn(),
  mockClearRateLimit: vi.fn(),
}));

vi.mock('../rate-limit', () => ({
  isRateLimited: mockIsRateLimited,
  recordFailedAttempt: mockRecordFailedAttempt,
  clearRateLimit: mockClearRateLimit,
}));

vi.mock('../prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('Auth - Credentials Provider', () => {
  const credentialsProvider = authOptions.providers.find(
    (p: any) => p.id === 'credentials'
  ) as any;
  
  // 🔥 FIX UTAMA: Kita ambil langsung dari '.options' di mana fungsi buatanmu berada, 
  // bukan fungsi dummy '() => null' bawaan NextAuth.
  const authorize = credentialsProvider.options?.authorize;

  const mockReq = {
    headers: { 'x-forwarded-for': '192.168.1.1' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('❌ Harus menolak login jika IP sedang di-rate limit', async () => {
    mockIsRateLimited.mockReturnValue(true);

    try {
      await authorize({ email: 'test@test.com', password: 'password123' }, mockReq);
      expect.fail('Seharusnya gagal karena IP terkena rate limit');
    } catch (error: any) {
      expect(error.message).toBe('Terlalu banyak percobaan gagal. Silakan coba lagi dalam 15 menit.');
    }
  });

  it('❌ Harus menolak jika email atau password kosong', async () => {
    mockIsRateLimited.mockReturnValue(false);

    try {
      await authorize({ email: '', password: 'password123' }, mockReq);
      expect.fail('Seharusnya gagal karena email kosong');
    } catch (error: any) {
      expect(error.message).toBe('Email dan password wajib diisi');
    }
  });

  it('❌ Harus mencatat kegagalan dan menolak jika email tidak ditemukan di database', async () => {
    mockIsRateLimited.mockReturnValue(false);
    (prisma.user.findUnique as any).mockResolvedValue(null);

    try {
      await authorize({ email: 'salah@test.com', password: 'password123' }, mockReq);
      expect.fail('Seharusnya gagal karena email salah');
    } catch (error: any) {
      expect(error.message).toBe('Kredensial tidak valid');
    }

    expect(mockRecordFailedAttempt).toHaveBeenCalledWith('192.168.1.1');
  });

  it('❌ Harus mencatat kegagalan dan menolak jika password salah', async () => {
    mockIsRateLimited.mockReturnValue(false);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: '1',
      email: 'warga@test.com',
      password: 'hashedpassword',
      name: 'Warga 1',
      role: 'USER',
      unitNumber: 'A1',
    });
    (bcrypt.compare as any).mockResolvedValue(false);

    try {
      await authorize({ email: 'warga@test.com', password: 'passwordsalah' }, mockReq);
      expect.fail('Seharusnya gagal karena password salah');
    } catch (error: any) {
      expect(error.message).toBe('Kredensial tidak valid');
    }

    expect(mockRecordFailedAttempt).toHaveBeenCalledWith('192.168.1.1');
  });

  it('✅ Harus mengembalikan data user dan membersihkan rate limit jika login sukses', async () => {
    mockIsRateLimited.mockReturnValue(false);
    
    const mockUser = {
      id: '1',
      email: 'warga@test.com',
      password: 'hashedpassword',
      name: 'Warga 1',
      role: 'USER',
      unitNumber: 'A1',
    };
    
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (bcrypt.compare as any).mockResolvedValue(true);

    const result = await authorize({ email: 'warga@test.com', password: 'passwordbenar' }, mockReq);

    expect(mockClearRateLimit).toHaveBeenCalledWith('192.168.1.1');
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      unitNumber: mockUser.unitNumber,
    });
  });
});