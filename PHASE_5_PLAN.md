# 🎬 NeuroStack — Phase 5 Plan: Visual Learning & Animations

> **Timeline**: Week 9–10
> **Goal**: Build a library of GSAP-powered, interactive educational animations that map directly to topic content. Each animation visually explains a core AI/ML concept with play/pause/step controls, annotation overlays, and seamless integration into the existing Topic Viewer. Animations are lazy-loaded, dark/light mode compatible, and performant on the target hardware (i9-12900H, 32GB RAM, 8GB VRAM).

---

## 🏗 Sub-Phase 5.1: Animation Infrastructure & Architecture

### 1. Install GSAP + Plugins

```bash
cd frontend
npm install gsap @gsap/react
```

GSAP plugins to register globally:
- **ScrollTrigger** — trigger animations as user scrolls through topic content.
- **MotionPathPlugin** — animate tokens/data along curved paths (e.g., routing in MoE).
- **DrawSVGPlugin** (free via GSAP Club) — progressive SVG line drawing for architecture diagrams.

### 2. Animation Registry Pattern

Instead of hardcoding animations per topic, we use a **registry** that maps `animation_id` strings (stored in `TopicContent.content_json.animation_id`) to lazy-loaded React components.

```
frontend/src/
├── animations/
│   ├── registry.ts                    # Central map: animation_id → lazy(() => import(...))
│   ├── components/
│   │   ├── AnimationScene.tsx         # Reusable wrapper (controls, annotations, theme)
│   │   ├── AnimationControls.tsx      # Play/Pause/Step/Reset/Speed buttons
│   │   └── AnnotationOverlay.tsx      # Step-synced text annotations
│   ├── scenes/
│   │   ├── TransformerAttention.tsx   # Scene: QKV flow, softmax, multi-head
│   │   ├── MatrixMultiplication.tsx   # Scene: Row-column dot product
│   │   ├── MoERouting.tsx            # Scene: Token → Expert assignment
│   │   ├── Quantization.tsx          # Scene: Float32 → Int8 compression
│   │   ├── SparseActivation.tsx      # Scene: Neuron activation heatmap
│   │   └── CpuVsGpu.tsx             # Scene: Parallel vs sequential race
│   └── hooks/
│       ├── useGsapTimeline.ts        # Hook: create/manage GSAP timeline
│       └── useAnimationTheme.ts      # Hook: resolve colors from current theme
```

### 3. Animation Registry (`registry.ts`)

| `animation_id` | Component | Description |
|-----------------|-----------|-------------|
| `transformer_attention` | `TransformerAttention` | Self-attention mechanism: Q, K, V matrices, dot product scores, softmax normalization, multi-head split/concat |
| `matrix_multiplication` | `MatrixMultiplication` | Step-by-step row × column dot product with number highlighting |
| `moe_router` | `MoERouting` | Token flows through router network, top-k expert selection, weighted combination |
| `quantization_viz` | `Quantization` | Float32 bit pattern → Int8 compression with precision loss meter and accuracy impact |
| `sparse_activation` | `SparseActivation` | Neural network layer with ReLU activations, heatmap showing sparsity patterns |
| `cpu_vs_gpu` | `CpuVsGpu` | Side-by-side race: sequential CPU cores vs massively parallel GPU threads |

---

## 🎨 Sub-Phase 5.2: Reusable Animation Components

### 1. `AnimationScene` — The Universal Wrapper

Every animation scene is wrapped in `AnimationScene`, which provides:

| Feature | Implementation |
|---------|---------------|
| **Canvas container** | Fixed aspect ratio (16:9) SVG/Canvas container with responsive scaling |
| **Controls bar** | Play, Pause, Step Forward, Step Back, Reset, Speed (0.5x, 1x, 2x) |
| **Annotation panel** | Side or bottom panel showing text explanation synced to timeline progress |
| **Theme awareness** | Reads CSS variables (`--neo-bg`, `--neo-shadow-dark`, `--neo-shadow-light`, `--neo-accent-orange`) to adapt colors |
| **Loading state** | Skeleton loader while the lazy chunk downloads |
| **Error boundary** | Graceful fallback if animation fails to load (shows static diagram + description) |
| **Fullscreen toggle** | Expand animation to fullscreen for better viewing |

