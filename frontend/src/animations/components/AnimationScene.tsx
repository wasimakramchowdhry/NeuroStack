import { Suspense, useRef, useCallback, useState, Component, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { animationRegistry } from '../registry';
import { AnimationControls } from './AnimationControls';
import { AnnotationOverlay, type Annotation } from './AnnotationOverlay';
import type { TimelineControls } from '../hooks/useGsapTimeline';

interface AnimationSceneProps {
  animationId: string;
  fallbackImage?: string;
  fallbackDescription?: string;
  autoPlay?: boolean;
  className?: string;
}

// Error boundary for animation failures
class AnimationErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function AnimationScene({
  animationId,
  fallbackImage,
  fallbackDescription,
  autoPlay = false,
  className = '',
}: AnimationSceneProps) {
  const AnimationComponent = animationRegistry[animationId];
  const [controls, setControls] = useState<TimelineControls | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleControlsReady = useCallback((c: TimelineControls, a: Annotation[]) => {
    setControls(c);
    setAnnotations(a);
    if (autoPlay) c.play();
  }, [autoPlay]);

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const fallbackUI = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Sparkles className="w-12 h-12 text-orange-500 mb-4" />
      {fallbackImage && <img src={fallbackImage} alt="" className="max-w-full rounded-lg mb-4" />}
      <p className="text-sm text-[var(--neo-text-secondary)]">
        {fallbackDescription || `Animation "${animationId}" could not be loaded.`}
      </p>
    </div>
  );

  if (!AnimationComponent || prefersReducedMotion) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-[var(--neo-bg)] shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light)] ${className}`}>
        {fallbackUI}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`rounded-2xl overflow-hidden bg-[var(--neo-bg)] shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light)] ${className} ${isFullscreen ? 'flex flex-col' : ''}`}
    >
      {/* SVG Canvas Area */}
      <div className={`relative ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
        <AnimationErrorBoundary fallback={fallbackUI}>
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <Sparkles className="w-8 h-8 text-orange-400 mb-2" />
                  <span className="text-xs text-[var(--neo-text-secondary)]">Loading animation...</span>
                </div>
              </div>
            }
          >
            <AnimationComponent onReady={handleControlsReady} />
          </Suspense>
        </AnimationErrorBoundary>
      </div>

      {/* Annotation + Controls */}
      <div className="p-3 space-y-2">
        {controls && annotations.length > 0 && (
          <AnnotationOverlay
            annotations={annotations}
            currentLabel={controls.currentLabel}
            labels={controls.labels}
          />
        )}
        {controls && (
          <AnimationControls
            controls={controls}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
      </div>
    </div>
  );
}
