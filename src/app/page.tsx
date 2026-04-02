import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";

export default async function HomePage() {
  // 1. Ambil data sesi user yang sedang login
  const session = await getServerSession(authOptions);

  // 2. Jika belum login sama sekali, suruh ke halaman login
  if (!session) {
    redirect("/login"); 
  }

  // 3. Jika sudah login, cek ROLE-nya dan arahkan ke ruangan masing-masing
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  } else if (session.user.role === "SECURITY") {
    redirect("/security");
  } else if (session.user.role === "WARGA") {
    redirect("/warga");
  }

  // Fallback jika rolenya tidak dikenali
  return (
    <div className="p-8 text-center">
      <h1>Role tidak dikenali. Silakan hubungi administrator.</h1>
    </div>
  );
}