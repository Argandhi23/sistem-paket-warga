import Link from 'next/link';
import { Box } from 'lucide-react';
import { NavKey, ShellConfig } from './nav-config';
import LogoutButton from './LogoutButton';

type AppSidebarProps = {
  config: ShellConfig;
  active: NavKey;
};

export default function AppSidebar({ config, active }: AppSidebarProps) {
  return (
    <aside className="w-full border-b border-border-sidebar bg-bg-sidebar p-3 lg:w-[17rem] lg:border-b-0 lg:border-r lg:p-5 xl:w-[18rem]">
      <div className="rounded-2xl border border-dashed border-primary/20 bg-bg-header p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-sm">
            <Box size={18} />
          </div>
          <div>
            <p className="text-[1.05rem] font-bold text-primary-dark">The Concierge</p>
            <p className="text-xs tracking-[0.12em] text-text-muted">{config.appLabel}</p>
          </div>
        </div>
      </div>

      <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:mt-4 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
        {config.navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:gap-3 ${isActive 
                ? 'bg-bg-card text-primary shadow-soft' 
                : 'text-text-body hover:bg-bg-header hover:text-primary'
                }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
