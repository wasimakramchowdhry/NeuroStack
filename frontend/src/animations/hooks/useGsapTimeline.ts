import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';

export interface TimelineControls {
  play: () => void;
  pause: () => void;
  restart: () => void;
  stepForward: () => void;
  stepBack: () => void;
  setSpeed: (speed: number) => void;
  isPlaying: boolean;
  progress: number;
  currentLabel: string;
  speed: number;
  labels: string[];
}

export function useGsapTimeline() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [speed, setSpeedState] = useState(1);
  const [labels, setLabels] = useState<string[]>([]);
  const rafRef = useRef<number>(0);

  const createTimeline = useCallback((config?: gsap.TimelineVars) => {
    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({
      paused: true,
      ...config,
      onUpdate: () => {
        setProgress(tl.progress());
        // Find current label
        const lbls = tl.labels;
        let current = '';
        for (const [name, time] of Object.entries(lbls)) {
          if (tl.time() >= time) current = name;
        }
        setCurrentLabel(current);
      },
      onComplete: () => {
        setIsPlaying(false);
      },
    });

    timelineRef.current = tl;
    return tl;
  }, []);

  // Extract labels after timeline is built
  const registerLabels = useCallback(() => {
    if (timelineRef.current) {
      const lbls = Object.keys(timelineRef.current.labels);
      setLabels(lbls);
    }
  }, []);

  const play = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const restart = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.restart();
      timelineRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

  const stepForward = useCallback(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    tl.pause();
    setIsPlaying(false);

    const lblEntries = Object.entries(tl.labels).sort((a, b) => a[1] - b[1]);
    const currentTime = tl.time();
    const next = lblEntries.find(([, time]) => time > currentTime + 0.01);
    if (next) {
      tl.seek(next[1]);
    } else {
      tl.progress(1);
    }
  }, []);

  const stepBack = useCallback(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    tl.pause();
    setIsPlaying(false);

    const lblEntries = Object.entries(tl.labels).sort((a, b) => a[1] - b[1]);
    const currentTime = tl.time();
    const prev = [...lblEntries].reverse().find(([, time]) => time < currentTime - 0.01);
    if (prev) {
      tl.seek(prev[1]);
    } else {
      tl.seek(0);
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(newSpeed);
      setSpeedState(newSpeed);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const controls: TimelineControls = {
    play,
    pause,
    restart,
    stepForward,
    stepBack,
    setSpeed,
    isPlaying,
    progress,
    currentLabel,
    speed,
    labels,
  };

  return { containerRef, createTimeline, registerLabels, controls, timelineRef };
}
