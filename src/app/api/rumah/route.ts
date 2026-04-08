import { NextRequest, NextResponse } from "next/server";
import { RumahService } from "@/services/rumah.service";
import { handleError } from "@/lib/error-handler";
import { requireAdminSession } from "@/lib/require-admin-session"; 

export async function GET() {
  try {
    await requireAdminSession();
    const data = await RumahService.getAllRumah();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const data = await RumahService.createRumah(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const data = await RumahService.updateRumah(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminSession();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) throw new Error("ID Rumah tidak ditemukan");

    await RumahService.deleteRumah(id);
    return NextResponse.json({ success: true, message: "Rumah berhasil dihapus" });
  } catch (error) {
    return handleError(error);
  }
}