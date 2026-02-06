'use client';

interface ActionButtonProps {
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ActionButton({
  onClick,
  href,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  children,
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-amber-950',
    secondary: 'bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-700',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white',
  };

  const baseClasses = `px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold transition-all duration-200 ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
