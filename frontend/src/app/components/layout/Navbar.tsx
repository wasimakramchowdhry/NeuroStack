import { Brain, Moon, Sun, Globe, User, LogOut } from 'lucide-react';
import { NeoCard } from '../neo/NeoCard';
import { NeoToggle } from '../neo/NeoToggle';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

export function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const languageMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4">
      <NeoCard className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <NeoCard className="p-3 cursor-pointer" onClick={() => navigate('/')}>
                <Brain className="w-6 h-6 text-[var(--neo-accent-orange)]" />
              </NeoCard>
            </motion.div>
            <h1 className="text-xl font-semibold text-[var(--neo-text-primary)]">
              NeuroStack
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <NeoCard className="p-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-[var(--neo-text-secondary)]" />
              <NeoToggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <Moon className="w-4 h-4 text-[var(--neo-text-secondary)]" />
            </NeoCard>

            {/* Language Selector */}
            {user && (
              <div className="relative" ref={languageMenuRef}>
                <NeoCard
                  className="p-3 cursor-pointer"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                >
                  <Globe className="w-5 h-5 text-[var(--neo-text-primary)]" />
                </NeoCard>

                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 max-h-64 overflow-y-auto"
                  >
                    <NeoCard className="p-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${language === lang.code
                              ? 'bg-[var(--neo-accent-orange)] text-white'
                              : 'hover:bg-[var(--neo-shadow-dark)]/10'
                            }`}
                        >
                          <div className="font-medium">{lang.nativeName}</div>
                          <div className="text-xs opacity-70">{lang.name}</div>
                        </button>
                      ))}
                    </NeoCard>
                  </motion.div>
                )}
              </div>
            )}

            {/* User Menu */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <NeoCard
                  className="p-3 cursor-pointer flex items-center gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-5 h-5 text-[var(--neo-text-primary)]" />
                </NeoCard>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64"
                  >
                    <NeoCard className="p-4">
                      <div className="mb-3 pb-3 border-b border-border">
                        <p className="font-medium text-[var(--neo-text-primary)]">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-[var(--neo-text-secondary)]">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--neo-shadow-dark)]/10 flex items-center gap-2 mb-1"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.profile', 'Profile')}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout', 'Logout')}
                      </button>
                    </NeoCard>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </NeoCard>
    </nav>
  );
}