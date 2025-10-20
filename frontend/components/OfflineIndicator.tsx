// OfflineIndicator Component for Bethlehem Medical Center
// Shows connection status and offline capabilities

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { serviceWorkerManager } from '../lib/serviceWorker';
import { useTranslation } from 'react-i18next';

interface OfflineIndicatorProps {
    className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
    const [isOnline, setIsOnline] = useState(serviceWorkerManager.getOnlineStatus());
    const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
    const [cacheStatus, setCacheStatus] = useState<Record<string, number>>({});
    const [isSyncing, setIsSyncing] = useState(false);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Set initial service worker status
        setIsServiceWorkerActive(serviceWorkerManager.isServiceWorkerActive());

        // Add offline status listener
        const handleOfflineStatus = (offline: boolean) => {
            setIsOnline(!offline);
        };

        serviceWorkerManager.addOfflineListener(handleOfflineStatus);

        // Add sync listener
        const handleSync = (data: any) => {
            setIsSyncing(false);
            console.log('🔄 Sync completed:', data);
        };

        serviceWorkerManager.addSyncListener(handleSync);

        // Get initial cache status
        updateCacheStatus();

        // Update cache status periodically
        const interval = setInterval(updateCacheStatus, 30000); // Every 30 seconds

        return () => {
            serviceWorkerManager.removeOfflineListener(handleOfflineStatus);
            serviceWorkerManager.removeSyncListener(handleSync);
            clearInterval(interval);
        };
    }, []);

    const updateCacheStatus = async () => {
        try {
            const status = await serviceWorkerManager.getCacheStatus();
            setCacheStatus(status);
        } catch (error) {
            console.error('Failed to get cache status:', error);
        }
    };

    const handleManualSync = async () => {
        if (!isOnline) return;

        setIsSyncing(true);
        try {
            await serviceWorkerManager.requestBackgroundSync();
        } catch (error) {
            console.error('Manual sync failed:', error);
            setIsSyncing(false);
        }
    };

    const handleClearCache = async () => {
        try {
            await serviceWorkerManager.clearCache();
            await updateCacheStatus();
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    const getTotalCachedItems = () => {
        return Object.values(cacheStatus).reduce((total, count) => total + count, 0);
    };

    const isRTL = i18n.language === 'ar';

    return (
        <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} ${className}`}>
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
                {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline
                        ? (i18n.language === 'ar' ? 'متصل' : 'Online')
                        : (i18n.language === 'ar' ? 'غير متصل' : 'Offline')
                    }
                </span>
            </div>

            {/* Service Worker Status */}
            <div className="flex items-center space-x-1">
                {isServiceWorkerActive ? (
                    <Cloud className="h-4 w-4 text-blue-500" />
                ) : (
                    <CloudOff className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${isServiceWorkerActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {isServiceWorkerActive
                        ? (i18n.language === 'ar' ? 'دعم عدم الاتصال متاح' : 'Offline Support')
                        : (i18n.language === 'ar' ? 'دعم عدم الاتصال غير متاح' : 'No Offline Support')
                    }
                </span>
            </div>

            {/* Cache Status */}
            {isServiceWorkerActive && (
                <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">
                        {i18n.language === 'ar' ? 'مخزن مؤقت' : 'Cached'}: {getTotalCachedItems()}
                    </span>
                </div>
            )}

            {/* Manual Sync Button */}
            {isOnline && isServiceWorkerActive && (
                <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>
                        {isSyncing
                            ? (i18n.language === 'ar' ? 'جاري المزامنة...' : 'Syncing...')
                            : (i18n.language === 'ar' ? 'مزامنة' : 'Sync')
                        }
                    </span>
                </button>
            )}

            {/* Clear Cache Button (for debugging) */}
            {process.env.NODE_ENV === 'development' && isServiceWorkerActive && (
                <button
                    onClick={handleClearCache}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                    {i18n.language === 'ar' ? 'مسح المخزن المؤقت' : 'Clear Cache'}
                </button>
            )}
        </div>
    );
};

export default OfflineIndicator;
