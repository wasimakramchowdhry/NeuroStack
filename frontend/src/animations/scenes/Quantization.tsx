import { useEffect } from 'react';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'weights', title: 'Original Float32 Weights', description: 'Model weights are stored as 32-bit floating point numbers with high precision.' },
  { label: 'bits', title: 'Bit Representation', description: 'Each Float32 value uses 32 bits: 1 sign bit, 8 exponent bits, and 23 mantissa bits.' },
  { label: 'scale', title: 'Compute Scale Factor', description: 'A scale factor is computed to map the float range to the int8 range [-128, 127].', formula: 'scale = max(|weights|) / 127' },
  { label: 'quantize', title: 'Quantize to Int8', description: 'Each weight is divided by the scale factor and rounded to the nearest integer.', formula: 'q = round(weight / scale)' },
  { label: 'int8', title: 'Int8 Representation', description: 'The weights now fit in just 8 bits each — a 4× reduction in memory per parameter.' },
  { label: 'precision', title: 'Precision Loss Analysis', description: 'Quantization introduces small rounding errors. Typical accuracy loss is under 1% for well-calibrated models.' },
  { label: 'savings', title: 'Memory Savings', description: 'Model size drops from 4GB to 1GB — enabling deployment on edge devices and reducing inference cost.' },
];

const FLOAT_WEIGHTS = [0.7823, -1.2341, 0.0012, 1.5670, -0.4321, 0.9876, -0.1234, 0.3456, 1.2341];
const SCALE = 1.567 / 127;
const INT8_WEIGHTS = FLOAT_WEIGHTS.map(w => Math.round(w / SCALE));

