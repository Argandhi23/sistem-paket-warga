import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import PackageManagementTable from '@/components/admin/PackageManagementTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import PackageFilter from '@/components/shell/PackageFilter';
import { Filter, PackageCheck, ShieldCheck, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type PaketPageProps = {
  searchParams?: Promise<{ 
    status?: string; 
    sort?: string; 
    courier?: string; 
    startDate?: string; 
    endDate?: string;
    showFilter?: string;
  }>;
};

function normalizeStatus(status?: string) {
  if (status === 'RECEIVED_BY_SECURITY') return 'RECEIVED_BY_SECURITY';
  if (status === 'DELIVERED_TO_WARGA') return 'DELIVERED_TO_WARGA';
  return 'SEMUA';
}

function normalizeSort(sort?: string) {
  if (sort === 'lama') return 'lama';
  return 'terbaru';
}

function statusLink(status: 'SEMUA' | 'RECEIVED_BY_SECURITY' | 'DELIVERED_TO_WARGA', sort: 'terbaru' | 'lama') {
  if (status === 'SEMUA') return `/admin/paket?sort=${sort}`;
  return `/admin/paket?status=${status}&sort=${sort}`;
}

export default async function AdminPaketPage({ searchParams }: PaketPageProps) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const activeStatus = normalizeStatus(params?.status);
  const activeSort = normalizeSort(params?.sort);
  
  const courierFilter = params.courier || '';
  const startFilter = params.startDate || '';
  const endFilter = params.endDate || '';
  const isFilterVisible = params.showFilter === 'true' || !!(courierFilter || startFilter || endFilter);

  const query = new URLSearchParams({
    status: activeStatus,
    sort: activeSort,
    ...(courierFilter && { courier: courierFilter }),
    ...(startFilter && { startDate: startFilter }),
    ...(endFilter && { endDate: endFilter }),
  }).toString();

  const { data: daftarPaket = [] } = await serverApiFetch(`/api/packages?${query}`);

  return (
    <AppShell active="paket">
      <div className="flex flex-col gap-8 pb-8">
        {/* Premium Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 shadow-2xl sm:px-10 sm:py-12">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Manajemen Paket
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/90 md:text-base">
                Pantau seluruh riwayat logistik masuk dan keluar. Sistem mencatat jejak audit untuk setiap status paket secara otomatis.
              </p>
            </div>
            
            <Link href={`/${session?.user?.role?.toLowerCase()}/paket/tambah`} className="shrink-0">
              <Button className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-dark font-bold border-0 shadow-lg px-6 py-3 rounded-xl transition-all hover:scale-105">
                + Input Paket Baru
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-1">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex rounded-full bg-bg-card p-1 shadow-sm border border-border-light">
              <Link
                href={statusLink('SEMUA', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeStatus === 'SEMUA' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Semua
              </Link>
              <Link
                href={statusLink('RECEIVED_BY_SECURITY', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeStatus === 'RECEIVED_BY_SECURITY' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Menunggu Pengambilan
              </Link>
              <Link
                href={statusLink('DELIVERED_TO_WARGA', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeStatus === 'DELIVERED_TO_WARGA' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Sudah Diambil
              </Link>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Link 
                href={`/admin/paket?showFilter=${!isFilterVisible}`}
                className={`flex items-center justify-center size-10 rounded-full border transition-all ${
                  isFilterVisible 
                    ? 'text-primary border-primary bg-primary/5 shadow-inner' 
                    : 'bg-bg-card text-text-muted border-border-light hover:text-primary hover:bg-bg-sidebar shadow-sm'
                }`}
                title="Toggle Advanced Filter"
              >
                <Filter size={18} />
              </Link>
            </div>
          </div>

          {isFilterVisible && (
            <div className="mb-6 rounded-2xl bg-bg-card shadow-sm border border-border-light p-1">
              <PackageFilter baseUrl="/admin/paket" />
            </div>
          )}

          <div className="rounded-2xl bg-bg-card shadow-md border border-border-light overflow-hidden">
            <PackageManagementTable rows={daftarPaket as any} />
          </div>

          {/* Premium Info Cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <PackageCheck className="h-8 w-8 text-primary mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Otomatisasi</p>
                  <p className="mt-2 text-sm text-text-muted">Input paket otomatis memicu notifikasi push ke perangkat warga.</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-secondary/10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <ShieldCheck className="h-8 w-8 text-secondary-dark mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary-dark">Audit Sistem</p>
                  <p className="mt-2 text-sm text-text-muted">Setiap paket tercatat beserta nama satpam yang bertugas saat itu.</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-danger/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <TimerReset className="h-8 w-8 text-danger mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-danger">Kebijakan Simpan</p>
                  <p className="mt-2 text-sm text-text-muted">Paket yang tidak diambil lebih dari 7 hari ditandai 'Overdue'.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
