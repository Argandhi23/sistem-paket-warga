import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: ReactNode;
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:scale-[1.02]',
    outline: 'border border-border-main bg-bg-card text-text-muted hover:bg-bg-muted',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'text-text-muted hover:bg-bg-muted hover:text-primary',
  };

  const sizes = {
    sm: 'rounded-full px-3 py-1.5 text-xs',
    md: 'rounded-full px-5 py-2.5 text-sm',
    lg: 'rounded-full px-6 py-3 text-base',
    icon: 'rounded-full p-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
