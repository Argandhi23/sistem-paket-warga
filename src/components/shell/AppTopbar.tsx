import { ShellConfig } from './nav-config';
import { Search } from 'lucide-react';

type AppTopbarProps = {
  config: ShellConfig;
  title: string;
};

export default function AppTopbar({ config, title }: AppTopbarProps) {
  const icons = config.topIcons ?? [];

  return (
    <header className="rounded-2xl border border-[#c7d8ec] bg-[#edf4fc] p-2.5 shadow-sm md:p-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#deebf8] px-3 py-2 text-[#5f728a] md:gap-3 md:py-2.5">
          <Search size={17} />
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#7f92a8]"
            aria-label="Search"
          />
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-3 lg:justify-end">
          <div className="flex items-center gap-1.5 text-[#5e7591]">
            {icons.map((Icon, index) => (
              <button
                key={`${Icon.displayName ?? Icon.name}-${index}`}
                type="button"
                className="rounded-full p-1.5 hover:bg-[#dce8f7] md:p-2"
                aria-label={Icon.displayName ?? Icon.name}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>

          <div className="h-7 w-px bg-blue-200 md:h-8" />

          <div className="flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-[#2e3f57] md:px-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7890ac]">{config.roleLabel}</p>
              <p className="max-w-[120px] truncate text-xs font-semibold leading-none md:max-w-none md:text-sm">{title}</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#203348] text-sm font-bold text-white">
              {config.profileInitials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
