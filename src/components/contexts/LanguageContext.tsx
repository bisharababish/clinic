// src/components/contexts/LanguageContext.tsx
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useIsomorphicLayoutEffect from '../../../src/hooks/useIsomorphicLayoutEffect';


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
            localStorage.setItem('language', newLanguage);
            setIsRTL(newLanguage === 'ar');
            document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = newLanguage;
        }
    }, [i18n]);

    // Toggle language
    const toggleLanguage = useCallback(() => {
        const newLanguage = language === 'en' ? 'ar' : 'en';
        setLanguage(newLanguage);
    }, [language, setLanguage]);

    // Initialize language from localStorage or browser language
    useIsomorphicLayoutEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage === 'en' || savedLanguage === 'ar') {
            setLanguage(savedLanguage as Language);
        } else {
            const browserLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
            setLanguage(browserLanguage as Language);
        }
    }, [setLanguage]);
    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};