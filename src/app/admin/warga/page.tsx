import prisma from '@/lib/prisma';
import AppShell from '@/components/shell/AppShell';
import { requireAdminSession } from '@/lib/require-admin-session';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

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
    <AppShell active="warga">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
              Hanya Admin yang dapat mengelola akun warga dan satpam.
            </p>
          </div>

          <Link href="/admin/warga/tambah">
            <Button className="w-full sm:w-auto">+ Tambah Pengguna Baru</Button>
          </Link>
        </header>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm md:gap-3">
          <div className="inline-flex rounded-full bg-bg-sidebar p-1">
            <Link
              href={roleLink('SEMUA', activeSort)}
              className={`rounded-full px-5 py-1.5 font-semibold transition-all ${
                activeRole === 'SEMUA' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
              }`}
            >
              Semua
            </Link>
            <Link
              href={roleLink('WARGA', activeSort)}
              className={`rounded-full px-5 py-1.5 font-semibold transition-all ${
                activeRole === 'WARGA' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
              }`}
            >
              Warga
            </Link>
            <Link
              href={roleLink('SATPAM', activeSort)}
              className={`rounded-full px-5 py-1.5 font-semibold transition-all ${
                activeRole === 'SATPAM' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
              }`}
            >
              Satpam
            </Link>
          </div>
          <div className="rounded-full bg-bg-sidebar p-1 sm:ml-auto">
            <div className="inline-flex w-full items-center sm:w-auto">
              <Link
                href={sortLink('terbaru', activeRole)}
                className={`rounded-full px-4 py-1.5 text-center font-semibold uppercase tracking-[0.08em] transition-all ${
                  activeSort === 'terbaru' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
                }`}
              >
                Terbaru
              </Link>
              <Link
                href={sortLink('lama', activeRole)}
                className={`rounded-full px-4 py-1.5 text-center font-semibold uppercase tracking-[0.08em] transition-all ${
                  activeSort === 'lama' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-primary'
                }`}
              >
                Terlama
              </Link>
            </div>
          </div>
        </div>

        <UserManagementTable rows={daftarWarga} activeRole={activeRole} activeSort={activeSort} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="p-4 border-primary-light bg-primary-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-primary-dark md:text-xl">Keamanan Data</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Perubahan akun pengguna tercatat untuk audit aktivitas admin.</p>
          </Card>
          <Card className="p-4 border-secondary-light bg-secondary-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-secondary-dark md:text-xl">Verifikasi Warga</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Pastikan data unit terisi benar agar pemetaan paket akurat.</p>
          </Card>
          <Card className="p-4 border-danger-border bg-danger-light/20">
            <p className="text-base font-bold uppercase tracking-[0.08em] text-danger md:text-xl">Batasan Admin</p>
            <p className="mt-2 text-sm text-text-body md:text-lg">Penghapusan akun bersifat permanen dan harus terkonfirmasi.</p>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
