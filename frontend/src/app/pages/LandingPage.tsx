import { motion } from 'motion/react';
import { NeoCard } from '../components/neo/NeoCard';
import { NeoButton } from '../components/neo/NeoButton';
import { AnimatedLogo } from '../components/brand/AnimatedLogo';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import {
  Brain,
  Zap,
  Target,
  Globe,
  BookOpen,
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Brain,
      title: 'AI Systems Mastery',
      description: 'Deep dive into transformers, MoE, quantization, and production systems',
    },
    {
      icon: Globe,
      title: '22 Languages',
      description: 'Learn in your native language with AI-powered translations',
    },
    {
      icon: Target,
      title: 'Adaptive Learning',
      description: 'Personalized roadmaps that adapt to your progress and goals',
    },
    {
      icon: Trophy,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with multi-type assessments and AI evaluation',
    },
    {
      icon: Zap,
      title: 'Visual Learning',
      description: 'Animated explanations of complex concepts like attention mechanisms',
    },
    {
      icon: Sparkles,
      title: 'AI Mentor',
      description: 'Get personalized guidance, exercises, and interview preparation',
    },
  ];

  return (
    <div className="py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="mb-8">
          <AnimatedLogo size="lg" />
        </div>

        <h1 className="text-5xl font-bold text-[var(--neo-text-primary)] mb-4">
          Master AI Systems
        </h1>
        <p className="text-xl text-[var(--neo-text-secondary)] mb-8 max-w-2xl mx-auto">
          Production-grade learning platform for transformers, MoE, quantization,
          and advanced AI system design
        </p>

        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <NeoButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          ) : (
            <>
              <NeoButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </NeoButton>
              <NeoButton
                variant="ghost"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </NeoButton>
            </>
          )}
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <NeoCard className="p-6 h-full hover:scale-[1.02] transition-transform cursor-pointer">
                <NeoCard variant="flat" className="p-4 inline-block mb-4">
                  <Icon className="w-8 h-8 text-[var(--neo-accent-orange)]" />
                </NeoCard>
                <h3 className="text-lg font-semibold text-[var(--neo-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--neo-text-secondary)] text-sm">
                  {feature.description}
                </p>
              </NeoCard>
            </motion.div>
          );
        })}
      </div>

      {/* Learning Path Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <NeoCard className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--neo-text-primary)] mb-4">
              Your Learning Journey
            </h2>
            <p className="text-[var(--neo-text-secondary)]">
              Structured path from fundamentals to advanced AI systems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { phase: 'Foundations', topics: 'Linear Algebra, Neural Networks, PyTorch' },
              { phase: 'Transformers', topics: 'Attention, BERT, GPT, Fine-tuning' },
              { phase: 'Advanced', topics: 'MoE, Quantization, RAG, Production' },
            ].map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.2 }}
              >
                <NeoCard variant="flat" className="p-6 text-center">
                  <div className="text-[var(--neo-accent-orange)] font-bold text-lg mb-2">
                    Phase {index + 1}
                  </div>
                  <h3 className="font-semibold text-[var(--neo-text-primary)] mb-2">
                    {phase.phase}
                  </h3>
                  <p className="text-sm text-[var(--neo-text-secondary)]">
                    {phase.topics}
                  </p>
                </NeoCard>
              </motion.div>
            ))}
          </div>
        </NeoCard>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center mt-16"
      >
        <NeoCard className="p-12 bg-gradient-to-br from-[var(--neo-accent-orange)]/5 to-transparent">
          <BookOpen className="w-16 h-16 text-[var(--neo-accent-orange)] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[var(--neo-text-primary)] mb-4">
            Ready to Begin?
          </h2>
          <p className="text-[var(--neo-text-secondary)] mb-8 max-w-md mx-auto">
            Join thousands of learners mastering AI systems with adaptive,
            multilingual, and interactive education
          </p>
          {isAuthenticated ? (
            <NeoButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Continue Learning
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          ) : (
            <NeoButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          )}
        </NeoCard>
      </motion.div>
    </div>
  );
}