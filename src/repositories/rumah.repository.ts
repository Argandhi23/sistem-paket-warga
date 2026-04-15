import prisma from '@/lib/prisma';

export class RumahRepository {
  static async findAll(searchQuery?: string) {
    // Siapkan kondisi WHERE jika ada kata kunci pencarian
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
        { nomor: 'asc' } // Tambahan: urutkan nomor juga agar lebih rapi di UI Satpam
      ],
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
