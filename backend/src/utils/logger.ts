import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'bethlehem-medical-center' },
    transports: [
        // Write all logs to console in development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log'
    }));
}

// Security-aware logging functions
export const logSecurity = (message: string, metadata?: any) => {
    logger.warn('SECURITY', { message, ...metadata });
};

export const logAuth = (action: string, userId?: string, success: boolean = true) => {
    logger.info('AUTH', {
        action,
        userId: userId ? userId.substring(0, 8) + '...' : 'unknown',
        success,
        timestamp: new Date().toISOString()
    });
};

export const logError = (error: Error, context?: string) => {
    logger.error('ERROR', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};

export const logInfo = (message: string, metadata?: any) => {
    logger.info('INFO', { message, ...metadata });
};

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
    logger.info('PERFORMANCE', {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};

export default logger;
