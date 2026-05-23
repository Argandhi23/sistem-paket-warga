import AppShell from '@/components/shell/AppShell';
import PackageManifestTable from '@/components/admin/PackageManifestTable';
import { Card } from '@/components/ui/Card';
import { LayoutDashboard, PackageCheck, History, Search, Filter, PackagePlus, ChevronRight, CheckCircle2, Clock, CreditCard, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { serverApiFetch } from '@/lib/api-client';

export default async function SecurityDashboard() {
  // 1. UI memanggil API (via serverApiFetch helper)
  const packagesRes = await serverApiFetch('/api/packages?limit=50');
  const initialPackages = packagesRes.data || [];

  const statsRes = await serverApiFetch('/api/packages/stats');
  const stats = statsRes.data || { total: 0, pickedUp: 0, pending: 0, totalPenalty: 0 };

  return (
    <AppShell active="dashboard">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
              <span>Logistik Perumahan</span>
              <ChevronRight size={12} />
              <span className="text-primary">Dashboard Utama</span>
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Monitor Manifest</h1>
            <p className="text-sm text-text-muted mt-1">Pantau paket masuk dan status pengambilan secara real-time dari pos satpam.</p>
          </div>
          <Link href="/security/paket/tambah">
             <Button className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20 gap-2">
               <PackagePlus size={18} />
               + Registrasi Paket
             </Button>
          </Link>
        </div>

        {/* Stats Grid - Premium Style */}
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
            <p className="text-3xl font-black text-primary">Rp {(stats.totalPenalty || 0).toLocaleString('id-ID')}</p>
          </Card>
        </div>

        {/* Real-time Section */}
        <Card className="border-border-light shadow-card overflow-hidden">
          <div className="p-4 border-b border-border-light bg-bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-1 group max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Cari berdasarkan No. Resi, Rumah, atau Kurir..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-border-light outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
               />
             </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border-main text-text-muted">
                  <Filter size={16} /> Filter
                </Button>
             </div>
          </div>
          <PackageManifestTable initialData={initialPackages} />
        </Card>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
           <div className="p-4 rounded-xl border border-border-light bg-white/50 flex items-start gap-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                 <PackageCheck size={16} className="text-primary" />
              </div>
              <div>
                 <p className="text-xs font-bold text-text-main uppercase tracking-widest mb-1">Cek Identitas</p>
                 <p className="text-[11px] text-text-muted leading-relaxed">Selalu verifikasi kartu identitas warga sebelum menyerahkan paket.</p>
              </div>
           </div>
           <div className="p-4 rounded-xl border border-border-light bg-white/50 flex items-start gap-3">
              <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                 <Clock size={16} className="text-secondary-dark" />
              </div>
              <div>
                 <p className="text-xs font-bold text-text-main uppercase tracking-widest mb-1">Audit Denda</p>
                 <p className="text-[11px] text-text-muted leading-relaxed">Sistem otomatis menghitung denda Rp 2.000/hari mulai hari ke-4.</p>
              </div>
           </div>
           <div className="p-4 rounded-xl border border-border-light bg-white/50 flex items-start gap-3">
              <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                 <PackagePlus size={16} className="text-emerald-700" />
              </div>
              <div>
                 <p className="text-xs font-bold text-text-main uppercase tracking-widest mb-1">Input Akurat</p>
                 <p className="text-[11px] text-text-muted leading-relaxed">Pastikan nomor unit rumah sesuai dengan label pada paket fisik.</p>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
