// pages/admin/DoctorManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../../../lib/supabase";
import {
    Trash2,
    Edit,
    Plus,
    Clock,
    RefreshCw,
    Search,
    Calendar,
    AlertTriangle
} from "lucide-react";
import "../../styles/doctormanagement.css"
import { useAdminState } from "../../../hooks/useAdminState"; // ✅ NEW IMPORT
import { translateToArabic } from "../../../lib/translationService";

interface DoctorInfo {
    id: string;
    name: string;
    name_ar?: string; // Add this
    specialty: string;
    specialty_ar?: string; // Add this
    clinic_id: string;
    email: string;
    phone?: string;
    is_available: boolean;
    price: number;
    created_at?: string;
    updated_at?: string;
}

interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    category_name_en?: string;  // Add this
    category_name_ar?: string;  // Add this
    is_active: boolean;
}

interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day: string;
    start_time: string;
    end_time: string;
}

const DoctorManagement = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    // ✅ NEW: Use centralized state for doctors and clinics
    const {
        doctors,
        clinics,
        isLoading,
        loadDoctors,
        loadClinics,
    } = useAdminState();

    // ✅ KEEP: Local UI state (component-specific)
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([]);
    const getCategoryDisplayName = (categoryName: string, categoryNameAr?: string) => {
        if (isRTL && categoryNameAr) {
            return categoryNameAr;
        }
        return categoryName;
    };
    // State for doctor form
    const [doctorFormMode, setDoctorFormMode] = useState<"create" | "edit">("create");
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [doctorFormData, setDoctorFormData] = useState({
        name: "",
        specialty: "",
        clinic_id: "",
        email: "",
        phone: "",
        is_available: false,
        price: 1,
    });
    const [isTranslating, setIsTranslating] = useState(false);

    // State for availability management
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [selectedDoctorForAvailability, setSelectedDoctorForAvailability] = useState<string | null>(null);
    const [selectedDoctorName, setSelectedDoctorName] = useState("");
    const [newSlot, setNewSlot] = useState({
        day: "Monday",
        start_time: "08:00",
        end_time: "20:00",
    });
    const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

    // State for delete confirmation dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<DoctorInfo | null>(null);

    // Add state for slot deletion confirmation
    const [showSlotDeleteDialog, setShowSlotDeleteDialog] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(null);

    const weekdays = [
        { en: "Monday", ar: t('doctorManagement.monday') },
        { en: "Tuesday", ar: t('doctorManagement.tuesday') },
        { en: "Wednesday", ar: t('doctorManagement.wednesday') },
        { en: "Thursday", ar: t('doctorManagement.thursday') },
        { en: "Friday", ar: t('doctorManagement.friday') },
        { en: "Saturday", ar: t('doctorManagement.saturday') },
        { en: "Sunday", ar: t('doctorManagement.sunday') }
    ];

    // Handle search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = doctors.filter(doctor =>
                doctor.name.toLowerCase().includes(query) ||
                doctor.specialty.toLowerCase().includes(query) ||
                doctor.email.toLowerCase().includes(query)
            );
            setFilteredDoctors(filtered);
        }
    }, [searchQuery, doctors]);

    const validatePhoneNumber = (phoneNumber: string): boolean => {
        const phoneRegex = /^\+97[02]\d{9}$/;
        return phoneRegex.test(phoneNumber);
    };

    // Load availability slots for a specific doctor
    const loadAvailabilitySlots = async (doctorId: string) => {
        try {

            // Check if availability_slots table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('doctor_availability')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_doctor_availability_table');
            }

            const { data, error } = await supabase
                .from('doctor_availability')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('day', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;

            setAvailabilitySlots(data || []);
        } catch (error) {
            console.error("Error loading availability slots:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToLoadSlots'),
                variant: "destructive",
            });
        }
    };

    // Doctor form handlers
    const handleDoctorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Handle phone number formatting
        if (name === 'phone') {
            // Start with +97 and allow user to choose 0 or 2, then 9 digits
            let sanitized = value.replace(/[^\d+]/g, '');

            // If it doesn't start with +97, add it
            if (!sanitized.startsWith('+')) {
                sanitized = '+97' + sanitized;
            }

            // If it starts with + but not +97, reset to +97
            if (sanitized.startsWith('+') && !sanitized.startsWith('+97')) {
                sanitized = '+97';
            }
            // If it starts with +97 but no third digit yet, allow it
            if (sanitized === '+' || sanitized === '+9' || sanitized === '+97') {
                setDoctorFormData(prev => ({ ...prev, [name]: sanitized }));
                return;
            }

            if (!sanitized.startsWith('+970') && !sanitized.startsWith('+972')) {
                // If user typed +97X where X is not 0 or 2, reset to +97
                sanitized = '+97';
            } else {
                // Valid prefix, limit total length to 13 characters (+970/2 + 9 digits)
                sanitized = sanitized.slice(0, 13);
            }

            // Only allow up to 9 digits after +970 or +972
            const prefix = sanitized.startsWith('+970') ? '+970' : '+972';
            let digits = sanitized.slice(prefix.length).replace(/\D/g, '');
            digits = digits.slice(0, 9);
            sanitized = prefix + digits;

            setDoctorFormData(prev => ({ ...prev, [name]: sanitized }));
            return;
        }

        // Default handling for other fields
        setDoctorFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDoctorClinicChange = (value: string) => {
        setDoctorFormData(prev => ({ ...prev, clinic_id: value }));
    };

    const handleDoctorAvailableChange = (value: boolean) => {
        setDoctorFormData(prev => ({ ...prev, is_available: value }));
    };

    const resetDoctorForm = () => {
        setDoctorFormMode("create");
        setSelectedDoctor(null);
        setDoctorFormData({
            name: "",
            specialty: "",
            clinic_id: "",
            email: "",
            phone: "",
            is_available: false,
            price: 1
        });
    };

    const handleEditDoctor = (id: string) => {
        const doctorToEdit = doctors.find((d) => d.id === id);
        if (!doctorToEdit) {
            toast({
                title: t('common.error'),
                description: t('doctorManagement.doctorNotFound'),
                variant: "destructive",
            });
            return;
        }

        setDoctorFormMode("edit");
        setSelectedDoctor(id);
        setDoctorFormData({
            name: doctorToEdit.name,
            specialty: doctorToEdit.specialty,
            clinic_id: doctorToEdit.clinic_id,
            email: doctorToEdit.email,
            phone: doctorToEdit.phone || "",
            is_available: doctorToEdit.is_available,
            price: doctorToEdit.price
        });
    };

    // Open delete confirmation dialog
    const confirmDeleteDoctor = (doctor: DoctorInfo) => {
        setDoctorToDelete(doctor);
        setShowDeleteDialog(true);
    };

    // Handle actual doctor deletion
    const handleDeleteDoctor = async () => {
        if (!doctorToDelete) return;

        try {
            // Step 1: Delete all appointments for this doctor
            const { error: appointmentsError } = await supabase
                .from('appointments')
                .delete()
                .eq('doctor_id', doctorToDelete.id);

            if (appointmentsError) {
                console.error("Error deleting appointments:", appointmentsError);
                toast({
                    title: t('common.error'),
                    description: "Failed to delete doctor's appointments",
                    variant: "destructive",
                });
                return;
            }

            // Step 2: Delete all availability slots for this doctor
            const { error: availabilityError } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('doctor_id', doctorToDelete.id);

            if (availabilityError) {
                console.error("Error deleting availability slots:", availabilityError);
                toast({
                    title: t('common.error'),
                    description: "Failed to delete doctor's availability",
                    variant: "destructive",
                });
                return;
            }

            // Step 3: Now delete the doctor
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', doctorToDelete.id);

            if (error) throw error;

            await loadDoctors(true);

            toast({
                title: t('common.success'),
                description: t('doctorManagement.doctorDeletedSuccessfully', { name: doctorToDelete.name }),
            });

            setShowDeleteDialog(false);
            setDoctorToDelete(null);
        } catch (error) {
            console.error("Error deleting doctor:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToDeleteDoctor'),
                variant: "destructive",
            });
        }
    };
    const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Validate phone number
        if (doctorFormData.phone && !validatePhoneNumber(doctorFormData.phone)) {
            toast({
                title: t("auth.invalidPhone"),
                description: t("auth.palestinianPhoneFormat"),
                variant: "destructive",
            });
            return;
        }
        // Validate doctor form
        if (!doctorFormData.name.trim() ||
            !doctorFormData.specialty.trim() ||
            !doctorFormData.clinic_id ||
            !doctorFormData.email.trim() ||
            !doctorFormData.phone.trim()) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.fillAllFields'),
                variant: "destructive",
            });
            return;
        }

        if (isNaN(doctorFormData.price) || doctorFormData.price < 1) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.validPrice'),
                variant: "destructive",
            });
            return;
        }

        try {
            // Translate doctor name and specialty to Arabic
            setIsTranslating(true);
            const arabicName = await translateToArabic(doctorFormData.name);
            const arabicSpecialty = await translateToArabic(doctorFormData.specialty);
            setIsTranslating(false);

            if (doctorFormMode === "create") {
                // Create new doctor
                const { data, error } = await supabase
                    .from('doctors')
                    .insert({
                        name: doctorFormData.name,
                        name_ar: arabicName, // Add this
                        specialty: doctorFormData.specialty,
                        specialty_ar: arabicSpecialty, // Add this
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone || null,
                        is_available: doctorFormData.is_available,
                        price: Number(doctorFormData.price),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    await loadDoctors(true); // Force refresh doctors
                    toast({
                        title: t('common.success'),
                        description: t('doctorManagement.doctorCreatedSuccessfully'),
                    });
                }

                resetDoctorForm();
            } else if (doctorFormMode === "edit" && selectedDoctor) {
                // Update existing doctor
                const { data, error } = await supabase
                    .from('doctors')
                    .update({
                        name: doctorFormData.name,
                        name_ar: arabicName, // Add this
                        specialty: doctorFormData.specialty,
                        specialty_ar: arabicSpecialty, // Add this
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone || null,
                        is_available: doctorFormData.is_available,
                        price: Number(doctorFormData.price),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedDoctor)
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    await loadDoctors(true); // Force refresh doctors
                    toast({
                        title: t('common.success'),
                        description: t('doctorManagement.doctorUpdatedSuccessfully'),
                    });
                }

                resetDoctorForm();
            }
        } catch (error) {
            console.error("Error saving doctor:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToSaveDoctor'),
                variant: "destructive",
            });
        }
    };

    // Availability slot handlers
    const handleManageAvailability = (id: string) => {
        const doctor = doctors.find(d => d.id === id);
        if (!doctor) {
            toast({
                title: t('common.error'),
                description: t('doctorManagement.doctorNotFound'),
                variant: "destructive",
            });
            return;
        }

        setSelectedDoctorForAvailability(id);
        setSelectedDoctorName(doctor.name);
        loadAvailabilitySlots(id);
        setShowAvailabilityDialog(true);
    };

    const handleNewSlotChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'start_time') {
            // Don't allow start time before 08:00
            if (value < '08:00') {
                toast({
                    title: t('doctorManagement.validationError'),
                    description: t('doctorManagement.startTimeMinimum') || 'Start time cannot be before 08:00',
                    variant: "destructive",
                });
                return;
            }
            // Don't allow start time after 20:00
            if (value > '20:00') {
                toast({
                    title: t('doctorManagement.validationError'),
                    description: t('doctorManagement.startTimeMaximum') || 'Start time cannot be after 20:00',
                    variant: "destructive",
                });
                return;
            }
        }

        if (name === 'end_time') {
            // Don't allow end time before 08:00
            if (value < '08:00') {
                toast({
                    title: t('doctorManagement.validationError'),
                    description: t('doctorManagement.endTimeMinimum') || 'End time cannot be before 08:00',
                    variant: "destructive",
                });
                return;
            }
            // Don't allow end time after 20:00
            if (value > '20:00') {
                toast({
                    title: t('doctorManagement.validationError'),
                    description: t('doctorManagement.endTimeMaximum') || 'End time cannot be after 20:00',
                    variant: "destructive",
                });
                return;
            }
        }

        setNewSlot(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAvailabilitySlot = async () => {
        if (!selectedDoctorForAvailability) return;

        if (!newSlot.day || !newSlot.start_time || !newSlot.end_time) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.fillAvailabilityFields'),
                variant: "destructive",
            });
            return;
        }

        // Validate time format and that end time is after start time
        const startTime = new Date(`2023-01-01T${newSlot.start_time}`);
        const endTime = new Date(`2023-01-01T${newSlot.end_time}`);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.validTimeValues'),
                variant: "destructive",
            });
            return;
        }

        if (startTime >= endTime) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.endTimeAfterStart'),
                variant: "destructive",
            });
            return;
        }

        try {

            const { data, error } = await supabase
                .from('doctor_availability')
                .insert({
                    doctor_id: selectedDoctorForAvailability,
                    day: newSlot.day,
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time
                })
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setAvailabilitySlots(prev => [...prev, data[0]]);

                // Reset the form for a new entry
                setNewSlot({
                    day: newSlot.day, // Keep the same day for consecutive entries
                    start_time: "08:00",
                    end_time: "20:00"
                });

                toast({
                    title: t('common.success'),
                    description: t('doctorManagement.slotAddedSuccessfully'),
                    variant: 'success', // Use green background for success
                });
            }
        } catch (error) {
            console.error("Error adding availability slot:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToAddSlot'),
                variant: "destructive",
            });
        }
    };

    const handleDeleteAvailabilitySlot = async (id: string) => {
        try {

            const { error } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));

            toast({
                title: t('common.success'),
                description: t('doctorManagement.slotRemovedSuccessfully'),
                variant: 'destructive', // Use red background for removal
            });
        } catch (error) {
            console.error("Error deleting availability slot:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToDeleteSlot'),
                variant: "destructive",
            });
        }
    };

    const getClinicNameById = (id: string) => {
        const clinic = clinics.find(c => c.id === id);
        if (!clinic) return "Unknown Clinic";

        const categoryDisplay = getCategoryDisplayName(clinic.category, clinic.category_name_ar);
        return `${clinic.name} (${categoryDisplay})`;
    };

    // Format time for display
    const formatTime = (time: string) => {
        try {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return time;
        }
    };

    // Get day name in current language
    const getDayName = (dayEn: string) => {
        const day = weekdays.find(d => d.en === dayEn);
        return isRTL ? day?.ar || dayEn : dayEn;
    };

    return (
        <div className={`doctor-management-container space-y-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`doctor-main-layout flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
                {/* Doctors List */}
                <div className="doctor-list-section w-full lg:w-2/3">
                    <Card>
                        <CardHeader>
                            <div className={`doctor-header-section flex justify-between items-start`}>
                                <div className={`doctor-header-title flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <CardTitle className={isRTL ? 'text-left' : 'text-left'}>
                                        {t('doctorManagement.doctorsManagement')}
                                    </CardTitle>
                                    <CardDescription className={`mt-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                        {t('doctorManagement.description')}
                                    </CardDescription>
                                </div>
                                <div className={`doctor-header-actions flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} flex-shrink-0`}>
                                    <div className="relative w-full md:w-auto">
                                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10`} />
                                        <Input
                                            placeholder={t('doctorManagement.searchDoctors')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`doctor-search-input ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} w-full md:w-[250px]`}
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="doctor-action-buttons flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => loadDoctors()} disabled={isLoading}>
                                            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                                            <span className="hidden sm:inline">{t('common.refresh')}</span>
                                        </Button>
                                        <Button size="sm" onClick={resetDoctorForm}>
                                            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                            <span className="hidden sm:inline">{t('doctorManagement.addDoctor')}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="text-sm text-gray-600 font-medium mt-2"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            >
                                {filteredDoctors.length} {filteredDoctors.length === 1 ? t('doctorManagement.doctor') : t('doctorManagement.doctors')}
                                {searchQuery && ` (${t('doctorManagement.filtered')})`}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredDoctors.map((doctor) => (
                                    <div key={doctor.id} className={`doctor-card flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="doctor-card-info">
                                            <h3 className="font-medium">{doctor.name}</h3>
                                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                            <div className="text-sm text-gray-500">{getClinicNameById(doctor.clinic_id)}</div>
                                            <div className={`doctor-card-status mt-1 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                {isRTL ? (
                                                    <>
                                                        <span className="text-sm font-medium">₪{doctor.price}</span>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${doctor.is_available
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {doctor.is_available ? t('common.available') : t('common.unavailable')}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${doctor.is_available
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {doctor.is_available ? t('common.available') : t('common.unavailable')}
                                                        </span>
                                                        <span className="text-sm font-medium">₪{doctor.price}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`doctor-card-actions flex ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'}`}>
                                            <Button variant="outline" size="sm" onClick={() => handleManageAvailability(doctor.id)}>
                                                <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                {t('doctorManagement.hours')}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEditDoctor(doctor.id)}>
                                                <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                {t('common.edit')}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => confirmDeleteDoctor(doctor)}
                                            >
                                                <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {filteredDoctors.length === 0 && (
                                    <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-left' : ''}`}>
                                        {searchQuery ? t('doctorManagement.noDoctorsFoundSearch') : t('doctorManagement.noDoctorsFound')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Doctor Form */}
                <div className="doctor-form-section w-full lg:w-1/3">
                    <Card>
                        <CardHeader>
                            <CardTitle className={isRTL ? 'text-left' : ''}>
                                {doctorFormMode === "create" ? t('doctorManagement.createNewDoctor') : t('doctorManagement.editDoctor')}
                            </CardTitle>
                            <CardDescription className={isRTL ? 'text-left' : ''}>
                                {doctorFormMode === "create"
                                    ? t('doctorManagement.addNewDoctorDesc')
                                    : t('doctorManagement.modifyDoctorDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDoctorSubmit} id="doctorForm" className="doctor-form space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.doctorName')}
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={doctorFormData.name}
                                        onChange={handleDoctorInputChange}
                                        placeholder={t('doctorManagement.doctorNamePlaceholder')}
                                        required
                                        className=""
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialty" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.specialty')}
                                    </Label>
                                    <Input
                                        id="specialty"
                                        name="specialty"
                                        value={doctorFormData.specialty}
                                        onChange={handleDoctorInputChange}
                                        placeholder={t('doctorManagement.specialtyPlaceholder')}
                                        required
                                        className={isRTL ? 'text-left' : ''}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clinic_id" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.clinic')}
                                    </Label>
                                    <select
                                        id="clinic_id"
                                        name="clinic_id"
                                        value={doctorFormData.clinic_id}
                                        onChange={(e) => handleDoctorClinicChange(e.target.value)}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : ''}`}
                                        required
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    >
                                        <option value="" disabled>{t('doctorManagement.selectClinic')}</option>
                                        {clinics
                                            .filter(clinic => clinic.is_active)
                                            .map(clinic => (
                                                <option key={clinic.id} value={clinic.id}>
                                                    {clinic.name} ({getCategoryDisplayName(clinic.category, clinic.category_name_ar)})
                                                </option>
                                            ))}
                                    </select>
                                    {clinics.length === 0 && (
                                        <p className={`text-sm text-amber-600 ${isRTL ? 'text-left' : ''}`}>
                                            {t('doctorManagement.noClinicsAvailable')}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className={isRTL ? 'text-left block' : ''}>
                                        {t('common.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={doctorFormData.email}
                                        onChange={handleDoctorInputChange}
                                        placeholder={t('doctorManagement.emailPlaceholder')}
                                        required
                                        className={isRTL ? 'text-left' : ''}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className={isRTL ? 'text-left block' : ''}>
                                        {t('common.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={doctorFormData.phone}
                                        onChange={handleDoctorInputChange}
                                        placeholder={isRTL ? "٩٧٠/٩٧٢ + أرقام" : "+970/+972 + digits"} dir={isRTL ? "rtl" : "ltr"}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.appointmentPrice')}
                                    </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min={1}
                                        value={doctorFormData.price.toString()}
                                        onChange={handleDoctorInputChange}
                                        placeholder={t('doctorManagement.pricePlaceholder')}
                                        required
                                        className={isRTL ? 'text-left' : ''}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        {isRTL ? (
                                            <>
                                                <Switch
                                                    id="is_available"
                                                    checked={doctorFormData.is_available}
                                                    onCheckedChange={handleDoctorAvailableChange}
                                                    dir="ltr"
                                                />
                                                <Label htmlFor="is_available" className="text-right">
                                                    {t('doctorManagement.availabilityStatus')}
                                                </Label>
                                            </>
                                        ) : (
                                            <>
                                                <Label htmlFor="is_available" className="text-left">
                                                    {t('doctorManagement.availabilityStatus')}
                                                </Label>
                                                <Switch
                                                    id="is_available"
                                                    checked={doctorFormData.is_available}
                                                    onCheckedChange={handleDoctorAvailableChange}
                                                    dir="ltr"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className={`text-sm text-gray-500 ${isRTL ? 'text-left' : ''}`}>
                                        {doctorFormData.is_available
                                            ? t('doctorManagement.doctorAvailable')
                                            : t('doctorManagement.doctorUnavailable')}
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className={`doctor-form-footer flex justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {doctorFormMode === "edit" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetDoctorForm}
                                >
                                    {t('common.cancel')}
                                </Button>
                            )}
                            <Button
                                type="submit"
                                form="doctorForm"
                                className={doctorFormMode === "edit" ? "" : "w-full"}
                                disabled={isLoading || clinics.length === 0 || isTranslating}
                            >
                                {isLoading || isTranslating
                                    ? (isTranslating ? 'Translating...' : t('doctorManagement.saving'))
                                    : doctorFormMode === "create"
                                        ? t('doctorManagement.createDoctor')
                                        : t('doctorManagement.updateDoctor')
                                }
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Availability Dialog */}
            <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                <DialogContent className={`doctor-availability-dialog max-w-3xl ${isRTL ? 'rtl [&>button]:left-4 [&>button]:right-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className={isRTL ? 'text-left' : ''}>
                        <DialogTitle>{t('doctorManagement.manageAvailability')}</DialogTitle>
                        <DialogDescription>
                            {t('doctorManagement.setAvailableHours', { name: selectedDoctorName })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Current availability slots */}
                        <div>
                            <h3 className={`text-lg font-medium mb-3 ${isRTL ? 'text-left' : ''}`}>
                                {t('doctorManagement.currentAvailability')}
                            </h3>
                            {availabilitySlots.length > 0 ? (
                                <div className="space-y-4">
                                    {weekdays.map(weekday => {
                                        const daySlots = availabilitySlots.filter(slot => slot.day === weekday.en);
                                        if (daySlots.length === 0) return null;

                                        return (
                                            <div key={weekday.en} className="doctor-day-slots border rounded-md p-4">
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-left' : ''}`}>
                                                    {isRTL ? weekday.ar : weekday.en}
                                                </h4>
                                                <div className="space-y-2">
                                                    {daySlots.map(slot => (
                                                        <div key={slot.id} className={`doctor-slot-item flex items-center justify-between bg-gray-50 p-2 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                            <span>
                                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSlotToDelete(slot);
                                                                    setShowSlotDeleteDialog(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`text-center py-4 border rounded-md bg-gray-50 ${isRTL ? 'text-left' : ''}`}>
                                    <p className="text-gray-500">{t('doctorManagement.noAvailabilitySlots')}</p>
                                </div>
                            )}
                        </div>

                        {/* Add new slot */}
                        <div className="border-t pt-4">
                            <h3 className={`text-lg font-medium mb-3 ${isRTL ? 'text-left' : ''}`}>
                                {t('doctorManagement.addNewSlot')}
                            </h3>
                            <div className="doctor-availability-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="day" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.day')}
                                    </Label>
                                    <select
                                        id="day"
                                        name="day"
                                        value={newSlot.day}
                                        onChange={handleNewSlotChange}
                                        className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : ''}`}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    >
                                        {weekdays.map(weekday => (
                                            <option key={weekday.en} value={weekday.en}>
                                                {isRTL ? weekday.ar : weekday.en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="start_time" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.startTime')}
                                    </Label>
                                    <Input
                                        id="start_time"
                                        name="start_time"
                                        type="time"
                                        value={newSlot.start_time}
                                        onChange={handleNewSlotChange}
                                        className="mt-1"
                                        dir="ltr"
                                        min="08:00"
                                        max="20:00"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="end_time" className={isRTL ? 'text-left block' : ''}>
                                        {t('doctorManagement.endTime')}
                                    </Label>
                                    <Input
                                        id="end_time"
                                        name="end_time"
                                        type="time"
                                        value={newSlot.end_time}
                                        onChange={handleNewSlotChange}
                                        className="mt-1"
                                        dir="ltr"
                                        min="08:00"
                                        max="20:00"
                                    />
                                </div>
                            </div>

                            <div className="doctor-availability-actions mt-4">
                                <Button
                                    onClick={handleAddAvailabilitySlot}
                                    disabled={isLoading || !newSlot.day || !newSlot.start_time || !newSlot.end_time}
                                >
                                    {isLoading ? t('doctorManagement.adding') : t('doctorManagement.addTimeSlot')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                        <DialogClose asChild>
                            <Button>{t('doctorManagement.done')}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className={`doctor-delete-dialog sm:max-w-md ${isRTL ? 'rtl [&>button]:left-4 [&>button]:right-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                        <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            {t('doctorManagement.confirmDeletion')}
                        </DialogTitle>
                        <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {t('doctorManagement.confirmDeleteDoctor', {
                                name: isRTL && doctorToDelete?.name_ar ? doctorToDelete.name_ar : doctorToDelete?.name
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className={`doctor-delete-footer gap-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                        <DialogClose asChild>
                            <Button variant="outline" className={isRTL ? 'order-2' : ''}>{t('common.cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteDoctor}
                            disabled={isLoading}
                            className={isRTL ? 'order-1' : ''}
                        >
                            {isLoading ? t('doctorManagement.deleting') : t('doctorManagement.deleteDoctor')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Slot Deletion */}
            <Dialog open={showSlotDeleteDialog} onOpenChange={setShowSlotDeleteDialog}>
                <DialogContent className={isRTL ? 'rtl [&>button]:left-4 [&>button]:right-auto' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className={isRTL ? 'text-right' : ''}>
                        <DialogTitle className={isRTL ? 'text-right' : ''}>
                            {t('doctorManagement.confirmSlotDeletionTitle')}
                        </DialogTitle>
                        <DialogDescription className={isRTL ? 'text-right' : ''}>
                            {t('doctorManagement.confirmSlotDeletionDesc', {
                                day: slotToDelete ? getDayName(slotToDelete.day) : '',
                                start: slotToDelete ? formatTime(slotToDelete.start_time) : '',
                                end: slotToDelete ? formatTime(slotToDelete.end_time) : ''
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (slotToDelete) {
                                    await handleDeleteAvailabilitySlot(slotToDelete.id);
                                    setShowSlotDeleteDialog(false);
                                    setSlotToDelete(null);
                                    toast({
                                        title: t('doctorManagement.slotDeletedTitle'),
                                        description: t('doctorManagement.slotDeletedDesc'),
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            {t('doctorManagement.deleteSlot')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DoctorManagement;