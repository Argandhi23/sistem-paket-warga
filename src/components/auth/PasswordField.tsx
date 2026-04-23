import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function PasswordField({
  id,
  label,
  value,
  placeholder,
  required,
  error,
  onChange,
  onBlur,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-text-main uppercase tracking-wider text-[0.7rem]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="w-full rounded-xl border border-border-light bg-bg-header py-3 pl-11 pr-28 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold text-text-muted outline-none transition hover:bg-bg-card/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" aria-hidden="true" /> : <Eye className="h-4.5 w-4.5" aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
