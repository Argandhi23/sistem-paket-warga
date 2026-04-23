import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`rounded-2xl border border-border-main bg-bg-card shadow-soft ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`border-b border-border-light px-6 py-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`border-t border-border-light px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};
