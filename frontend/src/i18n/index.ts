import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',

        // We only fetch from the backend if it's NOT english, 
        // English is the hardcoded default in the codebase components.
        backend: {
            loadPath: 'http://localhost:8000/api/v1/translations/ui?lang={{lng}}',
        },

        interpolation: {
            escapeValue: false, // React already safeguards from XSS
        },

        react: {
            useSuspense: false // Handle loading state manually for smoother UX
        }
    });

export default i18n;
