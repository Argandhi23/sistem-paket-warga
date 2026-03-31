import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[480px]">
      <div className="mb-8 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
        <p className="text-sm text-slate-600 sm:text-base">{description}</p>
      </div>
      {children}
    </div>
  );
}
