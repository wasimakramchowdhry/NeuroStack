import { cn } from '../ui/utils';

interface NeoToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function NeoToggle({ 
  checked, 
  onChange, 
  label,
  disabled = false 
}: NeoToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-14 h-7 rounded-full transition-all duration-300',
          'shadow-[inset_2px_2px_5px_var(--neo-shadow-dark),inset_-3px_-3px_7px_var(--neo-shadow-light)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-[var(--neo-accent-success)]' : 'bg-background'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-5 h-5 rounded-full bg-background transition-all duration-300',
            'shadow-[2px_2px_5px_var(--neo-shadow-dark),-2px_-2px_5px_var(--neo-shadow-light)]',
            checked && 'translate-x-7'
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-[var(--neo-text-primary)]">
          {label}
        </span>
      )}
    </div>
  );
}
