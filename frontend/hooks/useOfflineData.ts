// Hook for accessing offline data in components
// Provides consistent offline data access across the application

import { useState, useEffect, useCallback } from 'react';
import { offlineDataAccess } from '../lib/offlineDataAccess';
import { useToast } from '../components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface UseOfflineDataOptions {
    dataType: 'clinics' | 'patients' | 'appointments' | 'doctors' | 'payments' | 'patientHealth';
    searchTerm?: string;
    autoRefresh?: boolean;
}

interface UseOfflineDataReturn {
    data: any[];
    isLoading: boolean;
    error: string | null;
    isOffline: boolean;
    hasData: boolean;
    refresh: () => void;
    search: (term: string) => void;
}

export const useOfflineData = (options: UseOfflineDataOptions): UseOfflineDataReturn => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(options.searchTerm || '');
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    const { dataType, autoRefresh = true } = options;

    // Check if offline data is available
    const isOffline = !offlineDataAccess.isOfflineDataAvailable();
    const hasData = data.length > 0;

    // Load data function
    const loadData = useCallback(() => {
        setIsLoading(true);
        setError(null);

        try {
            let cachedData: any[] = [];

            // Get data based on type
            switch (dataType) {
                case 'clinics':
                    cachedData = offlineDataAccess.getCachedClinics();
                    break;
                case 'patients':
                    cachedData = offlineDataAccess.getCachedPatients();
                    break;
                case 'appointments':
                    cachedData = offlineDataAccess.getCachedAppointments();
                    break;
                case 'doctors':
                    cachedData = offlineDataAccess.getCachedDoctors();
                    break;
                case 'payments':
                    cachedData = offlineDataAccess.getCachedPayments();
                    break;
                case 'patientHealth':
                    cachedData = offlineDataAccess.getCachedPatientHealth();
                    break;
                default:
                    cachedData = [];
            }

            // Apply search filter if search term exists
            if (searchTerm) {
                cachedData = offlineDataAccess.searchCachedData(dataType, searchTerm);
            }

            setData(cachedData);

            if (cachedData.length === 0 && !isOffline) {
                setError(i18n.language === 'ar'
                    ? `لا توجد بيانات ${dataType} مخزنة مؤقتاً للوصول في وضع عدم الاتصال`
                    : `No cached ${dataType} data available offline`
                );
            }

        } catch (err) {
            console.error(`Error loading offline ${dataType} data:`, err);
            setError(i18n.language === 'ar'
                ? `خطأ في تحميل بيانات ${dataType}`
                : `Error loading ${dataType} data`
            );
        } finally {
            setIsLoading(false);
        }
    }, [dataType, searchTerm, isOffline, i18n.language]);

    // Search function
    const search = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    // Refresh function
    const refresh = useCallback(() => {
        loadData();
    }, [loadData]);

    // Load data on mount and when dependencies change
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh when offline data changes
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // Only refresh if we're offline and have no data
            if (isOffline && data.length === 0) {
                loadData();
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, isOffline, data.length, loadData]);

    return {
        data,
        isLoading,
        error,
        isOffline,
        hasData,
        refresh,
        search
    };
};

// Specific hooks for different data types
export const useOfflineClinics = (searchTerm?: string) =>
    useOfflineData({ dataType: 'clinics', searchTerm });

export const useOfflinePatients = (searchTerm?: string) =>
    useOfflineData({ dataType: 'patients', searchTerm });

export const useOfflineAppointments = (searchTerm?: string) =>
    useOfflineData({ dataType: 'appointments', searchTerm });

export const useOfflineDoctors = (searchTerm?: string) =>
    useOfflineData({ dataType: 'doctors', searchTerm });

export const useOfflinePayments = (searchTerm?: string) =>
    useOfflineData({ dataType: 'payments', searchTerm });

export const useOfflinePatientHealth = (searchTerm?: string) =>
    useOfflineData({ dataType: 'patientHealth', searchTerm });

export default useOfflineData;
