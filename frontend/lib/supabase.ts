// lib/supabase.ts - Updated configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey?.substring(0, 10) + '...');

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  console.error('Available env vars:', Object.keys(import.meta.env));

  // In production, try to use fallback values or show a more user-friendly error
  if (import.meta.env.PROD) {
    console.error('Running in production mode but missing Supabase config');
    // Create a minimal client with dummy values to prevent crashes
    supabase = createClient('https://dummy.supabase.co', 'dummy-key');
  } else {
    throw new Error('Missing Supabase URL or Anonymous Key');
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Extend session duration
      refreshTokenRetryInterval: 2000, // Retry refresh every 2 seconds
      refreshTokenRetryAttempts: 3, // Retry up to 3 times
      // Session timeout configuration
      storage: {
        getItem: (key: string) => {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              // Check if session is expired (20 minutes = 1200000 ms)
              if (parsed.expires_at && Date.now() > parsed.expires_at) {
                localStorage.removeItem(key);
                return null;
              }
              // Also check our custom session timeout
              if (parsed.session_timeout && Date.now() > parsed.session_timeout) {
                localStorage.removeItem(key);
                return null;
              }
              return item;
            } catch {
              return null;
            }
          }
          return null;
        },
        setItem: (key: string, value: string) => {
          try {
            const parsed = JSON.parse(value);
            // Set custom expiration time (20 minutes from now)
            if (parsed.expires_at) {
              // Extend the session to 20 minutes from now
              parsed.expires_at = Date.now() + (20 * 60 * 1000); // 20 minutes
            }
            // Also set a custom session timeout for our app
            if (parsed.access_token) {
              parsed.session_timeout = Date.now() + (20 * 60 * 1000); // 20 minutes
            }
            localStorage.setItem(key, JSON.stringify(parsed));
          } catch {
            localStorage.setItem(key, value);
          }
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key);
        }
      },
      // Add these settings for better password reset handling
      debug: import.meta.env.DEV || false, // Enable debug in development
    },
    // Add global settings
    global: {
      headers: {
        'X-Client-Info': 'bethlehem-med-center'
      }
    }
  });

  // Test connection and log auth events in development
  if (import.meta.env.DEV) {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Initial session check:', { hasSession: !!data.session, error });
    });

    // Log auth events for debugging
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session ? 'Session exists' : 'No session');
    });
  }
}

export const supabaseClient = supabase;
export { supabaseClient as supabase };