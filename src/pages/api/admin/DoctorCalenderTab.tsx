// pages/api/admin/DoctorCalendarTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
}

const DoctorCalendarTab: React.FC<DoctorCalendarTabProps> = ({
    doctors,
    clinics,
    appointments,
    isLoading
}) => {
    const { t, i18n } = useTranslation();
    const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generate calendar days
    const generateCalendarDays = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevMonth = new Date(currentYear, currentMonth, 0);
            const prevDate = prevMonth.getDate() - (firstDayOfWeek - i - 1);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                fullDate: new Date(currentYear, currentMonth - 1, prevDate)
            });
        }

        // Add days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                date: day,
                isCurrentMonth: true,
                fullDate: new Date(currentYear, currentMonth, day)
            });
        }

        // Add empty cells for days after the last day of the month
        const remainingCells = 42 - days.length; // 6 weeks * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: i,
                isCurrentMonth: false,
                fullDate: new Date(currentYear, currentMonth + 1, i)
            });
        }

        return days;
    };

    // Filter appointments based on selected doctor
    const getFilteredAppointments = () => {
        if (selectedDoctor === 'all') {
            return appointments;
        }
        return appointments.filter(apt => apt.doctor_id === selectedDoctor);
    };

    // Get appointments for a specific date
    const getAppointmentsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return getFilteredAppointments().filter(apt => apt.date === dateStr);
    };

    // Navigate months
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    // Get doctor name by ID
    const getDoctorName = (doctorId: string) => {
        const doctor = doctors.find(d => d.id === doctorId);
        return doctor ? doctor.name : 'Unknown Doctor';
    };

    // Get clinic name by ID
    const getClinicName = (clinicId: string) => {
        const clinic = clinics.find(c => c.id === clinicId);
        return clinic ? clinic.name : 'Unknown Clinic';
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const monthNames = [
        t('admin.january') || 'January', t('admin.february') || 'February', t('admin.march') || 'March', t('admin.april') || 'April', t('admin.may') || 'May', t('admin.june') || 'June',
        t('admin.july') || 'July', t('admin.august') || 'August', t('admin.september') || 'September', t('admin.october') || 'October', t('admin.november') || 'November', t('admin.december') || 'December'
    ];

    const weekDays = i18n.language === 'ar'
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
        ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                            <div className="ml-auto">
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
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-right">{t('admin.doctorCalendar') || 'Doctor Calendar'}</h2>
                            <p className="text-gray-600 mt-1">
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
                            <div>
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
                        {generateCalendarDays().map((day, index) => {
                            const dayAppointments = getAppointmentsForDate(day.fullDate);
                            const isToday = day.fullDate.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={index}
                                    className={`
                    min-h-[80px] p-1 border rounded-lg relative
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    hover:bg-gray-50 transition-colors
                  `}
                                >
                                    <div className={`
                    text-sm font-medium mb-1
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday ? 'text-blue-600' : ''}
                  `}>
                                        {day.date}
                                    </div>

                                    {/* Appointments for this day */}
                                    <div className="space-y-1">
                                        {dayAppointments.slice(0, 2).map(apt => (
                                            <div
                                                key={apt.id}
                                                className={`
                          text-xs p-1 rounded truncate
                          ${getStatusColor(apt.status)}
                        `}
                                                title={`${apt.time} - ${apt.patient_name} ${t('admin.withDoctor')} ${getDoctorName(apt.doctor_id)}`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{apt.time}</span>
                                                </div>
                                                <div className="truncate">{apt.patient_name}</div>
                                            </div>
                                        ))}

                                        {dayAppointments.length > 2 && (
                                            <div className="text-xs text-gray-500 p-1">
                                                +{dayAppointments.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Appointments Summary */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Today's Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <Calendar className="h-5 w-5" />
                                {t('admin.todaysAppointments') || "Today's Appointments"}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const todayAppointments = getAppointmentsForDate(new Date());
                            return todayAppointments.length > 0 ? (
                                <div className="space-y-2">
                                    {todayAppointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium text-sm">{apt.patient_name}</div>
                                                <div className="text-xs text-gray-600">{apt.time}</div>
                                            </div>
                                            <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>
                                                {apt.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-gray-500 text-sm ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                                    {t('admin.noAppointmentsToday') || 'No appointments today'}
                                </p>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Doctor Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <User className="h-5 w-5" />
                                {t('admin.doctorStats') || 'Doctor Statistics'}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.totalDoctors') || 'Total Doctors'}</span>
                                <span className="font-medium">{doctors.length}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.availableDoctors') || 'Available'}</span>
                                <span className="font-medium">{doctors.filter(d => d.isAvailable).length}</span>
                            </div>
                            <div className={`flex ${i18n.language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                                <span className="text-sm text-gray-600">{t('admin.totalAppointments') || 'Total Appointments'}</span>
                                <span className="font-medium">{getFilteredAppointments().length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className={i18n.language === 'ar' ? 'text-right' : ''}>
                    <CardHeader className={i18n.language === 'ar' ? 'text-right' : ''}>
                        <CardTitle className={`text-lg ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                            {t('admin.quickActions') || 'Quick Actions'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={i18n.language === 'ar' ? 'text-right' : ''}>
                        <div className="space-y-2">
                            <Button variant="outline" className={`w-full ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`} size="sm">
                                <Calendar className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {t('admin.scheduleAppointment') || 'Schedule Appointment'}
                            </Button>
                            <Button variant="outline" className={`w-full ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`} size="sm">
                                <User className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {t('admin.manageDoctors') || 'Manage Doctors'}
                            </Button>
                            <Button variant="outline" className={`w-full ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`} size="sm">
                                <MapPin className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {t('admin.viewClinics') || 'View Clinics'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DoctorCalendarTab;