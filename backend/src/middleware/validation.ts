import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas
const deleteUserSchema = z.object({
    authUserId: z.string().uuid('Invalid user ID format')
});

const healthCheckSchema = z.object({
    // No validation needed for health check
});

// Generic validation middleware factory
const validateRequest = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }
            next(error);
        }
    };
};

// Specific validation middlewares
export const validateDeleteUser = validateRequest(deleteUserSchema);
export const validateHealthCheck = validateRequest(healthCheckSchema);

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            return obj
                .trim()
                .replace(/[<>]/g, '') // Remove potential HTML tags
                .substring(0, 1000); // Limit length
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitize(value);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

// Rate limiting per endpoint
export const createEndpointRateLimit = (windowMs: number, max: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // This would integrate with your existing rate limiting
        // For now, just pass through
        next();
    };
};
