// Offline Data Display Component
// Shows offline data with proper error handling and retry functionality

import React from 'react';
import { useOfflineDataContext } from './OfflineDataProvider';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, WifiOff, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OfflineDataDisplayProps {
    dataType: 'clinics' | 'patients' | 'appointments' | 'doctors' | 'payments' | 'patientHealth';
    children: (data: any[], isLoading: boolean, error: string | null) => React.ReactNode;
    emptyMessage?: string;
    errorMessage?: string;
    className?: string;
}

export const OfflineDataDisplay: React.FC<OfflineDataDisplayProps> = ({
    dataType,
    children,
    emptyMessage,
    errorMessage,
    className = ''
}) => {
    const {
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
        refresh
    } = useOfflineDataContext();

    const { t, i18n } = useTranslation();

    // Get data based on type
    const getData = () => {
        switch (dataType) {
            case 'clinics':
                return clinics;
            case 'patients':
                return patients;
            case 'appointments':
                return appointments;
            case 'doctors':
                return doctors;
            case 'payments':
                return payments;
            case 'patientHealth':
                return patientHealth;
            default:
                return [];
        }
    };

    const data = getData();
    const hasDataForType = data.length > 0;

    // Default messages
    const defaultEmptyMessage = i18n.language === 'ar'
        ? `لا توجد بيانات ${dataType} متاحة`
        : `No ${dataType} data available`;

    const defaultErrorMessage = i18n.language === 'ar'
        ? `خطأ في تحميل بيانات ${dataType}`
        : `Error loading ${dataType} data`;

    // Show loading state
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">
                        {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || (!hasDataForType && isOffline)) {
        return (
            <div className={`p-4 ${className}`}>
                <Alert className="border-red-200 bg-red-50">
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {error || (errorMessage || defaultErrorMessage)}
                        {isOffline && (
                            <div className="mt-2 text-sm">
                                {i18n.language === 'ar'
                                    ? 'أنت غير متصل بالإنترنت. البيانات المخزنة مؤقتاً ستكون متاحة.'
                                    : 'You are offline. Cached data will be available.'
                                }
                            </div>
                        )}
                    </AlertDescription>
                </Alert>

                <div className="mt-4 flex gap-2">
                    <Button
                        onClick={refresh}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                    </Button>

                    {isOffline && hasData && (
                        <Button
                            onClick={() => window.location.reload()}
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Database className="h-4 w-4" />
                            {i18n.language === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Show empty state
    if (!hasDataForType) {
        return (
            <div className={`p-8 text-center ${className}`}>
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {i18n.language === 'ar' ? 'لا توجد بيانات' : 'No Data'}
                </h3>
                <p className="text-gray-600 mb-4">
                    {emptyMessage || defaultEmptyMessage}
                </p>
                <Button
                    onClick={refresh}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    {i18n.language === 'ar' ? 'تحديث' : 'Refresh'}
                </Button>
            </div>
        );
    }

    // Show data
    return (
        <div className={className}>
            {children(data, isLoading, error)}
        </div>
    );
};

export default OfflineDataDisplay;
