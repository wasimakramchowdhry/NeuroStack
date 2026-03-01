import { useEffect } from 'react';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'tokens', title: 'Token Stream', description: 'Six input tokens enter the Mixture of Experts layer for processing.' },
  { label: 'router', title: 'Router Network', description: 'Each token passes through a lightweight gating network that produces expert selection scores.' },
  { label: 'scores', title: 'Expert Score Distribution', description: 'The router outputs a probability distribution over all 4 experts for each token.' },
  { label: 'topk', title: 'Top-K Expert Selection', description: 'Only the top-2 experts per token are selected. Other experts are masked to zero.', formula: 'gates = TopK(softmax(Router(x)), k=2)' },
  { label: 'route', title: 'Expert Processing', description: 'Tokens are dispatched to their assigned expert sub-networks for specialized processing.' },
  { label: 'combine', title: 'Weighted Combination', description: 'Expert outputs are multiplied by their routing weights and summed.' },
  { label: 'output', title: 'Output Merge', description: 'The weighted expert outputs combine into the final MoE layer output for each token.' },
];

const TOKEN_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#22C55E', '#EF4444', '#EC4899'];
const EXPERT_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7'];
const EXPERT_NAMES = ['Expert 1', 'Expert 2', 'Expert 3', 'Expert 4'];

