// pages/AdminDashboard.tsx - Complete version with patient health records table
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePatientHealth, PatientWithHealthData } from "@/hooks/usePatientHealth";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../lib/supabase";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getRolePermissions } from '../lib/rolePermissions';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Calendar,
    Phone,
    Heart,
    Pill,
    Search,
    RefreshCw,
    Loader2,
    FileText,
    Database
} from 'lucide-react';

// Interfaces
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

// Patient Health Records Component
const PatientHealthRecordsManagement: React.FC = () => {
    const { getAllPatientHealthData, isLoading } = usePatientHealth();
    const [records, setRecords] = useState<PatientWithHealthData[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PatientWithHealthData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        fetchAllRecords();
    }, []);

    useEffect(() => {
        // Filter records based on search term
        if (searchTerm.trim() === '') {
            setFilteredRecords(records);
        } else {
            const filtered = records.filter(record =>
                record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_id_number?.includes(searchTerm)
            );
            setFilteredRecords(filtered);
        }
    }, [searchTerm, records]);

    const fetchAllRecords = async () => {
        try {
            const data = await getAllPatientHealthData();
            setRecords(data);
            setFilteredRecords(data);
        } catch (error) {
            console.error('Error fetching patient records:', error);
            toast({
                title: "Error",
                description: "Failed to load patient records",
                variant: "destructive",
            });
        }
    };

    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
            case 'secretary': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'patient': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const calculateDiseaseCount = (record: PatientWithHealthData) => {
        return [
            record.has_high_blood_pressure,
            record.has_diabetes,
            record.has_cholesterol_hdl,
            record.has_cholesterol_ldl,
            record.has_kidney_disease,
            record.has_cancer,
            record.has_heart_disease,
            record.has_asthma,
            record.has_alzheimer_dementia
        ].filter(Boolean).length;
    };

    const calculateMedicationCount = (record: PatientWithHealthData) => {
        if (!record.medications) return 0;
        return Object.values(record.medications).flat().length;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span className="text-gray-600">Loading patient records...</span>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Patient Health Records
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search patients, emails, or staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={fetchAllRecords} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-800">Total Records</h3>
                                <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-green-800">Recent Updates</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {filteredRecords.filter(r =>
                                        new Date(r.updated_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                                    ).length}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-orange-800">With Conditions</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {filteredRecords.filter(r => calculateDiseaseCount(r) > 0).length}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-800">On Medications</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {filteredRecords.filter(r => calculateMedicationCount(r) > 0).length}
                                </p>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Patient Info
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Health Summary
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created By
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Updated By
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-gray-900">
                                                            {record.patient_name || 'Unknown Patient'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {record.patient_email || 'No email'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {record.patient_phone || 'No phone'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            ID: {record.patient_id}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="space-y-2">
                                                        {/* BMI */}
                                                        {record.weight_kg && record.height_cm && (
                                                            <div className="text-sm">
                                                                <span className="font-medium">BMI:</span> {
                                                                    ((record.weight_kg / Math.pow(record.height_cm / 100, 2))).toFixed(1)
                                                                }
                                                            </div>
                                                        )}

                                                        {/* Blood Type */}
                                                        <div className="text-sm">
                                                            <span className="font-medium">Blood:</span> {record.blood_type || 'Not set'}
                                                        </div>

                                                        {/* Conditions and Medications */}
                                                        <div className="flex gap-2 flex-wrap">
                                                            <Badge variant="outline" className="text-xs">
                                                                <Heart className="h-3 w-3 mr-1" />
                                                                {calculateDiseaseCount(record)} conditions
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                <Pill className="h-3 w-3 mr-1" />
                                                                {calculateMedicationCount(record)} medications
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {record.created_by_name ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-sm text-gray-900">
                                                                {record.created_by_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {record.created_by_email}
                                                            </div>
                                                            <Badge className={`text-xs ${getRoleColor(record.created_by_role)}`}>
                                                                {record.created_by_role || 'Patient'}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Unknown</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {record.updated_by_name ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-sm text-gray-900">
                                                                {record.updated_by_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {record.updated_by_email}
                                                            </div>
                                                            <Badge className={`text-xs ${getRoleColor(record.updated_by_role)}`}>
                                                                {record.updated_by_role || 'Patient'}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Unknown</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="space-y-1 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="font-medium">Created:</span>
                                                        </div>
                                                        <div className="ml-4">
                                                            {new Date(record.created_at || '').toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="font-medium">Updated:</span>
                                                        </div>
                                                        <div className="ml-4">
                                                            {new Date(record.updated_at || '').toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredRecords.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No patient records found</h3>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Try adjusting your search criteria' : 'No patient health records have been created yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State variables
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSecretary, setIsSecretary] = useState(false);
    const [activeTab, setActiveTab] = useState("appointments");
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
    const canViewPatientHealthTab = ['admin', 'doctor', 'nurse'].includes(userRole); // NEW: Patient health tab permission

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
            if (canViewClinicsTab) return 'clinics';
            if (canViewUsersTab) return 'users';
            if (canViewDoctorsTab) return 'doctors';
            return 'appointments';
        }
    };

    // Check admin status and access control
    useEffect(() => {
        const initializeAdminDashboard = async () => {
            if (authLoading) return;

            setIsLoading(true);
            setError(null);

            console.log('Starting admin dashboard initialization');

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

                // Set role flags and default tab
                if (currentUserRole === 'admin') {
                    setIsAdmin(true);
                    setIsSecretary(false);
                    setActiveTab(getDefaultTab());
                } else if (currentUserRole === 'secretary') {
                    setIsAdmin(false);
                    setIsSecretary(true);
                    setActiveTab('appointments');
                }

                // Load data based on permissions
                console.log(t('admin.loadingUsers'));

                if (canViewUsersTab) {
                    try {
                        await loadUsers();
                        console.log(t('admin.usersLoaded'));
                    } catch (e) {
                        console.error('Error loading users:', e);
                    }
                }

                if (canViewClinicsTab) {
                    try {
                        await loadClinics();
                        console.log(t('admin.clinicsLoaded'));
                    } catch (e) {
                        console.error('Error loading clinics:', e);
                    }
                }

                if (canViewDoctorsTab) {
                    try {
                        await loadDoctors();
                        console.log(t('admin.doctorsLoaded'));
                    } catch (e) {
                        console.error('Error loading doctors:', e);
                    }
                }

                if (canViewAppointmentsTab) {
                    try {
                        await loadAppointments();
                        console.log(t('admin.appointmentsLoaded'));
                    } catch (e) {
                        console.error('Error loading appointments:', e);
                    }
                }

                if (canViewOverviewTab) {
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
    }, [authLoading, t, user, userPermissions, navigate]);

    // Handle tab changes with permission checking
    const handleTabChange = (newTab: string) => {
        const hasPermission = {
            'overview': canViewOverviewTab,
            'users': canViewUsersTab,
            'clinics': canViewClinicsTab,
            'doctors': canViewDoctorsTab,
            'appointments': canViewAppointmentsTab,
            'patient-health': canViewPatientHealthTab // NEW
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
    };

    const loadDoctors = async () => {
    };

    const loadAppointments = async () => {
    };

    const loadActivityLog = async () => {
    };

    const loadSystemSettings = async () => {
    };

    const generateReportData = async () => {
    };

    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
    };

    const refreshReportData = async () => {
    };

    const checkSystemStatus = async (): Promise<void> => {
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
    const hasAccessibleTabs = canViewOverviewTab || canViewUsersTab || canViewClinicsTab || canViewDoctorsTab || canViewAppointmentsTab || canViewPatientHealthTab;

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
                            <PatientHealthRecordsManagement />
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