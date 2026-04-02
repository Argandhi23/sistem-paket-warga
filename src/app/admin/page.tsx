'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- Sidebar Kiri --- */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">📦 PaketWarga</h2>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="block p-3 bg-blue-50 text-blue-700 font-medium rounded-lg">
            🏠 Dashboard Admin
          </Link>
          <Link href="/admin/warga" className="block p-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            👥 Data Warga
          </Link>
          <Link href="/admin/paket" className="block p-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            📬 Paket Masuk
          </Link>
        </nav>
      </aside>

      {/* --- Konten Utama Kanan --- */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-5 py-2.5 rounded-lg border border-red-200 transition-colors"
          >
            Keluar (Logout)
          </button>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Selamat Datang, Super Admin! 👋
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Database sudah berhasil terhubung. Saat ini aplikasi siap dikembangkan. 
            Mulai dengan menambahkan data warga agar sistem dapat mengenali penerima paket, 
            lalu gunakan menu Paket Masuk untuk mencatat setiap barang yang dititipkan oleh kurir.
          </p>
        </div>
      </main>
    </div>
  );
}