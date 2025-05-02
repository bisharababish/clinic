// pages/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "../hooks/useAuth";

// Mock data for initial users
const initialUsers = [
    { id: "1", name: "Dr. Sarah Johnson", email: "dr.johnson@clinic.com", role: "doctor" },
    { id: "2", name: "Admin User", email: "admin@clinic.com", role: "admin" },
    { id: "3", name: "John Smith", email: "john@example.com", role: "patient" },
    { id: "4", name: "Secretary Jones", email: "secretary@clinic.com", role: "secretary" },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState(initialUsers);
    const [activeTab, setActiveTab] = useState("users");

    // Form state for creating/editing users
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "patient" as UserRole,
        password: "",
    });

    // Reset form when changing modes
    useEffect(() => {
        if (formMode === "create") {
            setFormData({
                name: "",
                email: "",
                role: "patient",
                password: "",
            });
            setSelectedUser(null);
        }
    }, [formMode]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle role selection
    const handleRoleChange = (role: string) => {
        setFormData((prev) => ({
            ...prev,
            role: role as UserRole,
        }));
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formMode === "create") {
            // Create new user
            const newUser = {
                id: `user-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            setUsers([...users, newUser]);
            toast({
                title: "User Created",
                description: `${formData.name} has been added as a ${formData.role}`,
            });
        } else if (formMode === "edit" && selectedUser) {
            // Update existing user
            const updatedUsers = users.map((user) =>
                user.id === selectedUser
                    ? { ...user, name: formData.name, email: formData.email, role: formData.role }
                    : user
            );

            setUsers(updatedUsers);
            toast({
                title: "User Updated",
                description: `${formData.name}'s information has been updated`,
            });
        }

        // Reset form
        setFormData({
            name: "",
            email: "",
            role: "patient",
            password: "",
        });
        setFormMode("create");
        setSelectedUser(null);
    };

    // Handle edit user
    const handleEditUser = (userId: string) => {
        const userToEdit = users.find((user) => user.id === userId);

        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                role: userToEdit.role as UserRole,
                password: "", // Don't populate password for security
            });
            setSelectedUser(userId);
            setFormMode("edit");
        }
    };

    // Handle delete user
    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find((user) => user.id === userId);

        if (userToDelete) {
            const updatedUsers = users.filter((user) => user.id !== userId);
            setUsers(updatedUsers);

            toast({
                title: "User Deleted",
                description: `${userToDelete.name} has been removed`,
            });
        }
    };

    if (!user || user.role !== "admin") {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="mt-2">Only administrators can access this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="clinics">Clinics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* User list */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Accounts</CardTitle>
                                    <CardDescription>Manage all user accounts for the clinic portal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {users.map((u) => (
                                            <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <h3 className="font-medium">{u.name}</h3>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                    <div className="mt-1">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${u.role === "admin"
                                                                ? "bg-red-100 text-red-800"
                                                                : u.role === "doctor"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : u.role === "secretary"
                                                                        ? "bg-purple-100 text-purple-800"
                                                                        : "bg-green-100 text-green-800"
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditUser(u.id)}>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        disabled={u.id === user.id} // Prevent deleting yourself
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User form */}
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

                                        {formMode === "create" && (
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
                                        )}

                                        <div className="pt-4 flex space-x-2">
                                            {formMode === "edit" && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setFormMode("create");
                                                        setSelectedUser(null);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button type="submit" className="flex-1">
                                                {formMode === "create" ? "Create User" : "Update User"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="clinics" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Management</CardTitle>
                            <CardDescription>Manage clinic information, schedules, and services</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Clinic management features would go here - doctors, schedules, services, etc.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                            <CardDescription>Configure global system settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>System settings would go here - notifications, defaults, etc.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;