**Props interface:**
```typescript
interface AnimationSceneProps {
  animationId: string;
  fallbackImage?: string;        // Static image if animation fails
  fallbackDescription?: string;  // Text description as last resort
  autoPlay?: boolean;            // Default: false
  className?: string;
}
```

### 2. `AnimationControls` Component

Neumorphic-styled control bar matching the Neo-tactoid design system:

| Control | Icon | Action |
|---------|------|--------|
| Play/Pause | `Play` / `Pause` (Lucide) | `timeline.play()` / `timeline.pause()` |
| Step Forward | `SkipForward` | `timeline.tweenTo(nextLabel)` |
| Step Back | `SkipBack` | `timeline.tweenTo(prevLabel)` |
| Reset | `RotateCcw` | `timeline.restart().pause()` |
| Speed | `Gauge` | Cycle through 0.5x → 1x → 2x via `timeline.timeScale()` |
| Fullscreen | `Maximize2` | Toggle fullscreen via Fullscreen API |

### 3. `AnnotationOverlay` Component

Each animation timeline has labeled steps. The overlay shows:
- **Step indicator**: "Step 3 of 8"
- **Title**: Bold heading for current step (e.g., "Computing Attention Scores")
- **Description**: 1–2 sentence explanation of what's happening visually
- **Math notation**: Optional KaTeX-rendered formula for the current step

Annotations are defined as an array synced to GSAP timeline labels:
```typescript
interface Annotation {
  label: string;          // GSAP timeline label
  title: string;          // Step title
  description: string;    // Explanation text
  formula?: string;       // Optional LaTeX formula
}
```

---

## ⚡ Sub-Phase 5.3: Animation Scenes (Detailed Specs)

### Scene 1: Transformer Attention (`TransformerAttention.tsx`)

**Concept**: Visualize how self-attention works inside a Transformer block.

**Timeline Steps:**
1. **Input Embedding** — Show 4 token boxes ("The", "cat", "sat", "down") entering from the left
2. **Linear Projections** — Each token splits into 3 colored vectors: Q (blue), K (green), V (orange)
3. **Score Computation** — Q and K^T dot products animate with number bubbles showing scores
4. **Scaling** — Scores divide by √d_k with a shrinking animation
5. **Softmax** — Bars normalize to sum = 1.0, highlighted proportionally
6. **Weighted Sum** — V vectors scale by attention weights and combine into output
7. **Multi-Head Split** — View zooms out to show 4 parallel attention heads
8. **Concat + Linear** — Heads merge and pass through final linear layer

**SVG Elements**: Token rectangles, arrow paths, matrix grids, bar charts, gradient fills.

**Annotations Array** (8 steps matching above).

### Scene 2: Matrix Multiplication (`MatrixMultiplication.tsx`)

**Concept**: Step-by-step visualization of how two matrices multiply.

**Timeline Steps:**
1. **Setup** — Two matrices A (3×2) and B (2×3) appear with labeled cells
2. **Row Selection** — Row 1 of A highlights in blue
3. **Column Selection** — Column 1 of B highlights in green
4. **Element-wise Multiply** — Corresponding elements pulse and show multiplication
5. **Sum** — Products flow into result cell C[1,1] with addition animation
6. **Repeat** — Automated sweep through remaining cells (accelerating)
7. **Complete** — Full result matrix C (3×3) glows with all values

**SVG Elements**: Grid cells, number text, highlight rectangles, flow arrows.

### Scene 3: Mixture of Experts Routing (`MoERouting.tsx`)

**Concept**: Visualize how MoE models route tokens to specialist sub-networks.

**Timeline Steps:**
1. **Token Stream** — 6 tokens flow in from left as colored circles
2. **Router Network** — Tokens pass through a small neural network (gating function)
3. **Score Distribution** — Each token shows a bar chart of expert scores (4 experts)
4. **Top-K Selection** — Top 2 experts highlighted per token, others fade
5. **Expert Processing** — Tokens route to their selected expert sub-networks (animated paths)
6. **Weighted Combination** — Expert outputs multiply by routing weights
7. **Output Merge** — Combined outputs flow to the right as the final result

