import { describe, it, expect } from 'vitest';

// 💡 Ini adalah simulasi fungsi pengecekan role di API Route kamu.
function checkAdminAccess(userRole: string | undefined) {
  if (!userRole || userRole !== 'ADMIN') {
    const error = new Error('Forbidden');
    (error as any).status = 403;
    throw error;
  }
  return true;
}

describe('API Role Validation Guard', () => {
  it('❌ Harus menolak akses dan melempar status 403 jika role adalah WARGA', () => {
    // Menggunakan enum asli dari schema: 'WARGA'
    const mockSession = { user: { role: 'WARGA' } };
    
    try {
      checkAdminAccess(mockSession.user.role);
      expect.fail('Seharusnya gagal karena WARGA tidak boleh akses fitur Admin');
    } catch (error: any) {
      expect(error.status).toBe(403);
      expect(error.message).toBe('Forbidden');
    }
  });

  it('❌ Harus menolak akses jika role tidak terdefinisi (belum login)', () => {
    const mockSession = { user: { role: undefined } };
    
    try {
      checkAdminAccess(mockSession.user.role);
      expect.fail('Seharusnya gagal karena user belum login / tidak punya role');
    } catch (error: any) {
      expect(error.status).toBe(403);
    }
  });

  it('✅ Harus mengizinkan akses jika role adalah ADMIN', () => {
    // Menggunakan enum asli dari schema: 'ADMIN'
    const mockSession = { user: { role: 'ADMIN' } };
    
    const isAllowed = checkAdminAccess(mockSession.user.role);
    expect(isAllowed).toBe(true);
  });
});