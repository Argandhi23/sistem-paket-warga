import { ApiError } from '@/lib/custom-error';
import { RumahRepository } from '@/repositories/rumah.repository';

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export class RumahService {
  static async listAll() {
    return RumahRepository.findAll();
  }

  static async create(payload: { blok?: unknown; nomor?: unknown }) {
    const blok = normalizeText(payload.blok);
    const nomor = normalizeText(payload.nomor);

    if (!blok || !nomor) {
      throw new ApiError(400, 'blok dan nomor rumah wajib diisi');
    }

    return RumahRepository.create({ blok, nomor });
  }

  static async update(payload: { id?: unknown; blok?: unknown; nomor?: unknown }) {
    const id = normalizeText(payload.id);
    const blok = normalizeText(payload.blok);
    const nomor = normalizeText(payload.nomor);

    if (!id) {
      throw new ApiError(400, 'id rumah wajib diisi');
    }

    const existing = await RumahRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'rumah tidak ditemukan');
    }

    if (!blok && !nomor) {
      throw new ApiError(400, 'blok atau nomor rumah wajib diisi untuk update');
    }

    return RumahRepository.update(id, {
      blok: blok || undefined,
      nomor: nomor || undefined,
    });
  }

  static async delete(payload: { id?: unknown }) {
    const id = normalizeText(payload.id);
    if (!id) {
      throw new ApiError(400, 'id rumah wajib diisi');
    }

    const existing = await RumahRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'rumah tidak ditemukan');
    }

    await RumahRepository.delete(id);
    return { id };
  }
}
