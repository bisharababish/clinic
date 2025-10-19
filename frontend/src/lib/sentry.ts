import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    integrations: [
        new BrowserTracing(),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session Replay (optional, for debugging)
    replaysSessionSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,

    // Filter out non-critical errors
    beforeSend(event, hint) {
        // Don't send errors from browser extensions
        if (event.exception) {
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as Error).message;
                if (message.includes('Non-Error promise rejection') ||
                    message.includes('ResizeObserver loop limit exceeded') ||
                    message.includes('Script error')) {
                    return null;
                }
            }
        }

        // Don't send 404 errors
        if (event.exception) {
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as Error).message;
                if (message.includes('404') || message.includes('Failed to fetch')) {
                    return null;
                }
            }
        }

        return event;
    },

    // Add user context
    beforeSendTransaction(event) {
        // Filter out health check transactions
        if (event.transaction?.includes('/health')) {
            return null;
        }
        return event;
    },
});

// Custom error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Utility functions for manual error reporting
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setContext = Sentry.setContext;
export const setTag = Sentry.setTag;

export default Sentry;
