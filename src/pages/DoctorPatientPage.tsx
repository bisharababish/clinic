// DoctorPatientsPage.tsx - Patient Management with Clinical Notes
import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Calendar, User, Filter, Plus, Edit, Save, X, FileText, AlertCircle, Clock, Stethoscope } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Type definitions
interface Patient {
    id: number;
    name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    address?: string;
    emergency_contact?: string;
    medical_history?: string;
    allergies?: string;
    current_medications?: string;
    created_at: string;
    updated_at: string;
}

interface ClinicalNote {
    id: number;
    patient_id: number;
    doctor_id: number;
    doctor_name: string;
    note_type: 'consultation' | 'diagnosis' | 'treatment' | 'follow_up' | 'general';
    chief_complaint?: string;
    present_illness?: string;
    examination_findings?: string;
    diagnosis?: string;
    treatment_plan?: string;
    medications?: string;
    follow_up_date?: string;
    follow_up_notes?: string;
    vital_signs?: {
        blood_pressure?: string;
        heart_rate?: string;
        temperature?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
        weight?: string;
        height?: string;
    };
    notes: string;
    status: 'active' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
}

// Skeleton Loading Components
const PatientsSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
    <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-48" />
                            </div>
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filters Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
            </div>

            {/* Patients Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="space-y-2 mb-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex space-x-2">
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 flex-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const DoctorPatientsPage: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    // State management
    const [patients, setPatients] = useState<Patient[]>([]);
    const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [initializing, setInitializing] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
    const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
    const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
    const [newNote, setNewNote] = useState<Partial<ClinicalNote>>({
        note_type: 'general',
        status: 'active',
        priority: 'medium',
        notes: '',
        vital_signs: {}
    });
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const isFetchingRef = useRef(false);

    // Fetch patients from database
    const fetchPatients = async () => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('userinfo')
                .select('*')
                .ilike('user_roles', '%Patient%') // Note: your schema shows 'Patient' with capital P
                .order('created_at', { ascending: false })

            if (error) throw error;

            const transformedPatients: Patient[] = (data || []).map(user => ({
                id: user.userid, // Use userid instead of id
                name: `${user.english_username_a} ${user.english_username_b} ${user.english_username_c} ${user.english_username_d}`.trim(),
                email: user.user_email,
                phone: user.user_phonenumber,
                date_of_birth: user.date_of_birth,
                gender: user.gender_user,
                blood_type: user.blood_type,
                address: user.address,
                emergency_contact: user.emergency_contact,
                medical_history: user.medical_history,
                allergies: user.allergies,
                current_medications: user.current_medications, // This might be null in your schema
                created_at: user.created_at,
                updated_at: user.updated_at
            }));

            setPatients(transformedPatients);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients. Please try again.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    // Fetch clinical notes for a specific patient
    const fetchClinicalNotes = async (patientId: number) => {
        try {
            const { data, error } = await supabase
                .from('clinical_notes')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClinicalNotes(data || []);
        } catch (err) {
            console.error('Error fetching clinical notes:', err);
            toast({
                title: 'Error',
                description: 'Failed to load clinical notes.',
                variant: 'destructive',
            });
        }
    };
    const saveClinicalNote = async () => {
        if (!selectedPatient || !user) {
            console.error('Missing required data:', { selectedPatient, user });
            return;
        }

        if (!newNote.notes?.trim()) {
            toast({
                title: 'Error',
                description: 'Clinical notes are required.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // The logged-in doctor's info should be automatically available
            // Let's get the doctor's userid from userinfo table using their email
            const { data: doctorInfo, error: doctorError } = await supabase
                .from('userinfo')
                .select('userid, english_username_a, english_username_b, english_username_c, english_username_d')
                .eq('user_email', user.email)
                .eq('user_roles', 'Doctor') // Make sure they're actually a doctor
                .single();

            if (doctorError || !doctorInfo) {
                throw new Error('Doctor information not found. Please make sure you are logged in as a doctor.');
            }

            const doctorName = `${doctorInfo.english_username_a} ${doctorInfo.english_username_b} ${doctorInfo.english_username_c} ${doctorInfo.english_username_d}`.trim();

            const noteData = {
                patient_id: selectedPatient.id,
                doctor_id: doctorInfo.userid, // This is the doctor's userid from userinfo table
                doctor_name: doctorName,
                note_type: newNote.note_type || 'general',
                status: newNote.status || 'active',
                priority: newNote.priority || 'medium',
                notes: newNote.notes.trim(),
                chief_complaint: newNote.chief_complaint || null,
                diagnosis: newNote.diagnosis || null,
                treatment_plan: newNote.treatment_plan || null,
                medications: newNote.medications || null,
                follow_up_date: newNote.follow_up_date || null,
                follow_up_notes: newNote.follow_up_notes || null,
                vital_signs: newNote.vital_signs || {}
            };

            console.log('Saving note with data:', noteData);

            const { data, error } = await supabase
                .from('clinical_notes')
                .insert([noteData])
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
                throw error;
            }

            // Refresh the notes list and close the form
            await fetchClinicalNotes(selectedPatient.id);
            resetNoteForm();
            setIsAddingNote(false);

            toast({
                title: 'Success',
                description: 'Clinical note added successfully!',
            });

        } catch (err) {
            console.error('Error saving clinical note:', err);
            toast({
                title: 'Error',
                description: `Failed to save note: ${err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Reset note form
    const resetNoteForm = () => {
        setNewNote({
            note_type: 'general',
            status: 'active',
            priority: 'medium',
            notes: '',
            vital_signs: {}
        });

        setEditingNote(null);
    };

    // Initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                setInitializing(true);

                if (!user) {
                    setInitializing(false);
                    return;
                }

                if (user.role !== 'doctor' && user.role !== 'admin') {
                    setError('Access denied. Only doctors and administrators can manage patients.');
                    setInitializing(false);
                    return;
                }

                await fetchPatients();
            } catch (err) {
                console.error('Error initializing component:', err);
                setError('Failed to initialize');
            } finally {
                setInitializing(false);
            }
        };

        if (user !== undefined) {
            initializeComponent();
        }
    }, [user]);

    // Filter patients
    const filteredPatients = patients.filter(patient => {
        const matchesSearch =
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (patient.phone && patient.phone.includes(searchTerm));
        return matchesSearch;
    });

    // Handle patient selection
    const handlePatientSelect = async (patient: Patient) => {
        setSelectedPatient(patient);
        setShowNotesModal(true);
        await fetchClinicalNotes(patient.id);
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!user && initializing) {
        return <PatientsSkeletonLoading isRTL={isRTL} />;
    }

    if (loading) {
        return <PatientsSkeletonLoading isRTL={isRTL} />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={isRTL ? 'order-2' : 'order-1'}>
                                <h1 className={`text-2xl font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Users className="h-8 w-8 text-blue-600 " />
                                    {isRTL ? 'إدارة المرضى' : 'Patient Management'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {isRTL ? 'إدارة المرضى والملاحظات السريرية' : 'Manage patients and clinical notes'}
                                </p>
                            </div>
                            <button
                                onClick={fetchPatients}
                                disabled={loading}
                                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 ${isRTL ? 'order-1 flex-row-reverse' : 'order-2'}`}
                            >
                                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {loading ? (isRTL ? 'جاري التحديث...' : 'Refreshing...') : (isRTL ? 'تحديث' : 'Refresh')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="relative">
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'البحث عن المرضى بالاسم أو البريد الإلكتروني أو الهاتف...' : 'Search patients by name, email, or phone...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-600">
                            {isRTL ? `تم العثور على ${filteredPatients.length} مريض` : `${filteredPatients.length} patients found`}
                        </span>
                    </div>
                </div>

                {/* Patients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                            <p className="text-sm text-gray-500">{patient.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    {patient.phone && <p><span className="font-medium">{isRTL ? 'الهاتف' : 'Phone'}:</span> {patient.phone}</p>}
                                    {patient.date_of_birth && <p><span className="font-medium">{isRTL ? 'تاريخ الميلاد' : 'DOB'}:</span> {new Date(patient.date_of_birth).toLocaleDateString()}</p>}
                                    {patient.blood_type && <p><span className="font-medium">{isRTL ? 'فصيلة الدم' : 'Blood Type'}:</span> {patient.blood_type}</p>}
                                    <p><span className="font-medium">{isRTL ? 'تاريخ التسجيل' : 'Registered'}:</span> {new Date(patient.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePatientSelect(patient)}
                                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                                    >
                                        <Stethoscope className="h-4 w-4" />
                                        {isRTL ? 'الملاحظات السريرية' : 'Clinical Notes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPatients.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{isRTL ? 'لم يتم العثور على مرضى' : 'No patients found'}</p>
                        <p className="text-gray-400 text-sm mt-2">{isRTL ? 'حاول تعديل معايير البحث' : 'Try adjusting your search criteria'}</p>
                    </div>
                )}
            </div>

            {/* Clinical Notes Modal */}
            {showNotesModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isRTL ? `الملاحظات السريرية - ${selectedPatient.name}` : `Clinical Notes - ${selectedPatient.name}`}
                                    </h2>
                                    <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setIsAddingNote(true);
                                            resetNoteForm();
                                        }}
                                        className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <Plus className="h-4 w-4" />
                                        {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNotesModal(false);
                                            setSelectedPatient(null);
                                            setIsAddingNote(false);  // Add this line
                                            setEditingNote(null);    // Add this line
                                            setClinicalNotes([]);    // Add this line
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                        title={isRTL ? 'إغلاق' : 'Close'}
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Patient Summary */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-gray-900 mb-2">{isRTL ? 'ملخص المريض' : 'Patient Summary'}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">{isRTL ? 'تاريخ الميلاد' : 'DOB'}:</span>
                                        <p>{selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : (isRTL ? 'غير متوفر' : 'N/A')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{isRTL ? 'فصيلة الدم' : 'Blood Type'}:</span>
                                        <p>{selectedPatient.blood_type || (isRTL ? 'غير متوفر' : 'N/A')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{isRTL ? 'الهاتف' : 'Phone'}:</span>
                                        <p>{selectedPatient.phone || (isRTL ? 'غير متوفر' : 'N/A')}</p>

                                    </div>
                                    <div>
                                        <span className="font-medium">{isRTL ? 'جهة الاتصال للطوارئ' : 'Emergency Contact'}:</span>
                                        <p>{selectedPatient.emergency_contact || (isRTL ? 'غير متوفر' : 'N/A')}</p>
                                    </div>
                                </div>
                                {selectedPatient.allergies && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                        <span className="font-medium text-red-800">{isRTL ? 'الحساسية' : 'Allergies'}:</span>
                                        <p className="text-red-700">{selectedPatient.allergies}</p>
                                    </div>
                                )}
                            </div>

                            {/* Add/Edit Note Form */}
                            {(isAddingNote || editingNote) && (
                                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                    <h3 className="font-medium text-gray-900 mb-4">
                                        {editingNote
                                            ? (isRTL ? 'تعديل الملاحظة' : 'Edit Note')
                                            : (isRTL ? 'إضافة ملاحظة سريرية جديدة' : 'Add New Clinical Note')
                                        }
                                    </h3>
                                    <form onSubmit={(e) => { e.preventDefault(); saveClinicalNote(); }}>
                                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'نوع الملاحظة' : 'Note Type'}</label>
                                                <select
                                                    value={newNote.note_type}
                                                    onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value as ClinicalNote["note_type"] })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                >
                                                    <option value="general">{isRTL ? 'عام' : 'General'}</option>
                                                    <option value="consultation">{isRTL ? 'استشارة' : 'Consultation'}</option>
                                                    <option value="diagnosis">{isRTL ? 'تشخيص' : 'Diagnosis'}</option>
                                                    <option value="treatment">{isRTL ? 'علاج' : 'Treatment'}</option>
                                                    <option value="follow_up">{isRTL ? 'متابعة' : 'Follow-up'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'الأولوية' : 'Priority'}</label>
                                                <select
                                                    value={newNote.priority}
                                                    onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as ClinicalNote["priority"] })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                >
                                                    <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                                                    <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                                                    <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                                                    <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
                                                <select
                                                    value={newNote.status}
                                                    onChange={(e) => setNewNote({ ...newNote, status: e.target.value as ClinicalNote["status"] })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                >
                                                    <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                                                    <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                                                    <option value="cancelled">{isRTL ? 'ملغى' : 'Cancelled'}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'الملاحظات السريرية' : 'Clinical Notes'}</label>
                                            <textarea
                                                value={newNote.notes}
                                                onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                                                rows={6}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder={isRTL ? 'أدخل الملاحظات السريرية، التشخيص، خطة العلاج، إلخ...' : 'Enter clinical observations, diagnosis, treatment plan, etc...'}
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                {editingNote
                                                    ? (isRTL ? 'تحديث الملاحظة' : 'Update Note')
                                                    : (isRTL ? 'حفظ الملاحظة' : 'Save Note')
                                                }                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetNoteForm();
                                                    setIsAddingNote(false); // Add this line to close the form
                                                }}
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                            >
                                                {isRTL ? 'إلغاء' : 'Cancel'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Clinical Notes List */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">{isRTL ? 'تاريخ الملاحظات السريرية' : 'Clinical Notes History'}</h3>                                {clinicalNotes.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>{isRTL ? 'لا توجد ملاحظات سريرية بعد' : 'No clinical notes yet'}</p>
                                        <p className="text-sm">{isRTL ? 'أضف أول ملاحظة للبدء' : 'Add your first note to get started'}</p>
                                    </div>
                                ) : (
                                    clinicalNotes.map((note) => (
                                        <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(note.priority)}`}>
                                                        {note.priority.toUpperCase()}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(note.status)}`}>
                                                        {note.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {note.note_type.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingNote(note);
                                                            setNewNote(note);
                                                            setIsAddingNote(false);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(note.created_at).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>by Dr. {note.doctor_name}</span>
                                                </div>
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-gray-800">
                                                    {note.notes}
                                                </div>
                                            </div>

                                            {/* Additional fields if they exist */}
                                            {note.diagnosis && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded">
                                                    <span className="font-medium text-blue-800">Diagnosis:</span>
                                                    <p className="text-blue-700">{note.diagnosis}</p>
                                                </div>
                                            )}

                                            {note.treatment_plan && (
                                                <div className="mt-3 p-3 bg-green-50 rounded">
                                                    <span className="font-medium text-green-800">Treatment Plan:</span>
                                                    <p className="text-green-700">{note.treatment_plan}</p>
                                                </div>
                                            )}

                                            {note.follow_up_date && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded">
                                                    <span className="font-medium text-yellow-800">Follow-up:</span>
                                                    <p className="text-yellow-700">
                                                        {new Date(note.follow_up_date).toLocaleDateString()}
                                                        {note.follow_up_notes && ` - ${note.follow_up_notes}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatientsPage;