// Complete fixed i18n.ts file with Admin Dashboard and Doctor Management translations
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
        enterCredentials2: 'Enter your credentials to access your account',
        enterCredentials: 'name@example.com',
        dontHaveAccount: 'Don\'t have an account?',
        alreadyHaveAccount: 'Already have an account?',
        createAccount: 'Create Account',
        registerAsPatient: 'Register  to access our services',
        resetPasswordTitle: 'Forgot Password',
        resetPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password',
        checkEmailTitle: 'Check Your Email',
        checkEmailDesc: 'We\'ve sent a password reset link to',
        backToLogin: 'Back to Login',
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
        yourIDNumber: ' ID Number',
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
        invalidInput: "Invalid Input",
        englishNamesOnly: "English names can only contain English letters",
        arabicNamesOnly: "Arabic names can only contain Arabic letters",
        idNumbersOnly: "ID number can only contain numbers",
        strongPasswordRequired: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        palestinianPhoneFormat: "Phone number must be +970 followed by 9 digits",
        ageTooYoung: "Age Too Young",
        mustBe16OrOlder: "You must be at least 16 years old to register",
        invalidAge: "Invalid Age",
        invalidDateOfBirth: "Please enter a valid date of birth",
        palestinianIdFormat: "Palestinian ID must be exactly 9 digits",
        englishLettersOnly: "English names can only contain English letters",
        arabicLettersOnly: "Arabic names can only contain Arabic letters"
    },
    clinics: {
        // Page title and alerts
        title: 'Clinics',
        importantNotice: 'Important:',
        reservationRequired: 'Reservations are required for all clinic visits. Please book your appointment in advance',

        // Category selection
        allClinics: 'All Clinics',

        // Clinic cards
        availableDoctor: 'available doctor',
        availableDoctors: 'available doctors',
        noClinicsFound: 'No clinics found for this category',

        // Clinic details modal
        clinicDetails: 'Clinic Details',
        close: '✕',
        noDoctorsAvailable: 'No doctors available at this clinic.',

        // Doctor information
        fee: 'Fee',
        availableHours: 'Available Hours:',
        noAvailabilitySet: 'No availability set for this doctor.',

        // Booking actions
        cancel: 'Cancel',
        bookAppointmentNow: 'Book Appointment Now',

        // Loading and errors
        loading: 'Loading clinics...',
        errorTitle: 'Error',
        errorDescription: 'Failed to load clinics. Please try again later.',

        // Days of the week
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    },
    navbar: {
        home: 'Home',
        clinics: 'Clinics',
        aboutUs: 'About Us',
        labs: 'Labs',
        xray: 'X-Ray',
        adminDashboard: 'Admin Dashboard',
        secretaryDashboard: 'Secretary Dashboard',
        doctorLabs: 'Lab Results',
        doctorXRay: 'X-Ray Images',
    },
    doctorPages: {
        // Lab Results Page
        labResults: 'Laboratory Results',
        labResultsDesc: 'View and manage patient lab test results',
        viewLabResults: 'View Lab Results',
        downloadReport: 'Download Report',
        labTestDetails: 'Lab Test Details',
        patientInformation: 'Patient Information',
        testInformation: 'Test Information',
        testResults: 'Test Results',
        doctorsNotes: 'Doctor\'s Notes',
        labTechnician: 'Lab Technician',
        searchPatientsTests: 'Search for a patient...',
        allTestTypes: 'All Test Types',
        bloodTests: 'Blood Tests',
        urineTests: 'Urine Tests',
        lipidProfile: 'Lipid Profile',
        diabetesPanel: 'Diabetes Panel',
        resultsFound: 'results found',
        noLabResultsFound: 'No lab results found matching your criteria.',
        loadingLabResults: 'Loading lab results...',

        // X-Ray Images Page
        xrayImages: 'X-Ray Images',
        xrayImagesDesc: 'View and analyze patient X-ray images',
        viewImage: 'View',
        downloadImage: 'Download',
        xrayDetails: 'X-Ray Details',
        examInformation: 'Exam Information',
        clinicalIndication: 'Clinical Indication',
        findings: 'Findings',
        impression: 'Impression',
        bodyPart: 'Body Part',
        radiologist: 'Radiologist',
        searchPatientsXray: 'Search for a patient...',
        allBodyParts: 'All Body Parts',
        chest: 'Chest',
        knee: 'Knee',
        spine: 'Spine',
        hand: 'Hand',
        foot: 'Foot',
        skull: 'Skull',
        imagesFound: 'images found',
        noXrayImagesFound: 'No X-ray images found matching your criteria.',
        loadingXrayImages: 'Loading X-ray images...',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        rotate: 'Rotate',
        normal: 'Normal',
        abnormal: 'Abnormal',
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

    "xray": {
        // Page titles and descriptions
        "pageTitle": "X-Ray Image Upload System",
        "pageDescription": "Securely upload and manage medical X-ray images",
        "title": "X-Ray Image Upload",
        "uploadXrayImage": "Upload X-Ray Image",

        // Patient Information
        "patientInformation": "Patient Information",
        "patientName": "Patient Name",
        "patientNamePlaceholder": "Enter patient name",
        "patientId": "Patient ID",
        "patientIdPlaceholder": "Enter patient ID",
        "dateOfBirth": "Date of Birth",
        "bodyPart": "Imaged Body Part",
        "selectBodyPart": "Select body part",
        "requestingDoctor": "Requesting Doctor",
        "doctorNamePlaceholder": "Enter doctor’s name",
        "clinicalIndication": "Clinical Indication",
        "indicationPlaceholder": "Enter the reason or clinical indication for the X-ray...",

        // Body parts
        "bodyParts": {
            "chest": "Chest",
            "knee": "Knee",
            "spine": "Spine",
            "hand": "Hand",
            "foot": "Foot",
            "skull": "Skull",
            "pelvis": "Pelvis",
            "shoulder": "Shoulder",
            "elbow": "Elbow",
            "wrist": "Wrist"
        },

        // File upload
        "dragAndDrop": "Drag and drop the X-ray image here",
        "orClickToBrowse": "or click to browse files",
        "supportedFormats": "Supported formats: JPEG, PNG, TIFF, PDF, DICOM (Max 50MB)",
        "fileSelected": "File selected",
        "mb": "MB",
        "removeFile": "Remove file",
        "fileRemoved": "File removed",

        // Validation and error messages
        "invalidFileType": "Please select a valid image file (JPEG, PNG, TIFF, PDF, or DICOM)",
        "fileTooLarge": "File size must be less than 50MB",
        "fillRequiredFields": "Please fill in all required fields and upload an image",
        "uploadError": "An error occurred while uploading the X-ray image. Please try again.",

        // Success messages
        "saveXray": "Save X-Ray",
        "saveXrayRecord": "Save X-Ray Record",
        "saveSuccess": "X-ray image saved successfully!",
        "uploadSuccess": "X-ray image uploaded successfully",

        // Upload progress
        "uploading": "Uploading...",
        "uploadingXray": "Uploading X-ray image...",
        "processing": "Processing...",

        // Security notice
        "securityNotice": "🔒 All uploaded files are encrypted and comply with medical data protection standards"
    },


    admin: {
        // Main Dashboard
        title: 'Admin Dashboard',
        authenticating: 'Authenticating...',
        loadingDashboard: 'Loading Admin Dashboard...',
        reloadPage: 'Reload Page',
        returnToHome: 'Return to Home',

        patientHealth: "Patient Health",

        // Add these lines to the existing admin section
        secretaryDashboard: 'Secretary Dashboard',
        dashboard: 'Dashboard',
        accessDenied: 'Access denied. You do not have permission to view this page.',
        noPermissionForTab: 'You do not have permission to access this section.',
        noAccessibleSections: 'No Accessible Sections',
        contactAdministrator: 'Please contact your administrator for access permissions.',
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
    labs: {
        title: 'Laboratory Test Results',
        saveSuccess: 'Lab results have been saved successfully!',
        labTestInformation: 'Lab Test Information',
        patientName: 'Patient Name',
        patientNamePlaceholder: 'Enter patient full name',
        patientId: 'Patient ID',
        patientIdPlaceholder: 'Enter patient ID number',
        dateOfBirth: 'Date of Birth',
        testDate: 'Test Date',
        testType: 'Test Type',
        testTypePlaceholder: 'e.g., Blood Test, Urinalysis, etc.',
        testResults: 'Test Results',
        testResultsPlaceholder: 'Enter detailed test results here',
        doctorNotes: "Doctor's Notes",
        doctorNotesPlaceholder: 'Additional notes or recommendations',
        saveLabResults: 'Save Lab Results'
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

        validationErrors: "Validation Errors",
        englishFirstNameInvalid: "First name must contain only English letters and spaces.",
        englishSecondNameInvalid: "Second name must contain only English letters and spaces.",
        englishThirdNameInvalid: "Third name must contain only English letters and spaces.",
        englishLastNameInvalid: "Last name must contain only English letters and spaces.",
        arabicFirstNameInvalid: "Arabic first name must contain only Arabic letters and spaces.",
        arabicSecondNameInvalid: "Arabic second name must contain only Arabic letters and spaces.",
        arabicThirdNameInvalid: "Arabic third name must contain only Arabic letters and spaces.",
        arabicLastNameInvalid: "Arabic last name must contain only Arabic letters and spaces.",
        palestinianIdInvalid: "ID number must be exactly 9 digits.",
        palestinianPhoneInvalid: "Phone number must start with +970 followed by 9 digits.",
        ageMinimum: "User must be at least 16 years old."
    },
    clinicManagement: {
        // Main titles
        title: 'Clinic Management',
        clinicsManagement: 'Clinics Management',
        clinicCategories: 'Clinic Categories',

        // Descriptions
        description: 'Manage all clinic departments',
        categoriesDescription: 'Manage clinic specialties and categories',

        // Search and actions
        searchClinics: 'Search clinics...',
        searchPlaceholder: 'Search clinics...',
        addClinic: 'Add Clinic',
        addCategory: 'Add Category',

        // Tabs
        clinics: 'Clinics',
        categories: 'Categories',

        // Form titles
        createNewClinic: 'Create New Clinic',
        editClinic: 'Edit Clinic',
        createNewCategory: 'Create New Category',
        editCategory: 'Edit Category',

        // Form descriptions
        addNewClinicDesc: 'Add a new clinic department',
        modifyClinicDesc: 'Modify existing clinic details',
        addNewCategoryDesc: 'Add a new clinic category',
        modifyCategoryDesc: 'Modify existing category details',

        // Form fields
        clinicName: 'Clinic Name',
        clinicNamePlaceholder: 'e.g. Cardiology Center',
        category: 'Category',
        selectCategory: 'Select a category',
        categoryName: 'Category Name',
        categoryNamePlaceholder: 'e.g. Cardiology',
        descriptionPlaceholder: 'Describe this clinic\'s services and specialties',
        activeStatus: 'Active Status',

        // Status messages
        clinicActive: 'This clinic is visible and accepting appointments',
        clinicInactive: 'This clinic is hidden and not accepting appointments',
        categoryActive: 'This category is active and available for selection',
        categoryInactive: 'This category is inactive and hidden from selection',

        // Buttons
        createClinic: 'Create Clinic',
        updateClinic: 'Update Clinic',
        createCategory: 'Create Category',
        updateCategory: 'Update Category',
        saving: 'Saving...',

        // Messages
        noClinicFound: 'No clinics found. Add a clinic to get started.',
        noClinicsFoundSearch: 'No clinics found matching your search.',
        noCategoriesFound: 'No categories found. Add a category to get started.',

        // Stats
        clinic: 'clinic',
        filtered: 'filtered',

        // Delete confirmations
        deleteClinic: 'Delete Clinic',
        deleteCategory: 'Delete Category',
        deleteDoctor: 'Delete Doctor',
        confirmDeleteClinic: 'Are you sure you want to delete this clinic? This action cannot be undone.',
        confirmDeleteCategory: 'Are you sure you want to delete this category? This action cannot be undone.',
        confirmDeleteDoctor: 'Are you sure you want to delete this doctor? This action cannot be undone.',
        deleting: 'Deleting...',

        // Success messages
        clinicCreatedSuccessfully: 'Clinic created successfully.',
        clinicUpdatedSuccessfully: 'Clinic updated successfully.',
        clinicDeletedSuccessfully: 'Clinic deleted successfully.',
        categoryCreatedSuccessfully: 'Category created successfully.',
        categoryUpdatedSuccessfully: 'Category updated successfully.',
        categoryDeletedSuccessfully: 'Category deleted successfully.',
        doctorDeletedSuccessfully: 'Doctor deleted successfully.',

        // Error messages
        clinicNameRequired: 'Clinic name is required.',
        categoryRequired: 'Please select a category.',
        categoryNotFound: 'Selected category not found. Please select a valid category.',
        categoryNameRequired: 'Category name is required.',
        failedToSaveClinic: 'Failed to save clinic. Please try again.',
        failedToUpdateClinic: 'Failed to update clinic. Please try again.',
        failedToDeleteClinic: 'Failed to delete clinic. Please try again.',
        failedToSaveCategory: 'Failed to save category. Please try again.',
        failedToDeleteCategory: 'Failed to delete category. Please try again.',
        failedToDeleteDoctor: 'Failed to delete doctor. Please try again.',

        // Constraint errors
        cannotDeleteClinicWithDoctors: 'This clinic has {{count}} doctor(s) assigned to it. Please remove the doctors first.',
        cannotDeleteCategoryWithClinics: 'This category is used by the following clinic(s): {{clinics}}. Please reassign those clinics first.',
        cannotDelete: 'Cannot Delete',

        // No categories warning
        noCategoriesAvailable: 'No Categories Available',
        categoriesRequiredMessage: 'Categories must be created before you can add clinics.',
        createCategoryNow: 'Create Category Now',

        // Loading states
        loadingClinics: 'Loading clinics...',
        loadingCategories: 'Loading categories...',
        loadingDoctors: 'Loading doctors...',

        // Database errors
        databaseError: 'Database error: ',
        unexpectedError: 'An unexpected error occurred. Please try again.',
    },
    doctorManagement: {
        // Main titles
        title: 'Doctor Management',
        doctorsManagement: 'Doctors Management',

        // Descriptions
        description: 'Manage doctors and their clinic assignments',

        // Search and actions
        searchDoctors: 'Search doctors...',
        searchPlaceholder: 'Search doctors...',
        addDoctor: 'Add Doctor',

        // Form titles
        createNewDoctor: 'Create New Doctor',
        editDoctor: 'Edit Doctor',

        // Form descriptions
        addNewDoctorDesc: 'Add a new doctor profile',
        modifyDoctorDesc: 'Modify existing doctor details',

        // Form fields
        doctorName: 'Doctor Name',
        doctorNamePlaceholder: 'Dr. Full Name',
        specialty: 'Specialty',
        specialtyPlaceholder: 'e.g. Cardiologist',
        clinic: 'Clinic',
        selectClinic: 'Select a clinic',
        emailPlaceholder: 'doctor@example.com',
        phonePlaceholder: 'e.g. +1234567890',
        appointmentPrice: 'Appointment Price (₪)',
        pricePlaceholder: '0.00',
        availabilityStatus: 'Availability Status',

        // Status messages
        doctorAvailable: 'This doctor is available for appointments',
        doctorUnavailable: 'This doctor is not available for appointments',

        // Buttons
        createDoctor: 'Create Doctor',
        updateDoctor: 'Update Doctor',
        saving: 'Saving...',
        hours: 'Hours',

        // Messages
        noDoctorsFound: 'No doctors found. Add a doctor to get started.',
        noDoctorsFoundSearch: 'No doctors found matching your search.',
        doctorNotFound: 'Doctor not found.',
        noClinicsAvailable: 'No clinics available. Please create a clinic first.',

        // Stats
        doctor: 'doctor',
        doctors: 'doctors',
        filtered: 'filtered',

        // Delete confirmation
        confirmDeletion: 'Confirm Deletion',
        confirmDeleteDoctor: 'Are you sure you want to delete Dr. {{name}}? This action cannot be undone.',
        permanentRemoval: 'This will permanently remove the doctor and all their availability slots from the system.',
        deleting: 'Deleting...',
        deleteDoctor: 'Delete Doctor',

        // Success messages
        doctorCreatedSuccessfully: 'Doctor created successfully. Don\'t forget to set their availability.',
        doctorUpdatedSuccessfully: 'Doctor updated successfully.',
        doctorDeletedSuccessfully: 'Dr. {{name}} has been deleted successfully.',

        // Error messages
        validationError: 'Validation Error',
        fillAllFields: 'Please fill in all required fields.',
        validPrice: 'Price must be a valid number.',
        failedToSaveDoctor: 'Failed to save doctor. Please try again.',
        failedToDeleteDoctor: 'Failed to delete doctor. Please try again.',

        // Availability Management
        manageAvailability: 'Manage Doctor\'s Availability',
        setAvailableHours: 'Set the available hours for Dr. {{name}}',
        currentAvailability: 'Current Availability',
        noAvailabilitySlots: 'No availability slots defined yet.',
        addNewSlot: 'Add New Availability Slot',
        day: 'Day',
        startTime: 'Start Time',
        endTime: 'End Time',
        addTimeSlot: 'Add Time Slot',
        adding: 'Adding...',
        done: 'Done',

        // Days of the week
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',

        // Availability validation
        fillAvailabilityFields: 'Please fill in all availability fields.',
        validTimeValues: 'Please enter valid time values.',
        endTimeAfterStart: 'End time must be after start time.',

        // Availability success messages
        slotAddedSuccessfully: 'Availability slot added successfully.',
        slotRemovedSuccessfully: 'Availability slot removed successfully.',

        // Availability error messages
        failedToAddSlot: 'Failed to add availability slot. Please try again.',
        failedToDeleteSlot: 'Failed to delete availability slot. Please try again.',
        failedToLoadSlots: 'Failed to load availability slots.',

        // Loading states
        loadingDoctors: 'Loading doctors...',
        loadingClinics: 'Loading clinics...',
        loadingSlots: 'Loading availability slots...',
        phoneRequired: "Phone number is required."
    },
    forgotpassowrd: {
        // Add these to the existing auth section
        enterCredentials: 'name@example.com',
        sendingResetLink: 'Sending...',
        resetLinkSent: 'Reset Link Sent',
        resetEmailSentDesc: 'If your email exists in our system, you\'ll receive a password reset link',
        checkEmailTitle: 'Check Your Email',
        checkEmailDesc: 'We\'ve sent a password reset link to',
        didntReceiveEmail: 'Didn\'t receive an email? Check your spam folder or try again.',
        enterEmailAddress: 'Please enter your email address',
        failedToSendResetLink: 'Failed to send reset link',
        important: 'Important',
        checkSpamFolder: 'Please check your spam/junk folder if you don\'t see the email in your inbox within a few minutes.',
        willReceiveLink: 'you will receive a password reset link',
    },
    home: {
        reminder: 'Reminder',
        reservationRequired: 'Please make a reservation before visiting our clinic.',
        bookNow: 'Book Now',
        homeemail: 'name@example.com',
        userCreation: 'User Creation',
        patientInformation: 'Patient Information',
        saveInformation: 'Save Information',
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
            pain_relief: 'Pain Relief',
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
    },
    patientHealth: {
        title: 'Patient Health Management',
        searchPlaceholder: 'Search for...',
        searchPlaceholderr: 'Search patients...',

        refresh: 'Refresh',
        totalPatients: 'Total Patients',
        withHealthData: 'With Health Data',
        withConditions: 'With Conditions',
        onMedications: 'On Medications',
        patientInfo: 'Patient Information',
        healthSummary: 'Health Summary',
        recordInfo: 'Record Information',
        actions: 'Actions',
        noRecordsFound: 'No records found',
        noRecordsYet: 'No patient records yet',
        adjustSearch: 'Try adjusting your search criteria or filters',
        getStarted: 'Get started by creating a patient health record',
        loadingRecords: 'Loading patient records...',
        failedToLoad: 'Failed to load patient data',
        addPatientHealthRecord: 'Add Patient Health Record',
        editHealthRecord: 'Edit Health Record',
        patientHealthInformation: 'Patient Health Information',
        updatePatientHealthInformation: 'Update patient health records and medical information.',
        addUpdatePatientHealthInformation: 'Add or update patient health records and medical information.',
        selectPatient: 'Select Patient',
        createNewPatient: 'Create New Patient',
        patientInformation: 'Patient Information',
        changePatient: 'Change Patient',
        physicalMeasurements: 'Physical Measurements',
        weight: 'Weight (kg)',
        height: 'Height (cm)',
        bloodType: 'Blood Type',
        healthConditions: 'Health Conditions',
        medications: 'Medications',
        addMedication: 'Add Medication',
        removeMedication: 'Remove Medication',
        saving: 'Saving...',
        cancel: 'Cancel',
        saveHealthInformation: 'Save Health Information',
        updateHealthInformation: 'Update Health Information',
        createPatient: 'Create Patient',
        creating: 'Creating...',
        englishName: 'English Name',
        arabicName: 'Arabic Name',
        contactInformation: 'Contact Information',
        personalInformation: 'Personal Information',
        password: 'Password',
        leaveEmptyForAutoGeneration: 'Leave empty for auto-generation',
        first: 'First',
        second: 'Second',
        third: 'Third',
        last: 'Last',
        email: 'Email',
        phoneNumber: 'Phone Number',
        idNumber: 'ID Number',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        conditions: 'conditions',
        noHealthData: 'No Health Data',
        createdBy: 'Created by:',
        lastUpdatedBy: 'Last updated by:',
        noHealthRecordCreated: 'No health record created',
        deleteHealthRecord: 'Delete Health Record',
        confirmDeleteHealthRecord: 'Are you sure you want to delete the health record for {{name}}? This action cannot be undone.',
        confirm: 'Confirm',
        delete: 'Delete',
        patientCreated: 'Patient Created Successfully',
        patientAdded: 'Patient Added',
        patientAddedDescription: '{{name}} has been added to the system',
        formError: 'Form Error',
        firstLastNameRequired: 'First and last names in English are required',
        firstLastNameArabicRequired: 'First and last names in Arabic are required',
        invalidEmail: 'Invalid Email',
        enterValidEmail: 'Please enter a valid email address',
        invalidIdNumber: 'Invalid ID Number',
        idNumberLength: 'ID number must be at least 6 characters long',
        invalidPhoneNumber: 'Invalid Phone Number',
        phoneNumberLength: 'Phone number must be at least 8 digits long',
        dateOfBirthRequired: 'Date of Birth Required',
        enterDateOfBirth: 'Please enter date of birth',
        genderRequired: 'Gender Required',
        selectGender: 'Please select gender',
        emailExists: 'Email Already Exists',
        emailInUse: 'This email address is already in use',
        idNumberExists: 'ID Number Already Exists',
        idNumberInUse: 'This ID number is already in use',
        failedToCreatePatient: 'Failed to Create Patient',
        failedToCreateAuthAccount: 'Failed to create auth account',
        failedToCreatePatientRecord: 'Failed to create patient record',
        noDataReturned: 'No data returned from patient creation'
    },

    // Add this appointmentsManagement section to your enTranslations object in i18n.ts

    appointmentsManagement: {
        // Main titles and descriptions
        title: 'Appointments Management',
        description: 'Manage and track all patient appointments',

        // Header actions
        refresh: 'Refresh',
        export: 'Export',
        addAppointment: 'Add Appointment',

        // View modes
        listView: 'List View',
        calendarView: 'Calendar View',
        statistics: 'Statistics',

        // Search and filters
        searchAppointments: 'Search appointments...',
        resetFilters: 'Reset Filters',
        filterByStatus: 'Filter by Status',
        filterByPayment: 'Filter by Payment',
        filterByClinic: 'Filter by Clinic',
        filterByDoctor: 'Filter by Doctor',
        filterByDate: 'Filter by Date',

        // Filter options
        allStatuses: 'All Statuses',
        allPaymentStatuses: 'All Payment Statuses',
        allClinics: 'All Clinics',
        allDoctors: 'All Doctors',
        allDates: 'All Dates',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        customRange: 'Custom Range',

        // Table headers
        patient: 'Patient',
        doctor: 'Doctor',
        clinic: 'Clinic',
        dateTime: 'Date & Time',
        status: 'Status',
        payment: 'Payment',
        actions: 'Actions',

        // Statuses
        scheduled: 'Scheduled',
        completed: 'Completed',
        cancelled: 'Cancelled',
        pending: 'Pending',
        paid: 'Paid',
        refunded: 'Refunded',

        // Messages
        noAppointmentsFound: 'No appointments found. Try adjusting filters or add a new appointment.',
        noAppointmentsScheduled: 'No appointments scheduled',
        createNewAppointment: 'Create a new appointment to see it here.',

        // Pagination
        showing: 'Showing',
        to: 'to',
        of: 'of',
        appointments: 'appointments',
        page: 'Page',
        first: 'First',
        previous: 'Previous',
        next: 'Next',
        last: 'Last',
        itemsPerPage: 'Items per page:',

        // Appointment details dialog
        appointmentDetails: 'Appointment Details',
        manageAppointment: 'Manage appointment for {{patientName}}',
        selectStatus: 'Select status',
        selectPaymentStatus: 'Select payment status',
        notes: 'Notes',
        addNotes: 'Add notes about this appointment...',
        saveChanges: 'Save Changes',
        close: 'Close',

        // Create appointment dialog
        createNewAppointmentTitle: 'Create New Appointment',
        scheduleNewAppointment: 'Schedule a new appointment for a patient',

        // Form fields
        selectClinic: 'Select Clinic',
        chooseClinic: 'Choose a clinic',
        selectDoctor: 'Select Doctor',
        chooseDoctor: 'Choose a doctor',
        selectClinicFirst: 'Select a clinic first',
        selectPatient: 'Select Patient',
        searchPatients: 'Search patients by name or email...',
        noPatientsFound: 'No patients found',

        // Time selection
        selectDay: 'Select Day',
        selectTimeSlot: 'Select Time Slot',
        noAvailableSlots: 'No available time slots for this day',

        // Days of week (shortened)
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun',

        // Price and notes
        appointmentPrice: 'Appointment Price',
        basedOnDoctorRate: 'Based on the selected doctor\'s rate',
        additionalNotes: 'Additional Notes',
        specialInstructions: 'Add any special notes or instructions for this appointment...',

        // Buttons
        createAppointment: 'Create Appointment',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',

        // Warnings and errors
        noActiveClinics: 'No active clinics available. Please add clinics first.',
        noAvailableDoctors: 'No available doctors for this clinic.',
        missingInformation: 'Missing Information',
        fillRequiredFields: 'Please fill in all required fields.',

        // Success messages
        appointmentCreated: 'Appointment created successfully.',
        appointmentUpdated: 'Appointment updated successfully.',
        appointmentDeleted: 'Appointment deleted successfully.',
        statusUpdated: 'Appointment status updated to {{status}}.',
        paymentStatusUpdated: 'Payment status updated to {{status}}.',
        notesUpdated: 'Appointment notes updated successfully.',
        priceUpdated: 'Appointment price updated.',

        // Error messages
        failedToCreate: 'Failed to create appointment.',
        failedToUpdate: 'Failed to update appointment.',
        failedToDelete: 'Failed to delete appointment.',
        failedToUpdateStatus: 'Failed to update appointment status.',
        failedToUpdatePayment: 'Failed to update payment status.',
        failedToUpdateNotes: 'Failed to update appointment notes.',
        failedToUpdatePrice: 'Failed to update appointment price.',
        failedToLoad: 'Failed to load appointments.',
        failedToLoadClinics: 'Failed to load clinics.',
        failedToLoadDoctors: 'Failed to load doctors.',
        failedToLoadPatients: 'Failed to load patients.',
        failedToLoadAvailability: 'Failed to load doctor availability.',

        // Loading states
        loading: 'Loading...',
        loadingAppointments: 'Loading appointments...',
        saving: 'Saving...',
        deleting: 'Deleting...',

        // Delete confirmation
        confirmDelete: 'Are you sure you want to delete this appointment? This action cannot be undone.',

        // Export
        exportComplete: 'Export Complete',
        appointmentsExported: '{{count}} appointments exported to CSV.',
        noDataToExport: 'No Data to Export',
        noAppointmentsToExport: 'No appointments match the filters for export.',

        // Activity log
        appointmentCreatedLog: 'Appointment Created',
        appointmentStatusUpdated: 'Appointment Status Updated',
        appointmentNotesUpdated: 'Appointment Notes Updated',

        // Statistics view
        totalAppointments: 'Total Appointments',
        totalRevenue: 'Total Revenue',
        appointmentStatus: 'Appointment Status',
        paymentStatus: 'Payment Status',
        revenueByClinic: 'Revenue by Clinic',
        noDataAvailable: 'No data available',
        noRevenueData: 'No revenue data available',

        // Calendar view
        noAppointmentsCalendar: 'No appointments scheduled',
        createAppointmentToSee: 'Create a new appointment to see it here.',

        // Time formatting
        am: 'AM',
        pm: 'PM',

        // Summary cards
        summary: 'Summary',
        averagePrice: 'Average Price'
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
        unavailable: 'غير  متاح',
        price: 'السعر',
        description: 'الوصف',
        category: 'الفئة',
        specialty: 'الوصف',
        date: 'التاريخ',
        time: 'الوقت',
        actions: 'الإجراءات',
        view: 'عرض',
        details: 'التفاصيل',
        total: 'المجموع',
        count: 'العدد',
        revenue: 'الإيرادات',
    }, forgotpassowrd: {
        // Add these to the existing auth section
        enterCredentials: 'name@example.com',
        sendingResetLink: 'جارٍ الإرسال...',
        resetLinkSent: 'تم إرسال رابط إعادة التعيين',
        resetEmailSentDesc: 'إذا كان بريدك الإلكتروني موجود في نظامنا، ستستلم رابط إعادة تعيين كلمة المرور',
        checkEmailTitle: 'تحقق من بريدك الإلكتروني',
        checkEmailDesc: 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
        didntReceiveEmail: 'لم تستلم بريدًا إلكترونيًا؟ تحقق من مجلد البريد العشوائي أو حاول مرة أخرى.',
        enterEmailAddress: 'الرجاء إدخال عنوان بريدك الإلكتروني',
        failedToSendResetLink: 'فشل في إرسال رابط إعادة التعيين',
        important: 'مهم',
        checkSpamFolder: 'يرجى التحقق من مجلد البريد العشوائي إذا لم تر البريد الإلكتروني في صندوق الوارد خلال بضع دقائق.',
        willReceiveLink: 'ستتلقى رابط إعادة تعيين كلمة المرور',

    },
    patientHealth: {
        title: 'إدارة صحة المرضى',
        searchPlaceholder: '...البحث عن  ',
        searchPlaceholderr: 'البحث عن المرضى...',
        refresh: 'تحديث',
        totalPatients: 'إجمالي المرضى',
        withHealthData: 'مع بيانات صحية',
        withConditions: 'مع حالات مرضية',
        onMedications: 'يتناولون أدوية',
        patientInfo: 'معلومات المريض',
        healthSummary: 'ملخص الصحة',
        recordInfo: 'معلومات السجل',
        actions: 'الإجراءات',
        noRecordsFound: 'لم يتم العثور على سجلات',
        noRecordsYet: 'لا توجد سجلات مرضى بعد',
        adjustSearch: 'حاول تعديل معايير البحث أو الفلاتر',
        getStarted: 'ابدأ بإنشاء سجل صحة المريض',
        loadingRecords: 'جارٍ تحميل سجلات المرضى...',
        failedToLoad: 'فشل في تحميل بيانات المريض',
        addPatientHealthRecord: 'إضافة سجل صحة المريض',
        editHealthRecord: 'تعديل السجل الصحي',
        patientHealthInformation: 'معلومات صحة المريض',
        updatePatientHealthInformation: 'تحديث سجلات ومعلومات صحة المريض.',
        addUpdatePatientHealthInformation: 'إضافة أو تحديث سجلات ومعلومات صحة المريض.',
        selectPatient: 'اختر المريض',
        createNewPatient: 'إنشاء مريض جديد',
        patientInformation: 'معلومات المريض',
        changePatient: 'تغيير المريض',
        physicalMeasurements: 'القياسات البدنية',
        weight: 'الوزن (كجم)',
        height: 'الطول (سم)',
        bloodType: 'فصيلة الدم',
        healthConditions: 'الحالات الصحية',
        medications: 'الأدوية',
        addMedication: 'إضافة دواء',
        removeMedication: 'إزالة دواء',
        saving: 'جارٍ الحفظ...',
        cancel: 'إلغاء',
        saveHealthInformation: 'حفظ المعلومات الصحية',
        updateHealthInformation: 'تحديث المعلومات الصحية',
        createPatient: 'إنشاء مريض',
        creating: 'جارٍ الإنشاء...',
        englishName: 'الاسم بالإنجليزية',
        arabicName: 'الاسم بالعربية',
        contactInformation: 'معلومات الاتصال',
        personalInformation: 'المعلومات الشخصية',
        password: 'كلمة المرور',
        leaveEmptyForAutoGeneration: 'اتركه فارغاً للإنشاء التلقائي',
        first: 'الأول',
        second: 'الثاني',
        third: 'الثالث',
        last: 'الأخير',
        email: 'البريد الإلكتروني',
        phoneNumber: 'رقم الهاتف',
        idNumber: 'رقم الهوية',
        dateOfBirth: 'تاريخ الميلاد',
        gender: 'الجنس',
        male: 'ذكر',
        female: 'أنثى',
        conditions: 'حالات',
        noHealthData: 'لا توجد بيانات صحية',
        createdBy: ':تم الإنشاء بواسطة',
        lastUpdatedBy: ':آخر تحديث بواسطة',
        noHealthRecordCreated: 'لم يتم إنشاء سجل صحي',
        deleteHealthRecord: 'حذف السجل الصحي',
        confirmDeleteHealthRecord: 'هل أنت متأكد من حذف السجل الصحي لـ {{name}}؟ لا يمكن التراجع عن هذا الإجراء.',
        confirm: 'تأكيد',
        delete: 'حذف',
        patientCreated: 'تم إنشاء المريض بنجاح',
        patientAdded: 'تمت إضافة المريض',
        patientAddedDescription: 'تمت إضافة {{name}} إلى النظام',
        formError: 'خطأ في النموذج',
        firstLastNameRequired: 'الاسم الأول والأخير بالإنجليزية مطلوب',
        firstLastNameArabicRequired: 'الاسم الأول والأخير بالعربية مطلوب',
        invalidEmail: 'بريد إلكتروني غير صالح',
        enterValidEmail: 'الرجاء إدخال عنوان بريد إلكتروني صالح',
        invalidIdNumber: 'رقم هوية غير صالح',
        idNumberLength: 'يجب أن يكون رقم الهوية 6 أحرف على الأقل',
        invalidPhoneNumber: 'رقم هاتف غير صالح',
        phoneNumberLength: 'يجب أن يكون رقم الهاتف 8 أرقام على الأقل',
        dateOfBirthRequired: 'تاريخ الميلاد مطلوب',
        enterDateOfBirth: 'الرجاء إدخال تاريخ الميلاد',
        genderRequired: 'الجنس مطلوب',
        selectGender: 'الرجاء اختيار الجنس',
        emailExists: 'البريد الإلكتروني موجود بالفعل',
        emailInUse: 'عنوان البريد الإلكتروني مستخدم بالفعل',
        idNumberExists: 'رقم الهوية موجود بالفعل',
        idNumberInUse: 'رقم الهوية مستخدم بالفعل',
        failedToCreatePatient: 'فشل في إنشاء المريض',
        failedToCreateAuthAccount: 'فشل في إنشاء حساب المصادقة',
        failedToCreatePatientRecord: 'فشل في إنشاء سجل المريض',
        noDataReturned: 'لم يتم إرجاع بيانات من إنشاء المريض'
    },
    labs: {
        title: 'نتائج الفحوصات المخبرية',
        saveSuccess: 'تم حفظ نتائج المختبر بنجاح!',
        labTestInformation: 'معلومات الفحص المخبري',
        patientName: 'اسم المريض',
        patientNamePlaceholder: 'أدخل الاسم الكامل للمريض',
        patientId: 'رقم المريض',
        patientIdPlaceholder: 'أدخل رقم هوية المريض',
        dateOfBirth: 'تاريخ الميلاد',
        testDate: 'تاريخ الفحص',
        testType: 'نوع الفحص',
        testTypePlaceholder: 'مثال: فحص الدم، تحليل البول، إلخ',
        testResults: 'نتائج الفحص',
        testResultsPlaceholder: 'أدخل نتائج الفحص التفصيلية هنا',
        doctorNotes: 'ملاحظات الطبيب',
        doctorNotesPlaceholder: 'ملاحظات أو توصيات إضافية',
        saveLabResults: 'حفظ نتائج المختبر'
    },
    auth: {
        welcomeBack: 'مرحبًا بعودتك',
        enterCredentials2: 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك',
        dontHaveAccount: 'ليس لديك حساب؟',
        alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
        createAccount: 'إنشاء حساب',
        registerAsPatient: 'سجل للوصول إلى خدماتنا',
        resetPasswordTitle: 'نسيت كلمة المرور',
        resetPasswordDesc: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور',
        checkEmailTitle: 'تحقق من بريدك الإلكتروني',
        checkEmailDesc: 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
        backToLogin: 'العودة لتسجيل الدخول',
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
        firstNameEn: 'الاسم الأول (الإنجليزية)',
        secondNameEn: 'الاسم الثاني (الإنجليزية)',
        thirdNameEn: 'الاسم الثالث (الإنجليزية)',
        lastNameEn: 'الاسم الأخير (الإنجليزية)',

        firstNameAr: 'الاسم الأول',
        secondNameAr: 'الاسم الثاني',
        thirdNameAr: 'الاسم الثالث',
        lastNameAr: 'الاسم الأخير',
        idNumber: 'رقم الهوية',
        yourIDNumber: 'رقم الهوية',
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
        invalidInput: "إدخال غير صحيح",
        englishNamesOnly: "الأسماء الإنجليزية يجب أن تحتوي على أحرف إنجليزية فقط",
        arabicNamesOnly: "الأسماء العربية يجب أن تحتوي على أحرف عربية فقط",
        idNumbersOnly: "رقم الهوية يجب أن يحتوي على أرقام فقط",
        strongPasswordRequired: "كلمة المرور يجب أن تكون 8 أحرف على الأقل مع أحرف كبيرة وصغيرة ورقم ورمز خاص",
        palestinianPhoneFormat: "رقم الهاتف يجب أن يكون 970+ متبوعاً بـ 9 أرقام",
        ageTooYoung: "العمر صغير جداً",
        mustBe16OrOlder: "يجب أن تكون 16 سنة أو أكبر للتسجيل",
        invalidAge: "عمر غير صحيح",
        invalidDateOfBirth: "يرجى إدخال تاريخ ميلاد صحيح",
        palestinianIdFormat: "الرقم الوطني الفلسطيني يجب أن يكون 9 أرقام بالضبط",
        englishLettersOnly: "الأسماء الإنجليزية يجب أن تحتوي على أحرف إنجليزية فقط",
        arabicLettersOnly: "الأسماء العربية يجب أن تحتوي على أحرف عربية فقط"
    },
    clinics: {
        // Page title and alerts
        title: 'العيادات',
        importantNotice: 'مهم:',
        reservationRequired: 'الحجز مطلوب لجميع زيارات العيادة. يرجى حجز موعدك مسبقاً',

        // Category selection
        allClinics: 'جميع العيادات',

        // Clinic cards
        availableDoctor: 'طبيب متاح',
        availableDoctors: 'أطباء متاحون',
        noClinicsFound: 'لم يتم العثور على عيادات لهذه الفئة.',

        // Clinic details modal
        clinicDetails: 'تفاصيل العيادة',
        close: '✕',
        noDoctorsAvailable: 'لا يوجد أطباء متاحون في هذه العيادة.',

        // Doctor information
        fee: 'الرسوم',
        availableHours: 'الساعات المتاحة:',
        noAvailabilitySet: 'لم يتم تحديد أوقات متاحة لهذا الطبيب.',

        // Booking actions
        cancel: 'إلغاء',
        bookAppointmentNow: 'احجز موعد الآن',

        // Loading and errors
        loading: 'جارٍ تحميل العيادات...',
        errorTitle: 'خطأ',
        errorDescription: 'فشل في تحميل العيادات. يرجى المحاولة مرة أخرى لاحقاً.',

        // Days of the week
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد'
    },
    navbar: {
        home: 'الرئيسية',
        clinics: 'العيادات',
        aboutUs: 'من نحن',
        labs: 'المختبرات',
        xray: 'الأشعة',
        adminDashboard: 'لوحة تحكم المسؤول',
        secretaryDashboard: 'لوحة تحكم السكرتير',
        doctorLabs: 'نتائج المختبر',
        doctorXRay: 'صور الأشعة',
    },
    doctorPages: {
        // Lab Results Page
        labResults: 'نتائج المختبر',
        labResultsDesc: 'عرض وإدارة نتائج فحوصات المرضى المخبرية',
        viewLabResults: 'عرض نتائج المختبر',
        downloadReport: 'تحميل التقرير',
        labTestDetails: 'تفاصيل الفحص المخبري',
        patientInformation: 'معلومات المريض',
        testInformation: 'معلومات الفحص',
        testResults: 'نتائج الفحص',
        doctorsNotes: 'ملاحظات الطبيب',
        labTechnician: 'فني المختبر',
        searchPatientsTests: 'ابحث عن مريض...',
        allTestTypes: 'جميع أنواع الفحوصات',
        bloodTests: 'فحوصات الدم',
        urineTests: 'فحوصات البول',
        lipidProfile: 'ملف الدهون',
        diabetesPanel: 'فحص السكري',
        resultsFound: 'نتيجة موجودة',
        noLabResultsFound: 'لم يتم العثور على نتائج مختبر تطابق المعايير.',
        loadingLabResults: 'جارٍ تحميل نتائج المختبر...',

        // X-Ray Images Page
        xrayImages: 'صور الأشعة',
        xrayImagesDesc: 'عرض وتحليل صور الأشعة للمرضى',
        viewImage: 'عرض',
        downloadImage: 'تحميل',
        xrayDetails: 'تفاصيل الأشعة',
        examInformation: 'معلومات الفحص',
        clinicalIndication: 'السبب السريري',
        findings: 'النتائج',
        impression: 'الانطباع',
        bodyPart: 'جزء الجسم',
        radiologist: 'أخصائي الأشعة',
        searchPatientsXray: 'ابحث عن مريض...',
        allBodyParts: 'جميع أجزاء الجسم',
        chest: 'الصدر',
        knee: 'الركبة',
        spine: 'العمود الفقري',
        hand: 'اليد',
        foot: 'القدم',
        skull: 'الجمجمة',
        imagesFound: 'صورة موجودة',
        noXrayImagesFound: 'لم يتم العثور على صور أشعة تطابق المعايير.',
        loadingXrayImages: 'جارٍ تحميل صور الأشعة...',
        zoomIn: 'تكبير',
        zoomOut: 'تصغير',
        rotate: 'تدوير',
        normal: 'طبيعي',
        abnormal: 'غير طبيعي',
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
        // Add these lines to the existing admin section  

        patientHealth: "السجلات الصحية للمرضى",

        secretaryDashboard: 'لوحة تحكم السكرتير',
        dashboard: 'لوحة التحكم',
        accessDenied: 'تم رفض الوصول. ليس لديك إذن لعرض هذه الصفحة.',
        noPermissionForTab: 'ليس لديك إذن للوصول إلى هذا القسم.',
        noAccessibleSections: 'لا توجد أقسام يمكن الوصول إليها',
        contactAdministrator: 'يرجى الاتصال بالمسؤول للحصول على أذونات الوصول.',
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
        firstName: 'الاسم الأول (بالإنجليزية)',
        secondName: 'الاسم الثاني (بالإنجليزية)',
        thirdName: 'الاسم الثالث (بالإنجليزية)',
        lastName: 'الاسم الأخير (بالإنجليزية)',

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
        emailPlaceholder: 'أدخل بريدك الإلكتروني',
        phoneNumber: 'رقم الهاتف',
        phonePlaceholder: 'مثال: +٩٨٧٦٥٤٣٢١',
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

        validationErrors: "أخطاء في التحقق",
        englishFirstNameInvalid: "الاسم الأول يجب أن يحتوي على أحرف إنجليزية ومسافات فقط.",
        englishSecondNameInvalid: "الاسم الثاني يجب أن يحتوي على أحرف إنجليزية ومسافات فقط.",
        englishThirdNameInvalid: "الاسم الثالث يجب أن يحتوي على أحرف إنجليزية ومسافات فقط.",
        englishLastNameInvalid: "اسم العائلة يجب أن يحتوي على أحرف إنجليزية ومسافات فقط.",
        arabicFirstNameInvalid: "الاسم الأول بالعربية يجب أن يحتوي على أحرف عربية ومسافات فقط.",
        arabicSecondNameInvalid: "الاسم الثاني بالعربية يجب أن يحتوي على أحرف عربية ومسافات فقط.",
        arabicThirdNameInvalid: "الاسم الثالث بالعربية يجب أن يحتوي على أحرف عربية ومسافات فقط.",
        arabicLastNameInvalid: "اسم العائلة بالعربية يجب أن يحتوي على أحرف عربية ومسافات فقط.",
        palestinianIdInvalid: "رقم الهوية يجب أن يكون 9 أرقام بالضبط.",
        palestinianPhoneInvalid: "رقم الهاتف يجب أن يبدأ بـ +970 متبوعاً بـ 9 أرقام.",
        ageMinimum: "يجب أن يكون عمر المستخدم 16 سنة على الأقل."
    },
    clinicManagement: {
        // Main titles
        title: 'إدارة العيادات',
        clinicsManagement: 'إدارة العيادات',
        clinicCategories: 'فئات العيادات',

        // Descriptions
        description: 'إدارة جميع أقسام العيادات',
        categoriesDescription: 'إدارة تخصصات وفئات العيادات',

        // Search and actions
        searchClinics: 'البحث في العيادات...',
        searchPlaceholder: 'البحث في العيادات...',
        addClinic: 'إضافة عيادة',
        addCategory: 'إضافة فئة',

        // Tabs
        clinics: 'العيادات',
        categories: 'الفئات',

        // Form titles
        createNewClinic: 'إنشاء عيادة جديدة',
        editClinic: 'تعديل العيادة',
        createNewCategory: 'إنشاء فئة جديدة',
        editCategory: 'تعديل الفئة',

        // Form descriptions
        addNewClinicDesc: 'إضافة قسم عيادة جديد',
        modifyClinicDesc: 'تعديل تفاصيل العيادة الحالية',
        addNewCategoryDesc: 'إضافة فئة عيادة جديدة',
        modifyCategoryDesc: 'تعديل تفاصيل الفئة الحالية',

        // Form fields
        clinicName: 'اسم العيادة',
        clinicNamePlaceholder: 'مثال: مركز أمراض القلب',
        category: 'الفئة',
        selectCategory: 'اختر فئة',
        categoryName: 'اسم الفئة',
        categoryNamePlaceholder: 'مثال: أمراض القلب',
        descriptionPlaceholder: 'وصف خدمات وتخصصات هذه العيادة',
        activeStatus: 'حالة النشاط',

        // Status messages
        clinicActive: 'هذه العيادة مرئية وتقبل المواعيد',
        clinicInactive: 'هذه العيادة مخفية ولا تقبل المواعيد',
        categoryActive: 'هذه الفئة نشطة ومتاحة للاختيار',
        categoryInactive: 'هذه الفئة غير نشطة ومخفية من الاختيار',

        // Buttons
        createClinic: 'إنشاء العيادة',
        updateClinic: 'تحديث العيادة',
        createCategory: 'إنشاء الفئة',
        updateCategory: 'تحديث الفئة',
        saving: 'جارٍ الحفظ...',

        // Messages
        noClinicFound: 'لم يتم العثور على عيادات. أضف عيادة للبدء.',
        noClinicsFoundSearch: 'لم يتم العثور على عيادات تطابق بحثك.',
        noCategoriesFound: 'لم يتم العثور على فئات. أضف فئة للبدء.',

        // Stats
        clinic: 'عيادة',
        filtered: 'مفلتر',

        // Delete confirmations
        deleteClinic: 'حذف العيادة',
        deleteCategory: 'حذف الفئة',
        deleteDoctor: 'حذف الطبيب',
        confirmDeleteClinic: 'هل أنت متأكد من حذف هذه العيادة؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmDeleteCategory: 'هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmDeleteDoctor: 'هل أنت متأكد من حذف هذا الطبيب؟ لا يمكن التراجع عن هذا الإجراء.',
        deleting: 'جارٍ الحذف...',

        // Success messages
        clinicCreatedSuccessfully: 'تم إنشاء العيادة بنجاح.',
        clinicUpdatedSuccessfully: 'تم تحديث العيادة بنجاح.',
        clinicDeletedSuccessfully: 'تم حذف العيادة بنجاح.',
        categoryCreatedSuccessfully: 'تم إنشاء الفئة بنجاح.',
        categoryUpdatedSuccessfully: 'تم تحديث الفئة بنجاح.',
        categoryDeletedSuccessfully: 'تم حذف الفئة بنجاح.',
        doctorDeletedSuccessfully: 'تم حذف الطبيب بنجاح.',

        // Error messages
        clinicNameRequired: 'اسم العيادة مطلوب.',
        categoryRequired: 'يرجى اختيار فئة.',
        categoryNotFound: 'الفئة المحددة غير موجودة. يرجى اختيار فئة صالحة.',
        categoryNameRequired: 'اسم الفئة مطلوب.',
        failedToSaveClinic: 'فشل في حفظ العيادة. يرجى المحاولة مرة أخرى.',
        failedToUpdateClinic: 'فشل في تحديث العيادة. يرجى المحاولة مرة أخرى.',
        failedToDeleteClinic: 'فشل في حذف العيادة. يرجى المحاولة مرة أخرى.',
        failedToSaveCategory: 'فشل في حفظ الفئة. يرجى المحاولة مرة أخرى.',
        failedToDeleteCategory: 'فشل في حذف الفئة. يرجى المحاولة مرة أخرى.',
        failedToDeleteDoctor: 'فشل في حذف الطبيب. يرجى المحاولة مرة أخرى.',

        // Constraint errors
        cannotDeleteClinicWithDoctors: 'هذه العيادة لديها {{count}} طبيب/أطباء مكلفين بها. يرجى إزالة الأطباء أولاً.',
        cannotDeleteCategoryWithClinics: 'هذه الفئة مستخدمة من قبل العيادة/العيادات التالية: {{clinics}}. يرجى إعادة تعيين تلك العيادات أولاً.',
        cannotDelete: 'لا يمكن الحذف',

        // No categories warning
        noCategoriesAvailable: 'لا توجد فئات متاحة',
        categoriesRequiredMessage: 'يجب إنشاء الفئات قبل أن تتمكن من إضافة العيادات.',
        createCategoryNow: 'إنشاء فئة الآن',

        // Loading states
        loadingClinics: 'جارٍ تحميل العيادات...',
        loadingCategories: 'جارٍ تحميل الفئات...',
        loadingDoctors: 'جارٍ تحميل الأطباء...',

        // Database errors
        databaseError: 'خطأ في قاعدة البيانات: ',
        unexpectedError: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    },
    doctorManagement: {
        // Main titles
        title: 'إدارة الأطباء',
        doctorsManagement: 'إدارة الأطباء',

        // Descriptions
        description: 'إدارة الأطباء وتعيينات العيادات',

        // Search and actions
        searchDoctors: 'البحث في الأطباء...',
        searchPlaceholder: 'البحث في الأطباء...',
        addDoctor: 'إضافة طبيب',

        // Form titles
        createNewDoctor: 'إنشاء طبيب جديد',
        editDoctor: 'تعديل الطبيب',

        // Form descriptions
        addNewDoctorDesc: 'إضافة ملف طبيب جديد',
        modifyDoctorDesc: 'تعديل تفاصيل الطبيب الحالي',

        // Form fields
        doctorName: 'اسم الطبيب',
        doctorNamePlaceholder: 'د. الاسم الكامل',
        specialty: 'التخصص',
        specialtyPlaceholder: 'مثال: طبيب قلب',
        clinic: 'العيادة',
        selectClinic: 'اختر عيادة',
        emailPlaceholder: 'أدخل بريدك الإلكتروني',
        phonePlaceholder: 'مثال: +٩٨٧٦٥٤٣٢١',
        appointmentPrice: 'سعر الموعد (₪)',
        pricePlaceholder: '0.00',
        availabilityStatus: 'حالة التوفر',

        // Status messages
        doctorAvailable: 'هذا الطبيب متاح للمواعيد',
        doctorUnavailable: 'هذا الطبيب غير متاح للمواعيد',

        // Buttons
        createDoctor: 'إنشاء الطبيب',
        updateDoctor: 'تحديث الطبيب',
        saving: 'جارٍ الحفظ...',
        hours: 'الساعات',

        // Messages
        noDoctorsFound: 'لم يتم العثور على أطباء. أضف طبيبًا للبدء.',
        noDoctorsFoundSearch: 'لم يتم العثور على أطباء تطابق بحثك.',
        doctorNotFound: 'لم يتم العثور على الطبيب.',
        noClinicsAvailable: 'لا توجد عيادات متاحة. يرجى إنشاء عيادة أولاً.',

        // Stats
        doctor: 'طبيب',
        doctors: 'أطباء',
        filtered: 'مفلتر',

        // Delete confirmation
        confirmDeletion: 'تأكيد الحذف',
        confirmDeleteDoctor: 'هل أنت متأكد من حذف د. {{name}}؟ لا يمكن التراجع عن هذا الإجراء.',
        permanentRemoval: 'سيؤدي هذا إلى إزالة الطبيب وجميع فترات توفره من النظام نهائيًا.',
        deleting: 'جارٍ الحذف...',
        deleteDoctor: 'حذف الطبيب',

        // Success messages
        doctorCreatedSuccessfully: 'تم إنشاء الطبيب بنجاح. لا تنس تحديد أوقات توفره.',
        doctorUpdatedSuccessfully: 'تم تحديث الطبيب بنجاح.',
        doctorDeletedSuccessfully: 'تم حذف د. {{name}} بنجاح.',

        // Error messages
        validationError: 'خطأ في التحقق',
        fillAllFields: 'يرجى ملء جميع الحقول المطلوبة.',
        validPrice: 'يجب أن يكون السعر رقمًا صالحًا.',
        failedToSaveDoctor: 'فشل في حفظ الطبيب. يرجى المحاولة مرة أخرى.',
        failedToDeleteDoctor: 'فشل في حذف الطبيب. يرجى المحاولة مرة أخرى.',

        // Availability Management
        manageAvailability: 'إدارة توفر الطبيب',
        setAvailableHours: 'تحديد ساعات التوفر للدكتور {{name}}',
        currentAvailability: 'التوفر الحالي',
        noAvailabilitySlots: 'لم يتم تحديد فترات توفر بعد.',
        addNewSlot: 'إضافة فترة توفر جديدة',
        day: 'اليوم',
        startTime: 'وقت البداية',
        endTime: 'وقت النهاية',
        addTimeSlot: 'إضافة فترة زمنية',
        adding: 'جارٍ الإضافة...',
        done: 'تم',

        // Days of the week
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد',

        // Availability validation
        fillAvailabilityFields: 'يرجى ملء جميع حقول التوفر.',
        validTimeValues: 'يرجى إدخال قيم وقت صالحة.',
        endTimeAfterStart: 'يجب أن يكون وقت النهاية بعد وقت البداية.',

        // Availability success messages
        slotAddedSuccessfully: 'تم إضافة فترة التوفر بنجاح.',
        slotRemovedSuccessfully: 'تم إزالة فترة التوفر بنجاح.',

        // Availability error messages
        failedToAddSlot: 'فشل في إضافة فترة التوفر. يرجى المحاولة مرة أخرى.',
        failedToDeleteSlot: 'فشل في حذف فترة التوفر. يرجى المحاولة مرة أخرى.',
        failedToLoadSlots: 'فشل في تحميل فترات التوفر.',

        // Loading states
        loadingDoctors: 'جارٍ تحميل الأطباء...',
        loadingClinics: 'جارٍ تحميل العيادات...',
        loadingSlots: 'جارٍ تحميل فترات التوفر...',
        phoneRequired: "رقم الهاتف مطلوب."
    },
    home: {
        reminder: 'تذكير',
        reservationRequired: 'يرجى حجز موعد قبل زيارة عيادتنا ',
        bookNow: 'احجز الآن',
        userCreation: 'إنشاء مستخدم',
        saveInformation: 'حفظ معلومات المريض',
        patientInformation: 'معلومات المريض',
        weight: 'الوزن',
        height: 'الطول',
        homeemail: 'أدخل بريدك الإلكتروني',
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
            pain_relief: 'مسكنات الألم',
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
    },
    xray: {
        // Page titles and descriptions
        pageTitle: 'نظام رفع صور الأشعة',
        pageDescription: 'رفع وإدارة صور الأشعة الطبية بأمان',
        title: 'رفع صور الأشعة',
        uploadXrayImage: 'رفع صورة الأشعة',

        // Patient Information
        patientInformation: 'معلومات المريض',
        patientName: 'اسم المريض',
        patientNamePlaceholder: 'أدخل اسم المريض',
        patientId: 'رقم المريض',
        patientIdPlaceholder: 'أدخل رقم المريض',
        dateOfBirth: 'تاريخ الميلاد',
        bodyPart: 'العضو المصوَّر',
        selectBodyPart: 'اختر العضو المصوَّر',
        requestingDoctor: 'الطبيب الطالب',
        doctorNamePlaceholder: 'أدخل اسم الطبيب',
        clinicalIndication: 'المؤشر السريري',
        indicationPlaceholder: 'أدخل السبب أو المؤشر السريري للأشعة...',

        // Body parts
        bodyParts: {
            chest: 'الصدر',
            knee: 'الركبة',
            spine: 'العمود الفقري',
            hand: 'اليد',
            foot: 'القدم',
            skull: 'الجمجمة',
            pelvis: 'الحوض',
            shoulder: 'الكتف',
            elbow: 'الكوع',
            wrist: 'المعصم'
        },

        // File upload
        dragAndDrop: 'اسحب وأفلت صورة الأشعة هنا',
        orClickToBrowse: 'أو انقر لتصفح الملفات',
        supportedFormats: 'الأنواع المدعومة: JPEG، PNG، TIFF، PDF، DICOM (بحد أقصى 50 ميجابايت)',
        fileSelected: 'تم اختيار الملف',
        mb: 'ميجابايت',
        removeFile: 'إزالة الملف',
        fileRemoved: 'تمت إزالة الملف',

        // Validation and error messages
        invalidFileType: 'يرجى اختيار ملف صورة صحيح (JPEG، PNG، TIFF، PDF، أو DICOM)',
        fileTooLarge: 'يجب أن يكون حجم الملف أقل من 50 ميجابايت',
        fillRequiredFields: 'يرجى تعبئة جميع الحقول المطلوبة ورفع صورة',
        uploadError: 'حدث خطأ أثناء رفع صورة الأشعة. يرجى المحاولة مرة أخرى.',

        // Success messages
        saveXray: 'حفظ الأشعة',
        saveXrayRecord: 'حفظ سجل الأشعة',
        saveSuccess: 'تم حفظ صورة الأشعة بنجاح!',
        uploadSuccess: 'تم رفع صورة الأشعة بنجاح',

        // Upload progress
        uploading: 'جارٍ الرفع...',
        uploadingXray: 'جاري رفع صورة الأشعة...',
        processing: 'جارٍ المعالجة',

        // Security notice
        securityNotice: '🔒 جميع الملفات المرفوعة مشفرة ومتوافقة مع معايير حماية البيانات الطبية',
    },
    appointmentsManagement: {
        // Main titles and descriptions
        title: 'إدارة المواعيد',
        description: 'إدارة وتتبع جميع مواعيد المرضى',

        // Header actions
        refresh: 'تحديث',
        export: 'تصدير',
        addAppointment: 'إضافة موعد',

        // View modes
        listView: 'عرض القائمة',
        calendarView: 'عرض التقويم',
        statistics: 'الإحصائيات',

        // Search and filters
        searchAppointments: 'البحث في المواعيد...',
        resetFilters: 'إعادة تعيين المرشحات',
        filterByStatus: 'تصفية حسب الحالة',
        filterByPayment: 'تصفية حسب الدفع',
        filterByClinic: 'تصفية حسب العيادة',
        filterByDoctor: 'تصفية حسب الطبيب',
        filterByDate: 'تصفية حسب التاريخ',

        // Filter options
        allStatuses: 'جميع الحالات',
        allPaymentStatuses: 'جميع حالات الدفع',
        allClinics: 'جميع العيادات',
        allDoctors: 'جميع الأطباء',
        allDates: 'جميع التواريخ',
        today: 'اليوم',
        thisWeek: 'هذا الأسبوع',
        thisMonth: 'هذا الشهر',
        customRange: 'نطاق مخصص',

        // Table headers
        patient: 'المريض',
        doctor: 'الطبيب',
        clinic: 'العيادة',
        dateTime: 'التاريخ والوقت',
        status: 'الحالة',
        payment: 'الدفع',
        actions: 'الإجراءات',

        // Statuses
        scheduled: 'مجدول',
        completed: 'مكتمل',
        cancelled: 'ملغى',
        pending: 'في الانتظار',
        paid: 'مدفوع',
        refunded: 'مسترد',

        // Messages
        noAppointmentsFound: 'لم يتم العثور على مواعيد. حاول تعديل المرشحات أو إضافة موعد جديد.',
        noAppointmentsScheduled: 'لا توجد مواعيد مجدولة',
        createNewAppointment: 'إنشاء موعد جديد لرؤيته هنا.',

        // Pagination
        showing: 'عرض',
        to: 'إلى',
        of: 'من',
        appointments: 'مواعيد',
        page: 'صفحة',
        first: 'الأولى',
        previous: 'السابق',
        next: 'التالي',
        last: 'الأخيرة',
        itemsPerPage: 'عناصر لكل صفحة:',

        // Appointment details dialog
        appointmentDetails: 'تفاصيل الموعد',
        manageAppointment: 'إدارة الموعد لـ {{patientName}}',
        selectStatus: 'اختر الحالة',
        selectPaymentStatus: 'اختر حالة الدفع',
        notes: 'الملاحظات',
        addNotes: 'إضافة ملاحظات حول هذا الموعد...',
        saveChanges: 'حفظ التغييرات',
        close: 'إغلاق',

        // Create appointment dialog
        createNewAppointmentTitle: 'إنشاء موعد جديد',
        scheduleNewAppointment: 'جدولة موعد جديد لمريض',

        // Form fields
        selectClinic: 'اختر العيادة ',
        chooseClinic: 'اختر عيادة',
        selectDoctor: 'اختر الطبيب ',
        chooseDoctor: 'اختر طبيب',
        selectClinicFirst: 'اختر عيادة أولاً',
        selectPatient: 'اختر المريض ',
        searchPatients: 'البحث في المرضى بالاسم أو البريد الإلكتروني...',
        noPatientsFound: 'لم يتم العثور على مرضى',

        // Time selection
        selectDay: 'اختر اليوم ',
        selectTimeSlot: 'اختر فترة زمنية ',
        noAvailableSlots: 'لا توجد فترات زمنية متاحة لهذا اليوم',

        // Days of week (shortened)
        mon: 'الإث',
        tue: 'الثلا',
        wed: 'الأرب',
        thu: 'الخمي',
        fri: 'الجمع',
        sat: 'السبت',
        sun: 'الأحد',

        // Price and notes
        appointmentPrice: 'سعر الموعد',
        basedOnDoctorRate: 'بناءً على سعر الطبيب المحدد',
        additionalNotes: 'ملاحظات إضافية',
        specialInstructions: 'إضافة أي ملاحظات أو تعليمات خاصة لهذا الموعد...',

        // Buttons
        createAppointment: 'إنشاء الموعد',
        cancel: 'إلغاء',
        edit: 'تعديل',
        delete: 'حذف',

        // Warnings and errors
        noActiveClinics: 'لا توجد عيادات نشطة متاحة. يرجى إضافة عيادات أولاً.',
        noAvailableDoctors: 'لا يوجد أطباء متاحون لهذه العيادة.',
        missingInformation: 'معلومات ناقصة',
        fillRequiredFields: 'يرجى ملء جميع الحقول المطلوبة.',

        // Success messages
        appointmentCreated: 'تم إنشاء الموعد بنجاح.',
        appointmentUpdated: 'تم تحديث الموعد بنجاح.',
        appointmentDeleted: 'تم حذف الموعد بنجاح.',
        statusUpdated: 'تم تحديث حالة الموعد إلى {{status}}.',
        paymentStatusUpdated: 'تم تحديث حالة الدفع إلى {{status}}.',
        notesUpdated: 'تم تحديث ملاحظات الموعد بنجاح.',
        priceUpdated: 'تم تحديث سعر الموعد.',

        // Error messages
        failedToCreate: 'فشل في إنشاء الموعد.',
        failedToUpdate: 'فشل في تحديث الموعد.',
        failedToDelete: 'فشل في حذف الموعد.',
        failedToUpdateStatus: 'فشل في تحديث حالة الموعد.',
        failedToUpdatePayment: 'فشل في تحديث حالة الدفع.',
        failedToUpdateNotes: 'فشل في تحديث ملاحظات الموعد.',
        failedToUpdatePrice: 'فشل في تحديث سعر الموعد.',
        failedToLoad: 'فشل في تحميل المواعيد.',
        failedToLoadClinics: 'فشل في تحميل العيادات.',
        failedToLoadDoctors: 'فشل في تحميل الأطباء.',
        failedToLoadPatients: 'فشل في تحميل المرضى.',
        failedToLoadAvailability: 'فشل في تحميل أوقات توفر الطبيب.',

        // Loading states
        loading: 'جارٍ التحميل...',
        loadingAppointments: 'جارٍ تحميل المواعيد...',
        saving: 'جارٍ الحفظ...',
        deleting: 'جارٍ الحذف...',

        // Delete confirmation
        confirmDelete: 'هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.',

        // Export
        exportComplete: 'اكتمل التصدير',
        appointmentsExported: '{{count}} موعد تم تصديره إلى CSV.',
        noDataToExport: 'لا توجد بيانات',
        noAppointmentsToExport: 'لا توجد مواعيد تطابق المرشحات للتصدير.',

        // Activity log
        appointmentCreatedLog: 'تم إنشاء الموعد',
        appointmentStatusUpdated: 'تم تحديث حالة الموعد',
        appointmentNotesUpdated: 'تم تحديث ملاحظات الموعد',

        // Statistics view
        totalAppointments: 'إجمالي المواعيد',
        totalRevenue: 'إجمالي الإيرادات',
        appointmentStatus: 'حالة المواعيد',
        paymentStatus: 'حالة الدفع',
        revenueByClinic: 'الإيرادات حسب العيادة',
        noDataAvailable: 'لا توجد بيانات متاحة',
        noRevenueData: 'لا توجد بيانات إيرادات متاحة',

        // Calendar view
        noAppointmentsCalendar: 'لا توجد مواعيد مجدولة',
        createAppointmentToSee: 'إنشاء موعد جديد لرؤيته هنا.',

        // Time formatting
        am: 'ص',
        pm: 'م',

        // Summary cards
        summary: 'ملخص',
        averagePrice: 'متوسط السعر'
    }

};

// i18n.ts - Add this configuration
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            ar: { translation: arTranslations }
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: true, // Change this to true
        },
        // Add these for faster loading
        load: 'languageOnly',
        preload: ['en', 'ar'],
        saveMissing: false,
        updateMissing: false,
    });
export default i18n;