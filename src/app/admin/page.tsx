import { Home, Package, ShieldCheck, Users } from 'lucide-react';
import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { requireAdminSession } from '@/lib/require-admin-session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminDashboard() {
  await requireAdminSession();
  const session = await getServerSession(authOptions);

  return (
    <AppShell active="dashboard">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Dashboard</p>
            <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
              Ringkasan Admin
            </h1>
            <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
              Kelola data warga, pantau aktivitas paket, dan jaga konsistensi operasional harian.
            </p>
          </div>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4 border-primary-light bg-primary-light/30">
            <div className="flex items-center gap-2 text-primary-dark">
              <Users size={18} />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Data Warga</p>
            </div>
            <p className="mt-2 text-[1.75rem] font-bold text-text-main md:text-[2rem]">128</p>
            <p className="text-sm text-text-muted">Akun aktif terdaftar</p>
          </Card>

          <Card className="p-4 border-secondary-light bg-secondary-light/30">
            <div className="flex items-center gap-2 text-secondary-dark">
              <Package size={18} />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Paket Masuk</p>
            </div>
            <p className="mt-2 text-[1.75rem] font-bold text-secondary-dark md:text-[2rem]">24</p>
            <p className="text-sm text-text-muted">Belum diambil hari ini</p>
          </Card>

          <Card className="p-4 border-[#cfdbc3] bg-[#e3ecd8]/50">
            <div className="flex items-center gap-2 text-[#4d7a37]">
              <Home size={18} />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Unit Terpetakan</p>
            </div>
            <p className="mt-2 text-[1.75rem] font-bold text-[#2e4f28] md:text-[2rem]">87%</p>
            <p className="text-sm text-text-muted">Sinkron dengan data rumah</p>
          </Card>

          <Card className="p-4 border-danger-border bg-danger-light/50">
            <div className="flex items-center gap-2 text-danger">
              <ShieldCheck size={18} />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Audit</p>
            </div>
            <p className="mt-2 text-[1.75rem] font-bold text-danger md:text-[2rem]">Baik</p>
            <p className="text-sm text-text-muted">Tidak ada anomali akses</p>
          </Card>
        </div>

        <Card className="mt-4 border-border-light bg-bg-card/80 p-4 md:p-6">
          <h2 className="text-xl font-bold text-text-main md:text-2xl">Selamat Datang, {session?.user?.name || 'Super Admin'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-body md:text-base">
            Gunakan menu Data Pengguna untuk menambah akun warga baru, lalu lanjutkan dengan Log Paket untuk
            pencatatan paket harian. Dashboard ini dirancang agar proses operasional lebih cepat dipantau dari satu
            layar.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
