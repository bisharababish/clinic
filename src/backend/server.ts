// backend/server.ts

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'https://bethlehemmedcenter.com',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());

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

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Delete auth user endpoint
app.post('/api/admin/delete-user', async (req: Request, res: Response): Promise<void> => {
    try {
        const { authUserId } = req.body as { authUserId?: string };

        if (!authUserId) {
            res.status(400).json({
                error: 'Auth user ID is required',
                success: false
            });
            return;
        }

        console.log(`Attempting to delete auth user: ${authUserId}`);

        // Delete from auth.users using Admin API
        const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

        if (error) {
            console.error('Auth deletion error:', error);
            res.status(400).json({
                error: 'Failed to delete auth user',
                detail: error.message,
                success: false
            });
            return;
        }

        console.log(`Auth user ${authUserId} deleted successfully`);

        res.status(200).json({
            success: true,
            message: 'Auth user deleted successfully',
            authUserId
        });

    } catch (error) {
        console.error('Delete user error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            error: 'Internal server error',
            detail: errorMessage
        });
    }
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        detail: err.message
    });
};

app.use(errorHandler);

// Start server
app.listen(PORT, (): void => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;