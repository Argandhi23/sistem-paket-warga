import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { handleError } from '@/lib/error-handler';
import { requireAdminSession } from '@/lib/require-admin-session';


export async function POST(request: Request) { // Randy menggunakan POST di catatan commitnya
  try {
    // Panggil Guard: Pastikan yang nge-hit API ini cuma ADMIN
    await requireAdminSession();

    const body = await request.json();
    const { userId, rumahId } = body;

    // Panggil Service untuk logic dan akses database
    const data = await UserService.linkUserToRumah({ userId, rumahId });

    return NextResponse.json({ 
      success: true, 
      message: "User berhasil dihubungkan ke Rumah",
      data 
    }, { status: 200 });
  } catch (error) {
    // Kalau ada error (misal user bukan admin, atau userId kosong), lari ke sini
    return handleError(error);
  }
}