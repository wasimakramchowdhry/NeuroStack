import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../app/store/languageStore';
import { useAuthStore } from '../app/store/authStore';
import { userAPI } from '../app/services/api';

interface LanguageProviderProps {
    children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useLanguageStore();
    const { isAuthenticated, user } = useAuthStore();

    // 1. On Mount: sync Zustand state with detected/saved language
    useEffect(() => {
        if (user?.preferred_language && user.preferred_language !== language) {
            setLanguage(user.preferred_language);
            i18n.changeLanguage(user.preferred_language);
        } else {
            i18n.changeLanguage(language);
        }
    }, [user, language, setLanguage, i18n]);

    // 2. Global listener for language swaps
    useEffect(() => {
        i18n.changeLanguage(language);

        // If authenticated, persist their choice back to the DB immediately
        if (isAuthenticated && language !== user?.preferred_language) {
            userAPI.updateProfile({ preferred_language: language })
                .catch((err: any) => console.error("Failed to persist language preference:", err));
        }
    }, [language, isAuthenticated, user, i18n]);

    // We do not block render here so Suspense doesn't flicker
    return <>{children}</>;
}
