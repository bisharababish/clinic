import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './env.js';

// Validate that required environment variables are set
if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required. Please check your .env file.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required. Please check your .env file.');
}

// Supabase configuration
export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// For client-side operations, we'll use the same admin client
// since this is a backend-only service
export const supabaseClient = supabaseAdmin;

export default { supabaseAdmin, supabaseClient };
