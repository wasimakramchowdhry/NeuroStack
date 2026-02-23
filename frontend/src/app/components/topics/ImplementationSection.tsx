import { NeoCard } from '../neo/NeoCard';
import { CheckCircle2 } from 'lucide-react';

interface ImplementationSectionProps {
  content: {
    title?: string;
    steps: string[];
  };
}

export function ImplementationSection({ content }: ImplementationSectionProps) {
  return (
    <NeoCard className="p-6">
      {content.title && (
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
          {content.title}
        </h3>
      )}
      <ol className="space-y-3">
        {content.steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-slate-700 dark:text-slate-300">{step}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          </li>
        ))}
      </ol>
    </NeoCard>
  );
}
