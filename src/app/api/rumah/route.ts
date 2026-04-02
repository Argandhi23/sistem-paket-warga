import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Mengambil semua data Rumah beserta daftar penghuninya (Linkage)
export async function GET() {
  try {
    const daftarRumah = await prisma.rumah.findMany({
      include: {
        penghuni: {
          select: { id: true, name: true, email: true, role: true } // Jangan tampilkan password!
        }
      },
      orderBy: { blok: 'asc' }
    });
    return NextResponse.json({ success: true, data: daftarRumah });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Membuat data Rumah baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blok, nomor } = body;

    const rumahBaru = await prisma.rumah.create({
      data: { blok, nomor }
    });

    return NextResponse.json({ success: true, data: rumahBaru }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal membuat rumah" }, { status: 500 });
  }
}