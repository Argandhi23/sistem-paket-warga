"use client";

import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { PackageCheck, ShieldCheck, TimerReset, UserRoundCheck } from "lucide-react";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";

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
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasSensitiveQuery = url.searchParams.has("email") || url.searchParams.has("password");

    if (!hasSensitiveQuery) {
      return;
    }

    url.searchParams.delete("email");
    url.searchParams.delete("password");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    setStatusMessage(
      "Terdeteksi kredensial pada URL dan sudah dibersihkan otomatis demi keamanan.",
    );
  }, []);

  const errors = useMemo(() => getFieldErrors(fields), [fields]);

  const visibleError = (field: FieldName) => {
    if (!touched[field] && !submitted) {
      return undefined;
    }

    return errors[field];
  };

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setStatusMessage("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: fields.email,
        password: fields.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!result) {
        setStatusMessage("Gagal memproses login. Coba lagi.");
        return;
      }

      if (result.error) {
        setStatusMessage(
          result.error === "CredentialsSignin"
            ? "Email tidak terdaftar atau password salah"
            : result.error,
        );
        return;
      }

      window.location.assign(result.url ?? "/");
    } catch {
      setStatusMessage("Terjadi gangguan server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="order-2 flex items-center justify-center bg-primary p-8 md:order-1 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
        <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-md relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100/80">Sistem Paket Warga</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">Distribusi paket rumah jadi lebih rapi.</h2>
          <p className="mt-4 max-w-sm text-sm text-blue-100/90 leading-relaxed">
            Login sebagai Warga, Admin, atau Sekuriti untuk melihat dashboard sesuai role. Akun dikelola
            melalui CRUD user oleh admin perumahan.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-blue-100">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-3 shadow-sm">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
              Tracking Paket
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-3 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Validasi Keamanan
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-3 shadow-sm">
              <TimerReset className="h-4 w-4" aria-hidden="true" />
              Riwayat Penerimaan
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-3 shadow-sm">
              <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
              Kontrol Akses Role
            </div>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="order-1 flex items-center justify-center p-6 md:order-2 md:p-10 bg-bg-card">
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

            <AuthActions onForgotPasswordClick={() => setStatusMessage("Not implemented yet")} />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl shadow-md text-base"
            >
              {isSubmitting ? "Memproses..." : "Login Ke Dashboard"}
            </Button>

            <p aria-live="polite" className="min-h-6 text-sm text-text-muted italic text-center">
              {statusMessage}
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
