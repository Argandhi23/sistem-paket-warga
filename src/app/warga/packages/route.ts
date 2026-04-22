// src/app/api/warga/packages/route.ts

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import { PackageService } from '@/services/package.service';
import { handleError } from '@/lib/error-handler';

export async function GET() {
  try {
    // 1. Validasi Session (Hanya user yang login yang bisa akses)
    const session = await requireSession();
    
    // 2. Ambil unitNumber dari session user
    // Pastikan saat setup NextAuth, unitNumber sudah dimasukkan ke dalam objek session
    const unitNumber = session.user?.unitNumber;

    // 3. Panggil Service
    const packages = await PackageService.listPackagesForWarga(unitNumber);

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    return handleError(error);
  }
}