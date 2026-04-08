import { X } from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/shell/AppSidebar';
import AppTopbar from '@/components/shell/AppTopbar';
import TambahWargaForm from '@/components/admin/TambahWargaForm';
import { requireAdminSession } from '@/lib/require-admin-session';
import { shellConfigs } from '@/components/shell/nav-config';

export default async function TambahWargaPage() {
  await requireAdminSession();

  const shellConfig = shellConfigs.ADMIN;

  return (
    <div className="min-h-screen bg-[#dce6f2] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar config={shellConfig} active="warga" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AppTopbar config={shellConfig} title="Budi Santoso" />

          <section className="mt-4 rounded-2xl border border-blue-100 bg-[#eaf1f9] p-3 md:p-6">
            <div className="mx-auto max-w-3xl rounded-3xl border border-[#cedbeb] bg-white shadow-lg shadow-[#bfd0e5]/40">
              <header className="flex items-start justify-between gap-3 border-b border-[#e3ebf5] px-4 py-4 md:px-6">
                <div>
                  <h1 className="text-[1.55rem] font-bold text-[#1f324b] md:text-[1.9rem]">Tambah Pengguna Baru</h1>
                  <p className="mt-1 text-[0.92rem] text-[#6f84a0] md:text-[0.98rem]">Isi data warga untuk menambahkan akun baru ke sistem.</p>
                </div>
                <Link
                  href="/admin/warga"
                  className="rounded-full p-2 text-[#6f84a0] transition hover:bg-[#edf3fb] hover:text-[#2f4f7d]"
                  aria-label="Tutup form tambah pengguna"
                >
                  <X size={20} />
                </Link>
              </header>

              <TambahWargaForm />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
