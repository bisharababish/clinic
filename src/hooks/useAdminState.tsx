// hooks/useAdminState.tsx - IMPROVED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    description?: string;
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

    const CACHE_DURATION = 120 * 1000;

    const loadUsers = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheKey = 'users';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached users data');
            return;
        }

        try {
            console.log('🔄 Loading users...');

            const { data, error } = await supabase
                .from('userinfo')
                .select('*')
                .order('userid', { ascending: false });

            if (error) {
                console.error('❌ Error loading users:', error);
                throw error;
            }

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
        }
    };

    const loadClinics = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheKey = 'clinics';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached clinics data');
            return;
        }

        try {
            console.log('🔄 Loading clinics...');

            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('❌ Error loading clinics:', error);
                throw error;
            }

            setClinics(data || []);
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
        }
    };

    const loadDoctors = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheKey = 'doctors';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached doctors data');
            return;
        }

        try {
            console.log('🔄 Loading doctors...');

            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('❌ Error loading doctors:', error);
                throw error;
            }

            setDoctors(data || []);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} doctors`);
        } catch (error: unknown) {
            console.error('❌ Failed to load doctors:', error);
            setError('Failed to load doctors: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const loadAppointments = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheKey = 'appointments';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached appointments data');
            return;
        }

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

            if (error) {
                console.error('❌ Error loading appointments:', error);
                throw error;
            }

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
        }
    };

    const loadCategories = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheKey = 'categories';

        if (!forceRefresh && lastUpdated[cacheKey] && (now - lastUpdated[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Using cached categories data');
            return;
        }

        try {
            console.log('🔄 Loading categories...');

            const { data, error } = await supabase
                .from('clinic_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('❌ Error loading categories:', error);
                setCategories([]);
                return;
            }

            setCategories(data || []);
            setLastUpdated(prev => ({ ...prev, [cacheKey]: now }));
            console.log(`✅ Loaded ${data?.length || 0} categories`);
        } catch (error: unknown) {
            console.error('❌ Failed to load categories:', error);
            setCategories([]);
        }
    };

    const loadAll = async (forceRefresh = false) => {
        console.log('🔄 Loading all data...');
        setIsLoading(true);

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

    // ✅ IMPROVED: More robust real-time subscriptions with proper error handling
    useEffect(() => {
        console.log('🔗 Setting up admin state subscriptions...');

        const subscriptions: Array<ReturnType<typeof supabase.channel>> = [];

        // Users subscription with better handling
        const usersSubscription = supabase
            .channel('admin-users-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'userinfo' },
                (payload) => {
                    console.log('🔄 Users table changed:', payload.eventType, payload);

                    // Handle specific events for immediate UI updates
                    if (payload.eventType === 'INSERT' && payload.new) {
                        setUsers(prev => [payload.new as UserInfo, ...prev]);
                        console.log('✅ User added to state immediately');
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        setUsers(prev => prev.map(user =>
                            user.userid === (payload.new as UserInfo).userid ? payload.new as UserInfo : user
                        ));
                        console.log('✅ User updated in state immediately');
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        setUsers(prev => prev.filter(user => user.userid !== (payload.old as UserInfo).userid));
                        console.log('✅ User removed from state immediately');
                    }

                    // Also refresh after a small delay for consistency
                    setTimeout(() => loadUsers(true), 1000);
                }
            )
            .subscribe((status) => {
                console.log('Users subscription status:', status);
            });
        subscriptions.push(usersSubscription);

        // Clinics subscription with immediate updates
        const clinicsSubscription = supabase
            .channel('admin-clinics-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'clinics' },
                (payload) => {
                    console.log('🔄 Clinics table changed:', payload.eventType, payload);

                    if (payload.eventType === 'INSERT' && payload.new) {
                        setClinics(prev => [...prev, payload.new as ClinicInfo]);
                        console.log('✅ Clinic added to state immediately');
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        setClinics(prev => prev.map(clinic =>
                            clinic.id === (payload.new as ClinicInfo).id ? payload.new as ClinicInfo : clinic
                        ));
                        console.log('✅ Clinic updated in state immediately');
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        setClinics(prev => prev.filter(clinic => clinic.id !== (payload.old as ClinicInfo).id));
                        console.log('✅ Clinic removed from state immediately');
                    }

                    setTimeout(() => loadClinics(true), 1000);
                }
            )
            .subscribe((status) => {
                console.log('Clinics subscription status:', status);
            });
        subscriptions.push(clinicsSubscription);

        // Categories subscription with immediate updates
        const categoriesSubscription = supabase
            .channel('admin-categories-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'clinic_categories' },
                (payload) => {
                    console.log('🔄 Categories table changed:', payload.eventType, payload);

                    if (payload.eventType === 'INSERT' && payload.new) {
                        setCategories(prev => [...prev, payload.new as CategoryInfo]);
                        console.log('✅ Category added to state immediately');
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        setCategories(prev => prev.map(category =>
                            category.id === (payload.new as CategoryInfo).id ? payload.new as CategoryInfo : category
                        ));
                        console.log('✅ Category updated in state immediately');
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        setCategories(prev => prev.filter(category => category.id !== (payload.old as CategoryInfo).id));
                        console.log('✅ Category removed from state immediately');
                    }

                    setTimeout(() => loadCategories(true), 1000);
                }
            )
            .subscribe((status) => {
                console.log('Categories subscription status:', status);
            });
        subscriptions.push(categoriesSubscription);

        // Doctors subscription
        const doctorsSubscription = supabase
            .channel('admin-doctors-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'doctors' },
                (payload) => {
                    console.log('🔄 Doctors table changed:', payload.eventType, payload);

                    if (payload.eventType === 'INSERT' && payload.new) {
                        setDoctors(prev => [...prev, payload.new as DoctorInfo]);
                        console.log('✅ Doctor added to state immediately');
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        setDoctors(prev => prev.map(doctor =>
                            doctor.id === (payload.new as DoctorInfo).id ? payload.new as DoctorInfo : doctor
                        ));
                        console.log('✅ Doctor updated in state immediately');
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        setDoctors(prev => prev.filter(doctor => doctor.id !== (payload.old as DoctorInfo).id));
                        console.log('✅ Doctor removed from state immediately');
                    }

                    setTimeout(() => loadDoctors(true), 1000);
                }
            )
            .subscribe((status) => {
                console.log('Doctors subscription status:', status);
            });
        subscriptions.push(doctorsSubscription);

        // Appointments subscription (more complex due to joins)
        const appointmentsSubscription = supabase
            .channel('admin-appointments-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                (payload) => {
                    console.log('🔄 Appointments table changed:', payload.eventType, payload);
                    // For appointments, we'll just refresh since they have complex joins
                    setTimeout(() => loadAppointments(true), 500);
                }
            )
            .subscribe((status) => {
                console.log('Appointments subscription status:', status);
            });
        subscriptions.push(appointmentsSubscription);

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up admin state subscriptions...');
            subscriptions.forEach(sub => {
                if (sub) {
                    sub.unsubscribe();
                }
            });
        };
    }, []); // Empty dependency array - only run once

    // Initial data load
    useEffect(() => {
        console.log('🚀 AdminStateProvider initialized, loading initial data...');
        loadAll(false); // Don't force refresh on initial load
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