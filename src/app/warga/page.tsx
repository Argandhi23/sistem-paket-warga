import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function WargaDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <AppShell active="dashboard">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Ringkasan Akun</p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
            Halo, {session?.user?.name || 'Warga'}!
          </h1>
          <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
            Selamat datang di portal layanan paket digital perumahan Anda.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5 border-primary-light bg-bg-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Status Paket</h3>
            <p className="mt-2 text-3xl font-black text-text-main">Aktif</p>
            <p className="mt-1 text-sm text-text-muted">Sistem siap menerima kiriman</p>
          </Card>
          
          <Card className="p-5 border-secondary-light bg-bg-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-dark">Unit Rumah</h3>
            <p className="mt-2 text-3xl font-black text-text-main">{session?.user?.role === 'WARGA' ? 'Terdaftar' : '-'}</p>
            <p className="mt-1 text-sm text-text-muted">Terhubung dengan sistem keamanan</p>
          </Card>
        </div>

        <Card className="mt-6 border-border-light bg-bg-card/50 p-6 italic text-text-muted text-center">
          Silakan cek menu "Paket Saya" untuk melihat daftar paket yang sudah tiba di pos satpam.
        </Card>
      </section>
    </AppShell>
  );
}