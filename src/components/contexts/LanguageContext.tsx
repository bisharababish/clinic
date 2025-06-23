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
    const [isClient, setIsClient] = useState<boolean>(false);

    // Track if we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Set language explicitly
    const setLanguage = useCallback((newLanguage: Language) => {
        if (newLanguage === 'en' || newLanguage === 'ar') {
            setLanguageState(newLanguage);
            i18n.changeLanguage(newLanguage);

            // Only access localStorage and document if we're on the client
            if (isClient) {
                try {
                    localStorage.setItem('language', newLanguage);
                    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
                    document.documentElement.lang = newLanguage;
                } catch (error) {
                    console.warn('Error setting language:', error);
                }
            }

            setIsRTL(newLanguage === 'ar');
        }
    }, [i18n, isClient]);

    // Toggle language
    const toggleLanguage = useCallback(() => {
        const newLanguage = language === 'en' ? 'ar' : 'en';
        setLanguage(newLanguage);
    }, [language, setLanguage]);

    // Initialize language from localStorage or browser language
    // Use regular useEffect instead of useIsomorphicLayoutEffect
    useEffect(() => {
        // Only run on client side
        if (!isClient) return;

        try {
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage === 'en' || savedLanguage === 'ar') {
                setLanguage(savedLanguage as Language);
            } else {
                const browserLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
                setLanguage(browserLanguage as Language);
            }
        } catch (error) {
            console.warn('Error accessing localStorage:', error);
            // Fallback to English if there's an error
            setLanguage('en');
        }
    }, [isClient, setLanguage]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};