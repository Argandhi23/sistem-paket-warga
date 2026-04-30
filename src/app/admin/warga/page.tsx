import prisma from '@/lib/prisma';
import AppShell from '@/components/shell/AppShell';
import { requireAdminSession } from '@/lib/require-admin-session';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ShieldAlert, Fingerprint, Lock } from 'lucide-react';

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
      <div className="flex flex-col gap-8 pb-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 shadow-2xl sm:px-10 sm:py-12">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Manajemen Pengguna
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/90 md:text-base">
                Kelola hak akses dan peran pengguna. Pastikan seluruh profil warga dan satpam tervalidasi dengan aman di sistem.
              </p>
            </div>
            
            <Link href="/admin/warga/tambah" className="shrink-0">
              <Button className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-dark font-bold border-0 shadow-lg px-6 py-3 rounded-xl transition-all hover:scale-105">
                + Tambah Pengguna Baru
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex rounded-full bg-bg-card border border-border-light p-1 shadow-sm">
              <Link
                href={roleLink('SEMUA', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                  activeRole === 'SEMUA' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Semua
              </Link>
              <Link
                href={roleLink('WARGA', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                  activeRole === 'WARGA' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Warga
              </Link>
              <Link
                href={roleLink('SATPAM', activeSort)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                  activeRole === 'SATPAM' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                }`}
              >
                Satpam
              </Link>
            </div>
            
            <div className="rounded-full bg-bg-card border border-border-light p-1 shadow-sm">
              <div className="inline-flex w-full items-center sm:w-auto">
                <Link
                  href={sortLink('terbaru', activeRole)}
                  className={`rounded-full px-5 py-2 text-xs font-bold text-center uppercase tracking-wider transition-all ${
                    activeSort === 'terbaru' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                  }`}
                >
                  Terbaru
                </Link>
                <Link
                  href={sortLink('lama', activeRole)}
                  className={`rounded-full px-5 py-2 text-xs font-bold text-center uppercase tracking-wider transition-all ${
                    activeSort === 'lama' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'
                  }`}
                >
                  Terlama
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card shadow-md border border-border-light overflow-hidden">
            <UserManagementTable rows={daftarWarga} activeRole={activeRole} activeSort={activeSort} />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <Fingerprint className="h-8 w-8 text-primary mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Keamanan Data</p>
                  <p className="mt-2 text-sm text-text-muted">Perubahan akun pengguna tercatat dalam sistem audit integritas.</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-secondary/10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <ShieldAlert className="h-8 w-8 text-secondary-dark mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary-dark">Validasi Hunian</p>
                  <p className="mt-2 text-sm text-text-muted">Data unit yang akurat menjamin notifikasi paket diterima dengan benar.</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-danger/5 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <Lock className="h-8 w-8 text-danger mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase tracking-widest text-danger">Batasan Otoritas</p>
                  <p className="mt-2 text-sm text-text-muted">Tindakan penghapusan akun bersifat destruktif dan memerlukan validasi.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
