import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'primary', children, className = '' }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-light text-primary',
    secondary: 'bg-secondary-light text-secondary',
    danger: 'bg-danger-light text-danger',
    success: 'bg-emerald-50 text-emerald-700',
    outline: 'border border-border-light bg-transparent text-text-main',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
