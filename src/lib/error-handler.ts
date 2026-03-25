import { NextResponse } from 'next/server';
import { ApiError } from './custom-error';

export function handleError(error: unknown) {
  // Log error ke console untuk keperluan debugging kita di terminal
  console.error('🔥 [API Error]:', error);

  // Jika error adalah custom error kita (misal: validasi gagal, data tidak ketemu)
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  // Jika error bawaan JavaScript/Node.js
  if (error instanceof Error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  // Fallback untuk error yang tidak terduga
  return NextResponse.json(
    { success: false, error: 'Terjadi kesalahan pada server (Internal Server Error)' },
    { status: 500 }
  );
}