import AppShell from '@/components/shell/AppShell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PackageService } from '@/services/package.service';
import { PackageHistorySection } from '@/components/shell/PackageHistorySection';
import { Card } from '@/components/ui/Card';
import type { PackageItem } from '@/components/admin/PackageManagementTable';

export default async function RiwayatPengambilanPage({
  searchParams,
}: {
  searchParams?: Promise<{ courier?: string; startDate?: string; endDate?: string; showFilter?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const courierFilter = params.courier || undefined;
  const startFilter = params.startDate || undefined;
  const endFilter = params.endDate || undefined;

  const unitNumber = session?.user?.unitNumber ?? null;
  const errorMessage = !unitNumber ? 'Unit belum ditautkan' : null;

  let stats = { pickedUp: 0 };
  let historyPackages: PackageItem[] = [];

  if (unitNumber) {
    const [statsData, packagesData] = await Promise.all([
      PackageService.getPackageStats({ role: 'WARGA', unitNumber }),
      PackageService.listForAdmin({
        unit: unitNumber,
        status: 'DELIVERED_TO_WARGA',
        courier: courierFilter,
        startDate: startFilter,
        endDate: endFilter,
      }),
    ]);
    stats = statsData;
    historyPackages = packagesData.slice(0, 10);
  }

  return (
    <AppShell active="riwayat">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Riwayat Pengambilan</p>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">Paket Saya</h1>
          </div>
        </header>
        {errorMessage && (
          <Card className="mb-6 p-6 border-danger-border bg-danger-light/30">
            <p className="font-bold text-danger">Perhatian:</p>
            <p className="text-text-body mt-1">{errorMessage}</p>
          </Card>
        )}
        <PackageHistorySection
          packages={historyPackages}
          totalCount={stats.pickedUp}
          baseUrl="/warga/riwayat"
        />
      </section>
    </AppShell>
  );
}
