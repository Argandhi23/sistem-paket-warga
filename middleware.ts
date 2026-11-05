import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  // ==========================================
  // 🛡️ HARDENING SDPR-67: BLOKIR KREDENSIAL DI GET
  // ==========================================
  const isAuthEndpoint = path.startsWith("/login") || path.startsWith("/api/auth");
  const hasSensitiveParams = searchParams.has("email") || searchParams.has("password");

  if (req.method === "GET" && isAuthEndpoint && hasSensitiveParams) {
    return NextResponse.json(
      {
        success: false,
        message: "Security Violation: Pengiriman email dan password dilarang menggunakan metode GET.",
      },
      { status: 400 }
    );
  }

  // ==========================================
  // 🔐 RBAC UNTUK ROUTE TERLINDUNGI
  // ==========================================
  const isProtectedRoute =
    path.startsWith("/admin") ||
    path.startsWith("/security") ||
    path.startsWith("/warga");

  if (isProtectedRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/security") && token.role !== "SECURITY") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/warga") && token.role !== "WARGA") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
