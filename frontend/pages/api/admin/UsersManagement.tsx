// pages/api/admin/UsersManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useToast } from "../../../hooks/use-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card";
import { supabase } from "../../../lib/supabase";
import {
    Trash2,
    Edit,
    UserPlus,
    RefreshCw,
    Search,
    Clock
} from "lucide-react";
import { useAuth, UserRole } from "../../../hooks/useAuth";
import UserRoleBadge from '../../../components/auth/UserRoleBadge';
import { useTranslation } from 'react-i18next';
import "../../styles/usersmanagement.css"
import { Skeleton } from "../../../components/ui/skeleton";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAdminState } from "../../../hooks/useAdminState";
import DeletionRequestModal from '../../../components/DeletionRequestModal';
import { createDeletionRequest } from '../../../lib/deletionRequests';
import { hasPermission } from '../../../lib/rolePermissions';
// Add these imports to your existing imports
import { isValidPalestinianID } from '../../../lib/PalID_temp';
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { updatePassword, confirmEmail, createUserWithEmailConfirmed } from '../../../src/lib/api';

// Note: getBackendUrl is kept for delete-user endpoint only
// Password updates now use the updatePassword function from api.ts which handles URL detection
const getBackendUrl = (): string => {
    // Check if we're in production mode
    if (import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production') {
        return 'https://api.bethlehemmedcenter.com';
    }

    // Check hostname to determine environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        console.log('🌐 Detected hostname:', hostname);

        // Use localhost only if actually running on localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname.startsWith('192.168.')) {
            // Backend default port is 10000, but can be overridden with PORT env var
            // Try common development ports
            const backendPort = import.meta.env.VITE_BACKEND_PORT || '10000';
            const backendUrl = `http://localhost:${backendPort}`;
            console.log('🔧 Using local backend URL:', backendUrl);
            return backendUrl;
        }

        // For production domain or any other domain, use production API
        if (hostname.includes('bethlehemmedcenter.com')) {
            return 'https://api.bethlehemmedcenter.com';
        }

        // Default to production URL for safety
        return 'https://api.bethlehemmedcenter.com';
    }

    // Default to production URL for safety
    return 'https://api.bethlehemmedcenter.com';
};

interface UserInfo {
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
    blood_type?: string;
    phone_number?: string;
    address?: string;
    medical_history?: string;
    allergies?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    social_situation?: string;
    unique_patient_id?: string;
    created_at?: string;
    updated_at?: string;
    // Optional fields for auth integration
    user_id?: string; // uuid/text primary key
    id?: string; // auth user UUID from auth.users table
}

