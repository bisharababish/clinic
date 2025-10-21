// Production configuration
export const productionConfig = {
    // Security settings
    security: {
        bcryptRounds: 12,
        sessionTimeout: 20 * 60 * 1000, // 20 minutes
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
    },

    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        adminWindowMs: 5 * 60 * 1000, // 5 minutes for admin
        adminMaxRequests: 200,
    },

    // CORS settings
    cors: {
        allowedOrigins: [
            'https://bethlehemmedcenter.com',
            'https://www.bethlehemmedcenter.com'
        ],
        credentials: true,
    },

    // Database settings
    database: {
        connectionTimeout: 30000,
        queryTimeout: 30000,
        maxConnections: 10,
    },

    // Logging settings
    logging: {
        level: 'info',
        maxFiles: 5,
        maxSize: '10m',
        datePattern: 'YYYY-MM-DD',
    },

    // Monitoring settings
    monitoring: {
        healthCheckInterval: 30000, // 30 seconds
        performanceMetrics: true,
        errorTracking: true,
    }
};

export default productionConfig;
