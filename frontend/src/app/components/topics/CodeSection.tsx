import { lazy, Suspense, useState, useEffect } from 'react';
import { NeoCard } from '../neo/NeoCard';
import { NeoButton } from '../neo/NeoButton';
import { LoadingSkeleton } from '../feedback/LoadingSkeleton';
import { Check, Copy } from 'lucide-react';

// Lazy load syntax highlighter
const SyntaxHighlighter = lazy(() => 
  import('react-syntax-highlighter').then(mod => ({ default: mod.Prism }))
);

interface CodeSectionProps {
  content: {
    language: string;
    title?: string;
    code: string;
  };
}

// Dark code theme component (loaded separately to avoid top-level await)
function CodeHighlighter({ code, language }: { code: string; language: string }) {
  // Using dynamic import inside component
  const [theme, setTheme] = useState<any>(null);
  
  // Load theme on mount
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism').then((mod) => {
      setTheme(mod.vscDarkPlus);
    });
  }, []);

  if (!theme) {
    return <LoadingSkeleton className="h-64 rounded-none" />;
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={theme}
      customStyle={{
        margin: 0,
        borderRadius: 0,
        padding: '1.5rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
      showLineNumbers
    >
      {code}
    </SyntaxHighlighter>
  );
}

export function CodeSection({ content }: CodeSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NeoCard className="overflow-hidden">
      {content.title && (
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {content.title}
          </h3>
          <NeoButton
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </NeoButton>
        </div>
      )}
      <Suspense fallback={<LoadingSkeleton className="h-64 rounded-none" />}>
        <div className="relative">
          <CodeHighlighter code={content.code} language={content.language} />
          {!content.title && (
            <div className="absolute top-4 right-4">
              <NeoButton
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </NeoButton>
            </div>
          )}
        </div>
      </Suspense>
    </NeoCard>
  );
}