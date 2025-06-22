import React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './components/contexts/ThemeContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// CRITICAL FIX: Ensure React is properly available for all vendor libraries
if (typeof window !== 'undefined') {
    // Make React globally available to prevent vendor bundle issues
    window.React = React;
    window.ReactDOM = ReactDOM;

    // Fix for useLayoutEffect in SSR/vendor environments
    if (typeof document === 'undefined') {
        React.useLayoutEffect = React.useEffect;
    }
}

ReactDOMClient.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider>
            <LanguageProvider>
                <I18nextProvider i18n={i18n}>
                    <App />
                </I18nextProvider>
            </LanguageProvider>
        </ThemeProvider>
    </React.StrictMode>
);