// contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => { } // Default empty function
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // Apply theme to document
    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme class
        root.classList.remove('light', 'dark');

        // Add new theme class
        root.classList.add(theme);

        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};