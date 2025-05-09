import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";

type Clinic = {
    id: string;
    name: string;
    category: string;
    doctors: Doctor[];
};

type Doctor = {
    id: string;
    name: string;
    specialty: string;
    availableHours: {
        day: string;
        times: string[];
    }[];
    price: number;
};

const Clinics = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedTime, setSelectedTime] = useState("");

    // Sample clinic data
    const clinics: Clinic[] = [
        {
            id: "1",
            name: "Cardiology Center",
            category: "cardiology",
            doctors: [
                {
                    id: "d1",
                    name: "Dr. Smith",
                    specialty: "Cardiologist",
                    availableHours: [
                        { day: "Monday", times: ["8:00-10:00", "14:00-16:00"] },
                        { day: "Wednesday", times: ["9:00-11:00", "15:00-17:00"] },
                    ],
                    price: 150,
                },
                {
                    id: "d2",
                    name: "Dr. Johnson",
                    specialty: "Cardiac Surgeon",
                    availableHours: [
                        { day: "Tuesday", times: ["10:00-12:00"] },
                        { day: "Thursday", times: ["8:00-10:00", "13:00-15:00"] },
                    ],
                    price: 200,
                },
            ],
        },
        {
            id: "2",
            name: "Dental Care",
            category: "dental",
            doctors: [
                {
                    id: "d3",
                    name: "Dr. Williams",
                    specialty: "Dentist",
                    availableHours: [
                        { day: "Monday", times: ["9:00-12:00"] },
                        { day: "Friday", times: ["10:00-13:00", "14:00-17:00"] },
                    ],
                    price: 120,
                },
            ],
        },
        {
            id: "3",
            name: "Neurology Institute",
            category: "neurology",
            doctors: [
                {
                    id: "d4",
                    name: "Dr. Brown",
                    specialty: "Neurologist",
                    availableHours: [
                        { day: "Tuesday", times: ["8:00-11:00"] },
                        { day: "Thursday", times: ["13:00-16:00"] },
                    ],
                    price: 180,
                },
            ],
        },
    ];

    const categories = [
        { id: "all", name: "All Clinics" },
        { id: "cardiology", name: "Cardiologist" },
        { id: "dental", name: "Dental" },
        { id: "neurology", name: "Neurologist" },
        { id: "dermatology", name: "Dermatologist" },
        { id: "orthopedics", name: "Orthopaedist" },
        { id: "mentalhealth", name: "Mental health professional" },
        { id: "pediatrics", name: "Pediatricians" },
        { id: "urology", name: "Urology" },
        { id: "obgyn", name: "Obstetrics and Gynaecology" },
        { id: "physicaltherapy", name: "Physicaltherapy" },
        { id: "gastroenterology", name: "Gastroenterologist" },
        { id: "oncology", name: "Oncologist" },
        { id: "internal", name: "Internist" },
        { id: "psychiatry", name: "Psychiatrist" },
        { id: "nephrology", name: "Nephrologist" },

    ];

    const filteredClinics = selectedCategory === "all"
        ? clinics
        : clinics.filter(clinic => clinic.category === selectedCategory);

    const handleBookAppointment = () => {
        // Find the selected doctor to get their price
        const selectedDoctor = selectedClinic?.doctors.find(doctor =>
            doctor.availableHours.some(day => day.times.includes(selectedTime))
        );

        // Navigate to payment page with appointment details
        navigate("/payment", {
            state: {
                clinicName: selectedClinic?.name,
                doctorName: selectedDoctor?.name,
                appointmentTime: selectedTime,
                price: selectedDoctor?.price
            }
        });
    };

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
                {categories.map(category => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
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
                        onClick={() => setSelectedClinic(clinic)}
                    >
                        <h3 className="text-xl font-bold">{clinic.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mt-1">{clinic.category}</p>
                        <p className="mt-2">{clinic.doctors.length} available doctors</p>
                    </div>
                ))}
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

                        <div className="mt-6 space-y-6">
                            {selectedClinic.doctors.map(doctor => (
                                <div key={doctor.id} className="border-b pb-4">
                                    <h3 className="text-lg font-semibold">{doctor.name}</h3>
                                    <p className="text-gray-600">{doctor.specialty}</p>
                                    <p className="font-medium mt-2">Fee: ₪{doctor.price}</p>

                                    <div className="mt-3">
                                        <h4 className="font-medium mb-2">Available Hours:</h4>
                                        <div className="space-y-2">
                                            {doctor.availableHours.map((day, i) => (
                                                <div key={i} className="flex flex-wrap gap-2">
                                                    <span className="font-medium">{day.day}:</span>
                                                    {day.times.map(time => (
                                                        <Button
                                                            key={time}
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedClinic(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedTime}
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
