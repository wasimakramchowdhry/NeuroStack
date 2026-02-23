import { motion } from 'motion/react';
import { NeoCard } from '../neo/NeoCard';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <NeoCard key={i} className="p-6">
          <div className="space-y-4">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-6 w-3/4 bg-[var(--neo-shadow-dark)]/20 rounded-lg"
            />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2 + 0.3,
              }}
              className="h-4 w-full bg-[var(--neo-shadow-dark)]/20 rounded-lg"
            />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2 + 0.6,
              }}
              className="h-4 w-5/6 bg-[var(--neo-shadow-dark)]/20 rounded-lg"
            />
          </div>
        </NeoCard>
      ))}
    </div>
  );
}
