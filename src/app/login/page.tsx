"use client";

import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { Package, Truck, ShieldCheck, Clock, HelpCircle, Globe, LockKeyhole, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";

type FieldName = "email" | "password";

type FieldState = {
  email: string;
  password: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldErrors(fields: FieldState) {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!fields.email.trim()) {
    errors.email = "Email atau Username tidak boleh kosong.";
  }

  if (!fields.password.trim()) {
    errors.password = "Password tidak boleh kosong.";
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
  const [showPassword, setShowPassword] = useState(false);

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
      "Terdeteksi kredensial pada URL dan sudah dibersihkan otomatis demi keamanan."
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
            : result.error
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
    <main className="min-h-screen w-full relative">
      {/* Desktop Layout */}
      <div className="hidden md:grid min-h-screen grid-cols-2">
        {/* Left Panel */}
        <div className="bg-primary flex flex-col justify-center items-center relative h-full">
          <div className="w-full max-w-lg px-8 flex flex-col items-center">

            <h2 className="text-white font-bold text-2xl text-center mt-2">
              Efisien. Terpercaya. Tepat Waktu.
            </h2>
            <p className="text-gray-300 text-sm text-center mt-2 px-8">
              Kelola pengiriman paket di perumahan dengan sistem terintegrasi yang dirancang untuk kenyamanan kurir dan kepuasan pelanggan.
            </p>
          </div>
          <div className="absolute bottom-6 left-6 flex gap-6 text-gray-300 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gray-300" />
              Layanan Terverifikasi
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-300" />
              Dukungan 24/7
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white flex flex-col justify-center px-12 py-10">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Package className="size-5 text-primary" strokeWidth={2} />
              </div>
              <span className="font-extrabold text-primary text-sm tracking-wide">
                Sistem Distribusi Paket <br className="hidden sm:block" /> Di Perumahan
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
              <p className="text-sm text-gray-500 mt-1">Silakan masukkan akun Anda untuk mulai mengelola pengiriman.</p>
            </div>

            <form className="space-y-4 mt-6" onSubmit={onSubmit} noValidate>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-1">Email atau Username</label>
                <Input
                  id="email"
                  type="text"
                  icon={<User className="h-4 w-4" />}
                  value={fields.email}
                  placeholder="Contoh: admin.logistik@email.com"
                  className="rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent py-2.5"
                  onChange={(e) => setFields((prev) => ({ ...prev, email: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                />
                {visibleError("email") && <p className="text-sm text-red-500 font-medium">{visibleError("email")}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="text-sm font-bold text-gray-900">Password</label>
                  <button type="button" onClick={() => setStatusMessage("Fitur Lupa Password belum tersedia.")} className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors">
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    icon={<LockKeyhole className="h-4 w-4" />}
                    value={fields.password}
                    placeholder="********"
                    className="rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent py-2.5 pr-10"
                    onChange={(e) => setFields((prev) => ({ ...prev, password: e.target.value }))}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {visibleError("password") && <p className="text-sm text-red-500 font-medium">{visibleError("password")}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-lg shadow-md text-base bg-primary hover:bg-primary/90 flex justify-center items-center gap-2 text-white font-bold transition-all"
                >
                  {isSubmitting ? "Memproses..." : "Masuk"} {isSubmitting ? null : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>

              {statusMessage && (
                <p aria-live="polite" className="text-sm text-center text-red-500 font-medium mt-2">
                  {statusMessage}
                </p>
              )}
            </form>

            <hr className="my-6 border-gray-200" />

            <div className="flex justify-center gap-6 text-xs text-gray-400">
              <button type="button" className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                <HelpCircle className="h-3.5 w-3.5" /> BANTUAN
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                <Globe className="h-3.5 w-3.5" /> ID (INDONESIA)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-primary flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Package className="size-6 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-primary text-center leading-tight">Sistem Distribusi Paket<br/>Di Perumahan</h1>
            <p className="text-xs text-gray-500 text-center mt-2">Efisiensi pengiriman langsung ke depan pintu Anda.</p>
          </div>

          <form className="space-y-4 w-full" onSubmit={onSubmit} noValidate>
            <div className="space-y-1">
              <label htmlFor="emailMobile" className="block text-xs font-bold text-gray-900 mb-1">Email atau Username</label>
              <Input
                id="emailMobile"
                type="text"
                icon={<User className="h-4 w-4" />}
                value={fields.email}
                placeholder="Masukkan email atau username"
                className="rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent py-2.5 text-sm"
                onChange={(e) => setFields((prev) => ({ ...prev, email: e.target.value }))}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              />
              {visibleError("email") && <p className="text-xs text-red-500 font-medium">{visibleError("email")}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="passwordMobile" className="text-xs font-bold text-gray-900">Password</label>
                <button type="button" onClick={() => setStatusMessage("Fitur Lupa Password belum tersedia.")} className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="passwordMobile"
                  type={showPassword ? "text" : "password"}
                  icon={<LockKeyhole className="h-4 w-4" />}
                  value={fields.password}
                  placeholder="********"
                  className="rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent py-2.5 pr-10 text-sm"
                  onChange={(e) => setFields((prev) => ({ ...prev, password: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none rounded"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {visibleError("password") && <p className="text-xs text-red-500 font-medium">{visibleError("password")}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg shadow-md text-sm bg-primary hover:bg-primary/90 flex justify-center items-center text-white font-bold transition-all mt-2"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
            
            {statusMessage && (
              <p aria-live="polite" className="text-xs text-center text-red-500 font-medium mt-2">
                {statusMessage}
              </p>
            )}
          </form>

        </div>
      </div>
    </main>
  );
}
