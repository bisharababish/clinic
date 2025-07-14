// pages/Index.tsx - Enhanced version with nurse patient creation functionality and sidebar
import { useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePatientHealth, PatientHealthData } from "@/hooks/usePatientHealth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import "./styles/index.css";
import {
  EyeIcon,
  EyeOffIcon,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  CreditCard,
  Save,
  Loader2,
  Activity,
  Clock,
  Search,
  FileText,
  Heart,
  Pill,
  RefreshCw,
  UserCheck,
  Database,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/components/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidPalestinianID } from '@/lib/PalID_temp';


// Enhanced patient info interface for search results
interface PatientSearchResult {
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
  user_phonenumber?: string;
  date_of_birth?: string;
  gender_user?: string;
  user_roles: string;
  created_at?: string;
  updated_at?: string;
  social_situation?: string; // ADD THIS LINE

}

interface PatientWithHealthInfo extends PatientSearchResult {
  health_data?: PatientHealthData;
}

// NEW: Interface for log entries to support dynamic translation
interface LogEntry {
  key: string;
  values?: Record<string, string | number>;
  timestamp: Date;
}

// NEW: Interface for patient creation form
interface PatientCreationForm {
  english_username_a: string;
  english_username_b: string;
  english_username_c: string;
  english_username_d: string;
  arabic_username_a: string;
  arabic_username_b: string;
  arabic_username_c: string;
  arabic_username_d: string;
  user_email: string;
  id_number: string;
  user_phonenumber: string;
  date_of_birth: string;
  gender_user: string;
  user_password: string;
  social_situation?: 'single' | 'married' | '';
}
// Skeleton Loading Components
const PatientSearchSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
  <div className="space-y-6">
    {/* Search Controls Skeleton */}
    <div className="search-controls">
      <Skeleton className="h-12 flex-1" />
      <Skeleton className="h-12 w-24" />
      <Skeleton className="h-12 w-40" />
    </div>

    {/* Search Results Skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="search-results-grid">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="pt-2 border-t">
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-4 w-6 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PatientSidebarSkeletonLoading = () => (
  <div className="p-2">
    <div className="space-y-2">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="space-y-2">
            <div>
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-3 w-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
const Index = () => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);
  const { toast } = useToast();

  // Use the patient health hook
  const {
    getPatientHealthData,
    savePatientHealthData,
    calculateHealthStats,
    isLoading: healthLoading,
    isSaving: healthSaving
  } = usePatientHealth();

  // State for nurse patient search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PatientWithHealthInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithHealthInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [socialSituation, setSocialSituation] = useState<"married" | "single" | "">("");
  const [isLoadingHealthData, setIsLoadingHealthData] = useState(false);

  // NEW: State for patient list sidebar
  const [allPatients, setAllPatients] = useState<PatientWithHealthInfo[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showPatientSidebar, setShowPatientSidebar] = useState(false);
  const [patientListFilter, setPatientListFilter] = useState("");
  const [createIdValidationStatus, setCreateIdValidationStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');


  // NEW: State for patient creation
  const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [createPatientForm, setCreatePatientForm] = useState<PatientCreationForm>({
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
    user_password: "",
    social_situation: ""
  });

  // Existing patient form state for patients/staff
  const [formData, setFormData] = useState({
    // English name fields
    english_username_a: "",
    english_username_b: "",
    english_username_c: "",
    english_username_d: "",

    // Arabic name fields
    arabic_username_a: "",
    arabic_username_b: "",
    arabic_username_c: "",
    arabic_username_d: "",

    // Other fields 
    email: "",
    id_number: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    weight: "",
    height: "",
    bloodType: "A+",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
  });

  // Changed from single disease to multiple diseases (checkboxes)
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [patientLogs, setPatientLogs] = useState<LogEntry[]>([]);

  // NEW: Store complete health data for user tracking display
  const [healthData, setHealthData] = useState<PatientHealthData | null>(null);
  const isFetchingRef = useRef(false); // Add this line

  // FIXED: Updated disease keys to match database schema
  const commonDiseases = [
    { key: "has_high_blood_pressure", en: "High blood pressure", ar: "ضغط الدم المرتفع" },
    { key: "has_diabetes", en: "Diabetes", ar: "السكري" },
    { key: "has_cholesterol", en: "Cholesterol", ar: "الكوليسترول" },
    { key: "has_kidney_disease", en: "Kidney Disease", ar: "أمراض الكلى" },
    { key: "has_cancer", en: "Cancer", ar: "السرطان" },
    { key: "has_heart_disease", en: "Heart Disease", ar: "أمراض القلب" },
    { key: "has_asthma", en: "Asthma", ar: "الربو" },
    { key: "has_alzheimer_dementia", en: "Alzheimer/Dementia", ar: "الزهايمر/الخرف" },
  ];

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const allergiesList = [
    { en: 'Penicillin', ar: 'البنسلين' },
    { en: 'Naproxen', ar: 'نابروكسين' },
    { en: 'Ibuprofen', ar: 'إيبوبروفين' },
    { en: 'Aspirin', ar: 'الأسبرين' },
    { en: 'Anticonvulsants', ar: 'مضادات الاختلاج' },
    { en: 'Other', ar: 'أخرى' },
  ];




  // Add state for cholesterol type
  const [cholesterolType, setCholesterolType] = useState<string>("");

  const medicineCategories = [
    {
      category: { en: "Pain Relief", ar: "مسكنات الألم" },
      medicines: [
        { en: "Paracetamol", ar: "باراسيتامول" },
        { en: "Ibuprofen", ar: "إيبوبروفين" }
      ]
    },
    {
      category: { en: "Flu", ar: "الإنفلونزا" },
      medicines: [
        { en: "Oseltamivir", ar: "أوسيلتاميفير" },
        { en: "Zanamivir", ar: "زاناميفير" }
      ]
    },
    {
      category: { en: "Allergy", ar: "الحساسية" },
      medicines: [
        { en: "Loratadine", ar: "لوراتادين" },
        { en: "Cetirizine", ar: "سيتيريزين" }
      ]
    },
    {
      category: { en: "Antibiotics", ar: "المضادات الحيوية" },
      medicines: [
        { en: "Amoxicillin", ar: "أموكسيسيلين" },
        { en: "Azithromycin", ar: "أزيثروميسين" }
      ]
    }
  ];

  // Define placeholders based on current language
  const placeholders = {
    english: {
      first: isRTL ? "الأول (بالإنجليزية)" : "First",
      second: isRTL ? "الثاني (بالإنجليزية)" : "Second",
      third: isRTL ? "الثالث (بالإنجليزية)" : "Third",
      last: isRTL ? "الأخير (بالإنجليزية)" : "Last"
    },
    arabic: {
      first: "الأول",
      second: "الثاني",
      third: "الثالث",
      last: "الأخير"
    }
  };

  // Helper: Regex for English and Arabic letters only (no numbers)
  const englishNameRegex = /^[A-Za-z\s'-]+$/;
  const arabicNameRegex = /^[\u0600-\u06FF\s'-]+$/;



  // Helper: Regex for phone number validation
  const phoneRegex = /^(\+970|\+972)\d{9}$/;

  // NEW: Enhanced handleCreatePatientFormChange to restrict input in real-time
  const handleCreatePatientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Restrict English name fields
    if (name.startsWith('english_username')) {
      if (value === '' || englishNameRegex.test(value)) {
        setCreatePatientForm(prev => ({ ...prev, [name]: value }));
      } else {
        toast({
          title: t('usersManagement.englishNameErrorTitle'),
          description: t('usersManagement.englishNameErrorDesc'),
          variant: 'destructive',
        });
      }
      return;
    }
    // Restrict Arabic name fields
    if (name.startsWith('arabic_username')) {
      if (value === '' || arabicNameRegex.test(value)) {
        setCreatePatientForm(prev => ({ ...prev, [name]: value }));
      } else {
        toast({
          title: t('usersManagement.arabicNameErrorTitle'),
          description: t('usersManagement.arabicNameErrorDesc'),
          variant: 'destructive',
        });
      }
      return;
    }
    // Restrict phone number field
    // Restrict phone number field
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
          setCreatePatientForm(prev => ({ ...prev, [name]: sanitized }));
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

      setCreatePatientForm(prev => ({ ...prev, [name]: sanitized }));
      return;
    }

    // Handle ID number field - limit to 9 digits only
    if (name === 'id_number') {
      // Remove all non-digit characters and limit to 9 digits
      const digitsOnly = value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.slice(0, 9);

      setCreatePatientForm(prev => ({ ...prev, [name]: limitedDigits }));

      // Validate Palestinian ID if we have 9 digits
      if (limitedDigits.length === 9) {
        const isValid = isValidPalestinianID(limitedDigits);
        setCreateIdValidationStatus(isValid ? 'valid' : 'invalid');

        if (!isValid) {
          toast({
            title: t('usersManagement.invalidId'),
            description: t('usersManagement.invalidIdDesc') || 'This ID number is not valid according to Palestinian ID standards',
            variant: 'destructive',
          });
        }
      } else {
        setCreateIdValidationStatus('unchecked');
      }
      return;
    }

    // Other fields
    setCreatePatientForm(prev => ({ ...prev, [name]: value }));
  };

  // NEW: Generate a secure default password
  const generateDefaultPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // NEW: Validate patient creation form
  const validatePatientCreationForm = (): boolean => {
    const form = createPatientForm;

    // Check required English name fields
    if (!form.english_username_a.trim() || !form.english_username_d.trim()) {
      toast({
        title: isRTL ? "خطأ في النموذج" : "Form Error",
        description: t('usersManagement.firstLastNameRequired'),
        variant: "destructive",
      });
      return false;
    }
    // Restrict English name fields to English letters only (no numbers)
    const englishFields = [form.english_username_a, form.english_username_b, form.english_username_c, form.english_username_d];
    for (const field of englishFields) {
      if (field && !englishNameRegex.test(field)) {
        toast({
          title: isRTL ? "خطأ في الاسم الإنجليزي" : "English Name Error",
          description: t('usersManagement.englishLettersOnly'),
          variant: "destructive",
        });
        return false;
      }
    }

    // Check required Arabic name fields
    if (!form.arabic_username_a.trim() || !form.arabic_username_d.trim()) {
      toast({
        title: isRTL ? "خطأ في النموذج" : "Form Error",
        description: t('usersManagement.firstLastNameArabicRequired'),
        variant: "destructive",
      });
      return false;
    }
    // Restrict Arabic name fields to Arabic letters only (no numbers)
    const arabicFields = [form.arabic_username_a, form.arabic_username_b, form.arabic_username_c, form.arabic_username_d];
    for (const field of arabicFields) {
      if (field && !arabicNameRegex.test(field)) {
        toast({
          title: isRTL ? "خطأ في الاسم العربي" : "Arabic Name Error",
          description: t('usersManagement.arabicLettersOnly'),
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.user_email)) {
      toast({
        title: isRTL ? "بريد إلكتروني غير صحيح" : "Invalid Email",
        description: t('usersManagement.enterValidEmail'),
        variant: "destructive",
      });
      return false;
    }

    // Validate ID number (optional for secretary)
    if (!(userRole === 'secretary' && !form.id_number.trim())) {
      if (!form.id_number.trim() || form.id_number.length !== 9) {
        toast({
          title: isRTL ? "رقم هوية غير صحيح" : "Invalid ID Number",
          description: t('usersManagement.idNumberMustBe9Digits'),
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate phone number
    if (!form.user_phonenumber.trim() || !phoneRegex.test(form.user_phonenumber.trim())) {
      toast({
        title: t('usersManagement.phoneInvalidTitle'),
        description: t('usersManagement.phoneInvalidDesc'),
        variant: 'destructive',
      });
      return false;
    }

    // Validate date of birth (must be at least 16 years old)
    if (!form.date_of_birth) {
      toast({
        title: isRTL ? "تاريخ الميلاد مطلوب" : "Date of Birth Required",
        description: t('usersManagement.enterDateOfBirth'),
        variant: "destructive",
      });
      return false;
    }

    // Validate gender
    if (!form.gender_user) {
      toast({
        title: isRTL ? "الجنس مطلوب" : "Gender Required",
        description: t('usersManagement.selectGender'),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Helper: Generate a random 4-digit number as string
  const generateRandom4DigitId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Helper: Ensure the generated ID is unique in the database
  const getUnique4DigitId = async () => {
    let unique = false;
    let id = '';
    while (!unique) {
      id = generateRandom4DigitId();
      const { data: existing, error } = await supabase
        .from('userinfo')
        .select('id_number')
        .eq('id_number', id);
      if (!error && (!existing || existing.length === 0)) {
        unique = true;
      }
    }
    return id;
  };

  // NEW: Load all patients for sidebar (for nurses)
  const loadAllPatients = async () => {
    if (!canSearchPatients() || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoadingPatients(true);

      console.log('📋 Loading all patients for sidebar...');

      // Get all patients from database
      const { data: patients, error } = await supabase
        .from('userinfo')
        .select('*')
        .eq('user_roles', 'Patient')
        .order('english_username_a', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('📊 Total patients loaded:', patients?.length || 0);

      if (!patients) {
        setAllPatients([]);
        return;
      }

      // For each patient, try to get their health data (but don't block on failures)
      const patientsWithHealth: PatientWithHealthInfo[] = [];

      for (const patient of patients) {
        try {
          const healthData = await getPatientHealthData(patient.userid);
          patientsWithHealth.push({
            ...patient,
            health_data: healthData || undefined
          });
        } catch (healthError) {
          console.warn(`Could not load health data for patient ${patient.userid}:`, healthError);
          patientsWithHealth.push({
            ...patient,
            health_data: undefined
          });
        }
      }

      setAllPatients(patientsWithHealth);

      // Log the loading activity
      setPatientLogs(prev => [...prev, {
        key: 'loadedPatientList',
        values: { count: patientsWithHealth.length },
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('❌ Error loading all patients:', error);

      toast({
        title: isRTL ? "خطأ في تحميل المرضى" : "Error Loading Patients",
        description: t('usersManagement.failedToLoadPatientList'),
        variant: "destructive",
      });

      setPatientLogs(prev => [...prev, {
        key: 'errorLoadingPatientList',
        values: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      }]);

    } finally {
      setIsLoadingPatients(false);
      isFetchingRef.current = false;
    }
  };

  // NEW: Create a new patient account
  const createNewPatient = async () => {
    if (!validatePatientCreationForm()) return;

    setIsCreatingPatient(true);

    try {
      console.log('🏥 Creating new patient account...');

      // First, check if email or ID already exists (skip ID check if secretary and empty)
      let orQuery = `user_email.eq.${createPatientForm.user_email}`;
      if (!(userRole === 'secretary' && !createPatientForm.id_number.trim())) {
        orQuery += `,id_number.eq.${createPatientForm.id_number}`;
      }
      const { data: existingUsers, error: checkError } = await supabase
        .from('userinfo')
        .select('user_email, id_number')
        .or(orQuery);

      if (checkError) {
        throw new Error(`Database check failed: ${checkError.message}`);
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingEmail = existingUsers.find(u => u.user_email === createPatientForm.user_email);
        const existingId = existingUsers.find(u => u.id_number === createPatientForm.id_number);

        if (existingEmail) {
          toast({
            title: isRTL ? "البريد الإلكتروني موجود مسبقاً" : "Email Already Exists",
            description: t('usersManagement.emailAlreadyInUse'),
            variant: "destructive",
          });
          return;
        }

        if (existingId && !(userRole === 'secretary' && !createPatientForm.id_number.trim())) {
          toast({
            title: isRTL ? "رقم الهوية موجود مسبقاً" : "ID Number Already Exists",
            description: t('usersManagement.idNumberAlreadyInUse'),
            variant: "destructive",
          });
          return;
        }
      }

      // Generate password if not provided
      const password = createPatientForm.user_password || generateDefaultPassword();

      console.log('📝 Creating Supabase Auth user...');

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createPatientForm.user_email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw new Error(`Failed to create auth account: ${authError.message}`);
      }

      console.log('✅ Auth user created successfully');

      // Prepare database record
      const currentTimestamp = new Date().toISOString();
      let idNumberToUse = createPatientForm.id_number.trim();
      if (userRole === 'secretary' && !idNumberToUse) {
        idNumberToUse = await getUnique4DigitId();
      }
      const dbRecord = {
        user_roles: 'Patient',
        english_username_a: createPatientForm.english_username_a.trim(),
        english_username_b: createPatientForm.english_username_b.trim() || createPatientForm.english_username_a.trim(),
        english_username_c: createPatientForm.english_username_c.trim() || createPatientForm.english_username_a.trim(),
        english_username_d: createPatientForm.english_username_d.trim(),
        arabic_username_a: createPatientForm.arabic_username_a.trim(),
        arabic_username_b: createPatientForm.arabic_username_b.trim() || createPatientForm.arabic_username_a.trim(),
        arabic_username_c: createPatientForm.arabic_username_c.trim() || createPatientForm.arabic_username_a.trim(),
        arabic_username_d: createPatientForm.arabic_username_d.trim(),
        user_email: createPatientForm.user_email.toLowerCase().trim(),
        id_number: idNumberToUse,
        user_phonenumber: createPatientForm.user_phonenumber.trim(),
        date_of_birth: createPatientForm.date_of_birth,
        gender_user: createPatientForm.gender_user,
        social_situation: createPatientForm.social_situation === "married" || createPatientForm.social_situation === "single"
          ? createPatientForm.social_situation
          : null,
        user_password: password, // Store for reference (in production, this should be hashed)
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        pdated_at: currentTimestamp // Note: Keep this typo if it exists in your schema
      };

      console.log('💾 Inserting patient record into database...');

      // Insert into userinfo table
      const { data: insertData, error: insertError } = await supabase
        .from('userinfo')
        .insert(dbRecord)
        .select();

      if (insertError) {
        console.error('Database insertion error:', insertError);

        // Try to cleanup the auth user if database insertion failed
        try {
          if (authData.user) {
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }

        throw new Error(`Failed to create patient record: ${insertError.message}`);
      }

      if (!insertData || insertData.length === 0) {
        throw new Error('No data returned from patient creation');
      }

      const newPatient = insertData[0] as PatientSearchResult;

      console.log('🎉 Patient created successfully:', newPatient.userid);

      // Add to search results and all patients list
      setSearchResults(prev => [newPatient, ...prev]);
      setAllPatients(prev => [newPatient, ...prev]);

      // Log the creation
      setPatientLogs(prev => [...prev, {
        key: 'newPatientCreated',
        values: {
          patientName: `${newPatient.english_username_a} ${newPatient.english_username_d}`,
          patientId: newPatient.userid,
          user: user?.name || 'Unknown',
          role: userRole
        },
        timestamp: new Date()
      }]);

      // Show success message
      toast({
        title: isRTL ? "تم إنشاء المريض بنجاح" : "Patient Created Successfully",
        description: isRTL ?
          `تم إنشاء حساب ${newPatient.english_username_a} ${newPatient.english_username_d} بنجاح` :
          `Successfully created account for ${newPatient.english_username_a} ${newPatient.english_username_d}`,
      });

      // Reset form and close
      setCreatePatientForm({
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
        user_password: "",
        social_situation: ""
      });
      setShowCreatePatientForm(false);

      // Automatically select the new patient
      selectPatient(newPatient);
      if (newPatient.social_situation) {
        setSocialSituation(newPatient.social_situation as "married" | "single" | "");
      }
    } catch (error) {
      console.error('❌ Error creating patient:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: isRTL ? "فشل في إنشاء المريض" : "Failed to Create Patient",
        description: errorMessage,
        variant: "destructive",
      });

      // Log the error
      setPatientLogs(prev => [...prev, {
        key: 'failedToCreatePatient',
        values: { error: errorMessage },
        timestamp: new Date()
      }]);

    } finally {
      setIsCreatingPatient(false);
    }
  };

  // NEW: Search for patients (enhanced version with "create if not found" functionality)
  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: isRTL ? "خطأ في البحث" : "Search Error",
        description: isRTL ? "يرجى إدخال نص للبحث" : "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]);

      console.log('🔍 Searching for patients with term:', searchTerm);

      // Search in userinfo table with multiple criteria
      const { data: patients, error } = await supabase
        .from('userinfo')
        .select('*')
        .or(`user_email.ilike.%${searchTerm}%,english_username_a.ilike.%${searchTerm}%,english_username_d.ilike.%${searchTerm}%,arabic_username_a.ilike.%${searchTerm}%,arabic_username_d.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
        .eq('user_roles', 'Patient')
        .order('english_username_a', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('📊 Found patients:', patients?.length || 0);

      if (!patients || patients.length === 0) {
        setSearchError(isRTL ? "لم يتم العثور على مرضى" : "No patients found");

        // NEW: Show option to create patient if none found
        if (canCreatePatients()) {
          setSearchError(
            isRTL ?
              "لم يتم العثور على مرضى. يمكنك إنشاء مريض جديد." :
              "No patients found. You can create a new patient."
          );
        }
        return;
      }

      // For each patient, try to get their health data
      const patientsWithHealth: PatientWithHealthInfo[] = [];

      for (const patient of patients) {
        try {
          const healthData = await getPatientHealthData(patient.userid);
          patientsWithHealth.push({
            ...patient,
            health_data: healthData || undefined
          });
        } catch (healthError) {
          console.warn(`Could not load health data for patient ${patient.userid}:`, healthError);
          patientsWithHealth.push({
            ...patient,
            health_data: undefined
          });
        }
      }

      setSearchResults(patientsWithHealth);

      // Log the search activity
      setPatientLogs(prev => [...prev, {
        key: 'searchedForPatients',
        values: { term: searchTerm, count: patientsWithHealth.length },
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('❌ Error searching patients:', error);
      setSearchError(
        error instanceof Error
          ? error.message
          : isRTL
            ? "خطأ في البحث عن المرضى"
            : "Error searching for patients"
      );

      toast({
        title: isRTL ? "خطأ في البحث" : "Search Error",
        description: isRTL ? "فشل في البحث عن المرضى" : "Failed to search for patients",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      isFetchingRef.current = false;
    }
  };

  // NEW: Select a patient to view details
  const selectPatient = (patient: PatientWithHealthInfo) => {
    setIsLoadingHealthData(true); // ADD THIS LINE

    setSelectedPatient(patient);

    // Update form with patient's basic info for editing if needed
    if (patient.health_data) {
      setPatientInfo({
        name: `${patient.english_username_a} ${patient.english_username_d}`,
        weight: patient.health_data.weight_kg?.toString() || "",
        height: patient.health_data.height_cm?.toString() || "",
        bloodType: patient.health_data.blood_type || "A+",
        bloodPressure: patient.health_data.blood_pressure || "",
        heartRate: patient.health_data.heart_rate?.toString() || "",
        temperature: patient.health_data.temperature?.toString() || "",

      });

      // Load diseases
      const diseases: string[] = [];
      if (patient.health_data.has_high_blood_pressure) diseases.push("has_high_blood_pressure");
      if (patient.health_data.has_diabetes) diseases.push("has_diabetes");
      if (patient.health_data.has_cholesterol_hdl) {
        diseases.push("has_cholesterol");
        setCholesterolType("hdl");
      } else if (patient.health_data.has_cholesterol_ldl) {
        diseases.push("has_cholesterol");
        setCholesterolType("ldl");
      } else {
        setCholesterolType("");
      }
      if (patient.health_data.has_kidney_disease) diseases.push("has_kidney_disease");
      if (patient.health_data.has_cancer) diseases.push("has_cancer");
      if (patient.health_data.has_heart_disease) diseases.push("has_heart_disease");
      if (patient.health_data.has_asthma) diseases.push("has_asthma");
      if (patient.health_data.has_alzheimer_dementia) diseases.push("has_alzheimer_dementia");
      setSelectedDiseases(diseases);

      // Load medications
      if (patient.health_data.medications) {
        const allMeds: string[] = [];
        Object.values(patient.health_data.medications).forEach((medArray: unknown) => {
          if (Array.isArray(medArray)) {
            allMeds.push(...medArray);
          }
        });
        setSelectedMedicines(allMeds);
      }
      // NEW: Load allergies
      if (patient.health_data.allergies) {
        setSelectedAllergies(patient.health_data.allergies);
      } else {
        setSelectedAllergies([]);
      }
      setCustomAllergy(""); // ADD THIS LINE HERE
      // Fix for linter: only set socialSituation if value is 'married' or 'single'
      const ss = patient.health_data?.social_situation || patient.social_situation;
      if (ss === "married" || ss === "single") {
        setSocialSituation(ss);
      } else {
        setSocialSituation("");
      }

      setHealthData(patient.health_data);
      setIsLoadingHealthData(false); // ADD THIS LINE

    } else {
      // Reset form for patients without health data
      setPatientInfo({
        name: `${patient.english_username_a} ${patient.english_username_d}`,
        weight: "",
        height: "",
        bloodType: "A+",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
      });
      setSelectedDiseases([]);
      setSelectedMedicines([]);
      setSelectedAllergies([]);
      setCustomAllergy(""); // ADD THIS LINE HERE
      setHealthData(null);
      setIsLoadingHealthData(false); // ADD THIS LINE

    }

    // Log the selection
    setPatientLogs(prev => [...prev, {
      key: 'selectedPatient',
      values: {
        name: `${patient.english_username_a} ${patient.english_username_d}`,
        id: patient.userid
      },
      timestamp: new Date()
    }]);
  };

  // Load existing patient health data when component mounts (for patients only)
  useEffect(() => {
    if (user?.id && userRole === 'patient') {
      setIsLoadingHealthData(true);
      loadPatientHealthData();
    }
  }, [user]);

  // Load all patients when component mounts (for nurses/doctors/admins)
  useEffect(() => {
    let isMounted = true;

    const initializeComponent = async () => {
      if (canSearchPatients() && isMounted) {
        await loadAllPatients();
      }
    };

    initializeComponent();

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
    };
  }, []);



  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setSearchError(null);
      setSelectedPatient(null);
    }
  }, [searchTerm]);


  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
  const [customAllergy, setCustomAllergy] = useState("");

  // Filter patients based on search term
  const filteredPatients = allPatients.filter(patient => {
    if (!patientListFilter.trim()) return true;

    const searchLower = patientListFilter.toLowerCase();
    return (
      patient.english_username_a?.toLowerCase().includes(searchLower) ||
      patient.english_username_d?.toLowerCase().includes(searchLower) ||
      patient.arabic_username_a?.toLowerCase().includes(searchLower) ||
      patient.arabic_username_d?.toLowerCase().includes(searchLower) ||
      patient.user_email?.toLowerCase().includes(searchLower) ||
      patient.id_number?.toLowerCase().includes(searchLower)
    );
  });

  // UPDATED: Enhanced loadPatientHealthData function with user tracking
  const loadPatientHealthData = async () => {
    if (!user?.id) {
      setPatientLogs(prev => [...prev, { key: 'errorNoUserLoggedIn', timestamp: new Date() }]);
      return;
    }

    if (userRole !== 'patient') {
      return;
    }
    setIsLoadingHealthData(true); // ADD THIS LINE

    try {
      const data = await getPatientHealthData(parseInt(user.id));
      setHealthData(data);

      if (data) {
        setPatientInfo({
          name: user.name || "",
          weight: data.weight_kg?.toString() || "",
          height: data.height_cm?.toString() || "",
          bloodType: data.blood_type || "A+",
          bloodPressure: data.blood_pressure || "",
          heartRate: data.heart_rate?.toString() || "",
          temperature: data.temperature?.toString() || "",
        });

        // Load diseases
        const diseases: string[] = [];
        if (data.has_high_blood_pressure) diseases.push("has_high_blood_pressure");
        if (data.has_diabetes) diseases.push("has_diabetes");
        if (data.has_cholesterol_hdl) {
          diseases.push("has_cholesterol");
          setCholesterolType("hdl");
        } else if (data.has_cholesterol_ldl) {
          diseases.push("has_cholesterol");
          setCholesterolType("ldl");
        } else {
          setCholesterolType("");
        }
        if (data.has_kidney_disease) diseases.push("has_kidney_disease");
        if (data.has_cancer) diseases.push("has_cancer");
        if (data.has_heart_disease) diseases.push("has_heart_disease");
        if (data.has_asthma) diseases.push("has_asthma");
        if (data.has_alzheimer_dementia) diseases.push("has_alzheimer_dementia");
        setSelectedDiseases(diseases);

        // Load medications
        if (data.medications) {
          const allMeds: string[] = [];
          Object.values(data.medications).forEach((medArray: unknown) => {
            if (Array.isArray(medArray)) {
              allMeds.push(...medArray);
            }
          });
          setSelectedMedicines(allMeds);
        }
        // NEW: Load allergies
        if (data.allergies) {
          setSelectedAllergies(data.allergies);
        } else {
          setSelectedAllergies([]);
        }
        setCustomAllergy(""); // ADD THIS LINE HERE
        if (data.social_situation === "married" || data.social_situation === "single") {
          setSocialSituation(data.social_situation);
        } else {
          setSocialSituation("");
        }

        // Enhanced log entry with user info
        const createdBy = data.created_by_name || data.created_by_email || 'Unknown';
        const createdByRole = data.created_by_role || 'Unknown';
        const updatedBy = data.updated_by_name || data.updated_by_email || 'Unknown';
        const updatedByRole = data.updated_by_role || 'Unknown';

        setPatientLogs(prev => [...prev, {
          key: 'healthInfoLoaded',
          values: {
            createdBy: createdBy,
            createdByRole: createdByRole,
            updatedBy: updatedBy,
            updatedByRole: updatedByRole
          },
          timestamp: new Date(data.updated_at || '')
        }]);

      } else {
        setPatientInfo({
          name: user.name || "",
          weight: "",
          height: "",
          bloodType: "A+",
          bloodPressure: "",
          heartRate: "",
          temperature: "",
        });
        setSelectedDiseases([]);
        setSelectedMedicines([]);
        setHealthData(null);
        setSelectedAllergies([]);
        setSelectedMedicines([]);
        setSocialSituation(""); // ADD THIS LINE

        setPatientLogs(prev => [...prev, { key: 'welcomeHealthInfo', timestamp: new Date() }]);
      }

    } catch (error: unknown) {
      console.error('❌ Error in loadPatientHealthData:', error);
      setHealthData(null);

      const errorMessage =
        error instanceof Error
          ? error.message
          : isRTL
            ? "خطأ غير معروف"
            : "Unknown error";
      setPatientLogs(prev => [...prev, {
        key: 'errorLoadingHealthInfo',
        values: { error: errorMessage },
        timestamp: new Date()
      }]);
    } finally {
      setIsLoadingHealthData(false);

    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle weight validation - limit to 1-220 kg
    if (name === 'weight') {
      const weightValue = parseFloat(value);
      if (value === '' || (weightValue >= 1 && weightValue <= 220)) {
        setPatientInfo(prev => ({ ...prev, [name]: value }));
      } else {
        toast({
          title: isRTL ? "وزن غير صحيح" : "Invalid Weight",
          description: isRTL ? "يرجى إدخال وزن صحيح بين 1-220 كيلوغرام" : "Please enter a valid weight between 1-220 kg",
          variant: "destructive",
        });
      }
      return;
    }

    // Handle height validation - limit to 1-200 cm
    if (name === 'height') {
      const heightValue = parseInt(value);
      if (value === '' || (heightValue >= 1 && heightValue <= 200)) {
        setPatientInfo(prev => ({ ...prev, [name]: value }));
      } else {
        toast({
          title: isRTL ? "طول غير صحيح" : "Invalid Height",
          description: isRTL ? "يرجى إدخال طول صحيح بين 1-200 سم" : "Please enter a valid height between 1-200 cm",
          variant: "destructive",
        });
      }
      return;
    }

    // Handle other fields normally
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Add this function
  const addCustomAllergy = () => {
    if (customAllergy.trim()) {
      const trimmedAllergy = customAllergy.trim();
      if (!selectedAllergies.includes(trimmedAllergy)) {
        setSelectedAllergies(prev => [...prev, trimmedAllergy]);
        setCustomAllergy("");
      } else {
        toast({
          title: isRTL ? "حساسية موجودة مسبقاً" : "Allergy Already Added",
          description: isRTL ? "هذه الحساسية مضافة بالفعل" : "This allergy is already in the list",
          variant: "destructive",
        });
      }
    }
  };
  // FIXED: Handle disease selection (multiple diseases can be selected)
  const handleDiseaseSelect = (diseaseKey: string) => {
    setSelectedDiseases(prev =>
      prev.includes(diseaseKey)
        ? prev.filter(d => d !== diseaseKey)
        : [...prev, diseaseKey]
    );
  };

  const handleMedicineSelect = (medicine: string) => {
    setSelectedMedicines(prev =>
      prev.includes(medicine)
        ? prev.filter(m => m !== medicine)
        : [...prev, medicine]
    );
  };

  // FIXED: Organize medicines by category for database storage
  const organizeMedicinesByCategory = (selectedMeds: string[]) => {
    const organizedMeds = {
      pain_relief: [] as string[],
      allergy: [] as string[],
      flu: [] as string[],
      antibiotics: [] as string[],
    };

    selectedMeds.forEach(medicine => {
      medicineCategories.forEach(category => {
        category.medicines.forEach(med => {
          if (med.en === medicine) {
            const categoryName = category.category.en.toLowerCase();
            if (categoryName === 'pain relief') {
              organizedMeds.pain_relief.push(medicine);
            } else if (categoryName === 'allergy') {
              organizedMeds.allergy.push(medicine);
            } else if (categoryName === 'flu') {
              organizedMeds.flu.push(medicine);
            } else if (categoryName === 'antibiotics') {
              organizedMeds.antibiotics.push(medicine);
            }
          }
        });
      });
    });

    return organizedMeds;
  };

  // FIXED: Validate patient information
  const validatePatientInfo = (): boolean => {
    if (patientInfo.weight && (parseFloat(patientInfo.weight) <= 0 || parseFloat(patientInfo.weight) > 220)) {
      toast({
        title: isRTL ? "وزن غير صحيح" : "Invalid Weight",
        description: isRTL ? "يرجى إدخال وزن صحيح بين 1-220 كيلوغرام" : "Please enter a valid weight between 1-220 kg",
        variant: "destructive",
      });
      return false;
    }

    if (patientInfo.height && (parseInt(patientInfo.height) <= 0 || parseInt(patientInfo.height) > 200)) {
      toast({
        title: isRTL ? "طول غير صحيح" : "Invalid Height",
        description: isRTL ? "يرجى إدخال طول صحيح بين 1-200 سم" : "Please enter a valid height between 1-200 cm",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };
  // NEW: Function to update social situation in userinfo table
  const updatePatientSocialSituation = async (patientId: number, newSocialSituation: string) => {
    if (userRole === 'secretary' && selectedPatient?.gender_user === 'female') {
      try {
        const { error } = await supabase
          .from('userinfo')
          .update({ social_situation: newSocialSituation || null })
          .eq('userid', patientId);

        if (error) {
          console.error('Error updating social situation:', error);
          toast({
            title: isRTL ? "خطأ في تحديث الحالة الاجتماعية" : "Error Updating Social Situation",
            description: isRTL ? "فشل في حفظ الحالة الاجتماعية" : "Failed to save social situation",
            variant: "destructive",
          });
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error updating social situation:', error);
        return false;
      }
    }
    return true;
  };
  const handleSaveInfo = async () => {
    // Determine which patient ID to use
    let targetPatientId: string;

    if ((userRole === 'nurse' || userRole === 'admin' || userRole === 'administrator' || userRole === 'secretary') && selectedPatient) {
      // Nurse/Admin/Secretary is updating a selected patient's information
      targetPatientId = selectedPatient.userid.toString();
    } else if (userRole === 'patient' && user?.id) {
      // Patient is updating their own information
      targetPatientId = user.id;
    } else {
      console.log('Debug info:', { userRole, selectedPatient: !!selectedPatient, userId: user?.id });
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "لا يمكن تحديد المريض المراد تحديث معلوماته" : "Cannot determine which patient to update",
        variant: "destructive",
      });
      return;
    }

    if (!validatePatientInfo()) return;

    try {
      // Prepare disease data
      const diseaseData = {
        has_high_blood_pressure: selectedDiseases.includes("has_high_blood_pressure"),
        has_diabetes: selectedDiseases.includes("has_diabetes"),
        has_cholesterol_hdl: selectedDiseases.includes("has_cholesterol_hdl"),
        has_cholesterol_ldl: selectedDiseases.includes("has_cholesterol_ldl"),
        has_kidney_disease: selectedDiseases.includes("has_kidney_disease"),
        has_cancer: selectedDiseases.includes("has_cancer"),
        has_heart_disease: selectedDiseases.includes("has_heart_disease"),
        has_asthma: selectedDiseases.includes("has_asthma"),
        has_alzheimer_dementia: selectedDiseases.includes("has_alzheimer_dementia"),
      };

      // Prepare medication data
      const medicationData = organizeMedicinesByCategory(selectedMedicines);

      // Prepare data to save
      // FIXED CODE:
      const dataToSave = {
        patient_id: parseInt(targetPatientId),
        weight_kg: patientInfo.weight ? parseFloat(patientInfo.weight) : undefined,
        height_cm: patientInfo.height ? parseInt(patientInfo.height) : undefined,
        blood_type: patientInfo.bloodType || undefined,
        blood_pressure: patientInfo.bloodPressure || undefined,
        heart_rate: patientInfo.heartRate ? parseInt(patientInfo.heartRate) : undefined,
        temperature: patientInfo.temperature ? parseFloat(patientInfo.temperature) : undefined,
        ...diseaseData,
        medications: medicationData,
        allergies: selectedAllergies,
        social_situation: socialSituation === "married" || socialSituation === "single" ? socialSituation : undefined
      };

      // Save to database using the hook (user tracking is automatic via database trigger)
      const success = await savePatientHealthData(dataToSave);

      if (success) {
        // Reload data to get updated user tracking info

        if (userRole === 'patient') {
          await loadPatientHealthData();
        } else if ((userRole === 'nurse' || userRole === 'admin' || userRole === 'secretary') && selectedPatient) {

          // Refresh the selected patient's data
          const updatedHealthData = await getPatientHealthData(selectedPatient.userid);
          setHealthData(updatedHealthData);
          // Update the selected patient in the results
          setSearchResults(prev => prev.map(p =>
            p.userid === selectedPatient.userid
              ? { ...p, health_data: updatedHealthData || undefined }
              : p
          ));
        }

        // Add success log with current user info
        const currentUser = user?.name || user?.email || 'Current User';
        const patientName = selectedPatient ?
          `${selectedPatient.english_username_a} ${selectedPatient.english_username_d}` :
          user?.name || 'Patient';

        setPatientLogs(prev => [...prev, {
          key: 'healthInfoSaved',
          values: {
            patientName: patientName,
            user: currentUser,
            role: userRole
          },
          timestamp: new Date()
        }]);
      } else {
        // Add error log
        setPatientLogs(prev => [...prev, { key: 'failedToSaveHealthInfo', timestamp: new Date() }]);
      }

    } catch (error) {
      console.error('Error saving patient health data:', error);

      setPatientLogs(prev => [...prev, { key: 'errorSavingInfo', timestamp: new Date() }]);
    }
  };

  // Function to check if the current user role can see the user creation section
  const canSeeUserCreation = (): boolean => {
    return ["admin", "doctor", "nurse", "secretary"].includes(userRole);
  };

  // Function to check if the current user role can search for patients
  const canSearchPatients = (): boolean => {
    return ["nurse", "doctor", "admin", "administrator", "secretary"].includes(userRole);
  };
  // NEW: Function to check if the current user role can create patients
  const canCreatePatients = (): boolean => {
    return ["nurse", "admin", "administrator", "secretary"].includes(userRole);
  };
  const getBloodTypeDisplay = (type: string) => {
    if (!isRTL) return type;

    const arabicBloodTypes: { [key: string]: string } = {
      'A+': 'أ+',
      'A-': 'أ-',
      'B+': 'ب+',
      'B-': 'ب-',
      'AB+': 'أب+',
      'AB-': 'أب-',
      'O+': 'ع+',
      'O-': 'ع-'
    };

    return arabicBloodTypes[type] || type;
  };

  // Calculate health statistics for display
  const calculatePatientStats = (healthData: PatientHealthData) => {
    const diseaseCount = [
      healthData.has_high_blood_pressure,
      healthData.has_diabetes,
      healthData.has_cholesterol_hdl || healthData.has_cholesterol_ldl,
      healthData.has_kidney_disease,
      healthData.has_cancer,
      healthData.has_heart_disease,
      healthData.has_asthma,
      healthData.has_alzheimer_dementia
    ].filter(Boolean).length;

    const medicationCount = healthData.medications
      ? Object.values(healthData.medications).flat().length
      : 0;
    const allergyCount = healthData.allergies ? healthData.allergies.length : 0;

    let bmi = null;
    if (healthData.weight_kg && healthData.height_cm) {
      const heightInMeters = healthData.height_cm / 100;
      bmi = (healthData.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return { diseaseCount, medicationCount, allergyCount, bmi };
  };

  // Show loading state
  if (healthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Skeleton width={32} height={32} circle className="mx-auto mb-4" />
          <Skeleton width={160} height={20} className="mx-auto mb-2" />
          <Skeleton width={100} height={16} className="mx-auto" />
          <p className="text-gray-600">
            {isRTL ? "جاري تحميل المعلومات الصحية..." : "Loading health information..."}
          </p>
          {/* Skeleton cards for health info */}
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} width={320} height={32} className="mx-auto" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Move these to the top of the Index component, after other useState hooks

  const handleAllergySelect = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  return (
    <div className={`index-flex-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* NEW: Patient Sidebar - Only visible to nurses, doctors, and admins */}
      {canSearchPatients() && (
        <>
          {/* Sidebar Toggle Button - Fixed Position */}
          <Button
            onClick={() => setShowPatientSidebar(!showPatientSidebar)}
            className={` patient-list ${isRTL ? 'rtl' : 'ltr'}`}
            size="sm"
          >
            <List className="h-4 w-4" />
            {showPatientSidebar ?
              (isRTL ? "إخفاء القائمة" : "Hide List") :
              (isRTL ? "قائمة المرضى" : "Patient List")
            }
            {showPatientSidebar ? <X className="h-4 w-4 ml-2" /> : <Users className="h-4 w-4 ml-2" />}
          </Button>

          {/* Sidebar */}
          <div className={`patient-sidebar ${isRTL ? 'rtl' : 'ltr'} ${showPatientSidebar ? 'show' : ''}`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isRTL ? "قائمة المرضى" : "All Patients"}
                </h3>
                <Badge variant="secondary">
                  {filteredPatients.length}
                </Badge>
              </div>
              {/* Sidebar Hide Button - Only show when sidebar is open */}
              {showPatientSidebar && (
                <Button
                  onClick={() => setShowPatientSidebar(false)}
                  className={`patient-list hide-list-btn ${isRTL ? 'rtl' : 'ltr'}`}
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  {isRTL ? "إخفاء القائمة" : "Hide List"}
                </Button>
              )}
            </div>

            {/* Sidebar Search Filter */}
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-gray-400`} />
              <Input
                type="text"
                placeholder={isRTL ? "فلترة المرضى..." : "Filter patients..."}
                value={patientListFilter}
                onChange={(e) => setPatientListFilter(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'} text-sm`}
              />
            </div>

            {/* Refresh Button */}
            <Button
              onClick={loadAllPatients}
              disabled={isLoadingPatients}
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs"
            >
              {isLoadingPatients ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  {isRTL ? "جاري التحميل..." : "Loading..."}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {isRTL ? "تحديث القائمة" : "Refresh List"}
                </>
              )}
            </Button>

            {/* Sidebar Content */}
            <ScrollArea className="h-full pb-20">
              <div className="p-2">
                {isLoadingPatients ? (
                  <PatientSidebarSkeletonLoading />
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      {patientListFilter ?
                        (isRTL ? "لا توجد مرضى مطابقة للفلتر" : "No patients match filter") :
                        (isRTL ? "لا توجد مرضى" : "No patients found")
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <Card
                        key={patient.userid}
                        className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${selectedPatient?.userid === patient.userid
                          ? 'border-l-blue-500 bg-blue-50 shadow-md'
                          : 'border-l-gray-200 hover:border-l-blue-300'
                          }`}
                        onClick={() => selectPatient(patient)}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {/* Patient Name */}
                            <div>
                              {patient.arabic_username_a ? (
                                <>
                                  <p className="font-medium text-sm text-gray-900 text-left" dir="ltr" style={{ fontFamily: 'Arial, sans-serif' }}>
                                    {patient.arabic_username_a} {patient.arabic_username_d}
                                  </p>
                                  <p className="text-xs text-gray-600 text-left" dir="ltr">
                                    {patient.english_username_a} {patient.english_username_d}
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium text-sm text-gray-900 text-left" dir="ltr">
                                  {patient.english_username_a} {patient.english_username_d}
                                </p>
                              )}
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-1">
                              <div className={`flex items-center gap-1 text-xs text-gray-600 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                {isRTL ? (
                                  <>
                                    <span className="truncate" dir="ltr">{patient.user_email}</span>
                                    <Mail className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate" dir="ltr">{patient.user_email}</span>
                                  </>
                                )}
                              </div>

                              {patient.id_number && (
                                <div className={`flex items-center gap-1 text-xs text-gray-600 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                  {isRTL ? (
                                    <>
                                      <CreditCard className="h-3 w-3" />
                                      <span dir="ltr">{patient.id_number}</span>
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="h-3 w-3" />
                                      <span>{patient.id_number}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {patient.user_phonenumber && (
                                <div className={`flex items-center gap-1 text-xs text-gray-600 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                  {isRTL ? (
                                    <>
                                      <Phone className="h-3 w-3" />
                                      <span dir="ltr">{patient.user_phonenumber}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Phone className="h-3 w-3" />
                                      <span>{patient.user_phonenumber}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Health Status Indicator */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                              {isRTL ? (
                                <>
                                  {/* Quick Stats - Right side in English */}
                                  {patient.health_data && (
                                    <div className="flex gap-1 text-xs">
                                      {(() => {
                                        const stats = calculatePatientStats(patient.health_data);
                                        return (
                                          <>
                                            <span className="text-orange-600">{stats.diseaseCount}C</span>
                                            <span className="text-green-600">{stats.medicationCount}M</span>
                                            <span className="text-red-600">{stats.allergyCount}A</span> {/* NEW: Add allergies */}
                                            {stats.bmi && <span className="text-blue-600">{stats.bmi}</span>}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}

                                  {/* Badge - Right side in Arabic */}
                                  {patient.health_data ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <Database className="h-3 w-3 mr-1" />
                                      <span dir="rtl" className="text-right">بيانات متوفرة</span>
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <span dir="rtl" className="text-right">لا توجد بيانات</span>
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* Badge - Left side in English */}
                                  {patient.health_data ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <Database className="h-3 w-3 mr-1" />
                                      Has Data
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      No Data
                                    </Badge>
                                  )}

                                  {/* Quick Stats - Right side in English */}
                                  {patient.health_data && (
                                    <div className="flex gap-1 text-xs">
                                      {(() => {
                                        const stats = calculatePatientStats(patient.health_data);
                                        return (
                                          <>
                                            <span className="text-orange-600">{stats.diseaseCount}C</span>
                                            <span className="text-green-600">{stats.medicationCount}M</span>
                                            {stats.bmi && <span className="text-blue-600">{stats.bmi}</span>}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>



                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar Overlay */}
          {showPatientSidebar && (
            <div
              className="sidebar-overlay"
              onClick={() => setShowPatientSidebar(false)}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className={`main-content ${canSearchPatients() && showPatientSidebar ? (isRTL ? 'with-sidebar-rtl' : 'with-sidebar-ltr') : ''}`}>
        <div className="main-content-inner space-y-4 md:space-y-8">
          {/* Notification Alert - visible to all */}
          <Alert variant="default" className={`alert-responsive ${isRTL ? 'rtl' : ''} bg-blue-50 border-blue-200`}>
            <AlertDescription className={isRTL ? 'py-4 px-2' : 'py-2'}>
              <span className="font-medium">{t("home.remindeinder")}:</span> {t("home.reservationRequired")}
              <Button variant="link" className={`h-auto p-0 ${isRTL ? 'mr-3' : 'ml-2'}`} asChild>
                <Link to="/clinics">{t("home.bookNow")}</Link>
              </Button>
            </AlertDescription>
          </Alert>

          {/* NEW: Patient Search Section - Only visible to nurses, doctors, and admins */}
          {canSearchPatients() && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Search className="h-6 w-6" />
                {isRTL ? "البحث عن المرضى" : "Patient Search"}
              </h2>

              {/* Search Input */}
              <div className="search-controls">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={isRTL ? "ابحث ..." : "Search by ..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                  />
                </div>
                <Button onClick={searchPatients} disabled={isSearching} className="flex items-center gap-2">
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRTL ? "جاري البحث..." : "Searching..."}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      {isRTL ? "بحث" : "Search"}
                    </>
                  )}
                </Button>

                {/* NEW: Create Patient Button - Only for nurses and admins */}
                {canCreatePatients() && (
                  <Button
                    onClick={() => setShowCreatePatientForm(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    {isRTL ? "إنشاء مريض جديد" : "Create New Patient"}
                  </Button>
                )}
              </div>

              {/* Search Error with Create Patient Option */}
              {searchError && (
                <Alert variant={searchError.includes("No patients found") ? "default" : "destructive"} className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{searchError}</span>
                    {searchError.includes("No patients found") && canCreatePatients() && (
                      <Button
                        onClick={() => setShowCreatePatientForm(true)}
                        size="sm"
                        className="ml-4 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {isRTL ? "إنشاء مريض" : "Create Patient"}
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Search Results */}
              {isSearching ? (
                <PatientSearchSkeletonLoading isRTL={isRTL} />
              ) : searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    {isRTL ? "نتائج البحث" : "Search Results"} ({searchResults.length})
                  </h3>

                  <div className="search-results-grid">
                    {searchResults.map((patient) => (
                      <Card
                        key={patient.userid}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedPatient?.userid === patient.userid ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                        onClick={() => selectPatient(patient)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{patient.english_username_a} {patient.english_username_d}</span>
                            {patient.health_data && (
                              <Badge variant="secondary" className="text-xs">
                                <Database className="h-3 w-3 mr-1" />
                                {isRTL ? "بيانات متوفرة" : "Has Data"}
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{patient.user_email}</span>
                            </div>
                            {patient.id_number && (
                              <div className="flex items-center gap-2 mt-1">
                                <CreditCard className="h-3 w-3" />
                                <span>{patient.id_number}</span>
                              </div>
                            )}
                            {patient.user_phonenumber && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{patient.user_phonenumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Health Summary */}
                          {patient.health_data && (
                            <div className="mt-3 pt-2 border-t">
                              <div className="grid grid-cols-4 gap-2 text-xs"> {/* Changed from 3 to 4 columns */}
                                {(() => {
                                  const stats = calculatePatientStats(patient.health_data);
                                  return (
                                    <>
                                      <div className="text-center">
                                        <div className="font-medium text-orange-600">{stats.diseaseCount}</div>
                                        <div className="text-gray-500">{isRTL ? "حالات" : "Conditions"}</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-medium text-green-600">{stats.medicationCount}</div>
                                        <div className="text-gray-500">{isRTL ? "أدوية" : "Meds"}</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-medium text-red-600">{stats.allergyCount}</div>
                                        <div className="text-gray-500">{isRTL ? "حساسية" : "Allergies"}</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-medium text-blue-600">
                                          {stats.bmi || '--'}
                                        </div>
                                        <div className="text-gray-500">BMI</div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}

                          {!patient.health_data && (
                            <div className="mt-3 pt-2 border-t">
                              <div className="text-xs text-gray-500 text-center">
                                {isRTL ? "لا توجد بيانات صحية" : "No health data available"}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Patient Info */}
              {selectedPatient && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isRTL ? "المريض المحدد:" : "Selected Patient:"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">{isRTL ? "الاسم:" : "Name:"}</span>
                      <div>{selectedPatient.english_username_a} {selectedPatient.english_username_d}</div>
                      {selectedPatient.arabic_username_a && (
                        <div className="text-gray-600">{selectedPatient.arabic_username_a} {selectedPatient.arabic_username_d}</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{isRTL ? "البريد الإلكتروني:" : "Email:"}</span>
                      <div>{selectedPatient.user_email}</div>
                    </div>
                    <div>
                      <span className="font-medium">{isRTL ? "رقم الهوية:" : "ID Number:"}</span>
                      <div>{selectedPatient.id_number || 'N/A'}</div>
                    </div>

                    {/* ADD THIS: Show social situation for female patients when secretary */}
                    {userRole === 'secretary' && selectedPatient.gender_user === 'female' && (
                      <div>
                        <span className="font-medium">{isRTL ? "الحالة الاجتماعية:" : "Social Status:"}</span>
                        <div>
                          {socialSituation ? (
                            socialSituation === 'married'
                              ? (isRTL ? "متزوجة" : "Married")
                              : (isRTL ? "عزباء" : "Single")
                          ) : (
                            <span className="text-gray-500 italic">
                              {isRTL ? "غير محدد" : "Not specified"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* NEW: Create Patient Form Modal */}
              {showCreatePatientForm && canCreatePatients() && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        {isRTL ? "إنشاء مريض جديد" : "Create New Patient"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Name Fields */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">{isRTL ? "الاسم باللغة الإنجليزية" : "English Name"}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="create_english_first" className="text-sm">
                                {isRTL ? "الأول" : "First"}
                                <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                              </Label>
                              <Input
                                id="create_english_first"
                                name="english_username_a"
                                value={createPatientForm.english_username_a}
                                onChange={handleCreatePatientFormChange}
                                required
                                placeholder={placeholders.english.first}
                              />
                            </div>
                            <div>
                              <Label htmlFor="create_english_second" className="text-sm">
                                {isRTL ? "الثاني" : "Second"}
                                <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                              </Label>
                              <Input
                                id="create_english_second"
                                name="english_username_b"
                                value={createPatientForm.english_username_b}
                                onChange={handleCreatePatientFormChange}
                                required
                                placeholder={placeholders.english.second}
                              />
                            </div>
                            <div>
                              <Label htmlFor="create_english_third" className="text-sm">
                                {isRTL ? "الثالث" : "Third"}
                                <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                              </Label>
                              <Input
                                id="create_english_third"
                                name="english_username_c"
                                value={createPatientForm.english_username_c}
                                onChange={handleCreatePatientFormChange}
                                required
                                placeholder={placeholders.english.third}
                              />
                            </div>
                            <div>
                              <Label htmlFor="create_english_last" className="text-sm">
                                {isRTL ? "الأخير" : "Last"}
                                <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                              </Label>
                              <Input
                                id="create_english_last"
                                name="english_username_d"
                                value={createPatientForm.english_username_d}
                                onChange={handleCreatePatientFormChange}
                                required
                                placeholder={placeholders.english.last}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Arabic Name Fields */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">{isRTL ? "الاسم باللغة العربية" : "Arabic Name"}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {isRTL ? (
                              <>
                                <div>
                                  <Label htmlFor="create_arabic_first" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الأول
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_first"
                                    name="arabic_username_a"
                                    value={createPatientForm.arabic_username_a}
                                    onChange={handleCreatePatientFormChange}
                                    required
                                    dir="rtl"
                                    className="text-right"
                                    placeholder={placeholders.arabic.first}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="create_arabic_second" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الثاني
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_second"
                                    name="arabic_username_b"
                                    value={createPatientForm.arabic_username_b}
                                    onChange={handleCreatePatientFormChange}
                                    dir="rtl"
                                    required
                                    className="text-right"
                                    placeholder={placeholders.arabic.second}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="create_arabic_third" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الثالث
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_third"
                                    name="arabic_username_c"
                                    value={createPatientForm.arabic_username_c}
                                    onChange={handleCreatePatientFormChange}
                                    dir="rtl"
                                    required
                                    className="text-right"
                                    placeholder={placeholders.arabic.third}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="create_arabic_last" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الأخير
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_last"
                                    name="arabic_username_d"
                                    value={createPatientForm.arabic_username_d}
                                    onChange={handleCreatePatientFormChange}
                                    required
                                    dir="rtl"
                                    className="text-right"
                                    placeholder={placeholders.arabic.last}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                {/* First row: Second, First */}
                                <div>
                                  <Label htmlFor="create_arabic_second" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الثاني
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_second"
                                    name="arabic_username_b"
                                    value={createPatientForm.arabic_username_b}
                                    onChange={handleCreatePatientFormChange}
                                    dir="rtl"
                                    required
                                    className="text-right"
                                    placeholder={placeholders.arabic.second}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="create_arabic_first" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الأول
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_first"
                                    name="arabic_username_a"
                                    value={createPatientForm.arabic_username_a}
                                    onChange={handleCreatePatientFormChange}
                                    required
                                    dir="rtl"

                                    className="text-right"
                                    placeholder={placeholders.arabic.first}
                                  />
                                </div>
                                {/* Second row: Last, Third */}
                                <div>
                                  <Label htmlFor="create_arabic_last" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الأخير
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_last"
                                    name="arabic_username_d"
                                    value={createPatientForm.arabic_username_d}
                                    onChange={handleCreatePatientFormChange}
                                    required
                                    dir="rtl"
                                    className="text-right"
                                    placeholder={placeholders.arabic.last}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="create_arabic_third" className="text-sm text-right w-full block" style={{ direction: 'rtl' }}>
                                    الثالث
                                    <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                                  </Label>
                                  <Input
                                    id="create_arabic_third"
                                    name="arabic_username_c"
                                    value={createPatientForm.arabic_username_c}
                                    onChange={handleCreatePatientFormChange}
                                    dir="rtl"
                                    required
                                    className="text-right"
                                    placeholder={placeholders.arabic.third}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">{isRTL ? "المعلومات الشخصية" : "Personal Information"}</h4>
                          <div>
                            <Label htmlFor="create_dob" className="text-sm">
                              {isRTL ? "تاريخ الميلاد" : "Date of Birth"}
                              <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                            </Label>
                            <div className="relative">
                              <Calendar className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground`} />
                              <Input
                                id="create_dob"
                                name="date_of_birth"
                                type="date"
                                value={createPatientForm.date_of_birth}
                                onChange={handleCreatePatientFormChange}
                                className={`${isRTL ? 'pr-12' : 'pl-3'} ${isRTL ? 'text-left' : 'text-left'}`}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm">
                              {isRTL ? "الجنس" : "Gender"}
                              <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                            </Label>
                            <RadioGroup
                              value={createPatientForm.gender_user}
                              onValueChange={(value) => setCreatePatientForm(prev => ({ ...prev, gender_user: value }))}
                              className={`flex gap-4 mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}
                            >
                              {isRTL ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="create_female">{t("auth.female")}</Label>
                                    <RadioGroupItem value="female" id="create_female" />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="create_male">{t("auth.male")}</Label>
                                    <RadioGroupItem value="male" id="create_male" />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="create_male" />
                                    <Label htmlFor="create_male">{t("auth.male")}</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="create_female" />
                                    <Label htmlFor="create_female">{t("auth.female")}</Label>
                                  </div>
                                </>
                              )}
                            </RadioGroup>
                          </div>
                          {/* ADD THIS: Social Situation - Only for female patients and secretary role */}
                          {userRole === 'secretary' && createPatientForm.gender_user === 'female' && (
                            <div style={{ marginTop: '32px' }}>
                              <Label className="text-sm">{isRTL ? "الحالة الاجتماعية" : "Social Situation"}</Label>
                              <RadioGroup
                                value={createPatientForm.social_situation}
                                onValueChange={(value) => setCreatePatientForm(prev => ({ ...prev, social_situation: value as '' | 'single' | 'married' }))}
                                className={`flex gap-4 mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}
                              >
                                {isRTL ? (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <Label htmlFor="create_single">{isRTL ? "عزباء" : "Single"}</Label>
                                      <RadioGroupItem value="single" id="create_single" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Label htmlFor="create_married">{isRTL ? "متزوجة" : "Married"}</Label>
                                      <RadioGroupItem value="married" id="create_married" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="married" id="create_married" />
                                      <Label htmlFor="create_married">{isRTL ? "متزوجة" : "Married"}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="single" id="create_single" />
                                      <Label htmlFor="create_single">{isRTL ? "عزباء" : "Single"}</Label>
                                    </div>
                                  </>
                                )}
                              </RadioGroup>
                            </div>
                          )}
                          <div style={{ marginTop: '32px' }}>
                            <Label htmlFor="create_password" className="text-sm">
                              {isRTL ? "كلمة المرور" : "Password"}
                            </Label>
                            <div className="relative">
                              <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                              <Input
                                id="create_password"
                                name="user_password"
                                type={showCreatePassword ? "text" : "password"}
                                value={createPatientForm.user_password}
                                onChange={handleCreatePatientFormChange}
                                className={isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                                placeholder={isRTL ? "اتركها فارغة للإنشاء التلقائي" : "Leave empty for auto-generation"}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-muted-foreground hover:text-gray-700`}
                              >
                                {showCreatePassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">{isRTL ? "معلومات الاتصال" : "Contact Information"}</h4>
                          <div>
                            <Label htmlFor="create_email" className="text-sm">
                              {isRTL ? "البريد الإلكتروني" : "Email"}
                              <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                            </Label>
                            <div className="relative">
                              <Mail className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground`} />
                              <Input
                                id="create_email"
                                name="user_email"
                                type="email"
                                value={createPatientForm.user_email}
                                onChange={handleCreatePatientFormChange}
                                className={isRTL ? 'pr-10' : 'pl-10'}
                                required
                                placeholder={t('usersManagement.emailPlaceholder')}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="create_phone" className="text-sm">
                              {isRTL ? "رقم الهاتف" : "Phone Number"}
                              <span style={{ color: 'red', marginLeft: 2, fontSize: '1.5em', lineHeight: 0 }}> • </span>
                            </Label>
                            <div className="relative">
                              <Phone className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground`} />
                              <Input
                                id="create_phone"
                                name="user_phonenumber"
                                type="tel"
                                value={createPatientForm.user_phonenumber}
                                onChange={handleCreatePatientFormChange}
                                className={isRTL ? 'pr-10' : 'pl-10'}
                                required
                                placeholder={isRTL ? "٩٧٠/٩٧٢ + أرقام" : "+970/+972 + digits"} dir={isRTL ? "rtl" : "ltr"}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <Label htmlFor="create_id_number" className="text-sm flex items-center gap-2">
                                {isRTL ? "رقم الهوية" : "ID Number"}
                                {createPatientForm.id_number.length === 9 && (
                                  <>
                                    {createIdValidationStatus === 'valid' && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    {createIdValidationStatus === 'invalid' && (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </>
                                )}
                              </Label>
                            </div>

                            <div className="relative">
                              <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                              <Input
                                id="create_id_number"
                                name="id_number"
                                value={createPatientForm.id_number}
                                onChange={handleCreatePatientFormChange}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} ${createPatientForm.id_number.length === 9
                                  ? createIdValidationStatus === 'valid'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                  : ''
                                  }`}
                                required
                                placeholder="123456789"
                                maxLength={9}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                {createPatientForm.id_number.length}/9
                              </div>
                            </div>

                            {createPatientForm.id_number.length > 0 && createPatientForm.id_number.length < 9 && (
                              <div className="text-xs text-orange-600">
                                Enter {9 - createPatientForm.id_number.length} more digit{9 - createPatientForm.id_number.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end gap-4 mt-8 pt-6 border-t flex-row-reverse">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreatePatientForm(false);
                            setCreatePatientForm({
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
                              user_password: "",
                              social_situation: ""
                            });
                          }}
                          disabled={isCreatingPatient}
                        >
                          {isRTL ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button
                          onClick={createNewPatient}
                          disabled={isCreatingPatient}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isCreatingPatient ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              {isRTL ? "جاري الإنشاء..." : "Creating..."}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isRTL ? "إنشاء المريض" : "Create Patient"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

              )}
            </section>
          )}

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedPatient ?
                `${isRTL ? "معلومات المريض:" : "Patient Information:"} ${selectedPatient.english_username_a} ${selectedPatient.english_username_d}` :
                t("home.patientInformation")
              }
            </h2>

            {isLoadingHealthData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">{t("home.weight")} (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="1"
                    max="220"
                    step="0.1"
                    value={patientInfo.weight}
                    onChange={handleInputChange}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">{t("home.height")} (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min="1"
                    max="200"
                    value={patientInfo.height}
                    onChange={handleInputChange}
                    placeholder="170"
                  />
                </div>
                {/* NEW: Blood Pressure - Only for nurses */}
                {userRole !== 'patient' && (
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">
                      {isRTL ? "ضغط الدم" : "Blood Pressure"} (mmHg)
                    </Label>
                    <Input
                      id="bloodPressure"
                      name="bloodPressure"
                      type="text"
                      value={patientInfo.bloodPressure}
                      onChange={handleInputChange}
                      placeholder="120/80"
                    />
                  </div>
                )}
                {/* NEW: Heart Rate - Only for nurses */}
                {userRole !== 'patient' && (

                  <div className="space-y-2">
                    <Label htmlFor="heartRate">
                      {isRTL ? "معدل ضربات القلب" : "Heart Rate"} (bpm)
                    </Label>
                    <Input
                      id="heartRate"
                      name="heartRate"
                      type="number"
                      min="30"
                      max="200"
                      value={patientInfo.heartRate}
                      onChange={handleInputChange}
                      placeholder="72"
                    />
                  </div>
                )}
                {/* Temperature - Only visible to staff, not patients */}
                {userRole !== 'patient' && (
                  <div className="space-y-2">
                    <Label htmlFor="temperature">
                      {isRTL ? "درجة حرارة الجسم" : "Body Temperature"} (°C)
                    </Label>
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      min="30"
                      max="45"
                      step="0.1"
                      value={patientInfo.temperature}
                      onChange={handleInputChange}
                      placeholder="36.5"
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("home.bloodType")}</Label>
                  <RadioGroup
                    value={patientInfo.bloodType}
                    onValueChange={(value) => setPatientInfo(prev => ({ ...prev, bloodType: value }))}
                    className={`blood-type-radio-group grid grid-cols-4 md:grid-cols-8 gap-2 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {(isRTL ?
                      ["O-", "O+", "AB-", "AB+", "B-", "B+", "A-", "A+"] :
                      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
                    ).map(type => (
                      <div key={type} className="blood-type-radio-item flex items-center justify-center">
                        <RadioGroupItem value={type} id={type} className="blood-type-radio" />
                        <Label
                          htmlFor={type}
                          className="blood-type-label font-medium cursor-pointer"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        >
                          {getBloodTypeDisplay(type)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </section>
          {/* ADD THIS COMPLETE NEW SECTION: Social Situation Section - Only show for secretary when female patient is selected */}
          {userRole === 'secretary' && selectedPatient && selectedPatient.gender_user === 'female' && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <User className="h-6 w-6" />
                {isRTL ? "الحالة الاجتماعية" : "Social Situation"}
              </h2>

              <div className="space-y-4">
                <Label className="text-lg font-medium">
                  {isRTL ? "حالة المريضة الاجتماعية:" : "Patient's Social Status:"}
                </Label>

                <RadioGroup
                  value={socialSituation}
                  onValueChange={(value) => setSocialSituation(value as '' | 'single' | 'married')}
                  className={`flex gap-6 ${isRTL ? 'justify-end' : 'justify-start'}`}
                >
                  {isRTL ? (
                    <>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <Label htmlFor="social_single" className="text-lg cursor-pointer">
                          {isRTL ? "عزباء" : "Single"}
                        </Label>
                        <RadioGroupItem value="single" id="social_single" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <Label htmlFor="social_married" className="text-lg cursor-pointer">
                          {isRTL ? "متزوجة" : "Married"}
                        </Label>
                        <RadioGroupItem value="married" id="social_married" className="w-5 h-5" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="married" id="social_married" className="w-5 h-5" />
                        <Label htmlFor="social_married" className="text-lg cursor-pointer">
                          {isRTL ? "متزوجة" : "Married"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="single" id="social_single" className="w-5 h-5" />
                        <Label htmlFor="social_single" className="text-lg cursor-pointer">
                          {isRTL ? "عزباء" : "Single"}
                        </Label>
                      </div>
                    </>
                  )}
                </RadioGroup>
                {/* Show current status if available */}
                {socialSituation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{isRTL ? "الحالة الحالية:" : "Current Status:"}</strong>
                      <span className="ml-2">
                        {socialSituation === 'married'
                          ? (isRTL ? "متزوجة" : "Married")
                          : (isRTL ? "عزباء" : "Single")
                        }
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Common Diseases - FIXED: Changed to checkboxes for multiple selection */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.commonDiseases")}</h2>
            {isLoadingHealthData ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(8)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {commonDiseases.map(disease => (
                  <div key={disease.key} className="border rounded-lg hover:bg-gray-50">
                    <label
                      htmlFor={`disease-${disease.key}`}
                      className={`flex items-center p-4 cursor-pointer gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <input
                        type="checkbox"
                        id={`disease-${disease.key}`}
                        checked={selectedDiseases.includes(disease.key)}
                        onChange={() => handleDiseaseSelect(disease.key)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-lg flex-1 ${isRTL ? 'text-right' : 'text-left'}`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {isRTL ? disease.ar : disease.en}
                      </span>
                    </label>
                    {/* Show radio buttons for cholesterol type if cholesterol is checked */}
                    {disease.key === 'has_cholesterol' && selectedDiseases.includes('has_cholesterol') && (
                      <div className="flex flex-col items-start px-4 pb-2">
                        <label className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            name="cholesterolHDL"
                            checked={selectedDiseases.includes('has_cholesterol_hdl')}
                            onChange={() => handleDiseaseSelect('has_cholesterol_hdl')}
                          />
                          {isRTL ? 'الكوليسترول HDL' : 'Cholesterol HDL'}
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="cholesterolLDL"
                            checked={selectedDiseases.includes('has_cholesterol_ldl')}
                            onChange={() => handleDiseaseSelect('has_cholesterol_ldl')}
                          />
                          {isRTL ? 'الكوليسترول LDL' : 'Cholesterol LDL'}
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Medicine Categories - visible to ALL users */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.medicinesTitle")}</h2>
            {isLoadingHealthData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicineCategories.map(({ category, medicines }) => (
                  <div key={category.en} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {isRTL ? category.ar : category.en}
                    </h3>
                    <div className="space-y-3">
                      {medicines.map(medicine => (
                        <div key={medicine.en} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                          <input
                            type="checkbox"
                            id={`med-${medicine.en}`} checked={selectedMedicines.includes(medicine.en)}
                            onChange={() => handleMedicineSelect(medicine.en)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor={`med-${medicine.en}`} className="text-base">
                            {isRTL ? medicine.ar : medicine.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Allergies Section - visible to ALL users */}
          <section className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{isRTL ? 'الحساسية الدوائية' : 'Drug Allergies'}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allergiesList.filter(allergy => allergy.en !== 'Other').map(allergy => (
                <div key={allergy.en} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                  <input
                    type="checkbox"
                    id={`allergy-${allergy.en}`} checked={selectedAllergies.includes(allergy.en)}
                    onChange={() => handleAllergySelect(allergy.en)}
                    className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor={`allergy-${allergy.en}`} className="text-base">
                    {isRTL ? allergy.ar : allergy.en}
                  </Label>
                </div>
              ))}
            </div>

            {/* Other Allergies - Custom Input */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium mb-2 block">
                {isRTL ? "حساسيات أخرى:" : "Other Allergies:"}
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={isRTL ? "اكتب نوع الحساسية..." : "Enter allergy type..."}
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customAllergy.trim()) {
                        addCustomAllergy();
                      }
                    }}
                  />
                  <Button
                    onClick={addCustomAllergy}
                    size="sm"
                    disabled={!customAllergy.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {isRTL ? "إضافة" : "Add"}
                  </Button>
                </div>

                {/* Display added custom allergies */}
                {selectedAllergies.filter(allergy => !allergiesList.some(a => a.en === allergy)).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      {isRTL ? "الحساسيات المخصصة المضافة:" : "Added Custom Allergies:"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAllergies
                        .filter(allergy => !allergiesList.some(a => a.en === allergy))
                        .map((allergy, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                            {allergy}
                            <button
                              onClick={() => setSelectedAllergies(prev => prev.filter(a => a !== allergy))}
                              className="ml-1 hover:text-green-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Display all selected allergies */}
            {selectedAllergies.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "جميع الحساسيات المحددة:" : "All Selected Allergies:"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAllergies.map((allergy, index) => {
                    const isCustom = !allergiesList.some(a => a.en === allergy);
                    return (
                      <Badge
                        key={index}
                        variant={isCustom ? "secondary" : "outline"}
                        className={`flex items-center gap-1 ${isCustom ? 'bg-green-100 text-green-800' : 'border-green-200 text-green-700'}`}
                      >
                        {isRTL && !isCustom ? (
                          allergiesList.find(a => a.en === allergy)?.ar || allergy
                        ) : allergy}
                        <button
                          onClick={() => setSelectedAllergies(prev => prev.filter(a => a !== allergy))}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Enhanced Patient Logs with User Tracking - visible to ALL users */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.patientLogs")}</h2>

            {/* User Tracking Information - Show if data exists */}
            {healthData && (healthData.created_by_email || healthData.updated_by_email) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isRTL ? "معلومات السجل الطبي" : "Medical Record Information"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Created By Info */}
                  {healthData.created_by_email && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isRTL ? "تم الإنشاء بواسطة:" : "Created by:"}
                      </h4>
                      <div className="space-y-1 text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">{healthData.created_by_name || "Unknown User"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{healthData.created_by_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3 text-blue-500" />
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {healthData.created_by_role || "Patient"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-600">
                            {new Date(healthData.created_at || '').toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Updated By Info */}
                  {healthData.updated_by_email && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <Save className="h-3 w-3" />
                        {isRTL ? "آخر تحديث بواسطة:" : "Last updated by:"}
                      </h4>
                      <div className="space-y-1 text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-green-500" />
                          <span className="font-medium">{healthData.updated_by_name || "Unknown User"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-green-500" />
                          <span className="text-xs">{healthData.updated_by_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3 text-green-500" />
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {healthData.updated_by_role || "Patient"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">
                            {new Date(healthData.updated_at || '').toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Logs */}
            <div className="bg-gray-50 rounded-lg">
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {isRTL ? "سجل الأنشطة" : "Activity Log"}
                </h4>
              </div>
              <ScrollArea className="h-48">
                <div className="p-4">
                  {patientLogs.length > 0 ? (
                    <div className="space-y-2">
                      {patientLogs.map((log, index) => (
                        <div key={index} className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            {`${t(`home.logs.${log.key}`, log.values)} ${log.timestamp.toLocaleString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t("home.noActivityLogs")}</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </section>

          {/* Health Summary Statistics - Only shown when health data exists */}
          {healthData && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                {isRTL ? "ملخص الحالة الصحية" : "Health Summary"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* Changed from 3 to 4 */}
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isRTL ? "المعلومات الأساسية" : "Basic Information"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {healthData.weight_kg && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? "الوزن:" : "Weight:"}</span>
                        <span className="font-medium">{healthData.weight_kg} kg</span>
                      </div>
                    )}
                    {healthData.height_cm && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? "الطول:" : "Height:"}</span>
                        <span className="font-medium">{healthData.height_cm} cm</span>
                      </div>
                    )}
                    {healthData.blood_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? "فصيلة الدم:" : "Blood Type:"}</span>
                        <span className="font-medium">{getBloodTypeDisplay(healthData.blood_type)}</span>
                      </div>
                    )}

                    {/* ADD THIS: Social Situation Display */}
                    {userRole === 'secretary' && selectedPatient && selectedPatient.gender_user === 'female' && healthData.social_situation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? "الحالة الاجتماعية:" : "Social Status:"}</span>
                        <span className="font-medium">
                          {healthData.social_situation === 'married'
                            ? (isRTL ? "متزوجة" : "Married")
                            : (isRTL ? "عزباء" : "Single")
                          }
                        </span>
                      </div>
                    )}

                    {healthData.weight_kg && healthData.height_cm && (
                      <div className="flex justify-between pt-2 border-t border-blue-200">
                        <span className="text-gray-600">BMI:</span>
                        <span className="font-medium">{calculatePatientStats(healthData).bmi}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditions Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {isRTL ? "الحالات المرضية" : "Medical Conditions"}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const activeConditions = commonDiseases.filter(disease =>
                        healthData[disease.key as keyof PatientHealthData] === true
                      );

                      if (activeConditions.length === 0) {
                        return (
                          <p className="text-sm text-gray-600 italic">
                            {isRTL ? "لا توجد حالات مرضية مسجلة" : "No medical conditions recorded"}
                          </p>
                        );
                      }

                      return activeConditions.map(condition => (
                        <div key={condition.key} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium">
                            {isRTL ? condition.ar : condition.en}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Medications Summary */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    {isRTL ? "الأدوية الحالية" : "Current Medications"}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      if (!healthData.medications) {
                        return (
                          <p className="text-sm text-gray-600 italic">
                            {isRTL ? "لا توجد أدوية مسجلة" : "No medications recorded"}
                          </p>
                        );
                      }

                      const allMeds = Object.values(healthData.medications).flat();

                      if (allMeds.length === 0) {
                        return (
                          <p className="text-sm text-gray-600 italic">
                            {isRTL ? "لا توجد أدوية مسجلة" : "No medications recorded"}
                          </p>
                        );
                      }

                      return allMeds.slice(0, 5).map((med, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">{med}</span>
                        </div>
                      )).concat(
                        allMeds.length > 5 ? [(
                          <div key="more" className="text-xs text-gray-600 italic mt-2">
                            {isRTL ?
                              `و ${allMeds.length - 5} دواء آخر` :
                              `+${allMeds.length - 5} more medications`
                            }                          </div>
                        )] : []
                      );
                    })()}
                  </div>
                </div>
                {/* NEW: Allergies Summary */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {isRTL ? "الحساسية" : "Allergies"}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      if (!healthData.allergies || healthData.allergies.length === 0) {
                        return (
                          <p className="text-sm text-gray-600 italic">
                            {isRTL ? "لا توجد حساسية مسجلة" : "No allergies recorded"}
                          </p>
                        );
                      }

                      return healthData.allergies.slice(0, 5).map((allergy, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">
                            {isRTL ? (
                              // Convert English allergy names to Arabic (UPDATED FOR MEDICAL ALLERGIES)
                              allergy === 'Penicillin' ? 'البنسلين' :
                                allergy === 'Naproxen' ? 'نابروكسين' :
                                  allergy === 'Ibuprofen' ? 'إيبوبروفين' :
                                    allergy === 'Aspirin' ? 'الأسبرين' :
                                      allergy === 'Anticonvulsants' ? 'مضادات الاختلاج' :
                                        allergy === 'Other' ? 'أخرى' :
                                          allergy
                            ) : allergy}
                          </span>
                        </div>
                      )).concat(
                        healthData.allergies.length > 5 ? [(
                          <div key="more" className="text-xs text-gray-600 italic mt-2">
                            {isRTL ?
                              `و ${healthData.allergies.length - 5} حساسية أخرى` :
                              `+${healthData.allergies.length - 5} more allergies`
                            }
                          </div>
                        )] : []
                      );
                    })()}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Save Button - visible to ALL users */}
          <div className="flex justify-center">
            <Button
              onClick={handleSaveInfo}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg flex items-center gap-2"
              disabled={healthSaving}
            >
              {healthSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {selectedPatient ?
                    (isRTL ? "حفظ معلومات المريض" : "Save Patient Information") :
                    t("home.saveInformation")
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Index;