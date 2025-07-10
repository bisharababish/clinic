// hooks/useAdminState.tsx - IMPROVED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Complete interfaces
interface UserInfo {
    user_id: string;
    userid: number;
    user_email: string;
    english_username_a: string;
    english_username_b?: string;
    english_username_c?: string;
    english_username_d?: string;
    arabic_username_a?: string;
    arabic_username_b?: string;
    arabic_username_c?: string;
    arabic_username_d?: string;
    id_number?: string;
    user_roles: string;
    user_phonenumber?: string;
    date_of_birth?: string;
    gender_user?: string;
    created_at?: string;
}

interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    category_name_en?: string;  // Add this
    category_name_ar?: string;  // Add this
    category_id?: string;
    description?: string;
    display_order?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    email: string;
    phone?: string;
    is_available: boolean;
    price: number;
    created_at?: string;
    updated_at?: string;
}

interface AppointmentInfo {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    doctor_name: string;
    clinic_id: string;
    clinic_name: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    price: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

interface CategoryInfo {
    id: string;
    name: string;
    display_order?: number;  // ADD THIS LINE

    is_active: boolean;
}

interface AdminState {
    users: UserInfo[];
    clinics: ClinicInfo[];
    doctors: DoctorInfo[];
    appointments: AppointmentInfo[];
    categories: CategoryInfo[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: { [key: string]: number };
}

interface AdminStateContextType extends AdminState {
    // Loading functions
    loadUsers: (forceRefresh?: boolean) => Promise<void>;
    loadClinics: (forceRefresh?: boolean) => Promise<void>;
    loadDoctors: (forceRefresh?: boolean) => Promise<void>;
    loadAppointments: (forceRefresh?: boolean) => Promise<void>;
    loadCategories: (forceRefresh?: boolean) => Promise<void>;
    loadAll: (forceRefresh?: boolean) => Promise<void>;
    refreshAll: () => Promise<void>;

    // State setters
    setUsers: React.Dispatch<React.SetStateAction<UserInfo[]>>;
    setClinics: React.Dispatch<React.SetStateAction<ClinicInfo[]>>;
    setDoctors: React.Dispatch<React.SetStateAction<DoctorInfo[]>>;
    setAppointments: React.Dispatch<React.SetStateAction<AppointmentInfo[]>>;
    setCategories: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;

    // Helper functions
    clearCache: () => void;
    getUser: (userid: number) => UserInfo | undefined;
    getClinic: (clinicId: string) => ClinicInfo | undefined;
    getDoctor: (doctorId: string) => DoctorInfo | undefined;
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

export const AdminStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [clinics, setClinics] = useState<ClinicInfo[]>([]);
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<{ [key: string]: number }>({});
    const { toast } = useToast();
    const activeOperationsRef = useRef(new Set<string>());
    const isLoadingRef = useRef(false);
    const debouncedOperations = useRef(new Map<string, NodeJS.Timeout>());
    const CACHE_DURATION = 120 * 1000;
    const updateLoadingState = () => {
        const newLoadingState = activeOperationsRef.current.size > 0;
        isLoadingRef.current = newLoadingState;
        setIsLoading(newLoadingState);
    };
    // REPLACE THE ENTIRE loadUsers FUNCTION WITH THIS:
    const loadUsers = async (forceRefresh = false) => {
        if (isLoadingRef.current && !forceRefresh) {
            console.log('⏳ Already loading, skipping users load');
            return;
        }

        const now = Date.now();
        const cacheKey = 'users';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached users data');
            return;
        }

