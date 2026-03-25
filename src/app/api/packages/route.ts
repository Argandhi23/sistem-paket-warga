import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';
import { PackageRepository } from '@/repositories/package.repository';
import { handleError } from '@/lib/error-handler'; // <-- 1. Import handler
import { ApiError } from '@/lib/custom-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPackage = await PackageService.receiveNewPackage(body);
    // Tambahkan format 'success: true' agar rapi
    return NextResponse.json({ success: true, data: newPackage }, { status: 201 });
  } catch (error) {
    // <-- 2. Gunakan Global Error Handler
    return handleError(error); 
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitNumber = searchParams.get('unit');

    if (!unitNumber) {
      // <-- 3. Contoh melempar Custom Error
      throw new ApiError(400, 'Parameter unit wajib diisi (contoh: ?unit=A-12)'); 
    }

    const packages = await PackageRepository.findByUnit(unitNumber);
    return NextResponse.json({ success: true, data: packages }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}