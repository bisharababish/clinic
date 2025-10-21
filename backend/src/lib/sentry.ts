import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry for backend
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations: [
        // Enable HTTP calls tracing
        Sentry.httpIntegration({
            tracing: {
                // Disable tracing for health checks
                ignoreIncomingRequestHook: (request) => {
                    return request.url?.includes('/health') || false;
                },
            },
        }),
        // Enable profiling
        nodeProfilingIntegration(),
    ],

    // Filter out non-critical errors
    beforeSend(event, hint) {
        // Don't send errors from health checks
        if (event.exception) {
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as Error).message;
                if (message.includes('health') || message.includes('ping')) {
                    return null;
                }
            }
        }

        // Don't send rate limiting errors
        if (event.exception) {
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as Error).message;
                if (message.includes('Too many requests') || message.includes('Rate limit')) {
                    return null;
                }
            }
        }

        return event;
    },

    // Add server context
    beforeSendTransaction(event) {
        // Filter out health check transactions
        if (event.transaction?.includes('/health')) {
            return null;
        }
        return event;
    },
});

// Custom error handler for Express
export const sentryErrorHandler = Sentry.errorHandler({
    // Don't report 4xx errors (client errors)
    shouldHandleError(error: any) {
        if (error.status && error.status >= 400 && error.status < 500) {
            return false;
        }
        return true;
    },
});

// Utility functions for manual error reporting
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setContext = Sentry.setContext;
export const setTag = Sentry.setTag;

export default Sentry;
