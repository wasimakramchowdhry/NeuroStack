import { useEffect } from 'react';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'setup', title: 'Task Setup', description: '64 independent computation blocks need to be processed. This simulates a matrix operation typical in deep learning.' },
  { label: 'cpu', title: 'CPU Architecture', description: 'A CPU has a few powerful cores (4-8) optimized for sequential, complex tasks with large caches and branch prediction.' },
  { label: 'gpu', title: 'GPU Architecture', description: 'A GPU has thousands of simple cores designed for massively parallel, identical operations on data.', formula: 'GPU cores >> CPU cores' },
  { label: 'race', title: 'The Race Begins', description: 'Both processors start computing the same 64 tasks. CPU processes a few at a time; GPU processes all at once.' },
  { label: 'stats', title: 'Performance Comparison', description: 'For parallel workloads like deep learning, GPUs achieve 10-100× speedup over CPUs.' },
  { label: 'usecase', title: 'Why GPUs Dominate AI', description: 'Matrix multiplications, convolutions, and attention computations are perfectly suited for GPU parallelism.' },
];

const GRID_SIZE = 8; // 8x8 = 64 blocks

export default function CpuVsGpu({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Setup — show task blocks
    tl.addLabel('setup')
      .fromTo('.task-block', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.01, duration: 0.15, ease: 'power2.out' })
      .fromTo('.task-title', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 2: CPU side
    tl.addLabel('cpu')
      .fromTo('.cpu-box', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' })
      .fromTo('.cpu-core', { scale: 0 }, { scale: 1, stagger: 0.1, duration: 0.3, ease: 'back.out(2)' })
      .fromTo('.cpu-label', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 3: GPU side
    tl.addLabel('gpu')
      .fromTo('.gpu-box', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' })
      .fromTo('.gpu-core', { scale: 0 }, { scale: 1, stagger: 0.005, duration: 0.1, ease: 'power2.out' })
      .fromTo('.gpu-label', { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Step 4: Race — CPU processes slowly, GPU all at once
    tl.addLabel('race');

    // CPU: process 4 blocks at a time (16 batches for 64 blocks)
    for (let batch = 0; batch < 16; batch++) {
      const start = batch * 4;
      for (let i = start; i < Math.min(start + 4, 64); i++) {
        tl.to(`.cpu-task-${i}`, { fill: theme.blue, fillOpacity: 0.6, duration: 0.06 }, `race+=${batch * 0.12}`);
      }
    }

    // CPU timer counts up slowly
    tl.fromTo('.cpu-timer', { textContent: '0ms' }, {
      duration: 1.92,
      textContent: '192ms',
      snap: { textContent: 1 },
    }, 'race');

    // GPU: all blocks fill at once
    tl.to('.gpu-task', { fill: theme.green, fillOpacity: 0.6, duration: 0.15 }, 'race+=0.1');

    // GPU timer
    tl.fromTo('.gpu-timer', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 'race+=0.25')
      .fromTo('.gpu-done', { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, 'race+=0.3');

    // Step 5: Stats
    tl.addLabel('stats')
      .fromTo('.speedup-box', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
      .fromTo('.stat-bar-cpu', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' })
      .fromTo('.stat-bar-gpu', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .fromTo('.stat-text', { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.3 });

    // Step 6: Use case
    tl.addLabel('usecase')
      .fromTo('.usecase-box', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });

    registerLabels();
    onReady(controls, ANNOTATIONS);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 450;
  const BLOCK_SIZE = 12, GAP = 2;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Title */}
        <text className="task-title" x={400} y={30} textAnchor="middle" fill={theme.text}
          fontSize={14} fontWeight="bold" style={{ opacity: 0 }}>64 Computation Tasks</text>

        {/* ── CPU Side (Left) ── */}
        <g className="cpu-box" style={{ opacity: 0 }}>
          <rect x={20} y={45} width={360} height={180} rx={14}
            fill={theme.blue} fillOpacity={0.05} stroke={theme.blue} strokeWidth={1.5} />
          <text className="cpu-label" x={200} y={68} textAnchor="middle" fill={theme.blue}
            fontSize={13} fontWeight="bold" style={{ opacity: 0 }}>CPU — 4 Cores (Sequential)</text>

          {/* CPU Cores (4 large) */}
          {[0, 1, 2, 3].map(i => (
            <g key={`cc-${i}`} className="cpu-core" style={{ transformOrigin: `${60 + i * 80}px 100px` }}>
              <rect x={35 + i * 85} y={80} width={60} height={40} rx={8}
                fill={theme.blue} fillOpacity={0.2} stroke={theme.blue} strokeWidth={1.5} />
              <text x={65 + i * 85} y={105} textAnchor="middle" fill={theme.blue} fontSize={10} fontWeight="bold">
                Core {i + 1}
              </text>
            </g>
          ))}

          {/* CPU Task grid */}
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 16), col = i % 16;
            return (
              <rect key={`ct-${i}`} className={`task-block cpu-task-${i}`}
                x={40 + col * (BLOCK_SIZE + GAP)} y={135 + row * (BLOCK_SIZE + GAP)}
                width={BLOCK_SIZE} height={BLOCK_SIZE} rx={2}
                fill={theme.border} fillOpacity={0.3} style={{ opacity: 0 }} />
            );
          })}

          {/* CPU Timer */}
          <text className="cpu-timer" x={200} y={210} textAnchor="middle"
            fill={theme.blue} fontSize={16} fontWeight="bold">0ms</text>
        </g>

        {/* ── GPU Side (Right) ── */}
        <g className="gpu-box" style={{ opacity: 0 }}>
          <rect x={420} y={45} width={360} height={180} rx={14}
            fill={theme.green} fillOpacity={0.05} stroke={theme.green} strokeWidth={1.5} />
          <text className="gpu-label" x={600} y={68} textAnchor="middle" fill={theme.green}
            fontSize={13} fontWeight="bold" style={{ opacity: 0 }}>GPU — 64 Cores (Parallel)</text>

          {/* GPU Cores (64 tiny) */}
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 16), col = i % 16;
            return (
              <rect key={`gc-${i}`} className="gpu-core"
                x={440 + col * 20} y={78 + row * 14} width={16} height={10} rx={2}
                fill={theme.green} fillOpacity={0.25} stroke={theme.green} strokeWidth={0.5}
                style={{ transformOrigin: `${448 + col * 20}px ${83 + row * 14}px` }} />
            );
          })}

          {/* GPU Task grid */}
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 16), col = i % 16;
            return (
              <rect key={`gt-${i}`} className="task-block gpu-task"
                x={440 + col * (BLOCK_SIZE + GAP)} y={135 + row * (BLOCK_SIZE + GAP)}
                width={BLOCK_SIZE} height={BLOCK_SIZE} rx={2}
                fill={theme.border} fillOpacity={0.3} style={{ opacity: 0 }} />
            );
          })}

          {/* GPU Timer */}
          <text className="gpu-timer" x={600} y={210} textAnchor="middle"
            fill={theme.green} fontSize={16} fontWeight="bold" style={{ opacity: 0 }}>12ms</text>
          <text className="gpu-done" x={670} y={210} fill={theme.green} fontSize={12}
            fontWeight="bold" style={{ transformOrigin: '670px 210px' }}>Done!</text>
        </g>

        {/* ── Stats Section ── */}
        <g>
          {/* Speedup badge */}
          <g className="speedup-box" style={{ opacity: 0, transformOrigin: '400px 270px' }}>
            <rect x={330} y={245} width={140} height={50} rx={25}
              fill={theme.accent} fillOpacity={0.15} stroke={theme.accent} strokeWidth={2} />
            <text x={400} y={268} textAnchor="middle" fill={theme.accent} fontSize={18} fontWeight="bold">16× Faster</text>
            <text x={400} y={284} textAnchor="middle" fill={theme.textSecondary} fontSize={9}>GPU Speedup</text>
          </g>

          {/* Comparison bars */}
          <text className="stat-text" x={60} y={320} fill={theme.blue} fontSize={11}
            fontWeight="bold" style={{ opacity: 0 }}>CPU:</text>
          <rect className="stat-bar-cpu" x={100} y={308} width={300} height={18} rx={9}
            fill={theme.blue} fillOpacity={0.4} style={{ transformOrigin: '100px center' }} />
          <text className="stat-text" x={410} y={322} fill={theme.blue} fontSize={10}
            style={{ opacity: 0 }}>192ms</text>

          <text className="stat-text" x={60} y={350} fill={theme.green} fontSize={11}
            fontWeight="bold" style={{ opacity: 0 }}>GPU:</text>
          <rect className="stat-bar-gpu" x={100} y={338} width={19} height={18} rx={9}
            fill={theme.green} fillOpacity={0.6} style={{ transformOrigin: '100px center' }} />
          <text className="stat-text" x={130} y={352} fill={theme.green} fontSize={10}
            style={{ opacity: 0 }}>12ms</text>
        </g>

        {/* ── Use Case Box ── */}
        <g className="usecase-box" style={{ opacity: 0 }}>
          <rect x={60} y={375} width={680} height={55} rx={14}
            fill={theme.accent} fillOpacity={0.08} stroke={theme.accent} strokeWidth={1.5} />
          <text x={400} y={398} textAnchor="middle" fill={theme.accent} fontSize={13} fontWeight="bold">
            This is why GPUs dominate deep learning
          </text>
          <text x={400} y={416} textAnchor="middle" fill={theme.textSecondary} fontSize={10}>
            Matrix multiplications, convolutions, and attention computations are perfectly parallel workloads
          </text>
        </g>
      </svg>
    </div>
  );
}
