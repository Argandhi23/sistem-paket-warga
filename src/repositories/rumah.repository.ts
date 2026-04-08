import prisma from '@/lib/prisma';

export class RumahRepository {
  static async findAll() {
    return prisma.rumah.findMany({
      include: {
        penghuni: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        blok: 'asc',
      },
    });
  }

  static async findById(id: string) {
    return prisma.rumah.findUnique({ where: { id } });
  }

  static async create(data: { blok: string; nomor: string }) {
    return prisma.rumah.create({ data });
  }

  static async update(id: string, data: { blok?: string; nomor?: string }) {
    return prisma.rumah.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.rumah.delete({ where: { id } });
  }
}
