// lib/supabase.ts - Updated configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey?.substring(0, 10) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  console.error('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
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
            parsed.expires_at = Date.now() + (20 * 60 * 1000); // 20 minutes
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
})

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
