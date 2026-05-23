import prisma from "@/lib/prisma";
import { Prisma, PackageStatus } from "@prisma/client";
import { getExpiryThresholdDate } from "@/lib/expiry";

export class PackageRepository {
  static async findWithFilters(params: {
    unitNumber?: string;
    status?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
    sort?: 'asc' | 'desc';
  }) {
    const where: any = {};
    if (params.unitNumber) where.unitNumber = params.unitNumber;
    if (params.status && params.status !== 'SEMUA') where.status = params.status;
    if (params.courier) {
      where.courierName = { contains: params.courier, mode: 'insensitive' };
    }
    
    if (params.startDate || params.endDate) {
      where.receivedAt = {};
      if (params.startDate) where.receivedAt.gte = new Date(params.startDate);
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.receivedAt.lte = end;
      }
    }

    return await prisma.package.findMany({
      where,
      include: {
        security: { select: { name: true } },
        warga: { select: { name: true } }
      },
      orderBy: { receivedAt: params.sort || 'desc' },
    });
  }

  static async getStats(filters: { wargaId?: string } = {}) {
    const [counts, aggregate] = await Promise.all([
      prisma.package.groupBy({
        by: ['status'],
        where: filters,
        _count: { _all: true },
      }),
      prisma.package.aggregate({
        where: filters,
        _sum: { penaltyAmount: true }
      })
    ]);

    return {
      total: counts.reduce((acc, c: any) => acc + c._count._all, 0),
      pending: counts.find(s => s.status === 'RECEIVED_BY_SECURITY')?._count._all || 0,
      pickedUp: counts.find(s => s.status === 'DELIVERED_TO_WARGA')?._count._all || 0,
      expired: counts.find(s => s.status === 'EXPIRED')?._count._all || 0,
      totalPenalty: aggregate._sum.penaltyAmount || 0,
    };
  }

  static async create(data: Prisma.PackageUncheckedCreateInput) {
    return await prisma.package.create({
      data,
    });
  }

  static async updateStatusToDelivered(packageId: string) {
    return await prisma.package.update({
      where: { id: packageId },
      data: {
        status: PackageStatus.DELIVERED_TO_WARGA,
        pickedUpAt: new Date(),
      },
    });
  }

  static async handoverPackage(id: string, data: {
    pickedUpBy: string;
    penaltyAmount: number;
    penaltyPaid: boolean;
  }) {
    return await prisma.package.update({
      where: { id },
      data: {
        status: PackageStatus.DELIVERED_TO_WARGA,
        pickedUpAt: new Date(),
        pickedUpBy: data.pickedUpBy,
        penaltyAmount: data.penaltyAmount,
        penaltyPaid: data.penaltyPaid,
      },
    });
  }

  static async updateExpiredPackages() {
    const thresholdDate = getExpiryThresholdDate();

    return await prisma.package.updateMany({
      where: {
        status: PackageStatus.RECEIVED_BY_SECURITY,
        receivedAt: {
          lt: thresholdDate,
        },
      },
      data: {
        status: PackageStatus.EXPIRED,
      },
    });
  }

  static async update(id: string, data: Prisma.PackageUncheckedUpdateInput) {
    return await prisma.package.update({
      where: { id },
      data,
    });
  }

  static async getDailyVolume(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.package.findMany({
      where: {
        receivedAt: {
          gte: startDate,
        },
      },
      select: {
        receivedAt: true,
        status: true,
        pickedUpAt: true,
      },
    });

    const dailyData: Record<string, { date: string; entry: number; pickup: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyData[dateKey] = { date: dateKey, entry: 0, pickup: 0 };
    }

    logs.forEach((log) => {
      const entryKey = log.receivedAt.toISOString().split('T')[0];
      if (dailyData[entryKey]) {
        dailyData[entryKey].entry++;
      }
      if (log.pickedUpAt) {
        const pickupKey = log.pickedUpAt.toISOString().split('T')[0];
        if (dailyData[pickupKey]) {
          dailyData[pickupKey].pickup++;
        }
      }
    });

    return Object.values(dailyData)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getAnalyticsSummary() {
    const [byBlock, byStatus, monthlyPenalty] = await Promise.all([
      // 1. Distribusi per Blok (Unit format assumed: BLOK-NOMOR)
      prisma.package.groupBy({
        by: ['unitNumber'],
        _count: { _all: true },
      }),
      // 2. Status Saat Ini
      prisma.package.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      // 3. Riwayat Denda (Basic grouping by date)
      prisma.package.findMany({
        where: { penaltyAmount: { gt: 0 } },
        select: { pickedUpAt: true, penaltyAmount: true }
      })
    ]);

    // Process blocks in memory
    const blockMap: Record<string, number> = {};
    byBlock.forEach(item => {
      const block = item.unitNumber.split('-')[0] || 'Lainnya';
      blockMap[block] = (blockMap[block] || 0) + item._count._all;
    });

    // Process monthly penalty
    const monthMap: Record<string, number> = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0,
      'Jul': 0, 'Agu': 0, 'Sep': 0, 'Okt': 0, 'Nov': 0, 'Des': 0
    };
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    monthlyPenalty.forEach(p => {
      if (p.pickedUpAt) {
        const m = p.pickedUpAt.getMonth();
        monthMap[monthNames[m]] += p.penaltyAmount;
      }
    });

    return {
      distributionByBlock: Object.entries(blockMap).map(([name, value]) => ({ name, value })),
      statusStats: byStatus.map(s => ({ name: s.status, value: s._count._all })),
      penaltyHistory: Object.entries(monthMap).map(([name, value]) => ({ name, value }))
    };
  }
}
