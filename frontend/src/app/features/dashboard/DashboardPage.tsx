import { motion } from 'motion/react';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Sparkles,
  Clock,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    { icon: BookOpen, label: 'Topics', value: '0/50', color: 'var(--neo-accent-orange)' },
    { icon: Trophy, label: 'Quizzes', value: '0', color: 'var(--neo-accent-success)' },
    { icon: Award, label: 'Badges', value: '0', color: 'var(--neo-accent-slate)' },
    { icon: Zap, label: 'Streak', value: '0 days', color: 'var(--neo-accent-orange)' },
  ];

  const recentActivity = [
    { title: 'Welcome to NeuroStack!', desc: 'Start your journey', time: 'Just now', type: 'info' },
  ];

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--neo-text-primary)] mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[var(--neo-text-secondary)]">
            Ready to continue your AI Systems mastery journey?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NeoCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <NeoCard variant="flat" className="p-3">
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </NeoCard>
                  </div>
                  <div className="text-2xl font-bold text-[var(--neo-text-primary)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--neo-text-secondary)]">
                    {stat.label}
                  </div>
                </NeoCard>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Learning Progress */}
          <div className="lg:col-span-2">
            <NeoCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-[var(--neo-accent-orange)]" />
                <h2 className="text-xl font-semibold text-[var(--neo-text-primary)]">
                  Your Learning Path
                </h2>
              </div>

              <div className="space-y-4">
                {/* Phase Cards */}
                {[
                  { title: 'Phase 1: Foundations', progress: 0, total: 10 },
                  { title: 'Phase 2: Transformers', progress: 0, total: 12 },
                  { title: 'Phase 3: Advanced Topics', progress: 0, total: 15 },
                ].map((phase, index) => (
                  <motion.div
                    key={phase.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <NeoCard variant="flat" className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--neo-text-primary)]">
                          {phase.title}
                        </span>
                        <span className="text-sm text-[var(--neo-text-secondary)]">
                          {phase.progress}/{phase.total}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-background shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(phase.progress / phase.total) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className="h-full rounded-full bg-[var(--neo-accent-orange)]"
                        />
                      </div>
                    </NeoCard>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <NeoCard 
                  className="p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => navigate('/topics')}
                >
                  <div className="flex items-center gap-4">
                    <NeoCard variant="flat" className="p-4">
                      <Sparkles className="w-8 h-8 text-[var(--neo-accent-orange)]" />
                    </NeoCard>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--neo-text-primary)] mb-1">
                        Start Learning
                      </h3>
                      <p className="text-sm text-[var(--neo-text-secondary)]">
                        Explore the Topic Library and begin your journey
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--neo-accent-orange)]" />
                  </div>
                </NeoCard>
              </motion.div>
            </NeoCard>
          </div>

          {/* Recent Activity */}
          <div>
            <NeoCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-[var(--neo-accent-orange)]" />
                <h2 className="text-xl font-semibold text-[var(--neo-text-primary)]">
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <NeoCard variant="flat" className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-[var(--neo-accent-orange)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--neo-text-primary)] text-sm mb-1">
                            {activity.title}
                          </p>
                          <p className="text-xs text-[var(--neo-text-secondary)] mb-2">
                            {activity.desc}
                          </p>
                          <p className="text-xs text-[var(--neo-text-secondary)]">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </NeoCard>
                  </motion.div>
                ))}
              </div>
            </NeoCard>

            {/* Weekly Goal */}
            <NeoCard className="p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--neo-accent-success)]" />
                <h3 className="font-semibold text-[var(--neo-text-primary)]">
                  Weekly Goal
                </h3>
              </div>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-[var(--neo-accent-orange)] mb-2">
                  0/5
                </div>
                <p className="text-sm text-[var(--neo-text-secondary)]">
                  Topics this week
                </p>
              </div>
              <div className="w-full h-3 rounded-full bg-background shadow-inner">
                <div className="h-full rounded-full bg-[var(--neo-accent-success)] w-0" />
              </div>
            </NeoCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}