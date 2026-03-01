import { useEffect } from 'react';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'dense', title: 'Dense Layer', description: 'A layer of 16 neurons, all initially active and ready to process the input signal.' },
  { label: 'signal', title: 'Input Signal', description: 'Input data flows through weighted connections to produce pre-activation values at each neuron.' },
  { label: 'preact', title: 'Pre-Activation Values', description: 'Raw weighted sums before activation: a mix of positive and negative values.' },
  { label: 'relu', title: 'ReLU Activation', description: 'ReLU(x) = max(0, x). All negative values are set to zero, deactivating those neurons.', formula: 'ReLU(x) = max(0, x)' },
  { label: 'heatmap', title: 'Sparsity Heatmap', description: 'A bird\'s-eye view shows active (warm colors) vs. inactive (cold) neurons across the layer.' },
  { label: 'stats', title: 'Sparsity Statistics', description: 'Over 60% of neurons are inactive after ReLU — this sparsity enables computational optimizations.' },
];

// 4x4 grid of pre-activation values
const PRE_ACT = [
  [1.2, -0.8, 0.3, -1.5],
  [-0.2, 2.1, -0.9, 0.7],
  [0.5, -1.3, -0.1, 1.8],
  [-0.6, 0.4, -2.0, -0.3],
];
const POST_ACT = PRE_ACT.map(row => row.map(v => Math.max(0, v)));
const ACTIVE_COUNT = POST_ACT.flat().filter(v => v > 0).length;
const SPARSITY = ((16 - ACTIVE_COUNT) / 16 * 100).toFixed(1);

