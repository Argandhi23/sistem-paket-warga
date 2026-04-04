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

  const totalWarga = daftarWarga.length;

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
      <main className="flex-1 p-6 md:p-8">
        <header className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Data Akun Warga</h1>
            <p className="text-sm text-gray-600">Kelola akun warga dan pantau keterhubungan dengan data rumah.</p>
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
              Total data: {totalWarga}
            </div>
          </div>

          <Link
            href="/admin/warga/tambah"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            + Tambah Warga
          </Link>
        </header>

        {/* Tabel Data */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Nama Lengkap</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Email</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Status Rumah</th>
              </tr>
              </thead>
              <tbody>
                {totalWarga === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center">
                      <p className="text-base font-semibold text-gray-700">Belum ada akun warga yang terdaftar.</p>
                      <p className="mt-1 text-sm text-gray-500">Tambahkan akun warga baru agar proses pencatatan paket dapat berjalan.</p>
                    </td>
                  </tr>
                ) : (
                  daftarWarga.map((warga: (typeof daftarWarga)[number]) => (
                    <tr key={warga.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/80 last:border-b-0">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">{warga.name || '-'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{warga.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {warga.rumah ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                            Terhubung: {warga.rumah.blok} / No. {warga.rumah.nomor}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                            Belum terhubung ke rumah
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
