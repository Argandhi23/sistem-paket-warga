import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import tipe bawaan prisma

export class UserRepository {
  static async findWargaAndSecurity() {
    return prisma.user.findMany({
      where: {
        role: { in: ['WARGA', 'SECURITY'] }
      },
      include: { rumah: true },
      orderBy: { name: 'asc' }
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  // Gunakan Prisma.UserCreateInput bukan 'any'
  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  static async linkToRumah(userId: string, rumahId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { rumahId: rumahId }
    });
  }
}