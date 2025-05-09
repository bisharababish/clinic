// pages/AdminDashboard.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
    Users,
    Activity,
    Calendar,
    Shield,
    Settings,
    AlertTriangle,
    Stethoscope,
    FileText,
    BarChart2,
    Database,
    Trash2,
    Edit,
    Plus,
    X,
    Layers,
    UserPlus,
    Search,
    RefreshCw,
    Download
} from "lucide-react"; import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Interfaces
interface UserInfo {
    user_id: string; // uuid/text primary key
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
    setting_options?: string[]; // For select type settings
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
    const [timeframe, setTimeframe] = useState("week");

    // Form state for users
    const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [userFormData, setUserFormData] = useState({
        english_username_a: "",
        english_username_b: "",
        english_username_c: "",
        english_username_d: "",
        arabic_username_a: "",
        arabic_username_b: "",
        arabic_username_c: "",
        arabic_username_d: "",
        user_email: "",
        id_number: "",
        user_phonenumber: "",
        date_of_birth: "",
        gender_user: "",
        user_roles: "patient" as UserRole,
        user_password: "",
    });

    // Form state for clinics
    const [clinicFormMode, setClinicFormMode] = useState<"create" | "edit">("create");
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [clinicFormData, setClinicFormData] = useState({
        name: "",
        category: "",
        description: "",
        isActive: true,
    });

    // Form state for doctors
    const [doctorFormMode, setDoctorFormMode] = useState<"create" | "edit">("create");
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [doctorFormData, setDoctorFormData] = useState({
        name: "",
        specialty: "",
        clinic_id: "",
        email: "",
        phone: "",
        isAvailable: true,
        price: 0,
    });

    // Form state for settings
    const [settingsChanged, setSettingsChanged] = useState(false);

    // Chart colors
    const CHART_COLORS = [
        '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
        '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
    ];

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
                console.log('Loading dashboard data...');

                try {
                    await loadUsers();
                    console.log('Users loaded');
                } catch (e) {
                    console.error('Error loading users:', e);
                }

                try {
                    await loadClinics();
                    console.log('Clinics loaded');
                } catch (e) {
                    console.error('Error loading clinics:', e);
                }

                try {
                    await loadDoctors();
                    console.log('Doctors loaded');
                } catch (e) {
                    console.error('Error loading doctors:', e);
                }

                try {
                    await loadAppointments();
                    console.log('Appointments loaded');
                } catch (e) {
                    console.error('Error loading appointments:', e);
                }

                try {
                    await loadActivityLog();
                    console.log('Activity logs loaded');
                } catch (e) {
                    console.error('Error loading activity logs:', e);
                }

                try {
                    await loadSystemSettings();
                    console.log('System settings loaded');
                } catch (e) {
                    console.error('Error loading system settings:', e);
                }

                try {
                    await generateReportData();
                    console.log('Report data generated');
                } catch (e) {
                    console.error('Error generating report data:', e);
                }

