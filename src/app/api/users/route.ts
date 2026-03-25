import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/error-handler'; // <-- 1. Import handler-nya

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simpan user ke database
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        unitNumber: body.unitNumber,
      }
    });

    // <-- 2. Format response sukses agar seragam (ada success & data)
    return NextResponse.json({ success: true, data: user }, { status: 201 });
    
  } catch (error) {
    // <-- 3. Lempar error ke Global Error Handler (tidak perlu ': any' lagi)
    return handleError(error);
  }
}