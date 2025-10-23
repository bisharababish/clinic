// pages/AdminDashboard.tsx - REPLACE THE ENTIRE FILE WITH THIS:
import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdminState } from "../hooks/useAdminState";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getRolePermissions } from '../lib/rolePermissions';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "../components/ui/skeleton";
import { hasPermission } from "../lib/rolePermissions";

// Lazy load components for better performance
const ClinicManagement = lazy(() => import("./api/admin/ClinicManagement"));
const DoctorManagement = lazy(() => import("./api/admin/DoctorManagement"));
const UsersManagement = lazy(() => import("./api/admin/UsersManagement"));
const AppointmentsManagement = lazy(() => import("./api/admin/AppointmentsManagement"));
const OverviewManagement = lazy(() => import("./api/admin/OverviewManagement"));
const CalendarTab = lazy(() => import("./api/admin/CalenderTab"));
const PatientHealthManagement = lazy(() => import("./api/admin/PatientHealthManagement"));
const DeletionRequestsTab = lazy(() => import("./api/admin/DeletionRequestsTab"));
const PaymentManagement = lazy(() => import("./api/admin/PaymentManagement"));
const PaidPatientsList = lazy(() => import("../components/PaidPatientsList"));
const AppointmentChangeLogs = lazy(() => import("../components/AppointmentChangeLogs"));

