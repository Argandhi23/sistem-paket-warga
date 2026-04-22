import prisma from '@/lib/prisma';
import { Prisma, PackageStatus } from '@prisma/client';

export class PackageRepository {
  // ---> INI FUNGSI BARU YANG KITA TAMBAHKAN UNTUK ADMIN & SECURITY <---
  static async findAll() {
    await PackageRepository.updateExpiredPackages(); // Trigger sinkronisasi expired state
    return await prisma.package.findMany({
      orderBy: { receivedAt: 'desc' },
      include: {
        security: { select: { name: true } }, // Biar Admin juga bisa lihat siapa satpam penerimanya
      }
    });
  }

  // Fungsi untuk mencatat paket baru masuk
  static async create(data: Prisma.PackageUncheckedCreateInput) {
    return await prisma.package.create({
      data,
    });
  }

  // Fungsi untuk melihat paket berdasarkan nomor unit rumah (Untuk Warga)
  static async findByUnit(unitNumber: string) {
    return await prisma.package.findMany({
      where: { unitNumber },
      orderBy: { receivedAt: 'desc' },
      include: {
        security: { select: { name: true } }, // Join untuk menampilkan nama satpam
      }
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
}