import { PackageRepository } from '@/repositories/package.repository';
import { RumahRepository } from '@/repositories/rumah.repository';
import { ApiError } from '@/lib/custom-error';
import { calculatePenalty as getPenaltyInfo, PENALTY_CONFIG } from '@/utils/penalty';
import { logActivity } from '@/lib/activity-logger';
import { Prisma } from '@prisma/client';

// Cooldown 10 menit agar pembacaan halaman tidak terus-menerus menembak query UPDATE ke Supabase Free Tier
const EXPIRY_SYNC_COOLDOWN_MS = 10 * 60 * 1000;
let lastExpirySyncAt = 0;

export class PackageService {
  /**
   * Mengambil daftar paket untuk Admin/Security.
   * Pembersihan data expired di-throttle maksimal 1x tiap 10 menit untuk menghemat kuota/koneksi Supabase Free Tier.
   */
  static async listForAdmin(params: {
    unit?: string;
    status?: string;
    sort?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const now = Date.now();
    const shouldSyncExpired = now - lastExpirySyncAt > EXPIRY_SYNC_COOLDOWN_MS;

    if (shouldSyncExpired) {
      lastExpirySyncAt = now;
      const [, packages] = await Promise.all([
        Promise.resolve(PackageRepository.updateExpiredPackages()).catch(() => null),
        PackageRepository.findWithFilters({
          unitNumber: params.unit,
          status: params.status,
          courier: params.courier,
          startDate: params.startDate,
          endDate: params.endDate,
          sort: params.sort === 'lama' ? 'asc' : 'desc',
          search: params.search,
        }),
      ]);
      return packages;
    }

    return await PackageRepository.findWithFilters({
      unitNumber: params.unit,
      status: params.status,
      courier: params.courier,
      startDate: params.startDate,
      endDate: params.endDate,
      sort: params.sort === 'lama' ? 'asc' : 'desc',
      search: params.search,
    });
  }

  static async getPackageStats(filters: { wargaId?: string; unitNumber?: string; role: string }) {
    const dbFilters: { wargaId?: string; unitNumber?: string } = {};
    if (filters.role === 'WARGA') {
      if (filters.unitNumber) {
        dbFilters.unitNumber = filters.unitNumber;
      } else {
        dbFilters.wargaId = filters.wargaId;
      }
    }
    return await PackageRepository.getStats(dbFilters);
  }

  /**
   * Mencatat paket baru ke sistem.
   * Validasi: Unit harus terdaftar di database Rumah.
   */
  static async receiveNewPackage(payload: {
    courierName: string;
    recipientName: string;
    unitNumber: string;
    securityId: string;
    trackingNumber?: string;
    wargaId?: string;
  }) {
    if (!payload.unitNumber) {
      throw new ApiError(400, 'Nomor unit rumah/apartemen wajib diisi');
    }

    const allRumah = await RumahRepository.findAll();
    const normalizeUnit = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const unitExists = allRumah.some((r) => {
      const formattedUnit = `${r.blok}${r.nomor}`;
      return normalizeUnit(formattedUnit) === normalizeUnit(payload.unitNumber);
    });

    if (!unitExists) {
      throw new ApiError(404, `Rumah/Unit ${payload.unitNumber} tidak ditemukan di database.`);
    }

    const newPackage = await PackageRepository.create({
      courierName: payload.courierName,
      recipientName: payload.recipientName,
      unitNumber: payload.unitNumber,
      securityId: payload.securityId,
      trackingNumber: payload.trackingNumber,
      wargaId: payload.wargaId,
    });

    await logActivity({
      action: 'PACKAGE_REGISTRATION',
      entityType: 'Package',
      entityId: newPackage.id,
      userId: payload.securityId,
      details: { courier: payload.courierName, recipient: payload.recipientName },
    });

    return newPackage;
  }

  static async updatePackage(id: string, data: Prisma.PackageUncheckedUpdateInput, actorId?: string) {
    const updatedPackage = await PackageRepository.update(id, data);

    await logActivity({
      action: 'PACKAGE_UPDATED',
      entityType: 'Package',
      entityId: id,
      userId: actorId ?? null,
      details: { changes: data },
    });

    return updatedPackage;
  }

  static async deletePackage(id: string, actorId?: string) {
    const deletedPackage = await PackageRepository.delete(id);

    await logActivity({
      action: 'PACKAGE_DELETED',
      entityType: 'Package',
      entityId: id,
      userId: actorId ?? null,
      details: { deleted: true },
    });

    return deletedPackage;
  }

  static async processExpiredPackages() {
    lastExpirySyncAt = Date.now();
    return await PackageRepository.updateExpiredPackages();
  }

  static async listPackagesForWarga(unitNumber: string | null | undefined) {
    if (!unitNumber) {
      throw new ApiError(400, 'User tidak terasosiasi dengan nomor unit rumah manapun');
    }

    return await PackageRepository.findWithFilters({
      unitNumber: unitNumber,
      status: 'SEMUA',
      sort: 'desc',
    });
  }

  /**
   * Helper untuk menghitung denda berdasarkan tanggal terima.
   */
  static calculatePenalty(receivedAt: Date | string): number {
    const info = getPenaltyInfo(receivedAt);
    return info.amount;
  }

  /**
   * Helper untuk menghitung denda berdasarkan jumlah hari (digunakan API Penalty).
   */
  static calculatePenaltyFromDays(days: number): number {
    const actualLateDays = Math.max(0, days - PENALTY_CONFIG.FREE_DAYS);
    return actualLateDays * PENALTY_CONFIG.DAILY_RATE;
  }

  static async handoverPackage(
    id: string,
    payload: {
      pickedUpBy: string;
      penaltyAmount: number;
      penaltyPaid: boolean;
    }
  ) {
    if (!payload.pickedUpBy.trim()) {
      throw new ApiError(400, 'Nama pengambil wajib diisi');
    }

    const updatedPackage = await PackageRepository.handoverPackage(id, {
      pickedUpBy: payload.pickedUpBy.trim(),
      penaltyAmount: payload.penaltyAmount,
      penaltyPaid: payload.penaltyPaid,
    });

    await logActivity({
      action: 'PACKAGE_HANDOVER',
      entityType: 'Package',
      entityId: id,
      details: { pickedUpBy: payload.pickedUpBy, penalty: payload.penaltyAmount },
    });

    return updatedPackage;
  }

  static async getAnalytics(days: number = 30) {
    const [dailyVolume, summary] = await Promise.all([
      PackageRepository.getDailyVolume(days),
      PackageRepository.getAnalyticsSummary(),
    ]);

    return {
      dailyVolume,
      ...summary,
    };
  }
}
