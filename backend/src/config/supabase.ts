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

export const supabaseClient = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    }
);

export default { supabaseAdmin, supabaseClient };
