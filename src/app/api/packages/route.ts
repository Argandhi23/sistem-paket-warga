import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';
import { PackageRepository } from '@/repositories/package.repository';
import { handleError } from '@/lib/error-handler';
import { ApiError } from '@/lib/custom-error';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 🛡️ SECURITY: Pastikan hanya Security / Admin yang bisa input paket baru
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SECURITY" && session.user.role !== "ADMIN")) {
      throw new ApiError(403, "Hanya Security atau Admin yang dapat menerima paket.");
    }

    const body = await request.json();
    const newPackage = await PackageService.receiveNewPackage(body);
    
    return NextResponse.json({ success: true, data: newPackage }, { status: 201 });
  } catch (error) {
    return handleError(error); 
  }
}

export async function GET(request: Request) {
  try {
    // 🛡️ SECURITY 1: Cek Session Login
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new ApiError(401, "Unauthorized: Anda harus login untuk melihat data paket");
    }

    const { searchParams } = new URL(request.url);
    const requestedUnit = searchParams.get('unitNumber') || searchParams.get('unit');

    const userRole = session.user.role;
    const userUnitNumber = session.user.unitNumber;

    let packages;

    // 🛡️ SECURITY 2: Otorisasi Role & Mencegah IDOR
    if (userRole === "WARGA") {
      // Warga wajib punya unit rumah
      if (!userUnitNumber) {
        throw new ApiError(403, "Akun Anda belum ditautkan ke unit rumah manapun.");
      }
      
      // Paksa pencarian HANYA ke unit milik Warga tersebut (Abaikan requestedUnit dari URL)
      packages = await PackageRepository.findByUnit(userUnitNumber);
      
    } else if (userRole === "ADMIN" || userRole === "SECURITY") {
      // Admin dan Security bebas mencari unit mana saja via URL, atau melihat semua data
      if (requestedUnit) {
        packages = await PackageRepository.findByUnit(requestedUnit);
      } else {
        // Jika tidak ada ?unit= di URL, ambil semua data paket
        // (Pastikan kamu memiliki fungsi findAll() di PackageRepository-mu ya)
        packages = await PackageRepository.findAll(); 
      }
    } else {
      throw new ApiError(403, "Akses ditolak untuk role Anda.");
    }

    return NextResponse.json({ success: true, data: packages }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}