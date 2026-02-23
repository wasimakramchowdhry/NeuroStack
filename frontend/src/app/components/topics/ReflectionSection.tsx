import { useState } from 'react';
import { NeoCard } from '../neo/NeoCard';
import { NeoButton } from '../neo/NeoButton';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface ReflectionSectionProps {
  content: {
    question: string;
    hint?: string;
  };
}

export function ReflectionSection({ content }: ReflectionSectionProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <NeoCard className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-l-4 border-purple-500">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/40">
          <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
            💭 Reflection Question
          </h4>
          <p className="text-base text-slate-700 dark:text-slate-300 mb-4">
            {content.question}
          </p>
          {content.hint && (
            <>
              <NeoButton
                size="sm"
                variant="secondary"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2"
              >
                {showHint ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Hint
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Hint
                  </>
                )}
              </NeoButton>
              {showHint && (
                <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    💡 {content.hint}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </NeoCard>
  );
}
