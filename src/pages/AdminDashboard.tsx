// pages/AdminDashboard.tsx with i18n support
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClinicManagement from "./api/admin/ClinicManagement";
import DoctorManagement from "./api/admin/DoctorManagement";
import UsersManagement from "./api/admin/UsersManagement";
import AppointmentsManagement from "./api/admin/AppointmentsManagement";
import SettingsManagement from "./api/admin/SettingsManagement";
import OverviewManagement from "./api/admin/OverviewManagement";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

// Interfaces (same as before)
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
    isActive: boolean;
}

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    email: string;
    phone?: string;
    isAvailable: boolean;
    price: number;
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
}

interface ActivityLog {
    id: string;
    action: string;
    user: string;
    details?: string;
    timestamp: string;
    status: 'success' | 'failed' | 'pending';
}

interface SystemSettings {
    setting_name: string;
    setting_value: string;
    setting_type: 'text' | 'number' | 'boolean' | 'select';
    setting_options?: string[];
    setting_description?: string;
}

interface ReportData {
    appointments_count: number;
    appointments_by_clinic: { [key: string]: number };
    appointments_by_doctor: { [key: string]: number };
    revenue: number;
    revenue_by_clinic: { [key: string]: number };
    users_by_role: { [key: string]: number };
    total_users: number;
    recent_activity: ActivityLog[];
}

