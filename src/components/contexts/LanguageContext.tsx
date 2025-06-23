// src/components/contexts/LanguageContext.tsx
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'ar';

export interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
    isRTL: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    toggleLanguage: () => { },
    isRTL: false,
});

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguageState] = useState<Language>('en');
    const [isRTL, setIsRTL] = useState<boolean>(false);

    // Set language explicitly
    const setLanguage = useCallback((newLanguage: Language) => {
        if (newLanguage === 'en' || newLanguage === 'ar') {
            setLanguageState(newLanguage);
            i18n.changeLanguage(newLanguage);

            // Safe localStorage access
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('language', newLanguage);
            }

            setIsRTL(newLanguage === 'ar');

            // Safe document access
            if (typeof document !== 'undefined') {
                document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = newLanguage;
            }
        }
    }, [i18n]);

    // Toggle language
    const toggleLanguage = useCallback(() => {
        const newLanguage = language === 'en' ? 'ar' : 'en';
        setLanguage(newLanguage);
    }, [language, setLanguage]);

    // Initialize language from localStorage or browser language - using useEffect instead
    useEffect(() => {
        // Check if we're in browser environment
        if (typeof window === 'undefined') return;

        let savedLanguage: string | null = null;

        // Safe localStorage access
        try {
            savedLanguage = localStorage.getItem('language');
        } catch (e) {
            console.warn('localStorage not available');
        }

        if (savedLanguage === 'en' || savedLanguage === 'ar') {
            setLanguage(savedLanguage as Language);
        } else {
            // Safe navigator access
            const browserLanguage = typeof navigator !== 'undefined' && navigator.language ?
                (navigator.language.startsWith('ar') ? 'ar' : 'en') : 'en';
            setLanguage(browserLanguage as Language);
        }
    }, [setLanguage]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};