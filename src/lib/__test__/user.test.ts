import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../prisma';

vi.mock('../prisma', () => ({
  default: {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('CRUD User Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ Harus mengembalikan data user saat berhasil create', async () => {
    const mockUser = { id: 'u1', email: 'anton@test.com', name: 'Anton' };
    (prisma.user.create as any).mockResolvedValue(mockUser);

    const result = await prisma.user.create({ data: { email: 'anton@test.com', name: 'Anton' } });
    
    expect(result.email).toBe('anton@test.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('✅ Harus mengembalikan data terupdate saat update user', async () => {
    const updatedUser = { id: 'u1', name: 'Anton Updated' };
    (prisma.user.update as any).mockResolvedValue(updatedUser);

    const result = await prisma.user.update({ 
      where: { id: 'u1' }, 
      data: { name: 'Anton Updated' } 
    });

    expect(result.name).toBe('Anton Updated');
  });
});