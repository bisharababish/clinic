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
import UserRoleBadge from '../../../components/auth/UserRoleBadge';
import { useTranslation } from 'react-i18next';
import "../../styles/usersmanagement.css"
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
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

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
                (user.arabic_username_a && user.arabic_username_a.includes(searchQuery)) ||
                (user.arabic_username_d && user.arabic_username_d.includes(searchQuery)) ||
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
                    title: t('common.error'),
                    description: t('usersManagement.failedToLoadUsers'),
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
                    (user.arabic_username_a && user.arabic_username_a.includes(searchQuery)) ||
                    (user.arabic_username_d && user.arabic_username_d.includes(searchQuery)) ||
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
                            (newUser.arabic_username_a && newUser.arabic_username_a.includes(searchQuery)) ||
                            (newUser.arabic_username_d && newUser.arabic_username_d.includes(searchQuery)) ||
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
                title: t('common.error'),
                description: t('admin.failedToLoadUsers'),
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
                title: t('common.error'),
                description: t('usersManagement.userNotFound'),
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
                title: t('common.error'),
                description: t('usersManagement.userNotFound'),
                variant: "destructive",
            });
            return;
        }

        // Get user display name based on language
        const userName = isRTL
            ? `${userToDelete.arabic_username_a || userToDelete.english_username_a} ${userToDelete.arabic_username_d || userToDelete.english_username_d || ''}`
            : `${userToDelete.english_username_a} ${userToDelete.english_username_d || ''}`;

        // Custom confirmation toast with proper dismiss handling
        let confirmed = false;
        let toastId: string | undefined;

        const confirmationPromise = new Promise<void>((resolve) => {
            const { dismiss } = toast({
                title: t('usersManagement.confirmDeletion'),
                description: t('usersManagement.deleteConfirmMessage', {
                    name: userName.trim(),
                    email: userToDelete.user_email
                }),
                action: (
                    <div className={`confirmation-actions ${isRTL ? 'rtl' : ''}`}>

                        <button
                            className="confirm-button"
                            onClick={() => {
                                confirmed = true;
                                dismiss?.();
                                resolve();
                            }}
                        >
                            {t('usersManagement.confirm')}
                        </button>
                        <button
                            className="cancel-button"
                            onClick={() => {
                                confirmed = false;
                                dismiss?.();
                                resolve();
                            }}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                ),
                duration: Infinity,
                className: "min-w-[400px]"
            });

        });

        await confirmationPromise;

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
                title: t('common.success'),
                description: t('usersManagement.userDeletedSuccessfully'),
            });

            // Log the activity
            const activityMessage = `User ${userToDelete.english_username_a} ${userToDelete.english_username_d || ''} (ID: ${userid}) was deleted`;
            logActivity(t('usersManagement.userDeleted'), "admin", activityMessage, "success");

        } catch (error) {
            console.error("Error deleting user:", error);

            // More specific error message based on the error
            let errorMessage = t('usersManagement.failedToDeleteUser');

            // Check if error contains message about foreign key constraint
            if (error instanceof Error &&
                error.message.includes("foreign key constraint") &&
                error.message.includes("appointments")) {
                errorMessage = t('usersManagement.cannotDeleteUserWithAppointments');
            }

            toast({
                title: t('common.error'),
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
                        title: t('common.error'),
                        description: userError.message || t('usersManagement.failedToCreateUser'),
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
                    title: t('common.success'),
                    description: t('usersManagement.userCreatedSuccessfully'),
                });

                // Log the activity
                logActivity(
                    t('usersManagement.userCreated'),
                    "admin",
                    `New user ${userFormData.user_email} (${capitalizedRole}) created`,
                    "success"
                );

                // Reset form
                resetUserForm();

            } catch (error) {
                console.error("Unexpected error creating user:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
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
                        title: t('common.error'),
                        description: t('usersManagement.failedToUpdateUser'),
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
                    t('usersManagement.userUpdated'),
                    "admin",
                    `User ${userFormData.user_email} (ID: ${selectedUser}) was updated`,
                    "success"
                );

                toast({
                    title: t('common.success'),
                    description: t('usersManagement.userUpdatedSuccessfully'),
                });

                // Reset form
                resetUserForm();
            } catch (error) {
                console.error("Unexpected error:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
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

    // Helper function to get user display name based on language
    const getUserDisplayName = (user: UserInfo) => {
        if (isRTL) {
            return `${user.arabic_username_a || user.english_username_a} ${user.arabic_username_d || user.english_username_d || ''}`;
        }
        return `${user.english_username_a} ${user.english_username_d || ''}`;
    };

    // Main render
    return (
        <div className={`users-management-container ${isRTL ? 'rtl' : ''}`}>
            <div className="users-list-section">
                <Card>
                    <CardHeader>
                        <div className={`card-header-top ${isRTL ? 'rtl' : ''}`}>
                            <CardTitle>{t('usersManagement.title')}</CardTitle>
                            <div className={`header-actions ${isRTL ? 'rtl' : ''}`}>
                                <div className="search-container">
                                    <Search className={`search-icon ${isRTL ? 'rtl' : 'ltr'}`} />
                                    <Input
                                        placeholder={t('usersManagement.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`search-input ${isRTL ? 'rtl' : ''} w-[250px]`}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={loadUsers}>
                                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('common.refresh')}
                                </Button>
                                <Button size="sm" onClick={() => resetUserForm()}>
                                    <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('usersManagement.addUser')}
                                </Button>
                            </div>
                        </div>
                        <CardDescription
                            className={i18n.language === 'ar' ? 'text-right rtl' : ''}
                            style={i18n.language === 'ar' ? { direction: 'rtl', textAlign: 'right' } : {}}
                        >
                            {t('usersManagement.description')}
                        </CardDescription>
                        <div className={`text-sm text-gray-600 mt-3 pt-3 border-t ${isRTL ? 'text-right' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                            {filteredUsers.length} {filteredUsers.length === 1 ? t('usersManagement.user') : t('usersManagement.users')}
                            {searchQuery && ` (${t('usersManagement.filtered')})`}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">{t('usersManagement.loadingUsers')}</div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUsers.map((u) => (
                                    <div key={u.userid} className={`user-item ${isRTL ? 'rtl' : ''}`}>
                                        <div className={`user-info ${isRTL ? 'rtl' : ''}`}>
                                            <h3 className="font-medium">{getUserDisplayName(u)}</h3>
                                            <div className="text-sm text-gray-500">{u.user_email}</div>
                                            {u.id_number && (
                                                <div className="text-sm text-gray-500">{t('usersManagement.id')}: {u.id_number}</div>
                                            )}
                                            <div className={`user-meta ${isRTL ? 'rtl' : ''}`}>
                                                <UserRoleBadge role={u.user_roles} />
                                                {u.user_phonenumber && (
                                                    <span className="text-xs text-gray-500">
                                                        {t('usersManagement.phone')}: {u.user_phonenumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`user-actions ${isRTL ? 'rtl' : ''}`}>
                                            <Button variant="outline" size="sm" onClick={() => handleEditUser(u.userid)}>
                                                <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                {t('common.edit')}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(u.userid)}
                                            >
                                                <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? t('usersManagement.noUsersFoundSearch') : t('usersManagement.noUsersFound')}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter />
                </Card>
            </div>

            <div className="form-section">
                <Card>
                    <CardHeader>
                        <CardTitle className={isRTL ? 'text-left' : ''}
                        >{userFormMode === "create" ? t('usersManagement.createNewUser') : t('usersManagement.editUser')}</CardTitle>
                        <CardDescription className={isRTL ? 'text-left' : ''}
                        >
                            {userFormMode === "create"
                                ? t('usersManagement.addNewUserDesc')
                                : t('usersManagement.modifyUserDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUserSubmit} id="userForm" className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            <div>
                                <div className="form-grid">
                                    {/* First Row */}
                                    <div>
                                        <Label htmlFor="english_username_a" className="text-xs">
                                            {t('usersManagement.firstName')}
                                        </Label>
                                        <Input
                                            id="english_username_a"
                                            name="english_username_a"
                                            value={userFormData.english_username_a}
                                            onChange={handleUserInputChange}
                                            placeholder={t('usersManagement.firstPlaceholder')}
                                            required
                                            dir="ltr"
                                            className="text-left"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="english_username_b" className="text-xs">
                                            {t('usersManagement.secondName')}
                                        </Label>
                                        <Input
                                            id="english_username_b"
                                            name="english_username_b"
                                            value={userFormData.english_username_b}
                                            onChange={handleUserInputChange}
                                            placeholder={t('usersManagement.secondPlaceholder')}
                                            dir="ltr"
                                            className="text-left"
                                        />
                                    </div>

                                    {/* Second Row */}
                                    <div>
                                        <Label htmlFor="english_username_c" className="text-xs">
                                            {t('usersManagement.thirdName')}
                                        </Label>
                                        <Input
                                            id="english_username_c"
                                            name="english_username_c"
                                            value={userFormData.english_username_c}
                                            onChange={handleUserInputChange}
                                            placeholder={t('usersManagement.thirdPlaceholder')}
                                            dir="ltr"
                                            className="text-left"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="english_username_d" className="text-xs">
                                            {t('usersManagement.lastName')}
                                        </Label>
                                        <Input
                                            id="english_username_d"
                                            name="english_username_d"
                                            value={userFormData.english_username_d}
                                            onChange={handleUserInputChange}
                                            placeholder={t('usersManagement.lastPlaceholder')}
                                            required
                                            dir="ltr"
                                            className="text-left"
                                        />
                                    </div>

                                </div>
                            </div>

                            <div>


                                <div>
                                    {/* Arabic Names Section - ALWAYS RTL regardless of interface language */}
                                    <div className="arabic-names-container" dir="rtl" style={{ direction: 'rtl' }}>
                                        <div className="form-grid">
                                            {/* Row 1: First Name (right) | Second Name (left) in RTL layout */}
                                            <div>
                                                <Label htmlFor="arabic_username_a" className="text-xs " dir="rtl">
                                                    {t('usersManagement.firstNameAr')}
                                                </Label>
                                                <Input
                                                    id="arabic_username_a"
                                                    name="arabic_username_a"
                                                    value={userFormData.arabic_username_a}
                                                    onChange={handleUserInputChange}
                                                    dir="rtl"
                                                    placeholder={t('usersManagement.firstPlaceholderAr')}
                                                    required
                                                    className="text-align-left, direction: rtl"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="arabic_username_b" className="text-xs " dir="rtl">
                                                    {t('usersManagement.secondNameAr')}
                                                </Label>
                                                <Input
                                                    id="arabic_username_b"
                                                    name="arabic_username_b"
                                                    value={userFormData.arabic_username_b}
                                                    onChange={handleUserInputChange}
                                                    dir="rtl"
                                                    placeholder={t('usersManagement.secondPlaceholderAr')}
                                                    required
                                                    className="text-align-left, direction: rtl"
                                                />
                                            </div>

                                            {/* Row 2: Third Name (right) | Fourth Name (left) in RTL layout */}
                                            <div>
                                                <Label htmlFor="arabic_username_c" className="text-xs" dir="rtl">
                                                    {t('usersManagement.thirdNameAr')}
                                                </Label>
                                                <Input
                                                    id="arabic_username_c"
                                                    name="arabic_username_c"
                                                    value={userFormData.arabic_username_c}
                                                    onChange={handleUserInputChange}
                                                    dir="rtl"
                                                    placeholder={t('usersManagement.thirdPlaceholderAr')}
                                                    required
                                                    className="text-align-left, direction: rtl"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="arabic_username_d" className="text-xs " dir="rtl">
                                                    {t('usersManagement.lastNameAr')}
                                                </Label>
                                                <Input
                                                    id="arabic_username_d"
                                                    name="arabic_username_d"
                                                    value={userFormData.arabic_username_d}
                                                    onChange={handleUserInputChange}
                                                    dir="rtl"
                                                    placeholder={t('usersManagement.lastPlaceholderAr')}
                                                    required
                                                    className="text-align-left, direction: rtl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_email">{t('common.email')}</Label>
                                <Input
                                    id="user_email"
                                    name="user_email"
                                    type="email"
                                    value={userFormData.user_email}
                                    onChange={handleUserInputChange}
                                    required
                                    placeholder={t('usersManagement.emailPlaceholder')}
                                    dir="ltr"
                                    className={isRTL ? 'text-left' : ''}

                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_number">{t('auth.idNumber')}</Label>
                                <Input
                                    id="id_number"
                                    name="id_number"
                                    type="text"
                                    value={userFormData.id_number}
                                    onChange={handleUserInputChange}
                                    required
                                    placeholder={t('auth.yourIDNumber')}
                                    dir="ltr"
                                    className={isRTL ? 'text-left' : ''}

                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_phonenumber">{t('usersManagement.phoneNumber')}</Label>
                                <Input
                                    id="user_phonenumber"
                                    name="user_phonenumber"
                                    value={userFormData.user_phonenumber}
                                    onChange={handleUserInputChange}
                                    placeholder={isRTL ? "٩٧٠٠٠٠٠٠٠٠٠+" : "+97000000000"} dir={isRTL ? "rtl" : "ltr"}
                                    className={isRTL ? 'text-left' : ''}

                                />
                            </div>

                            <div className="two-column-grid">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">{t('auth.dateOfBirth')}</Label>
                                    <Input
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        type="date"
                                        value={userFormData.date_of_birth}
                                        onChange={handleUserInputChange}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender_user">{t('auth.gender')}</Label>
                                    <Select
                                        value={userFormData.gender_user}
                                        onValueChange={handleGenderChange}
                                    >
                                        <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                            <SelectValue placeholder={t('usersManagement.selectGender')} />
                                        </SelectTrigger>
                                        <SelectContent
                                            className={isRTL ? 'text-right' : 'text-left'}
                                            style={isRTL ? { direction: 'rtl' } : {}}
                                        >
                                            <SelectItem
                                                value="male"
                                                className={isRTL ? 'text-right justify-start pr-8' : 'text-left'}
                                                style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}
                                            >
                                                {t('auth.male')}
                                            </SelectItem>
                                            <SelectItem
                                                value="female"
                                                className={isRTL ? 'text-right justify-start pr-8' : 'text-left'}
                                                style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}
                                            >
                                                {t('auth.female')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_roles">{t('usersManagement.role')}</Label>
                                <Select
                                    value={userFormData.user_roles}
                                    onValueChange={handleUserRoleChange}
                                >
                                    <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                        <SelectValue placeholder={t('usersManagement.selectRole')} />
                                    </SelectTrigger>
                                    <SelectContent
                                        className={isRTL ? 'text-right' : 'text-left'}
                                        style={isRTL ? { direction: 'rtl' } : {}}
                                    >
                                        <SelectItem value="Patient" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.patient')}
                                        </SelectItem>
                                        <SelectItem value="doctor" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.doctor')}
                                        </SelectItem>
                                        <SelectItem value="Secretary" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.secretary')}
                                        </SelectItem>
                                        <SelectItem value="Nurse" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.nurse')}
                                        </SelectItem>
                                        <SelectItem value="Lab" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.lab')}
                                        </SelectItem>
                                        <SelectItem value="Admin" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.admin')}
                                        </SelectItem>
                                        <SelectItem value="X Ray" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                            {t('roles.xray')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user_password">
                                    {userFormMode === "create" ? t('common.password') : t('usersManagement.newPassword')}
                                </Label>
                                <Input
                                    id="user_password"
                                    name="user_password"
                                    type="password"
                                    value={userFormData.user_password}
                                    onChange={handleUserInputChange}
                                    placeholder="••••••••"
                                    required={userFormMode === "create"}
                                    dir="ltr"
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className={`card-footer ${isRTL ? 'rtl' : ''} ${userFormMode === "create" ? 'create-mode' : ''}`}>
                        {userFormMode === "edit" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetUserForm}
                            >
                                {t('common.cancel')}
                            </Button>
                        )}
                        <Button
                            type="submit"
                            form="userForm"
                            className={userFormMode === "edit" ? "" : "w-full"}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? t('usersManagement.saving')
                                : userFormMode === "create"
                                    ? t('usersManagement.createUser')
                                    : t('usersManagement.updateUser')
                            }
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div >
    );
};

export default UsersManagement;