import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SECURITY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalToday, statusCounts, recentPackages] = await Promise.all([
      prisma.package.count({
        where: {
          receivedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.package.groupBy({
        by: ['status'],
        where: {
          receivedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _count: {
          id: true,
        },
      }),
      prisma.package.findMany({
        where: {
          receivedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        take: 5,
        orderBy: {
          receivedAt: 'desc',
        },
        include: {
          warga: {
            select: { name: true, unitNumber: true },
          },
        },
      }),
    ]);

    const statusData = {
      RECEIVED_BY_SECURITY: 0,
      DELIVERED_TO_WARGA: 0,
      EXPIRED: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status in statusData) {
        statusData[item.status as keyof typeof statusData] = item._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        total: totalToday,
        byStatus: statusData,
        recent: recentPackages,
      },
    });
  } catch (error) {
    console.error('Error fetching package statistics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
