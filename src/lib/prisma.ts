import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Ambil URL database (prioritaskan DIRECT_URL jika ada)
let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

// 2. TRIK SUPABASE: Paksa ganti port dari Pooler (6543) ke Direct (5432)
if (connectionString.includes(':6543')) {
  connectionString = connectionString.replace(':6543', ':5432');
}

// Hapus parameter pgbouncer jika ada, karena kita memakai port direct
connectionString = connectionString.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');

const pool = new Pool({ connectionString });

// Mengabaikan error bentrok tipe antara @types/pg project dan bawaan @prisma/adapter-pg
// @ts-expect-error: Type mismatch from internal library dependencies
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

// Gunakan teknik as unknown untuk globalThis agar ESLint tidak komplain
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}