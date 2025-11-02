import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logSecurity, logAuth } from '../utils/logger.js';
import crypto from 'crypto';

// Store active CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of csrfTokens.entries()) {
        if (data.expires < now) {
            csrfTokens.delete(userId);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Generate CSRF token for a user
export const generateCSRFToken = (userId: string): string => {
    const token = crypto.randomBytes(32).toString('hex'); // 64 character hex string
    const expires = Date.now() + (20 * 60 * 1000); // 20 minutes

    csrfTokens.set(userId, { token, expires });

    return token;
};

// Validate CSRF token
const validateCSRFToken = (userId: string, token: string): boolean => {
    const stored = csrfTokens.get(userId);

    if (!stored) {
        return false;
    }

    // Check if token is expired
    if (stored.expires < Date.now()) {
        csrfTokens.delete(userId);
        return false;
    }

    // Compare tokens using timing-safe comparison
    return crypto.timingSafeEqual(
        Buffer.from(stored.token),
        Buffer.from(token)
    );
};

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
export const csrfProtection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
        next();
        return;
    }

    const csrfToken = req.headers['x-csrf-token'] as string;

    if (!csrfToken) {
        logSecurity('Missing CSRF token', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        });

        res.status(403).json({
            error: 'Forbidden',
            message: 'CSRF token required'
        });
        return;
    }

    // Validate token format
    if (csrfToken.length !== 64) { // 32 bytes = 64 hex characters
        logSecurity('Invalid CSRF token format', {
            ip: req.ip,
            tokenLength: csrfToken.length,
            userAgent: req.get('User-Agent')
        });

        res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid CSRF token'
        });
        return;
    }

    // Get user ID from the request (should be set by previous middleware)
    const userId = req.user?.id;

    if (!userId) {
        logSecurity('CSRF validation attempted without user context', {
            ip: req.ip
        });

        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
        return;
    }

    // Validate the CSRF token
    if (!validateCSRFToken(userId, csrfToken)) {
        logSecurity('Invalid CSRF token', {
            ip: req.ip,
            userId: userId,
            path: req.path,
            userAgent: req.get('User-Agent')
        });

        res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid CSRF token'
        });
        return;
    }

    // Token is valid, proceed
    next();
};

// Session timeout middleware
export const sessionTimeout = (req: Request, res: Response, next: NextFunction): void => {
    const sessionTimeoutMs = 20 * 60 * 1000; // 20 minutes

    // Add session timeout header
    res.setHeader('X-Session-Timeout', sessionTimeoutMs.toString());

    next();
};