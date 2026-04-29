/**
 * Mendapatkan konfigurasi durasi kadaluarsa dari environment variable.
 * Default adalah 3 hari jika tidak dikonfigurasi.
 */
export const PACKAGE_EXPIRY_DAYS = parseInt(process.env.PACKAGE_EXPIRY_DAYS || '3', 10);

/**
 * Menghitung batas waktu maksimal sebuah record dianggap valid (belum kadaluarsa).
 * @param days Durasi kadaluarsa dalam hitungan hari.
 * @returns Date object representasi batas waktu.
 */
export function getExpiryThresholdDate(days: number = PACKAGE_EXPIRY_DAYS): Date {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return threshold;
}

/**
 * Memeriksa apakah sebuah record sudah kadaluarsa berdasarkan tanggal pembuatannya.
 * @param createdAt Tanggal pembuatan record (misalnya receivedAt/createdAt).
 * @param expiryDays Durasi kadaluarsa dalam hitungan hari.
 * @returns boolean True jika sudah kadaluarsa.
 */
export function isExpired(createdAt: Date, expiryDays: number = PACKAGE_EXPIRY_DAYS): boolean {
  return createdAt.getTime() < getExpiryThresholdDate(expiryDays).getTime();
}
