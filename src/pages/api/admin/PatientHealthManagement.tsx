// pages/api/admin/PatientHealthManagement.tsx - Enhanced version with admin features
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { usePatientHealth, PatientWithHealthData, PatientHealthData } from "@/hooks/usePatientHealth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    Activity,
    Edit,
    Trash2,
    CreditCard,
    Lock,
    EyeIcon,
    EyeOffIcon
} from 'lucide-react';

// Patient interface
interface Patient {
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
}

// NEW: Patient Creation Form Interface
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

// ENHANCED: PatientHealthForm Component with Admin Creation Features
export const PatientHealthForm: React.FC<{
    onSuccess?: () => void;
    selectedPatientId?: number;
    mode?: 'create' | 'edit';
    existingData?: PatientWithHealthData;
}> = ({
    onSuccess,
    selectedPatientId,
    mode = 'create',
    existingData
}) => {
        const { t } = useTranslation();
        const { toast } = useToast();
        const { getPatientHealthData, savePatientHealthData, isSaving } = usePatientHealth();

        // Form state
        const [isOpen, setIsOpen] = useState(false);
        const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
        const [patients, setPatients] = useState<Patient[]>([]);
        const [patientSearch, setPatientSearch] = useState('');
        const [isLoadingPatients, setIsLoadingPatients] = useState(false);

        // NEW: Patient creation state
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
            }
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

        // Load patients when dialog opens or in edit mode
        useEffect(() => {
            if (isOpen) {
                loadPatients();
            }
        }, [isOpen]);

        // Load specific patient if provided
        useEffect(() => {
            if (selectedPatientId && isOpen) {
                loadPatientById(selectedPatientId);
            }
        }, [selectedPatientId, isOpen]);

        // Load existing data in edit mode
        useEffect(() => {
            if (mode === 'edit' && existingData && isOpen) {
                setFormData({
                    patient_id: existingData.patient_id,
                    weight_kg: existingData.weight_kg,
                    height_cm: existingData.height_cm,
                    blood_type: existingData.blood_type || '',
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
                    }
                });

                // Set the selected patient for edit mode
                setSelectedPatient({
                    userid: existingData.patient_id,
                    user_email: existingData.patient_email || '',
                    english_username_a: existingData.patient_name?.split(' ')[0] || '',
                    english_username_d: existingData.patient_name?.split(' ').slice(-1)[0] || '',
                    user_roles: 'Patient'
                });
            }
        }, [mode, existingData, isOpen]);

        // NEW: Generate a secure default password
        const generateDefaultPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };

        // NEW: Handle patient creation form changes
        const handleCreatePatientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setCreatePatientForm(prev => ({ ...prev, [name]: value }));
        };

        // NEW: Validate patient creation form
        const validatePatientCreationForm = (): boolean => {
            const form = createPatientForm;

            if (!form.english_username_a.trim() || !form.english_username_d.trim()) {
                toast({
                    title: "Form Error",
                    description: "First and last names in English are required",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.arabic_username_a.trim() || !form.arabic_username_d.trim()) {
                toast({
                    title: "Form Error",
                    description: "First and last names in Arabic are required",
                    variant: "destructive",
                });
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.user_email)) {
                toast({
                    title: "Invalid Email",
                    description: "Please enter a valid email address",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.id_number.trim() || form.id_number.length < 6) {
                toast({
                    title: "Invalid ID Number",
                    description: "ID number must be at least 6 characters long",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.user_phonenumber.trim() || form.user_phonenumber.length < 8) {
                toast({
                    title: "Invalid Phone Number",
                    description: "Phone number must be at least 8 digits long",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.date_of_birth) {
                toast({
                    title: "Date of Birth Required",
                    description: "Please enter date of birth",
                    variant: "destructive",
                });
                return false;
            }

            if (!form.gender_user) {
                toast({
                    title: "Gender Required",
                    description: "Please select gender",
                    variant: "destructive",
                });
                return false;
            }

            return true;
        };

        // NEW: Create a new patient account
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

                // Generate password if not provided
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
                    pdated_at: currentTimestamp // Keep this typo if it exists in your schema
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

                const newPatient = insertData[0] as Patient;

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

                // Automatically select the new patient
                handlePatientSelect(newPatient);
                loadPatients(); // Refresh patient list

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

        const loadPatients = async () => {
            setIsLoadingPatients(true);
            try {
                const { data, error } = await supabase
                    .from('userinfo')
                    .select('userid, user_email, english_username_a, english_username_b, english_username_c, english_username_d, user_phonenumber, user_roles')
                    .eq('user_roles', 'Patient')
                    .order('english_username_a');

                if (error) throw error;
                setPatients(data || []);
            } catch (error) {
                console.error('Error loading patients:', error);
                toast({
                    title: "Error",
                    description: "Failed to load patients",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingPatients(false);
            }
        };

        const loadPatientById = async (patientId: number) => {
            try {
                const { data, error } = await supabase
                    .from('userinfo')
                    .select('userid, user_email, english_username_a, english_username_b, english_username_c, english_username_d, user_phonenumber, user_roles')
                    .eq('userid', patientId)
                    .single();

                if (error) throw error;
                if (data) {
                    handlePatientSelect(data);
                }
            } catch (error) {
                console.error('Error loading patient:', error);
            }
        };

        const handlePatientSelect = async (patient: Patient) => {
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
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading existing health data:', error);
            }
        };

        const filteredPatients = patients.filter(patient =>
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

            const success = await savePatientHealthData(formData);
            if (success) {
                setIsOpen(false);
                resetForm();
                onSuccess?.();
            }
        };

        const resetForm = () => {
            setSelectedPatient(null);
            setPatientSearch('');
            setFormData({
                patient_id: 0,
                weight_kg: undefined,
                height_cm: undefined,
                blood_type: '',
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
                }
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
                        <Button className="flex items-center gap-2">
                            {mode === 'edit' ? (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Edit Health Record
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Add Patient Health Record
                                </>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {mode === 'edit' ? 'Edit Patient Health Information' : 'Patient Health Information'}
                            </DialogTitle>
                            <DialogDescription>
                                {mode === 'edit' ? 'Update patient health records and medical information.' : 'Add or update patient health records and medical information.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Patient Selection - Only show in create mode */}
                            {mode !== 'edit' && !selectedPatient && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Select Patient
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setShowCreatePatientForm(true)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Create New Patient
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search patients by name, email, or ID..."
                                                value={patientSearch}
                                                onChange={(e) => setPatientSearch(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>

                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {isLoadingPatients ? (
                                                <div className="text-center py-4 text-gray-500">Loading patients...</div>
                                            ) : filteredPatients.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">No patients found</div>
                                            ) : (
                                                filteredPatients.map((patient) => (
                                                    <div
                                                        key={patient.userid}
                                                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                                        onClick={() => handlePatientSelect(patient)}
                                                    >
                                                        <div className="font-medium">{patient.english_username_a}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {patient.user_email} • ID: {patient.userid}
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {patient.user_roles}
                                                        </Badge>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Selected Patient Info & Health Form */}
                            {selectedPatient && (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Patient Information
                                                </div>
                                                {mode !== 'edit' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedPatient(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Change Patient
                                                    </Button>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="font-medium">{selectedPatient.english_username_a}</div>
                                                    <div className="text-sm text-gray-500">{selectedPatient.user_email}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">ID:</span> {selectedPatient.userid}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">Role:</span> {selectedPatient.user_roles}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Physical Measurements */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Physical Measurements</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.weight_kg || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        weight_kg: e.target.value ? parseFloat(e.target.value) : undefined
                                                    }))}
                                                    placeholder="Enter weight in kg"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="height">Height (cm)</Label>
                                                <Input
                                                    id="height"
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.height_cm || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        height_cm: e.target.value ? parseFloat(e.target.value) : undefined
                                                    }))}
                                                    placeholder="Enter height in cm"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="blood_type">Blood Type</Label>
                                                <Select
                                                    value={formData.blood_type}
                                                    onValueChange={(value) => setFormData(prev => ({
                                                        ...prev,
                                                        blood_type: value
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select blood type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A+">A+</SelectItem>
                                                        <SelectItem value="A-">A-</SelectItem>
                                                        <SelectItem value="B+">B+</SelectItem>
                                                        <SelectItem value="B-">B-</SelectItem>
                                                        <SelectItem value="AB+">AB+</SelectItem>
                                                        <SelectItem value="AB-">AB-</SelectItem>
                                                        <SelectItem value="O+">O+</SelectItem>
                                                        <SelectItem value="O-">O-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Health Conditions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-4 w-4" />
                                                Health Conditions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {commonDiseases.map(condition => (
                                                <div key={condition.key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={condition.key}
                                                        checked={formData[condition.key as keyof PatientHealthData] as boolean}
                                                        onCheckedChange={(checked) =>
                                                            handleConditionChange(condition.key, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={condition.key} className="text-sm">
                                                        {condition.en}
                                                    </Label>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Medications */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Medications</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {Object.entries(formData.medications).map(([category, meds]) => (
                                                <div key={category} className="space-y-2">
                                                    <Label className="capitalize font-medium">
                                                        {category.replace('_', ' ')} Medications
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder={`Add ${category.replace('_', ' ')} medication...`}
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
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addMedication(category as keyof typeof newMedications)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {meds.map((med, index) => (
                                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                                {med}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMedication(category as keyof typeof formData.medications, index)}
                                                                    className="ml-1 hover:text-red-600"
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
                                </>
                            )}

                            {/* Form Actions */}
                            {selectedPatient && (
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {mode === 'edit' ? 'Update Health Information' : 'Save Health Information'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </DialogContent>
                </Dialog>

                {/* NEW: Create Patient Dialog */}
                <Dialog open={showCreatePatientForm} onOpenChange={setShowCreatePatientForm}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Create New Patient
                            </DialogTitle>
                            <DialogDescription>
                                Create a new patient account with basic information.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* English Name Fields */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">English Name</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="create_english_first">First</Label>
                                        <Input
                                            id="create_english_first"
                                            name="english_username_a"
                                            value={createPatientForm.english_username_a}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            placeholder="First"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_second">Second</Label>
                                        <Input
                                            id="create_english_second"
                                            name="english_username_b"
                                            value={createPatientForm.english_username_b}
                                            onChange={handleCreatePatientFormChange}
                                            placeholder="Second"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_third">Third</Label>
                                        <Input
                                            id="create_english_third"
                                            name="english_username_c"
                                            value={createPatientForm.english_username_c}
                                            onChange={handleCreatePatientFormChange}
                                            placeholder="Third"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_english_last">Last</Label>
                                        <Input
                                            id="create_english_last"
                                            name="english_username_d"
                                            value={createPatientForm.english_username_d}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            placeholder="Last"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Arabic Name Fields */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Arabic Name</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="create_arabic_first">الأول</Label>
                                        <Input
                                            id="create_arabic_first"
                                            name="arabic_username_a"
                                            value={createPatientForm.arabic_username_a}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            dir="rtl"
                                            placeholder="الأول"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_second">الثاني</Label>
                                        <Input
                                            id="create_arabic_second"
                                            name="arabic_username_b"
                                            value={createPatientForm.arabic_username_b}
                                            onChange={handleCreatePatientFormChange}
                                            dir="rtl"
                                            placeholder="الثاني"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_third">الثالث</Label>
                                        <Input
                                            id="create_arabic_third"
                                            name="arabic_username_c"
                                            value={createPatientForm.arabic_username_c}
                                            onChange={handleCreatePatientFormChange}
                                            dir="rtl"
                                            placeholder="الثالث"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="create_arabic_last">الأخير</Label>
                                        <Input
                                            id="create_arabic_last"
                                            name="arabic_username_d"
                                            value={createPatientForm.arabic_username_d}
                                            onChange={handleCreatePatientFormChange}
                                            required
                                            dir="rtl"
                                            placeholder="الأخير"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Contact Information</h4>

                                <div>
                                    <Label htmlFor="create_email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="create_email"
                                            name="user_email"
                                            type="email"
                                            value={createPatientForm.user_email}
                                            onChange={handleCreatePatientFormChange}
                                            className="pl-10"
                                            required
                                            placeholder="patient@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="create_phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="create_phone"
                                            name="user_phonenumber"
                                            type="tel"
                                            value={createPatientForm.user_phonenumber}
                                            onChange={handleCreatePatientFormChange}
                                            className="pl-10"
                                            required
                                            placeholder="+97000000000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="create_id_number">ID Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="create_id_number"
                                            name="id_number"
                                            value={createPatientForm.id_number}
                                            onChange={handleCreatePatientFormChange}
                                            className="pl-10"
                                            required
                                            placeholder="123456789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Personal Information</h4>

                                <div>
                                    <Label htmlFor="create_dob">Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="create_dob"
                                            name="date_of_birth"
                                            type="date"
                                            value={createPatientForm.date_of_birth}
                                            onChange={handleCreatePatientFormChange}
                                            className="pl-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm">Gender</Label>
                                    <RadioGroup
                                        value={createPatientForm.gender_user}
                                        onValueChange={(value) => setCreatePatientForm(prev => ({ ...prev, gender_user: value }))}
                                        className="flex gap-4 mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="male" id="create_male" />
                                            <Label htmlFor="create_male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="female" id="create_female" />
                                            <Label htmlFor="create_female">Female</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label htmlFor="create_password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="create_password"
                                            name="user_password"
                                            type={showPassword ? "text" : "password"}
                                            value={createPatientForm.user_password}
                                            onChange={handleCreatePatientFormChange}
                                            className="pl-10 pr-10"
                                            placeholder="Leave empty for auto-generation"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                        </button>
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
                                Cancel
                            </Button>
                            <Button
                                onClick={createNewPatient}
                                disabled={isCreatingPatient}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isCreatingPatient ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create Patient
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    };

// ENHANCED: Main PatientHealthManagement Component with Admin Features
const PatientHealthManagement: React.FC = () => {
    const { getAllPatientHealthData, deletePatientHealthData, isLoading } = usePatientHealth();
    const [records, setRecords] = useState<PatientWithHealthData[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PatientWithHealthData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<PatientWithHealthData | null>(null);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        fetchAllRecords();
    }, []);

    useEffect(() => {
        // Filter records based on search term
        if (searchTerm.trim() === '') {
            setFilteredRecords(records);
        } else {
            const filtered = records.filter(record =>
                record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_id_number?.includes(searchTerm)
            );
            setFilteredRecords(filtered);
        }
    }, [searchTerm, records]);

    const fetchAllRecords = async () => {
        try {
            const data = await getAllPatientHealthData();
            setRecords(data);
            setFilteredRecords(data);
        } catch (error) {
            console.error('Error fetching patient records:', error);
            toast({
                title: t('common.error') || "Error",
                description: t('patientHealth.failedToLoad') || "Failed to load patient health records",
                variant: "destructive",
            });
        }
    };

    // NEW: Handle delete record
    const handleDeleteRecord = async (patientId: number) => {
        const success = await deletePatientHealthData(patientId);
        if (success) {
            await fetchAllRecords();
        }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span className="text-gray-600">{t('patientHealth.loadingRecords') || 'Loading patient records...'}</span>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <Database className="h-5 w-5" />
                    {t('patientHealth.title') || 'Patient Health Records'}
                </CardTitle>

                {/* Action buttons and search */}
                <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="relative flex-1 max-w-sm">
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                        <Input
                            placeholder={t('patientHealth.searchPlaceholder') || 'Search patients...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                        />
                    </div>

                    <div className="flex gap-2">
                        <PatientHealthForm onSuccess={fetchAllRecords} mode="create" />

                        <Button onClick={fetchAllRecords} variant="outline" size="sm">
                            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('patientHealth.refresh') || 'Refresh'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800">
                            {t('patientHealth.totalRecords') || 'Total Records'}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-800">
                            {t('patientHealth.recentUpdates') || 'Recent Updates'}
                        </h3>
                        <p className="text-2xl font-bold text-green-600">
                            {filteredRecords.filter(r =>
                                new Date(r.updated_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                            ).length}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-orange-800">
                            {t('patientHealth.withConditions') || 'With Conditions'}
                        </h3>
                        <p className="text-2xl font-bold text-orange-600">
                            {filteredRecords.filter(r => calculateDiseaseCount(r) > 0).length}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-800">
                            {t('patientHealth.onMedications') || 'On Medications'}
                        </h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {filteredRecords.filter(r => calculateMedicationCount(r) > 0).length}
                        </p>
                    </div>
                </div>

                {/* Records Table */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.patientInfo') || 'Patient Information'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.healthSummary') || 'Health Summary'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.createdBy') || 'Created By'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.lastUpdatedBy') || 'Last Updated By'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('patientHealth.dates') || 'Dates'}
                                    </th>
                                    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
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
                                                <div className="text-xs text-gray-400">
                                                    ID: {record.patient_id}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {/* BMI */}
                                                {record.weight_kg && record.height_cm && (
                                                    <div className="text-sm">
                                                        <span className="font-medium">BMI:</span> {
                                                            ((record.weight_kg / Math.pow(record.height_cm / 100, 2))).toFixed(1)
                                                        }
                                                    </div>
                                                )}

                                                {/* Blood Type */}
                                                <div className="text-sm">
                                                    <span className="font-medium">Blood:</span> {record.blood_type || 'Not set'}
                                                </div>

                                                {/* Conditions and Medications */}
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        <Heart className="h-3 w-3 mr-1" />
                                                        {calculateDiseaseCount(record)} conditions
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        <Pill className="h-3 w-3 mr-1" />
                                                        {calculateMedicationCount(record)} medications
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {record.created_by_name ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm text-gray-900">
                                                        {record.created_by_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {record.created_by_email}
                                                    </div>
                                                    <Badge className={`text-xs ${getRoleColor(record.created_by_role)}`}>
                                                        {record.created_by_role || 'Patient'}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Unknown</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {record.updated_by_name ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm text-gray-900">
                                                        {record.updated_by_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {record.updated_by_email}
                                                    </div>
                                                    <Badge className={`text-xs ${getRoleColor(record.updated_by_role)}`}>
                                                        {record.updated_by_role || 'Patient'}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Unknown</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="space-y-1 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="font-medium">Created:</span>
                                                </div>
                                                <div className="ml-4">
                                                    {new Date(record.created_at || '').toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="font-medium">Updated:</span>
                                                </div>
                                                <div className="ml-4">
                                                    {new Date(record.updated_at || '').toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>

                                        {/* NEW: Actions Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                <PatientHealthForm
                                                    onSuccess={fetchAllRecords}
                                                    mode="edit"
                                                    existingData={record}
                                                />

                                                {/* Delete Button */}
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {filteredRecords.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('patientHealth.noRecordsFound') || 'No patient records found'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm
                                ? (t('patientHealth.adjustSearch') || 'Try adjusting your search criteria')
                                : (t('patientHealth.noRecordsYet') || 'No patient health records have been created yet')
                            }
                        </p>
                        {!searchTerm && (
                            <PatientHealthForm onSuccess={fetchAllRecords} mode="create" />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PatientHealthManagement;