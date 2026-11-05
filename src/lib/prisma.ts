import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { memoryPrisma } from "./memory-db";

/**
 * Membangun connection string yang optimal untuk Vercel Serverless (IPv4) + Supabase Free Tier.
 * - Prioritaskan DATABASE_URL (Supavisor Pooler *.pooler.supabase.com yang mendukung IPv4 & IPv6)
 *   karena DIRECT_URL (db.*.supabase.co) di Supabase Free Tier hanya mendukung IPv6 dan akan
 *   gagal (ENOTFOUND) di Vercel Serverless Functions.
 */
function buildConnectionString(): string {
  let connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";

  if (connectionString.includes("@localhost:")) {
    connectionString = connectionString.replace("@localhost:", "@127.0.0.1:");
  }

  // Gunakan Supavisor Session Mode (:5432 pada host pooler) agar kompatibel penuh dengan PrismaPg
  if (connectionString.includes(".pooler.supabase.com:6543")) {
    connectionString = connectionString.replace(":6543", ":5432");
  }

  connectionString = connectionString
    .replace("?pgbouncer=true", "")
    .replace("&pgbouncer=true", "");

  return connectionString;
}

function isDatabaseUnreachableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; message?: string; code?: string };
  const msg = `${err.name ?? ""} ${err.message ?? ""} ${err.code ?? ""}`.toLowerCase();
  return (
    msg.includes("driveradaptererror") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("tenant/user") ||
    msg.includes("tenant or user not found") ||
    msg.includes("can't reach database server") ||
    msg.includes("connection terminated")
  );
}

const fallbackState = {
  offlineUntil: 0,
  warned: false,
};

function wrapDelegate<T extends object>(realDelegate: T, fallbackDelegate: Record<string, unknown>): T {
  return new Proxy(realDelegate, {
    get(target, prop, receiver) {
      const fallbackMethod = fallbackDelegate[String(prop)];
      const realValue = Reflect.get(target, prop, receiver);

      if (typeof realValue !== "function" || typeof fallbackMethod !== "function") {
        return realValue;
      }

      return async (...args: unknown[]) => {
        if (Date.now() < fallbackState.offlineUntil) {
          return (fallbackMethod as (...a: unknown[]) => Promise<unknown>)(...args);
        }

        try {
          const result = await (realValue as (...a: unknown[]) => Promise<unknown>).apply(target, args);
          if (fallbackState.warned) {
            fallbackState.warned = false;
          }
          return result;
        } catch (error) {
          if (isDatabaseUnreachableError(error)) {
            fallbackState.offlineUntil = Date.now() + 15_000;
            if (!fallbackState.warned) {
              fallbackState.warned = true;
              console.warn(
                "⚠️ [Prisma] Database utama (Supabase) tidak terjangkau/paused. Beralih otomatis ke In-Memory Fallback Store."
              );
            }
            return (fallbackMethod as (...a: unknown[]) => Promise<unknown>)(...args);
          }
          throw error;
        }
      };
    },
  });
}

const prismaClientSingleton = () => {
  const connectionString = buildConnectionString();
  const isServerless = Boolean(process.env.VERCEL);

  const pool = new Pool({
    connectionString,
    // Batasi ukuran pool di Vercel Serverless agar tidak melampaui limit koneksi Supabase Free Tier
    max: isServerless ? 2 : 5,
    idleTimeoutMillis: 15_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: true,
  });

  // @ts-expect-error: Type mismatch from internal library dependencies
  const adapter = new PrismaPg(pool);
  const rawClient = new PrismaClient({ adapter });

  return new Proxy(rawClient, {
    get(target, prop, receiver) {
      if (prop === "rumah") {
        return wrapDelegate(target.rumah, memoryPrisma.rumah);
      }
      if (prop === "user") {
        return wrapDelegate(target.user, memoryPrisma.user);
      }
      if (prop === "package") {
        return wrapDelegate(target.package, memoryPrisma.package);
      }
      if (prop === "activityLog") {
        return wrapDelegate(target.activityLog, memoryPrisma.activityLog);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Simpan di globalThis baik di development maupun warm Vercel Serverless instance
globalForPrisma.prisma = prisma;

export default prisma;
