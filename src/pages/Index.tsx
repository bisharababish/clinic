// pages/Index.tsx - Enhanced version with nurse patient creation functionality and sidebar
import { useState, useContext, useEffect } from "react";
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
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/components/contexts/LanguageContext";

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
}

interface PatientWithHealthInfo extends PatientSearchResult {
  health_data?: PatientHealthData;
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
}

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

  // NEW: State for patient list sidebar
  const [allPatients, setAllPatients] = useState<PatientWithHealthInfo[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showPatientSidebar, setShowPatientSidebar] = useState(false);
  const [patientListFilter, setPatientListFilter] = useState("");

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
    user_password: ""
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
  });

  // Changed from single disease to multiple diseases (checkboxes)
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [patientLogs, setPatientLogs] = useState<string[]>([]);

  // NEW: Store complete health data for user tracking display
  const [healthData, setHealthData] = useState<PatientHealthData | null>(null);

  // FIXED: Updated disease keys to match database schema
  const commonDiseases = [
    { key: "has_high_blood_pressure", en: "High blood pressure", ar: "ضغط الدم المرتفع" },
    { key: "has_diabetes", en: "Diabetes", ar: "السكري" },
    { key: "has_cholesterol_hdl", en: "Cholesterol HDL", ar: "الكوليسترول HDL" },
    { key: "has_cholesterol_ldl", en: "Cholesterol LDL", ar: "الكوليسترول LDL" },
    { key: "has_kidney_disease", en: "Kidney Disease", ar: "أمراض الكلى" },
    { key: "has_cancer", en: "Cancer", ar: "السرطان" },
    { key: "has_heart_disease", en: "Heart Disease", ar: "أمراض القلب" },
    { key: "has_asthma", en: "Asthma", ar: "الربو" },
    { key: "has_alzheimer_dementia", en: "Alzheimer/Dementia", ar: "الزهايمر/الخرف" },
  ];

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
      first: isRTL ? "الأول" : "الأول",
      second: isRTL ? "الثاني" : "الثاني",
      third: isRTL ? "الثالث" : "الثالث",
      last: isRTL ? "الأخير" : "الأخير"
    }
  };

  // NEW: Handle patient creation form changes
  const handleCreatePatientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
        description: isRTL ? "الاسم الأول والأخير باللغة الإنجليزية مطلوبان" : "First and last names in English are required",
        variant: "destructive",
      });
      return false;
    }

    // Check required Arabic name fields
    if (!form.arabic_username_a.trim() || !form.arabic_username_d.trim()) {
      toast({
        title: isRTL ? "خطأ في النموذج" : "Form Error",
        description: isRTL ? "الاسم الأول والأخير باللغة العربية مطلوبان" : "First and last names in Arabic are required",
        variant: "destructive",
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.user_email)) {
      toast({
        title: isRTL ? "بريد إلكتروني غير صحيح" : "Invalid Email",
        description: isRTL ? "يرجى إدخال عنوان بريد إلكتروني صحيح" : "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Validate ID number
    if (!form.id_number.trim() || form.id_number.length < 6) {
      toast({
        title: isRTL ? "رقم هوية غير صحيح" : "Invalid ID Number",
        description: isRTL ? "رقم الهوية يجب أن يكون 6 أرقام على الأقل" : "ID number must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    // Validate phone number
    if (!form.user_phonenumber.trim() || form.user_phonenumber.length < 8) {
      toast({
        title: isRTL ? "رقم هاتف غير صحيح" : "Invalid Phone Number",
        description: isRTL ? "رقم الهاتف يجب أن يكون 8 أرقام على الأقل" : "Phone number must be at least 8 digits long",
        variant: "destructive",
      });
      return false;
    }

    // Validate date of birth
    if (!form.date_of_birth) {
      toast({
        title: isRTL ? "تاريخ الميلاد مطلوب" : "Date of Birth Required",
        description: isRTL ? "يرجى إدخال تاريخ الميلاد" : "Please enter date of birth",
        variant: "destructive",
      });
      return false;
    }

    // Validate gender
    if (!form.gender_user) {
      toast({
        title: isRTL ? "الجنس مطلوب" : "Gender Required",
        description: isRTL ? "يرجى اختيار الجنس" : "Please select gender",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // NEW: Load all patients for sidebar (for nurses)
  const loadAllPatients = async () => {
    if (!canSearchPatients()) return;

    setIsLoadingPatients(true);

    try {
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
      const logEntry = `${isRTL ? "تم تحميل قائمة جميع المرضى" : "Loaded complete patient list"} (${patientsWithHealth.length} ${isRTL ? "مريض" : "patients"}) ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);

    } catch (error) {
      console.error('❌ Error loading all patients:', error);

      toast({
        title: isRTL ? "خطأ في تحميل المرضى" : "Error Loading Patients",
        description: isRTL ? "فشل في تحميل قائمة المرضى" : "Failed to load patient list",
        variant: "destructive",
      });

      const logEntry = `${isRTL ? "خطأ في تحميل قائمة المرضى" : "Error loading patient list"}: ${error instanceof Error ? error.message : 'Unknown error'} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);

    } finally {
      setIsLoadingPatients(false);
    }
  };

  // NEW: Create a new patient account
  const createNewPatient = async () => {
    if (!validatePatientCreationForm()) return;

    setIsCreatingPatient(true);

    try {
      console.log('🏥 Creating new patient account...');

      // First, check if email or ID already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('userinfo')
        .select('user_email, id_number')
        .or(`user_email.eq.${createPatientForm.user_email},id_number.eq.${createPatientForm.id_number}`);

      if (checkError) {
        throw new Error(`Database check failed: ${checkError.message}`);
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingEmail = existingUsers.find(u => u.user_email === createPatientForm.user_email);
        const existingId = existingUsers.find(u => u.id_number === createPatientForm.id_number);

        if (existingEmail) {
          toast({
            title: isRTL ? "البريد الإلكتروني موجود مسبقاً" : "Email Already Exists",
            description: isRTL ? "هذا البريد الإلكتروني مستخدم بالفعل" : "This email address is already in use",
            variant: "destructive",
          });
          return;
        }

        if (existingId) {
          toast({
            title: isRTL ? "رقم الهوية موجود مسبقاً" : "ID Number Already Exists",
            description: isRTL ? "رقم الهوية هذا مستخدم بالفعل" : "This ID number is already in use",
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
        id_number: createPatientForm.id_number.trim(),
        user_phonenumber: createPatientForm.user_phonenumber.trim(),
        date_of_birth: createPatientForm.date_of_birth,
        gender_user: createPatientForm.gender_user,
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
      const logEntry = `${isRTL ? "تم إنشاء مريض جديد" : "New patient created"}: ${newPatient.english_username_a} ${newPatient.english_username_d} (ID: ${newPatient.userid}) ${isRTL ? "بواسطة" : "by"} ${user?.name} (${userRole}) ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);

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
        user_password: ""
      });
      setShowCreatePatientForm(false);

      // Automatically select the new patient
      selectPatient(newPatient);

    } catch (error) {
      console.error('❌ Error creating patient:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: isRTL ? "فشل في إنشاء المريض" : "Failed to Create Patient",
        description: errorMessage,
        variant: "destructive",
      });

      // Log the error
      const logEntry = `${isRTL ? "فشل في إنشاء مريض جديد" : "Failed to create new patient"}: ${errorMessage} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);

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

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
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
      const logEntry = `${isRTL ? "تم البحث عن المرضى باستخدام" : "Searched for patients using"} "${searchTerm}" - ${isRTL ? "تم العثور على" : "Found"} ${patientsWithHealth.length} ${isRTL ? "مريض/مرضى" : "patient(s)"} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);

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
    }
  };

  // NEW: Select a patient to view details
  const selectPatient = (patient: PatientWithHealthInfo) => {
    setSelectedPatient(patient);

    // Update form with patient's basic info for editing if needed
    if (patient.health_data) {
      setPatientInfo({
        name: `${patient.english_username_a} ${patient.english_username_d}`,
        weight: patient.health_data.weight_kg?.toString() || "",
        height: patient.health_data.height_cm?.toString() || "",
        bloodType: patient.health_data.blood_type || "A+",
      });

      // Load diseases
      const diseases: string[] = [];
      if (patient.health_data.has_high_blood_pressure) diseases.push("has_high_blood_pressure");
      if (patient.health_data.has_diabetes) diseases.push("has_diabetes");
      if (patient.health_data.has_cholesterol_hdl) diseases.push("has_cholesterol_hdl");
      if (patient.health_data.has_cholesterol_ldl) diseases.push("has_cholesterol_ldl");
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

      setHealthData(patient.health_data);
    } else {
      // Reset form for patients without health data
      setPatientInfo({
        name: `${patient.english_username_a} ${patient.english_username_d}`,
        weight: "",
        height: "",
        bloodType: "A+",
      });
      setSelectedDiseases([]);
      setSelectedMedicines([]);
      setHealthData(null);
    }

    // Log the selection
    const logEntry = `${isRTL ? "تم اختيار المريض" : "Selected patient"} ${patient.english_username_a} ${patient.english_username_d} (ID: ${patient.userid}) ${new Date().toLocaleString()}`;
    setPatientLogs(prev => [...prev, logEntry]);
  };

  // Load existing patient health data when component mounts (for patients only)
  useEffect(() => {
    if (user?.id && userRole === 'patient') {
      loadPatientHealthData();
    }
  }, [user]);

  // Load all patients when component mounts (for nurses/doctors/admins)
  useEffect(() => {
    if (canSearchPatients()) {
      loadAllPatients();
    }
  }, []);

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
      const logEntry = `${isRTL ? "خطأ: لا يوجد مستخدم مسجل دخول" : "Error: No user logged in"} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);
      return;
    }

    if (userRole !== 'patient') {
      return;
    }

    try {
      const data = await getPatientHealthData(parseInt(user.id));
      setHealthData(data);

      if (data) {
        setPatientInfo({
          name: user.name || "",
          weight: data.weight_kg?.toString() || "",
          height: data.height_cm?.toString() || "",
          bloodType: data.blood_type || "A+",
        });

        // Load diseases
        const diseases: string[] = [];
        if (data.has_high_blood_pressure) diseases.push("has_high_blood_pressure");
        if (data.has_diabetes) diseases.push("has_diabetes");
        if (data.has_cholesterol_hdl) diseases.push("has_cholesterol_hdl");
        if (data.has_cholesterol_ldl) diseases.push("has_cholesterol_ldl");
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

        // Enhanced log entry with user info
        const createdBy = data.created_by_name || data.created_by_email || 'Unknown';
        const createdByRole = data.created_by_role || 'Unknown';
        const updatedBy = data.updated_by_name || data.updated_by_email || 'Unknown';
        const updatedByRole = data.updated_by_role || 'Unknown';

        const logEntry = `${isRTL ? "تم تحميل المعلومات الصحية - تم الإنشاء بواسطة" : "Health information loaded - Created by"} ${createdBy} (${createdByRole}), ${isRTL ? "آخر تحديث بواسطة" : "Last updated by"} ${updatedBy} (${updatedByRole}) ${new Date(data.updated_at || '').toLocaleString()}`;
        setPatientLogs(prev => [...prev, logEntry]);

      } else {
        setPatientInfo({
          name: user.name || "",
          weight: "",
          height: "",
          bloodType: "A+",
        });
        setSelectedDiseases([]);
        setSelectedMedicines([]);
        setHealthData(null);

        const logEntry = `${isRTL ? "مرحباً بك! يمكنك الآن إدخال معلوماتك الصحية" : "Welcome! You can now enter your health information"} ${new Date().toLocaleString()}`;
        setPatientLogs(prev => [...prev, logEntry]);
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
      const logEntry = `${isRTL ? "خطأ في تحميل المعلومات الصحية" : "Error loading health information"}: ${errorMessage} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (patientInfo.weight && (parseFloat(patientInfo.weight) <= 0 || parseFloat(patientInfo.weight) > 500)) {
      toast({
        title: isRTL ? "وزن غير صحيح" : "Invalid Weight",
        description: isRTL ? "يرجى إدخال وزن صحيح بين 1-500 كيلوغرام" : "Please enter a valid weight between 1-500 kg",
        variant: "destructive",
      });
      return false;
    }

    if (patientInfo.height && (parseInt(patientInfo.height) <= 0 || parseInt(patientInfo.height) > 300)) {
      toast({
        title: isRTL ? "طول غير صحيح" : "Invalid Height",
        description: isRTL ? "يرجى إدخال طول صحيح بين 1-300 سم" : "Please enter a valid height between 1-300 cm",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // ENHANCED: Save information to database with user tracking
  const handleSaveInfo = async () => {
    // Determine which patient ID to use
    let targetPatientId: string;

    if (userRole === 'nurse' && selectedPatient) {
      // Nurse is updating a selected patient's information
      targetPatientId = selectedPatient.userid.toString();
    } else if (userRole === 'patient' && user?.id) {
      // Patient is updating their own information
      targetPatientId = user.id;
    } else {
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
      const dataToSave = {
        patient_id: parseInt(targetPatientId),
        weight_kg: patientInfo.weight ? parseFloat(patientInfo.weight) : undefined,
        height_cm: patientInfo.height ? parseInt(patientInfo.height) : undefined,
        blood_type: patientInfo.bloodType || undefined,
        ...diseaseData,
        medications: medicationData,
      };

      // Save to database using the hook (user tracking is automatic via database trigger)
      const success = await savePatientHealthData(dataToSave);

      if (success) {
        // Reload data to get updated user tracking info
        if (userRole === 'patient') {
          await loadPatientHealthData();
        } else if (userRole === 'nurse' && selectedPatient) {
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

        const logEntry = `${isRTL ? "تم حفظ المعلومات الصحية لـ" : "Health information saved for"} ${patientName} ${isRTL ? "بواسطة" : "by"} ${currentUser} (${userRole}) ${new Date().toLocaleString()}`;
        setPatientLogs(prev => [...prev, logEntry]);
      } else {
        // Add error log
        const logEntry = `${isRTL ? "فشل في حفظ المعلومات الصحية" : "Failed to save health information"} ${new Date().toLocaleString()}`;
        setPatientLogs(prev => [...prev, logEntry]);
      }

    } catch (error) {
      console.error('Error saving patient health data:', error);

      const logEntry = `${isRTL ? "خطأ في حفظ المعلومات" : "Error saving information"} ${new Date().toLocaleString()}`;
      setPatientLogs(prev => [...prev, logEntry]);
    }
  };

  // Function to check if the current user role can see the user creation section
  const canSeeUserCreation = (): boolean => {
    return ["admin", "doctor", "nurse", "secretary"].includes(userRole);
  };

  // Function to check if the current user role can search for patients
  const canSearchPatients = (): boolean => {
    return ["nurse", "doctor", "admin"].includes(userRole);
  };

  // NEW: Function to check if the current user role can create patients
  const canCreatePatients = (): boolean => {
    return ["nurse", "admin"].includes(userRole);
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
      healthData.has_cholesterol_hdl,
      healthData.has_cholesterol_ldl,
      healthData.has_kidney_disease,
      healthData.has_cancer,
      healthData.has_heart_disease,
      healthData.has_asthma,
      healthData.has_alzheimer_dementia
    ].filter(Boolean).length;

    const medicationCount = healthData.medications
      ? Object.values(healthData.medications).flat().length
      : 0;

    let bmi = null;
    if (healthData.weight_kg && healthData.height_cm) {
      const heightInMeters = healthData.height_cm / 100;
      bmi = (healthData.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return { diseaseCount, medicationCount, bmi };
  };

  // Show loading state
  if (healthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {isRTL ? "جاري تحميل المعلومات الصحية..." : "Loading health information..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* NEW: Patient Sidebar - Only visible to nurses, doctors, and admins */}
      {canSearchPatients() && (
        <>
          {/* Sidebar Toggle Button - Fixed Position */}
          <Button
            onClick={() => setShowPatientSidebar(!showPatientSidebar)}
            className={`fixed ${isRTL ? 'right-0' : 'left-0'} z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg`}
            style={{ top: '103px' }}
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
          <div className={`${showPatientSidebar ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'} 
  fixed ${isRTL ? 'right-0' : 'left-0'} z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out`}
            style={{ top: '140px', bottom: '0' }}>
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isRTL ? "قائمة المرضى" : "All Patients"}
                </h3>
                <Badge variant="secondary">
                  {filteredPatients.length}
                </Badge>
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
            </div>

            {/* Sidebar Content */}
            <ScrollArea className="h-full pb-20">
              <div className="p-2">
                {isLoadingPatients ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
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
                              <p className="font-medium text-sm text-gray-900">
                                {patient.english_username_a} {patient.english_username_d}
                              </p>
                              {patient.arabic_username_a && (
                                <p className="text-xs text-gray-600" dir="rtl">
                                  {patient.arabic_username_a} {patient.arabic_username_d}
                                </p>
                              )}
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{patient.user_email}</span>
                              </div>

                              {patient.id_number && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <CreditCard className="h-3 w-3" />
                                  <span>{patient.id_number}</span>
                                </div>
                              )}

                              {patient.user_phonenumber && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{patient.user_phonenumber}</span>
                                </div>
                              )}
                            </div>

                            {/* Health Status Indicator */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                              {patient.health_data ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Database className="h-3 w-3 mr-1" />
                                  {isRTL ? "بيانات متوفرة" : "Has Data"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {isRTL ? "لا توجد بيانات" : "No Data"}
                                </Badge>
                              )}

                              {/* Quick Stats */}
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
              className="fixed inset-0 bg-black bg-opacity-25 z-30"
              onClick={() => setShowPatientSidebar(false)}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${canSearchPatients() && showPatientSidebar ? (isRTL ? 'mr-80' : 'ml-80') : ''} transition-all duration-300`} style={{ marginTop: '0' }}>
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
          {/* Notification Alert - visible to all */}
          <Alert variant="default" className={`bg-blue-50 border-blue-200 ${isRTL ? 'mb-12' : 'mb-8'}`}>
            <AlertDescription className={isRTL ? 'py-4 px-2' : 'py-2'}>
              <span className="font-medium">{t("home.reminder")}:</span> {t("home.reservationRequired")}
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
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={isRTL ? "ابحث بالاسم أو البريد الإلكتروني أو رقم الهوية..." : "Search by name, email, or ID number..."}
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
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    {isRTL ? "نتائج البحث" : "Search Results"} ({searchResults.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <div className="grid grid-cols-3 gap-2 text-xs">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                  </div>
                </div>
              )}
            </section>
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
                          </Label>
                          <Input
                            id="create_english_second"
                            name="english_username_b"
                            value={createPatientForm.english_username_b}
                            onChange={handleCreatePatientFormChange}
                            placeholder={placeholders.english.second}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create_english_third" className="text-sm">
                            {isRTL ? "الثالث" : "Third"}
                          </Label>
                          <Input
                            id="create_english_third"
                            name="english_username_c"
                            value={createPatientForm.english_username_c}
                            onChange={handleCreatePatientFormChange}
                            placeholder={placeholders.english.third}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create_english_last" className="text-sm">
                            {isRTL ? "الأخير" : "Last"}
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
                        <div>
                          <Label htmlFor="create_arabic_first" className="text-sm">
                            {isRTL ? "الأول" : "First"}
                          </Label>
                          <Input
                            id="create_arabic_first"
                            name="arabic_username_a"
                            value={createPatientForm.arabic_username_a}
                            onChange={handleCreatePatientFormChange}
                            required
                            dir="rtl"
                            placeholder={placeholders.arabic.first}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create_arabic_second" className="text-sm">
                            {isRTL ? "الثاني" : "Second"}
                          </Label>
                          <Input
                            id="create_arabic_second"
                            name="arabic_username_b"
                            value={createPatientForm.arabic_username_b}
                            onChange={handleCreatePatientFormChange}
                            dir="rtl"
                            placeholder={placeholders.arabic.second}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create_arabic_third" className="text-sm">
                            {isRTL ? "الثالث" : "Third"}
                          </Label>
                          <Input
                            id="create_arabic_third"
                            name="arabic_username_c"
                            value={createPatientForm.arabic_username_c}
                            onChange={handleCreatePatientFormChange}
                            dir="rtl"
                            placeholder={placeholders.arabic.third}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create_arabic_last" className="text-sm">
                            {isRTL ? "الأخير" : "Last"}
                          </Label>
                          <Input
                            id="create_arabic_last"
                            name="arabic_username_d"
                            value={createPatientForm.arabic_username_d}
                            onChange={handleCreatePatientFormChange}
                            required
                            dir="rtl"
                            placeholder={placeholders.arabic.last}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">{isRTL ? "معلومات الاتصال" : "Contact Information"}</h4>

                      <div>
                        <Label htmlFor="create_email" className="text-sm">
                          {isRTL ? "البريد الإلكتروني" : "Email"}
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
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
                        </Label>
                        <div className="relative">
                          <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                          <Input
                            id="create_phone"
                            name="user_phonenumber"
                            type="tel"
                            value={createPatientForm.user_phonenumber}
                            onChange={handleCreatePatientFormChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            required
                            placeholder={isRTL ? "٩٧٠٠٠٠٠٠٠٠٠+" : "+97000000000"} dir={isRTL ? "rtl" : "ltr"}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="create_id_number" className="text-sm">
                          {isRTL ? "رقم الهوية" : "ID Number"}
                        </Label>
                        <div className="relative">
                          <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                          <Input
                            id="create_id_number"
                            name="id_number"
                            value={createPatientForm.id_number}
                            onChange={handleCreatePatientFormChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            required
                            placeholder="123456789"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">{isRTL ? "المعلومات الشخصية" : "Personal Information"}</h4>

                      <div>
                        <Label htmlFor="create_dob" className="text-sm">
                          {isRTL ? "تاريخ الميلاد" : "Date of Birth"}
                        </Label>
                        <div className="relative">
                          <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4  text-muted-foreground`} />
                          <Input
                            id="create_dob"
                            name="date_of_birth"
                            type="date"
                            value={createPatientForm.date_of_birth}
                            onChange={handleCreatePatientFormChange}
                            className={`${isRTL ? 'pr-12' : 'pl-12'} ${isRTL ? 'text-left' : 'text-left'}`} required
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">{isRTL ? "الجنس" : "Gender"} </Label>
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

                      <div style={{ marginTop: '32px' }}>
                        <Label htmlFor="create_password" className="text-sm">
                          {isRTL ? "كلمة المرور" : "Password"}
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                          <Input
                            id="create_password"
                            name="user_password"
                            type="password"
                            value={createPatientForm.user_password}
                            onChange={handleCreatePatientFormChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            placeholder={isRTL ? "اتركها فارغة للإنشاء التلقائي" : "Leave empty for auto-generation"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
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
                          user_password: ""
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

          {/* Patient Information Section - visible to ALL users */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedPatient ?
                `${isRTL ? "معلومات المريض:" : "Patient Information:"} ${selectedPatient.english_username_a} ${selectedPatient.english_username_d}` :
                t("home.patientInformation")
              }
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">{t("home.weight")} (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  value={patientInfo.weight}
                  onChange={handleInputChange}
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t("home.height")} (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="1"
                  max="300"
                  value={patientInfo.height}
                  onChange={handleInputChange}
                  placeholder="175"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t("home.bloodType")}</Label>
                <RadioGroup
                  value={patientInfo.bloodType}
                  onValueChange={(value) => setPatientInfo(prev => ({ ...prev, bloodType: value }))}
                  className={`grid grid-cols-4 md:grid-cols-8 gap-2 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {(isRTL ?
                    ["O-", "O+", "AB-", "AB+", "B-", "B+", "A-", "A+"] :
                    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
                  ).map(type => (
                    <div key={type} className={`flex items-center ${isRTL ? 'flex-row-reverse gap-3' : 'space-x-2'}`}>
                      <RadioGroupItem value={type} id={type} />
                      <Label
                        htmlFor={type}
                        className={`${isRTL ? 'text-right' : 'text-left'} font-medium cursor-pointer`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {getBloodTypeDisplay(type)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </section>

          {/* Common Diseases - FIXED: Changed to checkboxes for multiple selection */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.commonDiseases")}</h2>
            <div className="grid grid-cols-1 gap-3">
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
                </div>
              ))}
            </div>
          </section>

          {/* Medicine Categories - visible to ALL users */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.medicinesTitle")}</h2>
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
                          id={medicine.en}
                          checked={selectedMedicines.includes(medicine.en)}
                          onChange={() => handleMedicineSelect(medicine.en)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor={medicine.en} className="text-base">
                          {isRTL ? medicine.ar : medicine.en}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            {log}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            {isRTL ? `+${allMeds.length - 5} أدوية أخرى` : `+${allMeds.length - 5} more medications`}
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
      </div>
    </div>
  );
};

export default Index;