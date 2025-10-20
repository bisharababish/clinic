// Offline Error Handler for Bethlehem Medical Center
// Provides consistent error handling for offline scenarios

import { offlineDataAccess } from './offlineDataAccess';

interface OfflineErrorHandler {
    handleFetchError: (error: Error, dataType: string) => {
        shouldShowOfflineMessage: boolean;
        offlineData: any[];
        errorMessage: string;
    };
    isOfflineError: (error: Error) => boolean;
    getOfflineFallbackData: (dataType: string) => any[];
}

class OfflineErrorHandlerClass implements OfflineErrorHandler {

    // Check if error is related to offline/network issues
    isOfflineError(error: Error): boolean {
        const offlineErrorMessages = [
            'Failed to fetch',
            'NetworkError',
            'TypeError: Failed to fetch',
            'fetch failed',
            'network error',
            'connection failed',
            'timeout',
            'offline'
        ];

        const errorMessage = error.message.toLowerCase();
        return offlineErrorMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
    }

    // Handle fetch errors and provide offline fallback
    handleFetchError(error: Error, dataType: string): {
        shouldShowOfflineMessage: boolean;
        offlineData: any[];
        errorMessage: string;
    } {
        const isOffline = this.isOfflineError(error);
        const hasOfflineData = offlineDataAccess.isOfflineDataAvailable();

        if (isOffline && hasOfflineData) {
            // Try to get offline data
            const offlineData = this.getOfflineFallbackData(dataType);

            return {
                shouldShowOfflineMessage: true,
                offlineData,
                errorMessage: offlineData.length > 0
                    ? `Using cached ${dataType} data (offline mode)`
                    : `No cached ${dataType} data available offline`
            };
        }

        // Regular error handling
        return {
            shouldShowOfflineMessage: false,
            offlineData: [],
            errorMessage: error.message || `Error loading ${dataType} data`
        };
    }

    // Get offline fallback data for specific type
    getOfflineFallbackData(dataType: string): any[] {
        if (!offlineDataAccess.isOfflineDataAvailable()) {
            return [];
        }

        switch (dataType.toLowerCase()) {
            case 'clinics':
                return offlineDataAccess.getCachedClinics();
            case 'patients':
                return offlineDataAccess.getCachedPatients();
            case 'appointments':
                return offlineDataAccess.getCachedAppointments();
            case 'doctors':
                return offlineDataAccess.getCachedDoctors();
            case 'payments':
                return offlineDataAccess.getCachedPayments();
            case 'patienthealth':
            case 'patient-health':
                return offlineDataAccess.getCachedPatientHealth();
            default:
                return [];
        }
    }
}

// Export singleton instance
export const offlineErrorHandler = new OfflineErrorHandlerClass();

// Helper function for easy use in components
export const handleOfflineError = (error: Error, dataType: string) => {
    return offlineErrorHandler.handleFetchError(error, dataType);
};

// Helper function to check if error is offline-related
export const isOfflineError = (error: Error) => {
    return offlineErrorHandler.isOfflineError(error);
};

// Helper function to get offline data
export const getOfflineData = (dataType: string) => {
    return offlineErrorHandler.getOfflineFallbackData(dataType);
};
