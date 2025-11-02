// API configuration for production deployment
import { supabase } from '../../lib/supabase';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
    // Check if we're in production mode
    if (import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production') {
        return 'https://api.bethlehemmedcenter.com';
    }

    // Check hostname to determine environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        console.log('🌐 API Base URL - Detected hostname:', hostname);
        
        // Use localhost only if actually running on localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname.startsWith('192.168.')) {
            console.log('📍 Using localhost backend:', 'http://localhost:5000');
            return 'http://localhost:5000';
        }
        
        // For production domain, use production API
        if (hostname.includes('bethlehemmedcenter.com')) {
            console.log('📍 Using production backend:', 'https://api.bethlehemmedcenter.com');
            return 'https://api.bethlehemmedcenter.com';
        }
        
        // Default to production API for any other domain
        console.log('📍 Using production backend (default):', 'https://api.bethlehemmedcenter.com');
        return 'https://api.bethlehemmedcenter.com';
    }

    // Default to production URL for safety
    return 'https://api.bethlehemmedcenter.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Enhanced API call function with proper error handling
export async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authentication header if session exists
        if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
        }

        // Add CSRF token for non-GET requests
        if (options.method && options.method !== 'GET') {
            const csrfToken = sessionStorage.getItem('csrf_token') ||
                Math.random().toString(36).substring(2, 15);
            headers['X-CSRF-Token'] = csrfToken;
            sessionStorage.setItem('csrf_token', csrfToken);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
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
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Specific API functions for your application
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

        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        // Check if we can make a new request
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

// Global rate limiter instance
export const apiRateLimiter = new RateLimiter();
