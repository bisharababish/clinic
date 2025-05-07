// pages/AdminDashboard.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Users, Activity, Calendar, Shield, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserInfo {
    userid: number;
    user_email: string;
    english_username_a: string;
    user_roles: string;
    created_at?: string;
}

interface UserStats {
    total: number;
    byRole: Record<string, number>;
}

interface ActivityLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    status: string;
}

const AdminDashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({ total: 0, byRole: {} });
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state for creating/editing users
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "patient" as UserRole,
        password: "",
    });

    // Load data on mount
    useEffect(() => {
        const initDashboard = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Starting dashboard init...', { authLoading, user });

                if (!authLoading && user) {
                    console.log('User data:', user);

                    const loadPromises = [
                        loadUsers().catch(err => {
                            console.error('Error loading users:', err);
                            throw err;
                        }),
                        loadUserStats().catch(err => {
                            console.error('Error loading stats:', err);
                            throw err;
                        }),
                        loadActivityLog().catch(err => {
                            console.error('Error loading logs:', err);
                            throw err;
                        })
                    ];

                    await Promise.all(loadPromises);
                    console.log('Dashboard init complete');
                }
            } catch (error) {
                console.error('Dashboard init error:', error);
                setError(error instanceof Error ? error.message : 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        initDashboard();
    }, [authLoading, user]);

    const loadUsers = async () => {
        console.log('Loading users...');
        try {
            const { data, error } = await supabase
                .from('userinfo')
                .select('userid, user_email, english_username_a, user_roles, created_at')
                .order('userid', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Users loaded:', data);
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    };

    const loadUserStats = async () => {
        console.log('Loading stats...');
        try {
            const { data, error } = await supabase
                .from('userinfo')
                .select('user_roles')
                .order('userid', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            const stats: UserStats = {
                total: data?.length || 0,
                byRole: {}
            };

            data?.forEach(user => {
                stats.byRole[user.user_roles] = (stats.byRole[user.user_roles] || 0) + 1;
            });

            console.log('Stats loaded:', stats);
            setUserStats(stats);
        } catch (error) {
            console.error('Error loading user stats:', error);
            throw error;
        }
    };

    const loadActivityLog = async () => {
        console.log('Loading activity log...');
        try {
            // Simulated activity log data
            const mockActivities: ActivityLog[] = [
                { id: '1', action: 'User Login', user: 'admin@clinic.com', timestamp: new Date().toISOString(), status: 'success' },
                { id: '2', action: 'User Created', user: 'admin@clinic.com', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'success' },
                { id: '3', action: 'Failed Login Attempt', user: 'unknown@clinic.com', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'failed' },
            ];
            console.log('Activity log loaded');
            setActivityLog(mockActivities);
        } catch (error) {
            console.error('Error loading activity log:', error);
            throw error;
        }
    };

    const getRoleChartData = () => {
        return Object.entries(userStats.byRole).map(([role, count]) => ({
            role,
            count
        }));
    };

    // ... (rest of the handlers remain the same) ...

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

    if (isLoading) {
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
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">Error</h1>
                <p className="mt-2">{error}</p>
                <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </Button>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="mt-2">Only administrators can access this page.</p>
            </div>
        );
    }
    function handleRoleChange(value: string): void {
        setFormData((prevFormData) => ({
            ...prevFormData,
            role: value as UserRole,
        }));
    }

    async function handleDeleteUser(userid: number): Promise<void> {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from("userinfo")
                .delete()
                .eq("userid", userid);

            if (error) {
                console.error("Error deleting user:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete user. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            setUsers((prevUsers) => prevUsers.filter((user) => user.userid !== userid));
            toast({
                title: "Success",
                description: "User deleted successfully.",
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
    }

    function handleEditUser(userid: number): void {
        const userToEdit = users.find((u) => u.userid === userid);
        if (!userToEdit) {
            toast({
                title: "Error",
                description: "User not found.",
                variant: "destructive",
            });
            return;
        }

        setFormMode("edit");
        setSelectedUser(userid);
        setFormData({
            name: userToEdit.english_username_a,
            email: userToEdit.user_email,
            role: userToEdit.user_roles as UserRole,
            password: "", // Password is not editable for security reasons
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (formMode === "create") {
            try {
                setIsLoading(true);
                const { error } = await supabase
                    .from("userinfo")
                    .insert({
                        english_username_a: formData.name,
                        user_email: formData.email,
                        user_roles: formData.role,
                        password: formData.password, // Assuming password is hashed server-side
                    });

                if (error) {
                    console.error("Error creating user:", error);
                    toast({
                        title: "Error",
                        description: "Failed to create user. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Success",
                    description: "User created successfully.",
                });
                await loadUsers(); // Refresh user list
                setFormData({
                    name: "",
                    email: "",
                    role: "patient",
                    password: "",
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
        } else if (formMode === "edit" && selectedUser !== null) {
            try {
                setIsLoading(true);
                const { error } = await supabase
                    .from("userinfo")
                    .update({
                        english_username_a: formData.name,
                        user_email: formData.email,
                        user_roles: formData.role,
                    })
                    .eq("userid", selectedUser);

                if (error) {
                    console.error("Error updating user:", error);
                    toast({
                        title: "Error",
                        description: "Failed to update user. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Success",
                    description: "User updated successfully.",
                });
                await loadUsers(); // Refresh user list
                setFormMode("create");
                setSelectedUser(null);
                setFormData({
                    name: "",
                    email: "",
                    role: "patient",
                    password: "",
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
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">42</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">15</div>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution by Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getRoleChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="role" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </BarChart>
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
                                    {activityLog.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{log.action}</p>
                                                <p className="text-sm text-gray-500">{log.user}</p>
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
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Accounts</CardTitle>
                                    <CardDescription>Manage all user accounts for the clinic portal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading users...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {users.map((u) => (
                                                <div key={u.userid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                    <div>
                                                        <h3 className="font-medium">{u.english_username_a}</h3>
                                                        <div className="text-sm text-gray-500">{u.user_email}</div>
                                                        <div className="mt-1">
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
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(u.userid)}>
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(u.userid)}
                                                            disabled={u.user_email === user.email}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{formMode === "create" ? "Create New User" : "Edit User"}</CardTitle>
                                    <CardDescription>
                                        {formMode === "create"
                                            ? "Add a new user to the system"
                                            : "Modify existing user details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="user@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={handleRoleChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="patient">Patient</SelectItem>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="secretary">Secretary</SelectItem>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                required={formMode === "create"}
                                            />
                                        </div>

                                        <div className="pt-4 flex space-x-2">
                                            {formMode === "edit" && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setFormMode("create");
                                                        setSelectedUser(null);
                                                        setFormData({
                                                            name: "",
                                                            email: "",
                                                            role: "patient",
                                                            password: "",
                                                        });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                                {isLoading ? "Saving..." : formMode === "create" ? "Create User" : "Update User"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Activity Log</CardTitle>
                            <CardDescription>Detailed log of all system activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activityLog.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            {log.status === 'failed' ?
                                                <AlertTriangle className="h-5 w-5 text-red-500" /> :
                                                <Activity className="h-5 w-5 text-green-500" />
                                            }
                                            <div>
                                                <p className="font-medium">{log.action}</p>
                                                <p className="text-sm text-gray-500">{log.user}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.status.toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Settings</CardTitle>
                                <CardDescription>Configure global system settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment-duration">Default Appointment Duration (minutes)</Label>
                                        <Input
                                            id="appointment-duration"
                                            type="number"
                                            defaultValue="30"
                                            className="max-w-[200px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-advance">Maximum Booking Window (days)</Label>
                                        <Input
                                            id="booking-advance"
                                            type="number"
                                            defaultValue="90"
                                            className="max-w-[200px]"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <Button>Save Settings</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;