export default function SparseActivation({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Dense layer — all neurons glow
    tl.addLabel('dense')
      .fromTo('.neuron', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.04, duration: 0.3, ease: 'back.out(2)' })
      .to('.neuron-circle', { fill: theme.blue, fillOpacity: 0.5, duration: 0.4, stagger: 0.03 })
      .fromTo('.layer-label', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 2: Input signal
    tl.addLabel('signal')
      .fromTo('.connection', { strokeDashoffset: 50 }, { strokeDashoffset: 0, stagger: 0.02, duration: 0.4 })
      .fromTo('.input-node', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.3, ease: 'back.out(1.5)' });

    // Step 3: Pre-activation values appear
    tl.addLabel('preact')
      .fromTo('.preact-val', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.04, duration: 0.3 });

    // Step 4: ReLU — negative values go to zero
    tl.addLabel('relu');
    PRE_ACT.flat().forEach((v, i) => {
      if (v < 0) {
        tl.to(`.neuron-${i}`, { opacity: 0.2, duration: 0.3 }, 'relu')
          .to(`.neuron-circle-${i}`, { fill: theme.border, fillOpacity: 0.2, duration: 0.3 }, 'relu')
          .to(`.preact-val-${i}`, { opacity: 0.3, duration: 0.2 }, 'relu');
      } else {
        tl.to(`.neuron-circle-${i}`, { fill: theme.accent, fillOpacity: 0.7, duration: 0.3 }, 'relu');
      }
    });
    tl.fromTo('.relu-label', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' });

    // Step 5: Heatmap view
    tl.addLabel('heatmap')
      .fromTo('.heatmap-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.03, duration: 0.3, ease: 'back.out(1.5)' })
      .fromTo('.heatmap-title', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 6: Stats
    tl.addLabel('stats')
      .fromTo('.stat-counter', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo('.stat-bar-fill', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' })
      .fromTo('.stat-badge', { scale: 0 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });

    registerLabels();
    onReady(controls, ANNOTATIONS);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 450;
  const NEURON_R = 22;
  const NX = 160, NY = 55;
  const SPACING_X = 60, SPACING_Y = 88;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Input nodes */}
        {[0, 1, 2, 3].map(i => (
          <g key={`inp-${i}`} className="input-node" style={{ opacity: 0 }}>
            <circle cx={40} cy={100 + i * 80} r={12} fill={theme.green} fillOpacity={0.3}
              stroke={theme.green} strokeWidth={1.5} />
            <text x={40} y={104 + i * 80} textAnchor="middle" fill={theme.green} fontSize={9}>x{i + 1}</text>
          </g>
        ))}

        {/* Connections (input → neurons) */}
        {[0, 1, 2, 3].map(inp =>
          PRE_ACT.flat().map((_, n) => {
            const row = Math.floor(n / 4), col = n % 4;
            return (
              <line key={`con-${inp}-${n}`} className="connection"
                x1={55} y1={100 + inp * 80}
                x2={NX + col * SPACING_X - NEURON_R} y2={NY + row * SPACING_Y + NEURON_R}
                stroke={theme.border} strokeWidth={0.5} strokeDasharray="50" strokeDashoffset={50} opacity={0.3} />
            );
          })
        )}

        {/* Neuron grid (4x4) */}
        <text className="layer-label" x={NX + SPACING_X * 1.5} y={35} textAnchor="middle"
          fill={theme.textSecondary} fontSize={12} fontWeight="bold" style={{ opacity: 0 }}>Hidden Layer (16 neurons)</text>
        {PRE_ACT.flat().map((val, i) => {
          const row = Math.floor(i / 4), col = i % 4;
          const cx = NX + col * SPACING_X;
          const cy = NY + row * SPACING_Y + NEURON_R;
          return (
            <g key={`n-${i}`} className={`neuron neuron-${i}`} style={{ opacity: 0 }}>
              <circle className={`neuron-circle neuron-circle-${i}`} cx={cx} cy={cy} r={NEURON_R}
                fill={theme.blue} fillOpacity={0.3} stroke={theme.blue} strokeWidth={1.5} />
              <text className={`preact-val preact-val-${i}`} x={cx} y={cy + 4} textAnchor="middle"
                fill={theme.text} fontSize={10} fontWeight="500" style={{ opacity: 0 }}>
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* ReLU label */}
        <g className="relu-label" style={{ opacity: 0 }}>
          <rect x={NX + SPACING_X * 1.5 - 50} y={NY + 4 * SPACING_Y + 10} width={100} height={26} rx={13}
            fill={theme.accent} fillOpacity={0.15} stroke={theme.accent} strokeWidth={1.5} />
          <text x={NX + SPACING_X * 1.5} y={NY + 4 * SPACING_Y + 28} textAnchor="middle"
            fill={theme.accent} fontSize={11} fontWeight="bold">ReLU Applied</text>
        </g>

        {/* Heatmap (right side) */}
        <text className="heatmap-title" x={600} y={45} textAnchor="middle"
          fill={theme.textSecondary} fontSize={12} fontWeight="bold" style={{ opacity: 0 }}>Activation Heatmap</text>
        {POST_ACT.flat().map((val, i) => {
          const row = Math.floor(i / 4), col = i % 4;
          const maxVal = 2.1;
          const intensity = val / maxVal;
          const isActive = val > 0;
          return (
            <g key={`hm-${i}`} className="heatmap-cell" style={{ opacity: 0 }}>
              <rect x={510 + col * 48} y={55 + row * 48} width={44} height={44} rx={8}
                fill={isActive ? theme.accent : theme.border}
                fillOpacity={isActive ? 0.2 + intensity * 0.6 : 0.15}
                stroke={isActive ? theme.accent : theme.border} strokeWidth={1} />
              <text x={510 + col * 48 + 22} y={55 + row * 48 + 26} textAnchor="middle"
                fill={isActive ? theme.accent : theme.textSecondary} fontSize={11} fontWeight={isActive ? 'bold' : 'normal'}>
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Stats section */}
        <g>
          <text className="stat-counter" x={510} y={280} fill={theme.text} fontSize={13}
            fontWeight="bold" style={{ opacity: 0 }}>
            {SPARSITY}% neurons inactive
          </text>

          {/* Sparsity bar */}
          <rect x={510} y={295} width={220} height={18} rx={9} fill={theme.border} fillOpacity={0.2}
            stroke={theme.border} strokeWidth={1} />
          <rect className="stat-bar-fill" x={512} y={297} width={parseFloat(SPARSITY) / 100 * 216} height={14}
            rx={7} fill={theme.red} fillOpacity={0.5}
            style={{ transformOrigin: '512px center' }} />

          {/* Active vs Inactive legend */}
          <text className="stat-counter" x={510} y={335} fill={theme.textSecondary} fontSize={10}
            style={{ opacity: 0 }}>
            Active: {ACTIVE_COUNT}/16 | Inactive: {16 - ACTIVE_COUNT}/16
          </text>

          {/* Savings badge */}
          <g className="stat-badge" style={{ transformOrigin: '620px 380px' }}>
            <rect x={510} y={355} width={220} height={50} rx={12}
              fill={theme.green} fillOpacity={0.1} stroke={theme.green} strokeWidth={1.5} />
            <text x={620} y={378} textAnchor="middle" fill={theme.green} fontSize={11} fontWeight="bold">
              Sparse ops skip zero neurons
            </text>
            <text x={620} y={396} textAnchor="middle" fill={theme.green} fontSize={10}>
              → Faster inference & less memory
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
