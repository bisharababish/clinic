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

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
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

    // State for doctors
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [clinics, setClinics] = useState<ClinicInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([]);

    // State for doctor form
    const [doctorFormMode, setDoctorFormMode] = useState<"create" | "edit">("create");
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [doctorFormData, setDoctorFormData] = useState({
        name: "",
        specialty: "",
        clinic_id: "",
        email: "",
        phone: "",
        is_available: true,
        price: 0,
    });

    // State for availability management
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [selectedDoctorForAvailability, setSelectedDoctorForAvailability] = useState<string | null>(null);
    const [selectedDoctorName, setSelectedDoctorName] = useState("");
    const [newSlot, setNewSlot] = useState({
        day: "Monday",
        start_time: "",
        end_time: "",
    });
    const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

    // State for delete confirmation dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<DoctorInfo | null>(null);

    const { toast } = useToast();

    const weekdays = [
        { en: "Monday", ar: t('doctorManagement.monday') },
        { en: "Tuesday", ar: t('doctorManagement.tuesday') },
        { en: "Wednesday", ar: t('doctorManagement.wednesday') },
        { en: "Thursday", ar: t('doctorManagement.thursday') },
        { en: "Friday", ar: t('doctorManagement.friday') },
        { en: "Saturday", ar: t('doctorManagement.saturday') },
        { en: "Sunday", ar: t('doctorManagement.sunday') }
    ];

    // Load doctors and clinics on mount
    useEffect(() => {
        loadClinics();
        loadDoctors();
    }, []);

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

    // Load clinics from database
    const loadClinics = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (error) throw error;

            setClinics(data || []);
        } catch (error) {
            console.error("Error loading clinics:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.loadingClinics'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load doctors from database
    const loadDoctors = async () => {
        try {
            setIsLoading(true);

            // Check if doctors table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('doctors')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_doctors_table');
            }

            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setDoctors(data || []);
            setFilteredDoctors(data || []);
        } catch (error) {
            console.error("Error loading doctors:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.loadingDoctors'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load availability slots for a specific doctor
    const loadAvailabilitySlots = async (doctorId: string) => {
        try {
            setIsLoading(true);

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
        } finally {
            setIsLoading(false);
        }
    };

    // Doctor form handlers
    const handleDoctorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
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
            is_available: true,
            price: 0
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
            setIsLoading(true);

            // First delete all availability slots for this doctor
            const { error: availabilityError } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('doctor_id', doctorToDelete.id);

            if (availabilityError) {
                console.error("Error deleting availability slots:", availabilityError);
                // Continue with doctor deletion even if availability deletion fails
            }

            // Delete the doctor
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', doctorToDelete.id);

            if (error) throw error;

            // Update state
            setDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete.id));
            setFilteredDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete.id));

            toast({
                title: t('common.success'),
                description: t('doctorManagement.doctorDeletedSuccessfully', { name: doctorToDelete.name }),
            });

            // Close the dialog
            setShowDeleteDialog(false);
            setDoctorToDelete(null);
        } catch (error) {
            console.error("Error deleting doctor:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToDeleteDoctor'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validate doctor form
        if (!doctorFormData.name.trim() || !doctorFormData.specialty.trim() || !doctorFormData.clinic_id || !doctorFormData.email.trim()) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.fillAllFields'),
                variant: "destructive",
            });
            return;
        }

        if (isNaN(doctorFormData.price) || doctorFormData.price < 0) {
            toast({
                title: t('doctorManagement.validationError'),
                description: t('doctorManagement.validPrice'),
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            if (doctorFormMode === "create") {
                // Create new doctor
                const { data, error } = await supabase
                    .from('doctors')
                    .insert({
                        name: doctorFormData.name,
                        specialty: doctorFormData.specialty,
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
                    setDoctors(prev => [...prev, data[0]]);
                    setFilteredDoctors(prev => [...prev, data[0]]);
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
                        specialty: doctorFormData.specialty,
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
                    setDoctors(prev => prev.map(d => d.id === selectedDoctor ? data[0] : d));
                    setFilteredDoctors(prev => prev.map(d => d.id === selectedDoctor ? data[0] : d));

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
        } finally {
            setIsLoading(false);
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
            setIsLoading(true);

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
                    start_time: "",
                    end_time: ""
                });

                toast({
                    title: t('common.success'),
                    description: t('doctorManagement.slotAddedSuccessfully'),
                });
            }
        } catch (error) {
            console.error("Error adding availability slot:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToAddSlot'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAvailabilitySlot = async (id: string) => {
        try {
            setIsLoading(true);

            const { error } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));

            toast({
                title: t('common.success'),
                description: t('doctorManagement.slotRemovedSuccessfully'),
            });
        } catch (error) {
            console.error("Error deleting availability slot:", error);
            toast({
                title: t('common.error'),
                description: t('doctorManagement.failedToDeleteSlot'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getClinicNameById = (id: string) => {
        const clinic = clinics.find(c => c.id === id);
        return clinic ? clinic.name : "Unknown Clinic";
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
        <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
                {/* Doctors List */}
                <div className="w-full lg:w-2/3">
                    <Card>
                        <CardHeader>
                            <div className={`flex justify-between items-start`}>
                                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <CardTitle className={isRTL ? 'text-left' : 'text-left'}>
                                        {t('doctorManagement.doctorsManagement')}
                                    </CardTitle>
                                    <CardDescription className={`mt-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                                        {t('doctorManagement.description')}
                                    </CardDescription>
                                </div>
                                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} flex-shrink-0`}>
                                    <div className="relative">
                                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                                        <Input
                                            placeholder={t('doctorManagement.searchDoctors')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`${isRTL ? 'pr-10 pl-3 text-right placeholder:text-right' : 'pl-10 text-left placeholder:text-left'} w-[250px]`}
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                            style={isRTL ? { textAlign: 'right' } : {}}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" onClick={loadDoctors} disabled={isLoading}>
                                        <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                                        {t('common.refresh')}
                                    </Button>
                                    <Button size="sm" onClick={resetDoctorForm}>
                                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('doctorManagement.addDoctor')}
                                    </Button>
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
                                    <div key={doctor.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className={isRTL ? 'text-right' : ''}>
                                            <h3 className="font-medium">{doctor.name}</h3>
                                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                            <div className="text-sm text-gray-500">{getClinicNameById(doctor.clinic_id)}</div>
                                            <div className={`mt-1 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                                        <div className={`flex space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                <div className="w-full lg:w-1/3">
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
                            <form onSubmit={handleDoctorSubmit} id="doctorForm" className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
                                        className={isRTL ? 'text-left' : ''}
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
                                        {clinics.map(clinic => (
                                            <option key={clinic.id} value={clinic.id}>
                                                {clinic.name} ({clinic.category})
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
                                        value={doctorFormData.phone}
                                        onChange={handleDoctorInputChange}
                                        placeholder={isRTL ? "٩٧٠٠٠٠٠٠٠٠٠+" : "+97000000000"} dir={isRTL ? "rtl" : "ltr"}
                                        className={isRTL ? 'text-left' : ''}
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
                        <CardFooter className={`flex justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                                disabled={isLoading || clinics.length === 0}
                            >
                                {isLoading
                                    ? t('doctorManagement.saving')
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
                <DialogContent className="max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
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
                                            <div key={weekday.en} className="border rounded-md p-4">
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-left' : ''}`}>
                                                    {isRTL ? weekday.ar : weekday.en}
                                                </h4>
                                                <div className="space-y-2">
                                                    {daySlots.map(slot => (
                                                        <div key={slot.id} className={`flex items-center justify-between bg-gray-50 p-2 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                            <span>
                                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteAvailabilitySlot(slot.id)}
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
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
                <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className={isRTL ? 'text-left' : ''}>
                        <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            {t('doctorManagement.confirmDeletion')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('doctorManagement.confirmDeleteDoctor', { name: doctorToDelete?.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className={`text-sm text-gray-500 ${isRTL ? 'text-left' : ''}`}>
                            {t('doctorManagement.permanentRemoval')}
                        </p>
                    </div>
                    <DialogFooter className={`sm:justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteDoctor}
                            disabled={isLoading}
                        >
                            {isLoading ? t('doctorManagement.deleting') : t('doctorManagement.deleteDoctor')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default DoctorManagement;