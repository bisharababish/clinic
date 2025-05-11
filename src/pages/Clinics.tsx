// pages/Clinics.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
                title: "Error",
                description: "Failed to load clinics. Please try again later.",
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-6">
            {/* Notification Alert */}
            <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertDescription>
                    <span className="font-medium">Important:</span> Reservations are required for all clinic visits. Please book your appointment in advance.
                </AlertDescription>
            </Alert>

            {/* Category Selection */}
            <div className="flex flex-wrap gap-2">
                <Button
                    key="all"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className="min-w-fit"
                >
                    All Clinics
                </Button>

                {categories.map(category => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.name)}
                        className="min-w-fit"
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            {/* Clinics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClinics.map(clinic => (
                    <div
                        key={clinic.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewClinic(clinic)}
                    >
                        <h3 className="text-xl font-bold">{clinic.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mt-1">{clinic.category}</p>
                        <p className="mt-2">{clinic.doctors.length} available doctor{clinic.doctors.length !== 1 ? 's' : ''}</p>
                    </div>
                ))}

                {filteredClinics.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No clinics found for this category.
                    </div>
                )}
            </div>

            {/* Clinic Details Modal */}
            {selectedClinic && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">{selectedClinic.name}</h2>
                            <button
                                onClick={() => setSelectedClinic(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedClinic.description && (
                            <p className="text-gray-600 mt-2">{selectedClinic.description}</p>
                        )}

                        <div className="mt-6 space-y-6">
                            {selectedClinic.doctors.length === 0 ? (
                                <p className="text-center py-4 text-gray-500">No doctors available at this clinic.</p>
                            ) : (
                                selectedClinic.doctors.map(doctor => (
                                    <div
                                        key={doctor.id}
                                        className={`border-b pb-4 ${selectedDoctor?.id === doctor.id ? 'bg-blue-50 border rounded-lg p-4' : ''}`}
                                        onClick={() => handleSelectDoctor(doctor)}
                                    >
                                        <h3 className="text-lg font-semibold">{doctor.name}</h3>
                                        <p className="text-gray-600">{doctor.specialty}</p>
                                        <p className="font-medium mt-2">Fee: ₪{doctor.price}</p>

                                        {selectedDoctor?.id === doctor.id && (
                                            <div className="mt-3">
                                                <h4 className="font-medium mb-2">Available Hours:</h4>
                                                {doctor.availability.length === 0 ? (
                                                    <p className="text-gray-500">No availability set for this doctor.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {/* Group availability by day */}
                                                        {Array.from(new Set(doctor.availability.map(slot => slot.day))).map(day => (
                                                            <div key={day} className="flex flex-wrap gap-2">
                                                                <span className="font-medium">{day}:</span>
                                                                <div className="flex flex-wrap gap-2">
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

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedClinic(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedDoctor || !selectedTime}
                                onClick={handleBookAppointment}
                            >
                                Book Appointment Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clinics;