// Complete fixed i18n.ts file with Admin Dashboard translations
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const enTranslations = {
    common: {
        welcome: 'Welcome to Bethlehem Med Center',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot password?',
        backToLogin: 'Back to Login',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        name: 'Name',
        phone: 'Phone',
        address: 'Address',
        language: 'Language',
        english: 'English',
        arabic: 'Arabic',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        loading: 'Loading...',
        clinicName: 'Bethlehem Med Center',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        refresh: 'Refresh',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        available: 'Available',
        unavailable: 'Unavailable',
        price: 'Price',
        description: 'Description',
        category: 'Category',
        specialty: 'Specialty',
        date: 'Date',
        time: 'Time',
        actions: 'Actions',
        view: 'View',
        details: 'Details',
        total: 'Total',
        count: 'Count',
        revenue: 'Revenue',
    },
    auth: {
        welcomeBack: 'Welcome Back',
        enterCredentials: 'Enter your credentials to access your account',
        dontHaveAccount: 'Don\'t have an account?',
        alreadyHaveAccount: 'Already have an account?',
        createAccount: 'Create Account',
        registerAsPatient: 'Register as a patient to access our services',
        resetPasswordTitle: 'Forgot Password',
        resetPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password',
        sendResetLink: 'Send Reset Link',
        checkEmail: 'Check Your Email',
        resetEmailSent: 'We\'ve sent a password reset link to',
        didntReceiveEmail: 'Didn\'t receive an email? Check your spam folder or try again.',
        tryAgain: 'Try Again',
        createNewPassword: 'Create New Password',
        missingCredentials: 'Please enter both email and password',
        invalidEmail: 'Please enter a valid email address',
        adminLogin: 'Admin Login',
        secureAdminAccess: 'Secure access for clinic administrators only',
        signInAsAdmin: 'Sign In as Admin',
        firstNameEn: 'First Name (English)',
        secondNameEn: 'Second Name (English)',
        thirdNameEn: 'Third Name (English)',
        lastNameEn: 'Last Name (English)',
        firstNameAr: 'First Name (Arabic)',
        secondNameAr: 'Second Name (Arabic)',
        thirdNameAr: 'Third Name (Arabic)',
        lastNameAr: 'Last Name (Arabic)',
        idNumber: 'ID Number',
        yourIDNumber: 'Your ID Number',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        invalidPhone: 'Invalid Phone Number',
        phoneNumbersOnly: 'Please enter numbers only',
        weakPassword: 'Weak Password',
        passwordLength: 'Password must be at least 6 characters',
        missingNameInfo: 'Missing Name Information',
        fillRequiredNames: 'Please fill in at least first and last name in both languages',
        missingInfo: 'Missing Information',
        fillRequiredFields: 'Please fill in all required fields',
        invalidID: 'Invalid ID Number',
        validIDRequired: 'Please enter a valid 9-digit Palestinian ID number',
        passwordMismatch: 'Password Mismatch',
        passwordsDoNotMatch: 'Passwords do not match',
        registrationNote: 'Registration Note',
        profileSetupAdmin: 'User created, but profile setup requires admin action.',
        registrationSuccess: 'Registration Successful',
        welcomeToClinic: 'Welcome to our clinic portal!',
        registrationFailed: 'Registration Failed',
    },
    navbar: {
        home: 'Home',
        clinics: 'Clinics',
        aboutUs: 'About Us',
        labs: 'Labs',
        xray: 'X-Ray',
        adminDashboard: 'Admin Dashboard',
    },
    footer: {
        rights: 'All rights reserved',
        privacyPolicy: 'Privacy Policy',
        termsOfUse: 'Terms of Use',
        contactUs: 'Contact Us',
        quickLinks: 'Quick Links',
        clinicDescription: 'Providing quality healthcare services since 2025',
        address: 'Wadi Musalam St. - Najib Nasser Building',
        city: 'Bethlehem, Palestine',
    },
    admin: {
        // Main Dashboard
        title: 'Admin Dashboard',
        authenticating: 'Authenticating...',
        loadingDashboard: 'Loading Admin Dashboard...',
        reloadPage: 'Reload Page',
        returnToHome: 'Return to Home',

        // Tabs
        overview: 'Overview',
        users: 'Users',
        clinics: 'Clinics',
        doctors: 'Doctors',
        appointments: 'Appointments',
        settings: 'Settings',

        // Overview Tab - Stats Cards
        totalUsers: 'Total Users',
        activeAppointments: 'Active Appointments',
        availableClinics: 'Available Clinics',
        systemStatus: 'System Status',
        checkingStatus: 'Checking status...',
        systemIssueDetected: 'System Issue Detected',
        allSystemsOperational: 'All Systems Operational',
        lastChecked: 'Last checked',

        // Overview Tab - Charts
        userDistributionByRole: 'User Distribution by Role',
        pie: 'Pie',
        bar: 'Bar',
        numberOfUsers: 'Number of Users',
        userRole: 'User Role',

        // Overview Tab - Role Breakdown
        patients: 'Patients',
        secretaries: 'Secretaries',
        nurses: 'Nurses',
        administrators: 'Administrators',
        labTechnicians: 'Lab Technicians',
        xrayTechnicians: 'X-Ray Technicians',

        // Overview Tab - Performance Summary
        performanceSummary: 'Performance Summary',
        totalRevenue: 'Total Revenue',
        appointmentCompletionRate: 'Appointment Completion Rate',
        doctorUtilization: 'Doctor Utilization',

        // Overview Tab - Quick Actions
        quickActions: 'Quick Actions',
        addUser: 'Add User',
        viewAppointments: 'View Appointments',
        manageClinics: 'Manage Clinics',
        refreshData: 'Refresh Data',

        // System Status Messages
        systemIssues: 'Some systems are experiencing issues.',
        checkSystemStatus: 'Check System Status',
        refreshReportData: 'Refresh Report Data',
        reportDataRefreshed: 'Report data refreshed.',
        failedToRefreshReportData: 'Failed to refresh report data.',

        // Statistics
        totalDoctors: 'Total Doctors',
        totalAppointments: 'Total Appointments',
        appointmentsByClinic: 'Appointments by Clinic',
        appointmentsByDoctor: 'Appointments by Doctor',
        revenueByClinic: 'Revenue by Clinic',
        usersByRole: 'Users by Role',
        recentActivity: 'Recent Activity',

        // Activity Log
        activityLog: 'Activity Log',
        action: 'Action',
        user: 'User',
        timestamp: 'Timestamp',
        noRecentActivity: 'No recent activity',

        // Error Messages
        errorLoadingUsers: 'Failed to load users from database.',
        errorLoadingClinics: 'Error loading clinics. Some dashboard features may be limited.',
        errorLoadingDashboard: 'There was an error loading the dashboard. Please try again.',
        failedToLoadUsers: 'Failed to load users list.',
        someReportDataUnavailable: 'Some report data could not be loaded. Showing partial data.',
        errorCheckingSystemStatus: 'Failed to check system status.',

        // Loading States
        loadingUsers: 'Loading users with forced refresh...',
        loadingClinics: 'Loading clinics...',
        loadingDoctors: 'Loading doctors...',
        loadingAppointments: 'Loading appointments...',
        loadingActivityLog: 'Loading activity log...',
        loadingSystemSettings: 'Loading system settings...',
        generatingReportData: 'Generating report data...',

        // Success Messages
        usersLoaded: 'Users loaded',
        clinicsLoaded: 'Clinics loaded',
        doctorsLoaded: 'Doctors loaded',
        appointmentsLoaded: 'Appointments loaded',
        activityLogsLoaded: 'Activity logs loaded',
        systemSettingsLoaded: 'System settings loaded',
        reportDataGenerated: 'Report data generated',
        dashboardInitializationComplete: 'Dashboard initialization complete',

        // Statuses
        scheduled: 'Scheduled',
        completed: 'Completed',
        cancelled: 'Cancelled',
        pending: 'Pending',
        paid: 'Paid',
        refunded: 'Refunded',
        failed: 'Failed',

        // Search and Filter
        searchUsers: 'Search users...',
        searchByEmail: 'Search by email, name, or role',
        filterUsers: 'Filter Users',
        noUsersFound: 'No users found matching your search.',

        // Quick Actions
        viewUsers: 'View Users',
        manageDoctors: 'Manage Doctors',
        systemSettings: 'System Settings',
    },
    usersManagement: {
        // Main titles and descriptions
        title: 'User Management',
        description: 'Manage all user accounts for the clinic portal',

        // Search and actions
        searchPlaceholder: 'Search users...',
        addUser: 'Add User',
        loadingUsers: 'Loading users...',

        // User info labels
        id: 'ID',
        phone: 'Phone',
        user: 'user',
        users: 'users',
        filtered: 'filtered',

        // Messages
        noUsersFound: 'No users found.',
        noUsersFoundSearch: 'No users found matching your search.',
        userNotFound: 'User not found.',

        // Form titles
        createNewUser: 'Create New User',
        editUser: 'Edit User',
        addNewUserDesc: 'Add a new user to the system',
        modifyUserDesc: 'Modify existing user details',

        // Form fields - English names
        firstName: 'First Name',
        secondName: 'Second Name',
        thirdName: 'Third Name',
        lastName: 'Last Name',
        firstPlaceholder: 'First',
        secondPlaceholder: 'Second',
        thirdPlaceholder: 'Third',
        lastPlaceholder: 'Last',

        // Form fields - Arabic names
        firstNameAr: 'الإسم الأول',
        secondNameAr: 'الإسم الثاني',
        thirdNameAr: 'الإسم الثالث',
        lastNameAr: 'الإسم الرابع',
        firstPlaceholderAr: 'الأول',
        secondPlaceholderAr: 'الثاني',
        thirdPlaceholderAr: 'الثالث',
        lastPlaceholderAr: 'الأخير',

        // Other form fields
        emailPlaceholder: 'user@example.com',
        phoneNumber: 'Phone Number',
        phonePlaceholder: 'e.g. +1234567890',
        selectGender: 'Select gender',
        other: 'Other',
        role: 'Role',
        selectRole: 'Select role',
        password: 'Password',
        newPassword: 'New Password (leave empty to keep current)',

        // Actions and buttons
        saving: 'Saving...',
        createUser: 'Create User',
        updateUser: 'Update User',

        // Delete confirmation
        confirmDeletion: 'Confirm Deletion',
        deleteConfirmMessage: 'Are you sure you want to delete {{name}} ({{email}})? This action cannot be undone.',
        confirm: 'Confirm',

        // Success/Error messages
        userCreatedSuccessfully: 'User created successfully. The user will need to confirm their email to log in.',
        userUpdatedSuccessfully: 'User updated successfully.',
        userDeletedSuccessfully: 'User deleted successfully.',
        failedToCreateUser: 'Failed to create user profile. Please try again.',
        failedToUpdateUser: 'Failed to update user. Please try again.',
        failedToDeleteUser: 'Failed to delete user from database.',
        cannotDeleteUserWithAppointments: 'Cannot delete user with existing appointments. Please delete their appointments first.',
        unexpectedError: 'An unexpected error occurred. Please try again.',

        // Activity log messages
        userCreated: 'User Created',
        userUpdated: 'User Updated',
        userDeleted: 'User Deleted',
    },
    home: {
        reminder: 'Reminder',
        reservationRequired: 'Please make a reservation before visiting our clinic',
        bookNow: 'Book Now',
        userCreation: 'User Creation',
        patientInformation: 'Patient Information',
        weight: 'Weight',
        height: 'Height',
        bloodType: 'Blood Type',
        commonDiseases: 'Common Diseases',
        medicinesTitle: 'Medicines',
        patientLogs: 'Patient Activity Logs',
        information: 'Information',
        patientInfoUpdated: 'Patient information updated at',
        noActivityLogs: 'No activity logs yet',
        diseases: {
            highBloodPressure: 'High Blood Pressure',
            diabetes: 'Diabetes',
            cholesterolHDL: 'Cholesterol HDL',
            cholesterolLDL: 'Cholesterol LDL',
            kidney: 'Kidney Disease',
            cancer: 'Cancer',
            heartDisease: 'Heart Disease',
            asthma: 'Asthma',
            alzheimer: 'Alzheimer/Dementia',
            arthritis: 'Arthritis'
        },
        medicineCategories: {
            painRelief: 'Pain Relief',
            flu: 'Flu Treatment',
            allergy: 'Allergy Treatment',
            antibiotics: 'Antibiotics'
        },
        medicinesList: {
            paracetamol: 'Paracetamol',
            ibuprofen: 'Ibuprofen',
            oseltamivir: 'Oseltamivir',
            zanamivir: 'Zanamivir',
            loratadine: 'Loratadine',
            cetirizine: 'Cetirizine',
            amoxicillin: 'Amoxicillin',
            azithromycin: 'Azithromycin'
        }
    },
    header: {
        bethlehem: 'Bethlehem',
        medCenter: 'Med Center',
        toggleMenu: 'Toggle Menu',
        closeMenu: 'Close Menu'
    },
    roles: {
        admin: 'Administrator',
        doctor: 'Doctor',
        secretary: 'Secretary',
        nurse: 'Nurse',
        lab: 'Laboratory',
        xray: 'X-Ray Technician',
        patient: 'Patient'
    },
    aboutUs: {
        title: 'About Our Clinic',
        subtitle: 'Dedicated to providing exceptional healthcare services with compassion and expertise.',
        ourStory: 'Our Story',
        ourStoryContent1: 'Founded in 2010, our clinic has been serving the community with top-quality healthcare services. We started with a small team of dedicated professionals and have grown into a comprehensive healthcare facility with multiple specialties.',
        ourStoryContent2: 'Our mission is to provide personalized, compassionate care to every patient who walks through our doors.',
        ourTeam: 'Our Team',
        email: 'Email',
        phone: 'Phone',
        chiefMedicalOfficer: 'Chief Medical Officer',
        seniorPhysician: 'Senior Physician',
        headNurse: 'Head Nurse',
        drSarahJohnson: 'Dr. Sarah Johnson',
        drSarahDesc: 'With over 15 years of experience, Dr. Johnson leads our team with expertise and compassion.',
        drMichaelChen: 'Dr. Michael Chen',
        drMichaelDesc: 'Specializing in internal medicine, Dr. Chen is known for his thorough approach to patient care.',
        nurseEmily: 'Nurse Emily Rodriguez',
        nurseEmilyDesc: 'Our nursing team lead with a focus on patient comfort and wellbeing.',
        ourFacility: 'Our Facility',
        facilityIntro: 'Our state-of-the-art facility includes:',
        facilityFeatures: {
            examRooms: 'Modern examination rooms',
            labServices: 'On-site laboratory services',
            imagingCenter: 'Digital imaging center',
            waitingAreas: 'Comfortable waiting areas',
            accessibility: 'Wheelchair accessible facilities'
        },
        getInTouch: 'Get In Touch',
        location: 'Location',
        hoursOfOperation: 'Hours of Operation',
        mondayFriday: 'Monday - Friday: 8:00 AM - 6:00 PM',
        saturday: 'Saturday: 9:00 AM - 2:00 PM',
        sunday: 'Sunday: Closed',
        sendMessage: 'Send Us a Message',
        subject: 'Subject',
        message: 'Message',
        sendMessageBtn: 'Send Message',
        thankYouMessage: 'Thank you for your message! We\'ll get back to you soon.',
        contactEmail: 'contact@bethlehemmedcenter.com',
        contactPhone: '(02) 274-2345'
    }
};

