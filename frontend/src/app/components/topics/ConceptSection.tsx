import { lazy, Suspense } from 'react';
import { NeoCard } from '../neo/NeoCard';
import { LoadingSkeleton } from '../feedback/LoadingSkeleton';

// Lazy load heavy markdown wrapper component
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

interface ConceptSectionProps {
  content: {
    markdown: string;
  };
}

export function ConceptSection({ content }: ConceptSectionProps) {
  return (
    <NeoCard className="p-6">
      <Suspense fallback={<LoadingSkeleton className="h-48" />}>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={content.markdown} />
        </div>
      </Suspense>
    </NeoCard>
  );
}