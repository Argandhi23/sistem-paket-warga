import AppShell from '@/components/shell/AppShell';
import PackageManagementTable from '@/components/admin/PackageManagementTable';
import Link from 'next/link';
import { serverApiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { ChevronRight, PackagePlus } from 'lucide-react';

export default async function SecurityPaketListPage() {
  // 1. Fetch data paket via API (Layered Architecture)
  const { data: initialPackages = [] } = await serverApiFetch('/api/packages');

  return (
    <AppShell active="paket">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border-light bg-white p-4 md:p-8 shadow-soft relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <header className="relative z-10 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
                <span>Logistik Perumahan</span>
                <ChevronRight size={12} />
                <span className="text-primary">Daftar Paket</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-text-main md:text-4xl">
                Daftar Paket Masuk
              </h1>
              <p className="mt-2 text-sm text-text-muted max-w-lg">
                Kelola dan pantau seluruh paket yang diterima di pos keamanan perumahan secara real-time.
              </p>
            </div>

            <Link href="/security/paket/tambah">
              <Button variant="secondary" className="rounded-xl px-8 py-4 shadow-lg shadow-secondary/20 gap-2 text-base">
                 <PackagePlus size={20} />
                 Registrasi Paket Baru
               </Button>
            </Link>
          </header>

          <div className="rounded-2xl bg-white shadow-card border border-border-light overflow-hidden relative z-10">
            <PackageManagementTable rows={initialPackages} />
          </div>
        </section>

        {/* Floating Action Button for mobile/quick access as seen in mockup */}
        <div className="fixed bottom-8 right-8 z-40 md:hidden">
          <Link href="/security/paket/tambah">
            <button className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
              <PackagePlus size={24} />
            </button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
