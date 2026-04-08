import { NextResponse } from "next/server";
import { handleError } from "@/lib/error-handler";
import { requireAdminSession } from "@/lib/require-admin-session";
import { RumahService } from '@/services/rumah.service';

// GET: Mengambil semua data Rumah beserta daftar penghuninya (Linkage)
export async function GET() {
  try {
    await requireAdminSession({ api: true });
    const daftarRumah = await RumahService.listAll();
    return NextResponse.json({ success: true, data: daftarRumah });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession({ api: true });

    const body = await req.json();
    const rumahBaru = await RumahService.create(body);

    return NextResponse.json({ success: true, data: rumahBaru }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdminSession({ api: true });

    const body = await req.json();
    const rumah = await RumahService.update(body);

    return NextResponse.json({ success: true, data: rumah });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminSession({ api: true });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleted = await RumahService.delete({ id });

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Rumah berhasil dihapus',
    });
  } catch (error) {
    return handleError(error);
  }
}
