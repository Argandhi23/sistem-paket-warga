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
        <h1 className="text-3xl font-bold text-text-main sm:text-4xl">{title}</h1>
        <p className="text-sm text-text-muted sm:text-base">{description}</p>
      </div>
      {children}
    </div>
  );
}
