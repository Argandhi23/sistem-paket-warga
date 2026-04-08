import { NextResponse } from "next/server";
import { RumahService } from "@/services/rumah.service";
import { handleError } from "@/lib/error-handler";
// Pastikan path import ini sesuai dengan file buatan Randy
import { requireAdminSession } from "@/lib/require-admin-session"; 

export async function GET() {
  try {
    await requireAdminSession(); // Aktifkan guard ini

    const data = await RumahService.getAllRumah();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession(); // Aktifkan guard ini

    const body = await req.json();
    const data = await RumahService.createRumah(body);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}