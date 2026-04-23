import AppShell from '@/components/shell/AppShell';
import PackageManagementTable from '@/components/admin/PackageManagementTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api-client';
import { FilterPanel } from '@/components/shell/FilterPanel';
import { Card } from '@/components/ui/Card';

export default async function WargaPaketListPage({ searchParams }: { searchParams?: Promise<{ courier?: string; startDate?: string; endDate?: string }> }) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const courier = params.courier || '';
  const startDate = params.startDate || '';
  const endDate = params.endDate || '';

  const queryParts: string[] = [];
  if (courier) queryParts.push(`courier=${encodeURIComponent(courier)}`);
  if (startDate) queryParts.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) queryParts.push(`endDate=${encodeURIComponent(endDate)}`);
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const res = await serverApiFetch(`/api/packages${queryString}`);
  const myPackages = res.data || [];
  const errorMessage = !res.success ? res.message : null;

  return (
    <AppShell active="paket-saya">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Inventaris Pribadi</p>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
              Paket Saya
            </h1>
          </div>
        </header>
        
        <FilterPanel baseUrl="/warga/paket" isOpen={true} />

        {errorMessage && (
          <Card className="mb-6 p-6 border-danger-border bg-danger-light/30">
            <p className="font-bold text-danger">Perhatian:</p>
            <p className="text-text-body mt-1">{errorMessage}</p>
          </Card>
        )}

        <PackageManagementTable rows={myPackages as any} hideActions={true} />
      </section>
    </AppShell>
  );
}
