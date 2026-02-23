import { motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { NeoCard } from '../neo/NeoCard';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function AnimatedLogo({ size = 'md', animated = true }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        duration: 0.8 
      }}
      whileHover={animated ? { 
        scale: 1.1, 
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.5 }
      } : false}
    >
      <NeoCard className={`inline-block ${sizeClasses[size]}`}>
        <motion.div
          animate={animated ? {
            rotateY: [0, 360],
          } : false}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2
          }}
        >
          <Brain className={`${iconSizes[size]} text-[var(--neo-accent-orange)]`} />
        </motion.div>
      </NeoCard>
    </motion.div>
  );
}
