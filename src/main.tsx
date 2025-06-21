import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './components/contexts/ThemeContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <LanguageProvider>
                    <I18nextProvider i18n={i18n}>
                        <App />
                    </I18nextProvider>
                </LanguageProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);