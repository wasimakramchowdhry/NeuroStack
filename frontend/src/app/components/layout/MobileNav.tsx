import { Home, BookOpen, Trophy, Map, User, Shield } from 'lucide-react';
import { NeoCard } from '../neo/NeoCard';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: BookOpen, label: 'Topics', path: '/topics' },
  { icon: Trophy, label: 'Quiz', path: '/quiz' },
  { icon: Map, label: 'Roadmap', path: '/roadmap' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const adminNavItem = { icon: Shield, label: 'Admin', path: '/admin' };

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const items = user?.role === 'admin' ? [...navItems.slice(0, 4), adminNavItem] : navItems;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 lg:hidden">
      <NeoCard className="px-3 py-2">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative p-3 flex flex-col items-center gap-1"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-[var(--neo-accent-orange)]'
                      : 'text-[var(--neo-text-secondary)]'
                  }`}
                />
                <span
                  className={`text-xs transition-colors ${
                    isActive
                      ? 'text-[var(--neo-accent-orange)] font-medium'
                      : 'text-[var(--neo-text-secondary)]'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--neo-accent-orange)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </NeoCard>
    </div>
  );
}