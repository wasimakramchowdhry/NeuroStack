import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { settingsAPI, type PlatformSettings } from '../../services/adminApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../store/authStore';
import { Settings, Server, Database, Shield, Bot, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsAPI.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">Failed to load settings.</p>
        <NeoButton className="mt-4" onClick={loadSettings}>Retry</NeoButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            System Settings
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-14">
          Platform configuration overview
        </p>
      </div>

      <div className="space-y-6">
        {/* Platform Info */}
        <SettingsSection
          icon={<Server className="w-5 h-5 text-white" />}
          title="Platform"
          gradient="from-slate-500 to-slate-600"
        >
          <SettingsRow label="Name" value={settings.platform.name} />
          <SettingsRow label="Version" value={settings.platform.version} />
          <SettingsRow label="API Prefix" value={settings.platform.api_prefix} />
        </SettingsSection>

        {/* AI Service */}
        <SettingsSection
          icon={<Bot className="w-5 h-5 text-white" />}
          title="AI Service"
          gradient="from-emerald-500 to-emerald-600"
        >
          <SettingsRow label="Provider" value={settings.ai_service.provider} />
          <SettingsRow label="Base URL" value={settings.ai_service.base_url} />
          <SettingsRow label="Active Model" value={settings.ai_service.model} />
          <SettingsRow
            label="Status"
            value={
              <Badge className={
                settings.ai_service.status === 'online'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }>
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                  settings.ai_service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {settings.ai_service.status === 'online' ? 'Online' : 'Offline'}
              </Badge>
            }
          />
          {settings.ai_service.available_models.length > 0 && (
            <SettingsRow
              label="Available Models"
              value={
                <div className="flex flex-wrap gap-2">
                  {settings.ai_service.available_models.map((m) => (
                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                  ))}
                </div>
              }
            />
          )}
        </SettingsSection>

        {/* Database */}
        <SettingsSection
          icon={<Database className="w-5 h-5 text-white" />}
          title="Database"
          gradient="from-blue-500 to-blue-600"
        >
          <SettingsRow label="Server" value={settings.database.server} />
          <SettingsRow label="Port" value={String(settings.database.port)} />
          <SettingsRow label="Database" value={settings.database.name} />
        </SettingsSection>

        {/* Auth */}
        <SettingsSection
          icon={<Shield className="w-5 h-5 text-white" />}
          title="Authentication"
          gradient="from-orange-500 to-orange-600"
        >
          <SettingsRow label="Algorithm" value={settings.auth.algorithm} />
          <SettingsRow label="Access Token Expiry" value={`${settings.auth.access_token_expire_minutes} minutes`} />
          <SettingsRow label="Refresh Token Expiry" value={`${settings.auth.refresh_token_expire_days} days`} />
        </SettingsSection>

        {/* CORS */}
        <SettingsSection
          icon={<Globe className="w-5 h-5 text-white" />}
          title="CORS Origins"
          gradient="from-cyan-500 to-cyan-600"
        >
          {settings.cors_origins.map((origin, i) => (
            <SettingsRow key={i} label={`Origin ${i + 1}`} value={origin} />
          ))}
        </SettingsSection>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link to="/admin">
          <NeoButton variant="ghost">← Back to Admin Dashboard</NeoButton>
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helper Components
// ──────────────────────────────────────────────

function SettingsSection({
  icon,
  title,
  gradient,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <NeoCard className="overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </NeoCard>
  );
}

function SettingsRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {typeof value === 'string' ? value : value}
      </span>
    </div>
  );
}
