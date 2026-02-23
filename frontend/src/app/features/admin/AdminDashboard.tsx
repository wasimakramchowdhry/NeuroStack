import { Link } from 'react-router';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Shield, BookOpen, Users, Settings, Languages, Target } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router';

export function AdminDashboard() {
  const { user } = useAuthStore();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const adminCards = [
    {
      title: 'Topic Management',
      description: 'Create, edit, and manage learning topics',
      icon: BookOpen,
      href: '/admin/topics',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Translation Manager',
      description: 'Manage AI localization of learning content',
      icon: Languages,
      href: '/admin/translations',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'Quiz Management',
      description: 'Create and evaluate dynamic quizzes',
      icon: Target,
      href: '/admin/quizzes',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-14">
          Manage content, users, and platform settings
        </p>
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} to={card.href} className="block group">
              <NeoCard className="p-6 hover:shadow-xl transition-all duration-300 h-full">
                <div className={`p-4 rounded-lg bg-gradient-to-br ${card.color} inline-block mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </NeoCard>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeoCard className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Total Topics
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            5
          </div>
        </NeoCard>
        <NeoCard className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Active Users
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            124
          </div>
        </NeoCard>
        <NeoCard className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Completion Rate
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            68%
          </div>
        </NeoCard>
      </div>

      {/* Admin Actions */}
      <NeoCard className="p-6 mt-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/topics/new">
            <NeoButton className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Create New Topic
            </NeoButton>
          </Link>
          <NeoButton variant="secondary">
            View Analytics
          </NeoButton>
          <NeoButton variant="secondary">
            Export Data
          </NeoButton>
        </div>
      </NeoCard>
    </div>
  );
}