export default function Quantization({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Float32 weights grid
    tl.addLabel('weights')
      .fromTo('.f32-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'back.out(2)' })
      .fromTo('.f32-title', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 2: Bit representation
    tl.addLabel('bits')
      .fromTo('.bit-row', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo('.bit-cell', { scale: 0 }, { scale: 1, stagger: 0.02, duration: 0.2 })
      .fromTo('.bit-label', { opacity: 0 }, { opacity: 1, stagger: 0.15, duration: 0.3 });

    // Step 3: Scale factor
    tl.addLabel('scale')
      .fromTo('.scale-formula', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo('.scale-arrow', { strokeDashoffset: 80 }, { strokeDashoffset: 0, duration: 0.5 });

    // Step 4: Quantize
    tl.addLabel('quantize')
      .to('.f32-cell', { scale: 0.8, opacity: 0.4, stagger: 0.03, duration: 0.3 })
      .fromTo('.quant-arrow', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' });

    // Step 5: Int8 grid
    tl.addLabel('int8')
      .fromTo('.i8-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'back.out(2)' })
      .fromTo('.i8-title', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 6: Precision loss meter
    tl.addLabel('precision')
      .fromTo('.gauge-bg', { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo('.gauge-fill-before', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' })
      .fromTo('.gauge-fill-after', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .fromTo('.gauge-label', { opacity: 0 }, { opacity: 1, stagger: 0.15, duration: 0.3 });

    // Step 7: Memory savings
    tl.addLabel('savings')
      .fromTo('.mem-bar-before', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' })
      .fromTo('.mem-bar-after', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .fromTo('.mem-label', { opacity: 0, y: 5 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3 })
      .fromTo('.savings-badge', { scale: 0 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });

    registerLabels();
    onReady(controls, ANNOTATIONS);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 450;
  const CELL_SIZE = 52;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Float32 Weights Grid (3x3) */}
        <text className="f32-title" x={120} y={35} textAnchor="middle" fill={theme.textSecondary}
          fontSize={12} fontWeight="bold" style={{ opacity: 0 }}>Float32 Weights</text>
        {FLOAT_WEIGHTS.map((w, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          return (
            <g key={`f32-${i}`} className="f32-cell" style={{ opacity: 0 }}>
              <rect x={30 + col * (CELL_SIZE + 4)} y={45 + row * (CELL_SIZE + 4)} width={CELL_SIZE} height={CELL_SIZE}
                rx={8} fill={theme.bg} stroke={theme.blue} strokeWidth={1.5} />
              <text x={30 + col * (CELL_SIZE + 4) + CELL_SIZE / 2} y={45 + row * (CELL_SIZE + 4) + CELL_SIZE / 2 + 4}
                textAnchor="middle" fill={theme.text} fontSize={10} fontWeight="500">
                {w.toFixed(4)}
              </text>
            </g>
          );
        })}

        {/* Bit representation row */}
        <g className="bit-row" style={{ opacity: 0 }}>
          <text x={120} y={230} textAnchor="middle" fill={theme.textSecondary} fontSize={10}>
            0.7823 in Float32:
          </text>
          {/* Sign bit */}
          <rect className="bit-cell" x={30} y={240} width={14} height={18} rx={2}
            fill={theme.red} fillOpacity={0.3} stroke={theme.red} strokeWidth={1} />
          <text className="bit-label" x={37} y={270} textAnchor="middle" fill={theme.red} fontSize={8}
            style={{ opacity: 0 }}>Sign</text>
          {/* Exponent bits */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(b => (
            <rect key={`exp-${b}`} className="bit-cell" x={50 + b * 16} y={240} width={14} height={18} rx={2}
              fill={theme.blue} fillOpacity={0.3} stroke={theme.blue} strokeWidth={1} />
          ))}
          <text className="bit-label" x={114} y={270} textAnchor="middle" fill={theme.blue} fontSize={8}
            style={{ opacity: 0 }}>Exponent (8 bits)</text>
          {/* Mantissa bits (show first 8 of 23) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(b => (
            <rect key={`man-${b}`} className="bit-cell" x={182 + b * 16} y={240} width={14} height={18} rx={2}
              fill={theme.green} fillOpacity={0.3} stroke={theme.green} strokeWidth={1} />
          ))}
          <text className="bit-label" x={230} y={270} textAnchor="middle" fill={theme.green} fontSize={8}
            style={{ opacity: 0 }}>Mantissa (23 bits)...</text>
        </g>

        {/* Scale formula */}
        <text className="scale-formula" x={400} y={60} textAnchor="middle" fill={theme.accent}
          fontSize={12} fontWeight="bold" style={{ opacity: 0 }}>
          scale = 1.567 / 127 ≈ 0.01234
        </text>

        {/* Quantization arrow */}
        <g>
          <line className="scale-arrow" x1={240} y1={120} x2={410} y2={120}
            stroke={theme.accent} strokeWidth={2} strokeDasharray="80" strokeDashoffset={80}
            markerEnd="url(#arrowOrange)" />
          <rect className="quant-arrow" x={290} y={105} width={100} height={24} rx={12}
            fill={theme.accent} fillOpacity={0.15}
            style={{ transformOrigin: '290px center', transform: 'scaleX(0)' }} />
          <text x={340} y={121} textAnchor="middle" fill={theme.accent} fontSize={10} fontWeight="bold">
            ÷ scale → round
          </text>
        </g>

        {/* Int8 Weights Grid */}
        <text className="i8-title" x={560} y={35} textAnchor="middle" fill={theme.textSecondary}
          fontSize={12} fontWeight="bold" style={{ opacity: 0 }}>Int8 Weights</text>
        {INT8_WEIGHTS.map((w, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          return (
            <g key={`i8-${i}`} className="i8-cell" style={{ opacity: 0 }}>
              <rect x={470 + col * (CELL_SIZE + 4)} y={45 + row * (CELL_SIZE + 4)} width={CELL_SIZE} height={CELL_SIZE}
                rx={8} fill={theme.accent} fillOpacity={0.08} stroke={theme.accent} strokeWidth={1.5} />
              <text x={470 + col * (CELL_SIZE + 4) + CELL_SIZE / 2} y={45 + row * (CELL_SIZE + 4) + CELL_SIZE / 2 + 4}
                textAnchor="middle" fill={theme.accent} fontSize={14} fontWeight="bold">{w}</text>
            </g>
          );
        })}

        {/* Precision gauge */}
        <g>
          <text x={540} y={230} fill={theme.textSecondary} fontSize={11}>Accuracy:</text>
          <rect className="gauge-bg" x={470} y={240} width={260} height={20} rx={10}
            fill={theme.bg} stroke={theme.border} strokeWidth={1} style={{ opacity: 0 }} />
          <rect className="gauge-fill-before" x={472} y={242} width={250} height={16} rx={8}
            fill={theme.green} fillOpacity={0.6} style={{ transformOrigin: '472px center' }} />
          <text className="gauge-label" x={600} y={255} textAnchor="middle" fill="white" fontSize={10}
            fontWeight="bold" style={{ opacity: 0 }}>Before: 99.2%</text>
          <rect className="gauge-fill-after" x={472} y={272} width={244} height={16} rx={8}
            fill={theme.orange} fillOpacity={0.6} style={{ transformOrigin: '472px center' }} />
          <text className="gauge-label" x={600} y={285} textAnchor="middle" fill="white" fontSize={10}
            fontWeight="bold" style={{ opacity: 0 }}>After: 98.8%</text>
        </g>

        {/* Memory savings bars */}
        <g>
          <text className="mem-label" x={470} y={330} fill={theme.textSecondary} fontSize={11}
            style={{ opacity: 0 }}>Memory:</text>
          <rect className="mem-bar-before" x={470} y={340} width={260} height={24} rx={8}
            fill={theme.red} fillOpacity={0.4} style={{ transformOrigin: '470px center' }} />
          <text className="mem-label" x={600} y={357} textAnchor="middle" fill={theme.text} fontSize={11}
            fontWeight="bold" style={{ opacity: 0 }}>Float32: 4 GB</text>
          <rect className="mem-bar-after" x={470} y={374} width={65} height={24} rx={8}
            fill={theme.green} fillOpacity={0.6} style={{ transformOrigin: '470px center' }} />
          <text className="mem-label" x={540} y={391} fill={theme.text} fontSize={11}
            fontWeight="bold" style={{ opacity: 0 }}>Int8: 1 GB</text>

          {/* Savings badge */}
          <g className="savings-badge" style={{ transformOrigin: '690px 380px' }}>
            <circle cx={690} cy={380} r={28} fill={theme.green} fillOpacity={0.2}
              stroke={theme.green} strokeWidth={2} />
            <text x={690} y={376} textAnchor="middle" fill={theme.green} fontSize={14} fontWeight="bold">4×</text>
            <text x={690} y={392} textAnchor="middle" fill={theme.green} fontSize={8}>smaller</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
