import { PackageRepository } from '@/repositories/package.repository';

export class PackageService {
  static async receiveNewPackage(payload: {
    courierName: string;
    recipientName: string;
    unitNumber: string;
    securityId: string;
    trackingNumber?: string;
  }) {
    // Di sini kita bisa tambahkan validasi bisnis
    if (!payload.unitNumber) {
      throw new Error('Nomor unit rumah/apartemen wajib diisi');
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
}