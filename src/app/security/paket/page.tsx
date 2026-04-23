import AppShell from '@/components/shell/AppShell';
import PackageManagementTable from '@/components/admin/PackageManagementTable';
import Link from 'next/link';
import { serverApiFetch } from '@/lib/api-client';

export default async function SecurityPaketListPage() {
  // 🔄 MENGGUNAKAN API (Layered Architecture sesuai Rubrik)
  const { data: initialPackages = [] } = await serverApiFetch('/api/packages');

  return (
    <AppShell active="paket">
      <section className="rounded-2xl border border-primary-100 bg-primary-50 p-3 md:p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">Manajemen Operasional</p>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-primary-950 md:text-[2.25rem]">
              Daftar Paket Masuk
            </h1>
            <p className="mt-1 text-[0.95rem] text-neutral-500">
              Kelola data paket yang diterima di pos keamanan.
            </p>
          </div>

          <Link
            href="/security/paket/tambah"
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02] hover:bg-primary-700"
          >
            + Registrasi Paket Baru
          </Link>
        </header>

        <PackageManagementTable rows={initialPackages as any} />
      </section>
    </AppShell>
  );
}