**SVG Elements**: Circles (tokens), rectangles (experts), curved MotionPath arrows, bar charts.

### Scene 4: Quantization (`Quantization.tsx`)

**Concept**: Show how model weights are compressed from Float32 to Int8.

**Timeline Steps:**
1. **Original Weights** — Grid of Float32 values (e.g., 0.7823, -1.2341, 0.0012)
2. **Bit Representation** — Zoom into one value showing 32 bits (sign, exponent, mantissa)
3. **Scale Factor** — Calculate scale = max(abs(weights)) / 127
4. **Quantize** — Values snap to nearest integer with rounding animation
5. **Int8 Grid** — Show compressed 8-bit representation (much smaller visual footprint)
6. **Precision Loss Meter** — Animated gauge showing accuracy before/after (e.g., 99.2% → 98.8%)
7. **Memory Savings** — Bar chart: 4GB → 1GB model size with celebration effect

**SVG Elements**: Bit grids, number cells, gauge meter, bar chart, scaling arrows.

### Scene 5: Sparse Activation (`SparseActivation.tsx`)

**Concept**: Show how ReLU creates sparsity in neural network activations.

**Timeline Steps:**
1. **Dense Layer** — Show a layer of 16 neurons all active (glowing)
2. **Input Signal** — Data flows through weighted connections
3. **Pre-Activation** — Raw values appear: mix of positive and negative numbers
4. **ReLU Applied** — Negative values animate to 0, neurons dim/deactivate
5. **Heatmap View** — Bird's-eye heatmap grid showing active (hot) vs inactive (cold) neurons
6. **Sparsity Counter** — Animated counter: "62.5% neurons inactive" → computational savings

**SVG Elements**: Circle neurons, connection lines with varying thickness, heatmap grid, counter text.

### Scene 6: CPU vs GPU (`CpuVsGpu.tsx`)

**Concept**: Race visualization comparing sequential CPU vs parallel GPU computation.

**Timeline Steps:**
1. **Task Setup** — 64 small computation blocks arranged in a grid
2. **CPU Side** — 4 large cores process blocks one-by-one (sequential, with some parallelism)
3. **GPU Side** — 64 tiny cores process ALL blocks simultaneously
4. **Race Animation** — Both sides run, GPU finishes dramatically faster
5. **Stats Display** — Side-by-side timing comparison with speedup factor
6. **Use Case** — Text overlay: "This is why GPUs dominate deep learning"

**SVG Elements**: Core rectangles, task block grid, progress bars, timer counters.

---

## 🔌 Sub-Phase 5.4: Integration with Topic Viewer

### 1. Update `VisualSection.tsx`

The existing `VisualSection` component (currently a placeholder) will be updated to:

```typescript
// Resolve animation from registry
const AnimationComponent = animationRegistry[content.animation_id];

// Render with AnimationScene wrapper
return (
  <AnimationScene
    animationId={content.animation_id}
    fallbackImage={content.fallback_image}
    autoPlay={false}
  />
);
```

### 2. Update Topic Content JSON Schema

The `visual` section type in `TopicContent.content_json` already supports:
```json
{
  "animation_id": "transformer_attention",
  "fallback_image": "/assets/attention.png"
}
```

Add optional fields for Phase 5:
```json
{
  "animation_id": "transformer_attention",
  "fallback_image": "/assets/attention.png",
  "fallback_description": "Diagram showing how self-attention computes weighted sums of value vectors",
  "auto_play": false,
  "caption": "Figure 1: Self-Attention Mechanism in Transformers"
}
```

### 3. Lazy Loading Strategy

Each scene is code-split via dynamic `import()`:
```typescript
// registry.ts
export const animationRegistry: Record<string, React.LazyExoticComponent<any>> = {
  transformer_attention: lazy(() => import('./scenes/TransformerAttention')),
  matrix_multiplication: lazy(() => import('./scenes/MatrixMultiplication')),
  moe_router: lazy(() => import('./scenes/MoERouting')),
  quantization_viz: lazy(() => import('./scenes/Quantization')),
  sparse_activation: lazy(() => import('./scenes/SparseActivation')),
  cpu_vs_gpu: lazy(() => import('./scenes/CpuVsGpu')),
};
```

