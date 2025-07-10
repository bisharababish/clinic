// pages/api/admin/PatientHealthManagement.tsx - FULLY OPTIMIZED VERSION
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePatientHealth, PatientWithHealthData, PatientHealthData } from "@/hooks/usePatientHealth";
import { useAdminState } from "../../../hooks/useAdminState";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    RefreshCw,
    Loader2,
    FileText,
    Database,
    Mail,
    Phone,
    Calendar,
    Heart,
    Pill,
    User,
    Plus,
    Save,
    X,
    UserPlus,
    Edit,
    Trash2,
    CreditCard,
    Lock,
    EyeIcon,
    EyeOffIcon,
    Filter,
    AlertCircle
} from 'lucide-react';
import '../../styles/patienthealthtab.css';
import { Skeleton } from "@/components/ui/skeleton";

// Enhanced Patient interface with health data
interface PatientWithHealth {
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
    health_data?: PatientHealthData;
}

// Patient Creation Form Interface
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

// Enhanced PatientHealthForm Component
const PatientHealthForm: React.FC<{
    onSuccess?: () => void;
    selectedPatientId?: number;
    mode?: 'create' | 'edit';
    existingData?: PatientWithHealth;
    allPatients?: PatientWithHealth[];
    onPatientCreated?: (patient: PatientWithHealth) => void;
}> = ({
    onSuccess,
    selectedPatientId,
    mode = 'create',
    existingData,
    allPatients = [],
    onPatientCreated
}) => {
        const { t, i18n } = useTranslation();
        const isRTL = i18n.language === 'ar';
        const { toast } = useToast();
        const { user } = useAuth();
        const { getPatientHealthData, savePatientHealthData, isSaving } = usePatientHealth();
        const [customAllergy, setCustomAllergy] = useState("");

        // Form state
        const [isOpen, setIsOpen] = useState(false);
        const [selectedPatient, setSelectedPatient] = useState<PatientWithHealth | null>(null);
        const [patientSearch, setPatientSearch] = useState('');
        const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
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
        const allergiesList = [
            { en: 'Penicillin', ar: 'البنسلين' },
            { en: 'Naproxen', ar: 'نابروكسين' },
            { en: 'Ibuprofen', ar: 'إيبوبروفين' },
            { en: 'Aspirin', ar: 'الأسبرين' },
            { en: 'Anticonvulsants', ar: 'مضادات الاختلاج' },
            { en: 'Other', ar: 'أخرى' },
        ];
        const bloodTypes = [
            { value: 'A+', en: 'A+', ar: 'أ+' },
            { value: 'A-', en: 'A-', ar: 'أ-' },
            { value: 'B+', en: 'B+', ar: 'ب+' },
            { value: 'B-', en: 'B-', ar: 'ب-' },
            { value: 'AB+', en: 'AB+', ar: 'أب+' },
            { value: 'AB-', en: 'AB-', ar: 'أب-' },
            { value: 'O+', en: 'O+', ar: 'و+' },
            { value: 'O-', en: 'O-', ar: 'و-' }
        ];
        // Patient creation state
        const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
        const [isCreatingPatient, setIsCreatingPatient] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
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

        // Health form data
        const [formData, setFormData] = useState<Omit<PatientHealthData, 'id' | 'created_at' | 'updated_at'>>({
            patient_id: 0,
            weight_kg: undefined,
            height_cm: undefined,
            blood_type: '',
            blood_pressure: undefined,
            heart_rate: undefined,
            temperature: undefined,
            has_high_blood_pressure: false,
            has_diabetes: false,
            has_cholesterol_hdl: false,
            has_cholesterol_ldl: false,
            has_kidney_disease: false,
            has_cancer: false,
            has_heart_disease: false,
            has_asthma: false,
            has_alzheimer_dementia: false,
            medications: {
                pain_relief: [],
                allergy: [],
                flu: [],
                antibiotics: []
            },
            allergies: [],
            social_situation: undefined
        });

        // Medication input states
        const [newMedications, setNewMedications] = useState({
            pain_relief: '',
            allergy: '',
            flu: '',
            antibiotics: ''
        });

        // Common diseases and medicines data
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

        // Validation functions
        const validateEnglishName = (name: string): boolean => {
            const englishNameRegex = /^[A-Za-z\s'-]+$/;
            return englishNameRegex.test(name.trim());
        };

        const validateArabicName = (name: string): boolean => {
            const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
            return arabicNameRegex.test(name.trim());
        };

        const validatePalestinianID = (id: string): boolean => {
            const idRegex = /^\d{9}$/;
            return idRegex.test(id.trim());
        };

        const validatePalestinianPhone = (phone: string): boolean => {
            const phoneRegex = /^\+97[02]\d{8}$/;
            return phoneRegex.test(phone.trim());
        };

        // Load specific patient if provided
        useEffect(() => {
            if (selectedPatientId && isOpen && allPatients.length > 0) {
                const patient = allPatients.find(p => p.userid === selectedPatientId);
                if (patient) {
                    handlePatientSelect(patient);
                }
            }
        }, [selectedPatientId, isOpen, allPatients]);

        // Load existing data in edit mode
        useEffect(() => {
            if (mode === 'edit' && existingData && isOpen) {
                setFormData({
                    patient_id: existingData.userid,
                    weight_kg: existingData.health_data?.weight_kg,
                    height_cm: existingData.health_data?.height_cm,
                    blood_type: existingData.health_data?.blood_type || '',
                    blood_pressure: existingData.health_data?.blood_pressure,
                    heart_rate: existingData.health_data?.heart_rate,
                    temperature: existingData.health_data?.temperature,
                    has_high_blood_pressure: existingData.health_data?.has_high_blood_pressure || false,
                    has_diabetes: existingData.health_data?.has_diabetes || false,
                    has_cholesterol_hdl: existingData.health_data?.has_cholesterol_hdl || false,
                    has_cholesterol_ldl: existingData.health_data?.has_cholesterol_ldl || false,
                    has_kidney_disease: existingData.health_data?.has_kidney_disease || false,
                    has_cancer: existingData.health_data?.has_cancer || false,
                    has_heart_disease: existingData.health_data?.has_heart_disease || false,
                    has_asthma: existingData.health_data?.has_asthma || false,
                    has_alzheimer_dementia: existingData.health_data?.has_alzheimer_dementia || false,
                    medications: existingData.health_data?.medications || {
                        pain_relief: [],
                        allergy: [],
                        flu: [],
                        antibiotics: []
                    },
                    allergies: existingData.health_data?.allergies || [],
                    social_situation: existingData.health_data?.social_situation || undefined
                });
                setSelectedPatient(existingData);
            }
        }, [mode, existingData, isOpen]);

        // Phone input handler
        const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;
            if (!value.startsWith('+97')) {
                value = '+97';
            }
            const afterPrefix = value.slice(3);
            const digits = afterPrefix.replace(/\D/g, '');
            if (digits.length === 0) {
                setCreatePatientForm(prev => ({ ...prev, user_phonenumber: '+97' }));
                return;
            }
            const firstDigit = digits[0];
            if (firstDigit !== '0' && firstDigit !== '2') {
                return;
            }
            const limitedDigits = digits.slice(0, 9);
            const formattedPhone = '+97' + limitedDigits;
            setCreatePatientForm(prev => ({ ...prev, user_phonenumber: formattedPhone }));
        };

        // Generate a secure default password
        const generateDefaultPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };

        // Handle patient creation form changes
        const handleCreatePatientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name } = e.target;
            let value = e.target.value;
            let processedValue = value;

            if (name.startsWith('english_username_')) {
                processedValue = value.replace(/[^A-Za-z\s'-]/g, '');
            } else if (name.startsWith('arabic_username_')) {
                processedValue = value.replace(/[^\u0600-\u06FF\s]/g, '');
            } else if (name === 'user_phonenumber') {
                // Always start with +97
                if (!value.startsWith('+97')) {
                    value = '+97';
                }

                // Extract digits after +97
                const afterPrefix = value.slice(3);
                const digits = afterPrefix.replace(/\D/g, '');

                if (digits.length === 0) {
                    setCreatePatientForm(prev => ({ ...prev, user_phonenumber: '+97' }));
                    return;
                }

                // First digit after +97 must be 0 or 2
                const firstDigit = digits[0];
                if (firstDigit !== '0' && firstDigit !== '2') {
                    return; // Don't allow the input
                }

                // Limit to 9 digits total after +970 or +972
                const limitedDigits = digits.slice(0, 10);
                const formattedPhone = '+97' + limitedDigits;
                setCreatePatientForm(prev => ({ ...prev, user_phonenumber: formattedPhone }));
                return;
            } else if (name === 'id_number') {
                processedValue = value.replace(/\D/g, '').slice(0, 9);
            }

            setCreatePatientForm(prev => ({ ...prev, [name]: processedValue }));
        };

        // Validate patient creation form
        const validatePatientCreationForm = (): boolean => {
            const form = createPatientForm;
            const currentLang = i18n.language;

            // Validation logic (keeping your existing validation)
            if (!form.english_username_a.trim() || !validateEnglishName(form.english_username_a)) {
                toast({
                    title: currentLang === 'ar' ? "خطأ في الاسم الإنجليزي" : "Invalid English Name",
                    description: currentLang === 'ar' ? "الاسم الأول باللغة الإنجليزية يجب أن يحتوي على أحرف إنجليزية فقط" : "First name must contain only English letters",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.english_username_d.trim() || !validateEnglishName(form.english_username_d)) {
                toast({
                    title: isRTL ? "خطأ في الاسم الإنجليزي" : "Invalid English Name",
                    description: isRTL ? "الاسم يجب أن يحتوي على أحرف إنجليزية فقط (مسموح بالمسافات والفواصل العليا والشرطات)" : "Name must contain only English letters (spaces, apostrophes, and hyphens allowed)",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.arabic_username_a.trim() || !validateArabicName(form.arabic_username_a)) {
                toast({
                    title: isRTL ? "خطأ في الاسم العربي" : "Invalid Arabic Name",
                    description: isRTL ? "الاسم يجب أن يحتوي على أحرف عربية فقط (مسموح بالمسافات والفواصل العليا والشرطات)" : "Name must contain only Arabic letters (spaces, apostrophes, and hyphens allowed)",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.arabic_username_d.trim() || !validateArabicName(form.arabic_username_d)) {
                toast({
                    title: currentLang === 'ar' ? "خطأ في الاسم العربي" : "Invalid Arabic Name",
                    description: currentLang === 'ar' ? "اسم العائلة باللغة العربية يجب أن يحتوي على أحرف عربية فقط" : "Last name must contain only Arabic letters",
                    variant: "destructive",
                });
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.user_email)) {
                toast({
                    title: currentLang === 'ar' ? "بريد إلكتروني غير صحيح" : "Invalid Email",
                    description: currentLang === 'ar' ? "يرجى إدخال عنوان بريد إلكتروني صحيح" : "Please enter a valid email address",
                    variant: "destructive",
                });
                return false;
            }

            if (!validatePalestinianID(form.id_number)) {
                toast({
                    title: isRTL ? "رقم هوية غير صحيح" : "Invalid ID Number",
                    description: isRTL ? "رقم الهوية يجب أن يكون 9 أرقام بالضبط" : "ID number must be exactly 9 digits",
                    variant: "destructive",
                });
                return false;
            }

            if (!validatePalestinianPhone(form.user_phonenumber)) {
                toast({
                    title: isRTL ? "رقم هاتف غير صحيح" : "Invalid Phone Number",
                    description: isRTL ? "رقم الهاتف يجب أن يبدأ بـ +970 أو +972 متبوعاً بـ 9 أرقام" : "Phone number must start with +970 or +972 followed by 9 digits",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.date_of_birth) {
                toast({
                    title: currentLang === 'ar' ? "تاريخ الميلاد مطلوب" : "Date of Birth Required",
                    description: currentLang === 'ar' ? "يرجى إدخال تاريخ الميلاد" : "Please enter date of birth",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.gender_user) {
                toast({
                    title: currentLang === 'ar' ? "الجنس مطلوب" : "Gender Required",
                    description: currentLang === 'ar' ? "يرجى اختيار الجنس" : "Please select gender",
                    variant: "destructive",
                });
                return false;
            }

            return true;
        };

        // Create a new patient account
        const createNewPatient = async () => {
            if (!validatePatientCreationForm()) return;

            setIsCreatingPatient(true);

            try {
                // Check if email or ID already exists
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
                            title: "Email Already Exists",
                            description: "This email address is already in use",
                            variant: "destructive",
                        });
                        return;
                    }

                    if (existingId) {
                        toast({
                            title: "ID Number Already Exists",
                            description: "This ID number is already in use",
                            variant: "destructive",
                        });
                        return;
                    }
                }

                const password = createPatientForm.user_password || generateDefaultPassword();

                // Create auth user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: createPatientForm.user_email,
                    password: password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                });

                if (authError) {
                    throw new Error(`Failed to create auth account: ${authError.message}`);
                }

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
                    user_password: password,
                    created_at: currentTimestamp,
                    updated_at: currentTimestamp,
                };

                // Insert into userinfo table
                const { data: insertData, error: insertError } = await supabase
                    .from('userinfo')
                    .insert(dbRecord)
                    .select();

                if (insertError) {
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

                const newPatient = insertData[0] as PatientWithHealth;

                toast({
                    title: "Patient Created Successfully",
                    description: `Successfully created account for ${newPatient.english_username_a} ${newPatient.english_username_d}`,
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

                // Notify parent component
                onPatientCreated?.(newPatient);

                // Automatically select the new patient
                handlePatientSelect(newPatient);

            } catch (error) {
                console.error('❌ Error creating patient:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                toast({
                    title: "Failed to Create Patient",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setIsCreatingPatient(false);
            }
        };

        const handlePatientSelect = async (patient: PatientWithHealth) => {
            setSelectedPatient(patient);
            setFormData(prev => ({
                ...prev,
                patient_id: patient.userid
            }));

            // Load existing health data if available
            try {
                const existingData = await getPatientHealthData(patient.userid);
                if (existingData) {
                    setFormData({
                        patient_id: patient.userid,
                        weight_kg: existingData.weight_kg,
                        height_cm: existingData.height_cm,
                        blood_type: existingData.blood_type || '',
                        blood_pressure: existingData.blood_pressure,
                        heart_rate: existingData.heart_rate,
                        temperature: existingData.temperature,
                        has_high_blood_pressure: existingData.has_high_blood_pressure,
                        has_diabetes: existingData.has_diabetes,
                        has_cholesterol_hdl: existingData.has_cholesterol_hdl,
                        has_cholesterol_ldl: existingData.has_cholesterol_ldl,
                        has_kidney_disease: existingData.has_kidney_disease,
                        has_cancer: existingData.has_cancer,
                        has_heart_disease: existingData.has_heart_disease,
                        has_asthma: existingData.has_asthma,
                        has_alzheimer_dementia: existingData.has_alzheimer_dementia,
                        medications: existingData.medications || {
                            pain_relief: [],
                            allergy: [],
                            flu: [],
                            antibiotics: []
                        },
                        allergies: existingData.allergies || [],
                        social_situation: existingData.social_situation || undefined
                    });
                    setSelectedAllergies(existingData.allergies || []);
                }
            } catch (error) {
                console.error('Error loading existing health data:', error);
            }
        };

        const filteredPatients = allPatients.filter(patient =>
            patient.english_username_a?.toLowerCase().includes(patientSearch.toLowerCase()) ||
            patient.user_email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
            patient.userid.toString().includes(patientSearch)
        );

        const handleConditionChange = (condition: string, checked: boolean) => {
            setFormData(prev => ({
                ...prev,
                [condition]: checked
            }));
        };

        const addMedication = (category: keyof typeof newMedications) => {
            const medicationText = newMedications[category].trim();
            if (medicationText) {
                setFormData(prev => ({
                    ...prev,
                    medications: {
                        ...prev.medications,
                        [category]: [...prev.medications[category], medicationText]
                    }
                }));
                setNewMedications(prev => ({
                    ...prev,
                    [category]: ''
                }));
            }
        };

        const removeMedication = (category: keyof typeof formData.medications, index: number) => {
            setFormData(prev => ({
                ...prev,
                medications: {
                    ...prev.medications,
                    [category]: prev.medications[category].filter((_, i) => i !== index)
                }
            }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!selectedPatient || formData.patient_id === 0) {
                toast({
                    title: "Error",
                    description: "Please select a patient",
                    variant: "destructive",
                });
                return;
            }

            const dataToSave = {
                ...formData,
                allergies: selectedAllergies,
            };
            const success = await savePatientHealthData(dataToSave);
            if (success) {
                setIsOpen(false);
                resetForm();
                onSuccess?.();
            }
        };

        const resetForm = () => {
            setSelectedPatient(null);
            setPatientSearch('');
            setSelectedAllergies([]);
            setFormData({
                patient_id: 0,
                weight_kg: undefined,
                height_cm: undefined,
                blood_type: '',
                blood_pressure: undefined,
                heart_rate: undefined,
                temperature: undefined,
                has_high_blood_pressure: false,
                has_diabetes: false,
                has_cholesterol_hdl: false,
                has_cholesterol_ldl: false,
                has_kidney_disease: false,
                has_cancer: false,
                has_heart_disease: false,
                has_asthma: false,
                has_alzheimer_dementia: false,
                medications: {
                    pain_relief: [],
                    allergy: [],
                    flu: [],
                    antibiotics: []
                },
                allergies: [],
                social_situation: undefined
            });
            setNewMedications({
                pain_relief: '',
                allergy: '',
                flu: '',
                antibiotics: ''
            });
        };

        return (
            <>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {mode === 'edit' ? (
                                <>
                                    <Edit className="h-4 w-4" />
                                    {t('patientHealth.editHealthRecord')}
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    {t('patientHealth.addPatientHealthRecord')}
                                </>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={`max-w-6xl max-h-[90vh] overflow-y-auto patient-health-dialog ${isRTL ? 'text-left [&>button]:left-4 [&>button]:right-auto' : ''}`}>
                        <DialogHeader className="patient-health-card">
                            <DialogTitle className={`${isRTL ? 'text-left pr-8' : 'text-left'}`}>
                                {mode === 'edit' ? t('patientHealth.patientHealthInformation') : t('patientHealth.patientHealthInformation')}
                            </DialogTitle>
                            <DialogDescription className={`${isRTL ? 'text-left' : 'text-left'}`}>
                                {mode === 'edit' ? t('patientHealth.updatePatientHealthInformation') : t('patientHealth.addUpdatePatientHealthInformation')}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 patient-health-form">
                            {/* Patient Selection - Only show in create mode */}
                            {mode !== 'edit' && !selectedPatient && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className={`flex items-center justify-between ${isRTL ? 'text-left' : ''}`}>
                                            {isRTL ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-left">
                                                        <User className="h-4 w-4" />
                                                        {t('patientHealth.selectPatient')}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShowCreatePatientForm(true)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                        {t('patientHealth.createNewPatient')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {t('patientHealth.selectPatient')}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShowCreatePatientForm(true)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                        {t('patientHealth.createNewPatient')}
                                                    </Button>
                                                </>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className={`space-y-4 ${isRTL ? 'text-left' : ''}`}>
                                        <div className="relative">
                                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                                            <Input
                                                placeholder={t('patientHealth.searchPlaceholderr')}
                                                value={patientSearch}
                                                onChange={(e) => setPatientSearch(e.target.value)}
                                                className={`${isRTL ? 'pr-10 text-left' : 'pl-10'}`}
                                            />
                                        </div>

                                        <ScrollArea className="max-h-48">
                                            <div className="space-y-2">
                                                {filteredPatients.length === 0 ? (
                                                    <div className={`text-center py-4 text-gray-500 ${isRTL ? 'text-left' : ''}`}>
                                                        {t('patientHealth.noRecordsFound')}
                                                    </div>
                                                ) : (
                                                    filteredPatients.map((patient) => (
                                                        <div
                                                            key={patient.userid}
                                                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors patient-selection-item ${isRTL ? 'text-left' : ''}`}
                                                            onClick={() => handlePatientSelect(patient)}
                                                        >
                                                            <div className="font-medium">
                                                                {patient.english_username_a} {patient.english_username_d}
                                                            </div>
                                                            <div className="text-sm text-gray-500 space-y-1">
                                                                <div>{patient.user_email}</div>
                                                                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                    <span>{t('patientHealth.idNumber')}: {patient.userid}</span>
                                                                    {patient.health_data && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            <Database className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                                            {t('patientHealth.withHealthData')}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Selected Patient Info & Health Form */}
                            {selectedPatient && (
                                <>
                                    {/* Patient Info Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                                <User className="h-4 w-4 " />
                                                {t('patientHealth.patientInformation')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right patient-info-display" dir="rtl">
                                                <div>
                                                    <div className="font-medium text-left">
                                                        {selectedPatient.english_username_a} {selectedPatient.english_username_d}
                                                    </div>
                                                    <div className="text-sm text-gray-500 text-left">{selectedPatient.user_email}</div>
                                                    {selectedPatient.arabic_username_a && (
                                                        <div className="text-sm text-gray-600 text-left">
                                                            {selectedPatient.arabic_username_a} {selectedPatient.arabic_username_d}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-left">
                                                        <span className="font-medium">{t('patientHealth.idNumber')}:</span> {selectedPatient.userid}
                                                    </div>
                                                    <div className="text-sm text-left">
                                                        <span className="font-medium">{t('patientHealth.phoneNumber')}:</span> {selectedPatient.user_phonenumber || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-left">
                                                        <span className="font-medium">{t('patientHealth.idNumber')}:</span> {selectedPatient.id_number || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Physical Measurements */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className={isRTL ? 'text-left' : ''}>
                                                {t('patientHealth.physicalMeasurements')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isRTL ? 'text-left' : ''}`}>
                                            <div>
                                                <Label htmlFor="weight">{t('patientHealth.weight')} (kg)</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.weight_kg || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        weight_kg: e.target.value ? parseFloat(e.target.value) : undefined
                                                    }))}
                                                    placeholder="70"
                                                    className="text-left"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="height">{t('patientHealth.height')} (cm)</Label>
                                                <Input
                                                    id="height"
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.height_cm || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        height_cm: e.target.value ? parseFloat(e.target.value) : undefined
                                                    }))}
                                                    placeholder="175"
                                                    className="text-left"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="blood_type">{t('patientHealth.bloodType')}</Label>
                                                <Select
                                                    value={formData.blood_type}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, blood_type: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isRTL ? "اختر فصيلة الدم" : "Select blood type"} />
                                                    </SelectTrigger>
                                                    <SelectContent className={isRTL ? 'text-right [&>div]:text-right' : ''}>
                                                        {bloodTypes.map((bloodType) => (
                                                            <SelectItem
                                                                key={bloodType.value}
                                                                value={bloodType.value}
                                                                className={isRTL ? 'text-right justify-end' : ''}
                                                            >
                                                                {isRTL ? bloodType.ar : bloodType.en}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="blood_pressure">
                                                    {isRTL ? 'ضغط الدم' : 'Blood Pressure'} (mmHg)
                                                </Label>
                                                <Input
                                                    id="blood_pressure"
                                                    type="text"
                                                    value={formData.blood_pressure || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        blood_pressure: e.target.value || undefined
                                                    }))}
                                                    placeholder="120/80"
                                                    className="text-left"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="heart_rate">
                                                    {isRTL ? 'معدل ضربات القلب' : 'Heart Rate'} (bpm)
                                                </Label>
                                                <Input
                                                    id="heart_rate"
                                                    type="number"
                                                    min="30"
                                                    max="200"
                                                    value={formData.heart_rate || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heart_rate: e.target.value ? parseInt(e.target.value) : undefined
                                                    }))}
                                                    placeholder="72"
                                                    className="text-left"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="temperature">
                                                    {isRTL ? 'درجة الحرارة' : 'Temperature'} (°C)
                                                </Label>
                                                <Input
                                                    id="temperature"
                                                    type="number"
                                                    min="30"
                                                    max="45"
                                                    step="0.1"
                                                    value={formData.temperature || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        temperature: e.target.value ? parseFloat(e.target.value) : undefined
                                                    }))}
                                                    placeholder="36.5"
                                                    className="text-left"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Health Conditions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right justify-end' : ''}`}>
                                                <Heart className="h-4 w-4" />
                                                {t('patientHealth.healthConditions')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {commonDiseases.map(condition => {
                                                    const isChecked = formData[condition.key as keyof PatientHealthData] as boolean;
                                                    return (
                                                        <div key={condition.key} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between p-3 border rounded-lg transition-colors ${isChecked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                                            <Label htmlFor={condition.key} className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'} flex-1 cursor-pointer`}>
                                                                {i18n.language === 'ar' ? condition.ar : condition.en}
                                                            </Label>
                                                            <Checkbox
                                                                id={condition.key}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => handleConditionChange(condition.key, checked as boolean)}
                                                                className={isRTL ? 'ml-3' : 'mr-3'}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Medications */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-left justify-end' : ''}`}>
                                                <Pill className="h-4 w-4" />
                                                {t('patientHealth.medications')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className={`space-y-6 ${isRTL ? 'text-left' : ''} medications-section`}>
                                            {Object.entries(formData.medications).map(([category, meds]) => (
                                                <div key={category} className="space-y-2">
                                                    <Label className="capitalize font-medium">
                                                        {t(`home.medicineCategories.${category}`)}
                                                    </Label>
                                                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <Input
                                                            placeholder={t('patientHealth.addMedication')}
                                                            value={newMedications[category as keyof typeof newMedications]}
                                                            onChange={(e) => setNewMedications(prev => ({
                                                                ...prev,
                                                                [category]: e.target.value
                                                            }))}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addMedication(category as keyof typeof newMedications);
                                                                }
                                                            }}
                                                            className={isRTL ? 'text-left' : ''}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addMedication(category as keyof typeof newMedications)}
                                                            className={isRTL ? 'flex-row-reverse' : ''}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        {meds.map((med, index) => (
                                                            <Badge key={index} variant="secondary" className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                {med}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMedication(category as keyof typeof formData.medications, index)}
                                                                    className={`${isRTL ? 'mr-1' : 'ml-1'} hover:text-red-600`}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Allergies Section */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right justify-end' : ''}`}>
                                                <AlertCircle className="h-4 w-4" />
                                                {isRTL ? 'الحساسية' : 'Allergies'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {allergiesList.filter(allergy => allergy.en !== 'Other').map(allergy => (
                                                    <div key={allergy.en} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between p-3 border rounded-lg transition-colors ${selectedAllergies.includes(allergy.en) ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                                        <Label htmlFor={`allergy-${allergy.en}`} className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'} flex-1 cursor-pointer`}>
                                                            {i18n.language === 'ar' ? allergy.ar : allergy.en}
                                                        </Label>
                                                        <Checkbox
                                                            id={`allergy-${allergy.en}`}
                                                            checked={selectedAllergies.includes(allergy.en)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedAllergies(prev => [...prev, allergy.en]);
                                                                } else {
                                                                    setSelectedAllergies(prev => prev.filter(a => a !== allergy.en));
                                                                }
                                                            }}
                                                            className={isRTL ? 'ml-3' : 'mr-3'}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Other allergies text input */}
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                                <Label htmlFor="other-allergies" className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {isRTL ? "حساسيات أخرى:" : "Other Allergies:"}
                                                </Label>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="other-allergies"
                                                            type="text"
                                                            placeholder={isRTL ? "اكتب نوع الحساسية..." : "Enter allergy type..."}
                                                            value={customAllergy}
                                                            onChange={(e) => setCustomAllergy(e.target.value)}
                                                            className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && customAllergy.trim()) {
                                                                    addCustomAllergy();
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
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
                                                                                type="button"
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
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Form Actions */}
                            {selectedPatient && (
                                <div className={`flex gap-2 patient-health-actions pt-4 border-t ${isRTL ? 'float-right' : 'float-left'}`}>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {t('patientHealth.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {mode === 'edit' ? t('patientHealth.updateHealthInformation') : t('patientHealth.saveHealthInformation')}
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        {t('patientHealth.cancel')}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Create Patient Dialog */}
                <Dialog open={showCreatePatientForm} onOpenChange={setShowCreatePatientForm}>
                    <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto patient-health-dialog ${isRTL ? 'text-left [&>button]:left-4 [&>button]:right-auto' : ''}`}>
                        <DialogHeader className={isRTL ? 'text-right' : ''}>
                            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'justify-start' : ''}`} style={isRTL ? { float: 'right' } : {}}>
                                <UserPlus className="h-5 w-5" />
                                {t('patientHealth.createNewPatient')}
                            </DialogTitle>
                            <DialogDescription className={isRTL ? 'text-left' : ''}>
                                {t('patientHealth.createNewPatient')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 create-patient-form">
                            {/* English Name Fields */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">{t('patientHealth.englishName')}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="create_english_first">{t('patientHealth.first')}</Label>
                                        <Input
                                            id="create_english_first"
                                            name="english_username_a"
                                            value={createPatientForm.english_username_a}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            placeholder={isRTL ? "الأول (إنجليزي فقط)" : "First (English only)"}
                                            pattern="^[A-Za-z\s'-]+$"
                                            title={isRTL ? "أحرف إنجليزية فقط مسموحة" : "Only English letters allowed"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_second">{t('patientHealth.second')}</Label>
                                        <Input
                                            id="create_english_second"
                                            name="english_username_b"
                                            value={createPatientForm.english_username_b}
                                            onChange={handleCreatePatientFormChange}
                                            placeholder={isRTL ? "الثاني (إنجليزي فقط)" : "Second (English only)"}
                                            pattern="^[A-Za-z\s'-]+$"
                                            title={isRTL ? "أحرف إنجليزية فقط مسموحة" : "Only English letters allowed"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_third">{t('patientHealth.third')}</Label>
                                        <Input
                                            id="create_english_third"
                                            name="english_username_c"
                                            value={createPatientForm.english_username_c}
                                            onChange={handleCreatePatientFormChange}
                                            placeholder={isRTL ? "الثالث (إنجليزي فقط)" : "Third (English only)"}
                                            pattern="^[A-Za-z\s'-]+$"
                                            title={isRTL ? "أحرف إنجليزية فقط مسموحة" : "Only English letters allowed"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_last">{t('patientHealth.last')}</Label>
                                        <Input
                                            id="create_english_last"
                                            name="english_username_d"
                                            value={createPatientForm.english_username_d}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            placeholder={isRTL ? "الأخير (إنجليزي فقط)" : "Last (English only)"}
                                            pattern="^[A-Za-z\s'-]+$"
                                            title={isRTL ? "أحرف إنجليزية فقط مسموحة" : "Only English letters allowed"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Arabic Name Fields */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">{t('patientHealth.arabicName')}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="create_arabic_first">{t('patientHealth.first')}</Label>
                                        <Input
                                            id="create_arabic_first"
                                            name="arabic_username_a"
                                            value={createPatientForm.arabic_username_a}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            className={isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
                                            placeholder={isRTL ? "الأول (عربي فقط)" : "First (Arabic only)"}
                                            pattern="^[\u0600-\u06FF\s'-]+$"
                                            title={isRTL ? "أحرف عربية فقط مسموحة" : "Only Arabic letters allowed"}
                                            dir={isRTL ? "rtl" : "ltr"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_second">{t('patientHealth.second')}</Label>
                                        <Input
                                            id="create_arabic_second"
                                            name="arabic_username_b"
                                            value={createPatientForm.arabic_username_b}
                                            onChange={handleCreatePatientFormChange}
                                            className={isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
                                            placeholder={isRTL ? "الثاني (عربي فقط)" : "Second (Arabic only)"}
                                            pattern="^[\u0600-\u06FF\s'-]+$"
                                            title={isRTL ? "أحرف عربية فقط مسموحة" : "Only Arabic letters allowed"}
                                            dir={isRTL ? "rtl" : "ltr"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_third">{t('patientHealth.third')}</Label>
                                        <Input
                                            id="create_arabic_third"
                                            name="arabic_username_c"
                                            value={createPatientForm.arabic_username_c}
                                            onChange={handleCreatePatientFormChange}
                                            className={isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
                                            placeholder={isRTL ? "الثالث (عربي فقط)" : "Third (Arabic only)"}
                                            pattern="^[\u0600-\u06FF\s'-]+$"
                                            title={isRTL ? "أحرف عربية فقط مسموحة" : "Only Arabic letters allowed"}
                                            dir={isRTL ? "rtl" : "ltr"}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_last">{t('patientHealth.last')}</Label>
                                        <Input
                                            id="create_arabic_last"
                                            name="arabic_username_d"
                                            value={createPatientForm.arabic_username_d}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            className={isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
                                            placeholder={isRTL ? "الأخير (عربي فقط)" : "Last (Arabic only)"}
                                            pattern="^[\u0600-\u06FF\s'-]+$"
                                            title={isRTL ? "أحرف عربية فقط مسموحة" : "Only Arabic letters allowed"}
                                            dir={isRTL ? "rtl" : "ltr"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">{t('patientHealth.contactInformation')}</h4>

                                <div>
                                    <Label htmlFor="create_email">{t('patientHealth.email')}</Label>
                                    <div className="relative">
                                        <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            id="create_email"
                                            name="user_email"
                                            type="email"
                                            value={createPatientForm.user_email}
                                            onChange={handleCreatePatientFormChange}
                                            className={`${isRTL ? 'pr-10 text-left' : 'pl-10'}`}
                                            required
                                            placeholder={t('doctorManagement.emailPlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="create_phone">{t('patientHealth.phoneNumber')}</Label>
                                    <div className="relative">
                                        <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            id="create_phone"
                                            name="user_phonenumber"
                                            type="tel"
                                            value={createPatientForm.user_phonenumber}
                                            onChange={handleCreatePatientFormChange}
                                            className={`${isRTL ? 'pr-10 text-left' : 'pl-10'}`}
                                            required
                                            placeholder={isRTL ? "٩٧٠/٩٧٢ + أرقام" : "+970/+972 + digits"} dir={isRTL ? "rtl" : "ltr"}
                                            pattern="^\+97[02]\d{9}$"
                                            title={isRTL ? "يجب أن يبدأ برقم +970 أو +972 متبوعاً بـ 9 أرقام" : "Must start with +970 or +972 followed by 9 digits"}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="create_id_number">{t('patientHealth.idNumber')}</Label>
                                    <div className="relative">
                                        <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            id="create_id_number"
                                            name="id_number"
                                            value={createPatientForm.id_number}
                                            onChange={handleCreatePatientFormChange}
                                            className={`${isRTL ? 'pr-10 text-left' : 'pl-10'}`}
                                            required
                                            placeholder={t('auth.yourIDNumber')}
                                            pattern="^\d{9}$"
                                            maxLength={9}
                                            title={isRTL ? "يجب أن يكون 9 أرقام بالضبط" : "Must be exactly 9 digits"}
                                            dir="ltr"

                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">{t('patientHealth.personalInformation')}</h4>

                                <div>
                                    <Label htmlFor="create_dob">{t('patientHealth.dateOfBirth')}</Label>
                                    <div className="relative">
                                        <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            id="create_dob"
                                            name="date_of_birth"
                                            type="date"
                                            value={createPatientForm.date_of_birth}
                                            onChange={handleCreatePatientFormChange}
                                            className={`${isRTL ? 'pr-12 text-left' : 'pl-12'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm">{t('patientHealth.gender')}</Label>
                                    <RadioGroup
                                        value={createPatientForm.gender_user}
                                        onValueChange={(value) => setCreatePatientForm(prev => ({ ...prev, gender_user: value }))}
                                        className={`flex gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : ''} gender-radio-group`}
                                    >
                                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'space-x-2'}`}>
                                            <RadioGroupItem value="male" id="create_male" />
                                            <Label htmlFor="create_male">{t('patientHealth.male')}</Label>
                                        </div>
                                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'space-x-2'}`}>
                                            <RadioGroupItem value="female" id="create_female" />
                                            <Label htmlFor="create_female">{t('patientHealth.female')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label htmlFor="create_password">{t('patientHealth.password')}</Label>
                                    <div className="relative">
                                        <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            id="create_password"
                                            name="user_password"
                                            type={showPassword ? "text" : "password"}
                                            value={createPatientForm.user_password}
                                            onChange={handleCreatePatientFormChange}
                                            className={`${isRTL ? 'pr-10 pl-10 text-left' : 'pl-10 pr-10'}`}
                                            placeholder={t('patientHealth.leaveEmptyForAutoGeneration')}
                                        />
                                        <button
                                            type="button"
                                            className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 h-4 w-4 text-muted-foreground`}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className={`flex gap-4 mt-8 pt-6 border-t ${isRTL ? 'justify-start' : 'justify-start'}`}>
                            <Button
                                onClick={createNewPatient}
                                disabled={isCreatingPatient}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isCreatingPatient ? (
                                    <>
                                        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('patientHealth.creating')}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('patientHealth.createPatient')}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowCreatePatientForm(false)}
                                disabled={isCreatingPatient}
                            >
                                {t('patientHealth.cancel')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>



        );
    };

// 🚀 FULLY OPTIMIZED PatientHealthManagement Component
const PatientHealthManagement: React.FC = () => {
    const { getAllPatientHealthData, deletePatientHealthData, isLoading: patientHealthLoading } = usePatientHealth();

    // ✅ OPTIMIZED: Use centralized state with memoized filtering
    const { users, isLoading: adminLoading } = useAdminState();

    // ✅ OPTIMIZED: Memoized patients filtering
    const patients = useMemo(() =>
        users.filter(user => user.user_roles.toLowerCase() === 'patient'),
        [users]
    );

    // ✅ OPTIMIZED: Local state for health records only
    const [records, setRecords] = useState<PatientWithHealthData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'with_data' | 'without_data'>('all');

    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const isLoading = adminLoading || patientHealthLoading;

    const recordsMap = useMemo(() =>
        new Map(records.map(record => [record.patient_id, record])), [records]);
    // ✅ OPTIMIZED: Memoized patients with health data
    const patientsWithHealth = useMemo((): PatientWithHealth[] => {
        return patients.map(patient => {
            const existingRecord = recordsMap.get(patient.userid);
            return {
                ...patient,
                health_data: existingRecord ? {
                    id: existingRecord.id,
                    patient_id: existingRecord.patient_id,
                    weight_kg: existingRecord.weight_kg,
                    height_cm: existingRecord.height_cm,
                    blood_type: existingRecord.blood_type,
                    blood_pressure: existingRecord.blood_pressure,
                    heart_rate: existingRecord.heart_rate,
                    temperature: existingRecord.temperature,
                    has_high_blood_pressure: existingRecord.has_high_blood_pressure,
                    has_diabetes: existingRecord.has_diabetes,
                    has_cholesterol_hdl: existingRecord.has_cholesterol_hdl,
                    has_cholesterol_ldl: existingRecord.has_cholesterol_ldl,
                    has_kidney_disease: existingRecord.has_kidney_disease,
                    has_cancer: existingRecord.has_cancer,
                    has_heart_disease: existingRecord.has_heart_disease,
                    has_asthma: existingRecord.has_asthma,
                    has_alzheimer_dementia: existingRecord.has_alzheimer_dementia,
                    medications: existingRecord.medications,
                    allergies: existingRecord.allergies,
                    social_situation: existingRecord.social_situation,
                    created_at: existingRecord.created_at,
                    updated_at: existingRecord.updated_at
                } : undefined
            };
        });
    }, [patients, records]);

    // ✅ OPTIMIZED: Memoized filtered records
    const filteredRecords = useMemo(() => {
        let filtered = records;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(record =>
                record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_id_number?.includes(searchTerm)
            );
        }

        if (filterStatus === 'with_data') {
            filtered = filtered.filter(record => record.id);
        } else if (filterStatus === 'without_data') {
            const patientsWithoutData = patients.filter(patient =>
                !records.some(record => record.patient_id === patient.userid)
            ).map(patient => ({
                id: undefined,
                patient_id: patient.userid,
                patient_name: `${patient.english_username_a} ${patient.english_username_d}`,
                patient_email: patient.user_email,
                patient_phone: patient.user_phonenumber,
                patient_id_number: patient.id_number,
                weight_kg: undefined,
                height_cm: undefined,
                blood_type: undefined,
                has_high_blood_pressure: false,
                has_diabetes: false,
                has_cholesterol_hdl: false,
                has_cholesterol_ldl: false,
                has_kidney_disease: false,
                has_cancer: false,
                has_heart_disease: false,
                has_asthma: false,
                has_alzheimer_dementia: false,
                medications: {
                    pain_relief: [],
                    allergy: [],
                    flu: [],
                    antibiotics: []
                },
                created_at: patient.created_at,
                updated_at: patient.created_at
            }));

            if (searchTerm.trim() !== '') {
                filtered = patientsWithoutData.filter(patient =>
                    patient.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.patient_id_number?.includes(searchTerm)
                );
            } else {
                filtered = patientsWithoutData;
            }
        }

        return filtered;
    }, [searchTerm, filterStatus, records, patients]);

    // ✅ OPTIMIZED: Only load health records once on mount
    const loadHealthRecordsOnly = useCallback(async () => {
        try {
            console.log('📊 Loading health records only...');
            const healthData = await getAllPatientHealthData();
            setRecords(healthData);
            console.log(`✅ Loaded ${healthData.length} health records`);
        } catch (error) {
            console.error('❌ Error fetching health records:', error);
            toast({
                title: t('common.error') || "Error",
                description: t('patientHealth.failedToLoad') || "Failed to load patient health data",
                variant: "destructive",
            });
        }
    }, [getAllPatientHealthData, toast, t]);

    // ✅ OPTIMIZED: Initial load
    useEffect(() => {
        console.log('🚀 Initial health records load...');
        loadHealthRecordsOnly();
    }, [loadHealthRecordsOnly]);

    // ✅ OPTIMIZED: Real-time subscription for health records only
    useEffect(() => {
        console.log('🔗 Setting up health records subscription...');

        const healthSubscription = supabase
            .channel('patient-health-updates-component')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'patient_health_info'
                },
                (payload) => {
                    console.log('🔄 Health record changed:', payload.eventType);
                    setTimeout(() => loadHealthRecordsOnly(), 500);
                })
            .subscribe();

        return () => {
            console.log('🧹 Cleaning up health subscription...');
            supabase.removeChannel(healthSubscription);
        };
    }, [loadHealthRecordsOnly]);

    // ✅ OPTIMIZED: Handle delete record
    const handleDeleteRecord = useCallback(async (patientId: number) => {
        const success = await deletePatientHealthData(patientId);
        if (success) {
            await loadHealthRecordsOnly();
        }
    }, [deletePatientHealthData, loadHealthRecordsOnly]);

    // ✅ OPTIMIZED: Handle patient creation
    const handlePatientCreated = useCallback((newPatient: PatientWithHealth) => {
        toast({
            title: "Patient Added",
            description: `${newPatient.english_username_a} ${newPatient.english_username_d} has been added to the system`,
        });
    }, [toast]);

    // Helper functions (keeping your existing ones)
    const calculateDiseaseCount = (record: PatientWithHealthData) => {
        return [
            record.has_high_blood_pressure,
            record.has_diabetes,
            record.has_cholesterol_hdl,
            record.has_cholesterol_ldl,
            record.has_kidney_disease,
            record.has_cancer,
            record.has_heart_disease,
            record.has_asthma,
            record.has_alzheimer_dementia
        ].filter(Boolean).length;
    };
    const calculateMedicationCount = (record: PatientWithHealthData) => {
        if (!record.medications) return 0;
        return Object.values(record.medications).flat().length;
    };

    const translateRole = (role?: string) => {
        const roleTranslations: { [key: string]: string } = {
            'Admin': 'مدير',
            'Doctor': 'طبيب',
            'Nurse': 'ممرض',
            'Secretary': 'سكرتير',
            'Patient': 'مريض'
        };
        return roleTranslations[role || 'Patient'] || role || 'مريض';
    };

    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
            case 'secretary': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'patient': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
                    <Skeleton width={180} height={20} className="mx-auto mb-2" />
                    <Skeleton width={120} height={16} className="mx-auto" />
                    <p className="mt-4 text-gray-600">{t('patientHealth.loading') || 'Loading patient health data...'}</p>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="patient-health-card">
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-left' : ''}`}>
                    <Database className="h-5 w-5" />
                    {t('patientHealth.title') || 'Patient Health Management'}
                </CardTitle>

                {/* Action buttons and search */}
                <div className={`flex items-center justify-between gap-4 patient-health-search-controls flex-col md:flex-row`}>
                    <div className={`flex flex-col md:flex-row gap-2 flex-1 w-full md:w-auto ${isRTL ? 'items-end md:items-start md:flex-row-reverse' : ''}`}>
                        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'with_data' | 'without_data')}>
                            <SelectTrigger className={`w-48 ${isRTL ? 'text-right flex-row-reverse' : ''}`}>
                                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right [&>div]:text-right' : ''}>
                                <SelectItem value="all" className={isRTL ? 'text-right justify-end' : ''}>
                                    {isRTL ? 'جميع المرضى' : 'All Patients'}
                                </SelectItem>
                                <SelectItem value="with_data" className={isRTL ? 'text-right justify-end' : ''}>
                                    {isRTL ? 'مع بيانات صحية' : 'With Health Data'}
                                </SelectItem>
                                <SelectItem value="without_data" className={isRTL ? 'text-right justify-end' : ''}>
                                    {isRTL ? 'بدون بيانات صحية' : 'Without Health Data'}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="w-full md:w-auto">
                            <div className="relative flex-1 max-w-sm mt-2 md:mt-0">
                                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                                <Input
                                    placeholder={t('patientHealth.searchPlaceholder') || 'Search patients...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`${isRTL ? 'pr-10 text-left placeholder:text-right' : 'pl-10'} w-full`}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`flex gap-2 patient-health-buttons w-full md:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {isRTL ? (
                            <>
                                <Button onClick={loadHealthRecordsOnly} variant="outline" size="sm" className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    {t('patientHealth.refresh')}
                                </Button>
                                <PatientHealthForm
                                    onSuccess={loadHealthRecordsOnly}
                                    mode="create"
                                    allPatients={patientsWithHealth}
                                    onPatientCreated={handlePatientCreated}
                                />
                            </>
                        ) : (
                            <>
                                <PatientHealthForm
                                    onSuccess={loadHealthRecordsOnly}
                                    mode="create"
                                    allPatients={patientsWithHealth}
                                    onPatientCreated={handlePatientCreated}
                                />
                                <Button onClick={loadHealthRecordsOnly} variant="outline" size="sm" className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    {t('patientHealth.refresh')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 patient-health-stats">
                    <div className={`bg-blue-50 p-4 rounded-lg ${isRTL ? 'text-left' : ''}`}>
                        <h3 className="text-sm font-medium text-blue-800 text-left">
                            {t('patientHealth.totalPatients') || 'Total Patients'}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 text-left">{patients.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-800 text-left">
                            {t('patientHealth.withHealthData') || 'With Health Data'}
                        </h3>
                        <p className="text-2xl font-bold text-green-600 text-left">{records.length}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-orange-800 text-left">
                            {t('patientHealth.withConditions') || 'With Conditions'}
                        </h3>
                        <p className="text-2xl font-bold text-orange-600 text-left">
                            {records.filter(r => calculateDiseaseCount(r) > 0).length}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-800 text-left">
                            {t('patientHealth.onMedications') || 'On Medications'}
                        </h3>
                        <p className="text-2xl font-bold text-purple-600 text-left">
                            {records.filter(r => calculateMedicationCount(r) > 0).length}
                        </p>
                    </div>
                </div>

                {/* Records Table */}
                <div className="border rounded-lg overflow-hidden patient-health-table">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.patientInfo')}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-left'}`}>
                                        {t('patientHealth.healthSummary') || 'Health Summary'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-left'}`}>
                                        {t('patientHealth.recordInfo') || 'Record Information'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-left'}`}>
                                        {t('patientHealth.actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.map((record, index) => {
                                    const patientData = patientsWithHealth.find(p => p.userid === record.patient_id);
                                    return (
                                        <tr key={record.id || `patient-${record.patient_id}-${index}`} className="hover:bg-gray-50">
                                            {/* Patient Info Column */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {record.patient_name || 'Unknown Patient'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {record.patient_email || 'No email'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {record.patient_phone || 'No phone'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3" />
                                                        ID: {record.patient_id_number || record.patient_id}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Health Summary Column */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {record.id ? (
                                                    <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                                                        {record.weight_kg && record.height_cm && (
                                                            <div className={`text-sm ${isRTL ? 'text-left' : ''}`}>
                                                                <span className="font-medium">{isRTL ? 'مؤشر كتلة الجسم:' : 'BMI:'}</span> {
                                                                    ((record.weight_kg / Math.pow(record.height_cm / 100, 2))).toFixed(1)
                                                                }
                                                            </div>
                                                        )}
                                                        <div className={`flex gap-2 flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                                                            <Badge variant="outline" className={`text-xs flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                                {isRTL ? `حالات مرضية ${calculateDiseaseCount(record)}` : `${calculateDiseaseCount(record)} conditions`}
                                                            </Badge>
                                                            <Badge variant="outline" className={`text-xs flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Pill className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                                {isRTL ? `أدوية ${calculateMedicationCount(record)}` : `${calculateMedicationCount(record)} medications`}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-2">
                                                        <Badge variant="outline" className="text-xs text-gray-500">
                                                            No Health Data
                                                        </Badge>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Record Info Column */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {record.id ? (
                                                    <div className="space-y-2">
                                                        {record.created_by_name && (
                                                            <div className="space-y-1">
                                                                <div className={`text-xs font-medium text-gray-700 ${isRTL ? 'text-left' : ''}`}>
                                                                    {isRTL ? ':تم إنشاؤه بواسطة' : 'Created by:'}
                                                                </div>
                                                                <div className={`text-sm font-medium text-gray-900 ${isRTL ? 'text-left' : ''}`}>
                                                                    {record.created_by_name}
                                                                </div>
                                                                <Badge className={`text-xs ${getRoleColor(record.created_by_role)} ${isRTL ? 'block text-left' : ''}`}>
                                                                    {isRTL ? translateRole(record.created_by_role) : (record.created_by_role || 'Patient')}
                                                                </Badge>
                                                                <div className={`text-xs text-gray-500 ${isRTL ? 'text-left' : ''}`}>
                                                                    {new Date(record.created_at || '').toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-2 text-gray-500 text-sm">
                                                        No health record created
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {record.id ? (
                                                        <>
                                                            <PatientHealthForm
                                                                onSuccess={loadHealthRecordsOnly}
                                                                mode="edit"
                                                                existingData={patientData}
                                                                allPatients={patientsWithHealth}
                                                            />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Health Record</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete the health record for {record.patient_name}?
                                                                            This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteRecord(record.patient_id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    ) : (
                                                        <PatientHealthForm
                                                            onSuccess={loadHealthRecordsOnly}
                                                            mode="create"
                                                            selectedPatientId={record.patient_id}
                                                            allPatients={patientsWithHealth}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {filteredRecords.length === 0 && (
                    <div className={`text-center py-12 ${isRTL ? 'text-left' : ''}`}>
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || filterStatus !== 'all'
                                ? (t('patientHealth.noRecordsFound') || 'No records found')
                                : (t('patientHealth.noRecordsYet') || 'No patient records yet')
                            }
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filterStatus !== 'all'
                                ? (t('patientHealth.adjustSearch') || 'Try adjusting your search criteria or filters')
                                : (t('patientHealth.getStarted') || 'Get started by creating a patient health record')
                            }
                        </p>

                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PatientHealthManagement;
