import { describe, it, expect } from 'vitest';
import { calculatePenalty } from '../../utils/penalty';

describe('Unit Test: Algoritma calculatePenalty', () => {
  it('✅ Skenario 2 Hari: Harus gratis (denda 0)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    const pickedUpAt = new Date('2024-01-03T10:00:00Z'); // Selisih 2 hari
    
    const penalty = calculatePenalty(receivedAt, pickedUpAt);
    expect(penalty).toBe(0);
  });

  it('✅ Skenario 3 Hari: Harus gratis (denda 0, batas waktu toleransi)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    const pickedUpAt = new Date('2024-01-04T10:00:00Z'); // Selisih 3 hari pas
    
    const penalty = calculatePenalty(receivedAt, pickedUpAt);
    expect(penalty).toBe(0);
  });

  it('❌ Skenario 5 Hari: Denda Rp 10.000 (Terlambat 2 hari)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    const pickedUpAt = new Date('2024-01-06T10:00:00Z'); // Selisih 5 hari (2 hari denda)
    
    const penalty = calculatePenalty(receivedAt, pickedUpAt);
    expect(penalty).toBe(10000); // 2 * 5000
  });

  it('❌ Skenario 10 Hari: Denda Rp 35.000 (Terlambat 7 hari)', () => {
    const receivedAt = new Date('2024-01-01T10:00:00Z');
    const pickedUpAt = new Date('2024-01-11T10:00:00Z'); // Selisih 10 hari (7 hari denda)
    
    const penalty = calculatePenalty(receivedAt, pickedUpAt);
    expect(penalty).toBe(35000); // 7 * 5000
  });
});
