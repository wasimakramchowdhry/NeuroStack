import { lazy, type LazyExoticComponent } from 'react';
import type { TimelineControls } from './hooks/useGsapTimeline';
import type { Annotation } from './components/AnnotationOverlay';

export interface SceneProps {
  onReady: (controls: TimelineControls, annotations: Annotation[]) => void;
}

export const animationRegistry: Record<string, LazyExoticComponent<React.ComponentType<SceneProps>>> = {
  transformer_attention: lazy(() => import('./scenes/TransformerAttention')),
  matrix_multiplication: lazy(() => import('./scenes/MatrixMultiplication')),
  moe_router: lazy(() => import('./scenes/MoERouting')),
  quantization_viz: lazy(() => import('./scenes/Quantization')),
  sparse_activation: lazy(() => import('./scenes/SparseActivation')),
  cpu_vs_gpu: lazy(() => import('./scenes/CpuVsGpu')),
};

export const validAnimationIds = Object.keys(animationRegistry);
