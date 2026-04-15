import AppSidebar from '@/components/shell/AppSidebar';
import AppTopbar from '@/components/shell/AppTopbar';
import { shellConfigs } from '@/components/shell/nav-config';
import PackageManifestTable from '@/components/admin/PackageManifestTable';
import prisma from '@/lib/prisma';
// import { requireSecuritySession } from '@/lib/require-session'; // Sesuaikan dengan fungsi auth kamu

export default async function SecurityDashboard() {
  // Pastikan ada proteksi sesi untuk Satpam di sini
  // await requireSecuritySession();

  // Ambil konfigurasi shell untuk Satpam
  // Pastikan kamu punya konfigurasi SECURITY di nav-config.ts
  const shellConfig = shellConfigs.SECURITY || shellConfigs.ADMIN; 

  // Fetch initial data menggunakan Prisma (Server-side)
  // Kita ambil 50 data terbaru agar halaman langsung terisi saat pertama dibuka
  const initialPackages = await prisma.package.findMany({
    orderBy: {
      receivedAt: 'desc',
    },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar config={shellConfig} active="dashboard" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AppTopbar config={shellConfig} title="Dashboard Keamanan" />

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Live Monitor</p>
                <h1 className="mt-1 text-[1.5rem] font-bold tracking-tight text-slate-800 md:text-[2rem]">
                  Manifest Paket Warga
                </h1>
                <p className="mt-1 text-[0.95rem] text-slate-500">
                  Pantau paket masuk dan status pengambilan secara real-time.
                </p>
              </div>
            </header>

            {/* Render komponen Realtime Table di sini, passing initial data dari Prisma */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50">
              <PackageManifestTable initialData={initialPackages} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}