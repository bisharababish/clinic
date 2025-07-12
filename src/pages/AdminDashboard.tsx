// pages/AdminDashboard.tsx - REPLACE THE ENTIRE FILE WITH THIS:
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { AdminStateProvider, useAdminState } from "../hooks/useAdminState"; // NEW IMPORT
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClinicManagement from "./api/admin/ClinicManagement";
import DoctorManagement from "./api/admin/DoctorManagement";
import UsersManagement from "./api/admin/UsersManagement";
import AppointmentsManagement from "./api/admin/AppointmentsManagement";
import OverviewManagement from "./api/admin/OverviewManagement";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getRolePermissions } from '../lib/rolePermissions';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import CalendarTab from "./api/admin/CalenderTab";
import { hasPermission } from "@/lib/rolePermissions";
import PatientHealthManagement from "./api/admin/PatientHealthManagement";
import DeletionRequestsTab from "./api/admin/DeletionRequestsTab";

// The actual dashboard component that uses the state
const AdminDashboardContent = () => {
    const { user, isLoading: authLoading } = useAuth();
    const {
        users,
        clinics,
        doctors,
        appointments,
        isLoading: dataLoading,
        error: dataError,
        refreshAll,
        loadAppointments
    } = useAdminState(); // Use the centralized state

    const { toast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Get user role and permissions
    const userRole = user?.role?.toLowerCase() || '';
    const userPermissions = getRolePermissions(userRole);
    const canViewDeletionRequests = userRole === 'admin';

    const [activeTab, setActiveTab] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Define which tabs each role can see
    const canViewOverviewTab = userPermissions.canViewOverview;
    const canViewUsersTab = userRole === 'admin' || userRole === 'secretary';
    const canViewClinicsTab = hasPermission(userRole, 'canManageClinics');
    const canViewDoctorsTab = userPermissions.canViewDoctors;
    const canViewAppointmentsTab = userPermissions.canViewAppointments;
    const canViewPatientHealthTab = ['admin', 'doctor', 'nurse'].includes(userRole);
    const canViewCalendarTab = hasPermission(userRole, 'canViewCalendar');
    const hasAccessibleTabs = canViewOverviewTab || canViewUsersTab || canViewClinicsTab || canViewDoctorsTab || canViewAppointmentsTab || canViewPatientHealthTab || canViewCalendarTab || canViewDeletionRequests;

    // Get default tab for user role
    const getDefaultTab = () => {
        if (userRole === 'secretary') {
            return 'appointments';
        } else if (userRole === 'admin') {
            return 'overview'; // Prioritize deletion requests for admins
        } else {
            if (canViewAppointmentsTab) return 'appointments';
            if (canViewOverviewTab) return 'overview';
            if (canViewPatientHealthTab) return 'patient-health';
            if (canViewClinicsTab) return 'clinics';
            if (canViewUsersTab) return 'users';
            if (canViewDoctorsTab) return 'doctors';
            return 'overview';
        }
    };
    // Add this new useEffect to handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            // When user clicks browser back button, redirect to overview
            if (activeTab !== 'overview' && canViewOverviewTab) {
                setActiveTab('overview');
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [activeTab, canViewOverviewTab]);
    // Check admin status and access control
    useEffect(() => {
        const initializeAdminDashboard = async () => {
            if (authLoading) return;

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

                // Set default tab if not already set
                if (!activeTab) {
                    setActiveTab(getDefaultTab());
                }

                console.log('✅ Admin dashboard initialized for role:', currentUserRole);

            } catch (error) {
                console.error('Error in dashboard initialization:', error);
                setError(t('admin.errorLoadingDashboard') || 'Error loading dashboard');
            }
        };

        initializeAdminDashboard();
    }, [authLoading, user, userPermissions, navigate, t, activeTab]);

    // Handle tab changes with permission checking
    const handleTabChange = (newTab: string) => {
        const hasPermission = {
            'overview': canViewOverviewTab,
            'users': canViewUsersTab,
            'clinics': canViewClinicsTab,
            'doctors': canViewDoctorsTab,
            'appointments': canViewAppointmentsTab,
            'patient-health': canViewPatientHealthTab,
            'calendar': canViewCalendarTab,
            'deletion-requests': canViewDeletionRequests  // ADD THIS LINE

        }[newTab];

        if (hasPermission) {
            setActiveTab(newTab);
            console.log('✅ Switched to tab:', newTab);
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

    // Activity logging
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        try {
            console.log(`📝 Activity: ${action} by ${user} - ${status}`);
            // Your existing activity logging logic here
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // Loading and error states
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('admin.authenticating') || 'Authenticating...'}</p>
                </div>
            </div>
        );
    }

    if (error || dataError) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-red-600">{t('common.error') || 'Error'}</h1>
                <p className="mt-2">{error || dataError}</p>

                <div className="space-y-4 mt-6">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        {t('admin.reloadPage') || 'Reload Page'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full"
                    >
                        {t('admin.returnToHome') || 'Return to Home'}
                    </Button>
                </div>
            </div>
        );
    }

    // Get dashboard title based on user role
    const getDashboardTitle = () => {
        if (userRole === 'admin') {
            return t('admin.title') || 'Admin Dashboard';
        } else if (userRole === 'secretary') {
            return t('admin.secretaryDashboard') || 'Secretary Dashboard';
        }
        return t('admin.dashboard') || 'Dashboard';
    };

    // Check if any tabs are accessible

    // Main render
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">{getDashboardTitle()}</h1>

            {!hasAccessibleTabs ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">
                        {t('admin.noAccessibleSections') || 'No accessible sections'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {t('admin.contactAdministrator') || 'Contact your administrator for access'}
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline">
                        {t('admin.returnToHome') || 'Return to Home'}
                    </Button>
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    {/* MOBILE: Two rows for tabs */}
                    <div className="md:hidden">
                        <TabsList className={`flex w-full gap-0.5 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {canViewOverviewTab && (
                                <TabsTrigger value="overview" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {t('admin.overview') || 'Overview'}
                                </TabsTrigger>
                            )}
                            {canViewUsersTab && (
                                <TabsTrigger value="users" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {t('admin.users') || 'Users'}
                                </TabsTrigger>
                            )}
                            {canViewClinicsTab && (
                                <TabsTrigger value="clinics" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {t('admin.clinics') || 'Clinics'}
                                </TabsTrigger>
                            )}
                            {canViewDoctorsTab && (
                                <TabsTrigger value="doctors" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {t('admin.doctors') || 'Doctors'}
                                </TabsTrigger>
                            )}
                            {canViewDeletionRequests && (
                                <TabsTrigger value="deletion-requests" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {i18n.language === 'ar' ? 'طلبات الحذف' : 'Deletions'}
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <TabsList className={`flex w-full gap-0.5 mt-1 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {canViewPatientHealthTab && (
                                <TabsTrigger value="patient-health" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {i18n.language === 'ar' ? 'الصحة' : 'Health'}
                                </TabsTrigger>
                            )}
                            {canViewAppointmentsTab && (
                                <TabsTrigger value="appointments" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {i18n.language === 'ar' ? 'المواعيد' : 'Appointments'}
                                </TabsTrigger>
                            )}
                            {canViewCalendarTab && (
                                <TabsTrigger value="calendar" className="flex-1 text-[9px] px-0 truncate min-w-0">
                                    {i18n.language === 'ar' ? 'التقويم' : 'Calendar'}
                                </TabsTrigger>
                            )}
                            {canViewDeletionRequests && (
                                <TabsTrigger value="deletion-requests" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                    {i18n.language === 'ar' ? 'طلبات الحذف' : 'Deletion Requests'}
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    {/* DESKTOP: All tabs in one row */}
                    <TabsList className={`hidden md:flex w-full gap-0.5 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        {canViewOverviewTab && (
                            <TabsTrigger value="overview" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {t('admin.overview') || 'Overview'}
                            </TabsTrigger>
                        )}
                        {canViewUsersTab && (
                            <TabsTrigger value="users" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {t('admin.users') || 'Users'}
                            </TabsTrigger>
                        )}
                        {canViewClinicsTab && (
                            <TabsTrigger value="clinics" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {t('admin.clinics') || 'Clinics'}
                            </TabsTrigger>
                        )}
                        {canViewDoctorsTab && (
                            <TabsTrigger value="doctors" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {t('admin.doctors') || 'Doctors'}
                            </TabsTrigger>
                        )}
                        {canViewPatientHealthTab && (
                            <TabsTrigger value="patient-health" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'الصحة' : 'Health'}
                            </TabsTrigger>
                        )}
                        {canViewAppointmentsTab && (
                            <TabsTrigger value="appointments" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'المواعيد' : 'Appointments'}
                            </TabsTrigger>
                        )}
                        {canViewCalendarTab && (
                            <TabsTrigger value="calendar" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'التقويم' : 'Calendar'}
                            </TabsTrigger>
                        )}
                        {/* ADD THIS INSTEAD */}
                        {canViewDeletionRequests && (
                            <TabsTrigger value="deletion-requests" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'طلبات الحذف' : 'Deletion Requests'}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    {canViewOverviewTab && (
                        <TabsContent value="overview" className="pt-6">
                            <OverviewManagement
                                users={users}
                                clinics={clinics.map(clinic => ({ ...clinic, isActive: true }))}
                                doctors={doctors.map(doctor => ({ ...doctor, isAvailable: true }))}
                                appointments={appointments}
                                reportData={null}
                                isLoading={dataLoading}
                                error={dataError}
                                refreshReportData={refreshAll}
                                setActiveTab={setActiveTab}
                                checkSystemStatus={async () => { }}
                            />
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

                    {/* PATIENT HEALTH TAB */}
                    {canViewPatientHealthTab && (
                        <TabsContent value="patient-health" className="pt-6">
                            <PatientHealthManagement />
                        </TabsContent>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {canViewAppointmentsTab && (
                        <TabsContent value="appointments" className="pt-6">
                            <AppointmentsManagement
                                userEmail={user?.email || 'admin'}
                            />
                        </TabsContent>
                    )}

                    {/* CALENDAR TAB */}
                    {canViewCalendarTab && (
                        <TabsContent value="calendar" className="pt-6">
                            <CalendarTab
                                appointments={appointments}
                                doctors={doctors.map(doctor => ({
                                    ...doctor,
                                    isAvailable: true // Add missing isAvailable property
                                }))}
                                clinics={clinics.map(clinic => ({
                                    ...clinic,
                                    isActive: true // Add missing isActive property
                                }))}
                                isLoading={dataLoading}
                                t={t}
                                i18n={i18n}
                                setActiveTab={setActiveTab}
                            />
                        </TabsContent>
                    )}
                    {/* ADD THE DELETION REQUESTS TAB HERE */}
                    {canViewDeletionRequests && (
                        <TabsContent value="deletion-requests" className="pt-6">
                            <DeletionRequestsTab />
                        </TabsContent>
                    )}
                </Tabs>
            )}
        </div>
    );
};

// Wrap the component with the AdminStateProvider
const AdminDashboard = () => {
    return (
        <AdminStateProvider>
            <AdminDashboardContent />
        </AdminStateProvider>
    );
};

export default AdminDashboard;