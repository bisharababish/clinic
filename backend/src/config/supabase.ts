import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
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
