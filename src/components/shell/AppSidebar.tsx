import Link from 'next/link';
import { Package } from 'lucide-react';
import { NavKey, ShellConfig } from './nav-config';
import LogoutButton from './LogoutButton';

type AppSidebarProps = {
  config: ShellConfig;
  active: NavKey;
};

export default function AppSidebar({ config, active }: AppSidebarProps) {
  return (
    <aside className="flex flex-col w-full border-b border-border-light bg-bg-card p-3 lg:w-[17rem] lg:border-b-0 lg:border-r lg:p-5 xl:w-[18rem] shadow-sm relative z-20">
      <div className="mb-2 lg:mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
            <Package className="size-5 text-primary" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[0.85rem] font-extrabold text-primary leading-tight tracking-tight">
              Sistem Distribusi<br/>Di Perumahan
            </p>
            <p className="text-[0.65rem] tracking-[0.1em] font-bold text-text-muted uppercase mt-1">
              {config.appLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:space-y-1.5 lg:overflow-visible lg:pb-0 px-1 mt-3 lg:mt-0">
        {config.navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-text-muted hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 lg:mt-auto border-t border-border-light px-1 shrink-0">
        <LogoutButton />
      </div>
    </aside>
  );
}
