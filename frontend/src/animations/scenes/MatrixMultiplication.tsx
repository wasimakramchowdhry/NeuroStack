import { useEffect } from 'react';
import { useGsapTimeline } from '../hooks/useGsapTimeline';
import { useAnimationTheme } from '../hooks/useAnimationTheme';
import type { SceneProps } from '../registry';
import type { Annotation } from '../components/AnnotationOverlay';

const ANNOTATIONS: Annotation[] = [
  { label: 'setup', title: 'Matrix Setup', description: 'Two matrices A (3×2) and B (2×3) are positioned for multiplication. The result C will be 3×3.' },
  { label: 'row-select', title: 'Select Row from A', description: 'Row 1 of matrix A is highlighted. This row will be multiplied element-wise with a column from B.' },
  { label: 'col-select', title: 'Select Column from B', description: 'Column 1 of matrix B is highlighted. Each element pairs with the corresponding element from the selected row.' },
  { label: 'multiply', title: 'Element-wise Multiply', description: 'Corresponding elements are multiplied: a₁₁×b₁₁ and a₁₂×b₂₁.', formula: 'products = [a[i,k] × b[k,j] for k]' },
  { label: 'sum', title: 'Sum Products', description: 'The products are summed to produce a single value in the result matrix.', formula: 'C[i,j] = Σ A[i,k] × B[k,j]' },
  { label: 'sweep', title: 'Compute Remaining Cells', description: 'The process repeats for all row-column pairs, filling the entire result matrix.' },
  { label: 'complete', title: 'Result Matrix', description: 'The complete 3×3 result matrix C = A × B is now computed. Each cell is a dot product of a row and column.' },
];

const A = [[2, 3], [1, 4], [5, 2]];
const B = [[3, 1, 2], [4, 2, 1]];
// C = A×B: [[18, 8, 7], [19, 9, 6], [23, 9, 12]]
const C = A.map(row => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));

const CELL = 48, GAP = 4;

