// API configuration for production deployment
import { supabase } from '../../lib/supabase';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
    if (import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production') {
        return 'https://api.bethlehemmedcenter.com';
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        console.log('🌐 API Base URL - Detected hostname:', hostname);

        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname.startsWith('192.168.')) {
            console.log('📍 Using localhost backend:', 'http://localhost:5000');
            return 'http://localhost:5000';
        }

        if (hostname.includes('bethlehemmedcenter.com')) {
            console.log('📍 Using production backend:', 'https://api.bethlehemmedcenter.com');
            return 'https://api.bethlehemmedcenter.com';
        }

        console.log('📍 Using production backend (default):', 'https://api.bethlehemmedcenter.com');
        return 'https://api.bethlehemmedcenter.com';
    }

    return 'https://api.bethlehemmedcenter.com';
};

export const API_BASE_URL = getApiBaseUrl();

// CSRF token cache
let csrfTokenCache: { token: string; expires: number } | null = null;

// Get valid CSRF token (fetch new if expired or missing)
async function getCSRFToken(): Promise<string> {
    // Check if we have a valid cached token
    if (csrfTokenCache && csrfTokenCache.expires > Date.now()) {
        return csrfTokenCache.token;
    }

    try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('No active session');
        }

        // Fetch new CSRF token from backend
        const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }

        const data = await response.json();

        // Cache the token with 5 minutes buffer before expiry
        csrfTokenCache = {
            token: data.csrfToken,
            expires: Date.now() + data.expiresIn - (5 * 60 * 1000)
        };

        console.log('✅ CSRF token fetched and cached');
        return data.csrfToken;

    } catch (error) {
        console.error('❌ Failed to fetch CSRF token:', error);
        throw new Error('Failed to obtain CSRF token');
    }
}

// Enhanced API call function with proper error handling and CSRF
export async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // Add authentication header if session exists
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Add CSRF token for non-GET requests
        if (options.method && options.method !== 'GET') {
            const csrfToken = await getCSRFToken();
            headers['X-CSRF-Token'] = csrfToken;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers as HeadersInit,
            credentials: 'include',
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return {} as T;
        }

        const data = await response.json();

        if (!response.ok) {
            // If CSRF token is invalid, clear cache and retry once
            if (response.status === 403 && data.message?.includes('CSRF')) {
                console.log('🔄 CSRF token invalid, clearing cache and retrying...');
                csrfTokenCache = null;

                // Retry the request once
                return apiCall<T>(endpoint, options);
            }

            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Specific API functions
export async function deleteUser(authUserId: string): Promise<{ success: boolean; message: string }> {
    return apiCall('/api/admin/delete-user', {
        method: 'POST',
        body: JSON.stringify({ authUserId }),
    });
}

export async function updatePassword(userEmail: string, newPassword: string): Promise<{ success: boolean; message: string; userEmail: string }> {
    return apiCall('/api/admin/update-password', {
        method: 'POST',
        body: JSON.stringify({ userEmail, newPassword }),
    });
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
    return apiCall('/health');
}

// Rate limiting helper
export class RateLimiter {
    private requests: number[] = [];
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    canMakeRequest(): boolean {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            return false;
        }

        this.requests.push(now);
        return true;
    }

    getTimeUntilReset(): number {
        if (this.requests.length === 0) return 0;
        const oldestRequest = Math.min(...this.requests);
        const resetTime = oldestRequest + this.windowMs;
        return Math.max(0, resetTime - Date.now());
    }
}

export const apiRateLimiter = new RateLimiter();