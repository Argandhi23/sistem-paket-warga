import AppShell from '@/components/shell/AppShell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import { PackageHistorySection } from '@/components/shell/PackageHistorySection';
import { Card } from '@/components/ui/Card';

export default async function RiwayatPengambilanPage({ searchParams }: { searchParams?: Promise<{ courier?: string; startDate?: string; endDate?: string; showFilter?: string }> }) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const courierFilter = params.courier || '';
  const startFilter = params.startDate || '';
  const endFilter = params.endDate || '';

  const hasUnit = !!session?.user?.unitNumber;
  const errorMessage = !hasUnit ? "Unit belum ditautkan" : null;

  let stats = { pickedUp: 0 };
  let historyPackages: any[] = [];

  if (hasUnit) {
    const statsRes = await serverApiFetch('/api/packages/stats');
    stats = statsRes.data || { pickedUp: 0 };

    const historyQuery = new URLSearchParams({
      status: 'DELIVERED_TO_WARGA',
      ...(courierFilter && { courier: courierFilter }),
      ...(startFilter && { startDate: startFilter }),
      ...(endFilter && { endDate: endFilter }),
    }).toString();

    const historyRes = await serverApiFetch(`/api/packages?${historyQuery}`);
    historyPackages = (historyRes.data || []).slice(0, 10);
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
