import React, { useEffect, useRef } from 'react';
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
    const initialSyncDone = useRef(false);

    // On mount: sync from user's saved preference (one-time)
    useEffect(() => {
        if (!initialSyncDone.current && user?.preferred_language) {
            initialSyncDone.current = true;
            if (user.preferred_language !== language) {
                setLanguage(user.preferred_language);
            }
        }
    }, [user?.preferred_language]); // eslint-disable-line react-hooks/exhaustive-deps

    // When Zustand language changes, sync i18next and persist to backend
    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }

        // Persist to backend if authenticated and different from saved preference
        if (isAuthenticated && user && language !== user.preferred_language) {
            userAPI.updateProfile({ preferred_language: language })
                .catch((err: any) => console.error("Failed to persist language preference:", err));
        }
    }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

    return <>{children}</>;
}
