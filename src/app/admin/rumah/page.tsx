import AppSidebar from '@/components/shell/AppSidebar';
import AppTopbar from '@/components/shell/AppTopbar';
import { shellConfigs } from '@/components/shell/nav-config';
import { requireAdminSession } from '@/lib/require-admin-session';
import RumahManagementPanel from '@/components/admin/RumahManagementPanel';

export default async function AdminRumahPage() {
  await requireAdminSession();

  const shellConfig = shellConfigs.ADMIN;

  return (
    <div className="min-h-screen bg-[#dce6f2] text-[#2f3f56]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar config={shellConfig} active="rumah" />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AppTopbar config={shellConfig} title="Budi Santoso" />
          <RumahManagementPanel />
        </main>
      </div>
    </div>
  );
}
