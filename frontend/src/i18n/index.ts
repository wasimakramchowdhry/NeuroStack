import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// English translations bundled locally — these are the canonical defaults.
// Other languages are fetched from the backend API (Bhashini-translated).
const enTranslations: Record<string, string> = {
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "auth.welcomeBack": "Welcome Back",
    "auth.continueJourney": "Continue your AI learning journey",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign In",
    "auth.noAccount": "Don't have an account?",
    "auth.createOne": "Create one",
    "auth.createAccount": "Create Your Account",
    "auth.joinNeuroStack": "Join NeuroStack and master AI systems",
    "auth.fullName": "Full Name",
    "auth.confirmPassword": "Confirm Password",
    "auth.createAccountBtn": "Create Account",
    "auth.haveAccount": "Already have an account?",
    "auth.signInLink": "Sign in",
    "dashboard.welcomeBack": "Welcome back, {{name}}!",
    "dashboard.readyContinue": "Ready to continue your AI Systems mastery journey?",
    "dashboard.topics": "Topics",
    "dashboard.quizzes": "Quizzes",
    "dashboard.badges": "Badges",
    "dashboard.streak": "Streak",
    "dashboard.learningPath": "Your Learning Path",
    "dashboard.startLearning": "Start Learning",
    "dashboard.exploreTopics": "Explore the Topic Library and begin your journey",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.weeklyGoal": "Weekly Goal",
    "dashboard.topicsThisWeek": "Topics this week",
    "topics.library": "Topic Library",
    "topics.exploreCollection": "Explore our comprehensive collection of AI & ML topics",
    "topics.searchPlaceholder": "Search topics...",
    "topics.allDifficulties": "All Difficulties",
    "topics.beginner": "Beginner",
    "topics.intermediate": "Intermediate",
    "topics.advanced": "Advanced",
    "topics.noTopicsFound": "No topics found",
    "topics.adjustFilters": "Try adjusting your search or filters",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "quiz.testKnowledge": "Test Your Knowledge",
    "quiz.startQuiz": "Start Quiz",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.submitQuiz": "Submit Quiz",
    "quiz.yourScore": "Your Score",
    "quiz.retake": "Retake Quiz",
    "quiz.backToTopic": "Back to Topic",
};

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: 'en',

        // Bundle English locally, fetch other languages from backend
        partialBundledLanguages: true,
        resources: {
            en: { translation: enTranslations },
        },

        backend: {
            loadPath: `${API_BASE_URL}/translations/ui?lang={{lng}}`,
        },

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });

export default i18n;
