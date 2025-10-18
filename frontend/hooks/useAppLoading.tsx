// hooks/useAppLoading.tsx - Unified loading state manager
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppLoadingState {
    isAppLoading: boolean;
    loadingMessage: string;
    setLoading: (loading: boolean, message?: string) => void;
}

const AppLoadingContext = createContext<AppLoadingState | undefined>(undefined);

export const AppLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    const setLoading = (loading: boolean, message = 'Loading...') => {
        setIsAppLoading(loading);
        setLoadingMessage(message);
    };

    // Auto-disable loading after 3 seconds max
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const value: AppLoadingState = {
        isAppLoading,
        loadingMessage,
        setLoading,
    };

    return (
        <AppLoadingContext.Provider value={value}>
            {children}
        </AppLoadingContext.Provider>
    );
};

export const useAppLoading = () => {
    const context = useContext(AppLoadingContext);
    if (context === undefined) {
        throw new Error('useAppLoading must be used within an AppLoadingProvider');
    }
    return context;
};


