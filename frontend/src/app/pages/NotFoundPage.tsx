import { motion } from 'motion/react';
import { NeoCard } from '../components/neo/NeoCard';
import { NeoButton } from '../components/neo/NeoButton';
import { useNavigate } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <NeoCard className="p-12 max-w-lg">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <NeoCard variant="flat" className="p-6">
              <AlertCircle className="w-16 h-16 text-[var(--neo-accent-orange)]" />
            </NeoCard>
          </motion.div>
          
          <h1 className="text-6xl font-bold text-[var(--neo-text-primary)] mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-[var(--neo-text-primary)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--neo-text-secondary)] mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          <NeoButton
            variant="primary"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </NeoButton>
        </NeoCard>
      </motion.div>
    </div>
  );
}
