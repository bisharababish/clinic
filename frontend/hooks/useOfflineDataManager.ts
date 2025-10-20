// Offline Data Manager Hook for Bethlehem Medical Center
// Manages offline data storage and synchronization

import { useState, useEffect, useCallback } from 'react';
import { serviceWorkerManager } from '../lib/serviceWorker';
import { useToast } from '../components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface OfflineDataManager {
    isOnline: boolean;
    isServiceWorkerActive: boolean;
    cacheMedicalData: (data: MedicalData) => Promise<void>;
    storeOfflineAction: (action: OfflineAction) => Promise<void>;
    getOfflineActionsCount: () => Promise<number>;
    syncOfflineData: () => Promise<void>;
    stopSync: () => void;
    isSyncing: boolean;
}

interface MedicalData {
    patients?: any[];
    appointments?: any[];
    doctors?: any[];
    clinics?: any[];
    patientHealth?: any[];
    payments?: any[];
}

interface OfflineAction {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    timestamp: number;
    description?: string;
}

export const useOfflineDataManager = (): OfflineDataManager => {
    const [isOnline, setIsOnline] = useState(serviceWorkerManager.getOnlineStatus());
    const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Set initial service worker status
        setIsServiceWorkerActive(serviceWorkerManager.isServiceWorkerActive());

        // Add offline status listener
        const handleOfflineStatus = (offline: boolean) => {
            setIsOnline(!offline);

            if (offline) {
                toast({
                    title: i18n.language === 'ar' ? 'غير متصل بالإنترنت' : 'Offline',
                    description: i18n.language === 'ar'
                        ? 'تم تفعيل وضع عدم الاتصال. البيانات المخزنة مؤقتاً ستكون متاحة.'
                        : 'Offline mode activated. Cached data will be available.',
                    variant: "default",
                });
            } else {
                toast({
                    title: i18n.language === 'ar' ? 'متصل بالإنترنت' : 'Online',
                    description: i18n.language === 'ar'
                        ? 'تم استعادة الاتصال. سيتم مزامنة البيانات تلقائياً.'
                        : 'Connection restored. Data will sync automatically.',
                    variant: "default",
                });
            }
        };

        serviceWorkerManager.addOfflineListener(handleOfflineStatus);

        // Add sync listener
        const handleSync = (data: any) => {
            setIsSyncing(false);

            if (data.synced > 0) {
                toast({
                    title: i18n.language === 'ar' ? 'تمت المزامنة' : 'Sync Complete',
                    description: i18n.language === 'ar'
                        ? `تم مزامنة ${data.synced} سجل من البيانات المحفوظة`
                        : `Synced ${data.synced} offline records`,
                    variant: "default",
                });
            } else {
                // Even if no data was synced, show completion message
                toast({
                    title: i18n.language === 'ar' ? 'تمت المزامنة' : 'Sync Complete',
                    description: i18n.language === 'ar'
                        ? 'لا توجد بيانات محفوظة للمزامنة'
                        : 'No offline data to sync',
                    variant: "default",
                });
            }
        };

        serviceWorkerManager.addSyncListener(handleSync);

        return () => {
            serviceWorkerManager.removeOfflineListener(handleOfflineStatus);
            serviceWorkerManager.removeSyncListener(handleSync);
        };
    }, [toast, i18n.language]);

    // Cache medical data for offline access
    const cacheMedicalData = useCallback(async (data: MedicalData) => {
        if (!isServiceWorkerActive) {
            console.warn('⚠️ Service Worker not active - cannot cache data');
            return;
        }

        try {
            await serviceWorkerManager.cacheMedicalData(data);

            const dataTypes = Object.keys(data).filter(key => data[key as keyof MedicalData]?.length > 0);

            toast({
                title: i18n.language === 'ar' ? 'تم حفظ البيانات' : 'Data Cached',
                description: i18n.language === 'ar'
                    ? `تم حفظ ${dataTypes.join(', ')} للوصول في وضع عدم الاتصال`
                    : `Cached ${dataTypes.join(', ')} for offline access`,
                variant: "default",
            });
        } catch (error) {
            console.error('❌ Failed to cache medical data:', error);

            toast({
                title: i18n.language === 'ar' ? 'خطأ في حفظ البيانات' : 'Cache Error',
                description: i18n.language === 'ar'
                    ? 'فشل في حفظ البيانات للوصول في وضع عدم الاتصال'
                    : 'Failed to cache data for offline access',
                variant: "destructive",
            });
        }
    }, [isServiceWorkerActive, toast, i18n.language]);

    // Store offline action for later sync
    const storeOfflineAction = useCallback(async (action: OfflineAction) => {
        if (!isServiceWorkerActive) {
            console.warn('⚠️ Service Worker not active - cannot store offline action');
            return;
        }

        try {
            await serviceWorkerManager.storeOfflineData(action);

            console.log('💾 Offline action stored:', action.description || action.url);
        } catch (error) {
            console.error('❌ Failed to store offline action:', error);

            toast({
                title: i18n.language === 'ar' ? 'خطأ في حفظ الإجراء' : 'Storage Error',
                description: i18n.language === 'ar'
                    ? 'فشل في حفظ الإجراء للمزامنة لاحقاً'
                    : 'Failed to store action for later sync',
                variant: "destructive",
            });
        }
    }, [isServiceWorkerActive, toast, i18n.language]);

    // Get count of offline actions
    const getOfflineActionsCount = useCallback(async (): Promise<number> => {
        try {
            const db = await openOfflineDB();
            const transaction = db.transaction(['offlineData'], 'readonly');
            const store = transaction.objectStore('offlineData');
            const countRequest = store.count();

            return new Promise((resolve) => {
                countRequest.onsuccess = () => resolve(countRequest.result);
                countRequest.onerror = () => resolve(0);
            });
        } catch (error) {
            console.error('❌ Failed to get offline actions count:', error);
            return 0;
        }
    }, []);

    // Sync offline data with optimization and manual stop
    const syncOfflineData = useCallback(async () => {
        if (!isOnline || !isServiceWorkerActive) {
            console.warn('⚠️ Cannot sync - offline or service worker not active');
            return;
        }

        // Prevent multiple simultaneous syncs
        if (isSyncing) {
            console.log('🔄 Sync already in progress, skipping...');
            return;
        }

        setIsSyncing(true);

        try {
            console.log('🚀 Starting optimized sync...');

            // Add shorter timeout for faster response
            const syncPromise = serviceWorkerManager.requestBackgroundSync();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sync timeout')), 5000); // Reduced to 5 seconds
            });

            await Promise.race([syncPromise, timeoutPromise]);

            toast({
                title: i18n.language === 'ar' ? 'تمت المزامنة' : 'Sync Completed',
                description: i18n.language === 'ar'
                    ? 'تم مزامنة البيانات بنجاح'
                    : 'Data synchronized successfully',
                variant: "default",
            });
        } catch (error) {
            console.error('❌ Failed to sync offline data:', error);

            toast({
                title: i18n.language === 'ar' ? 'خطأ في المزامنة' : 'Sync Error',
                description: i18n.language === 'ar'
                    ? 'فشل في مزامنة البيانات - سيتم المحاولة لاحقاً'
                    : 'Sync failed - will retry later',
                variant: "destructive",
            });
        } finally {
            // Always stop syncing indicator with a small delay to ensure UI updates
            setTimeout(() => {
                setIsSyncing(false);
                console.log('🛑 Sync process completed - UI state reset');
            }, 500);
        }
    }, [isOnline, isServiceWorkerActive, isSyncing, serviceWorkerManager, toast, i18n.language]);

    // Manual stop sync function
    const stopSync = useCallback(() => {
        console.log('🛑 Manually stopping sync...');
        setIsSyncing(false);
        toast({
            title: i18n.language === 'ar' ? 'تم إيقاف المزامنة' : 'Sync Stopped',
            description: i18n.language === 'ar'
                ? 'تم إيقاف عملية المزامنة يدوياً'
                : 'Sync process stopped manually',
            variant: "default",
        });
    }, [toast, i18n.language]);

    // Open IndexedDB for offline storage
    const openOfflineDB = async (): Promise<IDBDatabase> => {
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
    };

    return {
        isOnline,
        isServiceWorkerActive,
        cacheMedicalData,
        storeOfflineAction,
        getOfflineActionsCount,
        syncOfflineData,
        stopSync,
        isSyncing,
    };
};

export default useOfflineDataManager;