        const operationId = `load-users-${now}`;
        activeOperationsRef.current.add(operationId); // ADD THIS
        updateLoadingState(); // ADD THIS
        try {
            console.log('🔄 Loading users...');

            const { data, error } = await supabase
                .from('userinfo')
                .select('*')
                .order('userid', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} users`);
        } catch (error: unknown) {
            console.error('❌ Failed to load users:', error);
            setError('Failed to load users: ' + (error instanceof Error ? error.message : String(error)));
            toast({
                title: 'Error',
                description: 'Failed to load users',
                variant: 'destructive',
            });
        } finally {
            activeOperationsRef.current.delete(operationId); // CHANGE THIS
            updateLoadingState(); // CHANGE THIS
        }
    };

    // REPLACE THE ENTIRE loadClinics FUNCTION WITH THIS:
    const loadClinics = async (forceRefresh = false) => {
        if (isLoadingRef.current && !forceRefresh) {
            console.log('⏳ Already loading, skipping clinics load');
            return;
        }

        const now = Date.now();
        const cacheKey = 'clinics';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached clinics data');
            return;
        }

        const operationId = `load-clinics-${now}`;
        activeOperationsRef.current.add(operationId);
        isLoadingRef.current = true;

        try {
            console.log('🔄 Loading clinics...');

            const { data, error } = await supabase
                .from('clinics')
                .select(`
                *,
                clinic_categories!clinics_category_id_fkey (
                    name_ar
                )
            `)
                .order('name', { ascending: true });

            if (error) throw error;

            const transformedClinics = (data || []).map(clinic => ({
                ...clinic,
                category_name_ar: clinic.clinic_categories?.name_ar
            }));

            setClinics(transformedClinics);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} clinics`);
        } catch (error: unknown) {
            console.error('❌ Failed to load clinics:', error);
            setError('Failed to load clinics: ' + (error instanceof Error ? error.message : String(error)));
            toast({
                title: 'Error',
                description: 'Failed to load clinics',
                variant: 'destructive',
            });
        } finally {
            activeOperationsRef.current.delete(operationId);
            updateLoadingState();
        }
    };
    // REPLACE THE ENTIRE loadDoctors FUNCTION WITH THIS:
    const loadDoctors = async (forceRefresh = false) => {
        if (isLoadingRef.current && !forceRefresh) {
            console.log('⏳ Already loading, skipping doctors load');
            return;
        }

        const now = Date.now();
        const cacheKey = 'doctors';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached doctors data');
            return;
        }

        const operationId = `load-doctors-${now}`;
        activeOperationsRef.current.add(operationId);
        isLoadingRef.current = true;

