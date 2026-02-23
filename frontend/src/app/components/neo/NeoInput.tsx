import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../ui/utils';

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NeoInput = forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-[var(--neo-text-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-background',
            'shadow-[inset_4px_4px_8px_var(--neo-shadow-dark),inset_-4px_-4px_8px_var(--neo-shadow-light)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--neo-focus)]',
            'text-[var(--neo-text-primary)] placeholder:text-[var(--neo-text-secondary)]',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'ring-2 ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

NeoInput.displayName = 'NeoInput';
