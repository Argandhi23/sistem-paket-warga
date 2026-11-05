import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PackageService } from '@/services/package.service';
import Link from 'next/link';
import { Box, CheckCircle2, Clock, Home, ArrowRight } from 'lucide-react';

export default async function WargaDashboard() {
  const session = await getServerSession(authOptions);
  const unitNumber = session?.user?.unitNumber ?? null;

  const stats = unitNumber
    ? await PackageService.getPackageStats({ role: 'WARGA', unitNumber })
    : { total: 0, pickedUp: 0, pending: 0, totalPenalty: 0 };

  return (
    <AppShell active="dashboard">
      <section className="rounded-2xl border border-border-light bg-bg-header p-4 md:p-8 shadow-soft">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Ringkasan Akun Warga</p>
            <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
              Halo, {session?.user?.name || 'Warga'}!
            </h1>
            <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
              Selamat datang di portal layanan paket digital perumahan Anda.
            </p>
          </div>
          <Link href="/warga/paket">
            <Button className="gap-2 rounded-xl px-5 py-3 shadow-md">
              Lihat Paket Saya <ArrowRight size={16} />
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 border-primary-light bg-bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Unit Hunian</h3>
              <Home size={18} className="text-primary/60" />
            </div>
            <p className="mt-2 text-3xl font-black text-text-main">{unitNumber || 'Belum Tertaut'}</p>
            <p className="mt-1 text-xs text-text-muted">Terhubung dengan pos keamanan</p>
          </Card>

          <Card className="p-5 border-secondary/30 bg-bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-dark">Menunggu Diambil</h3>
              <Clock size={18} className="text-secondary-dark/70" />
            </div>
            <p className="mt-2 text-3xl font-black text-secondary-dark">{stats.pending}</p>
            <p className="mt-1 text-xs text-text-muted">Paket siap diambil di pos satpam</p>
          </Card>

          <Card className="p-5 border-emerald-200 bg-bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sudah Diambil</h3>
              <CheckCircle2 size={18} className="text-emerald-600/70" />
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-700">{stats.pickedUp}</p>
            <p className="mt-1 text-xs text-text-muted">Total paket telah diserahterimakan</p>
          </Card>

          <Card className="p-5 border-border-light bg-bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Kiriman</h3>
              <Box size={18} className="text-text-muted/70" />
            </div>
            <p className="mt-2 text-3xl font-black text-text-main">{stats.total}</p>
            <p className="mt-1 text-xs text-text-muted">Riwayat seluruh paket unit Anda</p>
          </Card>
        </div>

        <Card className="mt-6 border-border-light bg-bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-text-main">Informasi Pengambilan Paket</p>
            <p className="text-sm text-text-muted mt-1">
              Penyimpanan paket gratis selama 3 hari pertama di Pos Satpam. Mulai hari ke-4 berlaku biaya penitipan Rp 2.000/hari.
            </p>
          </div>
          <Link href="/warga/riwayat" className="shrink-0">
            <Button variant="outline" size="sm">
              Cek Riwayat Pengambilan
            </Button>
          </Link>
        </Card>
      </section>
    </AppShell>
  );
}
