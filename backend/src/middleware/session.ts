import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logSecurity, logAuth } from '../utils/logger.js';

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No valid session token provided'
            });
            return;
        }

        const token = authHeader.substring(7);

        // Create a client to verify the session
        const supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_ANON_KEY as string
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logSecurity('Invalid session token', {
                error: error?.message,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired session'
            });
            return;
        }

        // User is authenticated; rely on Supabase token validity

        req.user = user;
        logAuth('session_validated', user.id, true);
        next();

    } catch (error) {
        logSecurity('Session validation error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Session validation failed'
        });
    }
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
        next();
        return;
    }

    const csrfToken = req.headers['x-csrf-token'] as string;
    const sessionToken = req.headers.authorization?.substring(7);

    if (!csrfToken || !sessionToken) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'CSRF token required'
        });
        return;
    }

    // Simple CSRF validation (in production, use proper CSRF library)
    if (csrfToken.length < 32) {
        logSecurity('Invalid CSRF token', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid CSRF token'
        });
        return;
    }

    next();
};

// Session timeout middleware
export const sessionTimeout = (req: Request, res: Response, next: NextFunction): void => {
    const sessionTimeoutMs = 20 * 60 * 1000; // 20 minutes

    // Add session timeout header
    res.setHeader('X-Session-Timeout', sessionTimeoutMs.toString());

    next();
};
