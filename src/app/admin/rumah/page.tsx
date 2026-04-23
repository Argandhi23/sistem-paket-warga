import AppShell from '@/components/shell/AppShell';
import RumahManagementPanel from '@/components/admin/RumahManagementPanel';

export default async function AdminRumahPage() {
  return (
    <AppShell active="rumah">
      <RumahManagementPanel />
    </AppShell>
  );
}