export default function MatrixMultiplication({ onReady }: SceneProps) {
  const { containerRef, createTimeline, registerLabels, controls } = useGsapTimeline();
  const theme = useAnimationTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline();

    // Step 1: Setup
    tl.addLabel('setup')
      .fromTo('.mat-a-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'back.out(2)' })
      .fromTo('.mat-b-cell', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
      .fromTo('.mat-label', { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo('.equals-sign', { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo('.mat-c-outline', { opacity: 0 }, { opacity: 0.3, duration: 0.3 });

    // Step 2: Highlight row 1 of A
    tl.addLabel('row-select')
      .to('.mat-a-row-0', { fill: theme.blue, fillOpacity: 0.3, duration: 0.4 })
      .to('.mat-a-row-0 text', { fill: theme.blue, fontWeight: 'bold', duration: 0.3 });

    // Step 3: Highlight column 1 of B
    tl.addLabel('col-select')
      .to('.mat-b-col-0', { fill: theme.green, fillOpacity: 0.3, duration: 0.4 })
      .to('.mat-b-col-0 text', { fill: theme.green, fontWeight: 'bold', duration: 0.3 });

    // Step 4: Multiply
    tl.addLabel('multiply')
      .fromTo('.product-0', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.15, duration: 0.5, ease: 'elastic.out(1, 0.5)' });

    // Step 5: Sum
    tl.addLabel('sum')
      .to('.product-0', { y: -10, opacity: 0.5, duration: 0.3 })
      .fromTo('.result-0-0', { scale: 0, opacity: 0 }, { scale: 1.2, opacity: 1, duration: 0.4, ease: 'back.out(2)' })
      .to('.result-0-0', { scale: 1, duration: 0.2 });

    // Step 6: Sweep remaining
    tl.addLabel('sweep')
      .to('.mat-a-row-0', { fill: 'none', fillOpacity: 0, duration: 0.2 })
      .to('.mat-b-col-0', { fill: 'none', fillOpacity: 0, duration: 0.2 }, '<')
      .to('.product-0', { opacity: 0, duration: 0.2 }, '<');

    // Quick sweep through remaining 8 cells
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 0 && j === 0) continue;
        tl.fromTo(`.result-${i}-${j}`, { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(1.5)' });
      }
    }

    // Step 7: Complete
    tl.addLabel('complete')
      .to('.mat-c-outline', { opacity: 1, stroke: theme.accent, strokeWidth: 2.5, duration: 0.4 })
      .fromTo('.complete-label', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });

    registerLabels();
    onReady(controls, ANNOTATIONS);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 800, H = 400;
  const aX = 60, aY = 100;
  const bX = 350, bY = 60;
  const cX = 560, cY = 100;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <rect width={W} height={H} fill={theme.bg} rx={16} />

        {/* Matrix A (3x2) */}
        <text className="mat-label" x={aX + CELL} y={aY - 15} textAnchor="middle"
          fill={theme.textSecondary} fontSize={14} fontWeight="bold" style={{ opacity: 0 }}>A (3×2)</text>
        {A.map((row, i) =>
          row.map((val, j) => (
            <g key={`a-${i}-${j}`} className={`mat-a-cell mat-a-row-${i}`} style={{ opacity: 0 }}>
              <rect x={aX + j * (CELL + GAP)} y={aY + i * (CELL + GAP)} width={CELL} height={CELL} rx={8}
                fill={theme.bg} stroke={theme.border} strokeWidth={1.5} />
              <text x={aX + j * (CELL + GAP) + CELL / 2} y={aY + i * (CELL + GAP) + CELL / 2 + 5}
                textAnchor="middle" fill={theme.text} fontSize={16} fontWeight="500">{val}</text>
            </g>
          ))
        )}

        {/* Multiply sign */}
        <text x={270} y={210} textAnchor="middle" fill={theme.textSecondary} fontSize={24}>×</text>

        {/* Matrix B (2x3) */}
        <text className="mat-label" x={bX + CELL * 1.5} y={bY - 15} textAnchor="middle"
          fill={theme.textSecondary} fontSize={14} fontWeight="bold" style={{ opacity: 0 }}>B (2×3)</text>
        {B.map((row, i) =>
          row.map((val, j) => (
            <g key={`b-${i}-${j}`} className={`mat-b-cell mat-b-col-${j}`} style={{ opacity: 0 }}>
              <rect x={bX + j * (CELL + GAP)} y={bY + i * (CELL + GAP)} width={CELL} height={CELL} rx={8}
                fill={theme.bg} stroke={theme.border} strokeWidth={1.5} />
              <text x={bX + j * (CELL + GAP) + CELL / 2} y={bY + i * (CELL + GAP) + CELL / 2 + 5}
                textAnchor="middle" fill={theme.text} fontSize={16} fontWeight="500">{val}</text>
            </g>
          ))
        )}

        {/* Equals sign */}
        <text className="equals-sign" x={520} y={210} textAnchor="middle" fill={theme.textSecondary} fontSize={24}
          style={{ opacity: 0 }}>=</text>

        {/* Result Matrix C outline (3x3) */}
        <rect className="mat-c-outline" x={cX - 6} y={cY - 6} width={3 * (CELL + GAP) + 8} height={3 * (CELL + GAP) + 8}
          rx={12} fill="none" stroke={theme.border} strokeWidth={1.5} style={{ opacity: 0 }} />

        {/* Result cells */}
        {C.map((row, i) =>
          row.map((val, j) => (
            <g key={`c-${i}-${j}`} className={`result-${i}-${j}`} style={{ opacity: 0 }}>
              <rect x={cX + j * (CELL + GAP)} y={cY + i * (CELL + GAP)} width={CELL} height={CELL} rx={8}
                fill={theme.accent} fillOpacity={0.1} stroke={theme.accent} strokeWidth={1.5} />
              <text x={cX + j * (CELL + GAP) + CELL / 2} y={cY + i * (CELL + GAP) + CELL / 2 + 5}
                textAnchor="middle" fill={theme.accent} fontSize={16} fontWeight="bold">{val}</text>
            </g>
          ))
        )}

        {/* Product indicators for first cell */}
        <g className="product-0" style={{ opacity: 0 }}>
          <text x={320} y={290} textAnchor="middle" fill={theme.blue} fontSize={12}>
            2×3 + 3×4 = {C[0][0]}
          </text>
        </g>

        {/* Complete label */}
        <text className="complete-label" x={cX + 75} y={cY + 3 * (CELL + GAP) + 30}
          textAnchor="middle" fill={theme.accent} fontSize={13} fontWeight="bold" style={{ opacity: 0 }}>
          C = A × B (3×3)
        </text>
      </svg>
    </div>
  );
}
