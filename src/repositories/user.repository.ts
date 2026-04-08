import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client'; // <-- Tambahkan Role di sini

export class UserRepository {
  static async findWargaAndSecurity(roleFilter?: string | null, sort?: string | null) {
    // Menyiapkan filter Role dengan tipe Prisma.EnumRoleFilter agar TypeScript aman
    const roleCondition: Prisma.EnumRoleFilter = roleFilter 
      ? { equals: roleFilter.toUpperCase() as Role } 
      : { in: [Role.WARGA, Role.SECURITY] };

    return prisma.user.findMany({
      where: { role: roleCondition },
      include: { rumah: true },
      // Jika sort 'desc', urutkan dari yang terbaru, default 'asc'
      orderBy: { createdAt: sort === 'desc' ? 'desc' : 'asc' } 
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
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
      data: { rumahId: rumahId }
    });
  }
}