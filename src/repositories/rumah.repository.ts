import prisma from '@/lib/prisma';

export class RumahRepository {
  static async findAll(searchQuery?: string) {
    const whereClause = searchQuery
      ? {
          OR: [
            { blok: { contains: searchQuery, mode: 'insensitive' as const } },
            { nomor: { contains: searchQuery, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return prisma.rumah.findMany({
      where: whereClause,
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
      orderBy: [
        { blok: 'asc' },
        { nomor: 'asc' },
      ],
    });
  }

  static async getMappingStats() {
    const [total, occupied] = await Promise.all([
      prisma.rumah.count(),
      prisma.rumah.count({
        where: {
          penghuni: { some: {} },
        },
      }),
    ]);

    return {
      total,
      occupied,
    };
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
