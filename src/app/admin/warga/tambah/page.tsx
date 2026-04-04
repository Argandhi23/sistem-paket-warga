import { X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import SubmitWargaButton from '@/components/admin/SubmitWargaButton';
import { requireAdminSession } from '@/lib/require-admin-session';

export default async function TambahWargaPage() {
  await requireAdminSession();

  async function simpanUserWarga(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'WARGA',
      },
    });

    redirect('/admin/warga');
  }

  return (
    <div className="min-h-screen bg-[#dce6f2] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar active="warga" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AdminTopbar title="Budi Santoso" />

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

              <form action={simpanUserWarga} className="space-y-5 p-4 md:p-6">
                <div>
                  <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
                    placeholder="Masukkan nama lengkap..."
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
                    placeholder="contoh@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
                    Password Sementara
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
                    placeholder="Buat password awal"
                  />
                  <p className="mt-2 text-sm text-[#778ea9]">
                    Password ini bersifat sementara. Sarankan pengguna menggantinya setelah login pertama.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#e3ebf5] pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <Link
                    href="/admin/warga"
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[0.95rem] font-semibold text-[#516a86] transition hover:bg-[#edf3fb]"
                  >
                    Batal
                  </Link>
                  <div className="w-full sm:w-auto sm:min-w-[230px]">
                    <SubmitWargaButton defaultLabel="Simpan Data User" pendingLabel="Menyimpan..." />
                  </div>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
