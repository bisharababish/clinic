// pages/Clinics.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import "./styles/Clinics.css";

type AvailabilitySlot = {
    id: string;
    day: string;
    start_time: string;
    end_time: string;
};

type Doctor = {
    id: string;
    name: string;
    specialty: string;
    price: number;
    availability: AvailabilitySlot[];
};

type Clinic = {
    id: string;
    name: string;
    category: string;
    description?: string;
    doctors: Doctor[];
};

type Category = {
    id: string;
    name: string;
};

const Clinics = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedDay, setSelectedDay] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Load categories
            const { data: categoryData, error: categoryError } = await supabase
                .from('clinic_categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (categoryError) throw categoryError;
            setCategories(categoryData || []);

            // Load clinics with active status
            const { data: clinicData, error: clinicError } = await supabase
                .from('clinics')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (clinicError) throw clinicError;

            // Load doctors for each clinic
            const clinicsWithDoctors: Clinic[] = [];

            for (const clinic of clinicData || []) {
                const { data: doctorData, error: doctorError } = await supabase
                    .from('doctors')
                    .select('*')
                    .eq('clinic_id', clinic.id)
                    .eq('is_available', true);

                if (doctorError) throw doctorError;

                // For each doctor, load their availability
                const doctorsWithAvailability: Doctor[] = [];

                for (const doctor of doctorData || []) {
                    const { data: availabilityData, error: availabilityError } = await supabase
                        .from('doctor_availability')
                        .select('*')
                        .eq('doctor_id', doctor.id)
                        .order('day', { ascending: true })
                        .order('start_time', { ascending: true });

                    if (availabilityError) throw availabilityError;

                    doctorsWithAvailability.push({
                        id: doctor.id,
                        name: doctor.name,
                        specialty: doctor.specialty,
                        price: doctor.price,
                        availability: availabilityData || []
                    });
                }

                clinicsWithDoctors.push({
                    id: clinic.id,
                    name: clinic.name,
                    category: clinic.category,
                    description: clinic.description,
                    doctors: doctorsWithAvailability
                });
            }

            setClinics(clinicsWithDoctors);
        } catch (error) {
            console.error('Error loading clinic data:', error);
            toast({
                title: t('clinics.errorTitle'),
                description: t('clinics.errorDescription'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClinics = selectedCategory === "all"
        ? clinics
        : clinics.filter(clinic => clinic.category === selectedCategory);

    const handleViewClinic = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        setSelectedDoctor(null);
        setSelectedTime("");
        setSelectedDay("");
    };

    const handleSelectDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setSelectedTime("");
        setSelectedDay("");
    };

    const handleSelectTimeSlot = (day: string, time: string) => {
        setSelectedDay(day);
        setSelectedTime(time);
    };

    const handleBookAppointment = () => {
        if (!selectedClinic || !selectedDoctor || !selectedTime) return;

        // Navigate to payment page with appointment details
        navigate("/payment", {
            state: {
                clinicName: selectedClinic.name,
                doctorName: selectedDoctor.name,
                specialty: selectedDoctor.specialty,
                appointmentDay: selectedDay,
                appointmentTime: selectedTime,
                price: selectedDoctor.price
            }
        });
    };

    // Format time for display (e.g., "09:00" to "9:00 AM")
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

    // Translate day names
    const translateDay = (day: string) => {
        const dayMap: { [key: string]: string } = {
            'Monday': t('clinics.monday'),
            'Tuesday': t('clinics.tuesday'),
            'Wednesday': t('clinics.wednesday'),
            'Thursday': t('clinics.thursday'),
            'Friday': t('clinics.friday'),
            'Saturday': t('clinics.saturday'),
            'Sunday': t('clinics.sunday')
        };
        return dayMap[day] || day;
    };

    if (isLoading) {
        return (
            <div className={`loading-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? "rtl" : "ltr"}>
                <div className="loading-spinner"></div>
                <span className={`loading-text ${isRTL ? 'rtl' : 'ltr'}`}>
                    {t('clinics.loading')}
                </span>
            </div>
        );
    }

    return (
        <div className={`clinics-container ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="clinics-content">
                {/* Notification Alert */}
                <Alert variant="default" className="clinics-alert" dir="rtl">
                    <AlertDescription className="text-left">
                        <span className="font-medium">{t('clinics.importantNotice')}</span> {t('clinics.reservationRequired')}
                    </AlertDescription>
                </Alert>

                {/* Category Selection */}
                <div className={`category-buttons-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? "rtl" : "ltr"}>
                    <Button
                        key="all"
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        onClick={() => setSelectedCategory("all")}
                        className="category-button mobile-button"
                    >
                        {t('clinics.allClinics')}
                    </Button>

                    {categories.map(category => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.name ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category.name)}
                            className="category-button mobile-button"
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Clinics List */}
                <div className="clinics-grid">
                    {filteredClinics.map(clinic => (
                        <div
                            key={clinic.id}
                            className="clinic-card mobile-button"
                            onClick={() => handleViewClinic(clinic)}
                            dir={isRTL ? "rtl" : "ltr"}
                        >
                            <h3 className="clinic-card-title">
                                {clinic.name}
                            </h3>
                            <p className="clinic-card-category">
                                {clinic.category}
                            </p>
                            <p className="clinic-card-doctors">
                                {clinic.doctors.length} {clinic.doctors.length === 1 ? t('clinics.availableDoctor') : t('clinics.availableDoctors')}
                            </p>
                        </div>
                    ))}

                    {filteredClinics.length === 0 && (
                        <div className="no-clinics-message" dir="rtl">
                            {t('clinics.noClinicsFound')}
                        </div>
                    )}
                </div>

                {/* Clinic Details Modal */}
                {selectedClinic && (
                    <div className="modal-overlay">
                        <div className="modal-content" dir={isRTL ? "rtl" : "ltr"}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {selectedClinic.name}
                                </h2>
                                <button
                                    onClick={() => setSelectedClinic(null)}
                                    className={`modal-close-button ${isRTL ? 'rtl' : 'ltr'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            {selectedClinic.description && (
                                <p className={`text-gray-600 mt-2 ${isRTL ? 'text-left' : 'text-left'}`}>
                                    {selectedClinic.description}
                                </p>
                            )}

                            <div className="mt-6 space-y-6">
                                {selectedClinic.doctors.length === 0 ? (
                                    <p className="text-center py-4 text-gray-500">
                                        {t('clinics.noDoctorsAvailable')}
                                    </p>
                                ) : (
                                    selectedClinic.doctors.map(doctor => (
                                        <div
                                            key={doctor.id}
                                            className={`border-b pb-4 cursor-pointer ${selectedDoctor?.id === doctor.id ? 'bg-blue-50 border rounded-lg p-4' : ''}`}
                                            onClick={() => handleSelectDoctor(doctor)}
                                            dir={isRTL ? "rtl" : "ltr"}
                                        >
                                            <h3 className={`text-lg font-semibold ${isRTL ? 'text-left' : 'text-left'}`}>
                                                {doctor.name}
                                            </h3>
                                            <p className={`text-gray-600 ${isRTL ? 'text-left' : 'text-left'}`}>
                                                {doctor.specialty}
                                            </p>
                                            <p className={`font-medium mt-2 ${isRTL ? 'text-left' : 'text-left'}`}>
                                                {t('clinics.fee')}: ₪{doctor.price}
                                            </p>

                                            {selectedDoctor?.id === doctor.id && (
                                                <div className="mt-3">
                                                    <h4 className={`font-medium mb-2 ${isRTL ? 'text-left' : 'text-left'}`}>
                                                        {t('clinics.availableHours')}
                                                    </h4>
                                                    {doctor.availability.length === 0 ? (
                                                        <p className={`text-gray-500 ${isRTL ? 'text-left' : 'text-left'}`}>
                                                            {t('clinics.noAvailabilitySet')}
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {/* Group availability by day */}
                                                            {Array.from(new Set(doctor.availability.map(slot => slot.day))).map(day => (
                                                                <div key={day} className={`flex flex-wrap gap-2 items-center ${isRTL ? 'justify-start' : 'justify-start'}`}>
                                                                    <span className={`font-medium ${isRTL ? 'text-left' : 'text-left'}`}>
                                                                        {translateDay(day)}:
                                                                    </span>
                                                                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                                                                        {doctor.availability
                                                                            .filter(slot => slot.day === day)
                                                                            .map(slot => {
                                                                                const timeDisplay = `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}`;
                                                                                const isSelected = selectedDay === day && selectedTime === timeDisplay;

                                                                                return (
                                                                                    <Button
                                                                                        key={slot.id}
                                                                                        variant={isSelected ? "default" : "outline"}
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleSelectTimeSlot(day, timeDisplay);
                                                                                        }}
                                                                                    >
                                                                                        {timeDisplay}
                                                                                    </Button>
                                                                                );
                                                                            })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={`modal-actions ${isRTL ? 'rtl' : 'ltr'}`}>
                                <Button
                                    disabled={!selectedDoctor || !selectedTime}
                                    onClick={handleBookAppointment}
                                    className="modal-button mobile-button"
                                >
                                    {t('clinics.bookAppointmentNow')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedClinic(null)}
                                    className="modal-button mobile-button"
                                >
                                    {t('clinics.cancel')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default Clinics;