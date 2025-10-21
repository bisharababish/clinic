import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logInfo, logError } from '../utils/logger.js';

// Health check endpoint with detailed system status
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
            database: 'unknown',
            memory: 'unknown',
            disk: 'unknown'
        }
    };

    try {
        // Check database connection
        const { error } = await supabaseAdmin
            .from('userinfo')
            .select('count')
            .limit(1);

        if (error) {
            healthStatus.checks.database = 'error';
            healthStatus.status = 'error';
            logError(new Error(`Database health check failed: ${error.message}`), 'health_check');
        } else {
            healthStatus.checks.database = 'ok';
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };

        if (memUsageMB.heapUsed > 500) { // More than 500MB
            healthStatus.checks.memory = 'warning';
            healthStatus.status = 'warning';
        } else {
            healthStatus.checks.memory = 'ok';
        }

        // Add memory details
        healthStatus.memory = memUsageMB;

        // Check disk space (simplified)
        healthStatus.checks.disk = 'ok'; // Assume OK for now

        const statusCode = healthStatus.status === 'ok' ? 200 : 503;

        logInfo(`Health check: ${healthStatus.status}`, healthStatus);
        res.status(statusCode).json(healthStatus);

    } catch (error) {
        healthStatus.status = 'error';
        healthStatus.checks.database = 'error';
        logError(error instanceof Error ? error : new Error('Health check failed'), 'health_check');
        res.status(503).json(healthStatus);
    }
};

// Simple health check for load balancers
export const simpleHealthCheck = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
};
