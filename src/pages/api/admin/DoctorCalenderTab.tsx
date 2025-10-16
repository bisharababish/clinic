// pages/api/admin/DoctorCalendarTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin, Plus, Eye, TrendingUp, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    email: string;
    phone?: string;
    isAvailable: boolean;
    price: number;
}

interface Clinic {
    id: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
}

interface Appointment {
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

interface DoctorCalendarTabProps {
    doctors: Doctor[];
    clinics: Clinic[];
    appointments: Appointment[];
    isLoading: boolean;
    setActiveTab: (tab: string) => void;
}

interface DayAppointment {
    date: number;
    isCurrentMonth: boolean;
    fullDate: Date;
    appointments: Appointment[];
}
interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day: string;
    start_time: string;
    end_time: string;
}
// Helper: Check if two time intervals overlap
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string) {
    return (start1 < end2) && (start2 < end1);
}

const DoctorCalendarTab: React.FC<DoctorCalendarTabProps> = ({
    doctors,
    clinics,
    appointments,
    isLoading,
    setActiveTab
}) => {
    const { t, i18n } = useTranslation();
    const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
    const [showDayDialog, setShowDayDialog] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const [doctorAvailability, setDoctorAvailability] = useState<AvailabilitySlot[]>([]);
    const [showOfficeHours, setShowOfficeHours] = useState<boolean>(true);
    const { user } = useAuth();
    const currentUserRole = user?.role?.toLowerCase() || '';

    // 🎨 Clinic Color Mapping System
    const clinicColors = [
        { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
        { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
        { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
        { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
        { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
        { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
        { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
        { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
        { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' }
    ];

    // Function to get color for a clinic
    const getClinicColor = (clinicId: string) => {
        const clinicIndex = clinics.findIndex(clinic => clinic.id === clinicId);
        if (clinicIndex === -1) return clinicColors[0]; // Default to first color
        return clinicColors[clinicIndex % clinicColors.length];
    };

    // Function to translate appointment content for Arabic
    const translateAppointmentContent = (apt: Appointment) => {
        if (i18n.language !== 'ar') return apt;

        // Common clinic name translations
        const clinicTranslations: { [key: string]: string } = {
            'Dentist': 'طبيب أسنان',
            'Cardiology': 'أمراض القلب',
            'Dermatology': 'الأمراض الجلدية',
            'Orthopedics': 'العظام',
            'Pediatrics': 'طب الأطفال',
            'Gynecology': 'النساء والولادة',
            'Ophthalmology': 'العيون',
            'Neurology': 'الأعصاب',
            'Psychiatry': 'الطب النفسي',
            'Emergency': 'الطوارئ',
        };

        return {
            ...apt,
            clinic_name: clinicTranslations[apt.clinic_name] || apt.clinic_name,
            // Keep patient names as they are - they should already be in the correct language
        };
    };
    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const navigate = useNavigate();

    // Memoized filtered appointments based on selected doctor
    const filteredAppointments = useMemo(() => {
        if (selectedDoctor === 'all') {
            return appointments;
        }
        return appointments.filter(apt => apt.doctor_id === selectedDoctor);
    }, [selectedDoctor, appointments]);

    // Memoized today's appointments (all doctors, not filtered)
    const todayAppointments = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === today);
    }, [appointments]);

    // Memoized upcoming appointments (all doctors, not filtered)
    const upcomingAppointments = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return appointments
            .filter(apt => apt.date > today && apt.status === 'scheduled')
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }, [appointments]);
    const loadDoctorAvailability = async () => {
        try {
            const { data, error } = await supabase
                .from('doctor_availability')
                .select('*')
                .order('day', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;
            setDoctorAvailability(data || []);
        } catch (error) {
            console.error("Error loading doctor availability:", error);
        }
    };
    // Memoized doctor statistics
    const doctorStats = useMemo(() => {
        const totalDoctors = doctors.length;
        const availableDoctors = doctors.filter(d => d.isAvailable).length;
        const totalAppointments = filteredAppointments.length;
        const scheduledAppointments = filteredAppointments.filter(apt => apt.status === 'scheduled').length;
        const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length;
        const totalRevenue = filteredAppointments
            .filter(apt => apt.payment_status === 'paid')
            .reduce((sum, apt) => sum + apt.price, 0);

        return {
            totalDoctors,
            availableDoctors,
            totalAppointments,
            scheduledAppointments,
            completedAppointments,
            totalRevenue
        };
    }, [doctors, filteredAppointments]);
    useEffect(() => {
        loadDoctorAvailability();
    }, []);


    const timeSlots = useMemo(() => {
        const slots = new Set<string>();

        doctorAvailability.forEach(avail => {
            if (selectedDoctor === 'all' || avail.doctor_id === selectedDoctor) {
                slots.add(avail.start_time);
            }
        });

        if (slots.size === 0) {
            return ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        }

        return Array.from(slots).sort();
    }, [doctorAvailability, selectedDoctor]);

    useEffect(() => {
        loadDoctorAvailability();
    }, []);

    // 🔍 ADD DEBUG CODE HERE:
    useEffect(() => {
        console.log('🔍 Doctor Availability Data:', doctorAvailability);
        console.log('🔍 Generated Time Slots:', timeSlots);
        console.log('🔍 Selected Doctor:', selectedDoctor);
    }, [doctorAvailability, timeSlots, selectedDoctor]);
    const generateCalendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const days: DayAppointment[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevMonth = new Date(currentYear, currentMonth, 0);
            const prevDate = prevMonth.getDate() - (firstDayOfWeek - i - 1);
            const fullDate = new Date(currentYear, currentMonth - 1, prevDate);
            const dateStr = fullDate.toISOString().split('T')[0];
            const dayAppointments = filteredAppointments.filter(apt => apt.date === dateStr);

            days.push({
                date: prevDate,
                isCurrentMonth: false,
                fullDate,
                appointments: dayAppointments
            });
        }

        // Add days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(currentYear, currentMonth, day);
            const dateStr = fullDate.toISOString().split('T')[0];
            const dayAppointments = filteredAppointments.filter(apt => apt.date === dateStr);

            days.push({
                date: day,
                isCurrentMonth: true,
                fullDate,
                appointments: dayAppointments
            });
        }

        // Add empty cells for days after the last day of the month
        const remainingCells = 42 - days.length; // 6 weeks * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const fullDate = new Date(currentYear, currentMonth + 1, i);
            const dateStr = fullDate.toISOString().split('T')[0];
            const dayAppointments = filteredAppointments.filter(apt => apt.date === dateStr);

            days.push({
                date: i,
                isCurrentMonth: false,
                fullDate,
                appointments: dayAppointments
            });
        }

        return days;
    }, [currentYear, currentMonth, filteredAppointments]);

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Helper functions
    const getDoctorName = (doctorId: string) => {
        const doctor = doctors.find(d => d.id === doctorId);
        return doctor ? doctor.name : 'Unknown Doctor';
    };

    const getClinicName = (clinicId: string) => {
        const clinic = clinics.find(c => c.id === clinicId);
        return clinic ? clinic.name : 'Unknown Clinic';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleDayClick = (day: DayAppointment) => {
        if (day.appointments.length > 0) {
            setSelectedDayAppointments(day.appointments);
            setSelectedDateStr(day.fullDate.toLocaleDateString());
            setShowDayDialog(true);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'schedule':
                // Always open schedule appointment in a new tab
                window.open('/admin/schedule-appointment', '_blank');
                break;
            case 'doctors':
                // Open doctors management in a new tab
                window.open('/admin/doctors', '_blank');
                break;
            case 'clinics':
                // Open clinics page in a new tab
                window.open('/clinics', '_blank');
                break;
            case 'appointments':
                // Switch to appointments tab
                setActiveTab('appointments');
                break;
            default:
                break;
        }
    };

    // Month and day names with proper i18n
    const monthNames = React.useMemo(() => [
        t('admin.january') || 'January', t('admin.february') || 'February', t('admin.march') || 'March',
        t('admin.april') || 'April', t('admin.may') || 'May', t('admin.june') || 'June',
        t('admin.july') || 'July', t('admin.august') || 'August', t('admin.september') || 'September',
        t('admin.october') || 'October', t('admin.november') || 'November', t('admin.december') || 'December'
    ], [i18n.language]);

    const weekDays = React.useMemo(() => i18n.language === 'ar'
        ? [
            t('admin.saturday') || 'السبت',
            t('admin.sunday') || 'الأحد',
            t('admin.monday') || 'الاثنين',
            t('admin.tuesday') || 'الثلاثاء',
            t('admin.wednesday') || 'الأربعاء',
            t('admin.thursday') || 'الخميس',
            t('admin.friday') || 'الجمعة',
        ]
        : [
            t('admin.sunday') || 'Sun',
            t('admin.monday') || 'Mon',
            t('admin.tuesday') || 'Tue',
            t('admin.wednesday') || 'Wed',
            t('admin.thursday') || 'Thu',
            t('admin.friday') || 'Fri',
            t('admin.saturday') || 'Sat',
        ], [i18n.language]);



    // For Arabic, reverse the time slots
    const displayTimeSlots = i18n.language === 'ar' ? [...timeSlots].reverse() : timeSlots;
    // Helper to format time in Arabic
    function formatTimeArabic(time) {
        // Convert to Arabic numerals and add صباحًا/مساءً
        const [h, m] = time.split(":");
        const hour = parseInt(h, 10);
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠', '٢١', '٢٢', '٢٣', '٢٤'];
        const arabicHour = arabicNumbers[hour];
        const arabicMinute = m === '00' ? '' : ':' + arabicNumbers[parseInt(m, 10)];
        const isAM = hour < 12;
        return arabicHour + arabicMinute + (isAM ? ' صباحًا' : ' مساءً');
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">{t('admin.loadingCalendar') || 'Loading calendar...'}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                {i18n.language === 'ar' ? (
                    <>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={goToToday}>
                                <Calendar className="h-4 w-4 ml-2" />
                                {t('admin.today') || 'Today'}
                            </Button>
                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder={t('admin.selectDoctor') || 'Select Doctor'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('admin.allDoctors') || 'All Doctors'}</SelectItem>
                                    {doctors.map(doctor => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.name} - {doctor.specialty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-right">{t('admin.doctorCalendar') || 'Doctor Calendar'}</h2>
                            <p className="text-gray-600 mt-1 text-right">
                                {t('admin.manageAppointmentSchedules') || 'Manage appointment schedules for all doctors'}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <h2 className="text-2xl font-bold">{t('admin.doctorCalendar') || 'Doctor Calendar'}</h2>
                            <p className="text-gray-600 mt-1">
                                {t('admin.manageAppointmentSchedules') || 'Manage appointment schedules for all doctors'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder={t('admin.selectDoctor') || 'Select Doctor'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('admin.allDoctors') || 'All Doctors'}</SelectItem>
                                    {doctors.map(doctor => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.name} - {doctor.specialty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={goToToday}>
                                <Calendar className="h-4 w-4 mr-2" />
                                {t('admin.today') || 'Today'}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Calendar Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <CardTitle className="text-xl">
                            {monthNames[currentMonth]} {currentYear}
                        </CardTitle>

                        <Button variant="outline" size="sm" onClick={goToNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Calendar Grid */}
                    <div className={`grid grid-cols-7 gap-1 mb-4`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {generateCalendarDays.map((day, index) => {
                            const isToday = day.fullDate.toDateString() === new Date().toDateString();
                            // --- CONFLICT DETECTION ---
                            // For each appointment, check if any other appointment in the same clinic overlaps in time
                            let hasConflict = false;
                            for (let i = 0; i < day.appointments.length; i++) {
                                const apt1 = day.appointments[i];
                                // Try to find another appointment in the same clinic with overlapping time
                                for (let j = 0; j < day.appointments.length; j++) {
                                    if (i === j) continue;
                                    const apt2 = day.appointments[j];
                                    if (apt1.clinic_id === apt2.clinic_id) {
                                        // Assume time is start, try to find slot duration from all appointments
                                        const start1 = apt1.time;
                                        const end1 = apt1.time; // No end time, treat as point
                                        const start2 = apt2.time;
                                        const end2 = apt2.time;
                                        if (start1 === start2) {
                                            hasConflict = true;
                                            break;
                                        }
                                        // If you have slot info, you can use isTimeOverlap(start1, end1, start2, end2)
                                    }
                                }
                                if (hasConflict) break;
                            }
                            // --- END CONFLICT DETECTION ---
                            return (
                                <div
                                    key={index}
                                    className={`
                                        min-h-[100px] p-1 border rounded-lg relative cursor-pointer transition-all duration-200
                                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                                        ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                        ${hasConflict ? 'border-red-500 bg-red-50' : ''}
                                        ${day.appointments.length > 0 ? 'hover:bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                                        ${!day.isCurrentMonth ? 'opacity-60' : ''}
                                    `}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <div className={`
                                        text-sm font-medium mb-1
                                        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                        ${isToday ? 'text-blue-600 font-bold' : ''}
                                    `}>
                                        {day.date}
                                    </div>

                                    {/* Appointments for this day */}
                                    <div className="space-y-1">
                                        {day.appointments.slice(0, 3).map(apt => {
                                            const clinicColor = getClinicColor(apt.clinic_id);
                                            return (
                                                <div
                                                    key={apt.id}
                                                    className={`
                                                        text-xs p-1 rounded border truncate
                                                        ${clinicColor.bg} ${clinicColor.text} ${clinicColor.border}
                                                        hover:shadow-sm transition-shadow
                                                    `}
                                                    title={`${formatTime(apt.time)} - ${apt.patient_name} with Dr. ${apt.doctor_name || getDoctorName(apt.doctor_id)}`}
                                                >
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Clock className="h-2 w-2" />
                                                        <span className="font-medium">{formatTime(apt.time)}</span>
                                                    </div>
                                                    <div className="truncate font-medium">{apt.patient_name}</div>
                                                    <div className="truncate text-xs opacity-75">
                                                        Dr. {apt.doctor_name || getDoctorName(apt.doctor_id)}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {day.appointments.length > 3 && (
                                            <div className="text-xs text-blue-600 p-1 font-medium bg-blue-50 rounded border border-blue-200">
                                                +{day.appointments.length - 3} {t('admin.more') || 'more'}
                                            </div>
                                        )}

                                        {day.appointments.length === 0 && day.isCurrentMonth && (
                                            <div className="text-xs text-gray-400 p-1 text-center opacity-50">
                                                {t('admin.noAppointments') || 'No appointments'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Calendar */}
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Weekly Calendar</CardTitle>
                        {/* Admin Office Hours Toggle */}
                        {(currentUserRole === 'admin' || currentUserRole === 'administrator') && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium" htmlFor="office-hours-toggle">
                                    {t('admin.showOfficeHours') || 'Show Office Hours'}
                                </label>
                                <input
                                    id="office-hours-toggle"
                                    type="checkbox"
                                    checked={showOfficeHours}
                                    onChange={(e) => setShowOfficeHours(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Weekly calendar grid */}
                    {(() => {
                        // Calculate start of week (Sunday)
                        const weekStart = new Date(currentDate);
                        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                        // Build days of week
                        const weekDaysArr = Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(weekStart);
                            d.setDate(weekStart.getDate() + i);
                            return d;
                        });

                        // Filter time slots based on showOfficeHours setting
                        const filteredTimeSlots = showOfficeHours ? timeSlots : [];
                        const displayTimeSlots = i18n.language === 'ar' ? [...filteredTimeSlots].reverse() : filteredTimeSlots;
                        // Helper to format time in Arabic
                        function formatTimeArabic(time) {
                            // Convert to Arabic numerals and add صباحًا/مساءً
                            const [h, m] = time.split(":");
                            const hour = parseInt(h, 10);
                            const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠', '٢١', '٢٢', '٢٣', '٢٤'];
                            const arabicHour = arabicNumbers[hour];
                            const arabicMinute = m === '00' ? '' : ':' + arabicNumbers[parseInt(m, 10)];
                            const isAM = hour < 12;
                            return arabicHour + arabicMinute + (isAM ? ' صباحًا' : ' مساءً');
                        }
                        // Day names (no dates)
                        const dayNames = i18n.language === 'ar'
                            ? [
                                t('admin.sunday') || 'الأحد',
                                t('admin.monday') || 'الاثنين',
                                t('admin.tuesday') || 'الثلاثاء',
                                t('admin.wednesday') || 'الأربعاء',
                                t('admin.thursday') || 'الخميس',
                                t('admin.friday') || 'الجمعة',
                                t('admin.saturday') || 'السبت',
                            ]
                            : [
                                t('admin.sunday') || 'Sun',
                                t('admin.monday') || 'Mon',
                                t('admin.tuesday') || 'Tue',
                                t('admin.wednesday') || 'Wed',
                                t('admin.thursday') || 'Thu',
                                t('admin.friday') || 'Fri',
                                t('admin.saturday') || 'Sat',
                            ];
                        return (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border text-xs" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                                    <thead>
                                        <tr>
                                            {i18n.language === 'ar' ? (
                                                <>
                                                    <th className="border p-2 bg-gray-50" style={{ minWidth: '90px' }}>{t('admin.day') || 'اليوم'}</th>
                                                    {displayTimeSlots.map(slot => (
                                                        <th key={slot} className="border p-2 bg-gray-50">{formatTimeArabic(slot)}</th>
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    <th className="border p-2 bg-gray-50" style={{ minWidth: '90px' }}>Day</th>
                                                    {displayTimeSlots.map(slot => (
                                                        <th key={slot} className="border p-2 bg-gray-50">{slot}</th>
                                                    ))}
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weekDaysArr.map((d, dayIdx) => {
                                            const dateStr = d.toISOString().split('T')[0];
                                            // For Arabic, reverse the day index
                                            const displayDayIdx = i18n.language === 'ar' ? 6 - dayIdx : dayIdx;
                                            return (
                                                <tr key={dayIdx}>
                                                    {i18n.language === 'ar' ? (
                                                        <>
                                                            <td className="border p-2 font-bold bg-gray-50 text-lg" style={{ fontWeight: 'bold', fontSize: '1.25em' }}>{dayNames[displayDayIdx]}</td>
                                                            {displayTimeSlots.map((slot, slotIdx) => {
                                                                const cellApts = filteredAppointments.filter(apt => {
                                                                    if (apt.date !== dateStr) return false;
                                                                    if (!(selectedDoctor === 'all' || apt.doctor_id === selectedDoctor)) return false;

                                                                    // If office hours are hidden, show all appointments regardless of availability
                                                                    if (!showOfficeHours) {
                                                                        return apt.time === slot;
                                                                    }

                                                                    // Check if appointment matches availability slot
                                                                    return doctorAvailability.some(avail => {
                                                                        return avail.doctor_id === apt.doctor_id &&
                                                                            avail.start_time === apt.time;
                                                                    });
                                                                }); let hasConflict = false;
                                                                for (let i = 0; i < cellApts.length; i++) {
                                                                    for (let j = 0; j < cellApts.length; j++) {
                                                                        if (i !== j && cellApts[i].clinic_id === cellApts[j].clinic_id) {
                                                                            hasConflict = true;
                                                                            break;
                                                                        }
                                                                    }
                                                                    if (hasConflict) break;
                                                                }
                                                                return (
                                                                    <td key={slotIdx} className={`border p-2 min-w-[100px] ${hasConflict ? 'bg-red-100 border-red-500 relative' : ''}`}>
                                                                        {cellApts.length > 0 ? cellApts.map(apt => {
                                                                            const translatedApt = translateAppointmentContent(apt);
                                                                            const clinicColor = getClinicColor(apt.clinic_id);
                                                                            return (
                                                                                <div key={apt.id} className={`${clinicColor.bg} ${clinicColor.text} ${clinicColor.border} rounded px-1 mb-1 truncate border`}>
                                                                                    <div className="font-medium text-xs" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>{translatedApt.patient_name}</div>
                                                                                    <div className="text-xs opacity-80">{translatedApt.time}</div>
                                                                                    <div className="text-xs opacity-70 truncate" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>{translatedApt.clinic_name}</div>
                                                                                </div>
                                                                            );
                                                                        }) : <span className="text-gray-300">-</span>}
                                                                        {hasConflict && (
                                                                            <span className="absolute top-1 right-1 text-xs text-red-600" title="Conflict: Multiple appointments for the same clinic at this time">⚠️</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="border p-2 font-bold bg-gray-50 text-lg" style={{ fontWeight: 'bold', fontSize: '1.25em' }}>{dayNames[displayDayIdx]}</td>
                                                            {displayTimeSlots.map((slot, slotIdx) => {
                                                                const cellApts = filteredAppointments.filter(apt => {
                                                                    if (apt.date !== dateStr) return false;
                                                                    if (!(selectedDoctor === 'all' || apt.doctor_id === selectedDoctor)) return false;

                                                                    // If office hours are hidden, show all appointments regardless of availability
                                                                    if (!showOfficeHours) {
                                                                        return apt.time === slot;
                                                                    }

                                                                    // Check if appointment matches availability slot
                                                                    return doctorAvailability.some(avail => {
                                                                        return avail.doctor_id === apt.doctor_id &&
                                                                            avail.start_time === apt.time;
                                                                    });
                                                                }); let hasConflict = false;
                                                                for (let i = 0; i < cellApts.length; i++) {
                                                                    for (let j = 0; j < cellApts.length; j++) {
                                                                        if (i !== j && cellApts[i].clinic_id === cellApts[j].clinic_id) {
                                                                            hasConflict = true;
                                                                            break;
                                                                        }
                                                                    }
                                                                    if (hasConflict) break;
                                                                }
                                                                return (
                                                                    <td key={slotIdx} className={`border p-2 min-w-[100px] ${hasConflict ? 'bg-red-100 border-red-500 relative' : ''}`}>
                                                                        {cellApts.length > 0 ? cellApts.map(apt => {
                                                                            const translatedApt = translateAppointmentContent(apt);
                                                                            const clinicColor = getClinicColor(apt.clinic_id);
                                                                            return (
                                                                                <div key={apt.id} className={`${clinicColor.bg} ${clinicColor.text} ${clinicColor.border} rounded px-1 mb-1 truncate border`}>
                                                                                    <div className="font-medium text-xs" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>{translatedApt.patient_name}</div>
                                                                                    <div className="text-xs opacity-80">{translatedApt.time}</div>
                                                                                    <div className="text-xs opacity-70 truncate" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>{translatedApt.clinic_name}</div>
                                                                                </div>
                                                                            );
                                                                        }) : <span className="text-gray-300">-</span>}
                                                                        {hasConflict && (
                                                                            <span className="absolute top-1 right-1 text-xs text-red-600" title="Conflict: Multiple appointments for the same clinic at this time">⚠️</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Today's Appointments */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <Calendar className="h-5 w-5 text-blue-600" />
                                {t('admin.todaysAppointments') || "Today's Appointments"}
                            </div>
                        </CardTitle>
                        <div className={`text-2xl font-bold text-blue-600 ${i18n.language === 'ar' ? 'text-right' : ''}`}
                            style={i18n.language === 'ar' ? { direction: 'rtl' } : {}}>
                            {i18n.language === 'ar' ? <><span>{todayAppointments.length}</span></> : <>{todayAppointments.length}</>}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {todayAppointments.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {todayAppointments.slice(0, 4).map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <div>
                                            <div className="font-medium text-sm">{apt.patient_name}</div>
                                            <div className="text-xs text-gray-600">
                                                {formatTime(apt.time)} • Dr. {apt.doctor_name || getDoctorName(apt.doctor_id)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                                                {apt.status}
                                            </Badge>
                                            <Badge variant="outline" className={`text-xs ${getPaymentStatusColor(apt.payment_status)}`}>
                                                {apt.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {todayAppointments.length > 4 && (
                                    <div className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleQuickAction('appointments')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {t('admin.viewAll') || 'View All'} ({todayAppointments.length})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className={`text-gray-500 text-sm text-center py-4 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                                {t('admin.noAppointmentsToday') || 'No appointments scheduled for today'}
                            </p>
                        )}
                    </CardContent>
                </Card>
                {/* Upcoming Appointments */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <Calendar className="h-5 w-5 text-orange-600" />
                                {t('admin.upcomingAppointments') || 'Upcoming Appointments'}
                            </div>
                        </CardTitle>
                        <div className={`text-2xl font-bold text-orange-600 ${i18n.language === 'ar' ? 'text-right' : ''}`}
                            style={i18n.language === 'ar' ? { direction: 'rtl' } : {}}>
                            {i18n.language === 'ar' ? <><span>{upcomingAppointments.length}</span></> : <>{upcomingAppointments.length}</>}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {upcomingAppointments.slice(0, 4).map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <div>
                                            <div className="font-medium text-sm">{apt.patient_name}</div>
                                            <div className="text-xs text-gray-600">
                                                {formatTime(apt.time)} • Dr. {apt.doctor_name || getDoctorName(apt.doctor_id)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="default" className="text-xs">
                                                {apt.status}
                                            </Badge>
                                            <Badge variant="outline" className={`text-xs ${getPaymentStatusColor(apt.payment_status)}`}>
                                                {apt.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {upcomingAppointments.length > 4 && (
                                    <div className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleQuickAction('appointments')}
                                            className="text-orange-600 hover:text-orange-800"
                                        >
                                            {t('admin.viewAll') || 'View All'} ({upcomingAppointments.length})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className={`text-gray-500 text-sm text-center py-4 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                                {t('admin.noUpcomingAppointments') || 'No upcoming appointments'}
                            </p>
                        )}
                    </CardContent>
                </Card>
                {/* Doctor Statistics */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <User className="h-5 w-5 text-green-600" />
                                {t('admin.doctorStats') || 'Doctor Statistics'}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.totalDoctors') || 'Total Doctors'}</span>
                                <span className="font-bold text-lg text-green-600">{doctorStats.totalDoctors}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.availableDoctors') || 'Available'}</span>
                                <span className="font-medium text-green-500">{doctorStats.availableDoctors}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.totalAppointments') || 'Total Appointments'}</span>
                                <span className="font-medium">{doctorStats.totalAppointments}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.scheduled') || 'Scheduled'}</span>
                                <span className="font-medium text-blue-600">{doctorStats.scheduledAppointments}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.completed') || 'Completed'}</span>
                                <span className="font-medium text-green-600">{doctorStats.completedAppointments}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'} pt-2 border-t`}>
                                <span className="text-sm text-gray-600">{t('admin.totalRevenue') || 'Total Revenue'}</span>
                                <span className="font-bold text-green-600">{formatCurrency(doctorStats.totalRevenue)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Quick Actions - center in column 2, same width as other cards */}
                <div className="md:col-start-2 md:col-span-1 flex justify-center mt-2">
                    <Card className={`w-full hover:shadow-md transition-shadow ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                        <CardHeader className={`pb-3 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                            <CardTitle className={`text-lg ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                                <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}
                                    style={i18n.language === 'ar' ? { direction: 'rtl', textAlign: 'right', width: '100%', justifyContent: 'flex-end' } : {}}>
                                    <Activity className="h-5 w-5 text-purple-600" />
                                    {t('admin.quickActions') || 'Quick Actions'}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={`pt-0 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                            <div className="space-y-2">
                                {/* Only show Manage Doctors if user is not secretary */}
                                {currentUserRole !== 'secretary' && (
                                    <Button
                                        variant="outline"
                                        className={`w-full ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'} hover:bg-green-50 hover:border-green-300`}
                                        size="sm"
                                        onClick={() => handleQuickAction('doctors')}
                                    >
                                        <User className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'} text-green-600`} />
                                        {t('admin.manageDoctors') || 'Manage Doctors'}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className={`w-full ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'} hover:bg-purple-50 hover:border-purple-300`}
                                    size="sm"
                                    onClick={() => handleQuickAction('clinics')}
                                >
                                    <MapPin className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'} text-purple-600`} />
                                    {t('admin.viewClinics') || 'View Clinics'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DoctorCalendarTab;