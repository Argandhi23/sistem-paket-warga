import { UserRepository } from '@/repositories/user.repository';
import { RumahRepository } from '@/repositories/rumah.repository';
import { ApiError } from '@/lib/custom-error';
import { Prisma, Role } from '@prisma/client'; // <-- Tambah Role di sini

export class UserService {
  static async getWargaAndSecurity(roleFilter?: string | null, sort?: string | null) {
    return await UserRepository.findWargaAndSecurity(roleFilter, sort);
  }

  static async createUser(payload: Prisma.UserCreateInput) {
    if (!payload.email || !payload.name) {
      throw new ApiError(400, 'Nama dan Email wajib diisi');
    }
    return await UserRepository.create(payload);
  }

  // Ganti role?: any menjadi role?: Role
  static async updateUser(payload: { id: string; name?: string; email?: string; role?: Role }) {
    if (!payload.id) throw new ApiError(400, 'User ID wajib dikirim');
    
    const dataToUpdate: Prisma.UserUpdateInput = {};
    if (payload.name) dataToUpdate.name = payload.name;
    if (payload.email) dataToUpdate.email = payload.email;
    if (payload.role) dataToUpdate.role = payload.role;

    return await UserRepository.update(payload.id, dataToUpdate);
  }

  static async deleteUser(id: string) {
    if (!id) throw new ApiError(400, 'User ID wajib dikirim');
    return await UserRepository.delete(id);
  }

  static async linkUserToRumah(payload: { userId: string; rumahId: string }) {
    if (!payload.userId || !payload.rumahId) {
      throw new ApiError(400, 'User ID dan Rumah ID wajib dikirim');
    }
    const user = await UserRepository.findById(payload.userId);
    if (!user) throw new ApiError(404, 'User tidak ditemukan');
    
    const rumah = await RumahRepository.findById(payload.rumahId);
    if (!rumah) throw new ApiError(404, 'Data Rumah tidak ditemukan');

    return await UserRepository.linkToRumah(payload.userId, payload.rumahId);
  }
}