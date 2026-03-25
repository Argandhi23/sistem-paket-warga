"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mail, PackageCheck, ShieldCheck, TimerReset, UserRoundCheck } from "lucide-react";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";

type FieldName = "email" | "password";

type FieldState = {
  email: string;
  password: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldErrors(fields: FieldState) {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.password.trim()) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function LoginPage() {
  const [fields, setFields] = useState<FieldState>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    email: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const errors = useMemo(() => getFieldErrors(fields), [fields]);

  const visibleError = (field: FieldName) => {
    if (!touched[field] && !submitted) {
      return undefined;
    }

    return errors[field];
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatusMessage("Auth API not connected yet");
  };

  return (
    <AuthShell>
      <div className="order-2 flex items-center justify-center bg-[linear-gradient(155deg,#16338f_0%,#1f4db8_40%,#235cc9_100%)] p-8 md:order-1 md:p-10">
        <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Sistem Paket Warga</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight">Distribusi paket rumah jadi lebih rapi.</h2>
          <p className="mt-4 max-w-sm text-sm text-blue-100/90">
            Login sebagai Warga, Admin, atau Sekuriti untuk melihat dashboard sesuai role. Akun dikelola
            melalui CRUD user oleh admin perumahan.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-blue-100">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
              Tracking Paket
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Validasi Keamanan
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
              <TimerReset className="h-4 w-4" aria-hidden="true" />
              Riwayat Penerimaan
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
              <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
              Kontrol Akses Role
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 flex items-center justify-center p-6 md:order-2 md:p-10">
        <AuthCard title="Login" description="Masuk ke sistem menggunakan email dan kata sandi yang telah diberikan admin.">
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <AuthInput
              id="email"
              label="Email"
              type="email"
              value={fields.email}
              placeholder="nama@perumahan.id"
              required
              error={visibleError("email")}
              icon={Mail}
              onChange={(value) => setFields((previous) => ({ ...previous, email: value }))}
              onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
            />

            <PasswordField
              id="password"
              label="Password"
              value={fields.password}
              placeholder="Minimal 8 karakter"
              required
              error={visibleError("password")}
              onChange={(value) => setFields((previous) => ({ ...previous, password: value }))}
              onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
            />

            <AuthActions
              rememberMe={rememberMe}
              onRememberMeChange={setRememberMe}
              onForgotPasswordClick={() => setStatusMessage("Not implemented yet")}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-[#1a3fd4] px-4 py-3 text-sm font-semibold text-white outline-none transition hover:bg-[#1737b8] focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Login
            </button>

            <p aria-live="polite" className="min-h-6 text-sm text-slate-600">
              {statusMessage}
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