// Arabic translations
const arTranslations = {
    common: {
        welcome: 'مرحبًا بكم في مركز بيت لحم الطبي',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        backToLogin: 'العودة لتسجيل الدخول',
        submit: 'إرسال',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        search: 'بحث',
        filter: 'تصفية',
        name: 'الاسم',
        address: 'العنوان',
        language: 'اللغة',
        english: 'الإنجليزية',
        arabic: 'العربية',
        darkMode: 'الوضع الداكن',
        lightMode: 'الوضع الفاتح',
        loading: 'جارٍ التحميل...',
        clinicName: 'مركز بيت لحم الطبي',
        error: 'خطأ',
        success: 'نجح',
        warning: 'تحذير',
        refresh: 'تحديث',
        status: 'الحالة',
        active: 'نشط',
        inactive: 'غير نشط',
        available: 'متاح',
        unavailable: 'غير متاح',
        price: 'السعر',
        description: 'الوصف',
        category: 'الفئة',
        specialty: 'التخصص',
        date: 'التاريخ',
        time: 'الوقت',
        actions: 'الإجراءات',
        view: 'عرض',
        details: 'التفاصيل',
        total: 'المجموع',
        count: 'العدد',
        revenue: 'الإيرادات',
    },
    auth: {
        welcomeBack: 'مرحبًا بعودتك',
        enterCredentials: 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك',
        dontHaveAccount: 'ليس لديك حساب؟',
        alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
        createAccount: 'إنشاء حساب',
        registerAsPatient: 'سجل كمريض للوصول إلى خدماتنا',
        resetPasswordTitle: 'نسيت كلمة المرور',
        resetPasswordDesc: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور',
        sendResetLink: 'إرسال رابط إعادة التعيين',
        checkEmail: 'تحقق من بريدك الإلكتروني',
        resetEmailSent: 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
        didntReceiveEmail: 'لم تستلم بريدًا إلكترونيًا؟ تحقق من مجلد البريد العشوائي أو حاول مرة أخرى.',
        tryAgain: 'حاول مرة أخرى',
        createNewPassword: 'إنشاء كلمة مرور جديدة',
        missingCredentials: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور',
        invalidEmail: 'الرجاء إدخال بريد إلكتروني صالح',
        adminLogin: 'تسجيل دخول المسؤول',
        secureAdminAccess: 'وصول آمن لمسؤولي العيادة فقط',
        signInAsAdmin: 'تسجيل الدخول كمسؤول',
        firstNameEn: 'الاسم الأول (بالإنجليزية)',
        secondNameEn: 'الاسم الثاني (بالإنجليزية)',
        thirdNameEn: 'الاسم الثالث (بالإنجليزية)',
        lastNameEn: 'الاسم الأخير (بالإنجليزية)',
        firstNameAr: 'الاسم الأول',
        secondNameAr: 'الاسم الثاني',
        thirdNameAr: 'الاسم الثالث',
        lastNameAr: 'الاسم الأخير',
        idNumber: 'رقم الهوية',
        yourIDNumber: 'رقم الهوية الخاص بك',
        dateOfBirth: 'تاريخ الميلاد',
        gender: 'الجنس',
        male: 'ذكر',
        female: 'أنثى',
        invalidPhone: 'رقم هاتف غير صالح',
        phoneNumbersOnly: 'الرجاء إدخال أرقام فقط',
        weakPassword: 'كلمة مرور ضعيفة',
        passwordLength: 'يجب أن تكون كلمة المرور على الأقل 6 أحرف',
        missingNameInfo: 'معلومات الاسم ناقصة',
        fillRequiredNames: 'يرجى ملء الاسم الأول والأخير على الأقل باللغتين',
        missingInfo: 'معلومات ناقصة',
        fillRequiredFields: 'يرجى ملء جميع الحقول المطلوبة',
        invalidID: 'رقم هوية غير صالح',
        validIDRequired: 'الرجاء إدخال رقم هوية فلسطينية صالح مكون من 9 أرقام',
        passwordMismatch: 'كلمات المرور غير متطابقة',
        passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
        registrationNote: 'ملاحظة التسجيل',
        profileSetupAdmin: 'تم إنشاء المستخدم، ولكن إعداد الملف الشخصي يتطلب إجراء المسؤول.',
        registrationSuccess: 'تم التسجيل بنجاح',
        welcomeToClinic: 'مرحبًا بك في بوابة العيادة!',
        registrationFailed: 'فشل التسجيل',
    },
    navbar: {
        home: 'الرئيسية',
        clinics: 'العيادات',
        aboutUs: 'من نحن',
        labs: 'المختبرات',
        xray: 'الأشعة',
        adminDashboard: 'لوحة تحكم المسؤول',
    },
    footer: {
        rights: 'جميع الحقوق محفوظة',
        privacyPolicy: 'سياسة الخصوصية',
        termsOfUse: 'شروط الاستخدام',
        contactUs: 'اتصل بنا',
        quickLinks: 'روابط سريعة',
        clinicDescription: 'نقدم خدمات الرعاية الصحية عالية الجودة منذ عام 2025',
        address: 'شارع وادي مسلم - مبنى نجيب ناصر',
        city: 'بيت لحم، فلسطين',
    },
    admin: {
        // Main Dashboard
        title: 'لوحة تحكم المسؤول',
        authenticating: 'جارٍ المصادقة...',
        loadingDashboard: 'جارٍ تحميل لوحة تحكم المسؤول...',
        reloadPage: 'إعادة تحميل الصفحة',
        returnToHome: 'العودة للرئيسية',

        // Tabs
        overview: 'نظرة عامة',
        users: 'المستخدمون',
        clinics: 'العيادات',
        doctors: 'الأطباء',
        appointments: 'المواعيد',
        settings: 'الإعدادات',

        // Overview Tab - Stats Cards
        totalUsers: 'إجمالي المستخدمين',
        activeAppointments: 'المواعيد النشطة',
        availableClinics: 'العيادات المتاحة',
        systemStatus: 'حالة النظام',
        checkingStatus: 'جارٍ فحص الحالة...',
        systemIssueDetected: 'تم اكتشاف مشكلة في النظام',
        allSystemsOperational: 'جميع الأنظمة تعمل بشكل طبيعي',
        lastChecked: 'آخر فحص',

        // Overview Tab - Charts
        userDistributionByRole: 'توزيع المستخدمين حسب الدور',
        pie: 'دائري',
        bar: 'أعمدة',
        numberOfUsers: 'عدد المستخدمين',
        userRole: 'دور المستخدم',

        // Overview Tab - Role Breakdown
        patients: 'المرضى',
        secretaries: 'السكرتاريات',
        nurses: 'الممرضات',
        administrators: 'المديرون',
        labTechnicians: 'فنيو المختبر',
        xrayTechnicians: 'فنيو الأشعة',

        // Overview Tab - Performance Summary
        performanceSummary: 'ملخص الأداء',
        totalRevenue: 'إجمالي الإيرادات',
        appointmentCompletionRate: 'معدل إنجاز المواعيد',
        doctorUtilization: 'استخدام الأطباء',

        // Overview Tab - Quick Actions
        quickActions: 'الإجراءات السريعة',
        addUser: 'إضافة مستخدم',
        viewAppointments: 'عرض المواعيد',
        manageClinics: 'إدارة العيادات',
        refreshData: 'تحديث البيانات',

        // System Status Messages
        systemIssues: 'تواجه بعض الأنظمة مشاكل.',
        checkSystemStatus: 'فحص حالة النظام',
        refreshReportData: 'تحديث بيانات التقرير',
        reportDataRefreshed: 'تم تحديث بيانات التقرير.',
        failedToRefreshReportData: 'فشل في تحديث بيانات التقرير.',

        // Statistics
        totalDoctors: 'إجمالي الأطباء',
        totalAppointments: 'إجمالي المواعيد',
        appointmentsByClinic: 'المواعيد حسب العيادة',
        appointmentsByDoctor: 'المواعيد حسب الطبيب',
        revenueByClinic: 'الإيرادات حسب العيادة',
        usersByRole: 'المستخدمون حسب الدور',
        recentActivity: 'النشاط الأخير',

        // Activity Log
        activityLog: 'سجل النشاط',
        action: 'الإجراء',
        user: 'المستخدم',
        timestamp: 'الوقت',
        noRecentActivity: 'لا يوجد نشاط حديث',

        // Error Messages
        errorLoadingUsers: 'فشل في تحميل المستخدمين من قاعدة البيانات.',
        errorLoadingClinics: 'خطأ في تحميل العيادات. قد تكون بعض ميزات لوحة التحكم محدودة.',
        errorLoadingDashboard: 'حدث خطأ في تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.',
        failedToLoadUsers: 'فشل في تحميل قائمة المستخدمين.',
        someReportDataUnavailable: 'لا يمكن تحميل بعض بيانات التقرير. عرض البيانات الجزئية.',
        errorCheckingSystemStatus: 'فشل في فحص حالة النظام.',

        // Loading States
        loadingUsers: 'جارٍ تحميل المستخدمين مع التحديث القسري...',
        loadingClinics: 'جارٍ تحميل العيادات...',
        loadingDoctors: 'جارٍ تحميل الأطباء...',
        loadingAppointments: 'جارٍ تحميل المواعيد...',
        loadingActivityLog: 'جارٍ تحميل سجل النشاط...',
        loadingSystemSettings: 'جارٍ تحميل إعدادات النظام...',
        generatingReportData: 'جارٍ إنشاء بيانات التقرير...',

        // Success Messages
        usersLoaded: 'تم تحميل المستخدمين',
        clinicsLoaded: 'تم تحميل العيادات',
        doctorsLoaded: 'تم تحميل الأطباء',
        appointmentsLoaded: 'تم تحميل المواعيد',
        activityLogsLoaded: 'تم تحميل سجلات النشاط',
        systemSettingsLoaded: 'تم تحميل إعدادات النظام',
        reportDataGenerated: 'تم إنشاء بيانات التقرير',
        dashboardInitializationComplete: 'اكتمل تهيئة لوحة التحكم',

        // Statuses
        scheduled: 'مجدول',
        completed: 'مكتمل',
        cancelled: 'ملغى',
        pending: 'في الانتظار',
        paid: 'مدفوع',
        refunded: 'مسترد',
        failed: 'فشل',

        // Search and Filter
        searchUsers: 'البحث في المستخدمين...',
        searchByEmail: 'البحث بالبريد الإلكتروني أو الاسم أو الدور',
        filterUsers: 'تصفية المستخدمين',
        noUsersFound: 'لم يتم العثور على مستخدمين يطابقون بحثك.',

        // Quick Actions
        viewUsers: 'عرض المستخدمين',
        manageDoctors: 'إدارة الأطباء',
        systemSettings: 'إعدادات النظام',
    },
    usersManagement: {
        // Main titles and descriptions
        title: 'إدارة المستخدمين',
        description: 'إدارة جميع حسابات المستخدمين لبوابة العيادة',

        // Search and actions
        searchPlaceholder: 'البحث في المستخدمين...',
        addUser: 'إضافة مستخدم',
        loadingUsers: 'جارٍ تحميل المستخدمين...',

        // User info labels
        id: 'الهوية',
        phone: 'الهاتف',
        user: 'مستخدم',
        users: 'مستخدمين',
        filtered: 'مفلتر',

        // Messages
        noUsersFound: 'لم يتم العثور على مستخدمين.',
        noUsersFoundSearch: 'لم يتم العثور على مستخدمين يطابقون بحثك.',
        userNotFound: 'لم يتم العثور على المستخدم.',

        // Form titles
        createNewUser: 'إنشاء مستخدم جديد',
        editUser: 'تعديل المستخدم',
        addNewUserDesc: 'إضافة مستخدم جديد للنظام',
        modifyUserDesc: 'تعديل تفاصيل المستخدم الحالي',
        // Form fields - Arabic label + "الإنجليزي"
        firstName: '(الاسم الأول (الإنجليزية',
        secondName: 'الاسم الثاني (الإنجليزية)',
        thirdName: 'الاسم الثالث (الإنجليزية)',
        lastName: 'الاسم الأخير (الإنجليزية)',

        firstPlaceholder: 'الأول',
        secondPlaceholder: 'الثاني',
        thirdPlaceholder: 'الثالث',
        lastPlaceholder: 'الأخير',

        // Form fields - Arabic names
        firstNameAr: 'الإسم الأول',
        secondNameAr: 'الإسم الثاني',
        thirdNameAr: 'الإسم الثالث',
        lastNameAr: 'الإسم الرابع',
        firstPlaceholderAr: 'الأول',
        secondPlaceholderAr: 'الثاني',
        thirdPlaceholderAr: 'الثالث',
        lastPlaceholderAr: 'الأخير',

        // Other form fields
        emailPlaceholder: 'user@example.com',
        phoneNumber: 'رقم الهاتف',
        phonePlaceholder: 'مثال: +1234567890',
        selectGender: 'اختر الجنس',
        other: 'آخر',
        role: 'الدور',
        selectRole: 'اختر الدور',
        password: 'كلمة المرور',
        newPassword: 'كلمة مرور جديدة (اتركها فارغة للاحتفاظ بالحالية)',

        // Actions and buttons
        saving: 'جارٍ الحفظ...',
        createUser: 'إنشاء مستخدم',
        updateUser: 'تحديث المستخدم',

        // Delete confirmation
        confirmDeletion: 'تأكيد الحذف',
        deleteConfirmMessage: 'هل أنت متأكد من حذف {{name}} ({{email}})؟ هذا الإجراء لا يمكن التراجع عنه.',
        confirm: 'تأكيد',

        // Success/Error messages
        userCreatedSuccessfully: 'تم إنشاء المستخدم بنجاح. سيحتاج المستخدم لتأكيد بريده الإلكتروني لتسجيل الدخول.',
        userUpdatedSuccessfully: 'تم تحديث المستخدم بنجاح.',
        userDeletedSuccessfully: 'تم حذف المستخدم بنجاح.',
        failedToCreateUser: 'فشل في إنشاء ملف المستخدم. يرجى المحاولة مرة أخرى.',
        failedToUpdateUser: 'فشل في تحديث المستخدم. يرجى المحاولة مرة أخرى.',
        failedToDeleteUser: 'فشل في حذف المستخدم من قاعدة البيانات.',
        cannotDeleteUserWithAppointments: 'لا يمكن حذف مستخدم لديه مواعيد موجودة. يرجى حذف مواعيده أولاً.',
        unexpectedError: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',

        // Activity log messages
        userCreated: 'تم إنشاء مستخدم',
        userUpdated: 'تم تحديث مستخدم',
        userDeleted: 'تم حذف مستخدم',
    },
    home: {
        reminder: 'تذكير',
        reservationRequired: 'يرجى حجز موعد قبل زيارة عيادتنا',
        bookNow: 'احجز الآن',
        userCreation: 'إنشاء مستخدم',
        patientInformation: 'معلومات المريض',
        weight: 'الوزن',
        height: 'الطول',
        bloodType: 'فصيلة الدم',
        commonDiseases: 'الأمراض الشائعة',
        medicinesTitle: 'الأدوية',
        patientLogs: 'سجل نشاط المريض',
        information: 'المعلومات',
        patientInfoUpdated: 'تم تحديث معلومات المريض في',
        noActivityLogs: 'لا توجد سجلات نشاط حتى الآن',
        diseases: {
            highBloodPressure: 'ضغط الدم المرتفع',
            diabetes: 'السكري',
            cholesterolHDL: 'الكوليسترول HDL',
            cholesterolLDL: 'الكوليسترول LDL',
            kidney: 'أمراض الكلى',
            cancer: 'السرطان',
            heartDisease: 'أمراض القلب',
            asthma: 'الربو',
            alzheimer: 'الزهايمر/الخرف',
            arthritis: 'التهاب المفاصل'
        },
        medicineCategories: {
            painRelief: 'مسكنات الألم',
            flu: 'علاج الإنفلونزا',
            allergy: 'علاج الحساسية',
            antibiotics: 'المضادات الحيوية'
        },
        medicinesList: {
            paracetamol: 'باراسيتامول',
            ibuprofen: 'إيبوبروفين',
            oseltamivir: 'أوسيلتاميفير',
            zanamivir: 'زاناميفير',
            loratadine: 'لوراتادين',
            cetirizine: 'سيتيريزين',
            amoxicillin: 'أموكسيسيلين',
            azithromycin: 'أزيثروميسين'
        }
    },
    header: {
        bethlehem: 'بيت لحم',
        medCenter: 'المركز الطبي',
        toggleMenu: 'فتح القائمة',
        closeMenu: 'إغلاق القائمة'
    },
    roles: {
        admin: 'مدير',
        doctor: 'طبيب',
        secretary: 'سكرتير',
        nurse: 'ممرض',
        lab: 'مختبر',
        xray: 'فني أشعة',
        patient: 'مريض'
    },
    aboutUs: {
        title: 'عن عيادتنا',
        subtitle: 'ملتزمون بتقديم خدمات رعاية صحية استثنائية بالرحمة والخبرة.',
        ourStory: 'قصتنا',
        ourStoryContent1: 'تأسست عيادتنا في عام 2010، وقد خدمت المجتمع بخدمات رعاية صحية عالية الجودة. بدأنا بفريق صغير من المحترفين المتفانين ونمونا لنصبح مرفقًا شاملاً للرعاية الصحية مع تخصصات متعددة.',
        ourStoryContent2: 'مهمتنا هي تقديم رعاية شخصية ورحيمة لكل مريض يدخل من أبوابنا.',
        ourTeam: 'فريقنا',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        chiefMedicalOfficer: 'كبير الأطباء',
        seniorPhysician: 'طبيب أول',
        headNurse: 'رئيس التمريض',
        drSarahJohnson: 'د. سارة جونسون',
        drSarahDesc: 'بخبرة تزيد عن 15 عامًا، تقود د. جونسون فريقنا بالخبرة والرحمة.',
        drMichaelChen: 'د. مايكل تشين',
        drMichaelDesc: 'متخصص في الطب الباطني، د. تشين معروف بنهجه الشامل في رعاية المرضى.',
        nurseEmily: 'الممرضة إيميلي رودريغيز',
        nurseEmilyDesc: 'قائدة فريق التمريض مع التركيز على راحة المرضى ورفاهيتهم.',
        ourFacility: 'مرافقنا',
        facilityIntro: 'تشمل مرافقنا الحديثة:',
        facilityFeatures: {
            examRooms: 'غرف فحص حديثة',
            labServices: 'خدمات مختبرية داخلية',
            imagingCenter: 'مركز تصوير رقمي',
            waitingAreas: 'مناطق انتظار مريحة',
            accessibility: 'مرافق يمكن الوصول إليها بالكرسي المتحرك'
        },
        getInTouch: 'تواصل معنا',
        location: 'الموقع',
        hoursOfOperation: 'ساعات العمل',
        mondayFriday: 'الاثنين - الجمعة: 8:00 صباحًا - 6:00 مساءً',
        saturday: 'السبت: 9:00 صباحًا - 2:00 مساءً',
        sunday: 'الأحد: مغلق',
        sendMessage: 'أرسل لنا رسالة',
        subject: 'الموضوع',
        message: 'الرسالة',
        sendMessageBtn: 'إرسال الرسالة',
        thankYouMessage: 'شكرًا لك على رسالتك! سنعاود الاتصال بك قريبًا.',
        contactEmail: 'contact@bethlehemmedcenter.com',
        contactPhone: '(02) 274-2345'
    }
};

// Initialize i18next
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            ar: {
                translation: arTranslations
            }
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false, // not needed for React
        },
        react: {
            useSuspense: false,
        }
    });

export default i18n;