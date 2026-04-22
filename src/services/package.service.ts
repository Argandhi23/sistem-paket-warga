import { PackageRepository } from '@/repositories/package.repository';
import { ApiError } from '@/lib/custom-error';
import prisma from '@/lib/prisma';

export class PackageService {
  static async receiveNewPackage(payload: {
    courierName: string;
    recipientName: string;
    unitNumber: string;
    securityId: string;
    trackingNumber?: string;
  }) {
    // Di sini kita tambahkan validasi bisnis
    if (!payload.unitNumber) {
      throw new ApiError(400, 'Nomor unit rumah/apartemen wajib diisi');
    }

    // Validasi: Pastikan unitNumber yang diinput Satpam memang ada di tabel Rumah
    const rumahExists = await prisma.rumah.findFirst({
      where: { nomor: payload.unitNumber }
    });

    if (!rumahExists) {
      throw new ApiError(400, 'Unit tidak terdaftar');
    }

    // Panggil repository untuk simpan ke database
    const newPackage = await PackageRepository.create({
      courierName: payload.courierName,
      recipientName: payload.recipientName,
      unitNumber: payload.unitNumber,
      securityId: payload.securityId,
      trackingNumber: payload.trackingNumber,
    });

    // TODO nantinya: Trigger notifikasi ke warga terkait
    
    return newPackage;
  }

  static async processExpiredPackages() {
    return await PackageRepository.updateExpiredPackages();
  }

  static async listPackagesForWarga(unitNumber: string | null | undefined) {
    if (!unitNumber) {
      throw new ApiError(400, 'User tidak terasosiasi dengan nomor unit rumah manapun');
    }

    // Jalankan sinkronisasi expired juga untuk Warga secara OTOMATIS
    await PackageRepository.updateExpiredPackages();

    return await PackageRepository.findByUnit(unitNumber);
  }

}