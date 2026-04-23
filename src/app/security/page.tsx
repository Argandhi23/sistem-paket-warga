import AppShell from '@/components/shell/AppShell';
import PackageManifestTable from '@/components/admin/PackageManifestTable';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';

export default async function SecurityDashboard() {
  const initialPackages = await prisma.package.findMany({
    orderBy: {
      receivedAt: 'desc',
    },
    take: 50,
  });

  return (
    <AppShell active="dashboard">
      <section className="rounded-2xl border border-border-light bg-bg-header p-4 md:p-6 shadow-soft">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Live Monitor</p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-text-main md:text-[2.25rem]">
            Manifest Paket Warga
          </h1>
          <p className="mt-1 text-[0.95rem] text-text-muted">
            Pantau paket masuk dan status pengambilan secara real-time.
          </p>
        </header>

        <Card className="overflow-hidden border-border-light shadow-sm">
          <PackageManifestTable initialData={initialPackages} />
        </Card>
      </section>
    </AppShell>
  );
}