import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { handleError } from '@/lib/error-handler';
import { requireAdminSession } from "@/lib/require-admin-session";

export async function GET() {
  try {
    await requireAdminSession(); 
    
    const data = await UserService.getWargaAndSecurity();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = await request.json();
    
    // Logic hash password ditaruh di Service jika diperlukan
    const data = await UserService.createUser(body);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}