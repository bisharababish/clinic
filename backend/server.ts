// backend/server.ts

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Extend Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
// import './src/lib/sentry.js'; // Temporarily disabled due to integration issue
// import * as Sentry from '@sentry/node';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logAuth, logError, logInfo, logSecurity } from './src/utils/logger.js';
import { validateDeleteUser, sanitizeInput } from './src/middleware/validation.js';
import { healthCheck, simpleHealthCheck } from './src/middleware/healthCheck.js';
import { validateSession, csrfProtection, sessionTimeout } from './src/middleware/session.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Sentry request handler must be the first middleware
// app.use(Sentry.requestHandler()); // Temporarily disabled

// Sentry tracing handler
// app.use(Sentry.tracingHandler()); // Temporarily disabled

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS middleware - optimized for Render deployment
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'https://bethlehemmedcenter.com',
        'https://www.bethlehemmedcenter.com',
        'https://bethlehem-medical-center-frontend.onrender.com', // Render URL as fallback
        ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : [])
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInput);

// Session timeout middleware
app.use(sessionTimeout);

// Initialize Supabase with SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/simple', simpleHealthCheck);

// Authentication middleware
const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No valid authorization token provided'
            });
            return;
        }

        const token = authHeader.substring(7);

        // Verify token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
            return;
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('userinfo')
            .select('user_roles')
            .eq('user_email', user.email)
            .single();

        if (userError || !userData || userData.user_roles.toLowerCase() !== 'admin') {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required'
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        logError(error instanceof Error ? error : new Error('Authentication failed'), 'authenticate_admin');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Authentication failed'
        });
    }
};

// Delete auth user endpoint
app.post('/api/admin/delete-user', authenticateAdmin, validateDeleteUser, csrfProtection, async (req: Request, res: Response): Promise<void> => {
    try {
        const { authUserId } = req.body as { authUserId?: string };

        if (!authUserId) {
            res.status(400).json({
                error: 'Auth user ID is required',
                success: false
            });
            return;
        }

        // Log user deletion attempt
        logAuth('delete_user', authUserId, true);

        // Delete from auth.users using Admin API
        const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

        if (error) {
            logSecurity('Auth deletion failed', { error: error.message });
            res.status(400).json({
                error: 'Failed to delete auth user',
                detail: error.message,
                success: false
            });
            return;
        }

        // Auth user deleted successfully
        logAuth('delete_user', authUserId, true);

        res.status(200).json({
            success: true,
            message: 'Auth user deleted successfully',
            authUserId
        });

    } catch (error) {
        logError(error instanceof Error ? error : new Error('Unknown error'), 'delete_user');
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

// Sentry error handler (must be before other error handlers)
// app.use(Sentry.errorHandler({
//     shouldHandleError(error: any) {
//         // Don't report 4xx errors (client errors)
//         if (error.status && error.status >= 400 && error.status < 500) {
//             return false;
//         }
//         return true;
//     },
// }));

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logError(err, 'unhandled_error');
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
    });
};

app.use(errorHandler);

// Start server
app.listen(PORT, (): void => {
    logInfo(`Server started on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

export default app;