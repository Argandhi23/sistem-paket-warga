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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const params = {
      unit: searchParams.get('unit') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || undefined,
      courier: searchParams.get('courier') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const userRole = session.user.role;
    const userUnitNumber = session.user.unitNumber;

    // Keamanan: Warga hanya boleh lihat unit miliknya sendiri
    if (userRole === "WARGA") {
      if (!userUnitNumber) throw new ApiError(403, "Unit belum ditautkan");
      params.unit = userUnitNumber;
    }

    const packages = await PackageService.listForAdmin(params);

    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SECURITY" && session.user.role !== "ADMIN")) {
      throw new ApiError(403, "Hanya Security atau Admin yang dapat mengubah data paket.");
    }

    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) throw new ApiError(400, "ID paket wajib diisi.");

    const updatedPackage = await PackageRepository.update(id, data);
    return NextResponse.json({ success: true, data: updatedPackage });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Hanya Admin yang dapat menghapus log paket.");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) throw new ApiError(400, "ID paket wajib diisi.");

    await PackageRepository.delete(id);
    return NextResponse.json({ success: true, message: "Log paket berhasil dihapus." });
  } catch (error) {
    return handleError(error);
  }
}
