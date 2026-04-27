interface AvatarProps {
  name?: string | null;
  email?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function initials(name?: string | null, email?: string | null) {
  const seed = (name || email || 'U').trim();
  const parts = seed.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export const Avatar = ({ name, email, className = '', size = 'md' }: AvatarProps) => {
  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
  };

  return (
    <div className={`flex items-center justify-center rounded-full bg-primary-light font-bold text-primary ${sizes[size]} ${className}`}>
      {initials(name, email)}
    </div>
  );
};
