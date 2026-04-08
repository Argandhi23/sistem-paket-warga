import { RumahRepository } from '@/repositories/rumah.repository';
import { ApiError } from '@/lib/custom-error';

export class RumahService {
  static async getAllRumah() {
    return await RumahRepository.findAll();
  }

  static async createRumah(payload: { blok: string; nomor: string }) {
    if (!payload.blok || !payload.nomor) {
      throw new ApiError(400, 'Blok dan nomor rumah wajib diisi');
    }
    return await RumahRepository.create(payload);
  }

  static async updateRumah(payload: { id: string; blok?: string; nomor?: string }) {
    if (!payload.id) throw new ApiError(400, 'Rumah ID wajib dikirim');
    return await RumahRepository.update(payload.id, { blok: payload.blok, nomor: payload.nomor });
  }

  static async deleteRumah(id: string) {
    if (!id) throw new ApiError(400, 'Rumah ID wajib dikirim');
    return await RumahRepository.delete(id);
  }
}