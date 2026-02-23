import { NeoCard } from '../neo/NeoCard';
import { Network } from 'lucide-react';

interface ArchitectureSectionProps {
  content: {
    title?: string;
    description?: string;
    imageUrl?: string;
    diagramType?: string;
  };
}

export function ArchitectureSection({ content }: ArchitectureSectionProps) {
  return (
    <NeoCard className="overflow-hidden">
      {content.title && (
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {content.description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {content.imageUrl ? (
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={content.imageUrl}
              alt={content.title || 'Architecture diagram'}
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg">
            <div className="p-4 rounded-full bg-white/50 dark:bg-slate-700/50 shadow-inner mb-4">
              <Network className="w-12 h-12 text-orange-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              {content.diagramType ? `${content.diagramType} diagram` : 'Architecture diagram'} placeholder
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              (Mermaid/SVG support coming soon)
            </p>
          </div>
        )}
      </div>
    </NeoCard>
  );
}