export default function MoERouting({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Token Stream
    tl.addLabel('tokens')
      .fromTo('.moe-token', { x: -50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.5)' });

    // Step 2: Router Network
    tl.addLabel('router')
      .fromTo('.router-box', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' })
      .fromTo('.router-arrow', { strokeDashoffset: 40 }, { strokeDashoffset: 0, stagger: 0.05, duration: 0.4 });

    // Step 3: Score Distribution
    tl.addLabel('scores')
      .fromTo('.score-bar', { scaleX: 0 }, { scaleX: 1, stagger: 0.03, duration: 0.3, ease: 'power2.out' });

    // Step 4: Top-K Selection
    tl.addLabel('topk')
      .to('.score-bar-dim', { opacity: 0.15, duration: 0.3 })
      .to('.score-bar-selected', { fillOpacity: 0.9, duration: 0.3 })
      .fromTo('.topk-badge', { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

    // Step 5: Route to experts
    tl.addLabel('route')
      .fromTo('.expert-box', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'back.out(1.5)' })
      .fromTo('.route-path', { strokeDashoffset: 100 }, { strokeDashoffset: 0, stagger: 0.04, duration: 0.5 });

    // Step 6: Weighted combination
    tl.addLabel('combine')
      .to('.expert-box', { scale: 1.05, duration: 0.2, stagger: 0.05 })
      .to('.expert-box', { scale: 1, duration: 0.2, stagger: 0.05 })
      .fromTo('.weight-label', { opacity: 0 }, { opacity: 1, stagger: 0.08, duration: 0.3 });

    // Step 7: Output merge
    tl.addLabel('output')
      .fromTo('.output-arrow', { strokeDashoffset: 60 }, { strokeDashoffset: 0, stagger: 0.05, duration: 0.4 })
      .fromTo('.moe-output', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'back.out(1.5)' });

    registerLabels();
    onReady(controls, ANNOTATIONS);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 450;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Input Tokens */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`tok-${i}`} className="moe-token" style={{ opacity: 0 }}>
            <circle cx={50} cy={60 + i * 62} r={20} fill={TOKEN_COLORS[i]} fillOpacity={0.2}
              stroke={TOKEN_COLORS[i]} strokeWidth={2} />
            <text x={50} y={65 + i * 62} textAnchor="middle" fill={TOKEN_COLORS[i]} fontSize={11} fontWeight="bold">
              T{i + 1}
            </text>
          </g>
        ))}

        {/* Router arrows */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`ra-${i}`} className="router-arrow" x1={75} y1={60 + i * 62} x2={140} y2={220}
            stroke={theme.border} strokeWidth={1} strokeDasharray="40" strokeDashoffset={40} opacity={0.5} />
        ))}

        {/* Router Network */}
        <g className="router-box" style={{ opacity: 0 }}>
          <rect x={140} y={180} width={80} height={80} rx={12}
            fill={theme.purple} fillOpacity={0.15} stroke={theme.purple} strokeWidth={2} />
          <text x={180} y={215} textAnchor="middle" fill={theme.purple} fontSize={11} fontWeight="bold">Router</text>
          <text x={180} y={232} textAnchor="middle" fill={theme.textSecondary} fontSize={9}>Gating</text>
        </g>

        {/* Score bars (simplified: show 2 tokens × 4 experts) */}
        {[0, 1, 2].map(t => {
          const scores = [0.4, 0.35, 0.15, 0.1];
          return (
            <g key={`sb-${t}`}>
              {scores.map((s, e) => {
                const isSelected = e < 2;
                return (
                  <rect key={`sb-${t}-${e}`}
                    className={`score-bar ${isSelected ? 'score-bar-selected' : 'score-bar-dim'}`}
                    x={260} y={70 + t * 130 + e * 22} width={s * 120} height={16} rx={4}
                    fill={EXPERT_COLORS[e]} fillOpacity={isSelected ? 0.7 : 0.4}
                    style={{ transformOrigin: '260px center' }} />
                );
              })}
            </g>
          );
        })}

        {/* TopK badges */}
        <text className="topk-badge" x={300} y={55} textAnchor="middle" fill={theme.accent} fontSize={10}
          fontWeight="bold" style={{ transformOrigin: '300px 55px' }}>Top-2</text>

        {/* Expert Boxes */}
        {EXPERT_NAMES.map((name, i) => (
          <g key={`exp-${i}`} className="expert-box" style={{ opacity: 0 }}>
            <rect x={460} y={50 + i * 100} width={100} height={65} rx={12}
              fill={EXPERT_COLORS[i]} fillOpacity={0.1} stroke={EXPERT_COLORS[i]} strokeWidth={2} />
            <text x={510} y={78 + i * 100} textAnchor="middle" fill={EXPERT_COLORS[i]} fontSize={12} fontWeight="bold">
              {name}
            </text>
            <text x={510} y={98 + i * 100} textAnchor="middle" fill={theme.textSecondary} fontSize={9}>
              FFN Layer
            </text>
          </g>
        ))}

        {/* Route paths (token → expert) */}
        {[0, 1, 2, 3, 4, 5].map(t => {
          const expert1 = t % 4;
          const expert2 = (t + 1) % 4;
          return (
            <g key={`rp-${t}`}>
              <line className="route-path" x1={240} y1={60 + t * 62} x2={460} y2={82 + expert1 * 100}
                stroke={EXPERT_COLORS[expert1]} strokeWidth={1.5} strokeDasharray="100" strokeDashoffset={100} opacity={0.5} />
              <line className="route-path" x1={240} y1={60 + t * 62} x2={460} y2={82 + expert2 * 100}
                stroke={EXPERT_COLORS[expert2]} strokeWidth={1} strokeDasharray="100" strokeDashoffset={100} opacity={0.3} />
            </g>
          );
        })}

        {/* Weight labels */}
        {EXPERT_NAMES.map((_, i) => (
          <text key={`wl-${i}`} className="weight-label" x={570} y={82 + i * 100}
            fill={theme.textSecondary} fontSize={9} style={{ opacity: 0 }}>
            w={[0.6, 0.4, 0.55, 0.45][i]}
          </text>
        ))}

        {/* Output arrows */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`oa-${i}`} className="output-arrow" x1={660} y1={220} x2={710} y2={60 + i * 62}
            stroke={theme.border} strokeWidth={1} strokeDasharray="60" strokeDashoffset={60} opacity={0.5} />
        ))}

        {/* Output tokens */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`out-${i}`} className="moe-output" style={{ opacity: 0 }}>
            <circle cx={740} cy={60 + i * 62} r={20} fill={theme.accent} fillOpacity={0.2}
              stroke={theme.accent} strokeWidth={2} />
            <text x={740} y={65 + i * 62} textAnchor="middle" fill={theme.accent} fontSize={11} fontWeight="bold">
              O{i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
