import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRepository } from '@/repositories/user.repository';
import { handleError } from '@/lib/error-handler';
import { ApiError } from '@/lib/custom-error';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SECURITY" && session.user.role !== "ADMIN")) {
      throw new ApiError(403, "Akses ditolak.");
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const users = await UserRepository.findWargaByNameOrUnit(query);
    
    // Map to the format expected by the frontend
    const mappedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Tanpa Nama',
      unitNumber: user.unitNumber || (user.rumah ? `${user.rumah.blok} ${user.rumah.nomor}` : 'Tanpa Unit'),
      activePackages: user._count.packages,
      floor: user.rumah ? `Blok ${user.rumah.blok}` : 'N/A', // Simple floor info if not available
    }));

    return NextResponse.json({ success: true, data: mappedUsers });
  } catch (error) {
    return handleError(error);
  }
}
