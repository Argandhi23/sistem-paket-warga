import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import PackageManagementTable, { PackageItem } from '@/components/admin/PackageManagementTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import PackageFilter from '@/components/shell/PackageFilter';
import { Filter, PackageCheck, Search, ChevronRight, Box, Clock, CreditCard, History, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculatePenalty } from '@/utils/penalty';

type PaketPageProps = {
  searchParams?: Promise<{ 
    status?: string; 
    sort?: string; 
    courier?: string; 
    startDate?: string; 
    endDate?: string;
    showFilter?: string;
    unit?: string;
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

type StatusTab = 'SEMUA' | 'RECEIVED_BY_SECURITY' | 'DELIVERED_TO_WARGA';

export default async function AdminPaketPage({ searchParams }: PaketPageProps) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const activeStatus = normalizeStatus(params?.status);
  const activeSort = normalizeSort(params?.sort);
  
  const courierFilter = params.courier || '';
  const startFilter = params.startDate || '';
  const endFilter = params.endDate || '';
  const unitFilter = params.unit || '';
  const isFilterVisible = params.showFilter === 'true' || !!(courierFilter || startFilter || endFilter || unitFilter);

  const query = new URLSearchParams({
    status: activeStatus,
    sort: activeSort,
    ...(courierFilter && { courier: courierFilter }),
    ...(startFilter && { startDate: startFilter }),
    ...(endFilter && { endDate: endFilter }),
    ...(unitFilter && { unit: unitFilter }),
  }).toString();

  // 1. Fetch data paket via API
  const res = await serverApiFetch(`/api/packages?${query}`);
  const daftarPaket = (res.data || []) as PackageItem[];
  const error = !res.success ? res.message : null;

  // 2. Fetch stats via API
  const statsRes = await serverApiFetch('/api/packages/stats');
  const stats = statsRes.data || { total: 0, pickedUp: 0, pending: 0, totalPenalty: 0 };
  const totalPenalty = daftarPaket.reduce((sum: number, pkg: { receivedAt?: string | Date; status?: string }) => {
    if (pkg.status !== 'RECEIVED_BY_SECURITY' && pkg.status !== 'DELIVERED_TO_WARGA') {
      return sum;
    }

    return sum + calculatePenalty(pkg.receivedAt || new Date()).amount;
  }, 0);

  return (
    <AppShell active="paket">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
              <span>Daftar Paket</span>
              <ChevronRight size={12} />
              <span className="text-primary">Riwayat Paket</span>
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Riwayat Paket</h1>
            <p className="text-sm text-text-muted mt-1">Kelola dan pantau seluruh data paket yang masuk dan keluar di wilayah perumahan.</p>
          </div>
          <Link href={`/${session?.user?.role?.toLowerCase()}/paket/tambah`}>
             <Button variant="secondary" className="rounded-xl px-6 py-3 shadow-lg shadow-secondary/20 gap-2">
               <PackageCheck size={18} />
               + Paket Baru
             </Button>
          </Link>
        </div>

        {/* Stats Grid - Matching Image 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border-light bg-bg-card relative overflow-hidden group shadow-sm">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Box size={48} className="text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Total Paket</p>
            <p className="text-3xl font-black text-text-main">{stats.total}</p>
          </Card>
          
          <Card className="p-5 border-emerald-100 bg-emerald-50/20 relative overflow-hidden group shadow-sm">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/70 mb-1">Sudah Diambil</p>
            <p className="text-3xl font-black text-emerald-700">{stats.pickedUp}</p>
          </Card>

          <Card className="p-5 border-secondary/20 bg-secondary/5 relative overflow-hidden group shadow-sm">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Clock size={48} className="text-secondary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-dark/70 mb-1">Menunggu</p>
            <p className="text-3xl font-black text-secondary-dark">{stats.pending}</p>
          </Card>

          <Card className="p-5 border-primary/20 bg-primary/5 relative overflow-hidden group shadow-sm">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard size={48} className="text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">Total Denda</p>
            <p className="text-3xl font-black text-primary">Rp {totalPenalty.toLocaleString('id-ID')}</p>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="p-4 border-border-light shadow-sm bg-white">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Cari berdasarkan No. Resi, Rumah, atau Kurir..."
                  className="w-full pl-10 pr-4 py-3 bg-bg-muted/50 rounded-xl border border-border-light outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
               />
            </div>
            <div className="flex items-center gap-2">
               <Link href={`/admin/paket?showFilter=${!isFilterVisible}`}>
                  <Button variant="outline" className={`gap-2 rounded-xl py-3 border-border-main ${isFilterVisible ? 'bg-primary/5 border-primary text-primary' : 'text-text-muted'}`}>
                    <Filter size={18} />
                    Filter
                  </Button>
               </Link>
            </div>
          </div>

          {isFilterVisible && (
            <div className="mt-4 pt-4 border-t border-border-light">
               <PackageFilter baseUrl="/admin/paket" />
            </div>
          )}

          {/* Active Status Tabs */}
          <div className="flex items-center gap-4 mt-4 text-xs font-bold border-t border-border-light pt-4">
             <span className="text-text-muted uppercase tracking-widest mr-2">Status:</span>
             <div className="flex gap-1 bg-bg-muted p-1 rounded-lg">
                {[
                  { key: 'SEMUA', label: 'Semua Status' },
                  { key: 'RECEIVED_BY_SECURITY', label: 'Menunggu Pengambilan' },
                  { key: 'DELIVERED_TO_WARGA', label: 'Sudah Diambil' }
                ].map((s) => (
                  <Link 
                    key={s.key} 
                    href={statusLink(s.key as StatusTab, activeSort)}
                    className={`px-3 py-1.5 rounded-md transition-all ${activeStatus === s.key ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    {s.label}
                  </Link>
                ))}
             </div>
          </div>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
           <p className="text-xs font-medium text-text-muted">
             Menampilkan <span className="font-bold text-text-main">{daftarPaket.length}</span> data riwayat terbaru
           </p>
           {activeStatus !== 'SEMUA' && (
              <Badge variant="primary" className="gap-2 lowercase bg-primary/5 border border-primary/10 pl-3 pr-1 py-1">
                status: {activeStatus === 'RECEIVED_BY_SECURITY' ? 'menunggu' : 'diambil'}
                <Link href={statusLink('SEMUA', activeSort)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                  <X size={10} />
                </Link>
              </Badge>
           )}
        </div>

        {/* Table / Content */}
        <div className="rounded-2xl bg-bg-card shadow-card border border-border-light overflow-hidden">
          <PackageManagementTable 
            rows={daftarPaket} 
            error={error}
            isLoading={false} 
          />
        </div>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-center gap-2 mt-4">
           <Button variant="outline" size="icon" className="rounded-lg border-border-light text-text-muted disabled:opacity-30" disabled>&lt;</Button>
           <Button size="icon" className="rounded-lg bg-primary text-white font-bold text-xs h-9 w-9 shadow-md">1</Button>
           <Button variant="outline" size="icon" className="rounded-lg border-border-light text-text-muted text-xs h-9 w-9">2</Button>
           <Button variant="outline" size="icon" className="rounded-lg border-border-light text-text-muted text-xs h-9 w-9">3</Button>
           <span className="text-text-muted px-2">...</span>
           <Button variant="outline" size="icon" className="rounded-lg border-border-light text-text-muted text-xs h-9 w-9">43</Button>
           <Button variant="outline" size="icon" className="rounded-lg border-border-light text-text-muted h-9 w-9">&gt;</Button>
        </div>
      </div>
    </AppShell>
  );
}
