import { Home, Package, ShieldCheck, Users } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import LogoutButton from '@/components/admin/LogoutButton';
import { requireAdminSession } from '@/lib/require-admin-session';

export default async function AdminDashboard() {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-[#dce6f2] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar active="dashboard" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AdminTopbar title="Budi Santoso" />

          <section className="mt-4 rounded-2xl border border-blue-100 bg-[#eaf1f9] p-3 md:p-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f84a0]">Dashboard</p>
                <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[#16293f] md:text-[2.25rem]">
                  Ringkasan Admin
                </h1>
                <p className="mt-1 text-[0.95rem] text-[#637995] md:text-[1.05rem]">
                  Kelola data warga, pantau aktivitas paket, dan jaga konsistensi operasional harian.
                </p>
              </div>

              <LogoutButton />
            </header>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#c8d8ea] bg-[#d8e4f2] p-4">
                <div className="flex items-center gap-2 text-[#2f5e9f]">
                  <Users size={18} />
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">Data Warga</p>
                </div>
                <p className="mt-2 text-[1.75rem] font-bold text-[#223a58] md:text-[2rem]">128</p>
                <p className="text-sm text-[#5c7390]">Akun aktif terdaftar</p>
              </article>

              <article className="rounded-2xl border border-[#d8d0c0] bg-[#e9e1d4] p-4">
                <div className="flex items-center gap-2 text-[#8f5e12]">
                  <Package size={18} />
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">Paket Masuk</p>
                </div>
                <p className="mt-2 text-[1.75rem] font-bold text-[#4f4026] md:text-[2rem]">24</p>
                <p className="text-sm text-[#6f6554]">Belum diambil hari ini</p>
              </article>

              <article className="rounded-2xl border border-[#cfdbc3] bg-[#e3ecd8] p-4">
                <div className="flex items-center gap-2 text-[#4d7a37]">
                  <Home size={18} />
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">Unit Terpetakan</p>
                </div>
                <p className="mt-2 text-[1.75rem] font-bold text-[#2e4f28] md:text-[2rem]">87%</p>
                <p className="text-sm text-[#597257]">Sinkron dengan data rumah</p>
              </article>

              <article className="rounded-2xl border border-[#decfd2] bg-[#efe2e4] p-4">
                <div className="flex items-center gap-2 text-[#a23b33]">
                  <ShieldCheck size={18} />
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">Audit</p>
                </div>
                <p className="mt-2 text-[1.75rem] font-bold text-[#5e2f2a] md:text-[2rem]">Baik</p>
                <p className="text-sm text-[#786469]">Tidak ada anomali akses</p>
              </article>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d3deec] bg-[#edf3fa] p-4 md:p-6">
              <h2 className="text-xl font-bold text-[#1f324b] md:text-2xl">Selamat Datang, Super Admin</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5a7290] md:text-base">
                Gunakan menu Data Pengguna untuk menambah akun warga baru, lalu lanjutkan dengan Log Paket untuk
                pencatatan paket harian. Dashboard ini dirancang agar proses operasional lebih cepat dipantau dari satu
                layar.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
