export function calculatePenalty(receivedAt: Date, pickedUpAt: Date = new Date()): number {
  // Hitung selisih waktu dalam milidetik
  const diffTime = Math.abs(pickedUpAt.getTime() - receivedAt.getTime());
  
  // Konversi selisih ke hari (pembulatan ke bawah)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Gratis 3 hari pertama
  if (diffDays <= 3) {
    return 0;
  }

  // Denda Rp 5.000 per hari keterlambatan setelah 3 hari
  const lateDays = diffDays - 3;
  return lateDays * 5000;
}
