import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { handleError } from '@/lib/error-handler';
import { requireAdminSession } from "@/lib/require-admin-session";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(); 
    
    // Ambil query parameter dari URL Frontend (?role=...&sort=...)
    const searchParams = request.nextUrl.searchParams;
    const roleFilter = searchParams.get('role');
    const sort = searchParams.get('sort');

    const data = await UserService.getWargaAndSecurity(roleFilter, sort);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const data = await UserService.createUser(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const data = await UserService.updateUser(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminSession();
    // Mendukung delete via Query Param (?id=...) atau Body {id: ...}
    const searchParams = request.nextUrl.searchParams;
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json();
      id = body.id;
    }

    await UserService.deleteUser(id as string);
    return NextResponse.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    return handleError(error);
  }
}