import Link from 'next/link';
import { Box } from 'lucide-react';
import { NavKey, ShellConfig } from './nav-config';

type AppSidebarProps = {
  config: ShellConfig;
  active: NavKey;
};

export default function AppSidebar({ config, active }: AppSidebarProps) {
  return (
    <aside className="w-full border-b border-[#bfd2e8] bg-[#d6e0ec] p-3 lg:w-[17rem] lg:border-b-0 lg:border-r lg:p-5 xl:w-[18rem]">
      <div className="rounded-2xl border border-dashed border-[#7ea4da] bg-[#e8f0fa] p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#3f6fd5] text-white">
            <Box size={18} />
          </div>
          <div>
            <p className="text-[1.05rem] font-bold text-[#2553a6]">The Concierge</p>
            <p className="text-xs tracking-[0.12em] text-[#60748f]">{config.appLabel}</p>
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
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:gap-3 ${
                isActive ? 'bg-[#c7d8ee] text-[#2a5eb8]' : 'text-[#50627a] hover:bg-[#cfdded] hover:text-[#2a5eb8]'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {config.quickAction ? (
        <div className="mt-4 hidden rounded-2xl border border-[#c5d7ea] bg-[#e8f0fa] p-3 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#60748f]">Aksi Cepat</p>
          <Link
            href={config.quickAction.href}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#3f6fd5] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#325fc0]"
          >
            {config.quickAction.label}
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