This ensures:
- Only the animation the user views is downloaded
- Main bundle size is unaffected
- Vite automatically creates separate chunks per scene

---

## 🌙 Sub-Phase 5.5: Theme Compatibility

### Dark/Light Mode Color Mapping

Every animation reads colors from CSS custom properties, never hardcodes hex values:

| Element | Light Mode | Dark Mode | CSS Variable |
|---------|------------|-----------|--------------|
| Background | `#EDF1F4` | `#1a1a2e` | `--neo-bg` |
| Primary accent | `#FF7A30` | `#FF8C42` | `--neo-accent-orange` |
| Text | `#1E293B` | `#E2E8F0` | `--neo-text-primary` |
| Grid lines | `#CBD5E1` | `#334155` | `--neo-border` |
| Highlight | `#3B82F6` | `#60A5FA` | `--neo-accent-blue` |
| Success | `#22C55E` | `#4ADE80` | `--neo-accent-success` |
| Shadow dark | `#cbced1` | `#111827` | `--neo-shadow-dark` |
| Shadow light | `#ffffff` | `#2a2a4a` | `--neo-shadow-light` |

### `useAnimationTheme` Hook

```typescript
function useAnimationTheme() {
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    bg: computedStyle.getPropertyValue('--neo-bg').trim(),
    accent: computedStyle.getPropertyValue('--neo-accent-orange').trim(),
    text: computedStyle.getPropertyValue('--neo-text-primary').trim(),
    // ... all mapped colors
  };
}
```

---

## 🧪 Sub-Phase 5.6: Performance & Optimization

### Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Animation chunk size | < 50KB gzipped per scene | Vite build analysis |
| Time to interactive | < 200ms after chunk loads | Performance.mark() |
| Frame rate | Stable 60fps during playback | Chrome DevTools Performance tab |
| Memory usage | < 30MB per active animation | Chrome DevTools Memory tab |
| Idle CPU | ~0% when paused | GSAP timeline paused state |

### Optimization Techniques

1. **SVG over Canvas** — Use SVG for most scenes (better accessibility, easier theming). Reserve Canvas only for particle-heavy scenes.
2. **`will-change` hints** — Apply `will-change: transform` to animated elements for GPU compositing.
3. **Timeline cleanup** — Kill timelines on component unmount via `useEffect` cleanup to prevent memory leaks.
4. **Intersection Observer** — Pause animations when scrolled out of viewport.
5. **Reduced motion** — Respect `prefers-reduced-motion` media query: show static diagrams instead.

---

## 🔄 Integration & Verification Plan

### 1. Unit Tests (Vitest)
- **Registry test**: Verify all `animation_id` strings in the database resolve to a component in the registry.
- **Controls test**: Verify play/pause/step buttons correctly call timeline methods.
- **Theme test**: Mock CSS variables and verify `useAnimationTheme` returns correct values.

### 2. Visual Regression (Optional)
- Capture screenshots of each animation at key timeline positions.
- Compare against baselines to detect unintended visual changes.

### 3. Integration Test
- Navigate to a Topic containing a `visual` section with `animation_id: "transformer_attention"`.
- Verify the `VisualSection` renders the `AnimationScene` wrapper.
- Verify lazy chunk is fetched (network tab).
- Verify play/pause/step controls function.
- Verify annotations sync with timeline progress.
- Switch theme (dark ↔ light) and verify colors update live.

### 4. Performance Audit
- Run Lighthouse on a topic page with an animation.
- Verify no layout shifts (CLS < 0.1) when animation loads.
- Verify bundle size impact: main bundle unchanged, animation chunks < 50KB each.

### 5. Accessibility Check
- Verify `prefers-reduced-motion` fallback renders static image.
- Verify controls are keyboard-navigable (Tab, Enter, Space).
- Verify annotation text is screen-reader accessible.
- Verify sufficient color contrast in both themes.

---

## 🛠️ Step-by-Step Implementation Guide

### Step 1: Install Dependencies & Setup Structure
1. Install GSAP: `cd frontend && npm install gsap @gsap/react`
2. Create `frontend/src/animations/` directory structure as defined above.
3. Register GSAP plugins in app entry point (`main.tsx`).

