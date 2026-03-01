import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoInput } from '../../components/neo/NeoInput';
import { NeoButton } from '../../components/neo/NeoButton';
import { AnimatedLogo } from '../../components/brand/AnimatedLogo';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { Brain, Mail, Lock } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setAuth(response.user, response.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <NeoCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <AnimatedLogo size="md" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--neo-text-primary)] mb-2">
              {t('auth.welcomeBack', 'Welcome Back')}
            </h1>
            <p className="text-[var(--neo-text-secondary)]">
              {t('auth.continueJourney', 'Continue your AI learning journey')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-[46px] w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none z-10" />
                <NeoInput
                  label={t('auth.email', 'Email')}
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                  required
                  className="pl-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-[46px] w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none z-10" />
                <NeoInput
                  label={t('auth.password', 'Password')}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={errors.password}
                  required
                  className="pl-12"
                />
              </div>
            </div>

            {errors.general && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            <NeoButton
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {t('auth.signIn', 'Sign In')}
            </NeoButton>

            <div className="text-center">
              <p className="text-[var(--neo-text-secondary)] text-sm">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <Link
                  to="/register"
                  className="text-[var(--neo-accent-orange)] hover:underline font-medium"
                >
                  {t('auth.createOne', 'Create one')}
                </Link>
              </p>
            </div>
          </form>
        </NeoCard>

        {/* Demo Info */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <NeoCard className="p-4 bg-[var(--neo-accent-orange)]/5">
            <p className="text-sm text-[var(--neo-text-secondary)] text-center">
              <span className="font-medium text-[var(--neo-accent-orange)]">Demo Mode:</span>{' '}
              Register to create a test account
            </p>
          </NeoCard>
        </motion.div> */}
      </motion.div>
    </div>
  );
}