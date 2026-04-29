import { NextResponse } from 'next/server';
import { handleError } from '@/lib/error-handler';
import { ApiError } from '@/lib/custom-error';
import { PackageService } from '@/services/package.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hariTerlambatRaw = searchParams.get('hariTerlambat');

    if (hariTerlambatRaw === null || hariTerlambatRaw.trim() === '') {
      throw new ApiError(400, "Parameter 'hariTerlambat' wajib diisi.");
    }

    const hariTerlambat = Number(hariTerlambatRaw);

    if (isNaN(hariTerlambat) || hariTerlambat < 0) {
      throw new ApiError(400, "Parameter 'hariTerlambat' harus berupa angka bulat bernilai >= 0.");
    }

    // Reuse business logic formula from PackageService
    const penalty = PackageService.calculatePenaltyFromDays(Math.floor(hariTerlambat));

    return NextResponse.json({
      success: true,
      data: {
        hariTerlambat: Math.floor(hariTerlambat),
        penalty
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
