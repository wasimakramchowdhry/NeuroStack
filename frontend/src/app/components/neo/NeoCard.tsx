import { ReactNode } from 'react';
import { cn } from '../ui/utils';

interface NeoCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'inset' | 'flat';
  onClick?: () => void;
}

export function NeoCard({ 
  children, 
  className, 
  variant = 'default',
  onClick 
}: NeoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-300',
        variant === 'default' && [
          'bg-background',
          'shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light)]',
          onClick && 'hover:shadow-[4px_4px_8px_var(--neo-shadow-dark),-4px_-4px_8px_var(--neo-shadow-light)] cursor-pointer active:shadow-[inset_2px_2px_5px_var(--neo-shadow-dark),inset_-2px_-2px_5px_var(--neo-shadow-light)]'
        ],
        variant === 'inset' && [
          'bg-background',
          'shadow-[inset_4px_4px_8px_var(--neo-shadow-dark),inset_-4px_-4px_8px_var(--neo-shadow-light)]'
        ],
        variant === 'flat' && [
          'bg-background',
          'shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)]'
        ],
        className
      )}
    >
      {children}
    </div>
  );
}
