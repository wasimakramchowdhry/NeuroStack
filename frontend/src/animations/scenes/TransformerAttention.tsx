import { useEffect } from 'react';
import { gsap } from 'gsap';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'input', title: 'Input Embeddings', description: 'Four tokens enter the attention layer as embedding vectors. Each token is represented as a dense vector.' },
  { label: 'projection', title: 'Linear Projections', description: 'Each token is projected into three vectors: Query (Q), Key (K), and Value (V) through learned linear transformations.', formula: 'Q = XW_Q,  K = XW_K,  V = XW_V' },
  { label: 'scores', title: 'Attention Score Computation', description: 'Query and Key vectors are multiplied to compute raw attention scores between every pair of tokens.', formula: 'Score = Q · K^T' },
  { label: 'scale', title: 'Scaling', description: 'Scores are divided by the square root of the key dimension to prevent gradients from vanishing.', formula: 'Scaled = Score / √d_k' },
  { label: 'softmax', title: 'Softmax Normalization', description: 'Softmax converts raw scores into a probability distribution that sums to 1.0 for each query.', formula: 'Attention = softmax(Scaled)' },
  { label: 'weighted', title: 'Weighted Value Sum', description: 'Value vectors are multiplied by attention weights and summed to produce the output for each position.' },
  { label: 'multihead', title: 'Multi-Head Split', description: 'The view zooms out to show multiple attention heads running in parallel, each learning different relationship patterns.' },
  { label: 'concat', title: 'Concatenate & Project', description: 'All head outputs are concatenated and passed through a final linear layer to produce the attention output.', formula: 'Output = Concat(head_1, ..., head_h) · W_O' },
];

const TOKENS = ['The', 'cat', 'sat', 'down'];
const TOKEN_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#22C55E'];

