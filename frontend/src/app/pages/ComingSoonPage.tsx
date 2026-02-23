import { motion } from 'motion/react';
import { NeoCard } from '../components/neo/NeoCard';
import { Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <NeoCard className="p-12 max-w-lg">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <NeoCard variant="flat" className="p-6">
              <Sparkles className="w-16 h-16 text-[var(--neo-accent-orange)]" />
            </NeoCard>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-[var(--neo-text-primary)] mb-4">
            {title}
          </h1>
          <p className="text-[var(--neo-text-secondary)] mb-6">
            {description}
          </p>
          
          <NeoCard variant="inset" className="p-4 bg-[var(--neo-accent-orange)]/5">
            <p className="text-sm text-[var(--neo-text-secondary)]">
              This feature is currently in development and will be available in the next phase.
            </p>
          </NeoCard>
        </NeoCard>
      </motion.div>
    </div>
  );
}