        try {
            console.log('🔄 Loading doctors...');

            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setDoctors(data || []);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} doctors`);
        } catch (error: unknown) {
            console.error('❌ Failed to load doctors:', error);
            setError('Failed to load doctors: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            activeOperationsRef.current.delete(operationId);
            updateLoadingState();
        }
    };

    // REPLACE THE ENTIRE loadAppointments FUNCTION WITH THIS:
    const loadAppointments = async (forceRefresh = false) => {
        if (isLoadingRef.current && !forceRefresh) {
            console.log('⏳ Already loading, skipping appointments load');
            return;
        }

        const now = Date.now();
        const cacheKey = 'appointments';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached appointments data');
            return;
        }

        const operationId = `load-appointments-${now}`;
        activeOperationsRef.current.add(operationId);
        isLoadingRef.current = true;

        try {
            console.log('🔄 Loading appointments...');

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                *,
                patients:patient_id (userid, english_username_a, english_username_d),
                doctors:doctor_id (id, name),
                clinics:clinic_id (id, name)
            `)
                .order('date', { ascending: false });

            if (error) throw error;

            const mappedAppointments: AppointmentInfo[] = data?.map(apt => ({
                id: apt.id,
                patient_id: apt.patient_id,
                patient_name: `${apt.patients?.english_username_a || ''} ${apt.patients?.english_username_d || ''}`.trim(),
                doctor_id: apt.doctor_id,
                doctor_name: apt.doctors?.name || 'Unknown Doctor',
                clinic_id: apt.clinic_id,
                clinic_name: apt.clinics?.name || 'Unknown Clinic',
                date: apt.date,
                time: apt.time,
                status: apt.status,
                payment_status: apt.payment_status,
                price: apt.price,
                notes: apt.notes || '',
                created_at: apt.created_at,
                updated_at: apt.updated_at
            })) || [];

            setAppointments(mappedAppointments);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${mappedAppointments.length} appointments`);
        } catch (error: unknown) {
            console.error('❌ Failed to load appointments:', error);
            setError('Failed to load appointments: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            activeOperationsRef.current.delete(operationId);
            updateLoadingState();
        }
    };

    // REPLACE THE ENTIRE loadCategories FUNCTION WITH THIS:
    const loadCategories = async (forceRefresh = false) => {
        if (isLoadingRef.current && !forceRefresh) {
            console.log('⏳ Already loading, skipping categories load');
            return;
        }

        const now = Date.now();
        const cacheKey = 'categories';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached categories data');
            return;
        }

        const operationId = `load-categories-${now}`;
        activeOperationsRef.current.add(operationId);
        isLoadingRef.current = true;

        try {
            console.log('🔄 Loading categories...');

            const { data, error } = await supabase
                .from('clinic_categories')
                .select('id, name, name_en, name_ar, display_order, is_active')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;

            setCategories(data || []);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} categories`);
        } catch (error: unknown) {
            console.error('❌ Failed to load categories:', error);
            setCategories([]);
        } finally {
            activeOperationsRef.current.delete(operationId);
            updateLoadingState();
        }
    };

    const loadAll = async (forceRefresh = false) => {
        console.log('🔄 Loading all data...');

        try {
            await Promise.all([
                loadUsers(forceRefresh),
                loadClinics(forceRefresh),
                loadDoctors(forceRefresh),
                loadAppointments(forceRefresh),
                loadCategories(forceRefresh)
            ]);
            console.log('✅ All data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load all data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshAll = async () => {
        console.log('🔄 Force refreshing all data...');
        await loadAll(true);
    };

    const clearCache = () => {
        console.log('🗑️ Clearing cache...');
        setLastUpdated({});
    };

    // Helper functions
    const getUser = (userid: number) => users.find(u => u.userid === userid);
    const getClinic = (clinicId: string) => clinics.find(c => c.id === clinicId);
    const getDoctor = (doctorId: string) => doctors.find(d => d.id === doctorId);

    // REPLACE THE ENTIRE SUBSCRIPTIONS useEffect WITH THIS:
    // REPLACE THE ENTIRE useEffect WITH SUBSCRIPTIONS WITH THIS:
    useEffect(() => {
        console.log('🔗 Setting up admin state subscriptions...');

        const subscriptions: Array<ReturnType<typeof supabase.channel>> = [];

        const debouncedRefresh = (tableName: string, loadFunction: () => Promise<void>) => {
            const existingTimeout = debouncedOperations.current.get(tableName);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            const newTimeout = setTimeout(() => {
                if (!activeOperationsRef.current.has(`load-${tableName}`)) {
                    loadFunction();
                }
                debouncedOperations.current.delete(tableName);
            }, 1000);

            debouncedOperations.current.set(tableName, newTimeout);
        };

        const usersSubscription = supabase
            .channel('admin-users-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'userinfo' }, () => {
                debouncedRefresh('users', () => loadUsers(true));
            })
            .subscribe();
        subscriptions.push(usersSubscription);

        const clinicsSubscription = supabase
            .channel('admin-clinics-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, () => {
                debouncedRefresh('clinics', () => loadClinics(true));
            })
            .subscribe();
        subscriptions.push(clinicsSubscription);

        const categoriesSubscription = supabase
            .channel('admin-categories-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_categories' }, () => {
                debouncedRefresh('categories', () => loadCategories(true));
            })
            .subscribe();
        subscriptions.push(categoriesSubscription);

        const doctorsSubscription = supabase
            .channel('admin-doctors-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
                debouncedRefresh('doctors', () => loadDoctors(true));
            })
            .subscribe();
        subscriptions.push(doctorsSubscription);

        const appointmentsSubscription = supabase
            .channel('admin-appointments-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                debouncedRefresh('appointments', () => loadAppointments(true));
            })
            .subscribe();
        subscriptions.push(appointmentsSubscription);

        return () => {
            console.log('🧹 Cleaning up admin state subscriptions...');
            subscriptions.forEach(sub => sub?.unsubscribe());
            debouncedOperations.current.forEach(timeout => clearTimeout(timeout));
            debouncedOperations.current.clear();
        };
    }, []);

    // Initial data load
    useEffect(() => {
        console.log('🚀 AdminStateProvider initialized, loading initial data...');
        loadAll(true); // Always force refresh on initial load for admin
    }, []);

    const value: AdminStateContextType = {
        // State
        users,
        clinics,
        doctors,
        appointments,
        categories,
        isLoading,
        error,
        lastUpdated,

        // Loading functions
        loadUsers,
        loadClinics,
        loadDoctors,
        loadAppointments,
        loadCategories,
        loadAll,
        refreshAll,

        // State setters
        setUsers,
        setClinics,
        setDoctors,
        setAppointments,
        setCategories,
        setIsLoading,
        setError,

        // Helper functions
        clearCache,
        getUser,
        getClinic,
        getDoctor,
    };

    return (
        <AdminStateContext.Provider value={value}>
            {children}
        </AdminStateContext.Provider>
    );
};

export const useAdminState = () => {
    const context = useContext(AdminStateContext);
    if (context === undefined) {
        throw new Error('useAdminState must be used within an AdminStateProvider');
    }
    return context;
};