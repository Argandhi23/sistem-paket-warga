import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import SubmitWargaButton from '@/components/admin/SubmitWargaButton';

export default function TambahWargaPage() {
  async function simpanUserWarga(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string; // Idealnya ini di-hash, tapi untuk sekarang kita simpan biasa dulu

    // Simpan ke tabel USER, bukan tabel Warga!
    await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'WARGA', // Otomatis jadikan role WARGA
      },
    });

    redirect('/admin/warga');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">📦 PaketWarga</h2>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="block p-3 text-gray-600 hover:bg-gray-50 rounded-lg">🏠 Dashboard Admin</Link>
          <Link href="/admin/warga" className="block p-3 bg-blue-50 text-blue-700 font-medium rounded-lg">👥 Data Warga</Link>
          <Link href="/admin/paket" className="block p-3 text-gray-600 hover:bg-gray-50 rounded-lg">📬 Paket Masuk</Link>
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-6 md:p-8">
        <header className="mb-6 md:mb-8 space-y-3">
          <Link
            href="/admin/warga"
            className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            &larr; Kembali ke Data Warga
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Tambah Akun Warga Baru</h1>
            <p className="text-sm text-gray-600">
              Isi data akun warga agar pengguna dapat login dan terhubung dengan proses pencatatan paket.
            </p>
          </div>
        </header>

        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <form action={simpanUserWarga} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                name="name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Untuk Login)</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Contoh: budi@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password Sementara</label>
              <input
                id="password"
                type="text"
                name="password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Contoh: warga123"
              />
              <p className="text-xs text-gray-500">
                Berikan kata sandi awal yang mudah dikomunikasikan, lalu minta warga menggantinya setelah login pertama.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin/warga"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                Batal
              </Link>
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <SubmitWargaButton defaultLabel="Buat Akun Warga" pendingLabel="Menyimpan..." />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
