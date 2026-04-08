// Menggunakan globalThis agar memori tidak reset berulang kali saat hot-reload di Next.js
const globalForRateLimit = globalThis as unknown as {
  failedLoginAttempts: Map<string, { count: number; lockUntil: number | null }>;
};

const attemptsMap = globalForRateLimit.failedLoginAttempts ?? new Map();

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.failedLoginAttempts = attemptsMap;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Menit

export function isRateLimited(ip: string): boolean {
  const record = attemptsMap.get(ip);
  if (!record) return false;

  // Jika sedang terkunci, cek apakah waktu kunci sudah habis
  if (record.lockUntil && Date.now() < record.lockUntil) {
    return true; // Masih terblokir
  }

  // Jika waktu kunci sudah habis, hapus status blokir
  if (record.lockUntil && Date.now() > record.lockUntil) {
    attemptsMap.delete(ip);
    return false;
  }

  return false;
}

export function recordFailedAttempt(ip: string) {
  const record = attemptsMap.get(ip) || { count: 0, lockUntil: null };
  record.count += 1;

  // Jika percobaan gagal mencapai batas, kunci IP ini
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  attemptsMap.set(ip, record);
}

export function clearRateLimit(ip: string) {
  attemptsMap.delete(ip);
}