// Complete fixed i18n.ts file with Admin Dashboard and Doctor Management translations
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const enTranslations = {
    common: {
        welcome: 'Welcome to Bethlehem Medical Center',
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
        at: 'at',
        name: 'Name',
        phone: 'Phone',
        address: 'Address',
        language: 'Language',
        english: 'English',
        arabic: 'Arabic',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        loading: 'Loading...',
        clinicName: 'Bethlehem Medical Center',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        refresh: 'Refresh',
        retry: 'Retry',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        available: 'Available',
        unavailable: 'Unavailable',
        // Clinical Notes
        diagnosis: 'Diagnosis',
        general: 'General',
        consultation: 'Consultation',
        treatment: 'Treatment',
        goBack: 'Go Back',
        notes: 'Notes',
        image: 'Image',

        // Status translations
        pending: 'Pending',
        paid: 'Paid',
        completed: 'Completed',
        cancelled: 'Cancelled',
        failed: 'Failed',
        refunded: 'Refunded',

        // Priority translations
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',

        // Note type translations
        followUp: 'Follow-up',
        clinicalNoteAdded: 'Clinical note added successfully!',
        clinicalNoteUpdated: 'Clinical note updated successfully!',
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
        close: 'Close',
    },
    auth: {
        welcomeBack: 'Welcome Back',
        enterCredentials2: 'Enter your credentials to access your account',
        enterCredentials: 'name@example.com',
        dontHaveAccount: 'Don\'t have an account?',
        invalidCredentials: "Invalid email or password",
        loginFailed: "Login Failed",
        loginRequired: "Please log in to view your medical records.",
        login: "Login",
        accessDenied: "Access Denied",

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
        labs: 'Lab',
        xray: 'X-Ray',
        ultrasound: 'Ultrasound',
        audiometry: 'Audiometry',
        adminDashboard: 'Admin Dashboard',
        secretaryDashboard: 'Secretary Dashboard',
        doctorLabs: 'Lab Results',
        doctorXRay: 'X-Ray Images',
        doctorUltrasound: 'Ultrasound Images',
        doctorAudiometry: 'Audiometry Images',
        patients: 'Patients',
        myAppointments: 'My Appointments',
        myRecords: 'My Medical Records',
    },
    doctorPages: {
        // Lab Results Page
        downloadFailed: "Failed to download image. Please try again.",
        noImageUrl: "No image URL available",
        imageNotAvailable: 'Image Not Available',
        labResults: 'Laboratory Results',
        labResultsDesc: 'View and manage patient lab test results',
        viewLabResults: 'View Lab Results',
        downloadReport: 'Download Report',
        labTestDetails: 'Lab Test Details',
        patientInformation: 'Patient Information',
        testInformation: 'Test Information',

        // X-Ray Page
        xrayImages: 'X-Ray Images',
        xrayImagesDesc: 'View and analyze patient X-ray images',
        searchPatientsXray: 'Search patients or body parts...',
        allBodyParts: 'All Body Parts',
        loadingXrayImages: 'Loading X-ray images...',
        downloadImage: 'Download',
        deleting: 'Deleting...',
        deleteSuccess: 'Image deleted',
        deleteSuccessDesc: 'The X-ray image was deleted successfully.',
        deleteFailed: 'Failed to delete image.',
        confirmDeleteTitle: 'Delete X-ray Image?',
        confirmDeleteDesc: 'Are you sure you want to delete this X-ray image? This action cannot be undone.',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        rotate: 'Rotate',
        examInformation: 'Exam Information',
        requestingDoctor: 'Requesting Doctor',
        noXrayImagesFound: 'No X-ray images found matching your criteria.',
        noXrayImagesUploaded: 'No X-ray images have been uploaded yet.',
        tryAdjustingSearch: 'Try adjusting your search or filter criteria.',

        // Body part categories for DoctorXRayPage (matching XRay component categories)
        bodyPartCategories: {
            skull: 'Skull',
            facialBones: 'Facial Bones',
            cervicalSpine: 'Cervical Spine',
            thoracicSpine: 'Thoracic Spine',
            lumbarSpine: 'Lumbar Spine',
            sternum: 'Sternum',
            ribs: 'Ribs',
            shoulder: 'Shoulder',
            arm: 'Arm',
            hand: 'Hand',
            pelvis: 'Pelvis',
            thigh: 'Thigh',
            leg: 'Leg',
            foot: 'Foot'
        },

        // Ultrasound Page
        ultrasoundImages: 'Ultrasound Images',
        ultrasoundImagesDesc: 'View and analyze patient Ultrasound images',
        searchPatientsUltrasound: 'Search patients or body parts...',
        loadingUltrasoundImages: 'Loading Ultrasound images...',
        noUltrasoundImagesFound: 'No Ultrasound images found matching your criteria.',
        noUltrasoundImagesUploaded: 'No Ultrasound images have been uploaded yet.',
        confirmDeleteTitleUltrasound: 'Delete Ultrasound Image?',
        confirmDeleteDescUltrasound: 'Are you sure you want to delete this Ultrasound image? This action cannot be undone.',
        audiometryImages: 'Audiometry Images',
        audiometryImagesDesc: 'View and analyze patient Audiometry images',
        searchPatientsAudiometry: 'Search patients or notes...',
        loadingAudiometryImages: 'Loading Audiometry images...',
        noAudiometryImagesFound: 'No Audiometry images found matching your criteria.',
        noAudiometryImagesUploaded: 'No Audiometry images have been uploaded yet.',
        deleteConfirmTitleAudiometry: 'Delete Audiometry Image?',
        deleteConfirmAudiometry: 'Are you sure you want to delete this Audiometry image? This action cannot be undone.',
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
        viewImage: 'View',
        xrayDetails: 'X-Ray Details',
        clinicalIndication: 'Clinical Indication',
        findings: 'Findings',
        impression: 'Impression',
        bodyPart: 'Body Part',
        radiologist: 'Radiologist',
        imagesFound: 'images found',
        normal: 'Normal',
        abnormal: 'Abnormal',
        dateOfBirth: 'Date of Birth',
    },

    preview: {
        pageTitle: 'My Medical Records - Bethlehem Medical Center',
        pageDescription: 'View your medical appointments, notes, lab results, and X-ray images',
        pageKeywords: 'medical records, patient portal, appointments, lab results, X-ray images',
        title: 'My Medical Records',
        subtitle: 'View your appointments, medical notes, lab results, and X-ray images',
        patientInfo: 'Patient Information',
        accessDenied: 'This page is only accessible to patients and administrators.',

        // Tab labels
        appointments: 'Appointments',
        notes: 'Medical Notes',
        labs: 'Lab Results',
        xrays: 'X-Ray Images',
        ultrasound: 'Ultrasound',
        audiometry: 'Audiometry',

        // Appointments tab
        noAppointmentsFound: 'No appointments found',
        paymentStatus: 'Payment Status',
        clinic: 'Clinic',
        specialty: 'Specialty',
        date: 'Date',
        time: 'Time',
        price: 'Price',
        created: 'Created',

        // Notes tab
        noMedicalNotesFound: 'No medical notes found',
        noteType: 'Note Type',
        priority: 'Priority',
        status: 'Status',
        diagnosis: 'Diagnosis',
        treatmentPlan: 'Treatment Plan',
        medications: 'Medications',
        followUpDate: 'Follow-up Date',
        downloadReport: 'Download Report',

        // Labs tab
        noLabResultsFound: 'No lab results found',
        testType: 'Test Type',
        bloodType: 'Blood Type',
        testResults: 'Test Results',
        doctorNotes: 'Doctor Notes',

        // X-rays tab
        noXrayImagesFound: 'No X-ray images found',
        requestingDoctor: 'Requesting Doctor',
        clinicalIndication: 'Clinical Indication',
        imageNotAvailable: 'Image Not Available',
    },

    payment: {
        // Security alert
        selectedClinic: 'Selected Clinic',
        selectedDoctor: 'Selected Doctor',
        selectedSpecialty: 'Selected Specialty',
        selectedDay: 'Selected Day',
        selectedTime: 'Selected Time',
        securePayment: 'Secure Payment',
        allTransactionsEncrypted: 'All payments are made securely in cash at the clinic.',
        clinicName: "Selected Clinic",
        doctorName: "Selected Doctor",
        specialtyselect: "Selected Specialty",
        appointmentDay: "Selected Day",
        appointmentTime: "Selected Time",

        // Appointment summary
        appointmentSummary: 'Appointment Summary',
        reviewAppointmentDetails: 'Please review your appointment details',
        clinic: 'Clinic',
        doctor: 'Doctor',
        specialty: 'Specialty',
        day: 'Day',
        time: 'Time',
        totalAmount: 'Total Amount',

        // Payment method selection
        paymentMethod: 'Payment Method',
        choosePaymentMethod: 'Choose your preferred payment method',
        creditCard: 'Credit Card',
        paypal: 'PayPal',
        insurance: 'Insurance',
        cash: 'Cash',

        // Credit card form
        cardNumber: 'Card Number',
        nameOnCard: 'Name on Card',
        cardNamePlaceholder: 'John Doe',
        expiryDate: 'Expiry Date',
        cvv: 'CVV',
        payNow: 'Pay Now',
        processing: 'Processing...',

        // PayPal
        continueWithPaypal: 'Continue with PayPal to complete payment',
        payWithPaypal: 'Pay with PayPal',

        // Insurance
        insuranceProvider: 'Insurance Provider',
        selectInsuranceProvider: 'Select your insurance provider',
        policyNumber: 'Policy Number',
        policyNumberPlaceholder: 'Policy number',
        memberID: 'Member ID',
        memberIDPlaceholder: 'Member ID',
        verifyingInsurance: 'Verifying Insurance...',
        submitInsurance: 'Submit Insurance',
        other: 'Other',

        // Cash payment
        cashPaymentInformation: 'Cash Payment Information',
        cashPaymentNote: 'Please note that by selecting cash payment, you agree to bring the exact amount (₪{{price}}) to your appointment.',
        paymentAtReception: 'Payment must be made at the clinic reception before your appointment',
        onlyCashShekel: 'Only cash in Israeli Shekels (₪) is accepted',
        receiptProvided: 'A receipt will be provided after payment',
        failureToPayMayReschedule: 'Failure to bring payment may result in rescheduling your appointment',
        agreeToTerms: 'I understand and agree to the cash payment terms',
        confirmCashPayment: 'Confirm Cash Payment',

        // Footer
        back: 'Back',
        dataProtected: 'Your data is protected',
        loadingPaymentInfo: 'Loading payment information...',

        // Payment Management
        paymentManagement: {
            title: 'Payment Management',
            totalRevenue: 'Total Revenue',
            pendingPayments: 'Pending Payments',
            completedPayments: 'Completed Payments',
            failedPayments: 'Failed Payments',
            todayRevenue: 'Today\'s Revenue',
            monthlyRevenue: 'Monthly Revenue',
            averagePayment: 'Average Payment',
            fromCompletedPayments: 'From completed payments',
            awaitingPayment: 'Awaiting payment',
            todayOnly: 'Today only',
            perAppointment: 'Per appointment',
            filters: 'Filters',
            searchPayments: 'Search payments...',
            paymentStatus: 'Payment Status',
            allStatuses: 'All Statuses',
            pending: 'Pending',
            completed: 'Completed',
            failed: 'Failed',
            refunded: 'Refunded',
            dateRange: 'Date Range',
            allDates: 'All Dates',
            today: 'Today',
            thisWeek: 'This Week',
            thisMonth: 'This Month',
            export: 'Export',
            paymentsList: 'Payments List',
            confirmationNumber: 'Confirmation #',
            patient: 'Patient',
            appointment: 'Appointment',
            amount: 'Amount',
            paymentMethod: 'Payment Method',
            createdAt: 'Created At',
            actions: 'Actions',
            noPaymentsFound: 'No payments found',
            noPaymentsYet: 'No payments have been recorded yet.',
            noMatchingPayments: 'No payments match your current filters.',
            paymentDetails: 'Payment Details',
            paymentDetailsDesc: 'Detailed information about this payment',
            patientName: 'Patient Name',
            patientEmail: 'Patient Email',
            patientPhone: 'Patient Phone',
            clinicName: 'Clinic Name',
            doctorName: 'Doctor Name',
            specialty: 'Specialty',
            appointmentDate: 'Appointment Date',
            appointmentTime: 'Appointment Time',
            bookingStatus: 'Booking Status',
            lastUpdated: 'Last Updated',
            markPaymentCompleted: 'Mark Payment as Completed',
            markPaymentCompletedDesc: 'Confirm that the cash payment has been received at the clinic',
            markAsCompleted: 'Mark as Completed',
            paymentMarkedCompleted: 'Payment Marked as Completed',
            paymentMarkedCompletedDesc: 'The payment status has been updated successfully',
            errorLoadingPayments: 'Error loading payment data',
            errorMarkingPayment: 'Error marking payment as completed',
        },

        // Payment Notifications
        paymentNotification: {
            completed: 'Payment completed successfully',
            pending: 'Payment is pending - please pay at the clinic',
            failed: 'Payment failed - please try again',
            refunded: 'Payment has been refunded',
            unknown: 'Payment status unknown',
            markCompleted: 'Mark as Completed',
        },

        // Paid Patients List
        paidPatients: {
            paidPatients: 'Paid Patients',
            pendingPayments: 'Pending Payments',
            todayAppointments: 'Today\'s Appointments',
            allPatients: 'All Patients',
            searchPatients: 'Search patients...',
            allStatuses: 'All Statuses',
            paid: 'Paid',
            pending: 'Pending',
            failed: 'Failed',
            completed: 'Completed',
            confirmation: 'Confirmation',
            noPatientsFound: 'No patients found matching your criteria',
            markedPaid: 'Payment Marked as Paid',
            cashPaymentReceived: 'Cash payment received',
            markPaid: 'Mark Paid',
            markCashPayment: 'Mark Cash Payment as Paid',
            confirmCashReceived: 'Confirm that you have received the cash payment:',
            amount: 'Amount',
            marking: 'Marking...',
            markAsPaid: 'Mark as Paid',
            patientId: 'Patient ID',
            searchByPatientId: 'Search by Patient ID...',
            markPaidError: 'Failed to mark payment as paid. Please try again.',
        },

        // Common translations
        common: {
            refresh: 'Refresh',
            cancel: 'Cancel',
            patient: 'Patient',
        },

        // Payment translations
        payment: {
            markedPaid: 'Payment Marked as Paid',
            cashPaymentReceived: 'Cash payment received',
            markPaid: 'Mark Paid',
            markCashPayment: 'Mark Cash Payment as Paid',
            confirmCashReceived: 'Confirm that you have received the cash payment:',
            amount: 'Amount',
            marking: 'Marking...',
            markAsPaid: 'Mark as Paid',
            error: 'Error',
            markPaidError: 'Failed to mark payment as paid. Please try again.',
        },

        // Days of the week
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',

        // Common medical specialties
        dentist: 'Dentist',
        dentistSpecialty: 'Dentistry',
        pediatrics: 'Pediatrics',
        cardiology: 'Cardiology',
        dermatology: 'Dermatology',
        neurology: 'Neurology',
        orthopedics: 'Orthopedics',
        psychiatry: 'Psychiatry',
        gynecology: 'Gynecology',
        urology: 'Urology',
        ophthalmology: 'Ophthalmology',
        radiology: 'Radiology',
        surgery: 'Surgery',
        emergency: 'Emergency Medicine',
        family: 'Family Medicine',
        internal: 'Internal Medicine',
        general: 'General',
        anesthesiology: 'Anesthesiology',
        oncology: 'Oncology',
        endocrinology: 'Endocrinology',
        pulmonology: 'Pulmonology',
        gastroenterology: 'Gastroenterology',
        nephrology: 'Nephrology',
        rheumatology: 'Rheumatology',
        hematology: 'Hematology',
        immunology: 'Immunology',
        pathology: 'Pathology',
        pharmacology: 'Pharmacology',
        physiotherapy: 'Physiotherapy',
        laboratory: 'Laboratory',

        // Common clinic names
        bethlehemMedCenter: 'Bethlehem Medical Center',
        alMakassedHospital: 'Al-Makassed Hospital',
        hadassahHospital: 'Hadassah Hospital',
        alShifaHospital: 'Al-Shifa Hospital',
        ramallahHospital: 'Ramallah Hospital',

        // Common doctor names (examples)
        bisharaBabish: 'Bishara Babish',
        ahmedMohammed: 'Ahmed Mohammed',
        fatimaAli: 'Fatima Ali',
        omarHassan: 'Omar Hassan',
        mariamIbrahim: 'Mariam Ibrahim',
        issaHandal: 'Issa Handal',
    },
    "paymentSuccess": {
        "paymentSuccessful": "Payment Successful",
        "paypalProcessedSuccessfully": "Your PayPal payment has been processed successfully.",
        "paymentError": "Payment Error",
        "paymentProcessingFailed": "Payment processing failed",
        "processingPayPalPayment": "Processing PayPal Payment",
        "pleaseWaitConfirming": "Please wait while we confirm your payment...",
        "paymentFailed": "Payment Failed",
        "errorProcessingPayment": "An error occurred while processing your payment",
        "tryAgain": "Try Again",
        "backToClinics": "Back to Clinics",
        "paymentSuccessfulTitle": "Payment Successful!",
        "appointmentConfirmedAndPaid": "Your appointment has been confirmed and paid for.",
        "appointmentDetails": "Appointment Details",
        "clinic": "Clinic",
        "doctor": "Doctor",
        "date": "Date",
        "time": "Time",
        "amountPaid": "Amount Paid",
        "paymentMethod": "Payment Method",
        "paypal": "PayPal",
        "transactionId": "Transaction ID",
        "viewMyAppointments": "View My Appointments",
        "bookAnotherAppointment": "Book Another Appointment"
    },
    "paymentCancel": {
        "paymentCancelled": "Payment Cancelled",
        "paypalCancelledNoCharges": "Your PayPal payment was cancelled. No charges were made.",
        "paymentCancelledTitle": "Payment Cancelled",
        "cancelledPaymentDescription": "You cancelled the PayPal payment process. No charges were made to your account.",
        "appointmentNotConfirmed": "Your appointment has not been confirmed.",
        "tryDifferentMethodOrBookLater": "You can try a different payment method or book again later.",
        "tryDifferentPaymentMethod": "Try Different Payment Method",
        "backToClinics": "Back to Clinics"
    },
    footer: {
        rights: 'All rights reserved',
        privacyPolicy: 'Privacy & Cookies Policy',
        termsOfUse: 'Terms & Conditions',
        contactUs: 'Contact Us',
        quickLinks: 'Terms of Use and Policies',
        clinicDescription: 'Providing quality healthcare services since 2025',
        address: 'Wadi Musalam St. - Najib Nasser Building',
        city: 'Bethlehem, Palestine',
    },

    "xray": {
        // Page titles and descriptions
        "pageTitle": "X-Ray Image Upload System",
        "pageDescription": "Securely upload and manage medical X-ray images",
        "title": "X-Ray Upload System",
        "subtitle": "Upload and manage X-ray images",
        "uploadXrayImage": "Upload X-Ray Image",
        selectFromDropdown: "Or select from dropdown:",

        // SEO
        "seo": {
            "title": "X-Ray Imaging Services - Bethlehem Medical Center",
            "description": "Advanced X-ray imaging services at Bethlehem Medical Center. Digital X-ray imaging, radiology services, and medical imaging for accurate diagnosis.",
            "keywords": "X-ray imaging, radiology services, medical imaging, digital X-ray, Bethlehem Medical Center, diagnostic imaging"
        },

        // Patient Information
        "patientInfo": {
            "title": "Patient Information",
            "searchPatient": "Search Patient",
            "searchPlaceholder": "Search by name, email, or ID number...",
            "noPatientsFound": "No patients found",
            "patientSelected": "Patient Selected",
            "name": "Name",
            "email": "Email",
            "id": "ID",
            "dob": "DOB",
            "gender": "Gender",
            "dateOfBirth": "Date of Birth",
            "manualName": "Patient Name (Manual Entry)",
            "namePlaceholder": "Enter patient full name",
            "manualDob": "Date of Birth (Manual Entry)"
        },

        // Doctor Information
        "doctorInfo": {
            "title": "Requesting Doctor",
            "searchPlaceholder": "Search by doctor name, specialty, or email...",
            "noDoctorsFound": "No doctors found",
            "doctorSelected": "Doctor Selected",
            "drPrefix": "Dr.",
            "name": "Name",
            "specialty": "Specialty",
            "clinic": "Clinic",
            "email": "Email",
            "phone": "Phone"
        },

        // Clinical Indication
        "clinicalIndication": {
            "title": "Clinical Indication",
            "placeholder": "Enter clinical indication and symptoms"
        },

        // Body Part Selection
        "bodyPartSelection": {
            "title": "Body Part Selection",
            "manualSelection": "Manual Selection",
            "placeholder": "Choose specific body part..."
        },

        // File Upload
        "fileUpload": {
            "title": "X-Ray Image Upload",
            "fileSelected": "File Selected",
            "removeFile": "Remove File",
            "dragDropText": "Drag and drop your X-ray image",
            "clickToBrowse": "or click to browse",
            "supportedFormats": "Supported formats: JPEG, PNG (Max 10MB)"
        },

        // Actions
        "actions": {
            "saveRecord": "Save X-Ray Record",
            "resetForm": "Reset Form"
        },

        // Common
        "selected": "Selected",

        // Body parts
        "bodyParts": {
            "skull": "Skull",
            "frontal_bone": "Frontal Bone",
            "left_parietal_bone": "Left Parietal Bone",
            "right_parietal_bone": "Right Parietal Bone",
            "left_temporal_bone": "Left Temporal Bone",
            "right_temporal_bone": "Right Temporal Bone",
            "occipital_bone": "Occipital Bone",
            "sphenoid_bone": "Sphenoid Bone",
            "ethmoid_bone": "Ethmoid Bone",
            "paranasal_sinus": "Paranasal Sinus",
            "left_nasal_bone": "Left Nasal Bone",
            "right_nasal_bone": "Right Nasal Bone",
            "left_maxilla": "Left Maxilla",
            "right_maxilla": "Right Maxilla",
            "mandible": "Mandible (Lower Jaw)",
            "left_zygomatic_bone": "Left Zygomatic Bone (Cheekbone)",
            "right_zygomatic_bone": "Right Zygomatic Bone (Cheekbone)",
            "left_palatine_bone": "Left Palatine Bone",
            "right_palatine_bone": "Right Palatine Bone",
            "left_lacrimal_bone": "Left Lacrimal Bone",
            "right_lacrimal_bone": "Right Lacrimal Bone",
            "left_inferior_nasal_concha": "Left Inferior Nasal Concha",
            "right_inferior_nasal_concha": "Right Inferior Nasal Concha",
            "vomer": "Vomer",
            "left_malleus": "Left Malleus",
            "right_malleus": "Right Malleus",
            "left_incus": "Left Incus",
            "right_incus": "Right Incus",
            "left_stapes": "Left Stapes",
            "right_stapes": "Right Stapes",
            "hyoid_bone": "Hyoid Bone",
            "cervical_spine": "Cervical Spine",
            "c1_atlas": "C1 (Atlas)",
            "c2_axis": "C2 (Axis)",
            "c3_vertebra": "C3 Vertebra",
            "c4_vertebra": "C4 Vertebra",
            "c5_vertebra": "C5 Vertebra",
            "c6_vertebra": "C6 Vertebra",
            "c7_vertebra": "C7 Vertebra",
            "thoracic_spine": "Thoracic Spine",
            "t1_vertebra": "T1 Vertebra",
            "t2_vertebra": "T2 Vertebra",
            "t3_vertebra": "T3 Vertebra",
            "t4_vertebra": "T4 Vertebra",
            "t5_vertebra": "T5 Vertebra",
            "t6_vertebra": "T6 Vertebra",
            "t7_vertebra": "T7 Vertebra",
            "t8_vertebra": "T8 Vertebra",
            "t9_vertebra": "T9 Vertebra",
            "t10_vertebra": "T10 Vertebra",
            "t11_vertebra": "T11 Vertebra",
            "t12_vertebra": "T12 Vertebra",
            "lumbar_spine": "Lumbar Spine",
            "l1_vertebra": "L1 Vertebra",
            "l2_vertebra": "L2 Vertebra",
            "l3_vertebra": "L3 Vertebra",
            "l4_vertebra": "L4 Vertebra",
            "l5_vertebra": "L5 Vertebra",
            "sacrum": "Sacrum",
            "coccyx": "Coccyx (Tailbone)",
            "sternum": "Sternum",
            "manubrium": "Manubrium",
            "sternal_body": "Sternal Body",
            "xiphoid_process": "Xiphoid Process",
            "ribs_left": "Left Ribs",
            "ribs_right": "Right Ribs",
            "left_1st_rib": "Left 1st Rib",
            "right_1st_rib": "Right 1st Rib",
            "left_2nd_rib": "Left 2nd Rib",
            "right_2nd_rib": "Right 2nd Rib",
            "left_3rd_rib": "Left 3rd Rib",
            "right_3rd_rib": "Right 3rd Rib",
            "left_4th_rib": "Left 4th Rib",
            "right_4th_rib": "Right 4th Rib",
            "left_5th_rib": "Left 5th Rib",
            "right_5th_rib": "Right 5th Rib",
            "left_6th_rib": "Left 6th Rib",
            "right_6th_rib": "Right 6th Rib",
            "left_7th_rib": "Left 7th Rib",
            "right_7th_rib": "Right 7th Rib",
            "left_8th_rib": "Left 8th Rib",
            "right_8th_rib": "Right 8th Rib",
            "left_9th_rib": "Left 9th Rib",
            "right_9th_rib": "Right 9th Rib",
            "left_10th_rib": "Left 10th Rib",
            "right_10th_rib": "Right 10th Rib",
            "left_11th_rib": "Left 11th Rib",
            "right_11th_rib": "Right 11th Rib",
            "left_12th_rib": "Left 12th Rib",
            "right_12th_rib": "Right 12th Rib",
            "clavicle_left": "Left Clavicle",
            "clavicle_right": "Right Clavicle",
            "scapula_left": "Left Scapula",
            "scapula_right": "Right Scapula",
            "humerus_left": "Left Humerus",
            "humerus_right": "Right Humerus",
            "radius_left": "Left Radius",
            "radius_right": "Right Radius",
            "ulna_left": "Left Ulna",
            "ulna_right": "Right Ulna",
            "hand_left": "Left Hand",
            "left_scaphoid": "Left Scaphoid",
            "left_lunate": "Left Lunate",
            "left_triquetral": "Left Triquetral",
            "left_pisiform": "Left Pisiform",
            "left_trapezium": "Left Trapezium",
            "left_trapezoid": "Left Trapezoid",
            "left_capitate": "Left Capitate",
            "left_hamate": "Left Hamate",
            "left_1st_metacarpal": "Left 1st Metacarpal",
            "left_2nd_metacarpal": "Left 2nd Metacarpal",
            "left_3rd_metacarpal": "Left 3rd Metacarpal",
            "left_4th_metacarpal": "Left 4th Metacarpal",
            "left_5th_metacarpal": "Left 5th Metacarpal",
            "left_thumb_proximal_phalanx": "Left Thumb Proximal Phalanx",
            "left_thumb_distal_phalanx": "Left Thumb Distal Phalanx",
            "left_index_proximal_phalanx": "Left Index Proximal Phalanx",
            "left_index_middle_phalanx": "Left Index Middle Phalanx",
            "left_index_distal_phalanx": "Left Index Distal Phalanx",
            "left_middle_proximal_phalanx": "Left Middle Proximal Phalanx",
            "left_middle_middle_phalanx": "Left Middle Middle Phalanx",
            "left_middle_distal_phalanx": "Left Middle Distal Phalanx",
            "left_ring_proximal_phalanx": "Left Ring Proximal Phalanx",
            "left_ring_middle_phalanx": "Left Ring Middle Phalanx",
            "left_ring_distal_phalanx": "Left Ring Distal Phalanx",
            "left_pinky_proximal_phalanx": "Left Pinky Proximal Phalanx",
            "left_pinky_middle_phalanx": "Left Pinky Middle Phalanx",
            "left_pinky_distal_phalanx": "Left Pinky Distal Phalanx",
            "hand_right": "Right Hand",
            "right_scaphoid": "Right Scaphoid",
            "right_lunate": "Right Lunate",
            "right_triquetral": "Right Triquetral",
            "right_pisiform": "Right Pisiform",
            "right_trapezium": "Right Trapezium",
            "right_trapezoid": "Right Trapezoid",
            "right_capitate": "Right Capitate",
            "right_hamate": "Right Hamate",
            "right_1st_metacarpal": "Right 1st Metacarpal",
            "right_2nd_metacarpal": "Right 2nd Metacarpal",
            "right_3rd_metacarpal": "Right 3rd Metacarpal",
            "right_4th_metacarpal": "Right 4th Metacarpal",
            "right_5th_metacarpal": "Right 5th Metacarpal",
            "right_thumb_proximal_phalanx": "Right Thumb Proximal Phalanx",
            "right_thumb_distal_phalanx": "Right Thumb Distal Phalanx",
            "right_index_proximal_phalanx": "Right Index Proximal Phalanx",
            "right_index_middle_phalanx": "Right Index Middle Phalanx",
            "right_index_distal_phalanx": "Right Index Distal Phalanx",
            "right_middle_proximal_phalanx": "Right Middle Proximal Phalanx",
            "right_middle_middle_phalanx": "Right Middle Middle Phalanx",
            "right_middle_distal_phalanx": "Right Middle Distal Phalanx",
            "right_ring_proximal_phalanx": "Right Ring Proximal Phalanx",
            "right_ring_middle_phalanx": "Right Ring Middle Phalanx",
            "right_ring_distal_phalanx": "Right Ring Distal Phalanx",
            "right_pinky_proximal_phalanx": "Right Pinky Proximal Phalanx",
            "right_pinky_middle_phalanx": "Right Pinky Middle Phalanx",
            "right_pinky_distal_phalanx": "Right Pinky Distal Phalanx",
            "pelvis": "Pelvis",
            "left_iliac": "Left Ilium",
            "right_iliac": "Right Ilium",
            "left_ischium": "Left Ischium",
            "right_ischium": "Right Ischium",
            "left_pubis": "Left Pubis",
            "right_pubis": "Right Pubis",
            "femur_left": "Left Femur",
            "femur_right": "Right Femur",
            "patella_left": "Left Patella (Kneecap)",
            "patella_right": "Right Patella (Kneecap)",
            "tibia_left": "Left Tibia",
            "tibia_right": "Right Tibia",
            "fibula_left": "Left Fibula",
            "fibula_right": "Right Fibula",
            "foot_left": "Left Foot",
            "left_calcaneus": "Left Calcaneus (Heel)",
            "left_talus": "Left Talus",
            "left_navicular": "Left Navicular",
            "left_cuboid": "Left Cuboid",
            "left_medial_cuneiform": "Left Medial Cuneiform",
            "left_intermediate_cuneiform": "Left Intermediate Cuneiform",
            "left_lateral_cuneiform": "Left Lateral Cuneiform",
            "left_1st_metatarsal": "Left 1st Metatarsal",
            "left_2nd_metatarsal": "Left 2nd Metatarsal",
            "left_3rd_metatarsal": "Left 3rd Metatarsal",
            "left_4th_metatarsal": "Left 4th Metatarsal",
            "left_5th_metatarsal": "Left 5th Metatarsal",
            "left_big_toe_proximal_phalanx": "Left Big Toe Proximal Phalanx",
            "left_big_toe_distal_phalanx": "Left Big Toe Distal Phalanx",
            "left_2nd_toe_proximal_phalanx": "Left 2nd Toe Proximal Phalanx",
            "left_2nd_toe_middle_phalanx": "Left 2nd Toe Middle Phalanx",
            "left_2nd_toe_distal_phalanx": "Left 2nd Toe Distal Phalanx",
            "left_3rd_toe_proximal_phalanx": "Left 3rd Toe Proximal Phalanx",
            "left_3rd_toe_middle_phalanx": "Left 3rd Toe Middle Phalanx",
            "left_3rd_toe_distal_phalanx": "Left 3rd Toe Distal Phalanx",
            "left_4th_toe_proximal_phalanx": "Left 4th Toe Proximal Phalanx",
            "left_4th_toe_middle_phalanx": "Left 4th Toe Middle Phalanx",
            "left_4th_toe_distal_phalanx": "Left 4th Toe Distal Phalanx",
            "left_5th_toe_proximal_phalanx": "Left 5th Toe Proximal Phalanx",
            "left_5th_toe_middle_phalanx": "Left 5th Toe Middle Phalanx",
            "left_5th_toe_distal_phalanx": "Left 5th Toe Distal Phalanx",
            "foot_right": "Right Foot",
            "right_calcaneus": "Right Calcaneus (Heel)",
            "right_talus": "Right Talus",
            "right_navicular": "Right Navicular",
            "right_cuboid": "Right Cuboid",
            "right_medial_cuneiform": "Right Medial Cuneiform",
            "right_intermediate_cuneiform": "Right Intermediate Cuneiform",
            "right_lateral_cuneiform": "Right Lateral Cuneiform",
            "right_1st_metatarsal": "Right 1st Metatarsal",
            "right_2nd_metatarsal": "Right 2nd Metatarsal",
            "right_3rd_metatarsal": "Right 3rd Metatarsal",
            "right_4th_metatarsal": "Right 4th Metatarsal",
            "right_5th_metatarsal": "Right 5th Metatarsal",
            "right_big_toe_proximal_phalanx": "Right Big Toe Proximal Phalanx",
            "right_big_toe_distal_phalanx": "Right Big Toe Distal Phalanx",
            "right_2nd_toe_proximal_phalanx": "Right 2nd Toe Proximal Phalanx",
            "right_2nd_toe_middle_phalanx": "Right 2nd Toe Middle Phalanx",
            "right_2nd_toe_distal_phalanx": "Right 2nd Toe Distal Phalanx",
            "right_3rd_toe_proximal_phalanx": "Right 3rd Toe Proximal Phalanx",
            "right_3rd_toe_middle_phalanx": "Right 3rd Toe Middle Phalanx",
            "right_3rd_toe_distal_phalanx": "Right 3rd Toe Distal Phalanx",
            "right_4th_toe_proximal_phalanx": "Right 4th Toe Proximal Phalanx",
            "right_4th_toe_middle_phalanx": "Right 4th Toe Middle Phalanx",
            "right_4th_toe_distal_phalanx": "Right 4th Toe Distal Phalanx",
            "right_5th_toe_proximal_phalanx": "Right 5th Toe Proximal Phalanx",
            "right_5th_toe_middle_phalanx": "Right 5th Toe Middle Phalanx",
            "right_5th_toe_distal_phalanx": "Right 5th Toe Distal Phalanx",
            "shoulder_left": "Left Shoulder",
            "shoulder_right": "Right Shoulder",
            "elbow_left": "Left Elbow",
            "elbow_right": "Right Elbow",
            "wrist_left": "Left Wrist",
            "wrist_right": "Right Wrist",
            "hip_left": "Left Hip",
            "hip_right": "Right Hip",
            "knee_left": "Left Knee",
            "knee_right": "Right Knee",
            "ankle_left": "Left Ankle",
            "ankle_right": "Right Ankle",
            "left_thumb_sesamoid": "Left Thumb Sesamoid Bones",
            "right_thumb_sesamoid": "Right Thumb Sesamoid Bones",
            "left_big_toe_sesamoid": "Left Big Toe Sesamoid Bones",
            "right_big_toe_sesamoid": "Right Big Toe Sesamoid Bones",

            // Basic body parts for DoctorXRayPage dropdown
            "chest": "Chest",
            "knee": "Knee",
            "spine": "Spine",
            "hand": "Hand",
            "foot": "Foot",
            "shoulder": "Shoulder",
            "elbow": "Elbow",
            "wrist": "Wrist",
            "ankle": "Ankle",
            "hip": "Hip"
        },

        // Errors
        "errors": {
            "searchError": "Search Error",
            "doctorSearchFailed": "Failed to search for doctors. Please try again.",
            "patientSearchFailed": "Failed to search for patients. Please try again.",
            "missingData": "Missing Data",
            "selectBodyPartAndFile": "Please select at least one body part and upload a file.",
            "saveFailed": "Save Failed",
            "tryAgain": "Failed to save X-ray record. Please try again."
        },

        // Doctor X-Ray Page
        "doctorXRayPage": {
            "title": "X-Ray Images",
            "subtitle": "View and manage patient X-ray images",
            "searchPlaceholder": "Search by patient name, ID, or body part...",
            "filterByDate": "Filter by Date",
            "filterByBodyPart": "Filter by Body Part",
            "allBodyParts": "All Body Parts",
            "viewImage": "View",
            "downloadImage": "Download",
            "deleteImage": "Delete",
            "imageNotAvailable": "Image Not Available",
            "patientInformation": "Patient Information",
            "examInformation": "Exam Information",
            "bodyPart": "Body Part",
            "requestingDoctor": "Requesting Doctor",
            "clinicalIndication": "Clinical Indication",
            "status": "Status",
            "completed": "Completed",
            "downloadFailed": "Failed to download image. Please try again.",
            "deleteConfirm": "Are you sure you want to delete this X-ray image?",
            "deleteSuccess": "X-ray image deleted successfully",
            "deleteError": "Failed to delete X-ray image"
        },

        // Validation and error messages
        "invalidFileType": "Please select a valid image file (JPEG, PNG, TIFF, PDF, or DICOM)",
        "fileTooLarge": "File size must be less than 50MB",
        "fillRequiredFields": "Please fill in all required fields and upload an image",
        "uploadError": "An error occurred while uploading the X-ray image. Please try again.",

        // Success messages
        "success": {
            "title": "Success",
            "saved": "X-ray record saved successfully!"
        },

        // Upload progress
        "uploading": "Uploading...",
        "uploadingXray": "Uploading X-ray image...",
        "processing": "Processing...",

        // Security notice
        "securityNotice": "🔒 All uploaded files are encrypted and comply with medical data protection standards",
        "selectPatient": "Select Patient",
        "searchPatientPlaceholder": "Search patient by name...",
        "selectPatientOption": "Choose a patient..."
    },

    "ultrasound": {
        // Page titles and descriptions
        "pageTitle": "Ultrasound Image Upload System",
        "pageDescription": "Securely upload and manage medical Ultrasound images",
        "title": "Ultrasound Upload System",
        "subtitle": "Upload and manage Ultrasound images",
        "uploadUltrasoundImage": "Upload Ultrasound Image",
        selectFromDropdown: "Or select from dropdown:",

        // SEO
        "seo": {
            "title": "Ultrasound Imaging Services - Bethlehem Medical Center",
            "description": "Advanced Ultrasound imaging services at Bethlehem Medical Center. Digital Ultrasound imaging, radiology services, and medical imaging for accurate diagnosis.",
            "keywords": "Ultrasound imaging, radiology services, medical imaging, digital Ultrasound, Bethlehem Medical Center, diagnostic imaging"
        },

        // Patient Information
        "patientInfo": {
            "title": "Patient Information",
            "searchPatient": "Search Patient",
            "searchPlaceholder": "Search by name, email, or ID number...",
            "noPatientsFound": "No patients found",
            "patientSelected": "Patient Selected",
            "name": "Name",
            "email": "Email",
            "id": "ID",
            "dob": "DOB",
            "gender": "Gender",
            "dateOfBirth": "Date of Birth",
            "manualName": "Patient Name (Manual Entry)",
            "namePlaceholder": "Enter patient full name",
            "manualDob": "Date of Birth (Manual Entry)"
        },

        // Doctor Information
        "doctorInfo": {
            "title": "Requesting Doctor",
            "searchPlaceholder": "Search by doctor name, specialty, or email...",
            "noDoctorsFound": "No doctors found",
            "doctorSelected": "Doctor Selected",
            "drPrefix": "Dr.",
            "name": "Name",
            "specialty": "Specialty",
            "clinic": "Clinic",
            "email": "Email",
            "phone": "Phone"
        },

        // Clinical Indication
        "clinicalIndication": {
            "title": "Clinical Indication",
            "placeholder": "Enter clinical indication and symptoms"
        },

        // Body Part Selection
        "bodyPartSelection": {
            "title": "Body Part Selection",
            "manualSelection": "Manual Selection",
            "placeholder": "Choose specific body part..."
        },

        // File Upload
        "fileUpload": {
            "title": "Ultrasound Image Upload",
            "fileSelected": "File Selected",
            "removeFile": "Remove File",
            "dragDropText": "Drag and drop your Ultrasound image",
            "clickToBrowse": "or click to browse",
            "supportedFormats": "Supported formats: JPEG, PNG (Max 10MB)"
        },

        // Actions
        "actions": {
            "saveRecord": "Save Ultrasound Record",
            "resetForm": "Reset Form",
            "clearAll": "Clear All"
        },

        // Common
        "selected": "Selected",

        // Body parts - ultrasound specific
        "bodyParts": {
            "neck": "Neck",
            "head": "Head",
            "abdomen": "Abdomen",
            "abdomen_kidney": "Abdomen (Kidneys)",
            "abdomen_spleen": "Abdomen (Spleen)",
            "abdomen_liver": "Abdomen (Liver)",
            "abdomen_stomach": "Abdomen (Stomach)",
            "spine": "Spine",
            "scrotum": "Scrotum",
            "hip": "Hip (Infant)",

            // For backwards compatibility and DoctorUltrasoundPage dropdown
            "chest": "Chest",
            "knee": "Knee",
            "hand": "Hand",
            "foot": "Foot",
            "shoulder": "Shoulder",
            "elbow": "Elbow",
            "wrist": "Wrist",
            "ankle": "Ankle"
        },

        // Errors
        "errors": {
            "searchError": "Search Error",
            "doctorSearchFailed": "Failed to search for doctors. Please try again.",
            "patientSearchFailed": "Failed to search for patients. Please try again.",
            "missingData": "Missing Data",
            "selectBodyPartAndFile": "Please select at least one body part and upload a file.",
            "saveFailed": "Save Failed",
            "tryAgain": "Failed to save Ultrasound record. Please try again."
        },

        // Doctor Ultrasound Page
        "doctorUltrasoundPage": {
            "title": "Ultrasound Images",
            "subtitle": "View and manage patient Ultrasound images",
            "searchPlaceholder": "Search by patient name, ID, or body part...",
            "filterByDate": "Filter by Date",
            "filterByBodyPart": "Filter by Body Part",
            "allBodyParts": "All Body Parts",
            "viewImage": "View",
            "downloadImage": "Download",
            "deleteImage": "Delete",
            "imageNotAvailable": "Image Not Available",
            "patientInformation": "Patient Information",
            "examInformation": "Exam Information",
            "bodyPart": "Body Part",
            "requestingDoctor": "Requesting Doctor",
            "clinicalIndication": "Clinical Indication",
            "status": "Status",
            "completed": "Completed",
            "downloadFailed": "Failed to download image. Please try again.",
            "deleteConfirm": "Are you sure you want to delete this Ultrasound image?",
            "deleteSuccess": "Ultrasound image deleted successfully",
            "deleteError": "Failed to delete Ultrasound image"
        },

        // Validation and error messages
        "invalidFileType": "Please select a valid image file (JPEG, PNG, TIFF, PDF, or DICOM)",
        "fileTooLarge": "File size must be less than 50MB",
        "fillRequiredFields": "Please fill in all required fields and upload an image",
        "uploadError": "An error occurred while uploading the Ultrasound image. Please try again.",

        // Success messages
        "success": {
            "title": "Success",
            "saved": "Ultrasound record saved successfully!"
        },

        // Upload progress
        "uploading": "Uploading...",
        "uploadingUltrasound": "Uploading Ultrasound image...",
        "processing": "Processing...",

        // Security notice
        "securityNotice": "🔒 All uploaded files are encrypted and comply with medical data protection standards",
        "selectPatient": "Select Patient",
        "searchPatientPlaceholder": "Search patient by name...",
        "selectPatientOption": "Choose a patient..."
    },

    audiometry: {
        // Page titles and descriptions
        "pageTitle": "Audiometry Test Upload System",
        "pageDescription": "Securely upload and manage audiometry test results",
        "title": "Audiometry",
        "subtitle": "Submit audiometry test results with notes",
        "uploadAudiometryImage": "Upload Audiometry Image",

        // SEO
        "seo": {
            "title": "Audiometry Services - Bethlehem Medical Center",
            "description": "Submit audiometry test results",
            "keywords": "audiometry, hearing test"
        },

        // Patient Information
        "patientInfo": {
            "title": "Patient Information",
            "searchPatient": "Search Patient",
            "searchPlaceholder": "Search by name, email, or ID number...",
            "noPatientsFound": "No patients found",
            "patientSelected": "Patient Selected",
            "name": "Name",
            "email": "Email",
            "id": "ID",
            "dob": "DOB",
            "gender": "Gender",
            "dateOfBirth": "Date of Birth",
            "manualName": "Patient Name (Manual Entry)",
            "namePlaceholder": "Enter patient full name",
            "manualDob": "Date of Birth (Manual Entry)"
        },

        // Doctor Information
        "doctorInfo": {
            "title": "Requesting Doctor",
            "searchPlaceholder": "Search by doctor name, specialty, or email...",
            "noDoctorsFound": "No doctors found",
            "doctorSelected": "Doctor Selected",
            "drPrefix": "Dr.",
            "name": "Name",
            "specialty": "Specialty",
            "clinic": "Clinic",
            "email": "Email",
            "phone": "Phone"
        },

        // Notes
        "notes": {
            "title": "Notes",
            "placeholder": "Enter audiometry test notes and findings..."
        },

        // Hearing Exam ABR
        "hearingExam": {
            "title": "Hearing Exam ABR",
            "ear": "Ear",
            "passed": "Passed",
            "failed": "Failed",
            "leftEar": "LT Ear",
            "rightEar": "RT Ear"
        },

        // Actions
        "actions": {
            "saveRecord": "Save Record",
            "resetForm": "Reset Form"
        },

        // Errors
        "errors": {
            "searchError": "Search Error",
            "doctorSearchFailed": "Failed to search doctors. Please try again.",
            "patientSearchFailed": "Failed to search patients. Please try again.",
            "missingData": "Missing Data",
            "selectFile": "Please upload an image file.",
            "selectResult": "Please select at least one exam result.",
            "patientRequired": "Please select a patient or enter patient name.",
            "dobRequired": "Please enter patient date of birth.",
            "selectPatientFromList": "Please select a patient from the search results. Manual entry requires patient registration first.",
            "saveFailed": "Save Failed",
            "tryAgain": "Failed to save Audiometry record. Please try again."
        },

        // Success messages
        "success": {
            "title": "Success",
            "saved": "Audiometry record saved successfully."
        },

        // Upload progress
        "uploading": "Uploading...",
        "uploadingAudiometry": "Uploading audiometry image...",
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
        userDistributionByRole: 'Distribution Of Users By Roles',
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
        ultrasoundTechnicians: 'Ultrasound Technicians',
        audiometryTechnicians: 'Audiometry Technicians',

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
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December',
        sunday: 'Sun',
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        doctorCalendar: 'Doctor Calendar',
        showOfficeHours: 'Show Office Hours',
        manageAppointmentSchedules: 'Manage appointment schedules for all doctors',
        selectDoctor: 'Select Doctor',
        allDoctors: 'All Doctors',
        todaysAppointments: "Today's Appointments",
        noAppointmentsToday: 'No appointments today',
        doctorStats: 'Doctor Statistics',
        availableDoctors: 'Available',
        scheduleAppointment: 'Schedule Appointment',
        viewClinics: 'View Clinics',
        withDoctor: 'with',
        today: 'Today',
        noAppointments: 'No appointments',
        viewAllAppointments: 'View All Appointments',
        upcomingAppointments: 'Upcoming Appointments',
        noUpcomingAppointments: 'No upcoming appointments',
        appointmentsFor: 'Appointments for',
        weeklyCalendar: 'Weekly Calendar',
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
        emailAlreadyExists: "This email is already in use by another user",
        phoneAlreadyExists: "This phone number is already in use by another user",
        // Search and actions
        searchPlaceholder: 'Search users...',
        addUser: 'Add User',
        loading: 'Loading users...',
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
        authDeletionFailed: 'Auth user deletion failed. Please delete manually from Supabase Auth.',
        unexpectedError: 'An unexpected error occurred. Please try again.',

        // Real-time name validation errors
        englishNameErrorTitle: 'English Name Error',
        englishNameErrorDesc: 'Please enter only English letters',
        arabicNameErrorTitle: 'Arabic Name Error',
        arabicNameErrorDesc: 'Please enter only Arabic letters ',
        // Phone validation errors
        phoneInvalidTitle: 'Invalid Phone Number',
        phoneInvalidDesc: 'Phone number must start with +970 or +972 and be followed by exactly 9 digits',

        // Activity log messages
        userCreated: 'User Created',
        userUpdated: 'User Updated',
        userDeleted: 'User Deleted',

        validationErrors: "Validation Errors",
        englishFirstNameInvalid: "First name must contain only English letters",
        englishSecondNameInvalid: "Second name must contain only English letters.",
        englishThirdNameInvalid: "Third name must contain only English letters.",
        englishLastNameInvalid: "Last name must contain only English letters.",
        arabicFirstNameInvalid: "Arabic first name must contain only Arabic letters.",
        arabicSecondNameInvalid: "Arabic second name must contain only Arabic letters.",
        arabicThirdNameInvalid: "Arabic third name must contain only Arabic letters.",
        arabicLastNameInvalid: "Arabic last name must contain only Arabic letters.",
        palestinianIdInvalid: "ID number must be exactly 9 digits.",
        palestinianPhoneInvalid: "Phone number must be +970 followed by 9 digits.",
        ageMinimum: "User must be at least 16 years old.",

        // Additional validation errors
        firstLastNameRequired: "First and last names in English are required",
        englishLettersOnly: "Please enter only English letters ",
        arabicLettersOnly: "Please enter only Arabic letters ",
        idNumberMustBe9Digits: "ID number must be exactly 9 digits",
        strongPasswordRequired: "Password must contain uppercase, lowercase, numbers, and special characters",
        failedToLoadUsers: "Failed to load users from database",

        // Patient creation validation errors
        patientMustBe16YearsOld: "Patient must be at least 16 years old",
        failedToLoadPatientList: "Failed to load patient list",
        emailAlreadyInUse: "This email address is already in use",
        idNumberAlreadyInUse: "This ID number is already in use",
        enterSearchTerm: "Please enter a search term",
        failedToSearchPatients: "Failed to search for patients",
        allergyAlreadyAdded: "This allergy is already in the list",
        enterValidWeight: "Please enter a valid weight between 1-220 kg",
        enterValidHeight: "Please enter a valid height between 1-200 cm",
        failedToSaveSocialSituation: "Failed to save social situation",
        cannotDeterminePatient: "Cannot determine which patient to update",
        invalidId: 'Invalid ID Number',
        invalidIdDesc: 'This ID number is not valid according to Palestinian ID standards.',
    },
    clinicManagement: {
        // Main titles
        title: 'Clinic Management',
        clinicsManagement: 'Clinics Management',
        clinicCategories: 'Clinic Categories',
        displayOrder: "Display Order",
        displayOrderPlaceholder: "0 = first position",
        displayOrderDescription: "Lower numbers appear first",
        moveUp: "Move Up",
        moveDown: "Move Down",
        orderUpdated: "Order updated successfully",
        orderUpdateFailed: "Failed to update order",
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
        cannotDeleteClinicWithDoctors: 'Cannot delete clinic. Please remove these doctors first: {{doctorNames}}',
        cannotDeleteCategoryWithClinics: 'This category is used by the following clinic(s): {{clinics}}. Please reassign those clinics first.',
        cannotDelete: 'Cannot Delete',
        failedToCheckDoctors: 'Failed to check for doctors in clinic',

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
        startTimeMinimum: "Start time cannot be before 08:00",
        startTimeMaximum: "Start time cannot be after 20:00",
        endTimeMinimum: "End time cannot be before 08:00",
        endTimeMaximum: "End time cannot be after 20:00",
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
        pricePlaceholder: '1.00',
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
        noAvailabilitySlots: 'No slots added.',
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
        endTimeAfterStart: 'Time Invalid',

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
        phoneRequired: "Phone number is required.",
        // Confirmation dialog and toast for slot deletion
        confirmSlotDeletionTitle: 'Delete Time Slot?',
        confirmSlotDeletionDesc: 'Are you sure you want to delete this time slot for {{day}} ({{start}} - {{end}})?',
        slotDeletedTitle: 'Time Slot Deleted',
        slotDeletedDesc: 'The time slot was deleted successfully.',
        deleteSlot: 'Delete Slot'
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
        remindeinder: 'Reminder',
        reservationRequired: 'Please make a reservation before visiting our clinic.',
        bookNow: 'Book Now',
        userCreation: 'User Creation',
        patientInformation: 'Patient Information',
        saveInformation: 'Save Information',
        weight: 'Weight',
        height: 'Height',
        bloodType: 'Blood Type',
        commonDiseases: 'Chronic Diseases',
        medicinesTitle: 'Medicines',
        medicinesStatusQuestion: 'Is the patient currently taking medicines?',
        medicinesStatusYes: 'Yes',
        medicinesStatusNo: 'No',
        medicinesStatusHint: 'Toggle to Yes to select medicines from the list below.',
        patientLogs: 'Patient Activity Logs',
        information: 'Information',
        patientInfoUpdated: 'Patient information updated at',
        noActivityLogs: 'No activity logs yet',
        logs: {
            loadedPatientList: 'Loaded complete patient list ({{count}} patients)',
            errorLoadingPatientList: 'Error loading patient list: {{error}}',
            newPatientCreated: 'New patient created: {{patientName}} (ID: {{patientId}}) by {{user}} ({{role}})',
            failedToCreatePatient: 'Failed to create new patient: {{error}}',
            searchedForPatients: 'Searched for patients using "{{term}}" - Found {{count}} patient(s)',
            selectedPatient: 'Selected patient {{name}} (ID: {{id}})',
            errorNoUserLoggedIn: 'Error: No user logged in',
            healthInfoLoaded: 'Health information loaded - Created by {{createdBy}} ({{createdByRole}}), Last updated by {{updatedBy}} ({{updatedByRole}})',
            welcomeHealthInfo: 'Welcome! You can now enter your health information',
            errorLoadingHealthInfo: 'Error loading health information: {{error}}',
            healthInfoSaved: 'Health information saved for {{patientName}} by {{user}} ({{role}})',
            failedToSaveHealthInfo: 'Failed to save health information',
            errorSavingInfo: 'Error saving information'
        },
        diseases: {
            highBloodPressure: 'Hypertension',
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
        ultrasound: 'Ultrasound Technician',
        audiometry: 'Audiometry Technician',
        patient: 'Patient'
    },
    aboutUs: {
        ourFacility: 'Our Facility',
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
        averagePrice: 'Average Price',
        conflict: 'Conflict',
        timeSlotConflict: 'This clinic already has an appointment at this time.'
    },
    deletionRequest: {
        requestSubmitted: 'Deletion request submitted successfully. An admin will review it.',
        newDeletionRequest: 'New Deletion Request',
        deletionRequestMessage: '{{email}} has requested to delete user: {{userName}}',
        // ... (add other keys here if needed)
    },
    notifications: {
        markAllRead: 'Mark all read',
        showingFirst: 'Showing first {{count}} notifications',
        noNotifications: 'No notifications',
        noNotificationsDesc: 'You\'re all caught up! No new notifications.',
    },
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
        at: 'عند',
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
        retry: 'إعادة المحاولة',
        status: 'الحالة',
        active: 'نشط',
        inactive: 'غير نشط',
        available: 'متاح',
        unavailable: 'غير  متاح',
        // Clinical Notes
        diagnosis: 'التشخيص',
        general: 'عام',
        consultation: 'استشارة',
        treatment: 'علاج',
        goBack: 'العودة',
        notes: 'الملاحظات',
        image: 'الصورة',

        // Status translations
        pending: 'قيد الانتظار',
        paid: 'مدفوع',
        completed: 'مكتمل',
        cancelled: 'ملغى',
        failed: 'فشل',
        refunded: 'مسترد',

        // Priority translations
        low: 'منخفض',
        medium: 'متوسط',
        high: 'عالي',
        urgent: 'عاجل',

        // Note type translations
        followUp: 'متابعة',
        clinicalNoteAdded: 'تم إضافة الملاحظة السريرية بنجاح!',
        clinicalNoteUpdated: 'تم تحديث الملاحظة السريرية بنجاح!',
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
        close: 'إغلاق',
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
    payment: {
        // تنبيه الأمان
        securePayment: 'دفع آمن',
        allTransactionsEncrypted: 'تتم جميع الدفعات نقدًا وبشكل آمن في العيادة.',

        selectedClinic: 'العيادة المختارة',
        selectedDoctor: 'الطبيب المختار',
        selectedSpecialty: 'التخصص المختار',
        selectedDay: 'اليوم المختار',
        selectedTime: 'الوقت المختار',

        // Additional missing translations
        paymentMethod: 'طريقة الدفع',
        // ملخص الموعد
        appointmentSummary: 'ملخص الموعد',
        reviewAppointmentDetails: 'يرجى مراجعة تفاصيل موعدك',
        clinic: 'العيادة',
        doctor: 'الطبيب',
        specialty: 'التخصص',
        day: 'اليوم',
        time: 'الوقت',
        totalAmount: 'المبلغ الإجمالي',

        // اختيار طريقة الدفع
        choosePaymentMethod: 'اختر طريقة الدفع المفضلة لديك',
        creditCard: 'بطاقة ائتمان',
        paypal: 'باي بال',
        insurance: 'التأمين',
        cash: 'نقدي',

        // نموذج بطاقة الائتمان
        cardNumber: 'رقم البطاقة',
        nameOnCard: 'الاسم على البطاقة',
        cardNamePlaceholder: 'جون دو',
        expiryDate: 'تاريخ الانتهاء',
        cvv: 'الرمز الأمني',
        payNow: 'ادفع الآن',
        processing: 'جارٍ المعالجة...',

        // باي بال
        continueWithPaypal: 'متابعة مع PayPal لإكمال الدفع',
        payWithPaypal: 'ادفع بـ PayPal',

        // التأمين
        insuranceProvider: 'مقدم التأمين',
        selectInsuranceProvider: 'اختر مقدم التأمين الخاص بك',
        policyNumber: 'رقم البوليصة',
        policyNumberPlaceholder: 'رقم البوليصة',
        memberID: 'رقم العضوية',
        memberIDPlaceholder: 'رقم العضوية',
        verifyingInsurance: 'جارٍ التحقق من التأمين...',
        submitInsurance: 'إرسال بيانات التأمين',
        other: 'أخرى',

        // الدفع النقدي
        cashPaymentInformation: 'معلومات الدفع النقدي',
        cashPaymentNote: 'يرجى ملاحظة أنه باختيار الدفع النقدي، فإنك توافق على إحضار المبلغ الدقيق (₪{{price}}) إلى موعدك.',
        paymentAtReception: 'يجب سداد الدفع في استقبال العيادة قبل موعدك',
        onlyCashShekel: 'يتم قبول النقد بالشيكل الإسرائيلي (₪) فقط',
        receiptProvided: 'سيتم تقديم إيصال بعد الدفع',
        failureToPayMayReschedule: 'عدم إحضار الدفع قد يؤدي إلى إعادة جدولة موعدك',
        agreeToTerms: 'أفهم وأوافق على شروط الدفع النقدي',
        confirmCashPayment: 'تأكيد الدفع النقدي',

        // التذييل
        back: 'العودة',
        dataProtected: 'بياناتك محمية',
        loadingPaymentInfo: 'جاري تحميل معلومات الدفع...',

        // إدارة المدفوعات
        paymentManagement: {
            totalRevenue: "إجمالي الإيرادات",
            fromCompletedPayments: "من المدفوعات المكتملة",
            pendingPayments: "المدفوعات قيد الانتظار",
            awaitingPayment: "بانتظار الدفع",
            todayRevenue: "إيرادات اليوم",
            todayOnly: "اليوم فقط",
            averagePayment: "متوسط الدفع",
            perAppointment: "لكل موعد",
            filters: "الفلاتر",
            searchPayments: "البحث في المدفوعات...",
            paymentStatus: "حالة الدفع",
            allStatuses: "جميع الحالات",
            pending: "قيد الانتظار",
            completed: "مكتمل",
            failed: "فشل",
            refunded: "مسترد",
            dateRange: "نطاق التاريخ",
            allDates: "جميع التواريخ",
            today: "اليوم",
            thisWeek: "هذا الأسبوع",
            thisMonth: "هذا الشهر",
            export: "تصدير",
            paymentsList: "قائمة المدفوعات",
            confirmationNumber: "رقم التأكيد",
            patient: "المريض",
            patientName: "اسم المريض",
            patientEmail: "البريد الإلكتروني للمريض",
            patientPhone: "هاتف المريض",
            appointment: "الموعد",
            appointmentDate: "تاريخ الموعد",
            appointmentTime: "وقت الموعد",
            amount: "المبلغ",
            paymentMethod: "طريقة الدفع",
            createdAt: "تاريخ الإنشاء",
            clinicName: "اسم العيادة",
            doctorName: "اسم الطبيب",
            specialty: "التخصص",
            bookingStatus: "حالة الحجز",
            lastUpdated: "آخر تحديث",
            noPaymentsFound: "لم يتم العثور على مدفوعات",
            noPaymentsYet: "لم يتم تسجيل أي مدفوعات بعد.",
            noMatchingPayments: "لا توجد مدفوعات تطابق الفلاتر الحالية.",
            paymentDetails: "تفاصيل الدفع",
            paymentDetailsDesc: "معلومات تفصيلية عن هذا الدفع",
            markPaymentCompleted: "تحديد الدفع كمكتمل",
            markPaymentCompletedDesc: "تأكيد استلام الدفع النقدي في العيادة",
            markAsCompleted: "تحديد كمكتمل",
            paymentMarkedCompleted: "تم تحديد الدفع كمكتمل",
            paymentMarkedCompletedDesc: "تم تحديث حالة الدفع بنجاح",
            errorLoadingPayments: "خطأ في تحميل بيانات الدفع",
            errorMarkingPayment: "خطأ في تحديد الدفع كمكتمل",
            title: "إدارة المدفوعات",
            completedPayments: "المدفوعات المكتملة",
            failedPayments: "المدفوعات الفاشلة",
            monthlyRevenue: "الإيرادات الشهرية",
            actions: "الإجراءات"
        },

        // إشعارات المدفوعات
        paymentNotification: {
            completed: 'تم إتمام الدفع بنجاح',
            pending: 'الدفع قيد الانتظار - يرجى الدفع في العيادة',
            failed: 'فشل الدفع - يرجى المحاولة مرة أخرى',
            refunded: 'تم استرداد المبلغ',
            unknown: 'حالة الدفع غير معروفة',
            markCompleted: 'تعليم كمكتمل',
        },

        // قائمة المرضى المدفوعين
        paidPatients: {
            paidPatients: 'المرضى المدفوعين',
            pendingPayments: 'المدفوعات قيد الانتظار',
            todayAppointments: 'مواعيد اليوم',
            allPatients: 'جميع المرضى',
            searchPatients: 'البحث عن المرضى...',
            allStatuses: 'جميع الحالات',
            paid: 'مدفوع',
            pending: 'قيد الانتظار',
            failed: 'فاشل',
            completed: 'مكتمل',
            confirmation: 'تأكيد',
            noPatientsFound: 'لم يتم العثور على مرضى مطابقين لمعاييرك',
            markedPaid: 'تم تعليم الدفع كمكتمل',
            cashPaymentReceived: 'تم استلام الدفعة النقدية',
            markPaid: 'تعليم كمكتمل',
            markCashPayment: 'تعليم الدفع النقدي كمكتمل',
            confirmCashReceived: 'تأكيد أنك استلمت الدفعة النقدية:',
            amount: 'المبلغ',
            marking: 'جاري التعليم...',
            markAsPaid: 'تعليم كمكتمل',
            patientId: 'رقم المريض',
            searchByPatientId: 'البحث برقم المريض...',
            markPaidError: 'فشل في تعليم الدفع كمكتمل. يرجى المحاولة مرة أخرى.',
        },

        // الترجمات المشتركة
        common: {
            refresh: 'تحديث',
            cancel: 'إلغاء',
            patient: 'المريض',
            search: 'البحث',
            actions: 'الإجراءات',
            loading: 'جارٍ التحميل...',
            retry: 'إعادة المحاولة',
            error: 'خطأ'
        },

        // ترجمات الدفع
        payment: {
            markedPaid: 'تم تعليم الدفع كمكتمل',
            cashPaymentReceived: 'تم استلام الدفعة النقدية',
            markPaid: 'تعليم كمكتمل',
            markCashPayment: 'تعليم الدفع النقدي كمكتمل',
            confirmCashReceived: 'تأكيد أنك استلمت الدفعة النقدية:',
            amount: 'المبلغ',
            marking: 'جاري التعليم...',
            markAsPaid: 'تعليم كمكتمل',
            error: 'خطأ',
            markPaidError: 'فشل في تعليم الدفع كمكتمل. يرجى المحاولة مرة أخرى.',
        },

        // أيام الأسبوع
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد',

        // تخصصات طبية شائعة
        dentist: 'طبيب أسنان',
        dentistSpecialty: 'طب الأسنان',
        pediatrics: 'طب الأطفال',
        cardiology: 'أمراض القلب',
        dermatology: 'الأمراض الجلدية',
        neurology: 'طب الأعصاب',
        orthopedics: 'جراحة العظام',
        psychiatry: 'الطب النفسي',
        gynecology: 'أمراض النساء',
        urology: 'المسالك البولية',
        ophthalmology: 'طب العيون',
        radiology: 'طب الأشعة',
        surgery: 'الجراحة',
        emergency: 'طب الطوارئ',
        family: 'طب الأسرة',
        internal: 'الطب الباطني',
        general: 'عام',
        anesthesiology: 'التخدير',
        oncology: 'علاج الأورام',
        endocrinology: 'الغدد الصماء',
        pulmonology: 'أمراض الرئة',
        gastroenterology: 'أمراض الجهاز الهضمي',
        nephrology: 'أمراض الكلى',
        rheumatology: 'أمراض الروماتيزم',
        hematology: 'أمراض الدم',
        immunology: 'المناعة',
        pathology: 'علم الأمراض',
        pharmacology: 'علم الأدوية',
        physiotherapy: 'العلاج الطبيعي',
        laboratory: 'المختبر',

        // أسماء عيادات شائعة
        bethlehemMedCenter: 'مركز بيت لحم الطبي',
        alMakassedHospital: 'مستشفى المقاصد',
        hadassahHospital: 'مستشفى هداسا',
        alShifaHospital: 'مستشفى الشفاء',
        ramallahHospital: 'مستشفى رام الله',

        // أسماء أطباء شائعة (أمثلة)
        bisharaBabish: 'بشارة بابيش',
        ahmedMohammed: 'أحمد محمد',
        fatimaAli: 'فاطمة علي',
        omarHassan: 'عمر حسن',
        mariamIbrahim: 'مريم إبراهيم',
        issaHandal: 'عيسى حندل',
    },
    paymentManagement: {
        totalRevenue: "Total Revenue",
        fromCompletedPayments: "From completed payments",
        pendingPayments: "Pending Payments",
        awaitingPayment: "Awaiting payment",
        todayRevenue: "Today's Revenue",
        todayOnly: "Today only",
        averagePayment: "Average Payment",
        perAppointment: "Per appointment",
        filters: "Filters",
        searchPayments: "Search payments...",
        paymentStatus: "Payment Status",
        allStatuses: "All Statuses",
        pending: "Pending",
        completed: "Completed",
        failed: "Failed",
        refunded: "Refunded",
        dateRange: "Date Range",
        allDates: "All Dates",
        today: "Today",
        thisWeek: "This Week",
        thisMonth: "This Month",
        export: "Export",
        paymentsList: "Payments List",
        confirmationNumber: "Confirmation #",
        patient: "Patient",
        patientName: "Patient Name",
        patientEmail: "Patient Email",
        patientPhone: "Patient Phone",
        appointment: "Appointment",
        appointmentDate: "Appointment Date",
        appointmentTime: "Appointment Time",
        amount: "Amount",
        paymentMethod: "Payment Method",
        createdAt: "Created At",
        clinicName: "Clinic Name",
        doctorName: "Doctor Name",
        specialty: "Specialty",
        bookingStatus: "Booking Status",
        lastUpdated: "Last Updated",
        noPaymentsFound: "No payments found",
        noPaymentsYet: "No payments have been recorded yet.",
        noMatchingPayments: "No payments match your current filters.",
        paymentDetails: "Payment Details",
        paymentDetailsDesc: "Detailed information about this payment",
        markPaymentCompleted: "Mark Payment as Completed",
        markPaymentCompletedDesc: "Confirm that the cash payment has been received at the clinic",
        markAsCompleted: "Mark as Completed",
        paymentMarkedCompleted: "Payment Marked as Completed",
        paymentMarkedCompletedDesc: "Payment status updated successfully",
        errorLoadingPayments: "Error loading payment data",
        errorMarkingPayment: "Error marking payment as completed"
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
    "paymentSuccess": {
        "paymentSuccessful": "تم الدفع بنجاح",
        "paypalProcessedSuccessfully": "تم معالجة دفعتك عبر PayPal بنجاح.",
        "paymentError": "خطأ في الدفع",
        "paymentProcessingFailed": "فشل في معالجة الدفع",
        "processingPayPalPayment": "معالجة دفع PayPal",
        "pleaseWaitConfirming": "يرجى الانتظار بينما نؤكد دفعتك...",
        "paymentFailed": "فشل الدفع",
        "errorProcessingPayment": "حدث خطأ أثناء معالجة دفعتك",
        "tryAgain": "حاول مرة أخرى",
        "backToClinics": "العودة إلى العيادات",
        "paymentSuccessfulTitle": "تم الدفع بنجاح!",
        "appointmentConfirmedAndPaid": "تم تأكيد موعدك ودفع الرسوم.",
        "appointmentDetails": "تفاصيل الموعد",
        "clinic": "العيادة",
        "doctor": "الطبيب",
        "date": "التاريخ",
        "time": "الوقت",
        "amountPaid": "المبلغ المدفوع",
        "paymentMethod": "طريقة الدفع",
        "paypal": "باي بال",
        "transactionId": "رقم المعاملة",
        "viewMyAppointments": "عرض مواعيدي",
        "bookAnotherAppointment": "حجز موعد آخر",
        "cashPaymentRegistered": "Cash Payment Registered",
        "appointmentScheduledPayAtClinic": "Your appointment has been scheduled. Please pay at the clinic.",

    },
    "paymentCancel": {
        "paymentCancelled": "تم إلغاء الدفع",
        "paypalCancelledNoCharges": "تم إلغاء دفع PayPal الخاص بك. لم يتم خصم أي رسوم.",
        "paymentCancelledTitle": "تم إلغاء الدفع",
        "cancelledPaymentDescription": "لقد ألغيت عملية دفع PayPal. لم يتم خصم أي رسوم من حسابك.",
        "appointmentNotConfirmed": "لم يتم تأكيد موعدك.",
        "tryDifferentMethodOrBookLater": "يمكنك تجربة طريقة دفع مختلفة أو الحجز مرة أخرى لاحقاً.",
        "tryDifferentPaymentMethod": "جرب طريقة دفع مختلفة",
        "backToClinics": "العودة إلى العيادات"
    },
    auth: {
        welcomeBack: 'مرحبًا بعودتك',
        enterCredentials2: 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك',
        dontHaveAccount: 'ليس لديك حساب؟',
        alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
        createAccount: 'إنشاء حساب',
        invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        loginFailed: "فشل تسجيل الدخول",
        loginRequired: "يرجى تسجيل الدخول لعرض سجلاتك الطبية.",
        login: "تسجيل الدخول",
        accessDenied: "تم رفض الوصول",
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
        arabicLettersOnly: "الأسماء العربية يجب أن تحتوي على أحرف عربية فقط",
        // Phone validation errors
        phoneInvalidTitle: 'رقم هاتف غير صحيح',
        phoneInvalidDesc: 'يجب أن يبدأ رقم الهاتف بـ +970 أو +972 ويتبعه 9 أرقام فقط'
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
        ultrasound: 'الموجات فوق الصوتية',
        audiometry: 'قياس السمع',
        adminDashboard: 'لوحة تحكم المسؤول',
        secretaryDashboard: 'لوحة تحكم السكرتير',
        doctorLabs: 'نتائج المختبر',
        doctorXRay: 'صور الأشعة',
        doctorUltrasound: 'صور الموجات فوق الصوتية',
        doctorAudiometry: 'صور قياس السمع',
        patients: 'المرضى',
        myAppointments: 'مواعيدي',
        myRecords: 'سجلاتي الطبية',
    },
    doctorPages: {
        // Lab Results Page
        downloadFailed: "فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.",
        noImageUrl: "لا يوجد رابط للصورة",
        imageNotAvailable: 'الصورة غير متوفرة',
        labResults: 'نتائج المختبر',
        labResultsDesc: 'عرض وإدارة نتائج فحوصات المرضى المخبرية',
        viewLabResults: 'عرض نتائج المختبر',
        downloadReport: 'تحميل التقرير',
        labTestDetails: 'تفاصيل الفحص المخبري',
        patientInformation: 'معلومات المريض',
        testInformation: 'معلومات الفحص',

        // X-Ray Page
        xrayImages: 'صور الأشعة',
        xrayImagesDesc: 'عرض وتحليل صور الأشعة للمرضى',
        searchPatientsXray: 'البحث عن المرضى أو أجزاء الجسم...',
        allBodyParts: 'جميع أجزاء الجسم',
        loadingXrayImages: 'جارٍ تحميل صور الأشعة...',
        downloadImage: 'تحميل',
        deleting: 'جارٍ الحذف...',
        deleteSuccess: 'تم حذف الصورة',
        deleteSuccessDesc: 'تم حذف صورة الأشعة بنجاح.',
        deleteFailed: 'فشل في حذف الصورة.',
        confirmDeleteTitle: 'حذف صورة الأشعة؟',
        confirmDeleteDesc: 'هل أنت متأكد من أنك تريد حذف صورة الأشعة هذه؟ لا يمكن التراجع عن هذا الإجراء.',
        zoomIn: 'تكبير',
        zoomOut: 'تصغير',
        rotate: 'دوران',
        examInformation: 'معلومات الفحص',
        requestingDoctor: 'الطبيب الطالب',
        noXrayImagesFound: 'لم يتم العثور على صور أشعة تطابق المعايير.',
        noXrayImagesUploaded: 'لم يتم رفع أي صور أشعة بعد.',
        tryAdjustingSearch: 'حاول تعديل معايير البحث أو التصفية.',

        // Body part categories for DoctorXRayPage (matching XRay component categories)
        bodyPartCategories: {
            skull: 'الجمجمة',
            facialBones: 'العظام الوجهية',
            cervicalSpine: 'العمود الفقري العنقي',
            thoracicSpine: 'العمود الفقري الصدري',
            lumbarSpine: 'العمود الفقري القطني',
            sternum: 'عظم القص',
            ribs: 'الأضلاع',
            shoulder: 'الكتف',
            arm: 'الذراع',
            hand: 'اليد',
            pelvis: 'الحوض',
            thigh: 'الفخذ',
            leg: 'الساق',
            foot: 'القدم'
        },

        // Ultrasound Page
        ultrasoundImages: 'صور الموجات فوق الصوتية',
        ultrasoundImagesDesc: 'عرض وتحليل صور الموجات فوق الصوتية للمرضى',
        searchPatientsUltrasound: 'البحث عن المرضى أو أجزاء الجسم...',
        loadingUltrasoundImages: 'جارٍ تحميل صور الموجات فوق الصوتية...',
        noUltrasoundImagesFound: 'لم يتم العثور على صور موجات فوق الصوتية تطابق المعايير.',
        noUltrasoundImagesUploaded: 'لم يتم رفع أي صور موجات فوق الصوتية بعد.',
        confirmDeleteTitleUltrasound: 'حذف صورة الموجات فوق الصوتية؟',
        confirmDeleteDescUltrasound: 'هل أنت متأكد من حذف صورة الموجات فوق الصوتية هذه؟ لا يمكن التراجع عن هذا الإجراء.',
        audiometryImages: 'صور قياس السمع',
        audiometryImagesDesc: 'عرض وتحليل صور قياس السمع للمرضى',
        searchPatientsAudiometry: 'البحث عن المرضى أو الملاحظات...',
        loadingAudiometryImages: 'جارٍ تحميل صور قياس السمع...',
        noAudiometryImagesFound: 'لم يتم العثور على صور قياس السمع التي تطابق معايير البحث الخاصة بك.',
        noAudiometryImagesUploaded: 'لم يتم رفع أي صور قياس السمع بعد.',
        deleteConfirmTitleAudiometry: 'حذف صورة قياس السمع؟',
        deleteConfirmAudiometry: 'هل أنت متأكد من حذف صورة قياس السمع هذه؟ لا يمكن التراجع عن هذا الإجراء.',
        testResults: 'نتائج الفحوصات',
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
        viewImage: 'عرض',
        xrayDetails: 'تفاصيل الأشعة',
        clinicalIndication: 'السبب السريري',
        findings: 'النتائج',
        impression: 'الانطباع',
        bodyPart: 'جزء الجسم',
        radiologist: 'أخصائي الأشعة',
        imagesFound: 'صورة موجودة',
        normal: 'طبيعي',
        abnormal: 'غير طبيعي',
        dateOfBirth: 'تاريخ الميلاد',
    },

    preview: {
        pageTitle: 'سجلاتي الطبية - مركز بيت لحم الطبي',
        pageDescription: 'عرض مواعيدك الطبية، الملاحظات، نتائج المختبر، وصور الأشعة',
        pageKeywords: 'السجلات الطبية، بوابة المريض، المواعيد، نتائج المختبر، صور الأشعة',
        title: 'سجلاتي الطبية',
        subtitle: 'عرض مواعيدك، الملاحظات الطبية، نتائج المختبر، وصور الأشعة',
        patientInfo: 'معلومات المريض',
        accessDenied: 'هذه الصفحة متاحة للمرضى والمسؤولين فقط.',

        // Tab labels
        appointments: 'المواعيد',
        notes: 'الملاحظات الطبية',
        labs: 'نتائج المختبر',
        xrays: 'صور الأشعة',
        ultrasound: 'الموجات فوق الصوتية',
        audiometry: 'قياس السمع',

        // Appointments tab
        noAppointmentsFound: 'لا توجد مواعيد مسجلة',
        paymentStatus: 'حالة الدفع',
        clinic: 'العيادة',
        specialty: 'التخصص',
        date: 'التاريخ',
        time: 'الوقت',
        price: 'السعر',
        created: 'تاريخ الإنشاء',

        // Notes tab
        noMedicalNotesFound: 'لا توجد ملاحظات طبية',
        noteType: 'نوع الملاحظة',
        priority: 'الأولوية',
        status: 'الحالة',
        diagnosis: 'التشخيص',
        treatmentPlan: 'خطة العلاج',
        medications: 'الأدوية',
        followUpDate: 'تاريخ المتابعة',
        downloadReport: 'تحميل التقرير',

        // Labs tab
        noLabResultsFound: 'لا توجد نتائج مختبر',
        testType: 'نوع الفحص',
        bloodType: 'فصيلة الدم',
        testResults: 'نتائج الفحص',
        doctorNotes: 'ملاحظات الطبيب',

        // X-rays tab
        noXrayImagesFound: 'لا توجد صور أشعة',
        requestingDoctor: 'الطبيب المطلوب',
        clinicalIndication: 'المؤشرات السريرية',
        imageNotAvailable: 'الصورة غير متاحة',
    },
    footer: {
        rights: 'جميع الحقوق محفوظة',
        privacyPolicy: 'سياسة الخصوصية وملفات تعريف الارتباط',
        termsOfUse: 'الشروط والأحكام',
        contactUs: 'اتصل بنا',
        quickLinks: 'شروط الاستخدام والسياسات',
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
        patientHealth: "السجلات الصحية ",
        // Add these lines to the existing admin section  
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
        userDistributionByRole: 'توزيع المستخدمين حسب الأدوار',
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
        ultrasoundTechnicians: 'فنيو الموجات فوق الصوتية',
        audiometryTechnicians: 'فنيو قياس السمع',

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
        january: 'يناير',
        february: 'فبراير',
        march: 'مارس',
        april: 'أبريل',
        may: 'مايو',
        june: 'يونيو',
        july: 'يوليو',
        august: 'أغسطس',
        september: 'سبتمبر',
        october: 'أكتوبر',
        november: 'نوفمبر',
        december: 'ديسمبر',
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        doctorCalendar: 'تقويم الأطباء',
        showOfficeHours: 'إظهار ساعات العمل',
        manageAppointmentSchedules: 'إدارة جداول مواعيد جميع الأطباء',
        selectDoctor: 'اختر الطبيب',
        allDoctors: 'جميع الأطباء',
        todaysAppointments: 'مواعيد اليوم',
        noAppointmentsToday: 'لا توجد مواعيد اليوم',
        doctorStats: 'إحصائيات الأطباء',
        availableDoctors: 'المتاحون',
        scheduleAppointment: 'جدولة موعد',
        viewClinics: 'عرض العيادات',
        withDoctor: 'مع الطبيب',
        today: 'اليوم',
        noAppointments: 'لا توجد مواعيد',
        viewAllAppointments: 'عرض جميع المواعيد',
        upcomingAppointments: 'المواعيد القادمة',
        noUpcomingAppointments: 'لا توجد مواعيد قادمة',
        appointmentsFor: 'Appointments for',
        weeklyCalendar: 'التقويم الأسبوعي',
    },
    usersManagement: {
        // Main titles and descriptions
        title: 'إدارة المستخدمين',
        description: 'إدارة جميع حسابات المستخدمين لبوابة العيادة',

        // Search and actions
        searchPlaceholder: 'البحث في المستخدمين...',
        addUser: 'إضافة مستخدم',
        loading: 'جارٍ تحميل المستخدمين...',
        loadingUsers: 'جارٍ تحميل المستخدمين...',
        emailAlreadyExists: "هذا البريد الإلكتروني مستخدم بالفعل من قبل مستخدم آخر",
        phoneAlreadyExists: "رقم الهاتف هذا مستخدم بالفعل من قبل مستخدم آخر",
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
        authDeletionFailed: 'فشل في حذف مستخدم المصادقة. يرجى الحذف يدوياً من Supabase Auth.',
        unexpectedError: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',

        // Real-time name validation errors
        englishNameErrorTitle: 'خطأ في الاسم الإنجليزي',
        englishNameErrorDesc: 'يرجى إدخال أحرف إنجليزية فقط بدون أرقام',
        arabicNameErrorTitle: 'خطأ في الاسم العربي',
        arabicNameErrorDesc: 'يرجى إدخال أحرف عربية فقط بدون أرقام',
        // Phone validation errors
        phoneInvalidTitle: 'رقم هاتف غير صحيح',
        phoneInvalidDesc: 'يجب أن يبدأ رقم الهاتف بـ +970 أو +972 ويتبعه 9 أرقام فقط',

        // Activity log messages
        userCreated: 'تم إنشاء مستخدم',
        userUpdated: 'تم تحديث مستخدم',
        userDeleted: 'تم حذف مستخدم',

        validationErrors: "أخطاء في التحقق",
        englishFirstNameInvalid: "الاسم الأول يجب أن يحتوي على أحرف إنجليزية  .",
        englishSecondNameInvalid: "الاسم الثاني يجب أن يحتوي على أحرف إنجليزية  .",
        englishThirdNameInvalid: "الاسم الثالث يجب أن يحتوي على أحرف إنجليزية  .",
        englishLastNameInvalid: "اسم العائلة يجب أن يحتوي على أحرف إنجليزية  .",
        arabicFirstNameInvalid: "الاسم الأول بالعربية يجب أن يحتوي على أحرف عربية  .",
        arabicSecondNameInvalid: "الاسم الثاني بالعربية يجب أن يحتوي على أحرف عربية  .",
        arabicThirdNameInvalid: "الاسم الثالث بالعربية يجب أن يحتوي على أحرف عربية  .",
        arabicLastNameInvalid: "اسم العائلة بالعربية يجب أن يحتوي على أحرف عربية  .",
        palestinianIdInvalid: "رقم الهوية يجب أن يكون 9 أرقام بالضبط.",
        palestinianPhoneInvalid: "رقم الهاتف يجب أن يبدأ بـ +970 متبوعاً بـ 9 أرقام.",
        ageMinimum: "يجب أن يكون عمر المستخدم 16 سنة على الأقل.",

        // Additional validation errors
        firstLastNameRequired: "الاسم الأول والأخير باللغة الإنجليزية مطلوبان",
        englishLettersOnly: "يرجى إدخال أحرف إنجليزية فقط بدون أرقام",
        arabicLettersOnly: "يرجى إدخال أحرف عربية فقط بدون أرقام",
        idNumberMustBe9Digits: "رقم الهوية يجب أن يكون 9 أرقام بالضبط",
        strongPasswordRequired: "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة",
        failedToLoadUsers: "فشل في تحميل المستخدمين من قاعدة البيانات",

        // Patient creation validation errors
        patientMustBe16YearsOld: "يجب أن يكون عمر المريض 16 سنة على الأقل",
        failedToLoadPatientList: "فشل في تحميل قائمة المرضى",
        emailAlreadyInUse: "هذا البريد الإلكتروني مستخدم بالفعل",
        idNumberAlreadyInUse: "رقم الهوية هذا مستخدم بالفعل",
        enterSearchTerm: "يرجى إدخال نص للبحث",
        failedToSearchPatients: "فشل في البحث عن المرضى",
        allergyAlreadyAdded: "هذه الحساسية مضافة بالفعل",
        enterValidWeight: "يرجى إدخال وزن صحيح بين 1-500 كيلوغرام",
        enterValidHeight: "يرجى إدخال طول صحيح بين 1-300 سم",
        failedToSaveSocialSituation: "فشل في حفظ الحالة الاجتماعية",
        cannotDeterminePatient: "لا يمكن تحديد المريض المراد تحديث معلوماته",
        invalidId: 'رقم الهوية غير صالح',
        invalidIdDesc: 'رقم الهوية هذا غير صالح وفقًا لمعايير الهوية الفلسطينية.',
    },
    clinicManagement: {
        // Main titles
        title: 'إدارة العيادات',
        clinicsManagement: 'إدارة العيادات',
        clinicCategories: 'فئات العيادات',
        displayOrder: "ترتيب العرض",
        displayOrderPlaceholder: "0 = الموضع الأول",
        displayOrderDescription: "الأرقام الأقل تظهر أولاً",
        moveUp: "تحريك لأعلى",
        moveDown: "تحريك لأسفل",
        orderUpdated: "تم تحديث الترتيب بنجاح",
        orderUpdateFailed: "فشل في تحديث الترتيب",
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
        cannotDeleteClinicWithDoctors: 'لا يمكن حذف العيادة. يرجى إزالة هؤلاء الأطباء أولاً: {{doctorNames}}',
        cannotDeleteCategoryWithClinics: 'هذه الفئة مستخدمة من قبل العيادة/العيادات التالية: {{clinics}}. يرجى إعادة تعيين تلك العيادات أولاً.',
        cannotDelete: 'لا يمكن الحذف',
        failedToCheckDoctors: 'فشل في التحقق من الأطباء في العيادة',

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
        startTimeMinimum: "وقت البداية لا يمكن أن يكون قبل 08:00",
        startTimeMaximum: "وقت البداية لا يمكن أن يكون بعد 20:00",
        endTimeMinimum: "وقت النهاية لا يمكن أن يكون قبل 08:00",
        endTimeMaximum: "وقت النهاية لا يمكن أن يكون بعد 20:00",
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
        pricePlaceholder: '1.00',
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
        doctorCreatedSuccessfully: 'تم إنشاء الطبيب بنجاح. لا تنسى  تحديد أوقات توفره.',
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
        noAvailabilitySlots: 'لم يتم إضافة أي فترات',
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
        endTimeAfterStart: 'خطأ في الوقت',

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
        phoneRequired: "رقم الهاتف مطلوب.",
        // Confirmation dialog and toast for slot deletion
        confirmSlotDeletionTitle: 'حذف فترة زمنية؟',
        confirmSlotDeletionDesc: 'هل أنت متأكد أنك تريد حذف هذه الفترة الزمنية ليوم {{day}} ({{start}} - {{end}})؟',
        slotDeletedTitle: 'تم حذف الفترة الزمنية',
        slotDeletedDesc: 'تم حذف الفترة الزمنية بنجاح.',
        deleteSlot: 'حذف الفترة الزمنية'
    },
    home: {
        reminder: 'تذكير',
        remindeinder: 'تذكير',
        reservationRequired: 'يرجى حجز موعد قبل زيارة عيادتنا ',
        bookNow: 'احجز الآن',
        userCreation: 'إنشاء مستخدم',
        saveInformation: 'حفظ معلومات المريض',
        patientInformation: 'معلومات المريض',
        weight: 'الوزن',
        height: 'الطول',
        homeemail: 'أدخل بريدك الإلكتروني',
        bloodType: 'فصيلة الدم',
        commonDiseases: 'الأمراض المزمنة',
        medicinesTitle: 'الأدوية',
        medicinesStatusQuestion: 'هل يتناول المريض أدوية حالياً؟',
        medicinesStatusYes: 'نعم',
        medicinesStatusNo: 'لا',
        medicinesStatusHint: 'غيّر الحالة إلى نعم لاختيار الأدوية من القائمة أدناه.',
        patientLogs: 'سجل نشاط المريض',
        information: 'المعلومات',
        patientInfoUpdated: 'تم تحديث معلومات المريض في',
        noActivityLogs: 'لا توجد سجلات نشاط حتى الآن',
        logs: {
            loadedPatientList: 'تم تحميل قائمة جميع المرضى ({{count}} مرضى)',
            errorLoadingPatientList: 'خطأ في تحميل قائمة المرضى: {{error}}',
            newPatientCreated: 'تم إنشاء مريض جديد: {{patientName}} (ID: {{patientId}}) بواسطة {{user}} ({{role}})',
            failedToCreatePatient: 'فشل في إنشاء مريض جديد: {{error}}',
            searchedForPatients: 'تم البحث عن المرضى باستخدام "{{term}}" - تم العثور على {{count}} مريض/مرضى',
            selectedPatient: 'تم اختيار المريض {{name}} (ID: {{id}})',
            errorNoUserLoggedIn: 'خطأ: لا يوجد مستخدم مسجل دخول',
            healthInfoLoaded: 'تم تحميل المعلومات الصحية - تم الإنشاء بواسطة {{createdBy}} ({{createdByRole}})، آخر تحديث بواسطة {{updatedBy}} ({{updatedByRole}})',
            welcomeHealthInfo: 'مرحباً بك! يمكنك الآن إدخال معلوماتك الصحية',
            errorLoadingHealthInfo: 'خطأ في تحميل المعلومات الصحية: {{error}}',
            healthInfoSaved: 'تم حفظ المعلومات الصحية لـ {{patientName}} بواسطة {{user}} ({{role}})',
            failedToSaveHealthInfo: 'فشل في حفظ المعلومات الصحية',
            errorSavingInfo: 'خطأ في حفظ المعلومات'
        },
        diseases: {
            highBloodPressure: 'ارتفاع ضغط الدم',
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
        ultrasound: 'فني موجات فوق صوتية',
        audiometry: 'فني قياس السمع',
        patient: 'مريض'
    },
    aboutUs: {
        ourFacility: 'مرافقنا',
    },

    xray: {
        // Page titles and descriptions
        pageTitle: 'نظام رفع صور الأشعة',
        pageDescription: 'رفع وإدارة صور الأشعة الطبية بأمان',
        title: 'نظام رفع صور الأشعة',
        subtitle: 'رفع وإدارة صور الأشعة',
        uploadXrayImage: 'رفع صورة الأشعة',
        selectFromDropdown: "أو اختر من القائمة : ",

        // SEO
        seo: {
            title: 'خدمات التصوير بالأشعة - مركز بيت لحم الطبي',
            description: 'خدمات التصوير بالأشعة المتقدمة في مركز بيت لحم الطبي. التصوير الرقمي بالأشعة، خدمات الأشعة، والتصوير الطبي للتشخيص الدقيق.',
            keywords: 'التصوير بالأشعة، خدمات الأشعة، التصوير الطبي، الأشعة الرقمية، مركز بيت لحم الطبي، التصوير التشخيصي'
        },

        // Patient Information
        patientInfo: {
            title: 'معلومات المريض',
            searchPatient: 'البحث عن المريض',
            searchPlaceholder: 'البحث بالاسم أو البريد...',
            noPatientsFound: 'لم يتم العثور على مرضى',
            patientSelected: 'تم اختيار المريض',
            name: 'الاسم',
            email: 'البريد الإلكتروني',
            id: 'رقم الهوية',
            dob: 'تاريخ الميلاد',
            gender: 'الجنس',
            dateOfBirth: 'تاريخ الميلاد',
            manualName: 'اسم المريض (إدخال يدوي)',
            namePlaceholder: 'أدخل الاسم الكامل للمريض',
            manualDob: 'تاريخ الميلاد (إدخال يدوي)'
        },

        // Doctor Information
        doctorInfo: {
            title: 'الطبيب الطالب',
            searchPlaceholder: 'البحث بالاسم أو التخصص...',
            noDoctorsFound: 'لم يتم العثور على أطباء',
            doctorSelected: 'تم اختيار الطبيب',
            drPrefix: 'د.',
            name: 'الاسم',
            specialty: 'التخصص',
            clinic: 'العيادة',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف'
        },

        // Clinical Indication
        clinicalIndication: {
            title: 'المؤشر السريري',
            placeholder: 'أدخل المؤشر السريري والأعراض'
        },

        // Body Part Selection
        bodyPartSelection: {
            title: 'اختيار جزء الجسم',
            manualSelection: 'الاختيار اليدوي',
            placeholder: 'اختر جزء الجسم المحدد...'
        },

        // File Upload
        fileUpload: {
            title: 'رفع صورة الأشعة',
            fileSelected: 'تم اختيار الملف',
            removeFile: 'إزالة الملف',
            dragDropText: 'اسحب وأفلت صورة الأشعة',
            clickToBrowse: 'أو انقر للتصفح',
            supportedFormats: 'الصيغ المدعومة: JPEG، PNG (حد أقصى 10 ميجابايت)'
        },

        // Actions
        actions: {
            saveRecord: 'حفظ سجل الأشعة',
            resetForm: 'إعادة تعيين النموذج'
        },

        // Common
        selected: 'المحدد',

        // Body parts
        bodyParts: {
            skull: 'الجمجمة',
            frontal_bone: 'العظم الجبهي',
            left_parietal_bone: 'العظم الجداري الأيسر',
            right_parietal_bone: 'العظم الجداري الأيمن',
            left_temporal_bone: 'العظم الصدغي الأيسر',
            right_temporal_bone: 'العظم الصدغي الأيمن',
            occipital_bone: 'العظم القذالي',
            sphenoid_bone: 'العظم الوتدي',
            ethmoid_bone: 'العظم الغربالي',
            paranasal_sinus: 'الجيوب الأنفية',
            left_nasal_bone: 'العظم الأنفي الأيسر',
            right_nasal_bone: 'العظم الأنفي الأيمن',
            left_maxilla: 'الفك العلوي الأيسر',
            right_maxilla: 'الفك العلوي الأيمن',
            mandible: 'الفك السفلي',
            left_zygomatic_bone: 'العظم الوجني الأيسر',
            right_zygomatic_bone: 'العظم الوجني الأيمن',
            left_palatine_bone: 'العظم الحنكي الأيسر',
            right_palatine_bone: 'العظم الحنكي الأيمن',
            left_lacrimal_bone: 'العظم الدمعي الأيسر',
            right_lacrimal_bone: 'العظم الدمعي الأيمن',
            left_inferior_nasal_concha: 'المحارة الأنفية السفلية اليسرى',
            right_inferior_nasal_concha: 'المحارة الأنفية السفلية اليمنى',
            vomer: 'العظم الميكعي',
            left_malleus: 'المطرقة اليسرى',
            right_malleus: 'المطرقة اليمنى',
            left_incus: 'السندان الأيسر',
            right_incus: 'السندان الأيمن',
            left_stapes: 'الركاب الأيسر',
            right_stapes: 'الركاب الأيمن',
            hyoid_bone: 'العظم اللامي',
            cervical_spine: 'العمود الفقري العنقي',
            c1_atlas: 'الفقرات الأولى (الأطلس)',
            c2_axis: 'الفقرات الثانية (المحور)',
            c3_vertebra: 'الفقرات الثالثة',
            c4_vertebra: 'الفقرات الرابعة',
            c5_vertebra: 'الفقرات الخامسة',
            c6_vertebra: 'الفقرات السادسة',
            c7_vertebra: 'الفقرات السابعة',
            thoracic_spine: 'العمود الفقري الصدري',
            t1_vertebra: 'الفقرات الصدرية الأولى',
            t2_vertebra: 'الفقرات الصدرية الثانية',
            t3_vertebra: 'الفقرات الصدرية الثالثة',
            t4_vertebra: 'الفقرات الصدرية الرابعة',
            t5_vertebra: 'الفقرات الصدرية الخامسة',
            t6_vertebra: 'الفقرات الصدرية السادسة',
            t7_vertebra: 'الفقرات الصدرية السابعة',
            t8_vertebra: 'الفقرات الصدرية الثامنة',
            t9_vertebra: 'الفقرات الصدرية التاسعة',
            t10_vertebra: 'الفقرات الصدرية العاشرة',
            t11_vertebra: 'الفقرات الصدرية الحادية عشرة',
            t12_vertebra: 'الفقرات الصدرية الثانية عشرة',
            lumbar_spine: 'العمود الفقري القطني',
            l1_vertebra: 'الفقرات القطنية الأولى',
            l2_vertebra: 'الفقرات القطنية الثانية',
            l3_vertebra: 'الفقرات القطنية الثالثة',
            l4_vertebra: 'الفقرات القطنية الرابعة',
            l5_vertebra: 'الفقرات القطنية الخامسة',
            sacrum: 'العجز',
            coccyx: 'العصعص',
            sternum: 'عظم القص',
            manubrium: 'قبضة القص',
            sternal_body: 'جسم القص',
            xiphoid_process: 'النتوء الرهابي',
            ribs_left: 'الأضلاع اليسرى',
            ribs_right: 'الأضلاع اليمنى',
            left_1st_rib: 'الضلع الأول الأيسر',
            right_1st_rib: 'الضلع الأول الأيمن',
            left_2nd_rib: 'الضلع الثاني الأيسر',
            right_2nd_rib: 'الضلع الثاني الأيمن',
            left_3rd_rib: 'الضلع الثالث الأيسر',
            right_3rd_rib: 'الضلع الثالث الأيمن',
            left_4th_rib: 'الضلع الرابع الأيسر',
            right_4th_rib: 'الضلع الرابع الأيمن',
            left_5th_rib: 'الضلع الخامس الأيسر',
            right_5th_rib: 'الضلع الخامس الأيمن',
            left_6th_rib: 'الضلع السادس الأيسر',
            right_6th_rib: 'الضلع السادس الأيمن',
            left_7th_rib: 'الضلع السابع الأيسر',
            right_7th_rib: 'الضلع السابع الأيمن',
            left_8th_rib: 'الضلع الثامن الأيسر',
            right_8th_rib: 'الضلع الثامن الأيمن',
            left_9th_rib: 'الضلع التاسع الأيسر',
            right_9th_rib: 'الضلع التاسع الأيمن',
            left_10th_rib: 'الضلع العاشر الأيسر',
            right_10th_rib: 'الضلع العاشر الأيمن',
            left_11th_rib: 'الضلع الحادي عشر الأيسر',
            right_11th_rib: 'الضلع الحادي عشر الأيمن',
            left_12th_rib: 'الضلع الثاني عشر الأيسر',
            right_12th_rib: 'الضلع الثاني عشر الأيمن',
            clavicle_left: 'الترقوة اليسرى',
            clavicle_right: 'الترقوة اليمنى',
            scapula_left: 'الكتف الأيسر',
            scapula_right: 'الكتف الأيمن',
            humerus_left: 'العضد الأيسر',
            humerus_right: 'العضد الأيمن',
            radius_left: 'الكعبرة اليسرى',
            radius_right: 'الكعبرة اليمنى',
            ulna_left: 'الزند الأيسر',
            ulna_right: 'الزند الأيمن',
            hand_left: 'اليد اليسرى',
            left_scaphoid: 'العظم الزورقي الأيسر',
            left_lunate: 'العظم الهلالي الأيسر',
            left_triquetral: 'العظم الهرمي الأيسر',
            left_pisiform: 'العظم البازلي الأيسر',
            left_trapezium: 'العظم شبه المنحرف الأيسر',
            left_trapezoid: 'العظم شبه المنحرف الأيسر',
            left_capitate: 'العظم الكبير الأيسر',
            left_hamate: 'العظم الخطافي الأيسر',
            left_1st_metacarpal: 'المشط الأول الأيسر',
            left_2nd_metacarpal: 'المشط الثاني الأيسر',
            left_3rd_metacarpal: 'المشط الثالث الأيسر',
            left_4th_metacarpal: 'المشط الرابع الأيسر',
            left_5th_metacarpal: 'المشط الخامس الأيسر',
            left_thumb_proximal_phalanx: 'السُلامى القريبة للإبهام الأيسر',
            left_thumb_distal_phalanx: 'السُلامى البعيدة للإبهام الأيسر',
            left_index_proximal_phalanx: 'السُلامى القريبة للسبابة اليسرى',
            left_index_middle_phalanx: 'السُلامى الوسطى للسبابة اليسرى',
            left_index_distal_phalanx: 'السُلامى البعيدة للسبابة اليسرى',
            left_middle_proximal_phalanx: 'السُلامى القريبة للوسطى اليسرى',
            left_middle_middle_phalanx: 'السُلامى الوسطى للوسطى اليسرى',
            left_middle_distal_phalanx: 'السُلامى البعيدة للوسطى اليسرى',
            left_ring_proximal_phalanx: 'السُلامى القريبة للبنصر الأيسر',
            left_ring_middle_phalanx: 'السُلامى الوسطى للبنصر الأيسر',
            left_ring_distal_phalanx: 'السُلامى البعيدة للبنصر الأيسر',
            left_pinky_proximal_phalanx: 'السُلامى القريبة للخنصر الأيسر',
            left_pinky_middle_phalanx: 'السُلامى الوسطى للخنصر الأيسر',
            left_pinky_distal_phalanx: 'السُلامى البعيدة للخنصر الأيسر',
            hand_right: 'اليد اليمنى',
            right_scaphoid: 'العظم الزورقي الأيمن',
            right_lunate: 'العظم الهلالي الأيمن',
            right_triquetral: 'العظم الهرمي الأيمن',
            right_pisiform: 'العظم البازلي الأيمن',
            right_trapezium: 'العظم شبه المنحرف الأيمن',
            right_trapezoid: 'العظم شبه المنحرف الأيمن',
            right_capitate: 'العظم الكبير الأيمن',
            right_hamate: 'العظم الخطافي الأيمن',
            right_1st_metacarpal: 'المشط الأول الأيمن',
            right_2nd_metacarpal: 'المشط الثاني الأيمن',
            right_3rd_metacarpal: 'المشط الثالث الأيمن',
            right_4th_metacarpal: 'المشط الرابع الأيمن',
            right_5th_metacarpal: 'المشط الخامس الأيمن',
            right_thumb_proximal_phalanx: 'السُلامى القريبة للإبهام الأيمن',
            right_thumb_distal_phalanx: 'السُلامى البعيدة للإبهام الأيمن',
            right_index_proximal_phalanx: 'السُلامى القريبة للسبابة اليمنى',
            right_index_middle_phalanx: 'السُلامى الوسطى للسبابة اليمنى',
            right_index_distal_phalanx: 'السُلامى البعيدة للسبابة اليمنى',
            right_middle_proximal_phalanx: 'السُلامى القريبة للوسطى اليمنى',
            right_middle_middle_phalanx: 'السُلامى الوسطى للوسطى اليمنى',
            right_middle_distal_phalanx: 'السُلامى البعيدة للوسطى اليمنى',
            right_ring_proximal_phalanx: 'السُلامى القريبة للبنصر الأيمن',
            right_ring_middle_phalanx: 'السُلامى الوسطى للبنصر الأيمن',
            right_ring_distal_phalanx: 'السُلامى البعيدة للبنصر الأيمن',
            right_pinky_proximal_phalanx: 'السُلامى القريبة للخنصر الأيمن',
            right_pinky_middle_phalanx: 'السُلامى الوسطى للخنصر الأيمن',
            right_pinky_distal_phalanx: 'السُلامى البعيدة للخنصر الأيمن',
            pelvis: 'الحوض',
            left_iliac: 'الحرقفة اليسرى',
            right_iliac: 'الحرقفة اليمنى',
            left_ischium: 'الورك الأيسر',
            right_ischium: 'الورك الأيمن',
            left_pubis: 'العانة اليسرى',
            right_pubis: 'العانة اليمنى',
            femur_left: 'الفخذ الأيسر',
            femur_right: 'الفخذ الأيمن',
            patella_left: 'الرضفة اليسرى',
            patella_right: 'الرضفة اليمنى',
            tibia_left: 'الظنبوب الأيسر',
            tibia_right: 'الظنبوب الأيمن',
            fibula_left: 'الشظية اليسرى',
            fibula_right: 'الشظية اليمنى',
            foot_left: 'القدم اليسرى',
            left_calcaneus: 'العقب الأيسر',
            left_talus: 'الكتل الأيسر',
            left_navicular: 'العظم الزورقي الأيسر',
            left_cuboid: 'العظم المكعب الأيسر',
            left_medial_cuneiform: 'العظم الإسفيني الإنسي الأيسر',
            left_intermediate_cuneiform: 'العظم الإسفيني المتوسط الأيسر',
            left_lateral_cuneiform: 'العظم الإسفيني الوحشي الأيسر',
            left_1st_metatarsal: 'المشط الأول الأيسر',
            left_2nd_metatarsal: 'المشط الثاني الأيسر',
            left_3rd_metatarsal: 'المشط الثالث الأيسر',
            left_4th_metatarsal: 'المشط الرابع الأيسر',
            left_5th_metatarsal: 'المشط الخامس الأيسر',
            left_big_toe_proximal_phalanx: 'السُلامى القريبة لإبهام القدم الأيسر',
            left_big_toe_distal_phalanx: 'السُلامى البعيدة لإبهام القدم الأيسر',
            left_2nd_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الثاني الأيسر',
            left_2nd_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الثاني الأيسر',
            left_2nd_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الثاني الأيسر',
            left_3rd_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الثالث الأيسر',
            left_3rd_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الثالث الأيسر',
            left_3rd_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الثالث الأيسر',
            left_4th_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الرابع الأيسر',
            left_4th_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الرابع الأيسر',
            left_4th_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الرابع الأيسر',
            left_5th_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الخامس الأيسر',
            left_5th_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الخامس الأيسر',
            left_5th_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الخامس الأيسر',
            foot_right: 'القدم اليمنى',
            right_calcaneus: 'العقب الأيمن',
            right_talus: 'الكتل الأيمن',
            right_navicular: 'العظم الزورقي الأيمن',
            right_cuboid: 'العظم المكعب الأيمن',
            right_medial_cuneiform: 'العظم الإسفيني الإنسي الأيمن',
            right_intermediate_cuneiform: 'العظم الإسفيني المتوسط الأيمن',
            right_lateral_cuneiform: 'العظم الإسفيني الوحشي الأيمن',
            right_1st_metatarsal: 'المشط الأول الأيمن',
            right_2nd_metatarsal: 'المشط الثاني الأيمن',
            right_3rd_metatarsal: 'المشط الثالث الأيمن',
            right_4th_metatarsal: 'المشط الرابع الأيمن',
            right_5th_metatarsal: 'المشط الخامس الأيمن',
            right_big_toe_proximal_phalanx: 'السُلامى القريبة لإبهام القدم الأيمن',
            right_big_toe_distal_phalanx: 'السُلامى البعيدة لإبهام القدم الأيمن',
            right_2nd_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الثاني الأيمن',
            right_2nd_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الثاني الأيمن',
            right_2nd_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الثاني الأيمن',
            right_3rd_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الثالث الأيمن',
            right_3rd_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الثالث الأيمن',
            right_3rd_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الثالث الأيمن',
            right_4th_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الرابع الأيمن',
            right_4th_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الرابع الأيمن',
            right_4th_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الرابع الأيمن',
            right_5th_toe_proximal_phalanx: 'السُلامى القريبة للإصبع الخامس الأيمن',
            right_5th_toe_middle_phalanx: 'السُلامى الوسطى للإصبع الخامس الأيمن',
            right_5th_toe_distal_phalanx: 'السُلامى البعيدة للإصبع الخامس الأيمن',
            shoulder_left: 'الكتف الأيسر',
            shoulder_right: 'الكتف الأيمن',
            elbow_left: 'الكوع الأيسر',
            elbow_right: 'الكوع الأيمن',
            wrist_left: 'المعصم الأيسر',
            wrist_right: 'المعصم الأيمن',
            hip_left: 'الورك الأيسر',
            hip_right: 'الورك الأيمن',
            knee_left: 'الركبة اليسرى',
            knee_right: 'الركبة اليمنى',
            ankle_left: 'الكاحل الأيسر',
            ankle_right: 'الكاحل الأيمن',
            left_thumb_sesamoid: 'العظام السمسمية لإبهام اليد الأيسر',
            right_thumb_sesamoid: 'العظام السمسمية لإبهام اليد الأيمن',
            left_big_toe_sesamoid: 'العظام السمسمية لإبهام القدم الأيسر',
            right_big_toe_sesamoid: 'العظام السمسمية لإبهام القدم الأيمن',

            // Basic body parts for DoctorXRayPage dropdown
            chest: 'الصدر',
            knee: 'الركبة',
            spine: 'العمود الفقري',
            hand: 'اليد',
            foot: 'القدم',
            shoulder: 'الكتف',
            elbow: 'المرفق',
            wrist: 'الرسغ',
            ankle: 'الكاحل',
            hip: 'الورك'
        },

        // Errors
        errors: {
            searchError: 'خطأ في البحث',
            doctorSearchFailed: 'فشل في البحث عن الأطباء. يرجى المحاولة مرة أخرى.',
            patientSearchFailed: 'فشل في البحث عن المرضى. يرجى المحاولة مرة أخرى.',
            missingData: 'بيانات مفقودة',
            selectBodyPartAndFile: 'يرجى اختيار جزء واحد على الأقل من الجسم ورفع ملف.',
            saveFailed: 'فشل الحفظ',
            tryAgain: 'فشل في حفظ سجل الأشعة. يرجى المحاولة مرة أخرى.'
        },

        // Doctor X-Ray Page
        "doctorXRayPage": {
            "title": "صور الأشعة",
            "subtitle": "عرض وإدارة صور الأشعة للمرضى",
            "searchPlaceholder": "البحث بالاسم، رقم الهوية، أو جزء الجسم...",
            "filterByDate": "تصفية حسب التاريخ",
            "filterByBodyPart": "تصفية حسب جزء الجسم",
            "allBodyParts": "جميع أجزاء الجسم",
            "viewImage": "عرض",
            "downloadImage": "تحميل",
            "deleteImage": "حذف",
            "imageNotAvailable": "الصورة غير متاحة",
            "patientInformation": "معلومات المريض",
            "examInformation": "معلومات الفحص",
            "bodyPart": "جزء الجسم",
            "requestingDoctor": "الطبيب الطالب",
            "clinicalIndication": "السبب السريري",
            "status": "الحالة",
            "completed": "مكتمل",
            "downloadFailed": "فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.",
            "deleteConfirm": "هل أنت متأكد من حذف صورة الأشعة هذه؟",
            "deleteSuccess": "تم حذف صورة الأشعة بنجاح",
            "deleteError": "فشل في حذف صورة الأشعة"
        },

        // Validation and error messages
        invalidFileType: 'يرجى اختيار ملف صورة صحيح (JPEG، PNG، TIFF، PDF، أو DICOM)',
        fileTooLarge: 'يجب أن يكون حجم الملف أقل من 50 ميجابايت',
        fillRequiredFields: 'يرجى تعبئة جميع الحقول المطلوبة ورفع صورة',
        uploadError: 'حدث خطأ أثناء رفع صورة الأشعة. يرجى المحاولة مرة أخرى.',

        // Success messages
        success: {
            title: 'نجح',
            saved: 'تم حفظ سجل الأشعة بنجاح!'
        },

        // Upload progress
        uploading: 'جارٍ الرفع...',
        uploadingXray: 'جاري رفع صورة الأشعة...',
        processing: 'جارٍ المعالجة',

        // Security notice
        securityNotice: '🔒 جميع الملفات المرفوعة مشفرة ومتوافقة مع معايير حماية البيانات الطبية',
        selectPatient: "اختر المريض",
        searchPatientPlaceholder: "ابحث عن المريض بالاسم...",
        selectPatientOption: "اختر مريضًا..."
    },

    ultrasound: {
        // Page titles and descriptions
        pageTitle: 'نظام رفع صور الموجات فوق الصوتية',
        pageDescription: 'رفع وإدارة صور الموجات فوق الصوتية الطبية بأمان',
        title: 'نظام رفع صور الموجات فوق الصوتية',
        subtitle: 'رفع وإدارة صور الموجات فوق الصوتية',
        uploadUltrasoundImage: 'رفع صورة الموجات فوق الصوتية',
        selectFromDropdown: "أو اختر من القائمة : ",

        // SEO
        seo: {
            title: 'خدمات التصوير بالموجات فوق الصوتية - مركز بيت لحم الطبي',
            description: 'خدمات التصوير بالموجات فوق الصوتية المتقدمة في مركز بيت لحم الطبي. التصوير بالموجات فوق الصوتية، خدمات الأشعة، والتصوير الطبي للتشخيص الدقيق.',
            keywords: 'التصوير بالموجات فوق الصوتية، خدمات الأشعة، التصوير الطبي، الموجات فوق الصوتية، مركز بيت لحم الطبي، التصوير التشخيصي'
        },

        // Patient Information
        patientInfo: {
            title: 'معلومات المريض',
            searchPatient: 'البحث عن المريض',
            searchPlaceholder: 'البحث بالاسم أو البريد...',
            noPatientsFound: 'لم يتم العثور على مرضى',
            patientSelected: 'تم اختيار المريض',
            name: 'الاسم',
            email: 'البريد الإلكتروني',
            id: 'رقم الهوية',
            dob: 'تاريخ الميلاد',
            gender: 'الجنس',
            dateOfBirth: 'تاريخ الميلاد',
            manualName: 'اسم المريض (إدخال يدوي)',
            namePlaceholder: 'أدخل الاسم الكامل للمريض',
            manualDob: 'تاريخ الميلاد (إدخال يدوي)'
        },

        // Doctor Information
        doctorInfo: {
            title: 'الطبيب الطالب',
            searchPlaceholder: 'البحث بالاسم أو التخصص...',
            noDoctorsFound: 'لم يتم العثور على أطباء',
            doctorSelected: 'تم اختيار الطبيب',
            drPrefix: 'د.',
            name: 'الاسم',
            specialty: 'التخصص',
            clinic: 'العيادة',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف'
        },

        // Clinical Indication
        clinicalIndication: {
            title: 'المؤشر السريري',
            placeholder: 'أدخل المؤشر السريري والأعراض'
        },

        // Body Part Selection
        bodyPartSelection: {
            title: 'اختيار جزء الجسم',
            manualSelection: 'الاختيار اليدوي',
            placeholder: 'اختر جزء الجسم المحدد...'
        },

        // File Upload
        fileUpload: {
            title: 'رفع صورة الموجات فوق الصوتية',
            fileSelected: 'تم اختيار الملف',
            removeFile: 'إزالة الملف',
            dragDropText: 'اسحب وأفلت صورة الموجات فوق الصوتية',
            clickToBrowse: 'أو انقر للتصفح',
            supportedFormats: 'الصيغ المدعومة: JPEG، PNG (حد أقصى 10 ميجابايت)'
        },

        // Actions
        actions: {
            saveRecord: 'حفظ سجل الموجات فوق الصوتية',
            resetForm: 'إعادة تعيين النموذج',
            clearAll: 'مسح الكل'
        },

        // Common
        selected: 'المحدد',

        // Body parts - same as xray
        bodyParts: {
            neck: 'الرقبة',
            head: 'الرأس',
            abdomen: 'البطن',
            abdomen_kidney: 'البطن (الكلى)',
            abdomen_spleen: 'البطن (الطحال)',
            abdomen_liver: 'البطن (الكبد)',
            abdomen_stomach: 'البطن (المعدة)',
            spine: 'العمود الفقري',
            scrotum: 'كيس الصفن',
            hip: 'الورك (رضيع)',

            // For backwards compatibility and DoctorUltrasoundPage dropdown
            chest: 'الصدر',
            knee: 'الركبة',
            hand: 'اليد',
            foot: 'القدم',
            shoulder: 'الكتف',
            elbow: 'المرفق',
            wrist: 'الرسغ',
            ankle: 'الكاحل'
        },

        // Errors
        errors: {
            searchError: 'خطأ في البحث',
            doctorSearchFailed: 'فشل في البحث عن الأطباء. يرجى المحاولة مرة أخرى.',
            patientSearchFailed: 'فشل في البحث عن المرضى. يرجى المحاولة مرة أخرى.',
            missingData: 'بيانات مفقودة',
            selectBodyPartAndFile: 'يرجى اختيار جزء واحد على الأقل من الجسم ورفع ملف.',
            saveFailed: 'فشل الحفظ',
            tryAgain: 'فشل في حفظ سجل الموجات فوق الصوتية. يرجى المحاولة مرة أخرى.'
        },

        // Doctor Ultrasound Page
        doctorUltrasoundPage: {
            title: 'صور الموجات فوق الصوتية',
            subtitle: 'عرض وإدارة صور الموجات فوق الصوتية للمرضى',
            searchPlaceholder: 'البحث بالاسم، رقم الهوية، أو جزء الجسم...',
            filterByDate: 'تصفية حسب التاريخ',
            filterByBodyPart: 'تصفية حسب جزء الجسم',
            allBodyParts: 'جميع أجزاء الجسم',
            viewImage: 'عرض',
            downloadImage: 'تحميل',
            deleteImage: 'حذف',
            imageNotAvailable: 'الصورة غير متاحة',
            patientInformation: 'معلومات المريض',
            examInformation: 'معلومات الفحص',
            bodyPart: 'جزء الجسم',
            requestingDoctor: 'الطبيب الطالب',
            clinicalIndication: 'السبب السريري',
            status: 'الحالة',
            completed: 'مكتمل',
            downloadFailed: 'فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.',
            deleteConfirm: 'هل أنت متأكد من حذف صورة الموجات فوق الصوتية هذه؟',
            deleteSuccess: 'تم حذف صورة الموجات فوق الصوتية بنجاح',
            deleteError: 'فشل في حذف صورة الموجات فوق الصوتية'
        },

        // Validation and error messages
        invalidFileType: 'يرجى اختيار ملف صورة صحيح (JPEG، PNG، TIFF، PDF، أو DICOM)',
        fileTooLarge: 'يجب أن يكون حجم الملف أقل من 50 ميجابايت',
        fillRequiredFields: 'يرجى تعبئة جميع الحقول المطلوبة ورفع صورة',
        uploadError: 'حدث خطأ أثناء رفع صورة الموجات فوق الصوتية. يرجى المحاولة مرة أخرى.',

        // Success messages
        success: {
            title: 'نجح',
            saved: 'تم حفظ سجل الموجات فوق الصوتية بنجاح!'
        },

        // Upload progress
        uploading: 'جارٍ الرفع...',
        uploadingUltrasound: 'جاري رفع صورة الموجات فوق الصوتية...',
        processing: 'جارٍ المعالجة',

        // Security notice
        securityNotice: '🔒 جميع الملفات المرفوعة مشفرة ومتوافقة مع معايير حماية البيانات الطبية',
        selectPatient: "اختر المريض",
        searchPatientPlaceholder: "ابحث عن المريض بالاسم...",
        selectPatientOption: "اختر مريضًا..."
    },

    audiometry: {
        // Page titles and descriptions
        pageTitle: 'نظام رفع نتائج قياس السمع',
        pageDescription: 'رفع وإدارة نتائج اختبارات قياس السمع بأمان',
        title: 'قياس السمع',
        subtitle: 'إرسال نتائج اختبار قياس السمع مع الملاحظات',
        uploadAudiometryImage: 'رفع صورة قياس السمع',

        // SEO
        seo: {
            title: 'خدمات قياس السمع - مركز بيت لحم الطبي',
            description: 'إرسال نتائج اختبار قياس السمع',
            keywords: 'قياس السمع، اختبار السمع'
        },

        // Patient Information
        patientInfo: {
            title: 'معلومات المريض',
            searchPatient: 'البحث عن المريض',
            searchPlaceholder: 'ابحث...',
            noPatientsFound: 'لم يتم العثور على مرضى',
            patientSelected: 'تم اختيار المريض',
            name: 'الاسم',
            email: 'البريد الإلكتروني',
            id: 'رقم الهوية',
            dob: 'تاريخ الميلاد',
            gender: 'الجنس',
            dateOfBirth: 'تاريخ الميلاد',
            manualName: 'اسم المريض (إدخال يدوي)',
            namePlaceholder: 'أدخل الاسم الكامل للمريض',
            manualDob: 'تاريخ الميلاد (إدخال يدوي)'
        },

        // Doctor Information
        doctorInfo: {
            title: 'الطبيب الطالب',
            searchPlaceholder: 'ابحث...',
            noDoctorsFound: 'لم يتم العثور على أطباء',
            doctorSelected: 'تم اختيار الطبيب',
            drPrefix: 'د.',
            name: 'الاسم',
            specialty: 'التخصص',
            clinic: 'العيادة',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف'
        },

        // Notes
        notes: {
            title: 'ملاحظات',
            placeholder: 'أدخل ملاحظات ونتائج اختبار قياس السمع...'
        },

        // Hearing Exam ABR
        hearingExam: {
            title: 'فحص السمع ABR',
            ear: 'الأذن',
            passed: 'نجح',
            failed: 'فشل',
            leftEar: 'الأذن اليسرى',
            rightEar: 'الأذن اليمنى'
        },

        // Actions
        actions: {
            saveRecord: 'حفظ السجل',
            resetForm: 'إعادة تعيين النموذج'
        },

        // Errors
        errors: {
            searchError: 'خطأ في البحث',
            doctorSearchFailed: 'فشل البحث عن الأطباء. يرجى المحاولة مرة أخرى.',
            patientSearchFailed: 'فشل البحث عن المرضى. يرجى المحاولة مرة أخرى.',
            missingData: 'بيانات مفقودة',
            selectFile: 'يرجى رفع ملف صورة.',
            selectResult: 'يرجى اختيار نتيجة فحص واحدة على الأقل.',
            patientRequired: 'يرجى اختيار مريض أو إدخال اسم المريض.',
            dobRequired: 'يرجى إدخال تاريخ ميلاد المريض.',
            selectPatientFromList: 'يرجى اختيار مريض من نتائج البحث. الإدخال اليدوي يتطلب تسجيل المريض أولاً.',
            saveFailed: 'فشل الحفظ',
            tryAgain: 'فشل حفظ سجل قياس السمع. يرجى المحاولة مرة أخرى.'
        },

        // Success messages
        success: {
            title: 'نجح',
            saved: 'تم حفظ سجل قياس السمع بنجاح.'
        },

        // Upload progress
        uploading: 'جارٍ الرفع...',
        uploadingAudiometry: 'جارٍ رفع صورة قياس السمع...',
        processing: 'جارٍ المعالجة...',

        // Security notice
        securityNotice: '🔒 جميع الملفات المرفوعة مشفرة ومتوافقة مع معايير حماية البيانات الطبية'
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
        averagePrice: 'متوسط السعر',
        conflict: 'تعارض',
        timeSlotConflict: 'يوجد بالفعل موعد لهذا العيادة في هذا الوقت.'
    },
    deletionRequest: {
        requestSubmitted: 'تم إرسال طلب الحذف بنجاح. سيتم مراجعته من قبل المسؤول.',
        newDeletionRequest: 'طلب حذف جديد',
        deletionRequestMessage: '{{email}}   :طلب حذف المستخدم:   {{userName}}',
        // ... (add other keys here if needed)
    },
    notifications: {
        markAllRead: 'وضع علامة قراءة على الكل',
        showingFirst: 'عرض أول {{count}} إشعارات',
        noNotifications: 'لا توجد إشعارات',
        noNotificationsDesc: 'أنت على اطلاع بكل شيء! لا توجد إشعارات جديدة.',
    },
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
        // Add these for better translation loading
        keySeparator: '.',
        nsSeparator: ':',
        defaultNS: 'translation',
        react: {
            useSuspense: false, // Disable suspense to prevent translation key display
        },
        // Add these for faster loading
        load: 'languageOnly',
        preload: ['en', 'ar'],
        saveMissing: false,
        updateMissing: false,
        // Add fallback for missing keys
        missingKeyHandler: (lng, ns, key) => {
            console.warn(`Missing translation key: ${key} for language: ${lng}`);
            return key; // Return the key itself as fallback
        },
    });
export default i18n;