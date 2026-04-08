import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ApiError } from "@/lib/custom-error";

type RequireAdminSessionOptions = {
  api?: boolean;
  redirectTo?: string;
};

export async function requireAdminSession(options?: RequireAdminSessionOptions) {
  const isApiRequest = options?.api ?? false;
  const redirectTo = options?.redirectTo ?? '/login';
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    if (isApiRequest) {
      throw new ApiError(401, "Unauthorized: Anda harus login untuk mengakses ini");
    }

    redirect(redirectTo);
  }

  const userRole = session.user.role;

  if (userRole !== "ADMIN") {
    if (isApiRequest) {
      throw new ApiError(403, "Forbidden: Akses ditolak. Hanya ADMIN yang diizinkan melakukan aksi ini");
    }

    redirect(redirectTo);
  }

  return session;
}
