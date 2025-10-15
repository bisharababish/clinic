// hooks/useAdminState.tsx - IMPROVED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
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
    name_ar?: string; // Add this line
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
    name_ar?: string; // Add this line

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
    doctor_name_ar?: string;
    clinic_id: string;
    clinic_name: string;
    clinic_name_ar?: string;
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
    extendSession: () => void;

}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

export const AdminStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar'
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
    const subscriptionsRef = useRef<Array<ReturnType<typeof supabase.channel>>>([]);
    const isSubscribedRef = useRef(false);
    const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes (active session)
    const SESSION_EXTENSION_THRESHOLD = 2 * 60 * 1000; // 2 minutes (extend 2 minutes before cache expires)
    const SESSION_EXTENSION_DURATION = 20 * 60 * 1000; // 20 minutes (extended session length)
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeOperationsRef.current.size > 0) {
                console.log('🔍 Active operations:', Array.from(activeOperationsRef.current));
            }

            // Force clear if stuck for too long
            if (isLoadingRef.current && activeOperationsRef.current.size === 0) {
                console.warn('⚠️ Loading state stuck, forcing clear');
                setIsLoading(false);
                isLoadingRef.current = false;
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    const updateLoadingState = () => {
        const newLoadingState = activeOperationsRef.current.size > 0;
        isLoadingRef.current = newLoadingState;
        setIsLoading(newLoadingState);

        // Auto-clear loading state if stuck for too long
        if (newLoadingState) {
            setTimeout(() => {
                if (activeOperationsRef.current.size > 0) {
                    console.warn('⚠️ Clearing stuck loading operations');
                    activeOperationsRef.current.clear();
                    setIsLoading(false);
                    isLoadingRef.current = false;
                }
            }, 30000); // 30 second timeout
        }
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
            setTimeout(() => updateLoadingState(), 100); // Small delay to ensure state updates
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
        updateLoadingState();

        try {
            console.log('🔄 Loading clinics...');

            const { data, error } = await supabase
                .from('clinics')
                .select(`
        *,
        name_ar,
        clinic_categories!clinics_category_id_fkey (
            name_ar
        )
    `)
                .order('name', { ascending: true });
            if (error) throw error;  // ✅ ADD THIS LINE

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
            setTimeout(() => updateLoadingState(), 100); // Small delay to ensure state updates
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
        updateLoadingState();

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
            setTimeout(() => updateLoadingState(), 100); // Small delay to ensure state updates
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
        updateLoadingState();

        try {
            console.log('🔄 Loading appointments from both appointments and payment_bookings tables...');

            // Load appointments from appointments table
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select(`
    *,
    patients:patient_id (userid, english_username_a, english_username_d),
    doctors:doctor_id (id, name, name_ar),
    clinics:clinic_id (id, name, name_ar)
`)
                .order('date', { ascending: false });

            if (appointmentsError) throw appointmentsError;

            // Load paid payment bookings and convert them to appointment format
            const { data: paymentBookingsData, error: paymentBookingsError } = await supabase
                .from('payment_bookings')
                .select('*')
                .eq('payment_status', 'paid')
                .order('appointment_day', { ascending: false });

            if (paymentBookingsError) throw paymentBookingsError;

            console.log('🔍 Loaded payment bookings:', paymentBookingsData?.length || 0, paymentBookingsData);

            // Map appointments from appointments table
            const mappedAppointments: AppointmentInfo[] = appointmentsData?.map(apt => ({
                id: apt.id,
                patient_id: apt.patient_id,
                patient_name: `${apt.patients?.english_username_a || ''} ${apt.patients?.english_username_d || ''}`.trim(),
                doctor_id: apt.doctor_id,
                doctor_name: apt.doctors?.name || 'Unknown Doctor',
                doctor_name_ar: apt.doctors?.name_ar,
                clinic_id: apt.clinic_id,
                clinic_name: apt.clinics?.name || 'Unknown Clinic',
                clinic_name_ar: apt.clinics?.name_ar,
                date: apt.date,
                time: apt.time,
                status: apt.status,
                payment_status: apt.payment_status,
                price: apt.price,
                notes: apt.notes || '',
                created_at: apt.created_at,
                updated_at: apt.updated_at
            })) || [];

            // Map payment bookings to appointment format
            const mappedPaymentBookings: AppointmentInfo[] = paymentBookingsData?.map(pb => {
                // Try to find the actual doctor and clinic IDs from the names
                const foundDoctor = doctors.find(d =>
                    d.name === pb.doctor_name ||
                    d.name_ar === pb.doctor_name ||
                    d.name?.toLowerCase().includes(pb.doctor_name?.toLowerCase() || '') ||
                    d.name_ar?.toLowerCase().includes(pb.doctor_name?.toLowerCase() || '')
                );

                const foundClinic = clinics.find(c =>
                    c.name === pb.clinic_name ||
                    c.name_ar === pb.clinic_name ||
                    c.name?.toLowerCase().includes(pb.clinic_name?.toLowerCase() || '') ||
                    c.name_ar?.toLowerCase().includes(pb.clinic_name?.toLowerCase() || '')
                );

                // Debug logging for doctor/clinic matching
                if (!foundDoctor) {
                    console.log(`🔍 Could not find doctor for: "${pb.doctor_name}"`);
                    console.log(`🔍 Available doctors:`, doctors.map(d => ({ name: d.name, name_ar: d.name_ar })));
                }
                if (!foundClinic) {
                    console.log(`🔍 Could not find clinic for: "${pb.clinic_name}"`);
                    console.log(`🔍 Available clinics:`, clinics.map(c => ({ name: c.name, name_ar: c.name_ar })));
                }

                return {
                    id: `pb_${pb.id}`, // Prefix to distinguish from regular appointments
                    patient_id: pb.patient_id,
                    patient_name: pb.patient_name || 'Unknown Patient',
                    doctor_id: foundDoctor?.id || '',
                    doctor_name: foundDoctor?.name || pb.doctor_name || 'Unknown Doctor',
                    doctor_name_ar: foundDoctor?.name_ar || '',
                    clinic_id: foundClinic?.id || '',
                    clinic_name: foundClinic?.name || pb.clinic_name || 'Unknown Clinic',
                    clinic_name_ar: foundClinic?.name_ar || '',
                    date: pb.appointment_day,
                    time: pb.appointment_time,
                    status: pb.booking_status === 'scheduled' ? 'scheduled' : 'completed',
                    payment_status: 'paid',
                    price: pb.price,
                    notes: `Payment booking #${pb.id}`,
                    created_at: pb.created_at,
                    updated_at: pb.updated_at
                };
            }) || [];

            // Combine both sources and remove duplicates (payment bookings that already exist as appointments)
            const allAppointments = [...mappedAppointments, ...mappedPaymentBookings];

            // Remove duplicates based on patient_id, date, time, and doctor_name
            const uniqueAppointments = allAppointments.filter((appointment, index, self) =>
                index === self.findIndex(a =>
                    a.patient_id === appointment.patient_id &&
                    a.date === appointment.date &&
                    a.time === appointment.time &&
                    a.doctor_name === appointment.doctor_name
                )
            );

            setAppointments(uniqueAppointments);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${uniqueAppointments.length} appointments (${mappedAppointments.length} from appointments table, ${mappedPaymentBookings.length} from payment bookings)`);
            console.log('🔍 Final appointments list:', uniqueAppointments);
        } catch (error: unknown) {
            console.error('❌ Failed to load appointments:', error);
            setError('Failed to load appointments: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            activeOperationsRef.current.delete(operationId);
            setTimeout(() => updateLoadingState(), 100); // Small delay to ensure state updates
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
        updateLoadingState();

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
            setTimeout(() => updateLoadingState(), 100); // Small delay to ensure state updates
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
    const extendSession = () => {
        const now = Date.now();
        console.log('🔄 Extending session and refreshing cache...');

        // Clear existing cache to force fresh data
        setLastUpdated({});

        // Optionally load fresh data immediately
        loadAll(true);

        toast({
            title: isRTL ? 'تم تمديد الجلسة' : 'Session Extended',
            description: isRTL ? 'تم تحديث البيانات بنجاح' : 'Data refreshed successfully',
            variant: 'default',
        });
    };
    useEffect(() => {
        const checkSessionExtension = () => {
            const now = Date.now();

            // Check if any cache is approaching expiration
            Object.entries(lastUpdated).forEach(([key, timestamp]) => {
                const timeUntilExpiry = CACHE_DURATION - (now - timestamp);

                if (timeUntilExpiry <= SESSION_EXTENSION_THRESHOLD && timeUntilExpiry > 0) {
                    console.log(`🔔 Cache for ${key} expiring soon, extending session...`);
                    extendSession();
                    return;
                }
            });
        };

        // Check every minute
        const interval = setInterval(checkSessionExtension, 60000);

        return () => clearInterval(interval);
    }, [lastUpdated]);
    useEffect(() => {
        // Prevent multiple subscriptions
        if (isSubscribedRef.current) {
            console.log('🔗 Subscriptions already active, skipping setup...');
            return;
        }

        console.log('🔗 Setting up admin state subscriptions...');
        isSubscribedRef.current = true;

        const debouncedRefresh = (tableName: string, loadFunction: () => Promise<void>) => {
            const existingTimeout = debouncedOperations.current.get(tableName);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            const newTimeout = setTimeout(async () => {
                try {
                    if (!activeOperationsRef.current.has(`load-${tableName}`)) {
                        await loadFunction();
                    }
                } catch (error) {
                    console.error(`❌ Error in debounced refresh for ${tableName}:`, error);
                } finally {
                    debouncedOperations.current.delete(tableName);
                }
            }, 1000);

            debouncedOperations.current.set(tableName, newTimeout);
        };

        // Create unique channel names to prevent conflicts
        const timestamp = Date.now();
        const channelSuffix = `-${timestamp}`;

        const usersSubscription = supabase
            .channel(`admin-users-realtime${channelSuffix}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'userinfo' }, () => {
                debouncedRefresh('users', () => loadUsers(true));
            })
            .subscribe();
        subscriptionsRef.current.push(usersSubscription);

        const clinicsSubscription = supabase
            .channel(`admin-clinics-realtime${channelSuffix}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, () => {
                debouncedRefresh('clinics', () => loadClinics(true));
            })
            .subscribe();
        subscriptionsRef.current.push(clinicsSubscription);

        const categoriesSubscription = supabase
            .channel(`admin-categories-realtime${channelSuffix}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_categories' }, () => {
                debouncedRefresh('categories', () => loadCategories(true));
            })
            .subscribe();
        subscriptionsRef.current.push(categoriesSubscription);

        const doctorsSubscription = supabase
            .channel(`admin-doctors-realtime${channelSuffix}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
                debouncedRefresh('doctors', () => loadDoctors(true));
            })
            .subscribe();
        subscriptionsRef.current.push(doctorsSubscription);

        const appointmentsSubscription = supabase
            .channel(`admin-appointments-realtime${channelSuffix}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                debouncedRefresh('appointments', () => loadAppointments(true));
            })
            .subscribe();
        subscriptionsRef.current.push(appointmentsSubscription);

        return () => {
            console.log('🧹 Cleaning up admin state subscriptions...');
            subscriptionsRef.current.forEach(sub => {
                try {
                    sub?.unsubscribe();
                } catch (error) {
                    console.warn('Warning: Error unsubscribing from channel:', error);
                }
            });
            subscriptionsRef.current = [];
            debouncedOperations.current.forEach(timeout => clearTimeout(timeout));
            debouncedOperations.current.clear();
            isSubscribedRef.current = false;
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
        extendSession,

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