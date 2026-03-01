import { useMemo } from 'react';

export interface AnimationTheme {
  bg: string;
  accent: string;
  accentSlate: string;
  success: string;
  text: string;
  textSecondary: string;
  border: string;
  shadowDark: string;
  shadowLight: string;
  // Semantic colors for animations
  blue: string;
  green: string;
  orange: string;
  red: string;
  purple: string;
}

export function useAnimationTheme(): AnimationTheme {
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const get = (prop: string) => cs.getPropertyValue(prop).trim();
    const isDark = document.documentElement.classList.contains('dark');

    return {
      bg: get('--neo-bg') || (isDark ? '#1a1d2e' : '#EDF1F4'),
      accent: get('--neo-accent-orange') || '#FF7A30',
      accentSlate: get('--neo-accent-slate') || '#4A4D57',
      success: get('--neo-accent-success') || '#22C55E',
      text: get('--neo-text-primary') || (isDark ? '#f1f5f9' : '#1E293B'),
      textSecondary: get('--neo-text-secondary') || '#64748B',
      border: isDark ? '#334155' : '#CBD5E1',
      shadowDark: get('--neo-shadow-dark') || '#cbced1',
      shadowLight: get('--neo-shadow-light') || '#ffffff',
      blue: isDark ? '#60A5FA' : '#3B82F6',
      green: isDark ? '#4ADE80' : '#22C55E',
      orange: isDark ? '#FB923C' : '#F97316',
      red: isDark ? '#F87171' : '#EF4444',
      purple: isDark ? '#A78BFA' : '#8B5CF6',
    };
  }, []);
}
