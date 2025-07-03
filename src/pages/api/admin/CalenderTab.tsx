// pages/api/admin/CalendarTab.tsx
import React from 'react';
import DoctorCalendarTab from './DoctorCalenderTab';

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    email: string;
    phone?: string;
    isAvailable: boolean;
    price: number;
}

interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
}

interface AppointmentInfo {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    doctor_name: string;
    clinic_id: string;
    clinic_name: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    price: number;
}

interface CalendarTabProps {
    appointments: AppointmentInfo[];
    doctors: DoctorInfo[];
    clinics: ClinicInfo[];
    isLoading: boolean;
    t: (key: string) => string;
    i18n: {
        language: string;
        changeLanguage: (lng: string) => void;
    };
    setActiveTab: (tab: string) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({
    appointments,
    doctors,
    clinics,
    isLoading,
    t,
    i18n,
    setActiveTab
}) => {
    return (
        <DoctorCalendarTab
            key={i18n.language}
            doctors={doctors}
            clinics={clinics}
            appointments={appointments}
            isLoading={isLoading}
            setActiveTab={setActiveTab}
        />
    );
};

export default CalendarTab;