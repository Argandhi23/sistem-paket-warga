import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { requireAdminSession } from '@/lib/require-admin-session';
import { serverApiFetch } from '@/lib/api-client';

type ActivityLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  createdAt: string | Date;
  user?: { name: string | null; email: string | null; role: string | null } | null;
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminLoggingPage() {
  await requireAdminSession();

  const res = await serverApiFetch('/api/activity-logs?limit=100');
  const logs = (res.data || []) as ActivityLogItem[];

  return (
    <AppShell active="logging">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Audit Trail</h1>
          <p className="text-sm text-text-muted mt-1">Riwayat aksi admin, security, dan sistem.</p>
        </div>

        <Card className="p-6 border-border-light bg-bg-card shadow-sm">
          {logs.length === 0 ? (
            <p className="text-sm text-text-muted">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border-light p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-text-main">{log.action}</p>
                      <p className="text-xs text-text-muted">
                        {log.entityType} · {log.entityId}
                      </p>
                    </div>
                    <Badge variant="primary" className="w-fit">{formatDate(log.createdAt)}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-text-body">
                    <p><span className="font-bold">Actor:</span> {log.user?.name || 'Sistem'} {log.user?.role ? `(${log.user.role})` : ''}</p>
                    <p className="break-words"><span className="font-bold">Details:</span> {log.details || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
