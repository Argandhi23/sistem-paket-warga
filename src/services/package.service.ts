import { PackageRepository } from '@/repositories/package.repository';
import { ApiError } from '@/lib/custom-error';
import { PACKAGE_EXPIRY_DAYS } from '@/lib/expiry';

export class PackageService {
  static async listForAdmin(params: { 
    unit?: string; 
    status?: string; 
    sort?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
  }) {
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

    // Panggil repository untuk simpan ke database
    const newPackage = await PackageRepository.create({
      courierName: payload.courierName,
      recipientName: payload.recipientName,
      unitNumber: payload.unitNumber,
      securityId: payload.securityId,
      trackingNumber: payload.trackingNumber,
      wargaId: payload.wargaId,
    });
    
    return newPackage;
  }

  static async processExpiredPackages() {
    return await PackageRepository.updateExpiredPackages();
  }

  static async listPackagesForWarga(unitNumber: string | null | undefined) {
    if (!unitNumber) {
      throw new ApiError(400, 'User tidak terasosiasi dengan nomor unit rumah manapun');
    }

    // Menggunakan findWithFilters karena findByUnit sudah dihapus di repository
    return await PackageRepository.findWithFilters({
      unitNumber: unitNumber,
      status: 'SEMUA',
      sort: 'desc'
    });
  }

  static calculatePenaltyFromDays(hariTerlambat: number): number {
    return hariTerlambat * 2000;
  }

  static calculatePenalty(receivedAt: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - receivedAt.getTime();
    if (diffTime < 0) return 0;
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hariTerlambat = Math.max(0, diffDays - PACKAGE_EXPIRY_DAYS);
    return this.calculatePenaltyFromDays(hariTerlambat);
  }
}
