import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoInput } from '../../components/neo/NeoInput';
import { NeoSelect } from '../../components/neo/NeoSelect';
import { NeoButton } from '../../components/neo/NeoButton';
import { AnimatedLogo } from '../../components/brand/AnimatedLogo';
import { useAuthStore } from '../../store/authStore';
import { SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { Brain, Mail, Lock, User, Globe } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    preferred_language: 'en',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      
      // Auto-login after registration
      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      setAuth(loginResponse.user, loginResponse.access_token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
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
              {t('auth.createAccount', 'Create Your Account')}
            </h1>
            <p className="text-[var(--neo-text-secondary)]">
              {t('auth.joinNeuroStack', 'Join NeuroStack and master AI systems')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-[46px] w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none z-10" />
                <NeoInput
                  label={t('auth.fullName', 'Full Name')}
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  error={errors.full_name}
                  required
                  className="pl-12"
                />
              </div>

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

              <div className="relative">
                <Lock className="absolute left-4 top-[46px] w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none z-10" />
                <NeoInput
                  label={t('auth.confirmPassword', 'Confirm Password')}
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  error={errors.confirmPassword}
                  required
                  className="pl-12"
                />
              </div>

              <div className="relative">
                <Globe className="absolute left-4 top-[46px] w-5 h-5 text-[var(--neo-text-secondary)] pointer-events-none z-10" />
                <NeoSelect
                  label="Preferred Language"
                  value={formData.preferred_language}
                  onChange={(e) =>
                    setFormData({ ...formData, preferred_language: e.target.value })
                  }
                  options={SUPPORTED_LANGUAGES.map((lang) => ({
                    value: lang.code,
                    label: `${lang.nativeName} (${lang.name})`,
                  }))}
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
              {t('auth.createAccountBtn', 'Create Account')}
            </NeoButton>

            <div className="text-center">
              <p className="text-[var(--neo-text-secondary)] text-sm">
                {t('auth.haveAccount', 'Already have an account?')}{' '}
                <Link
                  to="/login"
                  className="text-[var(--neo-accent-orange)] hover:underline font-medium"
                >
                  {t('auth.signInLink', 'Sign in')}
                </Link>
              </p>
            </div>
          </form>
        </NeoCard>
      </motion.div>
    </div>
  );
}