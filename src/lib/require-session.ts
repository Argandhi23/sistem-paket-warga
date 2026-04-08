import { getServerSession } from "next-auth";
// Asumsi konfigurasi NextAuth kamu diekspor dengan nama authOptions dari lib/auth.ts
import { authOptions } from "@/lib/auth"; 
import { ApiError } from "@/lib/custom-error";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new ApiError(401, "Unauthorized: Anda harus login untuk mengakses ini");
  }

  return session;
}