import { NeoCard } from '../neo/NeoCard';
import { Sparkles } from 'lucide-react';

interface VisualSectionProps {
  content: {
    title?: string;
    description?: string;
    placeholderText?: string;
  };
}

export function VisualSection({ content }: VisualSectionProps) {
  return (
    <NeoCard className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-900">
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="p-4 rounded-full bg-white/50 dark:bg-slate-700/50 shadow-inner">
          <Sparkles className="w-12 h-12 text-orange-500" />
        </div>
        {content.title && (
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {content.title}
          </h3>
        )}
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl">
          {content.placeholderText || content.description || 'Interactive visualization coming in Phase 5'}
        </p>
        <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Phase 5: GSAP Animation
        </div>
      </div>
    </NeoCard>
  );
}
