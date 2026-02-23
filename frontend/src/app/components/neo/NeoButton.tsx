import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../ui/utils';
import { Loader2 } from 'lucide-react';

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function NeoButton({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...props 
}: NeoButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Primary variant (Orange)
        variant === 'primary' && [
          'bg-[var(--neo-accent-orange)] text-white',
          'shadow-[4px_4px_8px_var(--neo-shadow-dark),-4px_-4px_8px_var(--neo-shadow-light)]',
          'hover:shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light)] hover:scale-[1.02]',
          'active:shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)] active:scale-[0.98]',
        ],
        // Secondary variant (Slate)
        variant === 'secondary' && [
          'bg-[var(--neo-accent-slate)] text-white',
          'shadow-[4px_4px_8px_var(--neo-shadow-dark),-4px_-4px_8px_var(--neo-shadow-light)]',
          'hover:shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light)] hover:scale-[1.02]',
          'active:shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)] active:scale-[0.98]',
        ],
        // Ghost variant
        variant === 'ghost' && [
          'bg-background text-foreground',
          'shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)]',
          'hover:shadow-[4px_4px_8px_var(--neo-shadow-dark),-4px_-4px_8px_var(--neo-shadow-light)]',
          'active:shadow-[inset_2px_2px_4px_var(--neo-shadow-dark),inset_-2px_-2px_4px_var(--neo-shadow-light)]',
        ],
        // Sizes
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
