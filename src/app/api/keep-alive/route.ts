import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cooldown 5 menit agar endpoint publik tidak disalahgunakan untuk spam query DB
const KEEP_ALIVE_COOLDOWN_MS = 5 * 60 * 1000;
let lastPingAt = 0;

export async function GET() {
  const now = Date.now();

  if (now - lastPingAt < KEEP_ALIVE_COOLDOWN_MS) {
    return NextResponse.json({
      success: true,
      status: 'throttled-ok',
      message: 'Database keep-alive sudah dijalankan baru-baru ini.',
      lastPingAt: new Date(lastPingAt).toISOString(),
    });
  }

  lastPingAt = now;
  const startTime = Date.now();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const [rumahCount, restPing] = await Promise.all([
      prisma.rumah.count(),
      supabaseUrl && supabaseAnonKey
        ? fetch(`${supabaseUrl}/rest/v1/Rumah?select=id&limit=1`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            cache: 'no-store',
          })
            .then((r) => r.ok)
            .catch(() => false)
        : Promise.resolve(false),
    ]);

    return NextResponse.json({
      success: true,
      status: 'alive',
      database: 'connected',
      restGateway: restPing ? 'connected' : 'skipped',
      unitsCount: rumahCount,
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Database ping failed',
      },
      { status: 500 }
    );
  }
}
