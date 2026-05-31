import { ApiError } from '@/lib/custom-error';
import { RumahRepository } from '@/repositories/rumah.repository';
import { logActivity } from '@/lib/activity-logger';

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export class RumahService {
  static async listAll(searchQuery?: string) {
    // Sanitasi: pastikan tipe datanya string dan hapus spasi berlebih
    const sanitizedQuery = typeof searchQuery === 'string' ? searchQuery.trim() : undefined;
    
    // Jika string kosong setelah di-trim, jadikan undefined agar Prisma menampilkan semua
    const finalQuery = sanitizedQuery !== '' ? sanitizedQuery : undefined;
    
    return RumahRepository.findAll(finalQuery);
  }

  static async create(payload: { blok?: unknown; nomor?: unknown }) {
    const blok = normalizeText(payload.blok);
    const nomor = normalizeText(payload.nomor);

    if (!blok || !nomor) {
      throw new ApiError(400, 'blok dan nomor rumah wajib diisi');
    }

    const rumah = await RumahRepository.create({ blok, nomor });

    await logActivity({
      action: 'RUMAH_CREATED',
      entityType: 'Rumah',
      entityId: rumah.id,
      details: { blok, nomor },
    });

    return rumah;
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

    const updated = await RumahRepository.update(id, {
      blok: blok || undefined,
      nomor: nomor || undefined,
    });

    await logActivity({
      action: 'RUMAH_UPDATED',
      entityType: 'Rumah',
      entityId: id,
      details: { changes: { blok, nomor } },
    });

    return updated;
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

    await logActivity({
      action: 'RUMAH_DELETED',
      entityType: 'Rumah',
      entityId: id,
      details: { deleted: true },
    });

    return { id };
  }
}
