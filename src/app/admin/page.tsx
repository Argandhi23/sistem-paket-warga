import { Home, Package, ShieldCheck, Users, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { requireAdminSession } from '@/lib/require-admin-session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminDashboard() {
  await requireAdminSession();
  const session = await getServerSession(authOptions);

  return (
    <AppShell active="dashboard">
      <div className="flex flex-col gap-8 pb-8">
        {/* Premium Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 shadow-2xl sm:px-12 sm:py-16">
          {/* Decorative Grid & Glows */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-6 border border-white/20 backdrop-blur-md shadow-sm">
                <ShieldCheck className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-white">Admin Portal</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl leading-tight">
                Selamat Datang,<br className="hidden sm:block" /> {session?.user?.name || 'Super Admin'}
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-blue-100/90 md:text-base max-w-xl">
                Gunakan menu Data Pengguna untuk menambah akun warga baru, lalu lanjutkan dengan Log Paket untuk pencatatan paket harian. Dashboard ini dirancang agar proses operasional lebih cepat dipantau dari satu layar.
              </p>
            </div>
            
            {/* Hero Graphic Element */}
            <div className="hidden lg:flex relative items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-50"></div>
              <Activity className="h-20 w-20 text-secondary opacity-90 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Ringkasan Sistem
            </h2>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat Card 1: Data Warga */}
            <Card className="relative overflow-hidden p-6 border-0 shadow-lg bg-bg-card group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl rounded-2xl">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/10 shadow-sm">
                  <Users size={26} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Data Warga</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-text-main tracking-tight">128</p>
                  <TrendingUp className="h-4 w-4 text-success" strokeWidth={3} />
                </div>
                <p className="mt-1 text-xs font-medium text-text-muted/80">Akun aktif terdaftar</p>
              </div>
            </Card>

            {/* Stat Card 2: Paket Masuk */}
            <Card className="relative overflow-hidden p-6 border-0 shadow-lg bg-bg-card group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl rounded-2xl">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-secondary/10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-dark border border-secondary/20 shadow-sm">
                  <Package size={26} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Paket Masuk</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-text-main tracking-tight">24</p>
                </div>
                <p className="mt-1 text-xs font-medium text-text-muted/80">Belum diambil hari ini</p>
              </div>
            </Card>

            {/* Stat Card 3: Unit Terpetakan */}
            <Card className="relative overflow-hidden p-6 border-0 shadow-lg bg-bg-card group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl rounded-2xl">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-success/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success border border-success/10 shadow-sm">
                  <Home size={26} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Unit Terpetakan</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-text-main tracking-tight">87%</p>
                </div>
                <p className="mt-1 text-xs font-medium text-text-muted/80">Sinkron dengan data rumah</p>
              </div>
            </Card>

            {/* Stat Card 4: Audit */}
            <Card className="relative overflow-hidden p-6 border-0 shadow-lg bg-bg-card group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl rounded-2xl">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-danger/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-light text-danger border border-danger/10 shadow-sm">
                  <ShieldCheck size={26} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Audit Sistem</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-text-main tracking-tight">Baik</p>
                </div>
                <p className="mt-1 text-xs font-medium text-text-muted/80">Tidak ada anomali akses</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
