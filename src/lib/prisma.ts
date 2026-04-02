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
connectionString = connectionString.replace('?pgbouncer=true', '');
connectionString = connectionString.replace('&pgbouncer=true', '');

const pool = new Pool({ connectionString });

// Tambahkan 'as any' di sini untuk mengatasi bentrok @types/pg
const adapter = new PrismaPg(pool as any);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;