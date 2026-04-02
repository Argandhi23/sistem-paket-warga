import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Menghubungkan User ke Rumah (Linkage)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, rumahId } = body;

    if (!userId || !rumahId) {
      return NextResponse.json({ success: false, message: "userId dan rumahId wajib diisi" }, { status: 400 });
    }

    // Update User dengan rumahId yang baru
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rumahId: rumahId },
      // Include untuk memastikan relasinya berhasil ditarik
      include: { rumah: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User berhasil dihubungkan ke Rumah",
      data: updatedUser 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghubungkan user ke rumah" }, { status: 500 });
  }
}