import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import PackageManagementTable from '@/components/admin/PackageManagementTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import PackageFilter from '@/components/shell/PackageFilter';
import { Filter } from 'lucide-react';
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
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
              Daftar Paket Perumahan
            </h1>
            <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
              Pantau, audit, dan kelola seluruh riwayat distribusi paket.
            </p>
          </div>

          <Link href={`/${session?.user?.role?.toLowerCase()}/paket/tambah`}>
            <Button className="w-full lg:w-auto">+ Input Paket Baru</Button>
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex rounded-full bg-bg-sidebar p-1 shadow-sm">
            <Link
              href={statusLink('SEMUA', activeSort)}
              className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeStatus === 'SEMUA' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
              }`}
            >
              Semua
            </Link>
            <Link
              href={statusLink('RECEIVED_BY_SECURITY', activeSort)}
              className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeStatus === 'RECEIVED_BY_SECURITY' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
              }`}
            >
              Menunggu Pengambilan
            </Link>
            <Link
              href={statusLink('DELIVERED_TO_WARGA', activeSort)}
              className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeStatus === 'DELIVERED_TO_WARGA' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
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
                  ? 'text-primary border-primary bg-bg-card shadow-soft' 
                  : 'bg-bg-card text-text-muted border-border-light hover:text-primary'
              }`}
              title="Toggle Advanced Filter"
            >
              <Filter size={18} />
            </Link>
          </div>
        </div>

        {isFilterVisible && <PackageFilter baseUrl="/admin/paket" />}

        <PackageManagementTable rows={daftarPaket as any} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="p-4 border-primary-light bg-primary-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-primary-dark md:text-xl">Otomatisasi</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Input paket akan otomatis memicu notifikasi push ke aplikasi warga.</p>
          </Card>
          <Card className="p-4 border-secondary-light bg-secondary-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-secondary-dark md:text-xl">Audit Satpam</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Setiap paket tercatat beserta nama satpam yang bertugas saat itu.</p>
          </Card>
          <Card className="p-4 border-danger-border bg-danger-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-danger md:text-xl">Kebijakan Simpan</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Paket yang tidak diambil dalam 7 hari akan masuk kategori 'Overdue'.</p>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
