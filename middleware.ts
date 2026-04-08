import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

// 1. Ini adalah logika RBAC (Role-Based Access Control) NextAuth kamu yang lama
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Jika user sudah login tapi rolenya tidak sesuai dengan halaman yang dituju
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/security") && token?.role !== "SECURITY") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/warga") && token?.role !== "WARGA") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Halaman dilindungi hanya bisa diakses kalau punya token
      authorized: ({ token }) => !!token,
    },
  }
);

// 2. Ini adalah Middleware Utama yang akan menangkap semua request
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const path = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  // ==========================================
  // 🛡️ HARDENING SDPR-67: BLOKIR KREDENSIAL DI GET
  // ==========================================
  // Kita hanya targetkan endpoint login/auth agar tidak mengganggu endpoint lain
  // (misal GET /api/users?email=... buat fitur search tetap aman)
  const isAuthEndpoint = path.startsWith("/login") || path.startsWith("/api/auth");
  const hasSensitiveParams = searchParams.has("email") || searchParams.has("password");

  if (req.method === "GET" && isAuthEndpoint && hasSensitiveParams) {
    // Kembalikan error 400 Bad Request, putus koneksi saat itu juga!
    return NextResponse.json(
      { 
        success: false, 
        message: "Security Violation: Pengiriman email dan password dilarang menggunakan metode GET." 
      },
      { status: 400 }
    );
  }

  // ==========================================
  // 🔐 DELEGASI KE NEXTAUTH UNTUK ROUTE TERLINDUNGI
  // ==========================================
  const isProtectedRoute = 
    path.startsWith("/admin") || 
    path.startsWith("/security") || 
    path.startsWith("/warga");
  
  if (isProtectedRoute) {
    // Kita panggil withAuth dengan teknik 'as any' karena perbedaan tipe data Next.js
    return (authMiddleware as any)(req, event);
  }

  // Jika bukan halaman auth yang melanggar, dan bukan halaman protected, biarkan lewat
  return NextResponse.next();
}

// 3. Konfigurasi Matcher
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (icon)
     * Ini memastikan middleware kita berjalan untuk /login dan /api/auth juga!
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
};