                console.log('Dashboard initialization complete');

            } catch (error) {
                console.error('Error in dashboard initialization:', error);
                setError('There was an error loading the dashboard. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAdminDashboard();
    }, [authLoading]);

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

    // Data loading functions
    const loadUsers = async () => {
        console.log('Loading users with forced refresh...');
        try {
            setIsLoading(true);

            // Add cache-busting parameter to avoid any caching issues
            const timestamp = new Date().getTime();

            // Fetch users with retry mechanism
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
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (error) {
                console.error('Supabase error loading users after multiple attempts:', error);
                toast({
                    title: "Error",
                    description: "Failed to load users from database.",
                    variant: "destructive",
                });
                return null;
            }

            console.log(`Users loaded: ${data.length}`);
            if (data.length > 0) {
                console.log('First few user IDs:', data.slice(0, 3).map(u => u.userid));
            }

            // Replace entire state with fresh data
            setUsers(data);

            // Apply search filter if exists
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

                        // Apply search filter for filtered users
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

            // Return cleanup function
            return () => {
                console.log('Cleaning up subscription');
                supabase.removeChannel(subscription);
            };
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                title: "Error",
                description: "Failed to load users list.",
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

        // Also set up a refresh interval to ensure data stays fresh
        const refreshInterval = setInterval(() => {
            console.log('Running scheduled refresh...');
            loadUsers();
        }, 30000); // Refresh every 30 seconds

        // Cleanup function
        return () => {
            // Clean up subscription
            setupSubscription.then(cleanup => {
                if (cleanup) cleanup();
            });

            // Clear interval
            clearInterval(refreshInterval);
        };
    }, []);
    const loadClinics = async () => {
        console.log('Loading clinics...');
        try {
            // Query the actual clinics table
            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Supabase error loading clinics:', error);
                // Don't throw the error, just log it and return
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

            // Transform to match our interface
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
            // Don't throw the error up the chain, handle it here
            toast({
                title: "Warning",
                description: "Error loading clinics. Some dashboard features may be limited.",
                variant: "default",
            });
        }
    };

    const loadDoctors = async () => {
        console.log('Loading doctors...');
        try {
            // Query doctors with their related clinic
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

            // Transform to match our interface
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
        console.log('Loading appointments...');
        try {
            // Query appointments with related tables
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

            // Transform to match our interface
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
        console.log('Loading activity log...');
        try {
            // Query the actual activity_log table
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Transform to match our interface
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
        console.log('Loading system settings...');
        try {
            // Query the actual system_settings table
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
        console.log('Generating report data...');
        try {
            // Create a skeleton report structure with default values
            // This ensures we always have a valid report structure even if some data fails to load
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
                    // If clinics is an object with a name property
                    if (typeof apt.clinics === 'object' && apt.clinics !== null && apt.clinics.name) {
                        return apt.clinics.name;
                    }

                    // If clinics is an array with at least one object with a name
                    if (Array.isArray(apt.clinics) && apt.clinics.length > 0 && apt.clinics[0].name) {
                        return apt.clinics[0].name;
                    }

                    // If the API returns clinic_name directly
                    if (apt.clinic_name) {
                        return apt.clinic_name;
                    }

                    // Fallback
                    return 'Unknown Clinic';
                } catch (e) {
                    console.error('Error in getClinicName:', e);
                    return 'Unknown Clinic';
                }
            };
            const getDoctorName = (apt) => {
                try {
                    // If doctors is an object with a name property
                    if (typeof apt.doctors === 'object' && apt.doctors !== null && apt.doctors.name) {
                        return apt.doctors.name;
                    }

                    // If doctors is an array with at least one object with a name
                    if (Array.isArray(apt.doctors) && apt.doctors.length > 0 && apt.doctors[0].name) {
                        return apt.doctors[0].name;
                    }

                    // If the API returns doctor_name directly
                    if (apt.doctor_name) {
                        return apt.doctor_name;
                    }

                    // Fallback
                    return 'Unknown Doctor';
                } catch (e) {
                    console.error('Error in getDoctorName:', e);
                    return 'Unknown Doctor';
                }
            };

            let appointmentsData = [];
            let userData = [];
            let activityData = [];

            // Get appointments count and revenue - with error handling
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

            // Get user counts by role - with error handling
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

            // Get recent activity - with error handling
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

            // Calculate data with error handling for each calculation step
            const reportData = { ...defaultReport };

            try {
                // Calculate total appointments
                reportData.appointments_count = appointmentsData.length;

                // Calculate revenue
                reportData.revenue = appointmentsData
                    .filter(apt => apt.payment_status === 'paid')
                    .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0);

                // Group by clinic
                const appointments_by_clinic = {};
                const revenue_by_clinic = {};

                if (appointmentsData.length > 0) {
                    appointmentsData.forEach(apt => {
                        try {
                            const clinicName = getClinicName(apt);

                            // Count appointments
                            appointments_by_clinic[clinicName] = (appointments_by_clinic[clinicName] || 0) + 1;

                            // Sum revenue for paid appointments
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

                // Group appointments by doctor
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

                // Process user roles
                const users_by_role = {};
                if (userData.length > 0) {
                    userData.forEach(user => {
                        try {
                            if (user && user.user_roles) {
                                // Capitalize first letter of role
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

                // Process activity data
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
                // We'll still return the partial reportData with whatever was calculated successfully
            }

            // Set state and return even if some parts failed
            setReportData(reportData);
            console.log('Report data generated successfully');
            return reportData;
        } catch (error) {
            console.error('Error in generateReportData:', error);
            // Create a minimal valid report rather than throwing an error
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

            // Show a toast but don't throw - this allows the dashboard to still load
            toast({
                title: "Warning",
                description: "Some report data could not be loaded. Showing partial data.",
                variant: "default",
            });

            return fallbackReport;
        }
    };
    // User CRUD operations
    const handleUserInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserRoleChange = (value: string) => {
        setUserFormData(prev => ({ ...prev, user_roles: value as UserRole }));
    };

    const handleGenderChange = (value: string) => {
        setUserFormData(prev => ({ ...prev, gender_user: value }));
    };
    const resetUserForm = () => {
        setUserFormMode("create");
        setSelectedUser(null);
        setUserFormData({
            english_username_a: "",
            english_username_b: "",
            english_username_c: "",
            english_username_d: "",
            arabic_username_a: "",
            arabic_username_b: "",
            arabic_username_c: "",
            arabic_username_d: "",
            user_email: "",
            id_number: "",
            user_phonenumber: "",
            date_of_birth: "",
            gender_user: "",
            user_roles: "patient",
            user_password: "",
        });
    };

    const handleEditUser = (userid: number) => {
        const userToEdit = users.find((u) => u.userid === userid);
        if (!userToEdit) {
            toast({
                title: "Error",
                description: "User not found.",
                variant: "destructive",
            });
            return;
        }

        setUserFormMode("edit");
        setSelectedUser(userid);
        setUserFormData({
            english_username_a: userToEdit.english_username_a || "",
            english_username_b: userToEdit.english_username_b || "",
            english_username_c: userToEdit.english_username_c || "",
            english_username_d: userToEdit.english_username_d || "",
            arabic_username_a: userToEdit.arabic_username_a || "",
            arabic_username_b: userToEdit.arabic_username_b || "",
            arabic_username_c: userToEdit.arabic_username_c || "",
            arabic_username_d: userToEdit.arabic_username_d || "",
            user_email: userToEdit.user_email || "",
            id_number: userToEdit.id_number || "",
            user_phonenumber: userToEdit.user_phonenumber || "",
            date_of_birth: userToEdit.date_of_birth || "",
            gender_user: userToEdit.gender_user || "",
            user_roles: userToEdit.user_roles.toLowerCase() as UserRole,
            user_password: "", // Password is not loaded for security
        });
    };


    // Frontend: handleDeleteUser function
    const handleDeleteUser = async (userid: number) => {
        const userToDelete = users.find(u => u.userid === userid);
        if (!userToDelete) {
            toast({
                title: "Error",
                description: "User not found.",
                variant: "destructive",
            });
            return;
        }

        // Custom confirmation toast
        let confirmed = false;
        await new Promise((resolve) => {
            toast({
                title: "Confirm Deletion",
                description: "Are you sure you want to delete this user? This action cannot be undone.",
                action: (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ background: '#dc2626', color: 'white', borderRadius: 4, padding: '4px 12px', border: 'none', cursor: 'pointer' }}
                            onClick={() => { confirmed = true; resolve(undefined); }}
                        >
                            Confirm
                        </button>
                        <button
                            style={{ background: '#374151', color: 'white', borderRadius: 4, padding: '4px 12px', border: 'none', cursor: 'pointer' }}
                            onClick={() => { confirmed = false; resolve(undefined); }}
                        >
                            Cancel
                        </button>
                    </div>
                ),
                duration: 10000,
            });
        });
        if (!confirmed) return;

        try {
            setIsLoading(true);

            // Delete user from database using the API route (by user_id)
            const response = await fetch('/api/admin/delete-user-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userToDelete.user_id })
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete user from database';
                try {
                    const text = await response.text();
                    if (text) {
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.error || errorMessage;
                        if (errorData.details) {
                            errorMessage += `: ${errorData.details}`;
                        }
                    }
                } catch (e) {
                    // Ignore JSON parse errors, use default message
                }
                throw new Error(errorMessage);
            }

            // Update UI immediately after successful deletion
            setUsers(prev => prev.filter(user => user.userid !== userid));
            setFilteredUsers(prev => prev.filter(user => user.userid !== userid));

            // Success message
            toast({
                title: "Success",
                description: "User deleted successfully.",
            });

            // Log the activity
            if (logActivity) {
                const activityMessage = `User ID ${userid} was deleted`;
                logActivity("User Deleted", user?.email || "admin", activityMessage, "success");
            }

        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete user",
                variant: "destructive",
            });

            // Refresh the data
            if (loadUsers) await loadUsers();
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (userFormMode === "create") {
            try {
                setIsLoading(true);
                console.log("Creating new user with data:", userFormData);

                // Make sure role has proper capitalization to avoid constraint issues
                const capitalizedRole = userFormData.user_roles.charAt(0).toUpperCase() +
                    userFormData.user_roles.slice(1).toLowerCase();

                // IMPORTANT: Instead of using API routes, we'll use standard signUp
                // and focus on getting the database record created correctly
                try {
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: userFormData.user_email,
                        password: userFormData.user_password,
                        options: {
                            data: {
                                full_name: `${userFormData.english_username_a} ${userFormData.english_username_d || ''}`.trim(),
                                role: capitalizedRole
                            }
                        }
                    });

                    if (authError) {
                        console.error("Auth signup error:", authError);
                        // Continue with user creation in database even if auth fails
                    } else {
                        console.log("Auth user created successfully:", authData);
                    }
                } catch (authError) {
                    console.error("Auth error:", authError);
                    // Continue with user creation in database even if auth fails
                }

                // Create user in database - this part always works
                const timestamp = new Date().toISOString();
                const { data: userData, error: userError } = await supabase
                    .from("userinfo")
                    .insert({
                        english_username_a: userFormData.english_username_a,
                        english_username_b: userFormData.english_username_b || null,
                        english_username_c: userFormData.english_username_c || null,
                        english_username_d: userFormData.english_username_d || null,
                        arabic_username_a: userFormData.arabic_username_a || null,
                        arabic_username_b: userFormData.arabic_username_b || null,
                        arabic_username_c: userFormData.arabic_username_c || null,
                        arabic_username_d: userFormData.arabic_username_d || null,
                        user_email: userFormData.user_email,
                        id_number: userFormData.id_number || null,
                        user_phonenumber: userFormData.user_phonenumber || null,
                        date_of_birth: userFormData.date_of_birth || null,
                        gender_user: userFormData.gender_user || null,
                        user_roles: capitalizedRole, // Use capitalized role
                        user_password: userFormData.user_password,
                        created_at: timestamp,
                        updated_at: timestamp
                    })
                    .select();

                if (userError) {
                    console.error("Error creating user profile:", userError);
                    toast({
                        title: "Error",
                        description: userError.message || "Failed to create user profile. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                console.log("User created successfully:", userData);

                // Add the new user to the state immediately
                if (userData && userData[0]) {
                    setUsers(prev => [userData[0], ...prev]);
                    setFilteredUsers(prev => [userData[0], ...prev]);
                }

                toast({
                    title: "Success",
                    description: "User created successfully. The user will need to confirm their email to log in.",
                });

                // Log the activity
                logActivity(
                    "User Created",
                    user?.email || "admin",
                    `New user ${userFormData.user_email} (${capitalizedRole}) created`,
                    "success"
                );

                // Reset form
                resetUserForm();

            } catch (error) {
                console.error("Unexpected error creating user:", error);
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        } else if (userFormMode === "edit" && selectedUser !== null) {
            try {
                setIsLoading(true);

                // Define proper type for update data
                interface UserUpdateData {
                    english_username_a?: string;
                    english_username_b?: string | null;
                    english_username_c?: string | null;
                    english_username_d?: string | null;
                    arabic_username_a?: string | null;
                    arabic_username_b?: string | null;
                    arabic_username_c?: string | null;
                    arabic_username_d?: string | null;
                    user_email?: string;
                    id_number?: string | null;
                    user_phonenumber?: string | null;
                    date_of_birth?: string | null;
                    gender_user?: string | null;
                    user_roles?: string;
                    user_password?: string;
                    updated_at: string;
                }

                // Make sure role has proper capitalization for edit too
                const capitalizedRole = userFormData.user_roles.charAt(0).toUpperCase() +
                    userFormData.user_roles.slice(1).toLowerCase();

                const updateData: UserUpdateData = {
                    english_username_a: userFormData.english_username_a,
                    english_username_b: userFormData.english_username_b || null,
                    english_username_c: userFormData.english_username_c || null,
                    english_username_d: userFormData.english_username_d || null,
                    arabic_username_a: userFormData.arabic_username_a || null,
                    arabic_username_b: userFormData.arabic_username_b || null,
                    arabic_username_c: userFormData.arabic_username_c || null,
                    arabic_username_d: userFormData.arabic_username_d || null,
                    user_email: userFormData.user_email,
                    id_number: userFormData.id_number || null,
                    user_phonenumber: userFormData.user_phonenumber || null,
                    date_of_birth: userFormData.date_of_birth || null,
                    gender_user: userFormData.gender_user || null,
                    user_roles: capitalizedRole, // Use capitalized role
                    updated_at: new Date().toISOString()
                };

                // If password is provided, update it too
                if (userFormData.user_password) {
                    updateData.user_password = userFormData.user_password;
                }

                const { data, error } = await supabase
                    .from("userinfo")
                    .update(updateData)
                    .eq("userid", selectedUser)
                    .select();

                if (error) {
                    console.error("Error updating user:", error);
                    toast({
                        title: "Error",
                        description: "Failed to update user. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Update the user in state immediately
                if (data && data[0]) {
                    setUsers(prev => prev.map(u => u.userid === selectedUser ? data[0] : u));
                    setFilteredUsers(prev => prev.map(u => u.userid === selectedUser ? data[0] : u));
                }

                // Log the activity
                logActivity(
                    "User Updated",
                    user?.email || "admin",
                    `User ${userFormData.user_email} (ID: ${selectedUser}) was updated`,
                    "success"
                );

                toast({
                    title: "Success",
                    description: "User updated successfully.",
                });

                // Reset form
                resetUserForm();
            } catch (error) {
                console.error("Unexpected error:", error);
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Clinic CRUD operations
    const handleClinicInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setClinicFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClinicActiveChange = (value: boolean) => {
        setClinicFormData(prev => ({ ...prev, isActive: value }));
    };

    const resetClinicForm = () => {
        setClinicFormMode("create");
        setSelectedClinic(null);
        setClinicFormData({
            name: "",
            category: "",
            description: "",
            isActive: true
        });
    };

    const handleEditClinic = (id: string) => {
        const clinicToEdit = clinics.find((c) => c.id === id);
        if (!clinicToEdit) {
            toast({
                title: "Error",
                description: "Clinic not found.",
                variant: "destructive",
            });
            return;
        }

        setClinicFormMode("edit");
        setSelectedClinic(id);
        setClinicFormData({
            name: clinicToEdit.name,
            category: clinicToEdit.category,
            description: clinicToEdit.description || "",
            isActive: clinicToEdit.isActive
        });
    };

    const handleDeleteClinic = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this clinic? This action cannot be undone.")) {
            return;
        }

        try {
            setIsLoading(true);

            // Delete from database
            const { error } = await supabase
                .from('clinics')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting clinic:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete clinic. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            // Log the activity
            await logActivity(
                "Clinic Deleted",
                user?.email || "admin",
                `Clinic ID ${id} was deleted`,
                "success"
            );

            // Update state
            setClinics(prev => prev.filter(clinic => clinic.id !== id));

            toast({
                title: "Success",
                description: "Clinic deleted successfully.",
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleClinicSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            if (clinicFormMode === "create") {
                // Insert into database
                const { data, error } = await supabase
                    .from('clinics')
                    .insert({
                        name: clinicFormData.name,
                        category: clinicFormData.category,
                        description: clinicFormData.description,
                        is_active: clinicFormData.isActive
                    })
                    .select();

                if (error) {
                    console.error("Error creating clinic:", error);
                    toast({
                        title: "Error",
                        description: "Failed to create clinic. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Log the activity
                await logActivity(
                    "Clinic Created",
                    user?.email || "admin",
                    `New clinic ${clinicFormData.name} created`,
                    "success"
                );

                toast({
                    title: "Success",
                    description: "Clinic created successfully.",
                });

                // Refresh clinics list
                await loadClinics();
                resetClinicForm();
            } else if (clinicFormMode === "edit" && selectedClinic) {
                // Update in database
                const { error } = await supabase
                    .from('clinics')
                    .update({
                        name: clinicFormData.name,
                        category: clinicFormData.category,
                        description: clinicFormData.description,
                        is_active: clinicFormData.isActive,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedClinic);

                if (error) {
                    console.error("Error updating clinic:", error);
                    toast({
                        title: "Error",
                        description: "Failed to update clinic. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Log the activity
                await logActivity(
                    "Clinic Updated",
                    user?.email || "admin",
                    `Clinic ${clinicFormData.name} (ID: ${selectedClinic}) was updated`,
                    "success"
                );

                toast({
                    title: "Success",
                    description: "Clinic updated successfully.",
                });

                // Refresh clinics list
                await loadClinics();
                resetClinicForm();
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Doctor CRUD operations
    const handleDoctorInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDoctorFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDoctorClinicChange = (value: string) => {
        setDoctorFormData(prev => ({ ...prev, clinic_id: value }));
    };

    const handleDoctorAvailableChange = (value: boolean) => {
        setDoctorFormData(prev => ({ ...prev, isAvailable: value }));
    };

    const resetDoctorForm = () => {
        setDoctorFormMode("create");
        setSelectedDoctor(null);
        setDoctorFormData({
            name: "",
            specialty: "",
            clinic_id: "",
            email: "",
            phone: "",
            isAvailable: true,
            price: 0
        });
    };

    const handleEditDoctor = (id: string) => {
        const doctorToEdit = doctors.find((d) => d.id === id);
        if (!doctorToEdit) {
            toast({
                title: "Error",
                description: "Doctor not found.",
                variant: "destructive",
            });
            return;
        }

        setDoctorFormMode("edit");
        setSelectedDoctor(id);
        setDoctorFormData({
            name: doctorToEdit.name,
            specialty: doctorToEdit.specialty,
            clinic_id: doctorToEdit.clinic_id,
            email: doctorToEdit.email,
            phone: doctorToEdit.phone || "",
            isAvailable: doctorToEdit.isAvailable,
            price: doctorToEdit.price
        });
    };

    const handleDeleteDoctor = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
            return;
        }

        try {
            setIsLoading(true);

            // Delete from database
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting doctor:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete doctor. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            // Log the activity
            await logActivity(
                "Doctor Deleted",
                user?.email || "admin",
                `Doctor ID ${id} was deleted`,
                "success"
            );

            // Update state to reflect the deletion
            setDoctors(prev => prev.filter(doctor => doctor.id !== id));

            toast({
                title: "Success",
                description: "Doctor deleted successfully.",
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            if (doctorFormMode === "create") {
                // Insert into database
                const { data, error } = await supabase
                    .from('doctors')
                    .insert({
                        name: doctorFormData.name,
                        specialty: doctorFormData.specialty,
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone,
                        is_available: doctorFormData.isAvailable,
                        price: Number(doctorFormData.price)
                    })
                    .select();

                if (error) {
                    console.error("Error creating doctor:", error);
                    toast({
                        title: "Error",
                        description: "Failed to create doctor. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Log the activity
                await logActivity(
                    "Doctor Created",
                    user?.email || "admin",
                    `New doctor ${doctorFormData.name} created`,
                    "success"
                );

                toast({
                    title: "Success",
                    description: "Doctor created successfully.",
                });

                // Refresh doctors list
                await loadDoctors();
                resetDoctorForm();
            } else if (doctorFormMode === "edit" && selectedDoctor) {
                // Update in database
                const { error } = await supabase
                    .from('doctors')
                    .update({
                        name: doctorFormData.name,
                        specialty: doctorFormData.specialty,
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone,
                        is_available: doctorFormData.isAvailable,
                        price: Number(doctorFormData.price),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedDoctor);

                if (error) {
                    console.error("Error updating doctor:", error);
                    toast({
                        title: "Error",
                        description: "Failed to update doctor. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Log the activity
                await logActivity(
                    "Doctor Updated",
                    user?.email || "admin",
                    `Doctor ${doctorFormData.name} (ID: ${selectedDoctor}) was updated`,
                    "success"
                );

                toast({
                    title: "Success",
                    description: "Doctor updated successfully.",
                });

                // Refresh doctors list
                await loadDoctors();
                resetDoctorForm();
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    // Appointment management
    const handleUpdateAppointmentStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
        try {
            setIsLoading(true);

            // Update in database
            const { error } = await supabase
                .from('appointments')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating appointment status:", error);
                toast({
                    title: "Error",
                    description: "Failed to update appointment status.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status } : apt
            ));

            // Log the activity
            await logActivity(
                "Appointment Status Updated",
                user?.email || "admin",
                `Appointment ID ${id} status changed to ${status}`,
                "success"
            );

            toast({
                title: "Success",
                description: `Appointment status updated to ${status}.`,
            });
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast({
                title: "Error",
                description: "Failed to update appointment status.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'refunded') => {
        try {
            setIsLoading(true);

            // Update in database
            const { error } = await supabase
                .from('appointments')
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating payment status:", error);
                toast({
                    title: "Error",
                    description: "Failed to update payment status.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, payment_status: status } : apt
            ));

            // Log the activity
            await logActivity(
                "Payment Status Updated",
                user?.email || "admin",
                `Appointment ID ${id} payment status changed to ${status}`,
                "success"
            );

            toast({
                title: "Success",
                description: `Payment status updated to ${status}.`,
            });
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast({
                title: "Error",
                description: "Failed to update payment status.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Settings management
    const handleSettingChange = (name: string, value: string) => {
        setSystemSettings(prev => prev.map(setting =>
            setting.setting_name === name ? { ...setting, setting_value: value } : setting
        ));
        setSettingsChanged(true);
    };

    const handleSaveSettings = async () => {
        try {
            setIsLoading(true);

            // Prepare updates
            const updates = systemSettings.map(setting => ({
                setting_name: setting.setting_name,
                setting_value: setting.setting_value,
                updated_at: new Date().toISOString()
            }));

            // Update in database using upsert
            const { error } = await supabase
                .from('system_settings')
                .upsert(updates);

            if (error) {
                console.error("Error saving settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to save settings.",
                    variant: "destructive",
                });
                return;
            }

            // Log the activity
            await logActivity(
                "System Settings Updated",
                user?.email || "admin",
                "System settings were updated",
                "success"
            );

            toast({
                title: "Success",
                description: "Settings saved successfully.",
            });

            setSettingsChanged(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Activity logging
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        // Create a new activity log entry in memory
        const newActivity: ActivityLog = {
            id: `a${Date.now()}`,
            action,
            user,
            details,
            timestamp: new Date().toISOString(),
            status
        };

        // Insert into the database
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

        // Update state
        setActivityLog(prev => [newActivity, ...prev]);
    };
    // Add this function to the AdminDashboard component

    // Report generation
    const refreshReportData = async () => {
        try {
            setIsLoading(true);
            await generateReportData();
            toast({
                title: "Success",
                description: "Report data refreshed.",
            });
        } catch (error) {
            console.error("Error refreshing report data:", error);
            toast({
                title: "Error",
                description: "Failed to refresh report data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const exportReportData = () => {
        if (!reportData) return;

        // Create a CSV or JSON file with report data
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

        const exportFileDefaultName = `clinic-report-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast({
            title: "Success",
            description: "Report data exported.",
        });
    };

    // Chart data transformations
    const getRoleChartData = () => {
        if (!reportData) return [];
        return Object.entries(reportData.users_by_role).map(([role, count], index) => ({
            role,
            count,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    };
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);

            // Load all data
            await loadUsers();
            await loadClinics();
            await loadDoctors();
            await loadAppointments();
            await loadActivityLog();
            await loadSystemSettings();
            await generateReportData();

        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const getClinicAppointmentsChartData = () => {
        if (!reportData) return [];
        return Object.entries(reportData.appointments_by_clinic).map(([clinic, count], index) => ({
            clinic,
            count,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    };

    const getRevenueChartData = () => {
        if (!reportData) return [];
        return Object.entries(reportData.revenue_by_clinic).map(([clinic, amount], index) => ({
            clinic,
            amount,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
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
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (isLoading && !users.length && !clinics.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-red-600">Error</h1>
                <p className="mt-2">{error}</p>

                <div className="space-y-4 mt-6">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        Reload Page
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="w-full"
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }
    // Main render
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-7 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="clinics">Clinics</TabsTrigger>
                    <TabsTrigger value="doctors">Doctors</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {appointments.filter(a => a.status === 'scheduled').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available Clinics</CardTitle>
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {clinics.filter(c => c.isActive).length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold text-green-600">All Systems OK</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution by Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getRoleChartData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {getRoleChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activityLog.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{log.action}</p>
                                                <p className="text-sm text-gray-500">{log.user}</p>
                                                {log.details && (
                                                    <p className="text-xs text-gray-500">{log.details}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.status}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-center">
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab("reports")}>
                                        View All Activity
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointments by Clinic</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getClinicAppointmentsChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="clinic" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" name="Appointments" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue by Clinic</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getRevenueChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="clinic" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                            <Legend />
                                            <Bar dataKey="amount" name="Revenue" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-2/3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>User Management</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search users..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 w-[250px]"
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" onClick={loadUsers}>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh
                                            </Button>
                                            <Button size="sm" onClick={() => resetUserForm()}>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add User
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Manage all user accounts for the clinic portal
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading users...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredUsers.map((u) => (
                                                <div key={u.userid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                    <div>
                                                        <h3 className="font-medium">{u.english_username_a} {u.english_username_d}</h3>
                                                        <div className="text-sm text-gray-500">{u.user_email}</div>
                                                        {u.id_number && (
                                                            <div className="text-sm text-gray-500">ID: {u.id_number}</div>
                                                        )}
                                                        <div className="mt-1 flex items-center space-x-2">
                                                            <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${u.user_roles.toLowerCase() === "admin"
                                                                ? "bg-red-100 text-red-800"
                                                                : u.user_roles.toLowerCase() === "doctor"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : u.user_roles.toLowerCase() === "secretary"
                                                                        ? "bg-purple-100 text-purple-800"
                                                                        : "bg-green-100 text-green-800"
                                                                }`}>
                                                                {u.user_roles}
                                                            </span>
                                                            {u.user_phonenumber && (
                                                                <span className="text-xs text-gray-500">
                                                                    Phone: {u.user_phonenumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(u.userid)}>
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(u.userid)}
                                                            disabled={u.user_email === user?.email}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {filteredUsers.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    {searchQuery ? "No users found matching your search." : "No users found."}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    <div className="text-sm text-gray-500">
                                        {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                                        {searchQuery && ' (filtered)'}
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{userFormMode === "create" ? "Create New User" : "Edit User"}</CardTitle>
                                    <CardDescription>
                                        {userFormMode === "create"
                                            ? "Add a new user to the system"
                                            : "Modify existing user details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUserSubmit} id="userForm" className="space-y-4">
                                        <div>
                                            <Label className="text-base font-medium">Full Name (English)</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div>
                                                    <Label htmlFor="english_username_a" className="text-xs">First Name *</Label>
                                                    <Input
                                                        id="english_username_a"
                                                        name="english_username_a"
                                                        value={userFormData.english_username_a}
                                                        onChange={handleUserInputChange}
                                                        placeholder="First"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="english_username_b" className="text-xs">Second Name</Label>
                                                    <Input
                                                        id="english_username_b"
                                                        name="english_username_b"
                                                        value={userFormData.english_username_b}
                                                        onChange={handleUserInputChange}
                                                        placeholder="Second"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="english_username_c" className="text-xs">Third Name</Label>
                                                    <Input
                                                        id="english_username_c"
                                                        name="english_username_c"
                                                        value={userFormData.english_username_c}
                                                        onChange={handleUserInputChange}
                                                        placeholder="Third"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="english_username_d" className="text-xs">Last Name *</Label>
                                                    <Input
                                                        id="english_username_d"
                                                        name="english_username_d"
                                                        value={userFormData.english_username_d}
                                                        onChange={handleUserInputChange}
                                                        placeholder="Last"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-medium">Full Name (Arabic)</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div>
                                                    <Label htmlFor="arabic_username_a" className="text-xs">First Name *</Label>
                                                    <Input
                                                        id="arabic_username_a"
                                                        name="arabic_username_a"
                                                        value={userFormData.arabic_username_a}
                                                        onChange={handleUserInputChange}
                                                        dir="rtl"
                                                        placeholder="الأول"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="arabic_username_b" className="text-xs">Second Name</Label>
                                                    <Input
                                                        id="arabic_username_b"
                                                        name="arabic_username_b"
                                                        value={userFormData.arabic_username_b}
                                                        onChange={handleUserInputChange}
                                                        dir="rtl"
                                                        placeholder="الثاني"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="arabic_username_c" className="text-xs">Third Name</Label>
                                                    <Input
                                                        id="arabic_username_c"
                                                        name="arabic_username_c"
                                                        value={userFormData.arabic_username_c}
                                                        onChange={handleUserInputChange}
                                                        dir="rtl"
                                                        placeholder="الثالث"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="arabic_username_d" className="text-xs">Last Name *</Label>
                                                    <Input
                                                        id="arabic_username_d"
                                                        name="arabic_username_d"
                                                        value={userFormData.arabic_username_d}
                                                        onChange={handleUserInputChange}
                                                        dir="rtl"
                                                        placeholder="الأخير"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user_email">Email *</Label>
                                            <Input
                                                id="user_email"
                                                name="user_email"
                                                type="email"
                                                value={userFormData.user_email}
                                                onChange={handleUserInputChange}
                                                required
                                                placeholder="user@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="id_number">ID Number *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="id_number"
                                                    name="id_number"
                                                    type="text"
                                                    value={userFormData.id_number} // Change from formData to userFormData
                                                    onChange={handleUserInputChange}
                                                    className="pl-10"
                                                    required
                                                    placeholder="Your ID Number"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="user_phonenumber">Phone Number</Label>
                                            <Input
                                                id="user_phonenumber"
                                                name="user_phonenumber"
                                                value={userFormData.user_phonenumber}
                                                onChange={handleUserInputChange}
                                                placeholder="e.g. +1234567890"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                                <Input
                                                    id="date_of_birth"
                                                    name="date_of_birth"
                                                    type="date"
                                                    value={userFormData.date_of_birth}
                                                    onChange={handleUserInputChange}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gender_user">Gender</Label>
                                                <Select
                                                    value={userFormData.gender_user}
                                                    onValueChange={handleGenderChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="user_roles">Role *</Label>
                                            <Select
                                                value={userFormData.user_roles}
                                                onValueChange={handleUserRoleChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Patient">Patient</SelectItem>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="Secretary">Secretary</SelectItem>
                                                    <SelectItem value="Admin">Administrator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="user_password">
                                                {userFormMode === "create" ? "Password *" : "New Password (leave empty to keep current)"}
                                            </Label>
                                            <Input
                                                id="user_password"
                                                name="user_password"
                                                type="password"
                                                value={userFormData.user_password}
                                                onChange={handleUserInputChange}
                                                placeholder="••••••••"
                                                required={userFormMode === "create"}
                                            />
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    {userFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetUserForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="userForm"
                                        className={userFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : userFormMode === "create"
                                                ? "Create User"
                                                : "Update User"
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* CLINICS TAB */}
                <TabsContent value="clinics" className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-2/3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Clinics Management</CardTitle>
                                        <Button onClick={resetClinicForm}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Clinic
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Manage clinic departments and specialties
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {clinics.map((clinic) => (
                                            <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <h3 className="font-medium">{clinic.name}</h3>
                                                    <div className="text-sm text-gray-500 capitalize">{clinic.category}</div>
                                                    {clinic.description && (
                                                        <div className="text-sm text-gray-500 mt-1">{clinic.description}</div>
                                                    )}
                                                    <div className="mt-1">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${clinic.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {clinic.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClinic(clinic.id)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClinic(clinic.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {clinics.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                No clinics found. Add a new clinic to get started.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{clinicFormMode === "create" ? "Create New Clinic" : "Edit Clinic"}</CardTitle>
                                    <CardDescription>
                                        {clinicFormMode === "create"
                                            ? "Add a new clinic department"
                                            : "Modify existing clinic details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleClinicSubmit} id="clinicForm" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Clinic Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={clinicFormData.name}
                                                onChange={handleClinicInputChange}
                                                placeholder="e.g. Cardiology Center"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Input
                                                id="category"
                                                name="category"
                                                value={clinicFormData.category}
                                                onChange={handleClinicInputChange}
                                                placeholder="e.g. cardiology"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={clinicFormData.description}
                                                onChange={handleClinicInputChange}
                                                placeholder="Describe this clinic's services and specialties"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="isActive">Active Status</Label>
                                                <Switch
                                                    id="isActive"
                                                    checked={clinicFormData.isActive}
                                                    onCheckedChange={handleClinicActiveChange}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {clinicFormData.isActive
                                                    ? "This clinic is visible and accepting appointments"
                                                    : "This clinic is hidden and not accepting appointments"}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    {clinicFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetClinicForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="clinicForm"
                                        className={clinicFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : clinicFormMode === "create"
                                                ? "Create Clinic"
                                                : "Update Clinic"
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* DOCTORS TAB */}
                <TabsContent value="doctors" className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-2/3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Doctors Management</CardTitle>
                                        <Button onClick={resetDoctorForm}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Doctor
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Manage doctor profiles and assignments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {doctors.map((doctor) => (
                                            <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <h3 className="font-medium">{doctor.name}</h3>
                                                    <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {clinics.find(c => c.id === doctor.clinic_id)?.name || 'Unknown Clinic'}
                                                    </div>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${doctor.isAvailable
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {doctor.isAvailable ? "Available" : "Unavailable"}
                                                        </span>
                                                        <span className="text-sm font-medium">${doctor.price}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditDoctor(doctor.id)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteDoctor(doctor.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {doctors.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                No doctors found. Add a new doctor to get started.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{doctorFormMode === "create" ? "Create New Doctor" : "Edit Doctor"}</CardTitle>
                                    <CardDescription>
                                        {doctorFormMode === "create"
                                            ? "Add a new doctor profile"
                                            : "Modify existing doctor details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleDoctorSubmit} id="doctorForm" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Doctor Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={doctorFormData.name}
                                                onChange={handleDoctorInputChange}
                                                placeholder="Dr. Full Name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="specialty">Specialty *</Label>
                                            <Input
                                                id="specialty"
                                                name="specialty"
                                                value={doctorFormData.specialty}
                                                onChange={handleDoctorInputChange}
                                                placeholder="e.g. Cardiologist"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="clinic_id">Clinic *</Label>
                                            <Select
                                                value={doctorFormData.clinic_id}
                                                onValueChange={handleDoctorClinicChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select clinic" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clinics.map(clinic => (
                                                        <SelectItem key={clinic.id} value={clinic.id}>
                                                            {clinic.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={doctorFormData.email}
                                                onChange={handleDoctorInputChange}
                                                placeholder="doctor@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={doctorFormData.phone}
                                                onChange={handleDoctorInputChange}
                                                placeholder="e.g. +1234567890"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Appointment Price *</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                value={doctorFormData.price.toString()}
                                                onChange={handleDoctorInputChange}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="isAvailable">Availability Status</Label>
                                                <Switch
                                                    id="isAvailable"
                                                    checked={doctorFormData.isAvailable}
                                                    onCheckedChange={handleDoctorAvailableChange}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {doctorFormData.isAvailable
                                                    ? "This doctor is available for appointments"
                                                    : "This doctor is not available for appointments"}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    {doctorFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetDoctorForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="doctorForm"
                                        className={doctorFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : doctorFormMode === "create"
                                                ? "Create Doctor"
                                                : "Update Doctor"
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* APPOINTMENTS TAB */}
                <TabsContent value="appointments" className="pt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Appointments Management</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Appointments</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm" onClick={loadAppointments}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                View and manage all patient appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Clinic</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                            <TableCell>{appointment.doctor_name}</TableCell>
                                            <TableCell>{appointment.clinic_name}</TableCell>
                                            <TableCell>
                                                <div>{new Date(appointment.date).toLocaleDateString()}</div>
                                                <div className="text-sm text-gray-500">{appointment.time}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.payment_status)}`}>
                                                    {appointment.payment_status}
                                                </span>
                                                <div className="text-sm mt-1">${appointment.price}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Manage</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Manage Appointment</DialogTitle>
                                                            <DialogDescription>
                                                                Update appointment status and details
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <h3 className="font-medium">Appointment Status</h3>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button
                                                                        variant={appointment.status === 'scheduled' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'scheduled')}
                                                                    >
                                                                        Scheduled
                                                                    </Button>
                                                                    <Button
                                                                        variant={appointment.status === 'completed' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                                                                    >
                                                                        Completed
                                                                    </Button>
                                                                    <Button
                                                                        variant={appointment.status === 'cancelled' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                                                    >
                                                                        Cancelled
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h3 className="font-medium">Payment Status</h3>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button
                                                                        variant={appointment.payment_status === 'pending' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdatePaymentStatus(appointment.id, 'pending')}
                                                                    >
                                                                        Pending
                                                                    </Button>
                                                                    <Button
                                                                        variant={appointment.payment_status === 'paid' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdatePaymentStatus(appointment.id, 'paid')}
                                                                    >
                                                                        Paid
                                                                    </Button>
                                                                    <Button
                                                                        variant={appointment.payment_status === 'refunded' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleUpdatePaymentStatus(appointment.id, 'refunded')}
                                                                    >
                                                                        Refunded
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h3 className="font-medium">Appointment Details</h3>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <div className="font-medium">Patient:</div>
                                                                    <div>{appointment.patient_name}</div>

                                                                    <div className="font-medium">Doctor:</div>
                                                                    <div>{appointment.doctor_name}</div>

                                                                    <div className="font-medium">Clinic:</div>
                                                                    <div>{appointment.clinic_name}</div>

                                                                    <div className="font-medium">Date:</div>
                                                                    <div>{new Date(appointment.date).toLocaleDateString()}</div>

                                                                    <div className="font-medium">Time:</div>
                                                                    <div>{appointment.time}</div>

                                                                    <div className="font-medium">Price:</div>
                                                                    <div>${appointment.price}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button>Close</Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {appointments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                No appointments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports" className="pt-6">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Analytics Dashboard</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Select value={timeframe} onValueChange={setTimeframe}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Timeframe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="week">Last Week</SelectItem>
                                                <SelectItem value="month">Last Month</SelectItem>
                                                <SelectItem value="quarter">Last Quarter</SelectItem>
                                                <SelectItem value="year">Last Year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="sm" onClick={refreshReportData}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={exportReportData}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Performance metrics and system analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{reportData?.appointments_count || 0}</div>
                                            <p className="text-xs text-muted-foreground">for {timeframe}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">${reportData?.revenue || 0}</div>
                                            <p className="text-xs text-muted-foreground">for {timeframe}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{reportData?.total_users || 0}</div>
                                            <p className="text-xs text-muted-foreground">all time</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{doctors.filter(d => d.isAvailable).length}</div>
                                            <p className="text-xs text-muted-foreground">currently active</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Revenue by Clinic</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={getRevenueChartData()}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="clinic" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                                        <Legend />
                                                        <Bar dataKey="amount" name="Revenue" fill="#82ca9d" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>User Distribution</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getRoleChartData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="count"
                                                        >
                                                            {getRoleChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activity Log</CardTitle>
                                        <CardDescription>
                                            Recent system activity and user actions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Details</TableHead>
                                                    <TableHead>Time</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activityLog.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="font-medium">{log.action}</TableCell>
                                                        <TableCell>{log.user}</TableCell>
                                                        <TableCell>{log.details || "—"}</TableCell>
                                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(log.status)}`}>
                                                                {log.status}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {activityLog.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                            No activity logs found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="pt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>System Settings</CardTitle>
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={!settingsChanged || isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                            <CardDescription>
                                Configure global system settings and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {settingsChanged && (
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertDescription>
                                            You have unsaved changes. Click "Save Changes" to apply them.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {systemSettings.map(setting => (
                                    <div key={setting.setting_name} className="border-b pb-6 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={setting.setting_name} className="text-base font-medium">
                                                {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Label>

                                            {setting.setting_type === 'boolean' ? (
                                                <Switch
                                                    id={setting.setting_name}
                                                    checked={setting.setting_value === 'true'}
                                                    onCheckedChange={(checked) =>
                                                        handleSettingChange(setting.setting_name, checked.toString())
                                                    }
                                                />
                                            ) : setting.setting_type === 'select' ? (
                                                <Select
                                                    value={setting.setting_value}
                                                    onValueChange={(value) =>
                                                        handleSettingChange(setting.setting_name, value)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {setting.setting_options?.map(option => (
                                                            <SelectItem key={option} value={option}>
                                                                {option.replace(/\b\w/g, l => l.toUpperCase())}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id={setting.setting_name}
                                                    type={setting.setting_type === 'number' ? 'number' : 'text'}
                                                    value={setting.setting_value}
                                                    onChange={(e) =>
                                                        handleSettingChange(setting.setting_name, e.target.value)
                                                    }
                                                    className="max-w-[180px]"
                                                />
                                            )}
                                        </div>
                                        {setting.setting_description && (
                                            <p className="text-sm text-gray-500">{setting.setting_description}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <Label className="text-base font-medium">Database Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm">
                                            <Database className="h-4 w-4 mr-2" />
                                            Backup Database
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Layers className="h-4 w-4 mr-2" />
                                            Run Migrations
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Perform maintenance operations on the system database
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;