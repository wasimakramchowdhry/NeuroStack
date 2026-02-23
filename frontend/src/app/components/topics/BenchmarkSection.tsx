import { NeoCard } from '../neo/NeoCard';
import { BarChart3 } from 'lucide-react';

interface BenchmarkSectionProps {
  content: {
    title?: string;
    data: Array<{ metric: string; value: string | number }>;
  };
}

export function BenchmarkSection({ content }: BenchmarkSectionProps) {
  return (
    <NeoCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        {content.title && (
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {content.title}
          </h3>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Metric
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {content.data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  {row.metric}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-slate-800 dark:text-slate-200">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeoCard>
  );
}
