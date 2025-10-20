// Offline Data Access Utility for Bethlehem Medical Center
// Provides consistent access to cached data across all components

import { offlineAuthManager } from './offlineAuth';

interface CachedData {
    patients: any[];
    appointments: any[];
    doctors: any[];
    clinics: any[];
    payments: any[];
    patientHealth: any[];
}

class OfflineDataAccess {
    private static instance: OfflineDataAccess;

    static getInstance(): OfflineDataAccess {
        if (!OfflineDataAccess.instance) {
            OfflineDataAccess.instance = new OfflineDataAccess();
        }
        return OfflineDataAccess.instance;
    }

    // Get all cached data
    getCachedData(): CachedData {
        const authData = offlineAuthManager.getStoredAuthData();
        if (!authData) {
            return {
                patients: [],
                appointments: [],
                doctors: [],
                clinics: [],
                payments: [],
                patientHealth: []
            };
        }

        return {
            patients: authData.cachedData.patients || [],
            appointments: authData.cachedData.appointments || [],
            doctors: authData.cachedData.doctors || [],
            clinics: authData.cachedData.clinics || [],
            payments: authData.cachedData.payments || [],
            patientHealth: authData.cachedData.patientHealth || []
        };
    }

    // Get specific data type
    getCachedDataByType(type: keyof CachedData): any[] {
        const cachedData = this.getCachedData();
        return cachedData[type] || [];
    }

    // Check if offline data is available
    isOfflineDataAvailable(): boolean {
        return offlineAuthManager.isOfflineAuthAvailable();
    }

    // Get offline user info
    getOfflineUser(): any {
        return offlineAuthManager.getOfflineUser();
    }

    // Check if user has offline access
    hasOfflineAccess(): boolean {
        return offlineAuthManager.hasOfflineAccess();
    }

    // Get cached clinics
    getCachedClinics(): any[] {
        return this.getCachedDataByType('clinics');
    }

    // Get cached patients
    getCachedPatients(): any[] {
        return this.getCachedDataByType('patients');
    }

    // Get cached appointments
    getCachedAppointments(): any[] {
        return this.getCachedDataByType('appointments');
    }

    // Get cached doctors
    getCachedDoctors(): any[] {
        return this.getCachedDataByType('doctors');
    }

    // Get cached payments
    getCachedPayments(): any[] {
        return this.getCachedDataByType('payments');
    }

    // Get cached patient health data
    getCachedPatientHealth(): any[] {
        return this.getCachedDataByType('patientHealth');
    }

    // Search cached data
    searchCachedData(type: keyof CachedData, searchTerm: string): any[] {
        const data = this.getCachedDataByType(type);
        if (!searchTerm) return data;

        const term = searchTerm.toLowerCase();
        return data.filter(item => {
            // Search in common fields
            const searchableFields = [
                item.name,
                item.email,
                item.id,
                item.patient_id,
                item.doctor_name,
                item.clinic_name,
                item.description,
                item.title
            ].filter(Boolean);

            return searchableFields.some(field =>
                field.toString().toLowerCase().includes(term)
            );
        });
    }

    // Get data count
    getDataCount(type: keyof CachedData): number {
        return this.getCachedDataByType(type).length;
    }

    // Get total cached items count
    getTotalCachedItems(): number {
        const data = this.getCachedData();
        return Object.values(data).reduce((total, items) => total + items.length, 0);
    }
}

// Export singleton instance
export const offlineDataAccess = OfflineDataAccess.getInstance();

// Helper functions for easy access
export const getCachedClinics = () => offlineDataAccess.getCachedClinics();
export const getCachedPatients = () => offlineDataAccess.getCachedPatients();
export const getCachedAppointments = () => offlineDataAccess.getCachedAppointments();
export const getCachedDoctors = () => offlineDataAccess.getCachedDoctors();
export const getCachedPayments = () => offlineDataAccess.getCachedPayments();
export const getCachedPatientHealth = () => offlineDataAccess.getCachedPatientHealth();
export const isOfflineDataAvailable = () => offlineDataAccess.isOfflineDataAvailable();
export const getOfflineUser = () => offlineDataAccess.getOfflineUser();
export const hasOfflineAccess = () => offlineDataAccess.hasOfflineAccess();
export const getTotalCachedItems = () => offlineDataAccess.getTotalCachedItems();