const UsersManagement = () => {
    const { toast, dismiss } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    React.useEffect(() => {
        const onLangChange = () => {
            dismiss();
        };
        i18n.on('languageChanged', onLangChange);
        return () => {
            i18n.off('languageChanged', onLangChange);
        };
    }, [i18n, dismiss]);

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
    // Add these state variables after your existing useState declarations
    const [idValidationStatus, setIdValidationStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');

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
        user_roles: "Patient" as UserRole,
        user_password: "",
    });
    // Deletion request state
    const [showDeletionModal, setShowDeletionModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserInfo | null>(null);
    const [isDeletionLoading, setIsDeletionLoading] = useState(false);

    // Get current user info for permissions
    const { user: currentUser } = useAuth();
    const currentUserRole = currentUser?.role?.toLowerCase() || '';
    const canDirectDelete = hasPermission(currentUserRole, 'canApproveUserDeletion');
    const canRequestDeletion = hasPermission(currentUserRole, 'canRequestUserDeletion');
    // Add this near the other permission checks:
    const canCreateUsers = hasPermission(currentUserRole, 'canManageUsers');
    const canEditUsers = hasPermission(currentUserRole, 'canManageUsers');

    // Ensure data is loaded when component mounts
    useEffect(() => {
        console.log('🔄 UsersManagement mounted, ensuring data is loaded...');
        if (users.length === 0 && !isLoading) {
            console.log('📊 No users data, triggering loadUsers...');
            loadUsers(true); // Force refresh
        }
    }, [users.length, isLoading, loadUsers]);

    useEffect(() => {
        if (userFormMode === "edit" && userFormData.id_number && userFormData.id_number.length === 9) {
            const isValid = isValidPalestinianID(userFormData.id_number);
            setIdValidationStatus(isValid ? 'valid' : 'invalid');
        }
    }, [userFormMode, userFormData.id_number]);
    useEffect(() => {
        if (searchQuery.trim() === '') {
            // Filter users based on current user role
            let usersToShow = users;

            // If current user is secretary, only show patients
            if (currentUserRole === 'secretary') {
                usersToShow = users.filter(user =>
                    user.user_roles.toLowerCase() === 'patient'
                );
            }

            setFilteredUsers(usersToShow);
        } else {
            const query = searchQuery.toLowerCase();

            // Get base users to filter (secretary sees only patients)
            let baseUsers = users;
            if (currentUserRole === 'secretary') {
                baseUsers = users.filter(user =>
                    user.user_roles.toLowerCase() === 'patient'
                );
            }

            // Apply search filter to the base users
            const filtered = baseUsers.filter(user =>
                user.user_email.toLowerCase().includes(query) ||
                user.english_username_a.toLowerCase().includes(query) ||
                (user.english_username_d && user.english_username_d.toLowerCase().includes(query)) ||
                (user.arabic_username_a && user.arabic_username_a.includes(searchQuery)) ||
                (user.arabic_username_d && user.arabic_username_d.includes(searchQuery)) ||
                user.user_roles.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users, currentUserRole]); // Add currentUserRole to dependencies

    // Helper: Regex for English and Arabic letters only (no numbers)
    const englishNameRegex = /^[A-Za-z\s'-]+$/;
    const arabicNameRegex = /^[\u0600-\u06FF\s'-]+$/;
    // Add function to handle government verification results

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

            // Reset government verification when ID changes

            // Validate Palestinian ID if we have 9 digits
            if (limitedDigits.length === 9) {
                const isValid = isValidPalestinianID(limitedDigits);
                setIdValidationStatus(isValid ? 'valid' : 'invalid');

                if (!isValid) {
                    toast({
                        title: t('usersManagement.invalidId'),
                        description: t('usersManagement.invalidIdDesc') || 'This ID number is not valid according to Palestinian ID standards',
                        variant: 'destructive',
                    });
                }
            } else {
                setIdValidationStatus('unchecked');
            }
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
            user_roles: "Patient" as UserRole,
            user_password: "",
        });
        setIdValidationStatus('unchecked');

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
            user_roles: capitalizeRole(userToEdit.user_roles) as UserRole,
            user_password: "", // Password is not loaded for security
        });
        setIdValidationStatus('unchecked');

    };

    // Function to properly capitalize role names including multi-word roles
    const capitalizeRole = (role: string): string => {
        const lowerRole = role.toLowerCase();

        // Handle specific role mappings to match database constraints
        switch (lowerRole) {
            case "patient":
                return "Patient";
            case "doctor":
                return "Doctor";
            case "secretary":
                return "Secretary";
            case "nurse":
                return "Nurse";
            case "lab":
                return "Lab";
            case "admin":
                return "Admin";
            case "x ray":
            case "xray":
            case "x-ray":
                return "X Ray";
            case "ultrasound":
                return "Ultrasound";
            case "audiometry":
                return "Audiometry";
            default:
                // Fallback to first letter capitalized
                return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
    };

    // Replace your handleDeleteUser function in UsersManagement.tsx with this:

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

        try {
            console.log("🗑️ Starting COMPLETE user deletion for user ID:", userid);

            // Step 0: Get auth user ID BEFORE deleting from database (so we can delete from auth.users)
            let authUserId: string | null = null;
            const authUserIdFromUser = (userToDelete as UserInfo & { id?: string }).id;

            if (authUserIdFromUser) {
                authUserId = authUserIdFromUser;
                console.log('✅ Auth user ID found in userToDelete:', authUserId);
            } else {
                console.log('🔍 Auth user ID not in userToDelete, fetching from database...');
                const { data: userData, error: fetchError } = await supabase
                    .from('userinfo')
                    .select('id')
                    .eq('userid', userid)
                    .single();

                if (!fetchError && userData && userData.id) {
                    authUserId = userData.id;
                    console.log('✅ Found auth user ID from database:', authUserId);
                } else {
                    console.warn('⚠️ Could not find auth user ID:', fetchError?.message || 'No id field in userinfo');
                }
            }

            // Step 1: Delete from database tables
            console.log("Deleting from database tables...");

            // Try RPC function first, if it doesn't exist, delete directly from tables
            let deletionSuccess = false;
            const { data: deletionResult, error: deletionError } = await supabase.rpc('delete_user_completely', {
                user_id_to_delete: userid
            });

            // Check if RPC call itself failed (network/connection error)
            if (deletionError) {
                console.warn('⚠️ RPC function call failed, trying direct deletion:', deletionError.message);

                // Fallback: Delete directly from userinfo table
                // Note: This will cascade delete related records if foreign keys are set up correctly
                const { error: directDeleteError } = await supabase
                    .from('userinfo')
                    .delete()
                    .eq('userid', userid);

                if (directDeleteError) {
                    console.error('❌ Direct deletion also failed:', directDeleteError);
                    throw new Error(`Database deletion failed: ${directDeleteError.message}`);
                } else {
                    console.log('✅ Direct deletion successful');
                    deletionSuccess = true;
                }
            }
            // Check if RPC function returned but with success: false
            else if (deletionResult && deletionResult.success === false) {
                console.warn('⚠️ RPC function returned failure, trying manual deletion of related records:', deletionResult.error || 'Unknown error');

                // Fallback: Delete related records first, then delete user
                try {
                    // CRITICAL: Delete service_requests where this user is the doctor FIRST
                    // The foreign key has ON DELETE SET NULL but doctor_id is NOT NULL, causing constraint violation
                    // We must delete these BEFORE deleting the user
                    console.log('🔍 Checking for service_requests where user is doctor...');
                    const { data: doctorServiceRequests, error: doctorCheckError } = await supabase
                        .from('service_requests')
                        .select('id')
                        .eq('doctor_id', userid);

                    if (doctorCheckError) {
                        console.warn('⚠️ Failed to check service_requests (doctor):', doctorCheckError.message);
                    } else if (doctorServiceRequests && doctorServiceRequests.length > 0) {
                        console.log(`🔍 Found ${doctorServiceRequests.length} service_requests where user is doctor - deleting...`);
                        // Delete them one by one to ensure they're all deleted
                        for (const sr of doctorServiceRequests) {
                            const { error: deleteError } = await supabase
                                .from('service_requests')
                                .delete()
                                .eq('id', sr.id);
                            if (deleteError) {
                                console.error(`❌ Failed to delete service_request ${sr.id}:`, deleteError);
                            }
                        }
                        console.log(`✅ Deleted ${doctorServiceRequests.length} service_requests where user is doctor`);
                    } else {
                        console.log('✅ No service_requests found where user is doctor');
                    }

                    // Delete service_requests where this user is the patient
                    console.log('🔍 Checking for service_requests where user is patient...');
                    const { data: patientServiceRequests, error: patientCheckError } = await supabase
                        .from('service_requests')
                        .select('id')
                        .eq('patient_id', userid);

                    if (patientCheckError) {
                        console.warn('⚠️ Failed to check service_requests (patient):', patientCheckError.message);
                    } else if (patientServiceRequests && patientServiceRequests.length > 0) {
                        console.log(`🔍 Found ${patientServiceRequests.length} service_requests where user is patient - deleting...`);
                        for (const sr of patientServiceRequests) {
                            const { error: deleteError } = await supabase
                                .from('service_requests')
                                .delete()
                                .eq('id', sr.id);
                            if (deleteError) {
                                console.error(`❌ Failed to delete service_request ${sr.id}:`, deleteError);
                            }
                        }
                        console.log(`✅ Deleted ${patientServiceRequests.length} service_requests where user is patient`);
                    } else {
                        console.log('✅ No service_requests found where user is patient');
                    }

                    // Final verification: Make absolutely sure no service_requests remain
                    const { data: finalVerification, error: verifyError } = await supabase
                        .from('service_requests')
                        .select('id, doctor_id, patient_id')
                        .or(`doctor_id.eq.${userid},patient_id.eq.${userid}`);

                    if (verifyError) {
                        console.warn('⚠️ Failed to verify service_requests deletion:', verifyError.message);
                    } else if (finalVerification && finalVerification.length > 0) {
                        console.error(`❌ CRITICAL: ${finalVerification.length} service_requests still exist!`, finalVerification);
                        throw new Error(`Cannot delete user: ${finalVerification.length} service_requests still reference this user. Please run the SQL fix first (see fix_service_requests_constraint.sql)`);
                    } else {
                        console.log('✅ Verified: All service_requests deleted');
                    }

                    // Delete appointments
                    const { error: appointmentsError } = await supabase
                        .from('appointments')
                        .delete()
                        .eq('patient_id', userid);

                    if (appointmentsError) {
                        console.warn('⚠️ Failed to delete appointments:', appointmentsError.message);
                    } else {
                        console.log('✅ Deleted related appointments');
                    }

                    // Delete clinical_notes where user is patient
                    const { error: clinicalNotesPatientError } = await supabase
                        .from('clinical_notes')
                        .delete()
                        .eq('patient_id', userid);

                    if (clinicalNotesPatientError) {
                        console.warn('⚠️ Failed to delete clinical_notes (patient):', clinicalNotesPatientError.message);
                    } else {
                        console.log('✅ Deleted clinical_notes where user is patient');
                    }

                    // Delete clinical_notes where user is doctor
                    const { error: clinicalNotesDoctorError } = await supabase
                        .from('clinical_notes')
                        .delete()
                        .eq('doctor_id', userid);

                    if (clinicalNotesDoctorError) {
                        console.warn('⚠️ Failed to delete clinical_notes (doctor):', clinicalNotesDoctorError.message);
                    } else {
                        console.log('✅ Deleted clinical_notes where user is doctor');
                    }

                    // Delete lab_results where user is patient
                    const { error: labResultsPatientError } = await supabase
                        .from('lab_results')
                        .delete()
                        .eq('patient_id', userid);

                    if (labResultsPatientError) {
                        console.warn('⚠️ Failed to delete lab_results (patient):', labResultsPatientError.message);
                    } else {
                        console.log('✅ Deleted lab_results where user is patient');
                    }

                    // Delete lab_results where user is creator
                    const { error: labResultsCreatorError } = await supabase
                        .from('lab_results')
                        .delete()
                        .eq('created_by', userid);

                    if (labResultsCreatorError) {
                        console.warn('⚠️ Failed to delete lab_results (creator):', labResultsCreatorError.message);
                    } else {
                        console.log('✅ Deleted lab_results where user is creator');
                    }

                    // Delete other related records
                    const relatedTables = [
                        { table: 'patient_health_info', field: 'patient_id' },
                        { table: 'audiometry_images', field: 'patient_id' },
                        { table: 'ultrasound_images', field: 'patient_id' },
                        { table: 'xray_images', field: 'patient_id' },
                    ];

                    for (const { table, field } of relatedTables) {
                        const { error } = await supabase
                            .from(table)
                            .delete()
                            .eq(field, userid);
                        if (error) {
                            console.warn(`⚠️ Failed to delete from ${table}:`, error.message);
                        } else {
                            console.log(`✅ Deleted related records from ${table}`);
                        }
                    }

                    // Delete notifications by email
                    const { error: notificationsError } = await supabase
                        .from('notifications')
                        .delete()
                        .eq('user_email', userToDelete.user_email);

                    if (notificationsError) {
                        console.warn('⚠️ Failed to delete notifications:', notificationsError.message);
                    } else {
                        console.log('✅ Deleted related notifications');
                    }

                    // Delete activity_log by email
                    const { error: activityLogError } = await supabase
                        .from('activity_log')
                        .delete()
                        .eq('user_email', userToDelete.user_email);

                    if (activityLogError) {
                        console.warn('⚠️ Failed to delete activity_log:', activityLogError.message);
                    } else {
                        console.log('✅ Deleted related activity_log');
                    }

                    // Additional cleanup: Delete any other tables that might reference this user
                    // Delete patient_status_change_logs
                    const { error: statusLogsError } = await supabase
                        .from('patient_status_change_logs')
                        .delete()
                        .eq('patient_id', userid);

                    if (statusLogsError) {
                        console.warn('⚠️ Failed to delete patient_status_change_logs:', statusLogsError.message);
                    } else {
                        console.log('✅ Deleted patient_status_change_logs');
                    }

                    // Delete appointment_change_logs (if exists and references user)
                    try {
                        const { error: appointmentLogsError } = await supabase
                            .from('appointment_change_logs')
                            .delete()
                            .eq('patient_id', userid.toString());

                        if (appointmentLogsError && !appointmentLogsError.message.includes('does not exist')) {
                            console.warn('⚠️ Failed to delete appointment_change_logs:', appointmentLogsError.message);
                        } else {
                            console.log('✅ Deleted appointment_change_logs');
                        }
                    } catch (e) {
                        console.warn('⚠️ appointment_change_logs table may not exist or have different structure');
                    }

                    // Delete deletion_requests for this user
                    const { error: deletionRequestsError } = await supabase
                        .from('deletion_requests')
                        .delete()
                        .eq('user_id', userid);

                    if (deletionRequestsError) {
                        console.warn('⚠️ Failed to delete deletion_requests:', deletionRequestsError.message);
                    } else {
                        console.log('✅ Deleted deletion_requests');
                    }

                    // Final verification: Check for any remaining service_requests one more time
                    // This is critical because doctor_id has ON DELETE SET NULL but is NOT NULL
                    let retryCount = 0;
                    const maxRetries = 3;

                    while (retryCount < maxRetries) {
                        const { data: finalCheck, error: finalCheckError } = await supabase
                            .from('service_requests')
                            .select('id, doctor_id, patient_id')
                            .or(`doctor_id.eq.${userid},patient_id.eq.${userid}`)
                            .limit(100);

                        if (finalCheckError) {
                            console.warn(`⚠️ Error checking service_requests (attempt ${retryCount + 1}):`, finalCheckError.message);
                            break;
                        }

                        if (!finalCheck || finalCheck.length === 0) {
                            console.log('✅ Verified: No service_requests remain that reference this user');
                            break;
                        }

                        console.error(`❌ CRITICAL: Found ${finalCheck.length} service_requests still referencing this user (attempt ${retryCount + 1})!`);
                        console.error('Service requests:', finalCheck);

                        // Delete them individually by ID
                        let deletedCount = 0;
                        for (const sr of finalCheck) {
                            const { error: individualDeleteError } = await supabase
                                .from('service_requests')
                                .delete()
                                .eq('id', sr.id);
                            if (individualDeleteError) {
                                console.error(`❌ Failed to delete service_request ${sr.id}:`, individualDeleteError);
                            } else {
                                deletedCount++;
                            }
                        }
                        console.log(`✅ Deleted ${deletedCount} of ${finalCheck.length} remaining service_requests`);

                        retryCount++;

                        // Wait a bit before retrying
                        if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }

                    // One final check - if still found, throw error
                    const { data: absoluteFinalCheck, error: absoluteFinalCheckError } = await supabase
                        .from('service_requests')
                        .select('id')
                        .or(`doctor_id.eq.${userid},patient_id.eq.${userid}`)
                        .limit(1);

                    if (!absoluteFinalCheckError && absoluteFinalCheck && absoluteFinalCheck.length > 0) {
                        throw new Error(`Cannot delete user: ${absoluteFinalCheck.length} service_requests still reference this user. Please delete them manually first.`);
                    }

                    // Now delete from userinfo table
                    const { error: directDeleteError } = await supabase
                        .from('userinfo')
                        .delete()
                        .eq('userid', userid);

                    if (directDeleteError) {
                        console.error('❌ Direct deletion failed:', directDeleteError);
                        console.error('Error details:', {
                            code: directDeleteError.code,
                            message: directDeleteError.message,
                            details: directDeleteError.details,
                            hint: directDeleteError.hint
                        });
                        throw new Error(`Database deletion failed: ${directDeleteError.message}. This user may have remaining references in other tables.`);
                    } else {
                        console.log('✅ Direct deletion successful (after cleaning related records)');
                        deletionSuccess = true;
                    }
                } catch (cleanupError) {
                    console.error('❌ Error during manual cleanup:', cleanupError);
                    throw new Error(`Database deletion failed: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`);
                }
            }
            // RPC function succeeded
            else if (deletionResult && deletionResult.success === true) {
                console.log('✅ RPC deletion successful:', deletionResult);
                deletionSuccess = true;
            }
            // Unexpected response
            else {
                console.warn('⚠️ Unexpected RPC response, trying direct deletion:', deletionResult);

                // Fallback: Delete directly from userinfo table
                const { error: directDeleteError } = await supabase
                    .from('userinfo')
                    .delete()
                    .eq('userid', userid);

                if (directDeleteError) {
                    console.error('❌ Direct deletion also failed:', directDeleteError);
                    throw new Error(`Database deletion failed: ${directDeleteError.message}`);
                } else {
                    console.log('✅ Direct deletion successful (fallback)');
                    deletionSuccess = true;
                }
            }

            if (!deletionSuccess) {
                throw new Error('Failed to delete user from database');
            }

            // Step 2: Delete auth user via backend (only if user has auth account)
            // Note: authUserId was already fetched in Step 0 (before database deletion)
            let authDeletionSuccess = false;

            console.log('🔍 Full user data for deletion:', userToDelete);
            console.log('🔍 Auth user ID to delete:', authUserId);

            if (authUserId) {
                console.log('🗑️ Attempting to delete auth user...');
                console.log('🔍 User data:', userToDelete);
                console.log('🔍 Auth user ID:', authUserId);

                try {
                    // Get current session for authentication
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                        console.warn('⚠️ No authentication session found for delete request');
                        console.warn('⚠️ Auth user will need to be deleted manually from Supabase Auth dashboard');
                        // Don't return - continue with success message
                    } else {
                        const backendUrl = getBackendUrl();

                        try {
                            // Step 1: Get CSRF token from backend (required for admin endpoints)
                            console.log('🔐 Fetching CSRF token from backend...');
                            let csrfToken = sessionStorage.getItem('csrf_token');

                            // Get fresh CSRF token from backend
                            const csrfResponse = await fetch(
                                `${backendUrl}/api/csrf-token`,
                                {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${session.access_token}`
                                    }
                                }
                            );

                            if (csrfResponse.ok) {
                                const csrfData = await csrfResponse.json();
                                csrfToken = csrfData.csrfToken;
                                sessionStorage.setItem('csrf_token', csrfToken);
                                console.log('✅ CSRF token obtained from backend');
                            } else {
                                console.warn('⚠️ Failed to get CSRF token, trying stored token');
                                if (!csrfToken) {
                                    throw new Error('Could not obtain CSRF token from backend');
                                }
                            }

                            // Step 2: Delete auth user
                            console.log('📡 Sending auth deletion request to:', `${backendUrl}/api/admin/delete-user`);
                            console.log('🔑 Auth User ID:', authUserId);
                            console.log('🔐 Session token present:', !!session.access_token);
                            console.log('🛡️ CSRF token length:', csrfToken?.length || 0);

                            const authDeleteResponse = await fetch(
                                `${backendUrl}/api/admin/delete-user`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${session.access_token}`,
                                        'X-CSRF-Token': csrfToken || ''
                                    },
                                    body: JSON.stringify({
                                        authUserId: authUserId // This is the UUID from auth.users
                                    }),
                                    // Add timeout to prevent hanging
                                    signal: AbortSignal.timeout(15000) // 15 second timeout (increased for CSRF + delete)
                                }
                            );

                            console.log('📥 Response status:', authDeleteResponse.status);
                            console.log('📥 Response ok:', authDeleteResponse.ok);

                            const authDeleteData = await authDeleteResponse.json();
                            console.log('📥 Response data:', authDeleteData);

                            if (authDeleteResponse.ok) {
                                console.log('✅ Auth user deletion successful');
                                authDeletionSuccess = true;
                            } else {
                                console.error('❌ Auth deletion failed:', authDeleteData);
                                // Show error to user but don't block the deletion
                                toast({
                                    title: t('common.warning'),
                                    description: `User deleted from database, but auth deletion failed: ${authDeleteData.error || authDeleteData.detail || 'Unknown error'}. Auth User ID: ${authUserId}`,
                                    variant: "destructive",
                                });
                            }
                        } catch (fetchError) {
                            // Handle network errors gracefully
                            if (fetchError instanceof Error) {
                                if (fetchError.name === 'AbortError') {
                                    console.error('❌ Auth deletion request timed out');
                                    toast({
                                        title: t('common.warning'),
                                        description: `User deleted from database, but auth deletion timed out. Auth User ID: ${authUserId}`,
                                        variant: "destructive",
                                    });
                                } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('ERR_CONNECTION_REFUSED')) {
                                    console.error('❌ Backend server is not available');
                                    toast({
                                        title: t('common.warning'),
                                        description: `User deleted from database, but backend server is not available. Please delete auth user manually. Auth User ID: ${authUserId}`,
                                        variant: "destructive",
                                    });
                                } else {
                                    console.error('❌ Auth deletion request failed:', fetchError.message);
                                    toast({
                                        title: t('common.warning'),
                                        description: `User deleted from database, but auth deletion failed: ${fetchError.message}. Auth User ID: ${authUserId}`,
                                        variant: "destructive",
                                    });
                                }
                            } else {
                                console.error('❌ Auth deletion request failed:', fetchError);
                                toast({
                                    title: t('common.warning'),
                                    description: `User deleted from database, but auth deletion failed. Auth User ID: ${authUserId}`,
                                    variant: "destructive",
                                });
                            }
                            // Don't throw error - continue with success message
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Error during auth deletion:', error);
                    console.warn('⚠️ Auth user will need to be deleted manually from Supabase Auth dashboard.');
                    console.warn('⚠️ Auth User ID to delete manually:', authUserId);
                    // Don't throw error - continue with success message
                }
            } else {
                console.log('ℹ️ User has no auth account - skipping auth deletion');
            }

            // Step 3: Show success message
            const successMessage = 'User deleted successfully ✅';

            toast({
                title: t('common.success'),
                description: successMessage,
                style: { backgroundColor: '#16a34a', color: '#fff' },
            });

            // Log the activity
            const activityMessage = `User ${userToDelete.english_username_a} ${userToDelete.english_username_d || ''} (ID: ${userid}) was deleted successfully`;
            logActivity(t('usersManagement.userDeleted'), "admin", activityMessage, "success");

            // Refresh the users list
            loadUsers();

        } catch (error) {
            console.error("❌ Error in complete user deletion:", error);

            let errorMessage = t('usersManagement.failedToDeleteUser');

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: t('common.error'),
                description: errorMessage,
                variant: "destructive",
            });
        }
    };
    const handleDeletionRequest = async (reason: string) => {
        if (!userToDelete || !currentUser?.email) return;

        setIsDeletionLoading(true);

        try {
            const userDetails = {
                english_name: `${userToDelete.english_username_a} ${userToDelete.english_username_d || ''}`.trim(),
                arabic_name: userToDelete.arabic_username_a ?
                    `${userToDelete.arabic_username_a} ${userToDelete.arabic_username_d || ''}`.trim() :
                    undefined,
                email: userToDelete.user_email,
                role: userToDelete.user_roles,
                id_number: userToDelete.id_number,
                phone: userToDelete.user_phonenumber
            };

            const result = await createDeletionRequest(
                userToDelete.userid,
                userDetails,
                reason,
                currentUser.email,
                currentUserRole
            );

            if (result.success) {
                toast({
                    title: isRTL ? 'نجح' : 'Success',
                    description: isRTL
                        ? 'تم تقديم طلب الحذف بنجاح. سيقوم المشرف بمراجعته.'
                        : 'Deletion request submitted successfully. An admin will review it.',
                    style: {
                        backgroundColor: '#16a34a',
                        color: '#fff'
                    },
                });

                logActivity(
                    'Deletion Request Created',
                    currentUser.email,
                    `Deletion request for user ${userToDelete.user_email} (ID: ${userToDelete.userid})`,
                    'success'
                );
            } else {
                throw new Error(result.error || 'Failed to create deletion request');
            }
        } catch (error) {
            console.error('Error creating deletion request:', error);
            toast({
                title: t('common.error'),
                description: error instanceof Error ? error.message : 'Failed to create deletion request',
                variant: "destructive",
            });
        } finally {
            setIsDeletionLoading(false);
            setShowDeletionModal(false);
            setUserToDelete(null);
        }
    };

    const handleDeleteButtonClick = (userid: number) => {
        console.log("🗑️ Delete button clicked for user ID:", userid);
        console.log("🔍 Permissions check:", { canDirectDelete, canRequestDeletion, currentUserRole });

        const user = users.find(u => u.userid === userid);
        if (!user) {
            console.error("❌ User not found:", userid);
            toast({
                title: t('common.error'),
                description: t('usersManagement.userNotFound'),
                variant: "destructive",
            });
            return;
        }

        if (canDirectDelete) {
            // Admin can delete directly (existing behavior)
            console.log("✅ Admin has direct delete permission, calling handleDeleteUser");
            handleDeleteUser(userid);
        } else if (canRequestDeletion) {
            // Secretary must request deletion
            console.log("✅ User has deletion request permission, showing modal");
            setUserToDelete(user);
            setShowDeletionModal(true);
        } else {
            console.warn("⚠️ User does not have delete permissions");
            toast({
                title: t('common.error'),
                description: t('usersManagement.noDeletePermission') || 'You do not have permission to delete users',
                variant: "destructive",
            });
        }
    };
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

            // Validate required fields for user creation
            if (!userFormData.date_of_birth || !userFormData.date_of_birth.trim()) {
                toast({
                    title: t('common.error'),
                    description: isRTL ? "تاريخ الميلاد مطلوب" : "Date of birth is required",
                    variant: "destructive",
                });
                return;
            }

            if (!userFormData.gender_user || !userFormData.gender_user.trim()) {
                toast({
                    title: t('common.error'),
                    description: isRTL ? "الجنس مطلوب" : "Gender is required",
                    variant: "destructive",
                });
                return;
            }
        }

        if (userFormMode === "create") {
            try {
                console.log("Creating new user with data:", userFormData);

                const capitalizedRole = capitalizeRole(userFormData.user_roles);

                let authUserId: string | null = null;
                try {
                    // Use the EXACT same signup method as regular user registration
                    // This automatically sends confirmation email (same as RegisterForm.tsx)
                    console.log("🔐 Creating user via signup (same as regular registration - sends confirmation email automatically)...");
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: userFormData.user_email,
                        password: userFormData.user_password,
                        options: {
                            emailRedirectTo: `${window.location.origin}/auth/callback`
                        }
                    });

                    if (authError) {
                        console.error("❌ Auth signup error:", authError);

                        // Handle rate limiting error gracefully (same as RegisterForm)
                        if (authError.message && authError.message.includes('security purposes') && authError.message.includes('seconds')) {
                            const secondsMatch = authError.message.match(/(\d+)\s*seconds?/i);
                            const waitTime = secondsMatch ? parseInt(secondsMatch[1]) : 60;
                            toast({
                                title: t('common.error'),
                                description: isRTL
                                    ? `يرجى المحاولة مرة أخرى بعد ${waitTime} ثانية`
                                    : `Please try again after ${waitTime} seconds`,
                                variant: "destructive",
                                duration: 5000,
                            });
                            return;
                        }

                        // If user already exists, show error
                        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                            toast({
                                title: t('common.error'),
                                description: isRTL
                                    ? "هذا البريد الإلكتروني مسجل بالفعل"
                                    : "This email is already registered",
                                variant: "destructive",
                            });
                            return;
                        }

                        throw authError;
                    }

                    if (!authData.user) {
                        throw new Error('Failed to create auth user');
                    }

                    console.log("✅ Auth user created successfully. Confirmation email sent automatically (same as regular signup)");
                    console.log('🔍 Auth user created:', authData.user);
                    console.log('🔍 Auth user ID:', authData.user.id);
                    authUserId = authData.user.id;
                    // Supabase automatically sends confirmation email on signup ✅
                    // This uses the same email configuration as regular user registration
                } catch (createError) {
                    console.error("❌ Error creating user:", createError);
                    toast({
                        title: t('common.error'),
                        description: isRTL
                            ? "فشل إنشاء المستخدم. يرجى المحاولة مرة أخرى."
                            : "Failed to create user. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                const timestamp = new Date().toISOString();

                // Ensure date_of_birth and gender_user are not empty (validation should prevent this, but double-check)
                const dateOfBirth = userFormData.date_of_birth?.trim() || null;
                const genderUser = userFormData.gender_user?.trim() || null;

                if (!dateOfBirth || !genderUser) {
                    toast({
                        title: t('common.error'),
                        description: isRTL
                            ? "تاريخ الميلاد والجنس مطلوبان"
                            : "Date of birth and gender are required",
                        variant: "destructive",
                    });
                    return;
                }

                const { data: userData, error: userError } = await supabase
                    .from("userinfo")
                    .insert({
                        // Link to auth user (same as RegisterForm.tsx)
                        id: authUserId, // This is the UUID from auth.users
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
                        date_of_birth: dateOfBirth,
                        gender_user: genderUser,
                        user_roles: capitalizedRole,
                        user_password: userFormData.user_password,
                        created_at: timestamp,
                        updated_at: timestamp
                    })
                    .select();

                if (userError) {
                    console.error("Error creating user profile:", userError);
                    const errorMsg = userError.message;

                    // Check if it's a duplicate key error and provide specific messages
                    if (errorMsg && (errorMsg.includes('duplicate key value') || errorMsg.includes('unique constraint'))) {
                        let title = t('common.error');
                        let description = '';

                        // Check which field caused the duplicate
                        if (errorMsg.includes('phonenumber')) {
                            title = isRTL ? "رقم الهاتف موجود مسبقاً" : "Phone Number Already Exists";
                            description = isRTL
                                ? "يوجد مستخدم بنفس رقم الهاتف. يرجى استخدام رقم هاتف مختلف."
                                : "A user with this phone number already exists. Please use a different phone number.";
                        } else if (errorMsg.includes('email')) {
                            title = isRTL ? "البريد الإلكتروني موجود مسبقاً" : "Email Already Exists";
                            description = isRTL
                                ? "يوجد مستخدم بنفس البريد الإلكتروني. يرجى استخدام بريد إلكتروني مختلف."
                                : "A user with this email already exists. Please use a different email.";
                        } else if (errorMsg.includes('id_number')) {
                            title = isRTL ? "رقم الهوية موجود مسبقاً" : "ID Number Already Exists";
                            description = isRTL
                                ? "يوجد مستخدم بنفس رقم الهوية. يرجى استخدام رقم هوية مختلف."
                                : "A user with this ID number already exists. Please use a different ID number.";
                        } else {
                            title = isRTL ? "معلومات موجودة مسبقاً" : "Information Already Exists";
                            description = isRTL
                                ? "يوجد مستخدم بنفس المعلومات. يرجى استخدام معلومات مختلفة."
                                : "A user with this information already exists. Please use different information.";
                        }

                        toast({
                            title: title,
                            description: description,
                            variant: "destructive",
                        });
                        return;
                    }

                    toast({
                        title: t('common.error'),
                        description: errorMsg || t('usersManagement.failedToCreateUser'),
                        variant: "destructive",
                    });
                    return;
                }

                console.log("User created successfully:", userData);

                // Confirmation email is sent automatically by createUserWithEmailConfirmed or signUp
                // User must click the confirmation link in their email to verify before they can login

                // ✅ Let real-time subscription handle the update automatically

                toast({
                    title: t('common.success'),
                    description: isRTL
                        ? "تم إنشاء المستخدم بنجاح. تم إرسال بريد التأكيد. يجب على المستخدم النقر على الرابط في البريد للتحقق قبل تسجيل الدخول."
                        : "User created successfully. A confirmation email has been sent. The user must click the link in the email to verify before they can login.",
                    style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
                });

                logActivity(
                    t('usersManagement.userCreated'),
                    "admin",
                    `New user ${userFormData.user_email} (${capitalizedRole}) created. Confirmation email sent - user must verify before login.`,
                    "success"
                );

                resetUserForm();

            } catch (error) {
                console.error("Unexpected error creating user:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
                    variant: "destructive",
                    style: { backgroundColor: '#dc2626', color: '#fff' }, // Red bg, white text
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

                console.log("Updating user with role:", capitalizedRole, "from:", userFormData.user_roles);

                if (userFormData.user_password) {
                    try {
                        console.log('🔐 Calling backend to update password...');
                        console.log('📧 Email:', userFormData.user_email);
                        console.log('🔑 Password length:', userFormData.user_password.length);

                        // Use the updatePassword function from api.ts which handles all the details
                        await updatePassword(userFormData.user_email, userFormData.user_password);

                        console.log("✅ Password updated successfully in auth");
                    } catch (error) {
                        console.error("❌ Error updating password:", error);

                        // Provide more helpful error messages
                        let errorMessage = "Failed to update password";
                        if (error instanceof Error) {
                            const errMsg = error.message.toLowerCase();
                            if (errMsg.includes('failed to fetch') || errMsg.includes('connection refused') || errMsg.includes('networkerror')) {
                                errorMessage = 'Backend server is not running. Please start the backend server on port 10000 (run: cd backend && npm run dev)';
                            } else if (errMsg.includes('fetch') || errMsg.includes('network')) {
                                errorMessage = 'Network error: Could not connect to server. Please check your internet connection and ensure the backend server is running.';
                            } else if (errMsg.includes('cors')) {
                                errorMessage = 'CORS error: Server configuration issue.';
                            } else if (errMsg.includes('401') || errMsg.includes('unauthorized')) {
                                errorMessage = 'Authentication failed. Please log in again.';
                            } else if (errMsg.includes('403') || errMsg.includes('forbidden')) {
                                errorMessage = 'Access denied. You may not have permission to update passwords.';
                            } else if (errMsg.includes('404') || errMsg.includes('not found')) {
                                errorMessage = 'User not found. Please check the email address.';
                            } else {
                                errorMessage = error.message;
                            }
                        } else {
                            errorMessage = String(error);
                        }

                        toast({
                            title: t('common.error'),
                            description: errorMessage,
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
                        style: { backgroundColor: '#dc2626', color: '#fff' }, // Red bg, white text
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
                        style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
                    });
                } else {
                    toast({
                        title: t('common.success'),
                        description: t('usersManagement.userUpdatedSuccessfully'),
                        style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
                    });
                }

                resetUserForm();
            } catch (error) {
                console.error("Unexpected error:", error);
                toast({
                    title: t('common.error'),
                    description: t('usersManagement.unexpectedError'),
                    variant: "destructive",
                    style: { backgroundColor: '#dc2626', color: '#fff' }, // Red bg, white text
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
        <div className={`users-management-container ${isRTL ? 'rtl' : ''} w-full max-w-none`}>
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
                                {canCreateUsers && (
                                    <Button size="sm" onClick={() => resetUserForm()}>
                                        <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('usersManagement.addUser')}
                                    </Button>
                                )}
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
                            {/* Add this line to show secretary is viewing patients only */}
                            {currentUserRole === 'secretary' && (
                                <span className="text-blue-600 font-medium">
                                    {isRTL ? ' - المرضى فقط' : ' - Patients Only'}
                                </span>
                            )}
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
                                            {canEditUsers && (
                                                <Button variant="outline" size="sm" onClick={() => handleEditUser(u.userid)}>
                                                    <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                    {t('common.edit')}
                                                </Button>
                                            )}
                                            {/* Hide delete button for admin users */}
                                            {u.user_roles.toLowerCase() !== 'admin' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteButtonClick(u.userid)}
                                                    disabled={!canDirectDelete && !canRequestDeletion}
                                                >
                                                    {canDirectDelete ? (
                                                        <>
                                                            <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {isRTL ? 'حذف' : 'Delete'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {isRTL ? 'طلب حذف' : 'Request Deletion'}
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            {/* Show protected message for admin users */}
                                            {u.user_roles.toLowerCase() === 'admin' && (
                                                <div className="text-xs text-gray-500 italic">
                                                    {isRTL ? 'محمي من الحذف' : 'Protected from deletion'}
                                                </div>
                                            )}
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
            {canCreateUsers && (
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

                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="id_number" className="flex items-center gap-2">
                                            {t('auth.idNumber')}
                                            {userFormData.id_number.length === 9 && (
                                                <>
                                                    {idValidationStatus === 'valid' && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                    {idValidationStatus === 'invalid' && (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </>
                                            )}

                                        </Label>

                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="id_number"
                                            name="id_number"
                                            type="text"
                                            value={userFormData.id_number}
                                            onChange={handleUserInputChange}
                                            required
                                            placeholder="123456789"
                                            dir="ltr"
                                            className={`text-left ${userFormData.id_number.length === 9
                                                ? idValidationStatus === 'valid'
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                                : ''
                                                }`}
                                            maxLength={9}
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                            {userFormData.id_number.length}/9
                                        </div>
                                    </div>


                                    {userFormData.id_number.length > 0 && userFormData.id_number.length < 9 && (
                                        <div className="text-xs text-orange-600">
                                            Enter {9 - userFormData.id_number.length} more digit{9 - userFormData.id_number.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
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
                                            max={new Date().toISOString().split('T')[0]}
                                            dir="ltr"
                                            required={userFormMode === "create"}
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
                                            <SelectItem value="Doctor" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
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
                                            <SelectItem value="Ultrasound" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                                {t('roles.ultrasound')}
                                            </SelectItem>
                                            <SelectItem value="Audiometry" className={isRTL ? 'text-right justify-start pr-8' : 'text-left'} style={isRTL ? { textAlign: 'right', direction: 'rtl' } : {}}>
                                                {t('roles.audiometry')}
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
            )}
            {/* Deletion Request Modal */}
            <DeletionRequestModal
                isOpen={showDeletionModal}
                onClose={() => {
                    setShowDeletionModal(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleDeletionRequest}
                userName={userToDelete ? getUserDisplayName(userToDelete) : ''}
                userEmail={userToDelete?.user_email || ''}
                isLoading={isDeletionLoading}
            />
        </div>
    );
};

export default UsersManagement;
