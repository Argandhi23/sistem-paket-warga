import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
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
      // Halaman di bawah "matcher" hanya bisa diakses kalau fungsi ini mengembalikan true (punya token)
      authorized: ({ token }) => !!token,
    },
  }
);

// Tentukan rute mana saja yang HARUS login untuk bisa diakses
export const config = {
  matcher: [
    "/admin/:path*", 
    "/security/:path*", 
    "/warga/:path*"
  ]
};