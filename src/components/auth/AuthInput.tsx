import { Mail } from "lucide-react";

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
}: AuthInputProps) {
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
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="w-full rounded-xl border border-border-light bg-bg-header px-4 py-3 pl-11 pr-12 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
