// Offline Authentication Manager for Bethlehem Medical Center
// Allows staff to access cached data even when internet is down

interface OfflineAuthData {
    user: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
    token: string;
    expiresAt: number;
    cachedData: {
        patients: any[];
        appointments: any[];
        doctors: any[];
        clinics: any[];
    };
}

class OfflineAuthManager {
    private static instance: OfflineAuthManager;
    private readonly STORAGE_KEY = 'bethlehem-medical-offline-auth';
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static getInstance(): OfflineAuthManager {
        if (!OfflineAuthManager.instance) {
            OfflineAuthManager.instance = new OfflineAuthManager();
        }
        return OfflineAuthManager.instance;
    }

    // Store authentication data for offline use
    async storeOfflineAuth(user: any, token: string, cachedData: any): Promise<void> {
        try {
            console.log('💾 Storing offline auth data for user:', user);
            console.log('🔑 Token:', token);
            console.log('📦 Cached data:', cachedData);

            const authData: OfflineAuthData = {
                user: {
                    id: user.id || user.userid,
                    email: user.email || user.user_email,
                    role: user.role || user.user_roles,
                    name: user.name || user.english_username_a
                },
                token,
                expiresAt: Date.now() + this.CACHE_DURATION,
                cachedData: {
                    patients: cachedData.patients || [],
                    appointments: cachedData.appointments || [],
                    doctors: cachedData.doctors || [],
                    clinics: cachedData.clinics || []
                }
            };

            console.log('📋 Final auth data to store:', authData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
            console.log('✅ Offline auth data stored successfully for:', authData.user.email);
        } catch (error) {
            console.error('❌ Failed to store offline auth:', error);
        }
    }

    // Check if offline authentication is available
    isOfflineAuthAvailable(): boolean {
        try {
            const authData = this.getStoredAuthData();
            const isAvailable = authData && authData.expiresAt > Date.now();
            console.log('🔍 isOfflineAuthAvailable check:', {
                hasAuthData: !!authData,
                expiresAt: authData?.expiresAt,
                currentTime: Date.now(),
                isExpired: authData ? authData.expiresAt <= Date.now() : true,
                isAvailable
            });
            return isAvailable;
        } catch (error) {
            console.error('❌ Error checking offline auth availability:', error);
            return false;
        }
    }

    // Get stored authentication data
    getStoredAuthData(): OfflineAuthData | null {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;

            const authData: OfflineAuthData = JSON.parse(stored);

            // Check if expired
            if (authData.expiresAt <= Date.now()) {
                this.clearOfflineAuth();
                return null;
            }

            return authData;
        } catch (error) {
            console.error('❌ Failed to get stored auth data:', error);
            return null;
        }
    }

    // Get cached data for offline use
    getCachedData(): any {
        const authData = this.getStoredAuthData();
        return authData ? authData.cachedData : null;
    }

    // Clear offline authentication data
    clearOfflineAuth(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ Offline auth data cleared');
        } catch (error) {
            console.error('❌ Failed to clear offline auth:', error);
        }
    }

    // Update cached data
    async updateCachedData(newData: any): Promise<void> {
        try {
            const authData = this.getStoredAuthData();
            if (!authData) return;

            authData.cachedData = {
                ...authData.cachedData,
                ...newData
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
            console.log('🔄 Cached data updated');
        } catch (error) {
            console.error('❌ Failed to update cached data:', error);
        }
    }

    // Get offline user info
    getOfflineUser(): any {
        const authData = this.getStoredAuthData();
        return authData ? authData.user : null;
    }

    // Check if user has offline access
    hasOfflineAccess(): boolean {
        const authData = this.getStoredAuthData();
        if (!authData) return false;

        // Check if user role allows offline access
        const allowedRoles = ['admin', 'doctor', 'nurse', 'secretary'];
        return allowedRoles.includes(authData.user.role?.toLowerCase());
    }
}

// Export singleton instance
export const offlineAuthManager = OfflineAuthManager.getInstance();

// Auto-clear expired auth data
if (typeof window !== 'undefined') {
    const authData = offlineAuthManager.getStoredAuthData();
    if (authData && authData.expiresAt <= Date.now()) {
        offlineAuthManager.clearOfflineAuth();
    }
}
