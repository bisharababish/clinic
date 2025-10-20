// Service Worker Registration for Bethlehem Medical Center
// Handles offline support for critical medical data

interface ServiceWorkerMessage {
    type: string;
    data?: unknown;
}

interface CacheStatus {
    [cacheName: string]: number;
}

class ServiceWorkerManager {
    private registration: ServiceWorkerRegistration | null = null;
    private isOnline: boolean = navigator.onLine;
    private offlineListeners: ((isOffline: boolean) => void)[] = [];
    private syncListeners: ((data: unknown) => void)[] = [];

    constructor() {
        this.setupEventListeners();
    }

    // Register the service worker
    async register(): Promise<boolean> {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }

        try {
            console.log('🏥 Registering Service Worker for Bethlehem Medical Center...');

            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registered successfully');

            // Handle updates with controlled approach
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration!.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New Service Worker available - will update on next reload');
                            // Don't force immediate reload, let user control when to update
                        }
                    });
                }
            });

            // Check for updates less frequently to avoid loops
            setInterval(() => {
                if (this.registration && !this.registration.waiting) {
                    this.registration.update();
                }
            }, 60000); // Reduced frequency to 1 minute

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });

            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }

    // Setup event listeners
    private setupEventListeners(): void {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyOfflineListeners(false);
            console.log('🌐 Connection restored - medical data sync available');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyOfflineListeners(true);
            console.log('📴 Connection lost - switching to offline mode');
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.requestBackgroundSync();
            }
        });
    }

    // Handle messages from service worker
    private handleServiceWorkerMessage(message: ServiceWorkerMessage): void {
        switch (message.type) {
            case 'online':
                console.log('🌐 Service Worker: Online -', message.data);
                break;

            case 'offline': {
                console.log('📴 Service Worker: Offline -', message.data);
                const offlineData = message.data as { cached?: boolean };
                if (offlineData?.cached) {
                    this.showOfflineNotification('Using cached medical data');
                } else {
                    this.showOfflineNotification('No offline data available');
                }
                break;
            }

            case 'sync-complete': {
                console.log('✅ Service Worker: Sync complete -', message.data);
                this.notifySyncListeners(message.data);
                const syncData = message.data as { synced?: number };
                this.showSyncNotification(`Synced ${syncData?.synced || 0} offline records`);
                break;
            }
        }
    }

    // Cache medical data for offline access
    async cacheMedicalData(data: {
        patients?: unknown[];
        appointments?: unknown[];
        doctors?: unknown[];
        clinics?: unknown[];
        patientHealth?: unknown[];
    }): Promise<void> {
        if (!this.registration?.active) {
            console.warn('⚠️ Service Worker not active - cannot cache data');
            return;
        }

        try {
            const messageChannel = new MessageChannel();

            return new Promise((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        console.log('✅ Medical data cached successfully');
                        resolve();
                    } else {
                        reject(new Error('Failed to cache medical data'));
                    }
                };

                this.registration!.active!.postMessage({
                    type: 'CACHE_MEDICAL_DATA',
                    data: data
                }, [messageChannel.port2]);
            });
        } catch (error) {
            console.error('❌ Failed to cache medical data:', error);
            throw error;
        }
    }

    // Get cache status
    async getCacheStatus(): Promise<CacheStatus> {
        if (!this.registration?.active) {
            return {};
        }

        try {
            const messageChannel = new MessageChannel();

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data);
                };

                this.registration!.active!.postMessage({
                    type: 'GET_CACHE_STATUS'
                }, [messageChannel.port2]);
            });
        } catch (error) {
            console.error('❌ Failed to get cache status:', error);
            return {};
        }
    }

    // Force Service Worker update
    async forceUpdate(): Promise<void> {
        if (!this.registration) {
            console.warn('⚠️ No Service Worker registration found');
            return;
        }

        try {
            console.log('🔄 Checking for Service Worker updates...');
            await this.registration.update();

            // Only reload if there's actually a waiting service worker
            if (this.registration.waiting) {
                console.log('⏭️ Found waiting Service Worker - activating...');
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

                // Wait a moment then reload
                setTimeout(() => {
                    console.log('🔄 Reloading to activate new Service Worker...');
                    window.location.reload();
                }, 2000);
            } else {
                console.log('✅ Service Worker is already up to date');
            }
        } catch (error) {
            console.error('❌ Failed to force Service Worker update:', error);
        }
    }

    // Clear all caches
    async clearCache(): Promise<void> {
        if (!this.registration?.active) {
            console.warn('⚠️ Service Worker not active - cannot clear cache');
            return;
        }

        try {
            const messageChannel = new MessageChannel();

            return new Promise((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        console.log('✅ Cache cleared successfully');
                        resolve();
                    } else {
                        reject(new Error('Failed to clear cache'));
                    }
                };

                this.registration!.active!.postMessage({
                    type: 'CLEAR_CACHE'
                }, [messageChannel.port2]);
            });
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
            throw error;
        }
    }

    // Request background sync
    async requestBackgroundSync(): Promise<void> {
        if (!this.registration) {
            console.warn('⚠️ Service Worker not registered');
            return;
        }

        // Check if background sync is supported
        if (!('sync' in this.registration)) {
            console.warn('⚠️ Background sync not supported');
            return;
        }

        try {
            await (this.registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('offline-data-sync');
            console.log('🔄 Background sync requested');
        } catch (error) {
            console.error('❌ Background sync request failed:', error);
        }
    }

    // Store data for offline sync
    async storeOfflineData(data: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body?: string;
        timestamp: number;
    }): Promise<void> {
        try {
            const db = await this.openOfflineDB();
            const transaction = db.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');

            await store.add({
                ...data,
                id: Date.now() + Math.random()
            });

            console.log('💾 Data stored for offline sync');
        } catch (error) {
            console.error('❌ Failed to store offline data:', error);
        }
    }

    // Open IndexedDB for offline storage
    private async openOfflineDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BethlehemMedicalOfflineDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains('offlineData')) {
                    const store = db.createObjectStore('offlineData', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Add offline status listener
    addOfflineListener(callback: (isOffline: boolean) => void): void {
        this.offlineListeners.push(callback);
    }

    // Remove offline status listener
    removeOfflineListener(callback: (isOffline: boolean) => void): void {
        this.offlineListeners = this.offlineListeners.filter(listener => listener !== callback);
    }

    // Add sync listener
    addSyncListener(callback: (data: unknown) => void): void {
        this.syncListeners.push(callback);
    }

    // Remove sync listener
    removeSyncListener(callback: (data: unknown) => void): void {
        this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
    }

    // Notify offline listeners
    private notifyOfflineListeners(isOffline: boolean): void {
        this.offlineListeners.forEach(listener => listener(isOffline));
    }

    // Notify sync listeners
    private notifySyncListeners(data: unknown): void {
        this.syncListeners.forEach(listener => listener(data));
    }

    // Show offline notification
    private showOfflineNotification(message: string): void {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = `📴 ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Show sync notification
    private showSyncNotification(message: string): void {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = `✅ ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Get online status
    getOnlineStatus(): boolean {
        return this.isOnline;
    }

    // Check if service worker is active
    isServiceWorkerActive(): boolean {
        return !!this.registration?.active;
    }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register on module load
if (typeof window !== 'undefined') {
    serviceWorkerManager.register().then(success => {
        if (success) {
            console.log('🏥 Bethlehem Medical Center offline support enabled');
        }
    });
}
