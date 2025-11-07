import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Environment validation schema
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('5000'),
    SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
    FRONTEND_URL: z.string().url('Invalid frontend URL'),
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    CYBERSOURCE_MERCHANT_ID: z.string().optional(),
    CYBERSOURCE_PROFILE_ID: z.string().optional(),
    CYBERSOURCE_ACCESS_KEY: z.string().optional(),
    CYBERSOURCE_SECRET_KEY: z.string().optional(),
    CYBERSOURCE_ENVIRONMENT: z.enum(['test', 'production']).default('test'),
    CYBERSOURCE_SIGNED_FIELD_NAMES: z.string().optional(),
    CYBERSOURCE_UNSIGNED_FIELD_NAMES: z.string().optional(),
});

// Validate environment variables
const validateEnv = () => {
    try {
        const env = envSchema.parse(process.env);
        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach(err => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

export const env = validateEnv();

// Export individual environment variables
export const {
    NODE_ENV,
    PORT,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    FRONTEND_URL,
    JWT_SECRET,
    LOG_LEVEL,
    CYBERSOURCE_MERCHANT_ID,
    CYBERSOURCE_PROFILE_ID,
    CYBERSOURCE_ACCESS_KEY,
    CYBERSOURCE_SECRET_KEY,
    CYBERSOURCE_ENVIRONMENT,
    CYBERSOURCE_SIGNED_FIELD_NAMES,
    CYBERSOURCE_UNSIGNED_FIELD_NAMES,
} = env;

export default env;
