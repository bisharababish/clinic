// src/lib/cache.ts
// Simple in-memory cache for API responses
class CacheManager {
    private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

    set(key: string, data: unknown, ttl: number = 5 * 60 * 1000) { // 5 minutes default
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key: string): unknown | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear() {
        this.cache.clear();
    }

    delete(key: string) {
        this.cache.delete(key);
    }
}

export const cache = new CacheManager();

// React Query configuration for caching
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 3,
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1,
        },
    },
};

// Local storage cache for user preferences
export const localStorageCache = {
    set: (key: string, value: unknown) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },

    get: (key: string) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return null;
        }
    },

    remove: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }
};
