// Offline Data Provider Component
// Provides offline data access to admin components

import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineDataAccess } from '../lib/offlineDataAccess';
import { useToast } from './ui/use-toast';
import { useTranslation } from 'react-i18next';

interface OfflineDataContextType {
    // Data
    clinics: any[];
    patients: any[];
    appointments: any[];
    doctors: any[];
    payments: any[];
    patientHealth: any[];

    // Status
    isLoading: boolean;
    error: string | null;
    isOffline: boolean;
    hasData: boolean;

    // Actions
    refresh: () => void;
    search: (type: string, term: string) => any[];
}

const OfflineDataContext = createContext<OfflineDataContextType | null>(null);

export const OfflineDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [clinics, setClinics] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [patientHealth, setPatientHealth] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(!offlineDataAccess.isOfflineDataAvailable());

    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    // Load all offline data
    const loadOfflineData = () => {
        setIsLoading(true);
        setError(null);

        try {
            const cachedData = offlineDataAccess.getCachedData();

            setClinics(cachedData.clinics);
            setPatients(cachedData.patients);
            setAppointments(cachedData.appointments);
            setDoctors(cachedData.doctors);
            setPayments(cachedData.payments);
            setPatientHealth(cachedData.patientHealth);

            const totalItems = offlineDataAccess.getTotalCachedItems();
            const hasData = totalItems > 0;

            if (!hasData && isOffline) {
                setError(i18n.language === 'ar'
                    ? 'لا توجد بيانات مخزنة مؤقتاً للوصول في وضع عدم الاتصال'
                    : 'No cached data available for offline access'
                );
            }

        } catch (err) {
            console.error('Error loading offline data:', err);
            setError(i18n.language === 'ar'
                ? 'خطأ في تحميل البيانات المخزنة مؤقتاً'
                : 'Error loading cached data'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh data
    const refresh = () => {
        loadOfflineData();
    };

    // Search function
    const search = (type: string, term: string): any[] => {
        if (!term) return [];

        switch (type) {
            case 'clinics':
                return offlineDataAccess.searchCachedData('clinics', term);
            case 'patients':
                return offlineDataAccess.searchCachedData('patients', term);
            case 'appointments':
                return offlineDataAccess.searchCachedData('appointments', term);
            case 'doctors':
                return offlineDataAccess.searchCachedData('doctors', term);
            case 'payments':
                return offlineDataAccess.searchCachedData('payments', term);
            case 'patientHealth':
                return offlineDataAccess.searchCachedData('patientHealth', term);
            default:
                return [];
        }
    };

    // Load data on mount
    useEffect(() => {
        loadOfflineData();
    }, []);

    // Check offline status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const offlineStatus = !offlineDataAccess.isOfflineDataAvailable();
            if (offlineStatus !== isOffline) {
                setIsOffline(offlineStatus);
                if (offlineStatus) {
                    loadOfflineData(); // Reload data when going offline
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isOffline]);

    const hasData = offlineDataAccess.getTotalCachedItems() > 0;

    const contextValue: OfflineDataContextType = {
        clinics,
        patients,
        appointments,
        doctors,
        payments,
        patientHealth,
        isLoading,
        error,
        isOffline,
        hasData,
        refresh,
        search
    };

    return (
        <OfflineDataContext.Provider value={contextValue}>
            {children}
        </OfflineDataContext.Provider>
    );
};

// Hook to use offline data
export const useOfflineDataContext = (): OfflineDataContextType => {
    const context = useContext(OfflineDataContext);
    if (!context) {
        throw new Error('useOfflineDataContext must be used within an OfflineDataProvider');
    }
    return context;
};

export default OfflineDataProvider;