### Step 2: Build `AnimationScene` Wrapper
1. Create `AnimationScene.tsx` with Suspense boundary and error boundary.
2. Create `AnimationControls.tsx` with Neo-tactoid styled buttons.
3. Create `AnnotationOverlay.tsx` with step text and optional KaTeX rendering.
4. Create `useGsapTimeline.ts` hook for timeline lifecycle management.
5. Create `useAnimationTheme.ts` hook for reading CSS variables.

### Step 3: Build First Animation (Transformer Attention)
1. Create SVG layout with token boxes, arrow paths, matrix grids.
2. Build GSAP timeline with labeled steps matching the 8 annotation steps.
3. Wire controls to timeline via the `useGsapTimeline` hook.
4. Test in isolation with a Storybook story or standalone route.

### Step 4: Build Remaining Animations
1. Matrix Multiplication scene (simpler, good second target).
2. MoE Routing scene (uses MotionPathPlugin for curved token paths).
3. Quantization scene (bit grids and gauge meter).
4. Sparse Activation scene (heatmap grid).
5. CPU vs GPU scene (race animation with timers).

### Step 5: Create Animation Registry
1. Build `registry.ts` mapping `animation_id` → `lazy(() => import(...))`.
2. Add type safety: export list of valid animation IDs.

### Step 6: Integrate into Topic Viewer
1. Update `VisualSection.tsx` to look up animations from registry.
2. Render `AnimationScene` wrapper with fallback handling.
3. Test with existing seeded topics that have `visual` section types.

### Step 7: Theme & Accessibility
1. Verify all animations use CSS variables via `useAnimationTheme`.
2. Add `prefers-reduced-motion` check — render static fallback.
3. Add keyboard navigation to controls.
4. Test in both light and dark modes.

### Step 8: Performance Validation
1. Run `npx vite-bundle-visualizer` to check chunk sizes.
2. Profile animation playback in Chrome DevTools (target 60fps).
3. Verify timeline cleanup on unmount (no memory leaks).
4. Run Lighthouse audit on topic page with animation.

---

## 🏆 Phase 5 Deliverables Checklist

- [ ] Infrastructure: GSAP installed and registered with ScrollTrigger, MotionPathPlugin.
- [ ] Infrastructure: `AnimationScene` wrapper with controls, annotations, theme, loading, error boundary.
- [ ] Infrastructure: `AnimationControls` component with play/pause/step/reset/speed/fullscreen.
- [ ] Infrastructure: `AnnotationOverlay` component with step-synced text and optional KaTeX.
- [ ] Infrastructure: `useGsapTimeline` hook managing timeline lifecycle and cleanup.
- [ ] Infrastructure: `useAnimationTheme` hook resolving CSS custom properties for both themes.
- [ ] Infrastructure: `registry.ts` mapping animation IDs to lazy-loaded components.
- [ ] Scene: `TransformerAttention` — 8-step self-attention visualization.
- [ ] Scene: `MatrixMultiplication` — 7-step dot product visualization.
- [ ] Scene: `MoERouting` — 7-step mixture of experts routing visualization.
- [ ] Scene: `Quantization` — 7-step Float32 → Int8 compression visualization.
- [ ] Scene: `SparseActivation` — 6-step ReLU sparsity heatmap visualization.
- [ ] Scene: `CpuVsGpu` — 6-step parallel vs sequential race visualization.
- [ ] Integration: `VisualSection.tsx` updated to resolve and render animations from registry.
- [ ] Theme: All animations read colors from CSS variables, support dark/light modes.
- [ ] Accessibility: `prefers-reduced-motion` fallback to static images.
- [ ] Accessibility: Keyboard-navigable controls (Tab, Enter, Space).
- [ ] Performance: Each animation chunk < 50KB gzipped.
- [ ] Performance: Stable 60fps during playback.
- [ ] Performance: Timeline cleanup on unmount (no memory leaks).
- [ ] Tests: Registry resolution test, controls unit test, theme hook test.
- [ ] Tests: Integration test — topic page loads animation via VisualSection.
