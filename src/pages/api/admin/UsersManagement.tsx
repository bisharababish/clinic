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
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from '@supabase/supabase-js';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAdminState } from "../../../hooks/useAdminState";

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

    // ✅ Use centralized state instead of local state
    const {
        users,
        isLoading,
        loadUsers,
    } = useAdminState();

    // ✅ Local UI state (component-specific)
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
    const [showEditPassword, setShowEditPassword] = useState(false);

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

    // Helper: Regex for English and Arabic letters only (no numbers)
    const englishNameRegex = /^[A-Za-z\s'-]+$/;
    const arabicNameRegex = /^[\u0600-\u06FF\s'-]+$/;

    // User form handlers
    const handleUserInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Handle English name fields - only English letters
        if (name.startsWith('english_username')) {
            if (value === '' || englishNameRegex.test(value)) {
                setUserFormData(prev => ({ ...prev, [name]: value }));
            } else {
                toast({
                    title: t('usersManagement.englishNameErrorTitle'),
                    description: t('usersManagement.englishNameErrorDesc'),
                    variant: 'destructive',
                });
            }
            return;
        }

        // Handle Arabic name fields - only Arabic letters
        if (name.startsWith('arabic_username')) {
            if (value === '' || arabicNameRegex.test(value)) {
                setUserFormData(prev => ({ ...prev, [name]: value }));
            } else {
                toast({
                    title: t('usersManagement.arabicNameErrorTitle'),
                    description: t('usersManagement.arabicNameErrorDesc'),
                    variant: 'destructive',
                });
            }
            return;
        }

        if (name === 'id_number') {
            // Remove all non-digit characters and limit to 9 digits
            const digitsOnly = value.replace(/\D/g, '');
            const limitedDigits = digitsOnly.slice(0, 9);
            setUserFormData(prev => ({ ...prev, [name]: limitedDigits }));
            return;
        }

        if (name === 'user_phonenumber') {
            // Remove all non-digit characters except +
            let sanitized = value.replace(/[^\d+]/g, '');

            // If it doesn't start with +, add +97
            if (!sanitized.startsWith('+')) {
                sanitized = '+97' + sanitized;
            }

            // If it starts with + but not +97, reset to +97
            if (sanitized.startsWith('+') && !sanitized.startsWith('+97')) {
                sanitized = '+97';
            }

            // Handle the case where user is building the prefix
            if (sanitized.length <= 4) {
                // Allow +, +9, +97
                if (sanitized === '+' || sanitized === '+9' || sanitized === '+97') {
                    setUserFormData(prev => ({ ...prev, [name]: sanitized }));
                    return;
                }
            }

            // When we have 4+ characters, validate the country code
            if (sanitized.length >= 4) {
                // Must start with +970 or +972
                if (!sanitized.startsWith('+970') && !sanitized.startsWith('+972')) {
                    // If user typed +97X where X is not 0 or 2, reset to +97
                    sanitized = '+97';
                } else {
                    // Valid prefix, limit total length to 13 characters (+970/2 + 9 digits)
                    sanitized = sanitized.slice(0, 13);
                }
            }

            setUserFormData(prev => ({ ...prev, [name]: sanitized }));
            return;
        }

        // Handle password field - add validation for strong password
        if (name === 'user_password') {
            setUserFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        // Other fields
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
        const userToDelete = users.find(u => u.userid === userid);
        if (!userToDelete) {
            toast({
                title: t('common.error'),
                description: t('usersManagement.userNotFound'),
                variant: "destructive",
            });
            return;
        }

        const userName = isRTL
            ? `${userToDelete.arabic_username_a || userToDelete.english_username_a} ${userToDelete.arabic_username_d || userToDelete.english_username_d || ''}`
            : `${userToDelete.english_username_a} ${userToDelete.english_username_d || ''}`;

        let confirmed = false;

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

        if (!userToDelete) return;

        try {
            console.log("Starting deletion process for user ID:", userid);

            if (userToDelete.user_roles.toLowerCase() === 'patient') {
                const { error: appointmentsDeleteError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('patient_id', userid);

                if (appointmentsDeleteError) {
                    console.warn("Error deleting patient appointments:", appointmentsDeleteError);
                } else {
                    console.log("Successfully deleted patient appointments");
                }
            } else if (userToDelete.user_roles.toLowerCase() === 'doctor') {
                const { error: appointmentsDeleteError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('doctor_id', userToDelete.user_id);

                if (appointmentsDeleteError) {
                    console.warn("Error deleting doctor appointments:", appointmentsDeleteError);
                } else {
                    console.log("Successfully deleted doctor appointments");
                }
            }

            const { data: rpcData, error: rpcError } = await supabase.rpc('delete_user_by_admin', {
                user_id_to_delete: userid
            });

            if (rpcError) {
                console.warn("RPC function failed, trying direct deletion", rpcError);

                const { error } = await supabase
                    .from('userinfo')
                    .delete()
                    .eq('userid', userid);

                if (error) {
                    console.error("Direct deletion also failed", error);
                    throw new Error(error.message);
                }
            }

          

            toast({
                title: t('common.success'),
                description: t('usersManagement.userDeletedSuccessfully'),
            });

            const activityMessage = `User ${userToDelete.english_username_a} ${userToDelete.english_username_d || ''} (ID: ${userid}) was deleted`;
            logActivity(t('usersManagement.userDeleted'), "admin", activityMessage, "success");

        } catch (error) {
            console.error("Error deleting user:", error);

            let errorMessage = t('usersManagement.failedToDeleteUser');

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

        } 
    };
    // Password validation function
    const validatePassword = (password: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
    };

    const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // ✅ All validation code exactly the same
        if (userFormMode === "create") {
            if (!userFormData.english_username_a.trim() || !userFormData.english_username_d.trim()) {
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.firstLastNameRequired'),
                    variant: "destructive",
                });
                return;
            }

            const englishFields = [userFormData.english_username_a, userFormData.english_username_b, userFormData.english_username_c, userFormData.english_username_d];
            for (const field of englishFields) {
                if (field && !englishNameRegex.test(field)) {
                    toast({
                        title: t('common.error'),
                        description: t('usersManagement.englishLettersOnly'),
                        variant: "destructive",
                    });
                    return;
                }
            }

            const arabicFields = [userFormData.arabic_username_a, userFormData.arabic_username_b, userFormData.arabic_username_c, userFormData.arabic_username_d];
            for (const field of arabicFields) {
                if (field && !arabicNameRegex.test(field)) {
                    toast({
                        title: t('common.error'),
                        description: t('usersManagement.arabicLettersOnly'),
                        variant: "destructive",
                    });
                    return;
                }
            }

            if (userFormData.id_number && userFormData.id_number.length !== 9) {
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.idNumberMustBe9Digits'),
                    variant: "destructive",
                });
                return;
            }

            if (userFormData.user_phonenumber && !/^\+97[02]\d{8,9}$/.test(userFormData.user_phonenumber)) {
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.phoneInvalidDesc'),
                    variant: "destructive",
                });
                return;
            }

            if (userFormData.user_password && !validatePassword(userFormData.user_password)) {
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.strongPasswordRequired'),
                    variant: "destructive",
                });
                return;
            }
        }

        if (userFormMode === "create") {
            try {
                console.log("Creating new user with data:", userFormData);

                const capitalizedRole = capitalizeRole(userFormData.user_roles);

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
                    } else {
                        console.log("Auth user created successfully:", authData);
                    }
                } catch (authError) {
                    console.error("Auth error:", authError);
                }

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
                        user_roles: capitalizedRole,
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

                // ✅ Let real-time subscription handle the update automatically

                toast({
                    title: t('common.success'),
                    description: t('usersManagement.userCreatedSuccessfully'),
                });

                logActivity(
                    t('usersManagement.userCreated'),
                    "admin",
                    `New user ${userFormData.user_email} (${capitalizedRole}) created`,
                    "success"
                );

                resetUserForm();

            } catch (error) {
                console.error("Unexpected error creating user:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
                    variant: "destructive",
                });
            } 
        } else if (userFormMode === "edit" && selectedUser !== null) {
            try {

                const capitalizedRole = capitalizeRole(userFormData.user_roles);

                const updateData = {
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
                    user_roles: capitalizedRole,
                    updated_at: new Date().toISOString()
                };

                if (userFormData.user_password) {
                    try {
                        // Check if service role key is available
                        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
                        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

                        if (!serviceRoleKey) {
                            throw new Error('Service role key not found in environment variables');
                        }

                        if (!supabaseUrl) {
                            throw new Error('Supabase URL not found in environment variables');
                        }

                        console.log('Creating service client for password update...');

                        const serviceClient = createClient(
                            supabaseUrl,
                            serviceRoleKey,
                            {
                                auth: {
                                    autoRefreshToken: false,
                                    persistSession: false
                                }
                            }
                        );

                        const { data: existingUsers, error: listError } = await serviceClient.auth.admin.listUsers();

                        if (listError) {
                            throw new Error(`Failed to list users: ${listError.message}`);
                        }
                        // Explicitly type users as Array<{ email?: string; id: string }>
                        const usersList: Array<{ email?: string; id: string }> = existingUsers?.users ?? [];
                        let targetUser = usersList.find(u => u.email && u.email === userFormData.user_email);
                        /*&& u.email*/
                        if (!targetUser) {
                            console.log("User not found in auth, creating auth user...");
                            const { data: newAuthUser, error: createError } = await serviceClient.auth.admin.createUser({
                                email: userFormData.user_email,
                                password: userFormData.user_password,
                                email_confirm: true
                            });

                            if (createError) {
                                throw createError;
                            }
                            targetUser = newAuthUser.user;
                        } else {
                            const { error: updateError } = await serviceClient.auth.admin.updateUserById(
                                targetUser.id,
                                { password: userFormData.user_password }
                            );

                            if (updateError) {
                                throw updateError;
                            }
                        }

                        console.log("Password updated successfully in auth");
                    } catch (error) {
                        console.error("Error updating password:", error);
                        toast({
                            title: t('common.error'),
                            description: "Failed to update password: " + error.message,
                            variant: "destructive",
                        });
                        return;
                    }
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

                // ✅ Let real-time subscription handle the update automatically

                logActivity(
                    t('usersManagement.userUpdated'),
                    "admin",
                    `User ${userFormData.user_email} (ID: ${selectedUser}) was updated`,
                    "success"
                );

                if (userFormData.user_password) {
                    toast({
                        title: t('common.success'),
                        description: t('usersManagement.userUpdatedSuccessfully') +
                            (isRTL ?
                                ' - تم تحديث كلمة المرور بنجاح.' :
                                ' - Password updated successfully.'
                            ),
                    });
                } else {
                    toast({
                        title: t('common.success'),
                        description: t('usersManagement.userUpdatedSuccessfully'),
                    });
                }

                resetUserForm();
            } catch (error) {
                console.error("Unexpected error:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
                    variant: "destructive",
                });
            } 
        }
    };

    // Activity logging function
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
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
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
                    <Skeleton width={180} height={20} className="mx-auto mb-2" />
                    <Skeleton width={120} height={16} className="mx-auto" />
                    <p className="mt-4 text-gray-600">{t('usersManagement.loading') || 'Loading users...'}</p>
                </div>
            </div>
        );
    }

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
                                <Button variant="outline" size="sm" onClick={() => loadUsers()}>
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
                        <CardTitle className={isRTL ? 'text-left' : ''}>
                            {userFormMode === "create" ? t('usersManagement.createNewUser') : t('usersManagement.editUser')}
                        </CardTitle>
                        <CardDescription className={isRTL ? 'text-left' : ''}>
                            {userFormMode === "create"
                                ? t('usersManagement.addNewUserDesc')
                                : t('usersManagement.modifyUserDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[60vh] overflow-y-auto p-4" style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>
                        <form onSubmit={handleUserSubmit} id="userForm" className="space-y-4 h-full" dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: 'fit-content' }}>
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
                                {/* Arabic Names Section - ALWAYS RTL regardless of interface language */}
                                <div className="arabic-names-container" dir="rtl" style={{ direction: 'rtl' }}>
                                    <div className="form-grid">
                                        {/* Row 1: First Name (right) | Second Name (left) in RTL layout */}
                                        <div>
                                            <Label htmlFor="arabic_username_a" className="text-xs" dir="rtl">
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
                                            <Label htmlFor="arabic_username_b" className="text-xs" dir="rtl">
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
                                            <Label htmlFor="arabic_username_d" className="text-xs" dir="rtl">
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
                                    placeholder="123456789"
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
                                    placeholder={isRTL ? "٩٧٠/٩٧٢ + أرقام" : "+970/+972 + digits"} dir={isRTL ? "rtl" : "ltr"}
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
                                    <Label htmlFor="gender_select">{t('auth.gender')}</Label>
                                    <Select
                                        value={userFormData.gender_user}
                                        onValueChange={handleGenderChange}
                                    >
                                        <SelectTrigger id="gender_select" dir={isRTL ? 'rtl' : 'ltr'}>
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
                                <Label htmlFor="role_select">{t('usersManagement.role')}</Label>
                                <Select
                                    value={userFormData.user_roles}
                                    onValueChange={handleUserRoleChange}
                                >
                                    <SelectTrigger id="role_select" dir={isRTL ? 'rtl' : 'ltr'}>
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
                                <div className="relative">
                                    <Input
                                        id="user_password"
                                        name="user_password"
                                        type={showEditPassword ? "text" : "password"}
                                        value={userFormData.user_password}
                                        onChange={handleUserInputChange}
                                        placeholder="••••••••"
                                        required={userFormMode === "create"}
                                        className="pr-10"
                                        dir={isRTL ? "rtl" : "ltr"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    >
                                        {showEditPassword ? (
                                            <EyeOffIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {userFormData.user_password && (
                                    <div className="text-xs text-gray-600">
                                        {isRTL ? "كلمة المرور يجب أن تحتوي على:" : "Password must contain:"}
                                        <ul className="mt-1 space-y-1">
                                            <li className={/[A-Z]/.test(userFormData.user_password) ? 'text-green-600' : 'text-red-600'}>
                                                {isRTL ? "• حرف كبير واحد على الأقل" : "• At least one uppercase letter"}
                                            </li>
                                            <li className={/[a-z]/.test(userFormData.user_password) ? 'text-green-600' : 'text-red-600'}>
                                                {isRTL ? "• حرف صغير واحد على الأقل" : "• At least one lowercase letter"}
                                            </li>
                                            <li className={/\d/.test(userFormData.user_password) ? 'text-green-600' : 'text-red-600'}>
                                                {isRTL ? "• رقم واحد على الأقل" : "• At least one number"}
                                            </li>
                                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(userFormData.user_password) ? 'text-green-600' : 'text-red-600'}>
                                                {isRTL ? "• رمز خاص واحد على الأقل" : "• At least one special character"}
                                            </li>
                                            <li className={userFormData.user_password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                                                {isRTL ? "• 8 أحرف على الأقل" : "• At least 8 characters"}
                                            </li>
                                        </ul>
                                        {userFormMode === "edit" && (
                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                                                <strong>{isRTL ? "ملاحظة:" : "Note:"}</strong> {isRTL ?
                                                    "سيتم تحديث كلمة المرور في قاعدة البيانات وإرسال رابط إعادة تعيين كلمة المرور إلى بريد المستخدم الإلكتروني." :
                                                    "Password will be updated in database and a password reset link will be sent to the user's email."
                                                }
                                            </div>
                                        )}
                                    </div>
                                )}
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
        </div>
    );
};

export default UsersManagement;