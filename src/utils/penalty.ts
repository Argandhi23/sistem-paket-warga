/**
 * Utility untuk menghitung denda keterlambatan paket.
 * Sesuai instruksi PM dan referensi UI:
 * - 3 Hari pertama gratis (Free).
 * - Hari ke-4 dst dihitung Rp 2.000 / hari.
 */

export const PENALTY_CONFIG = {
  FREE_DAYS: 3,
  DAILY_RATE: 2000,
};

export function calculatePenalty(receivedAt: Date | string, now: Date = new Date()) {
  const arrival = new Date(receivedAt);
  
  // Hitung selisih hari
  const diffTime = Math.abs(now.getTime() - arrival.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const lateDays = Math.max(0, diffDays - (PENALTY_CONFIG.FREE_DAYS - 1)); // Jika diffDays=3 (hari ke-4), lateDays=1? 
  // Biar simple sesuai image: "Jumlah Hari Telat: 5 hari" -> 10.000
  // Kita asumsikan lateDays adalah diffDays - freeDays.
  
  const actualLateDays = Math.max(0, diffDays - PENALTY_CONFIG.FREE_DAYS);
  const amount = actualLateDays * PENALTY_CONFIG.DAILY_RATE;

  return {
    totalDays: diffDays,
    lateDays: actualLateDays,
    amount,
    isPenalty: actualLateDays > 0,
  };
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
