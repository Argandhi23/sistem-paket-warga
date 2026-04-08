import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError } from "@/lib/custom-error";

export async function requireAdminSession() {
  // Ambil sesi login saat ini
  const session = await getServerSession(authOptions);

  // 1. Cek apakah user sudah login
  if (!session || !session.user) {
    throw new ApiError(401, "Unauthorized: Anda harus login untuk mengakses ini");
  }

  // 2. Cek apakah role user adalah ADMIN
  // Kita gunakan tipe 'any' sementara jika interface tipe NextAuth belum di-extend
  const userRole = session.user.role;
  
  if (userRole !== "ADMIN") {
    throw new ApiError(403, "Forbidden: Akses ditolak. Hanya ADMIN yang diizinkan melakukan aksi ini");
  }

  return session;
}