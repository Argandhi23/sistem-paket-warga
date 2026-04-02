import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function WargaPage() {
  // Mengambil data dari tabel USER yang role-nya "WARGA"
  // Sekalian kita include data relasi 'rumah' nya!
  const daftarWarga = await prisma.user.findMany({
    where: { role: 'WARGA' },
    include: { rumah: true }, // Menarik data rumah yang ter-link
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Data Akun Warga</h1>
          <Link href="/admin/warga/tambah" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm">
            + Tambah Warga
          </Link>
        </header>

        {/* Tabel Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nama Lengkap</th>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Alamat Rumah</th>
              </tr>
            </thead>
            <tbody>
              {daftarWarga.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    📭 Belum ada akun warga.
                  </td>
                </tr>
              ) : (
                daftarWarga.map((warga) => (
                  <tr key={warga.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-medium">{warga.name || '-'}</td>
                    <td className="p-4 text-gray-600">{warga.email}</td>
                    <td className="p-4 text-gray-600">
                      {/* Jika warga sudah di-link ke rumah, tampilkan. Jika belum, beri peringatan */}
                      {warga.rumah ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {warga.rumah.blok} / No. {warga.rumah.nomor}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          Belum terhubung ke Rumah
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}