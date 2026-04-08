import { UserRepository } from '@/repositories/user.repository';
import { RumahRepository } from '@/repositories/rumah.repository';
import { ApiError } from '@/lib/custom-error';
import { Prisma } from '@prisma/client'; // Import tipe bawaan prisma

export class UserService {
  static async getWargaAndSecurity() {
    return await UserRepository.findWargaAndSecurity();
  }

  // Gunakan Prisma.UserCreateInput bukan 'any'
  static async createUser(payload: Prisma.UserCreateInput) {
    if (!payload.email || !payload.name) {
      throw new ApiError(400, 'Nama dan Email wajib diisi');
    }
    
    return await UserRepository.create(payload);
  }

  static async linkUserToRumah(payload: { userId: string; rumahId: string }) {
    if (!payload.userId || !payload.rumahId) {
      throw new ApiError(400, 'User ID dan Rumah ID wajib dikirim');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user) throw new ApiError(404, 'User tidak ditemukan');
    if (user.role !== 'WARGA') throw new ApiError(400, 'Hanya role WARGA yang bisa ditautkan ke Rumah');

    const rumah = await RumahRepository.findById(payload.rumahId);
    if (!rumah) throw new ApiError(404, 'Data Rumah tidak ditemukan');

    return await UserRepository.linkToRumah(payload.userId, payload.rumahId);
  }
}