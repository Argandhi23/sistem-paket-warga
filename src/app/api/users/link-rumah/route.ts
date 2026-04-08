import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { handleError } from '@/lib/error-handler';
import { requireAdminSession } from '@/lib/require-admin-session';

// UI Mintanya PUT, jadi kita ganti jadi PUT
export async function PUT(request: Request) { 
  try {
    await requireAdminSession();

    const body = await request.json();
    const { userId, rumahId } = body;

    const data = await UserService.linkUserToRumah({ userId, rumahId });

    return NextResponse.json({ 
      success: true, 
      message: "User berhasil dihubungkan ke Rumah",
      data 
    }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}