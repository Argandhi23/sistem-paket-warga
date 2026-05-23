import { PackageRepository } from '@/repositories/package.repository';
import { RumahRepository } from '@/repositories/rumah.repository';
import { ApiError } from '@/lib/custom-error';
import { calculatePenalty as getPenaltyInfo, PENALTY_CONFIG } from '@/utils/penalty';
import { logActivity } from '@/lib/activity-logger';

export class PackageService {
  /**
   * Mengambil daftar paket untuk Admin/Security.
   * Melakukan pembersihan data expired sebelum mengambil list.
   */
  static async listForAdmin(params: { 
    unit?: string; 
    status?: string; 
    sort?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // Jalankan pengecekan paket kadaluarsa di Service layer (Business Process)
    // Sesuai Audit: Ini adalah business process, bukan repo responsibility.
    await PackageRepository.updateExpiredPackages();

    return await PackageRepository.findWithFilters({
      unitNumber: params.unit,
      status: params.status,
      courier: params.courier,
      startDate: params.startDate,
      endDate: params.endDate,
      sort: params.sort === 'lama' ? 'asc' : 'desc'
    });
  }

  static async getPackageStats(filters: { wargaId?: string; role: string }) {
    const dbFilters: any = {};
    if (filters.role === "WARGA") {
      dbFilters.wargaId = filters.wargaId;
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

    // SDPR-37/TestCases Skenario 1: Validasi unit ada di database Rumah
    const allRumah = await RumahRepository.findAll();
    const unitExists = allRumah.some(r => {
      const formattedUnit = `${r.blok}-${r.nomor}`;
      return formattedUnit.toUpperCase() === payload.unitNumber.toUpperCase();
    });

    if (!unitExists) {
      throw new ApiError(404, `Rumah/Unit ${payload.unitNumber} tidak ditemukan di database.`);
    }

    const newPackage = await PackageRepository.create({
      courierName: payload.courierName,
      recipientName: payload.recipientName,
      unitNumber: payload.unitNumber,
      securityId: payload.securityId, // Disuplai dari Session di API layer (Secure)
      trackingNumber: payload.trackingNumber,
      wargaId: payload.wargaId,
    });
    
    // SDPR-41: Audit Trail
    await logActivity({
      action: "PACKAGE_REGISTRATION",
      entityType: "Package",
      entityId: newPackage.id,
      userId: payload.securityId,
      details: { courier: payload.courierName, recipient: payload.recipientName }
    });

    return newPackage;
  }

  static async updatePackage(id: string, data: any) {
    return await PackageRepository.update(id, data);
  }

  static async deletePackage(id: string) {
    return await PackageRepository.delete(id);
  }

  static async processExpiredPackages() {
    return await PackageRepository.updateExpiredPackages();
  }

  static async listPackagesForWarga(unitNumber: string | null | undefined) {
    if (!unitNumber) {
      throw new ApiError(400, 'User tidak terasosiasi dengan nomor unit rumah manapun');
    }

    return await PackageRepository.findWithFilters({
      unitNumber: unitNumber,
      status: 'SEMUA',
      sort: 'desc'
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
    // Sesuai instruksi PM dan referensi UI:
    // - 3 Hari pertama gratis (Free).
    // - Hari ke-4 dst dihitung Rp 2.000 / hari.
    const actualLateDays = Math.max(0, days - PENALTY_CONFIG.FREE_DAYS);
    return actualLateDays * PENALTY_CONFIG.DAILY_RATE;
  }

  static async handoverPackage(id: string, payload: {
    pickedUpBy: string;
    penaltyAmount: number;
    penaltyPaid: boolean;
  }) {
    if (!payload.pickedUpBy.trim()) {
      throw new ApiError(400, 'Nama pengambil wajib diisi');
    }

    const updatedPackage = await PackageRepository.handoverPackage(id, {
      pickedUpBy: payload.pickedUpBy.trim(),
      penaltyAmount: payload.penaltyAmount,
      penaltyPaid: payload.penaltyPaid,
    });

    // SDPR-41: Audit Trail
    await logActivity({
      action: "PACKAGE_HANDOVER",
      entityType: "Package",
      entityId: id,
      details: { pickedUpBy: payload.pickedUpBy, penalty: payload.penaltyAmount }
    });

    return updatedPackage;
  }
}
