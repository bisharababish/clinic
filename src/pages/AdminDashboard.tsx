// pages/AdminDashboard.tsx - Updated with imported PatientHealthManagement
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ClinicManagement from "./api/admin/ClinicManagement";
import DoctorManagement from "./api/admin/DoctorManagement";
import UsersManagement from "./api/admin/UsersManagement";
import AppointmentsManagement from "./api/admin/AppointmentsManagement";
import OverviewManagement from "./api/admin/OverviewManagement";
import PatientHealthManagement from "./api/admin/PatientHealthManagement"; // NEW IMPORT
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../lib/supabase";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getRolePermissions } from '../lib/rolePermissions';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Calendar,
    Activity,
    Phone,
    CreditCard,
    Heart,
    Pill,
    Search,
    RefreshCw,
    Users,
    TrendingUp,
    AlertTriangle,
    Loader2,
    FileText,
    Database
} from 'lucide-react';

// Keep all your existing interfaces...
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

// Main AdminDashboard Component
const AdminDashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State variables
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSecretary, setIsSecretary] = useState(false);
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

    // Get user role and permissions
    const userRole = user?.role?.toLowerCase() || '';
    const userPermissions = getRolePermissions(userRole);

    // Define which tabs each role can see
    const canViewOverviewTab = userPermissions.canViewOverview;
    const canViewUsersTab = userPermissions.canViewUsers;
    const canViewClinicsTab = userPermissions.canViewClinics;
    const canViewDoctorsTab = userPermissions.canViewDoctors;
    const canViewAppointmentsTab = userPermissions.canViewAppointments;
    const canViewPatientHealthTab = ['admin', 'doctor', 'nurse'].includes(userRole);
    const canViewDoctorXrayTab = ['admin', 'doctor'].includes(userRole);

    // Get default tab for user role
    const getDefaultTab = () => {
        if (userRole === 'secretary') {
            return 'appointments';
        } else if (userRole === 'admin') {
            return 'overview';
        } else {
            // Fallback: find first accessible tab
            if (canViewAppointmentsTab) return 'appointments';
            if (canViewOverviewTab) return 'overview';
            if (canViewPatientHealthTab) return 'patient-health';
            if (canViewDoctorXrayTab) return 'doctor-xray';
            if (canViewClinicsTab) return 'clinics';
            if (canViewUsersTab) return 'users';
            if (canViewDoctorsTab) return 'doctors';
            return 'overview';
        }
    };

    // Check admin status and access control
    useEffect(() => {
        const initializeAdminDashboard = async () => {
            if (authLoading) return;

            setIsLoading(true);
            setError(null);

            try {
                const currentUserRole = user?.role?.toLowerCase() || '';

                // Check if user has admin dashboard access
                if (!userPermissions.canViewAdmin) {
                    setError(t('admin.accessDenied') || 'Access denied');
                    toast({
                        title: t('common.error'),
                        description: t('admin.accessDenied') || 'Access denied',
                        variant: "destructive",
                    });
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 2000);
                    return;
                }

                // Set role flags
                setIsAdmin(currentUserRole === 'admin');
                setIsSecretary(currentUserRole === 'secretary');

                // Set default tab if not already set
                if (!activeTab) {
                    setActiveTab(getDefaultTab());
                }

                // Load initial data
                await Promise.all([
                    loadUsers(),
                    loadClinics(),
                    loadDoctors(),
                    loadAppointments(),
                    loadActivityLog(),
                    loadSystemSettings(),
                    generateReportData(),
                    checkSystemStatus()
                ]);

            } catch (error) {
                console.error('Error in dashboard initialization:', error);
                setError(t('admin.errorLoadingDashboard'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeAdminDashboard();
    }, [authLoading, user, userPermissions, navigate, t]);

    // Handle tab changes with permission checking
    const handleTabChange = (newTab: string) => {
        const hasPermission = {
            'overview': canViewOverviewTab,
            'users': canViewUsersTab,
            'clinics': canViewClinicsTab,
            'doctors': canViewDoctorsTab,
            'appointments': canViewAppointmentsTab,
            'patient-health': canViewPatientHealthTab
        }[newTab];

        if (hasPermission) {
            setActiveTab(newTab);
        } else {
            const defaultTab = getDefaultTab();
            setActiveTab(defaultTab);
            toast({
                title: t('common.warning'),
                description: t('admin.noPermissionForTab') || 'You do not have permission to access this section',
                variant: "destructive",
            });
        }
    };

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

    // Data loading functions (keeping all the original functions from your existing code)
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

            // Set up real-time subscription
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

    const loadClinics = async () => {
        // Your existing loadClinics implementation
    };

    const loadDoctors = async () => {
        // Your existing loadDoctors implementation
    };

    const loadAppointments = async () => {
        // Your existing loadAppointments implementation
    };

    const loadActivityLog = async () => {
        // Your existing loadActivityLog implementation
    };

    const loadSystemSettings = async () => {
        // Your existing loadSystemSettings implementation
    };

    const generateReportData = async () => {
        // Your existing generateReportData implementation
    };

    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        // Your existing logActivity implementation
    };

    const refreshReportData = async () => {
        // Your existing refreshReportData implementation
    };

    const checkSystemStatus = async (): Promise<void> => {
        // Your existing checkSystemStatus implementation
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

    if (isLoading && !users.length && !clinics.length && !appointments.length) {
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
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full"
                    >
                        {t('admin.returnToHome')}
                    </Button>
                </div>
            </div>
        );
    }

    // Get dashboard title based on user role
    const getDashboardTitle = () => {
        if (isAdmin) {
            return t('admin.title');
        } else if (isSecretary) {
            return t('admin.secretaryDashboard');
        }
        return t('admin.dashboard');
    };

    // Check if any tabs are accessible
    const hasAccessibleTabs = canViewOverviewTab || canViewUsersTab || canViewClinicsTab || canViewDoctorsTab || canViewAppointmentsTab || canViewPatientHealthTab || canViewDoctorXrayTab;

    // Main render
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">{getDashboardTitle()}</h1>

            {!hasAccessibleTabs ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">
                        {t('admin.noAccessibleSections')}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {t('admin.contactAdministrator')}
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline">
                        {t('admin.returnToHome')}
                    </Button>
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className={`flex flex-wrap justify-center w-full ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        {/* Overview tab first */}
                        {canViewOverviewTab && (
                            <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
                        )}
                        {/* Users tab second */}
                        {canViewUsersTab && (
                            <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
                        )}
                        {/* Clinics tab third */}
                        {canViewClinicsTab && (
                            <TabsTrigger value="clinics">{t('admin.clinics')}</TabsTrigger>
                        )}
                        {/* Doctors tab fourth */}
                        {canViewDoctorsTab && (
                            <TabsTrigger value="doctors">{t('admin.doctors')}</TabsTrigger>
                        )}
                        {/* Patient Health tab fifth */}
                        {canViewPatientHealthTab && (
                            <TabsTrigger value="patient-health">{t('admin.patientHealth')}</TabsTrigger>
                        )}
                        {/* DOCTOR X-RAY TAB - ADD THIS */}
                        {canViewDoctorXrayTab && (
                            <TabsContent value="doctor-xray" className="pt-6">
                                <DoctorXRayPage />
                            </TabsContent>
                        )}
                        {/* Appointments tab last */}
                        {canViewAppointmentsTab && (
                            <TabsTrigger value="appointments">{t('admin.appointments')}</TabsTrigger>
                        )}
                    </TabsList>

                    {/* APPOINTMENTS TAB */}
                    {canViewAppointmentsTab && (
                        <TabsContent value="appointments" className="pt-6">
                            <AppointmentsManagement
                                appointments={appointments}
                                setAppointments={setAppointments}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                loadAppointments={loadAppointments}
                                logActivity={logActivity}
                                userEmail={user?.email || 'admin'}
                            />
                        </TabsContent>
                    )}

                    {/* OVERVIEW TAB */}
                    {canViewOverviewTab && (
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
                    )}

                    {/* PATIENT HEALTH TAB - NEW */}
                    {canViewPatientHealthTab && (
                        <TabsContent value="patient-health" className="pt-6">
                            <PatientHealthManagement />
                        </TabsContent>
                    )}

                    {/* USERS TAB */}
                    {canViewUsersTab && (
                        <TabsContent value="users" className="pt-6">
                            <UsersManagement />
                        </TabsContent>
                    )}

                    {/* CLINICS TAB */}
                    {canViewClinicsTab && (
                        <TabsContent value="clinics" className="pt-6">
                            <ClinicManagement />
                        </TabsContent>
                    )}

                    {/* DOCTORS TAB */}
                    {canViewDoctorsTab && (
                        <TabsContent value="doctors" className="pt-6">
                            <DoctorManagement />
                        </TabsContent>
                    )}
                </Tabs>
            )}
        </div>
    );
};

export default AdminDashboard;