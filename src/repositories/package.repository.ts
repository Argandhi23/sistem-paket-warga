import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class PackageRepository {
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

  // Fungsi untuk update status paket saat diambil
  static async updateStatusToDelivered(packageId: string) {
    return await prisma.package.update({
      where: { id: packageId },
      data: {
        status: 'DELIVERED_TO_WARGA',
        pickedUpAt: new Date(),
      },
    });
  }
}