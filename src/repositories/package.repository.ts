import prisma from "@/lib/prisma";
import { Prisma, PackageStatus } from "@prisma/client";

export class PackageRepository {
  static async findWithFilters(params: {
    unitNumber?: string;
    status?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
    sort?: 'asc' | 'desc';
  }) {
    await PackageRepository.updateExpiredPackages();

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
    const stats = await prisma.package.groupBy({
      by: ['status'],
      where: filters,
      _count: { _all: true },
    });

    return {
      pending: stats.find(s => s.status === 'RECEIVED_BY_SECURITY')?._count._all || 0,
      pickedUp: stats.find(s => s.status === 'DELIVERED_TO_WARGA')?._count._all || 0,
      expired: stats.find(s => s.status === 'EXPIRED')?._count._all || 0,
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

  static async updateExpiredPackages() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return await prisma.package.updateMany({
      where: {
        status: PackageStatus.RECEIVED_BY_SECURITY,
        receivedAt: {
          lt: threeDaysAgo,
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
