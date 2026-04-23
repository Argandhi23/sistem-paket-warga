import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { shellConfigs, NavKey } from './nav-config';
import { requireSession } from '@/lib/require-session';

type AppShellProps = {
  children: React.ReactNode;
  active: NavKey;
};

export default async function AppShell({ children, active }: AppShellProps) {
  const session = await requireSession();
  const role = session.user.role;
  const config = shellConfigs[role];

  return (
    <div className="min-h-screen text-text-main bg-bg-main">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar config={config} active={active} />

        <main className="flex-1 p-[1.1rem] md:p-[1.5rem] lg:p-[1.75rem]">
          <AppTopbar 
            config={config} 
            title={session.user.name || role.charAt(0) + role.slice(1).toLowerCase()} 
          />
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
