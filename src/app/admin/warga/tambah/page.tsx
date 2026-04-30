import { X } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import TambahWargaForm from '@/components/admin/TambahWargaForm';

export default async function TambahWargaPage() {
  return (
    <AppShell active="warga">
      <div className="flex flex-col gap-6 py-4 pb-12">
        <div className="mx-auto w-full max-w-3xl overflow-hidden shadow-2xl rounded-3xl border-0 bg-bg-card">
          {/* Premium Header */}
          <div className="relative overflow-hidden bg-primary px-6 py-8 sm:px-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>
            
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Tambah Pengguna Baru</h1>
                <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-lg">
                  Isi formulir di bawah ini dengan lengkap untuk mendaftarkan akun warga atau satpam baru ke dalam sistem.
                </p>
              </div>
              <Link
                href="/admin/warga"
                className="rounded-full bg-white/10 p-2.5 text-white transition-all hover:bg-white/20 hover:scale-105 backdrop-blur-md shadow-sm shrink-0"
                aria-label="Tutup form tambah pengguna"
              >
                <X size={20} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <TambahWargaForm />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
