import AppShell from '@/components/shell/AppShell';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function WargaLoading() {
  return (
    <AppShell active="dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-card overflow-hidden">
          <TableSkeleton rows={5} />
        </div>
      </div>
    </AppShell>
  );
}
