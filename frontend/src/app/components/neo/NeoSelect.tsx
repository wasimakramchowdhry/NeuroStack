import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../ui/utils';
import { ChevronDown } from 'lucide-react';

interface NeoSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const NeoSelect = forwardRef<HTMLSelectElement, NeoSelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-[var(--neo-text-primary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-3 pr-10 rounded-xl bg-background appearance-none cursor-pointer',
              'shadow-[inset_4px_4px_8px_var(--neo-shadow-dark),inset_-4px_-4px_8px_var(--neo-shadow-light)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--neo-focus)]',
              'text-[var(--neo-text-primary)]',
              'transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'ring-2 ring-destructive',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

NeoSelect.displayName = 'NeoSelect';
