import type { LucideIcon } from "lucide-react";

type AuthInputProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  icon?: LucideIcon;
};

export function AuthInput({
  id,
  label,
  type = "text",
  value,
  placeholder,
  required,
  error,
  onChange,
  onBlur,
  icon: Icon,
}: AuthInputProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        {Icon ? (
          <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
