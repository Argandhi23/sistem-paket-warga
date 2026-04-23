import { ShellConfig } from './nav-config';
import { Search } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

type AppTopbarProps = {
  config: ShellConfig;
  title: string;
};

export default function AppTopbar({ config, title }: AppTopbarProps) {
  const icons = config.topIcons ?? [];

  return (
    <header className="card-base p-2.5 shadow-soft md:p-3 bg-bg-card border-border-main">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="search-bar group flex flex-1 items-center gap-3 px-4 py-2 bg-bg-header rounded-xl border border-border-light transition-all focus-within:border-primary md:py-2.5">
          <Search size={18} className="text-text-muted transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            className="w-full bg-transparent text-sm font-medium text-text-main outline-none placeholder:text-text-muted"
            aria-label="Search"
          />
        </div>

        <div className="flex items-center justify-between gap-3 md:gap-4 lg:justify-end">
          <div className="flex items-center gap-1 text-text-muted">
            {icons.map((Icon, index) => (
              <button
                key={`${Icon.displayName ?? Icon.name}-${index}`}
                type="button"
                className="flex size-9 items-center justify-center rounded-full transition-all hover:bg-bg-muted hover:text-primary md:size-10"
                aria-label={Icon.displayName ?? Icon.name}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-border-light" />

          <div className="flex items-center gap-3 rounded-full border border-border-light bg-bg-card px-1.5 py-1.5 pr-4 text-text-main shadow-soft transition-transform hover:scale-[1.02]">
            <Avatar 
              name={config.profileInitials} 
              className="bg-primary text-white shadow-sm" 
              size="sm" 
            />
            <div className="hidden sm:block">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted leading-tight">{config.roleLabel}</p>
              <p className="max-w-[120px] truncate text-sm font-bold leading-none text-text-main md:max-w-none">{title}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
