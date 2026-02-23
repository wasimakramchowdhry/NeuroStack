import { Home, BookOpen, Trophy, Map, MessageSquare, FlaskConical, BookMarked, LayoutDashboard, Shield } from 'lucide-react';
import { NeoCard } from '../neo/NeoCard';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Topics', path: '/topics' },
  { icon: Trophy, label: 'Quiz', path: '/quiz' },
  { icon: Map, label: 'Roadmap', path: '/roadmap' },
  { icon: MessageSquare, label: 'Mentor', path: '/mentor' },
  { icon: FlaskConical, label: 'Benchmark', path: '/benchmark' },
  { icon: BookMarked, label: 'Journal', path: '/journal' },
];

const adminNavItem = { icon: Shield, label: 'Admin', path: '/admin' };

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const items = user?.role === 'admin' ? [...navItems, adminNavItem] : navItems;

  return (
    <aside className="fixed left-6 top-24 bottom-6 w-20 z-40 hidden lg:block">
      <NeoCard className="h-full p-4 flex flex-col gap-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NeoCard
                variant={isActive ? 'inset' : 'default'}
                className={`p-3 cursor-pointer group relative ${
                  isActive ? 'bg-[var(--neo-accent-orange)]/10' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive
                      ? 'text-[var(--neo-accent-orange)]'
                      : 'text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-text-primary)]'
                  }`}
                />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-[var(--neo-accent-slate)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </NeoCard>
            </motion.div>
          );
        })}
      </NeoCard>
    </aside>
  );
}