export default function TransformerAttention({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Input Embeddings
    tl.addLabel('input')
      .fromTo('.token-box', { x: -60, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'back.out(1.5)' })
      .to('.token-label', { opacity: 1, duration: 0.3 }, '-=0.3');

    // Step 2: Linear Projections - Q, K, V
    tl.addLabel('projection')
      .to('.token-box', { scale: 0.85, duration: 0.3 })
      .fromTo('.qkv-group', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)' })
      .fromTo('.proj-arrow', { strokeDashoffset: 40 }, { strokeDashoffset: 0, stagger: 0.05, duration: 0.4 });

    // Step 3: Score Computation
    tl.addLabel('scores')
      .fromTo('.score-grid', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo('.score-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.04, duration: 0.3, ease: 'back.out(2)' });

    // Step 4: Scaling
    tl.addLabel('scale')
      .to('.score-cell', { scale: 0.85, duration: 0.3 })
      .fromTo('.scale-indicator', { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .to('.score-cell', { scale: 1, duration: 0.3 });

    // Step 5: Softmax
    tl.addLabel('softmax')
      .fromTo('.softmax-bar', { scaleX: 0 }, { scaleX: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out' })
      .fromTo('.softmax-label', { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.3 });

    // Step 6: Weighted Sum
    tl.addLabel('weighted')
      .fromTo('.value-arrow', { strokeDashoffset: 60 }, { strokeDashoffset: 0, stagger: 0.08, duration: 0.5 })
      .fromTo('.output-box', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(1.5)' });

    // Step 7: Multi-Head
    tl.addLabel('multihead')
      .to('.single-head', { scale: 0.6, x: -80, duration: 0.5 })
      .fromTo('.head-clone', { opacity: 0, x: 20 }, { opacity: 0.6, x: 0, stagger: 0.1, duration: 0.4 })
      .fromTo('.head-label', { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.3 });

    // Step 8: Concat + Linear
    tl.addLabel('concat')
      .to('.head-clone', { x: 0, opacity: 1, duration: 0.4 })
      .to('.single-head', { scale: 1, x: 0, duration: 0.4 })
      .fromTo('.concat-arrow', { strokeDashoffset: 80 }, { strokeDashoffset: 0, duration: 0.5 })
      .fromTo('.final-output', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });

    registerLabels();
    onReady(controls, ANNOTATIONS);

    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 450;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ willChange: 'transform' }}>
        <defs>
          <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="kGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Token Boxes */}
        <g className="single-head">
          {TOKENS.map((token, i) => (
            <g key={token} className="token-box" style={{ opacity: 0 }}>
              <rect x={30} y={80 + i * 80} width={70} height={50} rx={10}
                fill={TOKEN_COLORS[i]} fillOpacity={0.15} stroke={TOKEN_COLORS[i]} strokeWidth={2} />
              <text className="token-label" x={65} y={110 + i * 80} textAnchor="middle"
                fill={theme.text} fontSize={14} fontWeight="bold" style={{ opacity: 0 }}>{token}</text>
            </g>
          ))}

          {/* Q, K, V vectors */}
          {TOKENS.map((_, i) => (
            <g key={`qkv-${i}`}>
              {/* Projection arrows */}
              <line className="proj-arrow" x1={100} y1={105 + i * 80} x2={150} y2={90 + i * 80}
                stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="40" strokeDashoffset={40} />
              <line className="proj-arrow" x1={100} y1={105 + i * 80} x2={150} y2={105 + i * 80}
                stroke="#22C55E" strokeWidth={1.5} strokeDasharray="40" strokeDashoffset={40} />
              <line className="proj-arrow" x1={100} y1={105 + i * 80} x2={150} y2={120 + i * 80}
                stroke="#F97316" strokeWidth={1.5} strokeDasharray="40" strokeDashoffset={40} />
              {/* Q */}
              <rect className="qkv-group" x={150} y={80 + i * 80} width={30} height={16} rx={4}
                fill="url(#qGrad)" style={{ opacity: 0 }} />
              <text x={165} y={92 + i * 80} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold"
                className="qkv-group" style={{ opacity: 0 }}>Q</text>
              {/* K */}
              <rect className="qkv-group" x={150} y={98 + i * 80} width={30} height={16} rx={4}
                fill="url(#kGrad)" style={{ opacity: 0 }} />
              <text x={165} y={110 + i * 80} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold"
                className="qkv-group" style={{ opacity: 0 }}>K</text>
              {/* V */}
              <rect className="qkv-group" x={150} y={116 + i * 80} width={30} height={16} rx={4}
                fill="url(#vGrad)" style={{ opacity: 0 }} />
              <text x={165} y={128 + i * 80} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold"
                className="qkv-group" style={{ opacity: 0 }}>V</text>
            </g>
          ))}

          {/* Score Grid (4x4) */}
          <g className="score-grid" style={{ opacity: 0 }}>
            <text x={320} y={70} textAnchor="middle" fill={theme.textSecondary} fontSize={11}>Attention Scores</text>
            {[0, 1, 2, 3].map(r =>
              [0, 1, 2, 3].map(c => {
                const val = (r === c ? 0.8 : 0.2 + Math.random() * 0.3).toFixed(1);
                return (
                  <g key={`sc-${r}-${c}`} className="score-cell" style={{ opacity: 0 }}>
                    <rect x={260 + c * 36} y={80 + r * 36} width={32} height={32} rx={6}
                      fill={r === c ? theme.blue : theme.bg} fillOpacity={r === c ? 0.2 : 1}
                      stroke={theme.border} strokeWidth={1} />
                    <text x={276 + c * 36} y={100 + r * 36} textAnchor="middle"
                      fill={theme.text} fontSize={10}>{val}</text>
                  </g>
                );
              })
            )}
          </g>

          {/* Scale indicator */}
          <text className="scale-indicator" x={320} y={240} textAnchor="middle"
            fill={theme.accent} fontSize={11} fontWeight="bold" style={{ opacity: 0 }}>÷ √d_k</text>

          {/* Softmax bars */}
          <g>
            {[0, 1, 2, 3].map(i => {
              const weights = [0.45, 0.25, 0.2, 0.1];
              return (
                <g key={`sf-${i}`}>
                  <rect className="softmax-bar" x={450} y={85 + i * 40} width={weights[i] * 160} height={20} rx={4}
                    fill={TOKEN_COLORS[i]} fillOpacity={0.7} style={{ transformOrigin: '450px center' }} />
                  <text className="softmax-label" x={455 + weights[i] * 160} y={99 + i * 40}
                    fill={theme.text} fontSize={10} style={{ opacity: 0 }}>{weights[i]}</text>
                </g>
              );
            })}
          </g>

          {/* Value arrows */}
          {[0, 1, 2, 3].map(i => (
            <line key={`va-${i}`} className="value-arrow" x1={620} y1={95 + i * 40} x2={670} y2={200}
              stroke={TOKEN_COLORS[i]} strokeWidth={1.5} strokeDasharray="60" strokeDashoffset={60} opacity={0.6} />
          ))}

          {/* Output boxes */}
          {TOKENS.map((token, i) => (
            <g key={`out-${i}`} className="output-box" style={{ opacity: 0 }}>
              <rect x={680} y={80 + i * 80} width={80} height={50} rx={10}
                fill={theme.accent} fillOpacity={0.15} stroke={theme.accent} strokeWidth={2} />
              <text x={720} y={100 + i * 80} textAnchor="middle" fill={theme.accent} fontSize={10} fontWeight="bold">
                Out
              </text>
              <text x={720} y={116 + i * 80} textAnchor="middle" fill={theme.textSecondary} fontSize={10}>
                {token}
              </text>
            </g>
          ))}
        </g>

        {/* Multi-Head Clones */}
        {[1, 2, 3].map(h => (
          <g key={`hc-${h}`} className="head-clone" style={{ opacity: 0 }}>
            <rect x={30 + h * 12} y={60 + h * 8} width={720} height={340} rx={12}
              fill="none" stroke={theme.border} strokeWidth={1} strokeDasharray="4 4" />
            <text className="head-label" x={40 + h * 12} y={80 + h * 8}
              fill={theme.textSecondary} fontSize={10} style={{ opacity: 0 }}>Head {h + 1}</text>
          </g>
        ))}

        {/* Concat arrow + final output */}
        <line className="concat-arrow" x1={400} y1={420} x2={580} y2={420}
          stroke={theme.accent} strokeWidth={2} strokeDasharray="80" strokeDashoffset={80}
          markerEnd="url(#arrowHead)" />
        <g className="final-output" style={{ opacity: 0 }}>
          <rect x={590} y={405} width={120} height={35} rx={10}
            fill={theme.accent} fillOpacity={0.2} stroke={theme.accent} strokeWidth={2} />
          <text x={650} y={427} textAnchor="middle" fill={theme.accent} fontSize={12} fontWeight="bold">
            Attention Output
          </text>
        </g>
      </svg>
    </div>
  );
}
