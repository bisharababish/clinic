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
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logAuth, logError, logInfo, logSecurity } from './src/utils/logger.js';
import { validateDeleteUser, validateUpdatePassword, sanitizeInput } from './src/middleware/validation.js';
import { healthCheck, simpleHealthCheck } from './src/middleware/healthCheck.js';
import { validateSession, csrfProtection, sessionTimeout, generateCSRFToken } from './src/middleware/session.js';
import { buildHostedCheckoutPayload, verifyHostedCheckoutSignature, normalizeHostedCheckoutFields } from './api/payments/hosted-checkout.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10000;

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
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS middleware - Enhanced
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://bethlehemmedcenter.com',
            'https://www.bethlehemmedcenter.com',
            'https://bethlehem-medical-center-frontend.onrender.com',
        ];

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('⚠️ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept'
    ],
    exposedHeaders: ['X-Session-Timeout'],
    maxAge: 86400,
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

// Root endpoint - simple response for deployment health checks
app.get('/', (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'ok',
        service: 'bethlehem-medical-center-backend',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/simple', simpleHealthCheck);

// CSRF Token endpoint - Enhanced with logging
app.get('/api/csrf-token', validateSession, (req: Request, res: Response): void => {
    try {
        console.log('🔐 CSRF token request received');

        const userId = req.user?.id;
        console.log('👤 User ID from request:', userId ? 'Present' : 'Missing');

        if (!userId) {
            console.error('❌ No user ID in request object');
            res.status(401).json({
                error: 'Unauthorized',
                message: 'User authentication required'
            });
            return;
        }

        console.log('🔑 Generating CSRF token for user:', userId);
        const csrfToken = generateCSRFToken(userId);
        console.log('✅ CSRF token generated, length:', csrfToken.length);

        res.status(200).json({
            csrfToken,
            expiresIn: 20 * 60 * 1000
        });

        logAuth('csrf_token_generated', userId, true);
        console.log('✅ CSRF token sent to client');

    } catch (error) {
        console.error('❌ CSRF token generation error:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        logError(
            error instanceof Error ? error : new Error('CSRF token generation failed'),
            'csrf_token_generation'
        );

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to generate CSRF token',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// CyberSource Secure Acceptance Hosted Checkout session generator
app.post('/api/payments/cybersource/session', validateSession, csrfProtection, (req: Request, res: Response): void => {
    try {
        const {
            amount,
            currency = 'ILS',
            referenceNumber,
            locale,
            transactionType,
            successUrl,
            cancelUrl,
        } = req.body as {
            amount?: number | string;
            currency?: string;
            referenceNumber?: string;
            locale?: string;
            transactionType?: string;
            successUrl?: string;
            cancelUrl?: string;
        };

        if (!amount || !referenceNumber) {
            res.status(400).json({
                success: false,
                error: 'Amount and reference number are required',
            });
            return;
        }

        const payload = buildHostedCheckoutPayload({
            amount,
            currency,
            referenceNumber: String(referenceNumber),
            locale,
            transactionType,
            successUrl,
            cancelUrl,
        });

        res.status(200).json({
            success: true,
            endpoint: payload.endpoint,
            fields: payload.fields,
            transactionUuid: payload.transactionUuid,
            signedDateTime: payload.signedDateTime,
        });

    } catch (error) {
        console.error('❌ Hosted checkout session error:', error);
        logError(error instanceof Error ? error : new Error('Hosted checkout session failed'), 'cybersource_hosted_checkout');
        res.status(500).json({
            success: false,
            error: 'Failed to generate hosted checkout session payload',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.post('/api/payments/cybersource/confirm', validateSession, csrfProtection, async (req: Request, res: Response): Promise<void> => {
    try {
        const { fields } = req.body as { fields?: Record<string, unknown> };

        if (!fields || typeof fields !== 'object') {
            res.status(400).json({
                success: false,
                error: 'Hosted checkout confirmation requires response fields',
            });
            return;
        }

        const normalizedFields = normalizeHostedCheckoutFields(fields);

        if (!verifyHostedCheckoutSignature(normalizedFields)) {
            logSecurity('Invalid CyberSource signature detected', {
                referenceNumber: normalizedFields.reference_number,
                transactionId: normalizedFields.transaction_id,
            });

            res.status(400).json({
                success: false,
                error: 'Signature verification failed',
            });
            return;
        }

        const decision = normalizedFields.decision || normalizedFields.auth_response;
        const referenceNumber = normalizedFields.req_reference_number || normalizedFields.reference_number;
        const transactionId = normalizedFields.transaction_id || normalizedFields.request_id || normalizedFields.payment_token;
        const amountValue = normalizedFields.auth_amount || normalizedFields.amount || '0';
        const currency = normalizedFields.req_currency || normalizedFields.currency || 'ILS';

        let amount = parseFloat(amountValue);
        if (Number.isNaN(amount)) {
            amount = 0;
        }
        const status = decision === 'ACCEPT' ? 'completed' : 'failed';

        if (!referenceNumber) {
            res.status(400).json({
                success: false,
                error: 'Missing reference number in CyberSource response',
            });
            return;
        }

        const now = new Date().toISOString();
        const updates: Array<Promise<unknown>> = [];

        if (referenceNumber.startsWith('APT-')) {
            const bookingId = referenceNumber.replace('APT-', '');

            updates.push(
                supabaseAdmin
                    .from('payment_bookings')
                    .update({
                        payment_status: status === 'completed' ? 'paid' : 'failed',
                        payment_method: 'visa',
                        gateway_transaction_id: transactionId,
                        gateway_name: 'cybersource',
                        updated_at: now,
                    })
                    .eq('id', bookingId)
            );

            updates.push(
                supabaseAdmin
                    .from('payment_transactions')
                    .insert({
                        payment_booking_id: bookingId,
                        payment_method: 'visa',
                        amount,
                        currency,
                        transaction_status: status,
                        transaction_id: transactionId,
                        gateway_transaction_id: transactionId,
                        gateway_name: 'cybersource',
                        gateway_response: normalizedFields,
                    })
            );
        } else if (referenceNumber.startsWith('SR-')) {
            const requestId = referenceNumber.replace('SR-', '');

            updates.push(
                supabaseAdmin
                    .from('service_requests')
                    .update({
                        payment_status: status === 'completed' ? 'paid' : 'failed',
                        payment_method: 'visa',
                        gateway_transaction_id: transactionId,
                        gateway_name: 'cybersource',
                        updated_at: now,
                    })
                    .eq('id', requestId)
            );

            updates.push(
                supabaseAdmin
                    .from('payment_transactions')
                    .insert({
                        payment_booking_id: requestId,
                        payment_method: 'visa',
                        amount,
                        currency,
                        transaction_status: status,
                        transaction_id: transactionId,
                        gateway_transaction_id: transactionId,
                        gateway_name: 'cybersource',
                        gateway_response: normalizedFields,
                    })
            );
        } else {
            logError(new Error(`Unknown CyberSource reference prefix for ${referenceNumber}`), 'cybersource_hosted_checkout_confirm');
        }

        await Promise.all(updates);

        res.status(200).json({
            success: true,
            status,
            decision,
            referenceNumber,
            transactionId,
            amount,
            currency,
        });

    } catch (error) {
        console.error('❌ Hosted checkout confirmation error:', error);
        logError(error instanceof Error ? error : new Error('Hosted checkout confirmation failed'), 'cybersource_hosted_checkout_confirm');
        res.status(500).json({
            success: false,
            error: 'Failed to process hosted checkout confirmation',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

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

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
            return;
        }

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

// Update password endpoint
app.post('/api/admin/update-password', authenticateAdmin, validateUpdatePassword, csrfProtection, async (req: Request, res: Response): Promise<void> => {
    try {
        const { userEmail, newPassword } = req.body as { userEmail?: string; newPassword?: string };

        if (!userEmail || !newPassword) {
            res.status(400).json({
                error: 'User email and new password are required',
                success: false
            });
            return;
        }

        logAuth('update_password', userEmail, true);

        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            logSecurity('Failed to list users for password update', { error: listError.message });
            res.status(400).json({
                error: 'Failed to list users',
                detail: listError.message,
                success: false
            });
            return;
        }

        const usersList: Array<{ email?: string; id: string }> = existingUsers?.users ?? [];
        const targetUser = usersList.find(u => u.email && u.email === userEmail);

        if (!targetUser) {
            logSecurity('User not found for password update', { email: userEmail });
            res.status(404).json({
                error: 'User not found',
                detail: 'No user found with the provided email',
                success: false
            });
            return;
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { password: newPassword }
        );

        if (updateError) {
            logSecurity('Password update failed', { error: updateError.message, email: userEmail });
            res.status(400).json({
                error: 'Failed to update password',
                detail: updateError.message,
                success: false
            });
            return;
        }

        logAuth('update_password', userEmail, true);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            userEmail
        });

    } catch (error) {
        logError(error instanceof Error ? error : new Error('Unknown error'), 'update_password');
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

// Confirm email endpoint for admin-created users
app.post('/api/admin/confirm-email', authenticateAdmin, csrfProtection, async (req: Request, res: Response): Promise<void> => {
    try {
        const { userEmail } = req.body as { userEmail?: string };

        if (!userEmail) {
            res.status(400).json({
                error: 'User email is required',
                success: false
            });
            return;
        }

        logAuth('confirm_email', userEmail, true);

        // Find user by email
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            logSecurity('Failed to list users for email confirmation', { error: listError.message });
            res.status(400).json({
                error: 'Failed to list users',
                detail: listError.message,
                success: false
            });
            return;
        }

        const usersList: Array<{ email?: string; id: string }> = existingUsers?.users ?? [];
        const targetUser = usersList.find(u => u.email && u.email.toLowerCase() === userEmail.toLowerCase());

        if (!targetUser) {
            logSecurity('User not found for email confirmation', { email: userEmail });
            res.status(404).json({
                error: 'User not found',
                detail: 'No user found with the provided email',
                success: false
            });
            return;
        }

        // Confirm the user's email
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { email_confirm: true }
        );

        if (updateError) {
            logSecurity('Email confirmation failed', { error: updateError.message, email: userEmail });
            res.status(400).json({
                error: 'Failed to confirm email',
                detail: updateError.message,
                success: false
            });
            return;
        }

        logAuth('confirm_email', userEmail, true);

        res.status(200).json({
            success: true,
            message: 'Email confirmed successfully',
            userEmail
        });

    } catch (error) {
        logError(error instanceof Error ? error : new Error('Unknown error'), 'confirm_email');
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

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

        logAuth('delete_user', authUserId, true);

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
app.listen(PORT, '0.0.0.0', (): void => {
    logInfo(`Server started on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        service: 'bethlehem-medical-center',
        timestamp: new Date().toISOString()
    });
});

export default app;