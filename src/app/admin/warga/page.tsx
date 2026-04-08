import Link from 'next/link';
import prisma from '@/lib/prisma';
import AppSidebar from '@/components/shell/AppSidebar';
import AppTopbar from '@/components/shell/AppTopbar';
import { shellConfigs } from '@/components/shell/nav-config';
import { requireAdminSession } from '@/lib/require-admin-session';
import UserManagementTable from '@/components/admin/UserManagementTable';

type WargaPageProps = {
  searchParams?: Promise<{ role?: string; sort?: string }>;
};

function normalizeRole(role?: string) {
  if (role === 'WARGA') return 'WARGA';
  if (role === 'SATPAM') return 'SATPAM';
  return 'SEMUA';
}

function normalizeSort(sort?: string) {
  if (sort === 'lama') return 'lama';
  return 'terbaru';
}

function roleDbFilter(role: 'SEMUA' | 'WARGA' | 'SATPAM') {
  if (role === 'WARGA') return { role: 'WARGA' as const };
  if (role === 'SATPAM') return { role: 'SECURITY' as const };
  return { OR: [{ role: 'WARGA' as const }, { role: 'SECURITY' as const }] };
}

function roleLink(role: 'SEMUA' | 'WARGA' | 'SATPAM', sort: 'terbaru' | 'lama') {
  if (role === 'SEMUA') return `/admin/warga?sort=${sort}`;
  return `/admin/warga?role=${role}&sort=${sort}`;
}

function sortLink(sort: 'terbaru' | 'lama', role: 'SEMUA' | 'WARGA' | 'SATPAM') {
  if (role === 'SEMUA') return `/admin/warga?sort=${sort}`;
  return `/admin/warga?role=${role}&sort=${sort}`;
}

export default async function WargaPage({ searchParams }: WargaPageProps) {
  await requireAdminSession();

  const shellConfig = shellConfigs.ADMIN;

  const params = (await searchParams) ?? {};
  const activeRole = normalizeRole(params.role);
  const activeSort = normalizeSort(params.sort);

  const whereClause = roleDbFilter(activeRole);

  const daftarWarga = await prisma.user.findMany({
    where: whereClause,
    include: { rumah: true },
    orderBy: { createdAt: activeSort === 'terbaru' ? 'desc' : 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#dce6f2] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar config={shellConfig} active="warga" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AppTopbar config={shellConfig} title="Budi Santoso" />

          <section className="mt-4 rounded-2xl border border-blue-100 bg-[#eaf1f9] p-3 md:p-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[1.75rem] font-bold tracking-tight text-[#16293f] md:text-[2.25rem]">
                  Manajemen Pengguna
                </h1>
                <p className="mt-1 text-[0.95rem] text-[#637995] md:text-[1.05rem]">
                  Hanya Admin yang dapat mengelola akun warga dan satpam.
                </p>
              </div>

              <Link
                href="/admin/warga/tambah"
                className="inline-flex items-center justify-center rounded-full bg-[#3f6fd5] px-[1.1rem] py-[0.65rem] text-[0.92rem] font-semibold text-white shadow-sm transition hover:bg-[#315ec0] md:px-[1.5rem] md:py-[0.75rem] md:text-[1rem]"
              >
                + Tambah Pengguna Baru
              </Link>
            </header>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm md:gap-3">
              <div className="inline-flex rounded-full bg-[#dce7f4] p-1">
                <Link
                  href={roleLink('SEMUA', activeSort)}
                  className={`rounded-full px-5 py-1.5 font-semibold ${
                    activeRole === 'SEMUA' ? 'bg-[#3f6fd5] text-white' : 'text-[#657b97]'
                  }`}
                >
                  Semua
                </Link>
                <Link
                  href={roleLink('WARGA', activeSort)}
                  className={`rounded-full px-5 py-1.5 font-semibold ${
                    activeRole === 'WARGA' ? 'bg-[#3f6fd5] text-white' : 'text-[#657b97]'
                  }`}
                >
                  Warga
                </Link>
                <Link
                  href={roleLink('SATPAM', activeSort)}
                  className={`rounded-full px-5 py-1.5 font-semibold ${
                    activeRole === 'SATPAM' ? 'bg-[#3f6fd5] text-white' : 'text-[#657b97]'
                  }`}
                >
                  Satpam
                </Link>
              </div>
              <div className="w-full rounded-full bg-[#dce7f4] p-1 sm:ml-auto sm:w-auto">
                <div className="inline-flex w-full items-center sm:w-auto">
                  <Link
                    href={sortLink('terbaru', activeRole)}
                    className={`rounded-full px-4 py-1.5 text-center font-semibold uppercase tracking-[0.08em] ${
                      activeSort === 'terbaru' ? 'bg-[#3f6fd5] text-white' : 'text-[#627891]'
                    }`}
                  >
                    Terbaru
                  </Link>
                  <Link
                    href={sortLink('lama', activeRole)}
                    className={`rounded-full px-4 py-1.5 text-center font-semibold uppercase tracking-[0.08em] ${
                      activeSort === 'lama' ? 'bg-[#3f6fd5] text-white' : 'text-[#627891]'
                    }`}
                  >
                    Terlama
                  </Link>
                </div>
              </div>
            </div>

            <UserManagementTable rows={daftarWarga} activeRole={activeRole} activeSort={activeSort} />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-2xl border border-[#c8d8ea] bg-[#d8e4f2] p-4">
                <p className="text-base font-bold uppercase tracking-[0.08em] text-[#2f5e9f] md:text-xl">Keamanan Data</p>
                <p className="mt-2 text-sm text-[#536b87] md:text-lg">Perubahan akun pengguna tercatat untuk audit aktivitas admin.</p>
              </article>
              <article className="rounded-2xl border border-[#d8d0c0] bg-[#e9e1d4] p-4">
                <p className="text-base font-bold uppercase tracking-[0.08em] text-[#8f5e12] md:text-xl">Verifikasi Warga</p>
                <p className="mt-2 text-sm text-[#6f6554] md:text-lg">Pastikan data unit terisi benar agar pemetaan paket akurat.</p>
              </article>
              <article className="rounded-2xl border border-[#decfd2] bg-[#efe2e4] p-4">
                <p className="text-base font-bold uppercase tracking-[0.08em] text-[#a23b33] md:text-xl">Batasan Admin</p>
                <p className="mt-2 text-sm text-[#786469] md:text-lg">Penghapusan akun bersifat permanen dan harus terkonfirmasi.</p>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
