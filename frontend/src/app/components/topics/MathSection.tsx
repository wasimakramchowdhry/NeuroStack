import { lazy, Suspense } from 'react';
import { NeoCard } from '../neo/NeoCard';
import { LoadingSkeleton } from '../feedback/LoadingSkeleton';

// Lazy load heavy markdown wrapper component
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

interface MathSectionProps {
  content: {
    title?: string;
    formula: string;
    description?: string;
  };
}

export function MathSection({ content }: MathSectionProps) {
  return (
    <NeoCard className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-900">
      {content.title && (
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
          {content.title}
        </h3>
      )}
      <Suspense fallback={<LoadingSkeleton className="h-20" />}>
        <div className="flex justify-center my-6">
          <div className="text-xl">
            <MarkdownRenderer content={`$$${content.formula}$$`} />
          </div>
        </div>
      </Suspense>
      {content.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-4">
          {content.description}
        </p>
      )}
    </NeoCard>
  );
}