import AppShell from '@/components/shell/AppShell';
import RumahManagementPanel from '@/components/admin/RumahManagementPanel';
import { requireAdminSession } from '@/lib/require-admin-session';
import { RumahService } from '@/services/rumah.service';
import { UserService } from '@/services/user.service';

export default async function AdminRumahPage() {
  await requireAdminSession();

  const [initialRumah, initialWarga] = await Promise.all([
    RumahService.listAll(),
    UserService.listForManagement({ role: 'WARGA' }),
  ]);

  const serializedRumah = initialRumah.map((r) => ({
    id: r.id,
    blok: r.blok,
    nomor: r.nomor,
    penghuni: r.penghuni,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt ?? ''),
  }));

  return (
    <AppShell active="rumah">
      <RumahManagementPanel initialRumah={serializedRumah} initialWarga={initialWarga} />
    </AppShell>
  );
}
