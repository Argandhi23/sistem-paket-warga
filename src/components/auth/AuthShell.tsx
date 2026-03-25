import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_20%,#f8f1df_0%,#eef5ff_45%,#f7fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] md:min-h-[720px] md:grid-cols-2">
        {children}
      </section>
    </main>
  );
}
