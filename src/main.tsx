// Add this at the very top of your main.tsx, before any imports
if (typeof window === "undefined") {
    // More comprehensive polyfill for SSR
    const { useEffect } = await import('react');
    const React = await import('react');
    globalThis.React = React;
    globalThis.React.useLayoutEffect = useEffect;

    // Also patch it on the global object
    globalThis.useLayoutEffect = useEffect;
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from './components/contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <LanguageProvider>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </LanguageProvider>
    </React.StrictMode>
);