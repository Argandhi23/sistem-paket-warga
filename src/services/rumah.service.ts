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
    
    // Bisa ditambah validasi lain, misal cek duplikasi blok & nomor
    return await RumahRepository.create(payload);
  }
}