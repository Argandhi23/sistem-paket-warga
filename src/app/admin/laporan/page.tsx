import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import { 
  TrendChart, 
  BlockChart, 
  StatusPieChart, 
  PenaltyChart 
} from '@/components/admin/AnalyticsCharts';
import { 
  Box, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { calculatePenalty } from '@/utils/penalty';

export default async function AdminLaporanPage() {
  const session = await getServerSession(authOptions);

  const packagesRes = await serverApiFetch('/api/packages?sort=terbaru');
  const allPackages = packagesRes.data || [];

  const totalPenalty = allPackages.reduce((sum: number, pkg: { receivedAt?: string | Date; status?: string }) => {
    if (pkg.status !== 'RECEIVED_BY_SECURITY' && pkg.status !== 'DELIVERED_TO_WARGA') {
      return sum;
    }

    return sum + calculatePenalty(pkg.receivedAt || new Date()).amount;
  }, 0);

  // Fetch analytics data from our new API
  const analyticsRes = await serverApiFetch('/api/packages/analytics?days=30');
  const analytics = analyticsRes.data || {
    dailyVolume: [],
    distributionByBlock: [],
    statusStats: [],
    penaltyHistory: []
  };

  // Fetch basic stats for top cards
  const statsRes = await serverApiFetch('/api/packages/stats');
  const stats = statsRes.data || { total: 0, pickedUp: 0, pending: 0, totalPenalty: 0, expired: 0 };

  return (
    <AppShell active="laporan">
      <div className="flex flex-col gap-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Analitik & Laporan</h1>
            <p className="text-sm text-text-muted mt-1">Pantau performa distribusi dan volume paket secara mendalam.</p>
          </div>
        </div>

        {/* Top Stats Cards - Matching Image 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border-light bg-bg-card shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                  <Box size={20} />
               </div>
               <Badge variant="primary" className="bg-emerald-50 text-emerald-600 border-none flex items-center gap-1">
                  <TrendingUp size={10} /> 12%
               </Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Total Paket Masuk</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-text-main">{stats.total}</p>
               <span className="text-[10px] text-text-muted font-bold">Bulan ini</span>
            </div>
          </Card>
          
          <Card className="p-5 border-border-light bg-bg-card shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
               <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary-dark border border-secondary/10">
                  <Clock size={20} />
               </div>
               <Badge variant="primary" className="bg-amber-50 text-amber-600 border-none flex items-center gap-1">
                  <TrendingDown size={10} /> 3
               </Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Menunggu Pengambilan</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-text-main">{stats.pending}</p>
               <span className="text-[10px] text-text-muted font-bold">Belum diambil</span>
            </div>
          </Card>

          <Card className="p-5 border-border-light bg-bg-card shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
               <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <CreditCard size={20} />
               </div>
               <Badge variant="primary" className="bg-emerald-50 text-emerald-600 border-none flex items-center gap-1">
                  <ArrowUpRight size={10} /> Rp 12rb
               </Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Total Denda Terkumpul</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-text-main">Rp {totalPenalty.toLocaleString('id-ID')}</p>
               <span className="text-[10px] text-text-muted font-bold">Bulan ini</span>
            </div>
          </Card>

          <Card className="p-5 border-border-light bg-bg-card shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
               <div className="size-10 rounded-xl bg-danger-light flex items-center justify-center text-danger border border-danger/10">
                  <AlertCircle size={20} />
               </div>
               <Link href="/admin/paket?status=RECEIVED_BY_SECURITY" className="text-[10px] font-black text-primary hover:underline flex items-center gap-0.5">
                  Lihat semua <ArrowUpRight size={10} />
               </Link>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Paket Overdue</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-danger">{stats.expired}</p>
               <span className="text-[10px] text-text-muted font-bold">Perlu perhatian</span>
            </div>
          </Card>
        </div>

        {/* Main Chart - Tren Paket Masuk */}
        <Card className="p-6 border-border-light shadow-soft bg-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-text-main tracking-tight">Tren Paket Masuk</h2>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" /> Entry
               </div>
               <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-secondary" /> Pickup
               </div>
            </div>
          </div>
          <TrendChart data={analytics.dailyVolume} />
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribusi per Blok */}
          <Card className="p-6 border-border-light shadow-sm bg-white">
            <h2 className="text-lg font-black text-text-main tracking-tight mb-6 uppercase tracking-widest text-sm">Distribusi Paket per Blok</h2>
            <BlockChart data={analytics.distributionByBlock} />
          </Card>

          {/* Status Pie Chart */}
          <Card className="p-6 border-border-light shadow-sm bg-white">
            <h2 className="text-lg font-black text-text-main tracking-tight mb-6 uppercase tracking-widest text-sm">Status Paket Saat Ini</h2>
            <StatusPieChart data={analytics.statusStats} />
          </Card>

          {/* Riwayat Denda */}
          <Card className="p-6 border-border-light shadow-sm bg-white">
            <h2 className="text-lg font-black text-text-main tracking-tight mb-6 uppercase tracking-widest text-sm">Riwayat Denda per Bulan</h2>
            <PenaltyChart data={analytics.penaltyHistory} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
