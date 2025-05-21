// pages/api/admin/OverviewManagement.tsx
import React, { useState } from "react";
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
    // State to manage chart type: 'pie' or 'bar'
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

    // Chart colors
    const CHART_COLORS = [
        '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
        '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
    ];

    // Chart data transformations
    const getRoleChartData = () => {
        if (!reportData) return [];
        return Object.entries(reportData.users_by_role).map(([role, count], index) => ({
            role,
            count,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
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
        <>
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-blue-700">Total Users</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{users.length}</div>

                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-green-700">Active Appointments</CardTitle>
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

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-purple-700">Available Clinics</CardTitle>
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

                <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-700">System Status</CardTitle>
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
                                <p className="text-sm text-gray-600">Checking status...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                                <div className="text-sm font-bold text-red-600">System Issue Detected</div>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                                <div className="text-sm font-bold text-green-600">All Systems Operational</div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date().toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-blue-800">User Distribution by Role</CardTitle>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Pie</span>
                                <Switch
                                    checked={chartType === 'bar'}
                                    onCheckedChange={(checked) => setChartType(checked ? 'bar' : 'pie')}
                                />
                                <span className="text-sm text-gray-600">Bar</span>
                                <RefreshCw
                                    className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                                    onClick={refreshReportData}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'pie' ? (
                                    <PieChart>
                                        <Pie
                                            data={getRoleChartData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            innerRadius={40}
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
                                        <XAxis dataKey="role" label={{ value: 'User Role', position: 'insideBottom', offset: -5 }} />
                                        <YAxis label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }} />
                                        <Legend />
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

                        {/* Role Distribution Breakdown */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center p-2 rounded-lg border bg-blue-50">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-800">Patients</p>
                                    <p className="text-sm text-blue-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'patient').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'patient').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-2 rounded-lg border bg-green-50">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                    <Stethoscope className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-800">Doctors</p>
                                    <p className="text-sm text-green-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'doctor').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'doctor').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-2 rounded-lg border bg-purple-50">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-purple-800">Secretary</p>
                                    <p className="text-sm text-purple-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'secretary').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'secretary').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-2 rounded-lg border bg-pink-50">
                                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                                    <Activity className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-pink-800">Nurses</p>
                                    <p className="text-sm text-pink-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'nurse').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'nurse').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-2 rounded-lg border bg-red-50">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-800">Administrators</p>
                                    <p className="text-sm text-red-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'admin' || u.user_roles?.toLowerCase() === 'administrator').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'admin' || u.user_roles?.toLowerCase() === 'administrator').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            {/* Added Lab Role */}
                            <div className="flex items-center p-2 rounded-lg border bg-yellow-50">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                    <Database className="h-5 w-5 text-yellow-600" /> {/* Using Database icon for Lab */}
                                </div>
                                <div>
                                    <p className="font-medium text-yellow-800">Lab</p>
                                    <p className="text-sm text-yellow-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'lab').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'lab').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>

                            {/* Added X Ray Role */}
                            <div className="flex items-center p-2 rounded-lg border bg-teal-50">
                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                    <Layers className="h-5 w-5 text-teal-600" /> {/* Using Layers icon for X Ray */}
                                </div>
                                <div>
                                    <p className="font-medium text-teal-800">X Ray</p>
                                    <p className="text-sm text-teal-600">
                                        {users.filter(u => u.user_roles?.toLowerCase() === 'x ray').length} users
                                        {' '}
                                        ({users.length > 0 ?
                                            Math.round((users.filter(u => u.user_roles?.toLowerCase() === 'x ray').length / users.length) * 100) : 0}%)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Summary */}
            <div className="mt-8">
                <Card className="border-none shadow-md bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-gray-100">Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm">Total Revenue</p>
                                <p className="text-3xl font-bold">₪{reportData?.revenue || 0}</p>
                                <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                                        className="h-2 bg-green-500 rounded-full"
                                        style={{ width: `${Math.min(100, ((reportData?.revenue || 0) / 10000) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm">Appointment Completion Rate</p>
                                <p className="text-3xl font-bold">
                                    {appointments.length ?
                                        `${Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100)}%` :
                                        '0%'}
                                </p>
                                <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                                        className="h-2 bg-blue-500 rounded-full"
                                        style={{
                                            width: appointments.length ?
                                                `${(appointments.filter(a => a.status === 'completed').length / appointments.length) * 100}%` :
                                                '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm">Doctor Utilization</p>
                                <p className="text-3xl font-bold">
                                    {doctors.length ?
                                        `${Math.round((doctors.filter(d => d.isAvailable).length / doctors.length) * 100)}%` :
                                        '0%'}
                                </p>
                                <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                                        className="h-2 bg-purple-500 rounded-full"
                                        style={{
                                            width: doctors.length ?
                                                `${(doctors.filter(d => d.isAvailable).length / doctors.length) * 100}%` :
                                                '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 mb-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
                        onClick={() => setActiveTab("users")}
                    >
                        <UserPlus className="h-6 w-6 mb-1 text-blue-600" />
                        <span>Add User</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-green-50 border-2 hover:border-green-200 transition-all"
                        onClick={() => setActiveTab("appointments")}
                    >
                        <Calendar className="h-6 w-6 mb-1 text-green-600" />
                        <span>View Appointments</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-purple-50 border-2 hover:border-purple-200 transition-all"
                        onClick={() => setActiveTab("clinics")}
                    >
                        <Stethoscope className="h-6 w-6 mb-1 text-purple-600" />
                        <span>Manage Clinics</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center bg-white hover:bg-amber-50 border-2 hover:border-amber-200 transition-all"
                        onClick={refreshReportData}
                    >
                        <BarChart2 className="h-6 w-6 mb-1 text-amber-600" />
                        <span>Refresh Data</span>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default OverviewManagement;