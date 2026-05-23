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

  static async delete(id: string) {
    return await prisma.package.delete({
      where: { id },
    });
  }
}
