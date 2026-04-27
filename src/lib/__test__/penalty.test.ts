import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PackageService } from '../../services/package.service';

describe('Unit Test: Algoritma calculatePenalty di PackageService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('✅ Skenario 2 Hari: Harus gratis (denda 0)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    vi.setSystemTime(new Date('2024-01-03T10:00:00Z')); // Selisih 2 hari
    
    const penalty = PackageService.calculatePenalty(receivedAt);
    expect(penalty).toBe(0);
  });

  it('✅ Skenario 3 Hari: Harus gratis (denda 0, batas waktu toleransi)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    vi.setSystemTime(new Date('2024-01-04T10:00:00Z')); // Selisih 3 hari pas
    
    const penalty = PackageService.calculatePenalty(receivedAt);
    expect(penalty).toBe(0);
  });

  it('❌ Skenario 5 Hari: Denda Rp 4.000 (Terlambat 2 hari)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    vi.setSystemTime(new Date('2024-01-06T10:00:00Z')); // Selisih 5 hari (2 hari denda)
    
    const penalty = PackageService.calculatePenalty(receivedAt);
    expect(penalty).toBe(4000); // 2 * 2000
  });

  it('❌ Skenario 10 Hari: Denda Rp 14.000 (Terlambat 7 hari)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    vi.setSystemTime(new Date('2024-01-11T10:00:00Z')); // Selisih 10 hari (7 hari denda)
    
    const penalty = PackageService.calculatePenalty(receivedAt);
    expect(penalty).toBe(14000); // 7 * 2000
  });
});
