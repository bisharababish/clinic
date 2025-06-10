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
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Add these settings for better password reset handling
    debug: import.meta.env.DEV, // Enable debug in development
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