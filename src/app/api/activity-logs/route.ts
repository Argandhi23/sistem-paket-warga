import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/require-admin-session';
import { handleError } from '@/lib/error-handler';
import { getActivityLogs } from '@/lib/activity-logger';

export async function GET(request: Request) {
  try {
    await requireAdminSession({ api: true });

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');
    const offset = Number(searchParams.get('offset') || '0');

    const logs = await getActivityLogs(limit, offset);

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return handleError(error);
  }
}
