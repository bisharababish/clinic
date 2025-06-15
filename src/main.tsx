import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './components/contexts/ThemeContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Handle the redirect path from sessionStorage
const handleRedirectPath = () => {
    const redirectPath = sessionStorage.getItem('redirect-path');
    if (redirectPath) {
        sessionStorage.removeItem('redirect-path');
        // Replace the current history state with the intended path
        window.history.replaceState(null, '', redirectPath);
    }
};

// Call this before rendering the app
handleRedirectPath();

ReactDOM.createRoot(document.getElementById("root")!).render(
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