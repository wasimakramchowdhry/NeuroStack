import { NeoCard } from '../neo/NeoCard';
import { Sparkles } from 'lucide-react';
import { AnimationScene } from '../../../animations/components/AnimationScene';
import { validAnimationIds } from '../../../animations/registry';

interface VisualSectionProps {
  content: {
    title?: string;
    description?: string;
    placeholderText?: string;
    animation_id?: string;
    fallback_image?: string;
    fallback_description?: string;
    auto_play?: boolean;
    caption?: string;
  };
}

export function VisualSection({ content }: VisualSectionProps) {
  // If an animation_id is provided and it exists in the registry, render the animation
  if (content.animation_id && validAnimationIds.includes(content.animation_id)) {
    return (
      <div className="space-y-2">
        <AnimationScene
          animationId={content.animation_id}
          fallbackImage={content.fallback_image}
          fallbackDescription={content.fallback_description || content.description}
          autoPlay={content.auto_play}
        />
        {content.caption && (
          <p className="text-xs text-center text-[var(--neo-text-secondary)] italic">
            {content.caption}
          </p>
        )}
      </div>
    );
  }

  // Fallback: placeholder card for visuals without animation_id
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
          {content.placeholderText || content.description || 'Interactive visualization coming soon'}
        </p>
      </div>
    </NeoCard>
  );
}
