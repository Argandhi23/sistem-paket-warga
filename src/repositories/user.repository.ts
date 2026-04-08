import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';

export class UserRepository {
  static async findForManagement(params?: { role?: Role; sortOrder?: 'asc' | 'desc' }) {
    const where: Prisma.UserWhereInput = params?.role
      ? { role: params.role }
      : { role: { in: [Role.WARGA, Role.SECURITY] } };

    return prisma.user.findMany({
      where,
      include: {
        rumah: {
          select: {
            id: true,
            blok: true,
            nomor: true,
          },
        },
      },
      orderBy: {
        createdAt: params?.sortOrder ?? 'desc',
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  static async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static async linkToRumah(userId: string, rumahId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { rumahId },
      include: {
        rumah: {
          select: {
            id: true,
            blok: true,
            nomor: true,
          },
        },
      },
    });
  }
}