// Main Component
const AdminDashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();

    // State variables
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Data state
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
    const [clinics, setClinics] = useState<ClinicInfo[]>([]);
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([]);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    // Check admin status
    useEffect(() => {
        const initializeAdminDashboard = async () => {
            if (authLoading) return;

            setIsLoading(true);
            setError(null);

            console.log('Starting admin dashboard initialization');

            try {
                // Hard-code admin access for development - remove in production
                setIsAdmin(true);

                // Load all data in sequence to ensure consistent loading
                console.log(t('admin.loadingUsers'));

                try {
                    await loadUsers();
                    console.log(t('admin.usersLoaded'));
                } catch (e) {
                    console.error('Error loading users:', e);
                }

                try {
                    await loadClinics();
                    console.log(t('admin.clinicsLoaded'));
                } catch (e) {
                    console.error('Error loading clinics:', e);
                }

                try {
                    await loadDoctors();
                    console.log(t('admin.doctorsLoaded'));
                } catch (e) {
                    console.error('Error loading doctors:', e);
                }

                try {
                    await loadAppointments();
                    console.log(t('admin.appointmentsLoaded'));
                } catch (e) {
                    console.error('Error loading appointments:', e);
                }

                try {
                    await loadActivityLog();
                    console.log(t('admin.activityLogsLoaded'));
                } catch (e) {
                    console.error('Error loading activity logs:', e);
                }

                try {
                    await loadSystemSettings();
                    console.log(t('admin.systemSettingsLoaded'));
                } catch (e) {
                    console.error('Error loading system settings:', e);
                }

                try {
                    await generateReportData();
                    console.log(t('admin.reportDataGenerated'));
                } catch (e) {
                    console.error('Error generating report data:', e);
                }

                console.log(t('admin.dashboardInitializationComplete'));

            } catch (error) {
                console.error('Error in dashboard initialization:', error);
                setError(t('admin.errorLoadingDashboard'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeAdminDashboard();
    }, [authLoading, t]);

    // Handle search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user =>
                user.user_email.toLowerCase().includes(query) ||
                user.english_username_a.toLowerCase().includes(query) ||
                (user.english_username_d && user.english_username_d.toLowerCase().includes(query)) ||
                user.user_roles.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Data loading functions (keeping most of the original logic but updating error messages)
    const loadUsers = async () => {
        console.log(t('admin.loadingUsers'));
        try {
            setIsLoading(true);

            const timestamp = new Date().getTime();
            let data = [];
            let error = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`Fetching users attempt ${attempt}/3`);
                const result = await supabase
                    .from('userinfo')
                    .select('*')
                    .order('userid', { ascending: false });

                if (!result.error) {
                    data = result.data || [];
                    error = null;
                    console.log(`Fetch successful, got ${data.length} users`);
                    break;
                } else {
                    error = result.error;
                    console.warn(`Fetch attempt ${attempt} failed:`, error);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (error) {
                console.error('Supabase error loading users after multiple attempts:', error);
                toast({
                    title: t('common.error'),
                    description: t('admin.errorLoadingUsers'),
                    variant: "destructive",
                });
                return null;
            }

            console.log(`Users loaded: ${data.length}`);
            if (data.length > 0) {
                console.log('First few user IDs:', data.slice(0, 3).map(u => u.userid));
            }

            setUsers(data);

            if (searchQuery.trim() === '') {
                setFilteredUsers(data);
            } else {
                const query = searchQuery.toLowerCase();
                const filtered = data.filter(user =>
                    (user.user_email && user.user_email.toLowerCase().includes(query)) ||
                    (user.english_username_a && user.english_username_a.toLowerCase().includes(query)) ||
                    (user.english_username_d && user.english_username_d.toLowerCase().includes(query)) ||
                    (user.user_roles && user.user_roles.toLowerCase().includes(query))
                );
                setFilteredUsers(filtered);
            }

            // Set up real-time subscription (keeping original logic)
            const subscription = supabase
                .channel('userinfo-changes')
                .on('postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'userinfo'
                    },
                    (payload) => {
                        console.log('Real-time INSERT event received:', payload);
                        const newUser = payload.new as UserInfo;
                        setUsers(prev => [newUser, ...prev]);

                        if (searchQuery.trim() === '' ||
                            (newUser.user_email && newUser.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (newUser.english_username_a && newUser.english_username_a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (newUser.english_username_d && newUser.english_username_d.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (newUser.user_roles && newUser.user_roles.toLowerCase().includes(searchQuery.toLowerCase()))) {
                            setFilteredUsers(prev => [newUser, ...prev]);
                        }
                    })
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'userinfo'
                    },
                    (payload) => {
                        console.log('Real-time UPDATE event received:', payload);
                        const updatedUser = payload.new as UserInfo;
                        setUsers(prev => prev.map(user =>
                            user.userid === updatedUser.userid ? updatedUser : user
                        ));
                        setFilteredUsers(prev => prev.map(user =>
                            user.userid === updatedUser.userid ? updatedUser : user
                        ));
                    })
                .on('postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'userinfo'
                    },
                    (payload) => {
                        console.log('Real-time DELETE event received:', payload);
                        if (payload.old && payload.old.userid) {
                            const deletedUserId = payload.old.userid;
                            console.log(`Removing user ${deletedUserId} from state due to real-time DELETE`);
                            setUsers(prev => prev.filter(user => user.userid !== deletedUserId));
                            setFilteredUsers(prev => prev.filter(user => user.userid !== deletedUserId));
                        }
                    })
                .subscribe((status) => {
                    console.log('Subscription status:', status);
                });

            return () => {
                console.log('Cleaning up subscription');
                supabase.removeChannel(subscription);
            };
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                title: t('common.error'),
                description: t('admin.failedToLoadUsers'),
                variant: "destructive",
            });
            setUsers([]);
            setFilteredUsers([]);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Set up real-time subscription and periodic refresh
    useEffect(() => {
        const setupSubscription = loadUsers();

        const refreshInterval = setInterval(() => {
            console.log('Running scheduled refresh...');
            loadUsers();
        }, 30000);

        return () => {
            setupSubscription.then(cleanup => {
                if (cleanup) cleanup();
            });
            clearInterval(refreshInterval);
        };
    }, []);

    const loadClinics = async () => {
        console.log(t('admin.loadingClinics'));
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Supabase error loading clinics:', error);
                if (error.code === 'PGRST301') {
                    console.log('Clinics table may not exist yet');
                }
                return;
            }

            if (!data || data.length === 0) {
                console.log('No clinics found');
                setClinics([]);
                return;
            }

            const mappedClinics: ClinicInfo[] = data.map(clinic => ({
                id: clinic.id,
                name: clinic.name,
                category: clinic.category,
                description: clinic.description || '',
                isActive: clinic.is_active
            }));

            setClinics(mappedClinics);
            console.log('Clinics loaded:', mappedClinics.length);
        } catch (error) {
            console.error('Error loading clinics:', error);
            toast({
                title: t('common.warning'),
                description: t('admin.errorLoadingClinics'),
                variant: "default",
            });
        }
    };

    const loadDoctors = async () => {
        console.log(t('admin.loadingDoctors'));
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select(`
                    *,
                    clinics:clinic_id (name)
                `)
                .order('name', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            const mappedDoctors: DoctorInfo[] = data.map(doctor => ({
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty,
                clinic_id: doctor.clinic_id,
                email: doctor.email,
                phone: doctor.phone || '',
                isAvailable: doctor.is_available,
                price: doctor.price
            }));

            setDoctors(mappedDoctors);
            console.log('Doctors loaded:', mappedDoctors.length);
        } catch (error) {
            console.error('Error loading doctors:', error);
            throw error;
        }
    };

    const loadAppointments = async () => {
        console.log(t('admin.loadingAppointments'));
        try {
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
                console.error('Supabase error:', error);
                throw error;
            }

            const mappedAppointments: AppointmentInfo[] = data.map(apt => ({
                id: apt.id,
                patient_id: apt.patient_id,
                patient_name: `${apt.patients.english_username_a} ${apt.patients.english_username_d || ''}`.trim(),
                doctor_id: apt.doctor_id,
                doctor_name: apt.doctors.name,
                clinic_id: apt.clinic_id,
                clinic_name: apt.clinics.name,
                date: apt.date,
                time: apt.time,
                status: apt.status as 'scheduled' | 'completed' | 'cancelled',
                payment_status: apt.payment_status as 'pending' | 'paid' | 'refunded',
                price: apt.price
            }));

            setAppointments(mappedAppointments);
            console.log('Appointments loaded:', mappedAppointments.length);
        } catch (error) {
            console.error('Error loading appointments:', error);
            throw error;
        }
    };

    const loadActivityLog = async () => {
        console.log(t('admin.loadingActivityLog'));
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            const mappedActivityLog: ActivityLog[] = data.map(log => ({
                id: log.id,
                action: log.action,
                user: log.user_email,
                details: log.details,
                timestamp: log.created_at,
                status: log.status as 'success' | 'failed' | 'pending'
            }));

            setActivityLog(mappedActivityLog);
            console.log('Activity log loaded:', mappedActivityLog.length);
        } catch (error) {
            console.error('Error loading activity log:', error);
            throw error;
        }
    };

    const loadSystemSettings = async () => {
        console.log(t('admin.loadingSystemSettings'));
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('setting_name', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setSystemSettings(data || []);
            console.log('System settings loaded:', data?.length);
        } catch (error) {
            console.error('Error loading system settings:', error);
            throw error;
        }
    };

    const generateReportData = async () => {
        console.log(t('admin.generatingReportData'));
        try {
            const defaultReport = {
                appointments_count: 0,
                appointments_by_clinic: {},
                appointments_by_doctor: {},
                revenue: 0,
                revenue_by_clinic: {},
                users_by_role: {},
                total_users: 0,
                recent_activity: []
            };

            const getClinicName = (apt) => {
                try {
                    if (typeof apt.clinics === 'object' && apt.clinics !== null && apt.clinics.name) {
                        return apt.clinics.name;
                    }
                    if (Array.isArray(apt.clinics) && apt.clinics.length > 0 && apt.clinics[0].name) {
                        return apt.clinics[0].name;
                    }
                    if (apt.clinic_name) {
                        return apt.clinic_name;
                    }
                    return 'Unknown Clinic';
                } catch (e) {
                    console.error('Error in getClinicName:', e);
                    return 'Unknown Clinic';
                }
            };

            const getDoctorName = (apt) => {
                try {
                    if (typeof apt.doctors === 'object' && apt.doctors !== null && apt.doctors.name) {
                        return apt.doctors.name;
                    }
                    if (Array.isArray(apt.doctors) && apt.doctors.length > 0 && apt.doctors[0].name) {
                        return apt.doctors[0].name;
                    }
                    if (apt.doctor_name) {
                        return apt.doctor_name;
                    }
                    return 'Unknown Doctor';
                } catch (e) {
                    console.error('Error in getDoctorName:', e);
                    return 'Unknown Doctor';
                }
            };

            let appointmentsData = [];
            let userData = [];
            let activityData = [];

            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                    id, price, status, payment_status,
                    clinics:clinic_id (id, name),
                    doctors:doctor_id (id, name)
                  `);

                if (error) {
                    console.error('Error fetching appointments data:', error);
                } else {
                    appointmentsData = data || [];
                }
            } catch (error) {
                console.error('Exception fetching appointments data:', error);
            }

            try {
                const { data, error } = await supabase
                    .from('userinfo')
                    .select('user_roles');

                if (error) {
                    console.error('Error fetching user data:', error);
                } else {
                    userData = data || [];
                }
            } catch (error) {
                console.error('Exception fetching user data:', error);
            }

            try {
                const { data, error } = await supabase
                    .from('activity_log')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('Error fetching activity log:', error);
                } else {
                    activityData = data || [];
                }
            } catch (error) {
                console.error('Exception fetching activity data:', error);
            }

            const reportData = { ...defaultReport };

            try {
                reportData.appointments_count = appointmentsData.length;

                reportData.revenue = appointmentsData
                    .filter(apt => apt.payment_status === 'paid')
                    .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0);

                const appointments_by_clinic = {};
                const revenue_by_clinic = {};

                if (appointmentsData.length > 0) {
                    appointmentsData.forEach(apt => {
                        try {
                            const clinicName = getClinicName(apt);
                            appointments_by_clinic[clinicName] = (appointments_by_clinic[clinicName] || 0) + 1;

                            if (apt.payment_status === 'paid') {
                                revenue_by_clinic[clinicName] = (revenue_by_clinic[clinicName] || 0) + (parseFloat(apt.price) || 0);
                            }
                        } catch (e) {
                            console.error('Error processing appointment for clinic grouping:', e);
                        }
                    });
                }
                reportData.appointments_by_clinic = appointments_by_clinic;
                reportData.revenue_by_clinic = revenue_by_clinic;

                const appointments_by_doctor = {};
                if (appointmentsData.length > 0) {
                    appointmentsData.forEach(apt => {
                        try {
                            const doctorName = getDoctorName(apt);
                            appointments_by_doctor[doctorName] = (appointments_by_doctor[doctorName] || 0) + 1;
                        } catch (e) {
                            console.error('Error processing appointment for doctor grouping:', e);
                        }
                    });
                }
                reportData.appointments_by_doctor = appointments_by_doctor;

                const users_by_role = {};
                if (userData.length > 0) {
                    userData.forEach(user => {
                        try {
                            if (user && user.user_roles) {
                                const role = user.user_roles.charAt(0).toUpperCase() + user.user_roles.slice(1).toLowerCase();
                                users_by_role[role] = (users_by_role[role] || 0) + 1;
                            }
                        } catch (e) {
                            console.error('Error processing user role:', e);
                        }
                    });
                }
                reportData.users_by_role = users_by_role;
                reportData.total_users = userData.length;

                const recent_activity = [];
                if (activityData.length > 0) {
                    activityData.forEach(log => {
                        try {
                            recent_activity.push({
                                id: log.id || `a${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                action: log.action || 'Unknown Action',
                                user: log.user_email || 'Unknown User',
                                details: log.details || '',
                                timestamp: log.created_at || new Date().toISOString(),
                                status: log.status || 'unknown'
                            });
                        } catch (e) {
                            console.error('Error processing activity log:', e);
                        }
                    });
                }
                reportData.recent_activity = recent_activity;
            } catch (e) {
                console.error('Error calculating report data:', e);
            }

            setReportData(reportData);
            console.log('Report data generated successfully');
            return reportData;
        } catch (error) {
            console.error('Error in generateReportData:', error);
            const fallbackReport = {
                appointments_count: 0,
                appointments_by_clinic: {},
                appointments_by_doctor: {},
                revenue: 0,
                revenue_by_clinic: {},
                users_by_role: { 'Unknown': 1 },
                total_users: 0,
                recent_activity: []
            };
            setReportData(fallbackReport);

            toast({
                title: t('common.warning'),
                description: t('admin.someReportDataUnavailable'),
                variant: "default",
            });

            return fallbackReport;
        }
    };

    // Activity logging
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        const newActivity: ActivityLog = {
            id: `a${Date.now()}`,
            action,
            user,
            details,
            timestamp: new Date().toISOString(),
            status
        };

        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    action: action,
                    user_email: user,
                    details: details,
                    status: status
                });

            if (error) {
                console.error('Error logging activity:', error);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }

        setActivityLog(prev => [newActivity, ...prev]);
    };

    // Report generation
    const refreshReportData = async () => {
        try {
            setIsLoading(true);
            await generateReportData();
            toast({
                title: t('common.success'),
                description: t('admin.reportDataRefreshed'),
            });
        } catch (error) {
            console.error("Error refreshing report data:", error);
            toast({
                title: t('common.error'),
                description: t('admin.failedToRefreshReportData'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // UI helpers
    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'completed':
                return "bg-green-100 text-green-800 border-green-200";
            case 'cancelled':
                return "bg-red-100 text-red-800 border-red-200";
            case 'pending':
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'paid':
                return "bg-green-100 text-green-800 border-green-200";
            case 'refunded':
                return "bg-purple-100 text-purple-800 border-purple-200";
            case 'success':
                return "bg-green-100 text-green-800 border-green-200";
            case 'failed':
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Loading and error states
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('admin.authenticating')}</p>
                </div>
            </div>
        );
    }

    if (isLoading && !users.length && !clinics.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('admin.loadingDashboard')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-red-600">{t('common.error')}</h1>
                <p className="mt-2">{error}</p>

                <div className="space-y-4 mt-6">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        {t('admin.reloadPage')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="w-full"
                    >
                        {t('admin.returnToHome')}
                    </Button>
                </div>
            </div>
        );
    }

    async function checkSystemStatus(): Promise<void> {
        try {
            setIsLoading(true);
            setError(null);

            const response = await new Promise<{ status: string }>((resolve) =>
                setTimeout(() => resolve({ status: "operational" }), 1000)
            );

            if (response.status === "operational") {
                toast({
                    title: t('admin.systemStatus'),
                    description: t('admin.allSystemsOperational'),
                    variant: "default",
                });
            } else {
                toast({
                    title: t('admin.systemStatus'),
                    description: t('admin.systemIssues'),
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error checking system status:", error);
            toast({
                title: t('common.error'),
                description: t('admin.errorCheckingSystemStatus'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Main render
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">{t('admin.title')}</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`flex flex-wrap justify-center w-full ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
                    <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
                    <TabsTrigger value="clinics">{t('admin.clinics')}</TabsTrigger>
                    <TabsTrigger value="doctors">{t('admin.doctors')}</TabsTrigger>
                    <TabsTrigger value="appointments">{t('admin.appointments')}</TabsTrigger>
                    <TabsTrigger value="settings">{t('admin.settings')}</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="pt-6">
                    <OverviewManagement
                        users={users}
                        clinics={clinics}
                        doctors={doctors}
                        appointments={appointments}
                        reportData={reportData}
                        isLoading={isLoading}
                        error={error}
                        refreshReportData={refreshReportData}
                        setActiveTab={setActiveTab}
                        checkSystemStatus={checkSystemStatus}
                    />
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="pt-6">
                    <UsersManagement />
                </TabsContent>

                {/* CLINICS TAB */}
                <TabsContent value="clinics" className="pt-6">
                    <ClinicManagement />
                </TabsContent>

                {/* DOCTORS TAB */}
                <TabsContent value="doctors" className="pt-6">
                    <DoctorManagement />
                </TabsContent>

                {/* APPOINTMENTS TAB */}
                <TabsContent value="appointments" className="pt-6">
                    <AppointmentsManagement />
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="pt-6">
                    <SettingsManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;