// The actual dashboard component that uses the state
const AdminDashboardContent = () => {
    const { user, isLoading: authLoading } = useAuth();
    const {
        users,
        clinics,
        doctors,
        appointments,
        isLoading: dataLoading,
        hasInitialized,
        error: dataError,
        refreshAll,
        loadAppointments,
        extendSession,
        lastUpdated
    } = useAdminState();


    const getDataAge = () => {
        if (Object.keys(lastUpdated).length === 0) return null;

        const oldestUpdate = Math.min(...Object.values(lastUpdated));
        const ageMinutes = Math.floor((Date.now() - oldestUpdate) / 60000);

        if (ageMinutes < 1) return i18n.language === 'ar' ? 'تم التحديث للتو' : 'Just updated';
        if (ageMinutes === 1) return i18n.language === 'ar' ? 'منذ دقيقة واحدة' : '1 minute ago';
        return i18n.language === 'ar' ? `منذ ${ageMinutes} دقائق` : `${ageMinutes} minutes ago`;
    };

    // Check if data needs refresh
    const needsRefresh = Object.values(lastUpdated).some(timestamp =>
        Date.now() - timestamp > 240000
    );

    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
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
    const canViewPaymentTab = ['admin', 'secretary'].includes(userRole); // Admin and Secretary can view payments
    const canViewAppointmentLogsTab = ['admin', 'secretary'].includes(userRole); // Admin and Secretary can view appointment change logs

    // Debug logging for appointment logs tab access
    console.log('🔍 Admin Dashboard Access Debug:', {
        userRole,
        canViewAppointmentLogsTab,
        isAdmin: userRole === 'admin',
        isSecretary: userRole === 'secretary'
    });
    const hasAccessibleTabs = canViewOverviewTab || canViewUsersTab || canViewClinicsTab || canViewDoctorsTab || canViewAppointmentsTab || canViewPatientHealthTab || canViewCalendarTab || canViewPaymentTab || canViewAppointmentLogsTab || canViewDeletionRequests;

    // Get default tab for user role
    const getDefaultTab = useCallback(() => {
        if (userRole === 'secretary') {
            return 'users';
        } else if (userRole === 'admin') {
            return 'overview'; // Prioritize deletion requests for admins
        } else {
            if (canViewAppointmentsTab) return 'appointments';
            if (canViewOverviewTab) return 'overview';
            if (canViewPatientHealthTab) return 'patient-health';
            if (canViewClinicsTab) return 'clinics';
            if (canViewUsersTab) return 'users';
            if (canViewDoctorsTab) return 'doctors';
            if (canViewCalendarTab) return 'calendar';
            if (canViewPaymentTab) return 'payments';
            if (canViewDeletionRequests) return 'deletion-requests';
            return 'overview';
        }
    }, [userRole, canViewAppointmentsTab, canViewOverviewTab, canViewPatientHealthTab, canViewClinicsTab, canViewUsersTab, canViewDoctorsTab, canViewCalendarTab, canViewPaymentTab, canViewDeletionRequests]);
    // Add this new useEffect to handle browser back button
    // useEffect(() => {
    //     const handlePopState = () => {
    //         // When user clicks browser back button, redirect to overview
    //         if (activeTab !== 'overview' && canViewOverviewTab) {
    //             setActiveTab('overview');
    //         }
    //     };

    //     window.addEventListener('popstate', handlePopState);

    //     return () => {
    //         window.removeEventListener('popstate', handlePopState);
    //     };
    // }, [activeTab, canViewOverviewTab]);
    // Add proper URL handling for tab navigation
    useEffect(() => {
        // Update URL when tab changes
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', currentUrl.toString());
    }, [activeTab]);

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // Let browser handle the navigation naturally
            // Don't interfere with back button behavior
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    // Check admin status and access control - OPTIMIZED for faster loading
    useEffect(() => {
        const initializeAdminDashboard = async () => {
            if (authLoading) return;

            try {
                const currentUserRole = user?.role?.toLowerCase() || '';

                // If no user (logged out), redirect to auth immediately
                if (!user) {
                    console.log('🔄 No user found, redirecting to auth...');
                    navigate('/auth', { replace: true });
                    return;
                }

                // Check if user has admin dashboard access
                if (!userPermissions.canViewAdmin) {
                    console.log('❌ User does not have admin permissions:', currentUserRole);
                    setError(t('admin.accessDenied') || 'Access denied');
                    toast({
                        title: t('common.error'),
                        description: t('admin.accessDenied') || 'Access denied',
                        variant: "destructive",
                    });
                    setTimeout(() => {
                        navigate('/home', { replace: true });
                    }, 2000);
                    return;
                }

                // Set default tab immediately for faster UI response
                if (!activeTab) {
                    const defaultTab = getDefaultTab();
                    setActiveTab(defaultTab);

                    // If Overview is the default tab, ensure data is loaded
                    if (defaultTab === 'overview') {
                        console.log('🔄 Overview is default tab, ensuring data is loaded...');
                        refreshAll();
                    }
                }

                console.log('✅ Admin dashboard initialized for role:', currentUserRole);

                // Don't trigger heavy data loading here - let useAdminState handle it
                // This prevents blocking the UI

            } catch (error) {
                console.error('Error in dashboard initialization:', error);
                setError(t('admin.errorLoadingDashboard') || 'Error loading dashboard');
            }
        };

        // Initialize immediately with no delay
        initializeAdminDashboard();
    }, [authLoading, user, userPermissions, navigate, t, activeTab, getDefaultTab, toast, refreshAll]);

    // Ensure data is loaded when Overview tab is active
    useEffect(() => {
        if (activeTab === 'overview' && users.length === 0 && !dataLoading) {
            console.log('🔄 Overview tab active but no data, triggering load...');
            refreshAll();
        }
    }, [activeTab, users.length, dataLoading, refreshAll]);

    // Handle tab changes with permission checking
    const handleTabChange = (newTab: string) => {
        const hasPermission = {
            'overview': canViewOverviewTab,
            'users': canViewUsersTab,
            'clinics': canViewClinicsTab,
            'doctors': canViewDoctorsTab,
            'appointments': canViewAppointmentsTab,
            'payments': canViewPaymentTab,
            'paid-patients': canViewPaymentTab,
            'patient-health': canViewPatientHealthTab,
            'calendar': canViewCalendarTab,
            'appointment-logs': canViewAppointmentLogsTab,
            'deletion-requests': canViewDeletionRequests

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

    // Loading and error states - OPTIMIZED for faster perceived loading
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
                        onClick={() => navigate('/home', { replace: true })}
                        className="w-full"
                    >
                        {t('admin.returnToHome') || 'Return to Home'}
                    </Button>
                </div>
            </div>
        );
    }

    // Show dashboard immediately - don't wait for data loading
    // Data will load in background and update UI when ready

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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
                    {getDataAge() && (
                        <p className="text-sm text-gray-500 mt-1">
                            {i18n.language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {getDataAge()}
                        </p>
                    )}
                    {/* Show loading indicator when data is still loading */}
                    {dataLoading && (
                        <div className="flex items-center mt-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <p className="text-sm text-blue-600">
                                {i18n.language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
                            </p>
                        </div>
                    )}
                </div>

                {needsRefresh && (
                    <Button onClick={extendSession} variant="outline" size="sm">
                        🔄 {t('admin.refreshData') || 'Refresh Data'}
                    </Button>
                )}
            </div>
            {!hasAccessibleTabs ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">
                        {t('admin.noAccessibleSections') || 'No accessible sections'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {t('admin.contactAdministrator') || 'Contact your administrator for access'}
                    </p>
                    <Button onClick={() => navigate('/home')} variant="outline">
                        {t('admin.returnToHome') || 'Return to Home'}
                    </Button>
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    {/* MOBILE: Two rows with improved styling */}
                    <div className="md:hidden space-y-2">
                        {/* First Row */}
                        <TabsList className={`flex w-full gap-1 p-1 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {canViewOverviewTab && (
                                <TabsTrigger value="overview" className="flex-1 text-xs px-2 py-2 truncate">
                                    {t('admin.overview') || 'Overview'}
                                </TabsTrigger>
                            )}
                            {canViewUsersTab && (
                                <TabsTrigger value="users" className="flex-1 text-xs px-2 py-2 truncate">
                                    {t('admin.users') || 'Users'}
                                </TabsTrigger>
                            )}
                            {canViewClinicsTab && (
                                <TabsTrigger value="clinics" className="flex-1 text-xs px-2 py-2 truncate">
                                    {t('admin.clinics') || 'Clinics'}
                                </TabsTrigger>
                            )}
                            {canViewDoctorsTab && (
                                <TabsTrigger value="doctors" className="flex-1 text-xs px-2 py-2 truncate">
                                    {t('admin.doctors') || 'Doctors'}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Second Row */}
                        <TabsList className={`flex w-full gap-1 p-1 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {canViewPatientHealthTab && (
                                <TabsTrigger value="patient-health" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'الصحة' : 'Health'}
                                </TabsTrigger>
                            )}
                            {canViewAppointmentsTab && (
                                <TabsTrigger value="appointments" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'المواعيد' : 'Appointments'}
                                </TabsTrigger>
                            )}
                            {canViewPaymentTab && (
                                <TabsTrigger value="payments" className="flex-1 text-xs px-2 py-2 truncate">
                                    {isRTL ? 'المدفوعات' : 'Payments'}
                                </TabsTrigger>
                            )}
                            {canViewPaymentTab && (
                                <TabsTrigger value="paid-patients" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'المرضى المدفوعين' : 'Paid Patients'}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Third Row (if needed) */}
                        <TabsList className={`flex w-full gap-1 p-1 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {canViewCalendarTab && (
                                <TabsTrigger value="calendar" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'التقويم' : 'Calendar'}
                                </TabsTrigger>
                            )}
                            {canViewAppointmentLogsTab && (
                                <TabsTrigger value="appointment-logs" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'سجل المواعيد' : 'Booking Logs'}
                                </TabsTrigger>
                            )}
                            {canViewDeletionRequests && (
                                <TabsTrigger value="deletion-requests" className="flex-1 text-xs px-2 py-2 truncate">
                                    {i18n.language === 'ar' ? 'طلبات الحذف' : 'Deletions'}
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
                        {canViewPaymentTab && (
                            <TabsTrigger value="payments" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {isRTL ? 'المدفوعات' : 'Payments'}
                            </TabsTrigger>
                        )}
                        {canViewPaymentTab && (
                            <TabsTrigger value="paid-patients" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'المرضى المدفوعين' : 'Paid Patients'}
                            </TabsTrigger>
                        )}
                        {canViewCalendarTab && (
                            <TabsTrigger value="calendar" className="flex-1 text-[9px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'التقويم' : 'Calendar'}
                            </TabsTrigger>
                        )}
                        {canViewAppointmentLogsTab && (
                            <TabsTrigger value="appointment-logs" className="flex-1 text-[8px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'سجل المواعيد' : 'Booking Logs'}
                            </TabsTrigger>
                        )}
                        {canViewDeletionRequests && (
                            <TabsTrigger value="deletion-requests" className="flex-1 text-[8px] md:text-sm px-0 md:px-3 truncate min-w-0">
                                {i18n.language === 'ar' ? 'طلبات الحذف' : 'Deletions'}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    {canViewOverviewTab && (
                        <TabsContent value="overview" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
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
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* USERS TAB */}
                    {canViewUsersTab && (
                        <TabsContent value="users" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <UsersManagement />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* CLINICS TAB */}
                    {canViewClinicsTab && (
                        <TabsContent value="clinics" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <ClinicManagement />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* DOCTORS TAB */}
                    {canViewDoctorsTab && (
                        <TabsContent value="doctors" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <DoctorManagement />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* PATIENT HEALTH TAB */}
                    {canViewPatientHealthTab && (
                        <TabsContent value="patient-health" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <PatientHealthManagement />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {canViewAppointmentsTab && (
                        <TabsContent value="appointments" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <AppointmentsManagement
                                    userEmail={user?.email || 'admin'}
                                />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* CALENDAR TAB */}
                    {canViewCalendarTab && (
                        <TabsContent value="calendar" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
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
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* PAYMENTS TAB */}
                    {canViewPaymentTab && (
                        <TabsContent value="payments" className="pt-6">
                            <div className="space-y-6">
                                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                    <PaymentManagement />
                                </Suspense>
                            </div>
                        </TabsContent>
                    )}

                    {/* PAID PATIENTS TAB */}
                    {canViewPaymentTab && (
                        <TabsContent value="paid-patients" className="pt-6">
                            <div className="space-y-6">
                                {/* All Paid Patients */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                        {i18n.language === 'ar' ? "جميع المدفوعات" : "All Payments"}
                                    </h2>
                                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                                        <PaidPatientsList
                                            showOnlyPaid={true}
                                            compact={false}
                                        />
                                    </Suspense>
                                </div>

                                {/* Pending Payments */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                        {i18n.language === 'ar' ? "المدفوعات المعلقة" : "Pending Payments"}
                                    </h2>
                                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                                        <PaidPatientsList
                                            showOnlyPending={true}
                                            compact={false}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* APPOINTMENT CHANGE LOGS TAB */}
                    {canViewAppointmentLogsTab && (
                        <TabsContent value="appointment-logs" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <AppointmentChangeLogs />
                            </Suspense>
                        </TabsContent>
                    )}

                    {/* DELETION REQUESTS TAB */}
                    {canViewDeletionRequests && (
                        <TabsContent value="deletion-requests" className="pt-6">
                            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                <DeletionRequestsTab />
                            </Suspense>
                        </TabsContent>
                    )}
                </Tabs>
            )}
        </div>
    );
};

// Export the component directly without AdminStateProvider wrapper
const AdminDashboard = () => {
    return <AdminDashboardContent />;
};

export default AdminDashboard;
