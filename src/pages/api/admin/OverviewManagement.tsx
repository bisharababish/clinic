// pages/api/admin/OverviewManagement.tsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from 'react';

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

interface OverviewManagementProps {
    users: UserInfo[];
    clinics: ClinicInfo[];
    doctors: DoctorInfo[];
    appointments: AppointmentInfo[];
    reportData: ReportData | null;
    isLoading: boolean;
    error: string | null;
    refreshReportData: () => Promise<void>;
    setActiveTab: (tab: string) => void;
    checkSystemStatus: () => Promise<void>;
}

const OverviewManagement: React.FC<OverviewManagementProps> = ({
    users,
    clinics,
    doctors,
    appointments,
    reportData,
    isLoading,
    error,
    refreshReportData,
    setActiveTab,
    checkSystemStatus
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        console.log('URL tab parameter:', tabParam); // Add this for debugging

        if (tabParam) {
            console.log('Setting active tab to:', tabParam); // Add this for debugging
            setActiveTab(tabParam);

            // Clear the URL parameter after setting the tab (optional)
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [setActiveTab]);
    // State to manage chart type: 'pie' or 'bar'
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

    // Chart colors
    const CHART_COLORS = [
        '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
        '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
    ];

    // Chart data transformations with translations
    // Chart data transformations with translations - Updated to include all roles
    const getRoleChartData = () => {
        // Define all possible roles with their colors
        const allRoles = [
            { key: 'patient', name: t('admin.patients'), color: '#3b82f6' }, // Blue (matches current patients card)
            { key: 'doctor', name: t('admin.doctors'), color: '#10b981' }, // Green (matches current doctors card)
            { key: 'secretary', name: t('admin.secretaries'), color: '#8b5cf6' }, // Purple (matches current secretaries card)
            { key: 'nurse', name: t('admin.nurses'), color: '#ec4899' }, // Pink (matches current nurses card)
            { key: 'admin', name: t('admin.administrators'), color: '#ef4444' }, // Red (matches current admin card)
            { key: 'lab', name: t('admin.labTechnicians'), color: '#eab308' }, // Yellow (matches current lab card)
            { key: 'x ray', name: t('admin.xrayTechnicians'), color: '#14b8a6' } // Teal (matches current x-ray card)
        ];


        return allRoles.map(role => {
            let count = 0;
            if (role.key === 'admin') {
                count = users.filter(u =>
                    u.user_roles?.toLowerCase() === 'admin' ||
                    u.user_roles?.toLowerCase() === 'administrator'
                ).length;
            } else {
                count = users.filter(u => u.user_roles?.toLowerCase() === role.key).length;
            }

            return {
                role: role.name,
                count,
                fill: role.color
            };
        });
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


    return (
        <div className={`${isRTL ? 'rtl' : 'ltr'} text-${isRTL ? 'right' : 'left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className={`border-l-4 ${isRTL ? 'border-r-4 border-l-0' : ''} border-l-blue-500 ${isRTL ? 'border-r-blue-500' : ''} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-blue-700">{t('admin.totalUsers')}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{users.length}</div>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${isRTL ? 'border-r-4 border-l-0' : ''} border-l-green-500 ${isRTL ? 'border-r-green-500' : ''} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-green-700">{t('admin.activeAppointments')}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">
                            {appointments.filter(a => a.status === 'scheduled').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${isRTL ? 'border-r-4 border-l-0' : ''} border-l-purple-500 ${isRTL ? 'border-r-purple-500' : ''} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-purple-700">{t('admin.availableClinics')}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">
                            {clinics.filter(c => c.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${isRTL ? 'border-r-4 border-l-0' : ''} border-l-emerald-500 ${isRTL ? 'border-r-emerald-500' : ''} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-700">{t('admin.systemStatus')}</CardTitle>
                        <div
                            className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center cursor-pointer"
                            onClick={() => checkSystemStatus()}
                        >
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center h-6">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-700 mr-2"></div>
                                <p className="text-sm text-gray-600">{t('admin.checkingStatus')}</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                                <div className="text-sm font-bold text-red-600">{t('admin.systemIssueDetected')}</div>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                                <div className="text-sm font-bold text-green-600">{t('admin.allSystemsOperational')}</div>
                            </div>
                        )}
                        <p className={`text-xs text-gray-500 mt-1 ${i18n.language === 'ar' ? 'text-left' : 'text-left'}`}>
                            {t('admin.lastChecked')}: {new Date().toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle section - Separate Chart and Legend Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Chart Card */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-blue-800">{t('admin.userDistributionByRole')}</CardTitle>
                            <div className="flex items-center space-x-2">
                                <div className="flex bg-gray-100 rounded-md p-1">
                                    <button
                                        onClick={() => setChartType('pie')}
                                        className={`px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                    >
                                        {t('admin.pie')}
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                    >
                                        {t('admin.bar')}
                                    </button>
                                </div>
                                <RefreshCw
                                    className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                                    onClick={refreshReportData}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'pie' ? (
                                    <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                                        <Pie
                                            data={getRoleChartData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius + 25;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#374151"
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        fontSize="11"
                                                        fontWeight="500"
                                                    >
                                                        {`${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                            outerRadius={110}
                                            innerRadius={50}
                                            paddingAngle={5}
                                            dataKey="count"
                                            isAnimationActive={true}
                                        >
                                            {getRoleChartData().map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                ) : (
                                    <BarChart data={getRoleChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="role"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            label={{
                                                value: t('admin.numberOfUsers'),
                                                angle: -90,
                                                position: 'outside',
                                                offset: 10,
                                                style: { textAnchor: 'middle' }
                                            }}
                                            tick={{ fontSize: 12 }}
                                            width={60}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [value, t('admin.numberOfUsers')]}
                                            labelFormatter={(label) => label}
                                        />
                                        <Bar dataKey="count" isAnimationActive={true}>
                                            {getRoleChartData().map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                    stroke="#ffffff"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Breakdown Card */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                        <CardTitle className="text-gray-800 text-left">{t('admin.userDistributionByRole')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {(() => {
                                const roleCards = [
                                    // Patients
                                    <div key="patients" className={`flex items-center p-3 rounded-lg border bg-blue-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-3">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-blue-800">{t('admin.patients')}</p>
                                            <p className="text-sm text-blue-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'patient').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'patient').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // Doctors
                                    <div key="doctors" className={`flex items-center p-3 rounded-lg border bg-green-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-3">
                                            <Stethoscope className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-green-800">{t('admin.doctors')}</p>
                                            <p className="text-sm text-green-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'doctor').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'doctor').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // Secretaries
                                    <div key="secretaries" className={`flex items-center p-3 rounded-lg border bg-purple-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mx-3">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-purple-800">{t('admin.secretaries')}</p>
                                            <p className="text-sm text-purple-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'secretary').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'secretary').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // Nurses
                                    <div key="nurses" className={`flex items-center p-3 rounded-lg border bg-pink-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mx-3">
                                            <Activity className="h-5 w-5 text-pink-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-pink-800">{t('admin.nurses')}</p>
                                            <p className="text-sm text-pink-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'nurse').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'nurse').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // Administrators
                                    <div key="administrators" className={`flex items-center p-3 rounded-lg border bg-red-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-3">
                                            <Shield className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-red-800">{t('admin.administrators')}</p>
                                            <p className="text-sm text-red-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'admin' || u.user_roles?.toLowerCase() === 'administrator').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'admin' || u.user_roles?.toLowerCase() === 'administrator').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // Lab Technicians
                                    <div key="lab" className={`flex items-center p-3 rounded-lg border bg-yellow-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mx-3">
                                            <Database className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-yellow-800">{t('admin.labTechnicians')}</p>
                                            <p className="text-sm text-yellow-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'lab').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'lab').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>,

                                    // X-ray Technicians
                                    <div key="xray" className={`flex items-center p-3 rounded-lg border bg-teal-50 hover:shadow-sm transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mx-3">
                                            <Layers className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div className={`flex-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                            <p className="font-medium text-teal-800">{t('admin.xrayTechnicians')}</p>
                                            <p className="text-sm text-teal-600">
                                                {users.filter(u => u.user_roles?.toLowerCase() === 'x ray').length} {t('admin.users')}
                                                <span className="ml-1 text-xs">
                                                    ({users.length > 0 ?
                                                        Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'x ray').length / users.length) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ];

                                // Reverse the array for Arabic (RTL)
                                return roleCards;
                            })()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Clinics and Doctors Section */}

            {/* Quick Actions */}
            <div className={`mt-8 mb-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h2
                    className="text-lg font-semibold mb-4 text-gray-700"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                    {t('admin.quickActions')}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={() => setActiveTab('users')}
                    >
                        <UserPlus className="h-6 w-6 mb-1 text-blue-600" />
                        <span className="text-sm font-medium">{t('admin.addUser')}</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-green-50 border-2 hover:border-green-200 transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={() => setActiveTab('appointments')}
                    >
                        <Calendar className="h-6 w-6 mb-1 text-green-600" />
                        <span className="text-sm font-medium">{t('admin.viewAppointments')}</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-purple-50 border-2 hover:border-purple-200 transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={() => setActiveTab('clinics')}
                    >
                        <Stethoscope className="h-6 w-6 mb-1 text-purple-600" />
                        <span className="text-sm font-medium">{t('admin.manageClinics')}</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-amber-50 border-2 hover:border-amber-200 transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={refreshReportData}
                    >
                        <BarChart2 className="h-6 w-6 mb-1 text-amber-600" />
                        <span className="text-sm font-medium">{t('admin.refreshData')}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OverviewManagement;

