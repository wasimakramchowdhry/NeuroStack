import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useThemeStore } from './store/themeStore';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { Toaster } from 'sonner';
import { LanguageProvider } from '../i18n/LanguageProvider';
import '../i18n'; // Initialize i18next

export default function App() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
      />
    </ErrorBoundary>
  );
}