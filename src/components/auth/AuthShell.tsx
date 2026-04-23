import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-sidebar px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border-main bg-bg-card shadow-card md:min-h-[720px] md:grid-cols-2">
        {children}
      </section>
    </main>
  );
}
