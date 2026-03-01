import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge, Maximize2, Minimize2 } from 'lucide-react';
import type { TimelineControls } from '../hooks/useGsapTimeline';

interface AnimationControlsProps {
  controls: TimelineControls;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const SPEEDS = [0.5, 1, 2];

export function AnimationControls({ controls, isFullscreen, onToggleFullscreen }: AnimationControlsProps) {
  const { isPlaying, play, pause, stepForward, stepBack, restart, setSpeed, speed, progress } = controls;

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-[var(--neo-bg)] shadow-[inset_2px_2px_5px_var(--neo-shadow-dark),inset_-2px_-2px_5px_var(--neo-shadow-light)]">
      {/* Left: Progress bar */}
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mr-3">
        <div
          className="h-full rounded-full bg-[var(--neo-accent-orange)] transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Center: Playback controls */}
      <div className="flex items-center gap-1">
        <ControlButton onClick={restart} title="Reset">
          <RotateCcw className="w-3.5 h-3.5" />
        </ControlButton>
        <ControlButton onClick={stepBack} title="Step Back">
          <SkipBack className="w-3.5 h-3.5" />
        </ControlButton>
        <ControlButton onClick={isPlaying ? pause : play} title={isPlaying ? 'Pause' : 'Play'} primary>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </ControlButton>
        <ControlButton onClick={stepForward} title="Step Forward">
          <SkipForward className="w-3.5 h-3.5" />
        </ControlButton>
      </div>

      {/* Right: Speed + Fullscreen */}
      <div className="flex items-center gap-1 ml-3">
        <ControlButton onClick={cycleSpeed} title={`Speed: ${speed}x`}>
          <Gauge className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold ml-0.5">{speed}x</span>
        </ControlButton>
        <ControlButton onClick={onToggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({ children, onClick, title, primary }: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center rounded-full transition-all duration-200
        ${primary ? 'w-9 h-9' : 'w-7 h-7'}
        ${primary
          ? 'bg-[var(--neo-accent-orange)] text-white shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)] hover:shadow-[3px_3px_6px_var(--neo-shadow-dark),-3px_-3px_6px_var(--neo-shadow-light)]'
          : 'bg-[var(--neo-bg)] text-[var(--neo-text-secondary)] shadow-[2px_2px_4px_var(--neo-shadow-dark),-2px_-2px_4px_var(--neo-shadow-light)] hover:text-[var(--neo-text-primary)]'
        }
        active:shadow-[inset_1px_1px_3px_var(--neo-shadow-dark),inset_-1px_-1px_3px_var(--neo-shadow-light)]
      `}
    >
      {children}
    </button>
  );
}
