// pages/api/admin/UsersManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "../../../lib/supabase";
import {
    Trash2,
    Edit,
    UserPlus,
    RefreshCw,
    Search
} from "lucide-react";
import { UserRole } from "../../../hooks/useAuth";
import UserRoleBadge from '../../../components/UserRoleBadge';
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

const UsersManagement = () => {
    const { toast } = useToast();

    // State variables
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Data state
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);

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

    // Load users on mount
    useEffect(() => {
        loadUsers();
    }, []);

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

    // Load users from database
    const loadUsers = async () => {
        console.log('Loading users with forced refresh...');
        try {
            setIsLoading(true);

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
                return;
            }

            console.log(`Users loaded: ${data.length}`);

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
        } finally {
            setIsLoading(false);
        }
    };

    // User form handlers
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
    // Function to properly capitalize role names including multi-word roles
    const capitalizeRole = (role: string): string => {
        // Special handling for X Ray to ensure proper capitalization
        if (role.toLowerCase() === "x ray") {
            return "X Ray";
        }

        // Handle normal single-word roles
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    };
    const handleDeleteUser = async (userid: number) => {
        // Find user to delete
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
                description: `Are you sure you want to delete ${userToDelete.english_username_a} ${userToDelete.english_username_d || ''} (${userToDelete.user_email})? This action cannot be undone.`,
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
            console.log("Starting deletion process for user ID:", userid);

            // FIRST: Check if this user has related appointments
            // We need to handle patients and doctors differently
            if (userToDelete.user_roles.toLowerCase() === 'patient') {
                // If user is a patient, delete any appointments where they are the patient
                const { error: appointmentsDeleteError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('patient_id', userid);

                if (appointmentsDeleteError) {
                    console.warn("Error deleting patient appointments:", appointmentsDeleteError);
                    // Continue with deletion attempt even if this fails
                } else {
                    console.log("Successfully deleted patient appointments");
                }
            } else if (userToDelete.user_roles.toLowerCase() === 'doctor') {
                // If user is a doctor, delete any appointments where they are the doctor
                const { error: appointmentsDeleteError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('doctor_id', userToDelete.user_id); // Using user_id (UUID) for doctor_id

                if (appointmentsDeleteError) {
                    console.warn("Error deleting doctor appointments:", appointmentsDeleteError);
                    // Continue with deletion attempt even if this fails
                } else {
                    console.log("Successfully deleted doctor appointments");
                }
            }

            // Try to call our database function first - this is the most reliable approach
            const { data: rpcData, error: rpcError } = await supabase.rpc('delete_user_by_admin', {
                user_id_to_delete: userid
            });

            // If RPC fails, fall back to direct deletion
            if (rpcError) {
                console.warn("RPC function failed, trying direct deletion", rpcError);

                // Try direct deletion
                const { error } = await supabase
                    .from('userinfo')
                    .delete()
                    .eq('userid', userid);

                if (error) {
                    console.error("Direct deletion also failed", error);
                    throw new Error(error.message);
                }
            }

            // Update the UI
            setUsers(prev => prev.filter(user => user.userid !== userid));
            setFilteredUsers(prev => prev.filter(user => user.userid !== userid));

            toast({
                title: "Success",
                description: "User deleted successfully.",
            });

            // Log the activity
            const activityMessage = `User ${userToDelete.english_username_a} ${userToDelete.english_username_d || ''} (ID: ${userid}) was deleted`;
            logActivity("User Deleted", "admin", activityMessage, "success");

        } catch (error) {
            console.error("Error deleting user:", error);

            // More specific error message based on the error
            let errorMessage = "Failed to delete user from database.";

            // Check if error contains message about foreign key constraint
            if (error instanceof Error &&
                error.message.includes("foreign key constraint") &&
                error.message.includes("appointments")) {
                errorMessage = "Cannot delete user with existing appointments. Please delete their appointments first.";
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });

            // Refresh the user list to ensure UI is in sync with the database
            await loadUsers();

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
                const capitalizedRole = capitalizeRole(userFormData.user_roles);

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
                    "admin",
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
                const capitalizedRole = capitalizeRole(userFormData.user_roles);

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
                    "admin",
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

    // Activity logging function
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        // Create a new activity log entry
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
    };

    // Main render
    return (
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
                                    <div key={u.userid} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="mb-2 sm:mb-0">
                                            <h3 className="font-medium">{u.english_username_a} {u.english_username_d}</h3>
                                            <div className="text-sm text-gray-500">{u.user_email}</div>
                                            {u.id_number && (
                                                <div className="text-sm text-gray-500">ID: {u.id_number}</div>
                                            )}
                                            <div className="mt-1 flex items-center space-x-2">
                                                {/* REPLACE THIS SPAN WITH THE USERROLEBADGE COMPONENT */}
                                                <UserRoleBadge role={u.user_roles} />
                                                {u.user_phonenumber && (
                                                    <span className="text-xs text-gray-500">
                                                        Phone: {u.user_phonenumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditUser(u.userid)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(u.userid)}
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
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <Label htmlFor="english_username_a" className="text-xs">First Name </Label>
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
                                        <Label htmlFor="english_username_b" className="text-xs">Second Name </Label>
                                        <Input
                                            id="english_username_b"
                                            name="english_username_b"
                                            value={userFormData.english_username_b}
                                            onChange={handleUserInputChange}
                                            placeholder="Second"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="english_username_c" className="text-xs">Third Name </Label>
                                        <Input
                                            id="english_username_c"
                                            name="english_username_c"
                                            value={userFormData.english_username_c}
                                            onChange={handleUserInputChange}
                                            placeholder="Third"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="english_username_d" className="text-xs">Last Name </Label>
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
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <Label htmlFor="arabic_username_b" className="text-xs text-right w-full block mb-1">الإسم الثاني </Label>
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
                                        <Label htmlFor="arabic_username_a" className="text-xs text-right w-full block mb-1">الإسم الاول</Label>
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
                                        <Label htmlFor="arabic_username_d" className="text-xs text-right w-full block mb-1">الإسم الرابع</Label>
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
                                    <div>
                                        <Label htmlFor="arabic_username_c" className="text-xs text-right w-full block mb-1">الإسم الثالث</Label>
                                        <Input
                                            id="arabic_username_c"
                                            name="arabic_username_c"
                                            value={userFormData.arabic_username_c}
                                            onChange={handleUserInputChange}
                                            dir="rtl"
                                            placeholder="الثالث"
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user_email">Email</Label>
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
                                <Label htmlFor="id_number">ID Number </Label>
                                <div className="relative">
                                    <Input
                                        id="id_number"
                                        name="id_number"
                                        type="text"
                                        value={userFormData.id_number}
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
                                <Label htmlFor="user_roles">Role </Label>
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
                                        <SelectItem value="Nurse">Nurse</SelectItem>
                                        <SelectItem value="Lab">Lab</SelectItem>                                                                      <SelectItem value="Admin">Administrator</SelectItem>
                                        <SelectItem value="X Ray">X-Ray</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_password">
                                    {userFormMode === "create" ? "Password " : "New Password (leave empty to keep current)"}
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
    );
};

export default UsersManagement;