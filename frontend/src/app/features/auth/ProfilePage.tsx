import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoInput } from '../../components/neo/NeoInput';
import { NeoSelect } from '../../components/neo/NeoSelect';
import { NeoButton } from '../../components/neo/NeoButton';
import { useAuthStore } from '../../store/authStore';
import { SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { userAPI } from '../../services/api';
import { toast } from 'sonner';
import { User, Mail, Globe, Calendar, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user, accessToken, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    preferred_language: user?.preferred_language || 'en',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);

    try {
      const updatedUser = await userAPI.updateProfile(accessToken, formData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold text-[var(--neo-text-primary)] mb-8">
          Profile Settings
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <NeoCard className="p-6 md:col-span-1">
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block mb-4"
              >
                <NeoCard className="p-8 inline-block">
                  <User className="w-16 h-16 text-[var(--neo-accent-orange)]" />
                </NeoCard>
              </motion.div>
              <h2 className="text-xl font-semibold text-[var(--neo-text-primary)] mb-1">
                {user.full_name}
              </h2>
              <p className="text-sm text-[var(--neo-text-secondary)] mb-4">
                {user.role === 'admin' ? 'Administrator' : 'Learner'}
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[var(--neo-text-secondary)]" />
                  <span className="text-[var(--neo-text-secondary)]">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--neo-text-secondary)]" />
                  <span className="text-[var(--neo-text-secondary)]">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-[var(--neo-text-secondary)]" />
                  <span className="text-[var(--neo-text-secondary)]">
                    {user.role === 'admin' ? 'Admin Access' : 'Standard Access'}
                  </span>
                </div>
              </div>
            </div>
          </NeoCard>

          {/* Edit Form */}
          <NeoCard className="p-6 md:col-span-2">
            <h3 className="text-xl font-semibold text-[var(--neo-text-primary)] mb-6">
              Edit Profile
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <NeoInput
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />

              <div>
                <NeoInput
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[var(--neo-text-secondary)]">
                  Email cannot be changed
                </p>
              </div>

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
              />

              <div className="flex gap-3 pt-4">
                <NeoButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  Save Changes
                </NeoButton>
                <NeoButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData({
                      full_name: user.full_name,
                      preferred_language: user.preferred_language,
                    });
                  }}
                >
                  Reset
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <NeoCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--neo-accent-orange)] mb-2">
                0
              </div>
              <div className="text-sm text-[var(--neo-text-secondary)]">
                Topics Completed
              </div>
            </div>
          </NeoCard>
          
          <NeoCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--neo-accent-success)] mb-2">
                0
              </div>
              <div className="text-sm text-[var(--neo-text-secondary)]">
                Quizzes Passed
              </div>
            </div>
          </NeoCard>
          
          <NeoCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--neo-accent-slate)] mb-2">
                0h
              </div>
              <div className="text-sm text-[var(--neo-text-secondary)]">
                Learning Time
              </div>
            </div>
          </NeoCard>
        </div>
      </motion.div>
    </div>
  );
}
