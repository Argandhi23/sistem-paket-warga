import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';

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
      <main className="flex-1 p-8">
        <header className="mb-8">
          <Link href="/admin/warga" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">&larr; Kembali ke Data Warga</Link>
          <h1 className="text-3xl font-bold text-gray-800">Tambah Akun Warga Baru</h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
          <form action={simpanUserWarga} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input type="text" name="name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Budi Santoso" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Untuk Login)</label>
              <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: budi@gmail.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Sementara</label>
              <input type="text" name="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: warga123" />
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">Buat Akun Warga</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}