export interface Annotation {
  label: string;
  title: string;
  description: string;
  formula?: string;
}

interface AnnotationOverlayProps {
  annotations: Annotation[];
  currentLabel: string;
  labels: string[];
}

export function AnnotationOverlay({ annotations, currentLabel, labels }: AnnotationOverlayProps) {
  const currentIdx = labels.indexOf(currentLabel);
  const annotation = annotations.find(a => a.label === currentLabel);

  if (!annotation && currentIdx < 0) {
    // Show first annotation as default
    const first = annotations[0];
    if (!first) return null;
    return <AnnotationContent annotation={first} step={1} total={annotations.length} />;
  }

  if (!annotation) return null;

  const step = annotations.findIndex(a => a.label === currentLabel) + 1;

  return <AnnotationContent annotation={annotation} step={step} total={annotations.length} />;
}

function AnnotationContent({ annotation, step, total }: {
  annotation: Annotation;
  step: number;
  total: number;
}) {
  return (
    <div className="px-4 py-3 rounded-xl bg-[var(--neo-bg)] shadow-[inset_2px_2px_5px_var(--neo-shadow-dark),inset_-2px_-2px_5px_var(--neo-shadow-light)]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-[var(--neo-accent-orange)] bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
          Step {step} of {total}
        </span>
      </div>
      <h4 className="text-sm font-bold text-[var(--neo-text-primary)] mb-1">
        {annotation.title}
      </h4>
      <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed">
        {annotation.description}
      </p>
      {annotation.formula && (
        <div className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-[var(--neo-text-primary)]">
          {annotation.formula}
        </div>
      )}
    </div>
  );
}
