import { createBrowserRouter, Navigate } from 'react-router';
import { Shell } from './components/layout/Shell';
import { LandingPage } from './pages/LandingPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProfilePage } from './features/auth/ProfilePage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TopicListPage } from './features/topics/TopicListPage';
import { TopicViewerPage } from './features/topics/TopicViewerPage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { TopicManagerPage } from './features/admin/TopicManagerPage';
import { TopicEditorPage } from './features/admin/TopicEditorPage';
import { AdminTranslationManager } from './features/admin/AdminTranslationManager';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { SystemSettingsPage } from './features/admin/SystemSettingsPage';
import { QuizSessionPage } from './features/quiz/QuizSessionPage';
import { QuizResultPage } from './features/quiz/QuizResultPage';
import { QuizListPage } from './features/quiz/QuizListPage';
import { AdminQuizManager } from './features/quiz/AdminQuizManager';
import { AdminQuizEditor } from './features/quiz/AdminQuizEditor';
import { useAuthStore } from './store/authStore';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell><LandingPage /></Shell>,
  },
  {
    path: '/login',
    element: <Shell><PublicRoute><LoginPage /></PublicRoute></Shell>,
  },
  {
    path: '/register',
    element: <Shell><PublicRoute><RegisterPage /></PublicRoute></Shell>,
  },
  {
    path: '/dashboard',
    element: <Shell><ProtectedRoute><DashboardPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/profile',
    element: <Shell><ProtectedRoute><ProfilePage /></ProtectedRoute></Shell>,
  },
  {
    path: '/topics',
    element: <Shell><ProtectedRoute><TopicListPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/topics/:slug',
    element: <Shell><ProtectedRoute><TopicViewerPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin',
    element: <Shell><ProtectedRoute><AdminDashboard /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/topics',
    element: <Shell><ProtectedRoute><TopicManagerPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/topics/new',
    element: <Shell><ProtectedRoute><TopicEditorPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/topics/:id/edit',
    element: <Shell><ProtectedRoute><TopicEditorPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/translations',
    element: <Shell><ProtectedRoute><AdminTranslationManager /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/users',
    element: <Shell><ProtectedRoute><UserManagementPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/settings',
    element: <Shell><ProtectedRoute><SystemSettingsPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/quiz',
    element: <Shell><ProtectedRoute><ComingSoonPage title="Quiz Hub" description="Browse and take quizzes from your enrolled topics" /></ProtectedRoute></Shell>,
  },
  {
    path: '/topics/:topicId/quizzes',
    element: <Shell><ProtectedRoute><QuizListPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/quiz/session/:quizId',
    element: <Shell><ProtectedRoute><QuizSessionPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/quiz/results/:attemptId',
    element: <Shell><ProtectedRoute><QuizResultPage /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/quizzes',
    element: <Shell><ProtectedRoute><AdminQuizManager /></ProtectedRoute></Shell>,
  },
  {
    path: '/admin/quizzes/edit/:id',
    element: <Shell><ProtectedRoute><AdminQuizEditor /></ProtectedRoute></Shell>,
  },
  {
    path: '/roadmap',
    element: <Shell><ProtectedRoute><ComingSoonPage title="Learning Roadmap" description="Your personalized, adaptive learning path" /></ProtectedRoute></Shell>,
  },
  {
    path: '/mentor',
    element: <Shell><ProtectedRoute><ComingSoonPage title="AI Mentor" description="Get personalized guidance and practice with your AI learning assistant" /></ProtectedRoute></Shell>,
  },
  {
    path: '/benchmark',
    element: <Shell><ProtectedRoute><ComingSoonPage title="Benchmark Lab" description="Performance testing and optimization playground" /></ProtectedRoute></Shell>,
  },
  {
    path: '/journal',
    element: <Shell><ProtectedRoute><ComingSoonPage title="Learning Journal" description="Document your learning journey with multilingual notes" /></ProtectedRoute></Shell>,
  },
  {
    path: '*',
    element: <Shell><NotFoundPage /></Shell>,
  },
]);