import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, icon, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">{label}</p>}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/70">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border border-border-light bg-bg-header py-2.5 px-4 text-sm text-text-main outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export const Select = ({ label, icon, options, className = '', ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">{label}</p>}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/70">
            {icon}
          </div>
        )}
        <select
          className={`w-full rounded-xl border border-border-light bg-bg-header py-2.5 px-4 text-sm text-text-main outline-none appearance-none transition-all focus:border-primary focus:ring-1 focus:ring-primary ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
