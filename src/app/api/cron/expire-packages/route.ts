import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Mengirim ping ke Supabase REST API (PostgREST / Kong Gateway)
 * agar sistem deteksi inaktivitas Supabase Free Tier mencatat trafik API aktif.
 */
async function pingSupabaseRestGateway(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/Rumah?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.warn('Unauthorized cron execution attempt');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const startTime = Date.now();

    // 1. Jalankan query SQL + update paket expired + ping Supabase REST API secara paralel
    const [expiredResult, userCount, restGatewayAlive] = await Promise.all([
      PackageService.processExpiredPackages(),
      prisma.user.count(),
      pingSupabaseRestGateway(),
    ]);

    // 2. Catat heartbeat write ke database (dan bersihkan log heartbeat lama agar tabel tidak penuh)
    await prisma.activityLog.deleteMany({
      where: { action: 'SUPABASE_KEEP_ALIVE' },
    });
    await prisma.activityLog.create({
      data: {
        action: 'SUPABASE_KEEP_ALIVE',
        entityType: 'System',
        entityId: 'cron-heartbeat',
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          expiredUpdated: expiredResult.count,
          restGatewayAlive,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cron & Supabase keep-alive executed successfully',
      updatedCount: expiredResult.count,
      userCount,
      restGatewayAlive,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error during expired packages cron execution:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
