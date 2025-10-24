import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Trash2,
    Edit3,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PatientAppointment {
    id: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    doctor_name: string;
    clinic_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    payment_status: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
    booking_status: string;
    created_at: string;
    updated_at: string;
    source?: 'appointments' | 'payment_bookings'; // Track which table it came from
}

interface PatientDashboardProps {
    patientEmail: string;
}

interface AppointmentData {
    id: string;
    date?: string;
    appointment_day?: string;
    time?: string;
    appointment_time?: string;
    price?: number;
    payment_status?: string;
    status?: string;
    created_at: string;
    updated_at: string;
}

interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day: string;
    start_time: string;
    end_time: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientEmail }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [doctorAvailability, setDoctorAvailability] = useState<AvailabilitySlot[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Load patient appointments
    const loadAppointments = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No valid session found');
                return;
            }

            // For now, focus on payment_bookings table only since it has all the necessary fields
            // and is where new appointments are created
            const appointmentsData: AppointmentData[] = []; // Skip appointments table for now to avoid complexity

            // Also fetch from payment_bookings for pending payments
            // Query by both patient_id and patient_email to ensure we get all bookings
            const { data: paymentBookingsData, error: paymentBookingsError } = await supabase
                .from('payment_bookings')
                .select('*')
                .or(`patient_id.eq.${session.user.id},patient_email.eq.${patientEmail}`)
                .order('created_at', { ascending: false });

            if (paymentBookingsError) {
                console.error('Error fetching payment bookings:', paymentBookingsError);
            }

            // Normalize appointments from both tables to PatientAppointment format
            // For now, we're only using payment_bookings table
            const normalizedAppointments = (appointmentsData || []).map(apt => ({
                id: apt.id,
                patient_name: 'Unknown Patient',
                patient_email: patientEmail,
                patient_phone: '',
                doctor_name: 'Unknown Doctor',
                clinic_name: 'Unknown Clinic',
                specialty: '',
                appointment_day: apt.date || apt.appointment_day || '',
                appointment_time: apt.time || apt.appointment_time || '',
                price: apt.price || 0,
                payment_status: (apt.payment_status === 'paid' ? 'paid' : 'pending') as 'pending' | 'paid' | 'completed' | 'failed' | 'refunded',
                booking_status: apt.status || 'scheduled',
                created_at: apt.created_at,
                updated_at: apt.updated_at,
                source: 'appointments' as const
            }));

            const normalizedPaymentBookings = (paymentBookingsData || []).map(pb => ({
                id: pb.id,
                patient_name: pb.patient_name || 'Unknown Patient',
                patient_email: pb.patient_email,
                patient_phone: pb.patient_phone || '',
                doctor_name: pb.doctor_name || 'Unknown Doctor',
                clinic_name: pb.clinic_name || 'Unknown Clinic',
                specialty: pb.specialty || '',
                appointment_day: pb.appointment_day,
                appointment_time: pb.appointment_time,
                price: pb.price || 0,
                payment_status: (pb.payment_status === 'paid' ? 'paid' : 'pending') as 'pending' | 'paid' | 'completed' | 'failed' | 'refunded',
                booking_status: pb.booking_status || 'pending',
                created_at: pb.created_at,
                updated_at: pb.updated_at,
                source: 'payment_bookings' as const
            }));

            // Combine and deduplicate appointments
            const allAppointments = [...normalizedAppointments, ...normalizedPaymentBookings];

            // Remove duplicates - prioritize appointments table over payment_bookings
            const uniqueAppointments = allAppointments.reduce((acc, current) => {
                const existingIndex = acc.findIndex(appt =>
                    appt.patient_email === current.patient_email &&
                    appt.appointment_day === current.appointment_day &&
                    appt.appointment_time === current.appointment_time
                );

                if (existingIndex === -1) {
                    // No duplicate found, add it
                    acc.push(current);
                } else {
                    // Duplicate found, keep the one from appointments table if available
                    if (current.source === 'appointments' && acc[existingIndex].source === 'payment_bookings') {
                        acc[existingIndex] = current;
                        console.log(`🔄 Replaced payment booking ${acc[existingIndex].id} with appointment ${current.id}`);
                    }
                }

                return acc;
            }, [] as PatientAppointment[]);

            console.log(`🔄 Loaded ${appointmentsData?.length || 0} appointments + ${paymentBookingsData?.length || 0} payment bookings = ${uniqueAppointments.length} unique appointments`);

            setAppointments(uniqueAppointments || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحميل المواعيد' : 'Error loading appointments',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [patientEmail, isRTL, toast]);

    // Load appointments on mount
    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Refresh appointments when window regains focus (e.g., returning from payment page)
    useEffect(() => {
        const handleFocus = () => {
            console.log('🔄 Window focused - refreshing appointments');
            loadAppointments();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [loadAppointments]);

    // Log appointment change
    const logAppointmentChange = async (
        appointment: PatientAppointment,
        actionType: 'reschedule' | 'cancel' | 'delete',
        newDate?: string,
        newTime?: string
    ) => {
        try {
            const logData = {
                patient_id: appointment.id,
                patient_name: appointment.patient_name,
                patient_email: appointment.patient_email,
                original_appointment_id: appointment.id,
                action_type: actionType,
                original_date: appointment.appointment_day,
                original_time: appointment.appointment_time,
                new_date: newDate || null,
                new_time: newTime || null,
                original_doctor_name: appointment.doctor_name,
                original_clinic_name: appointment.clinic_name,
                reason: reason || null,
                admin_notified: false
            };

            const { error } = await supabase
                .from('appointment_change_logs')
                .insert(logData);

            if (error) {
                console.error('Error logging appointment change:', error);
                // Don't throw error here, just log it
            }
        } catch (error) {
            console.error('Error logging appointment change:', error);
        }
    };

    // Cancel appointment
    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            setIsProcessing(true);

            // Log the cancellation
            await logAppointmentChange(selectedAppointment, 'cancel');

            let error: unknown = null;

            // Delete from the appropriate table based on source
            if (selectedAppointment.source === 'appointments') {
                // Delete from appointments table
                const { error: appointmentError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('id', selectedAppointment.id);
                error = appointmentError;
                console.log('🗑️ Deleted appointment from appointments table:', selectedAppointment.id);
            } else {
                // Delete from payment_bookings table (default or source === 'payment_bookings')
                const { error: bookingError } = await supabase
                    .from('payment_bookings')
                    .delete()
                    .eq('id', selectedAppointment.id);
                error = bookingError;
                console.log('🗑️ Deleted appointment from payment_bookings table:', selectedAppointment.id);
            }

            if (error) {
                console.error('Error deleting appointment:', error);
                throw error;
            }

            toast({
                title: isRTL ? 'تم إلغاء الموعد' : 'Appointment Cancelled',
                description: isRTL ? 'تم إلغاء الموعد بنجاح' : 'Appointment cancelled successfully',
                style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
            });

            setShowCancelDialog(false);
            setSelectedAppointment(null);
            setReason('');
            loadAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في إلغاء الموعد' : 'Error cancelling appointment',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Load doctor availability
    const loadDoctorAvailability = async (doctorName: string) => {
        try {
            setIsLoadingAvailability(true);

            // Get doctor ID from doctor name
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('id')
                .eq('name', doctorName)
                .single();

            if (doctorError || !doctorData) {
                console.error('Error finding doctor:', doctorError);
                return;
            }

            // Load doctor's availability
            const { data: availabilityData, error: availabilityError } = await supabase
                .from('doctor_availability')
                .select('*')
                .eq('doctor_id', doctorData.id)
                .order('day', { ascending: true })
                .order('start_time', { ascending: true });

            if (availabilityError) {
                console.error('Error loading availability:', availabilityError);
                return;
            }

            setDoctorAvailability(availabilityData || []);
        } catch (error) {
            console.error('Error loading doctor availability:', error);
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    // Helper function to get day names
    const getDayNames = () => {
        return [
            { key: 'Monday', label: isRTL ? 'الإثنين' : 'Mon' },
            { key: 'Tuesday', label: isRTL ? 'الثلاثاء' : 'Tue' },
            { key: 'Wednesday', label: isRTL ? 'الأربعاء' : 'Wed' },
            { key: 'Thursday', label: isRTL ? 'الخميس' : 'Thu' },
            { key: 'Friday', label: isRTL ? 'الجمعة' : 'Fri' },
            { key: 'Saturday', label: isRTL ? 'السبت' : 'Sat' },
            { key: 'Sunday', label: isRTL ? 'الأحد' : 'Sun' }
        ];
    };

    // Get available time slots for selected day
    const getAvailableTimeSlots = () => {
        if (!selectedDay) return [];
        return doctorAvailability
            .filter(slot => slot.day === selectedDay)
            .map(slot => `${slot.start_time}-${slot.end_time}`);
    };

    // Reschedule appointment
    const handleRescheduleAppointment = async () => {
        if (!selectedAppointment || !selectedDay || !selectedTimeSlot) return;

        try {
            setIsProcessing(true);

            // Extract start time from the selected time slot (format: "HH:MM-HH:MM")
            const startTime = selectedTimeSlot.split('-')[0];

            // Calculate the new date based on selected day
            const today = new Date();
            const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const currentDayIndex = daysOfWeek.indexOf(currentDay);
            const targetDayIndex = daysOfWeek.indexOf(selectedDay);

            let daysUntilTarget = targetDayIndex - currentDayIndex;
            if (daysUntilTarget <= 0) {
                daysUntilTarget += 7; // Move to next week
            }

            const newDate = new Date(today);
            newDate.setDate(today.getDate() + daysUntilTarget);
            const newDateString = newDate.toISOString().split('T')[0];

            // Log the reschedule
            await logAppointmentChange(selectedAppointment, 'reschedule', newDateString, startTime);

            let error: unknown = null;

            // Update in the appropriate table based on source
            if (selectedAppointment.source === 'appointments') {
                // Update in appointments table
                const { error: appointmentError } = await supabase
                    .from('appointments')
                    .update({
                        date: newDateString,
                        time: startTime,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedAppointment.id);
                error = appointmentError;
                console.log('📝 Updated appointment in appointments table:', selectedAppointment.id);
            } else {
                // Update in payment_bookings table (default or source === 'payment_bookings')
                const { error: bookingError } = await supabase
                    .from('payment_bookings')
                    .update({
                        appointment_day: newDateString,
                        appointment_time: selectedTimeSlot,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedAppointment.id);
                error = bookingError;
                console.log('📝 Updated appointment in payment_bookings table:', selectedAppointment.id);
            }

            if (error) {
                console.error('Error updating appointment:', error);
                throw error;
            }

            toast({
                title: isRTL ? 'تم تغيير الموعد' : 'Appointment Rescheduled',
                description: isRTL ? 'تم تغيير الموعد بنجاح' : 'Appointment rescheduled successfully',
                style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
            });

            setShowRescheduleDialog(false);
            setSelectedAppointment(null);
            setSelectedDay('');
            setSelectedTimeSlot('');
            setNewDate('');
            setNewTime('');
            setReason('');
            setDoctorAvailability([]);
            loadAppointments();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تغيير الموعد' : 'Error rescheduling appointment',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    if (isLoading) {
        return (
            <Card dir={isRTL ? 'rtl' : 'ltr'}>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <User className="h-5 w-5" />
                        {isRTL ? 'لوحة المريض' : 'Patient Dashboard'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <User className="h-5 w-5" />
                        {isRTL ? 'لوحة المريض' : 'Patient Dashboard'}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadAppointments}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {appointments.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {isRTL ? 'لا توجد مواعيد مسجلة' : 'No appointments found'}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(appointment.payment_status)}
                                            <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                                            <Badge variant={getStatusBadgeVariant(appointment.payment_status)}>
                                                {isRTL ?
                                                    (appointment.payment_status === 'paid' ? 'مدفوع' :
                                                        appointment.payment_status === 'pending' ? 'قيد الانتظار' :
                                                            appointment.payment_status === 'failed' ? 'فاشل' : appointment.payment_status) :
                                                    appointment.payment_status
                                                }
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {appointment.appointment_day} at {appointment.appointment_time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Dr. {appointment.doctor_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {appointment.clinic_name}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <div>📧 {appointment.patient_email}</div>
                                            <div>📞 {appointment.patient_phone}</div>
                                            <div>💰 ₪{appointment.price}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Dialog open={showRescheduleDialog && selectedAppointment?.id === appointment.id} onOpenChange={setShowRescheduleDialog}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAppointment(appointment);
                                                        loadDoctorAvailability(appointment.doctor_name);
                                                    }}
                                                    disabled={appointment.payment_status === 'paid'}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                    {isRTL ? 'تغيير الموعد' : 'Reschedule'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                                                    <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                                                        {isRTL ? 'تغيير الموعد' : 'Reschedule Appointment'}
                                                    </DialogTitle>
                                                    <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                                                        {isRTL ? 'اختر اليوم والوقت من أوقات الطبيب المتاحة' : 'Select day and time from doctor\'s available hours'}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4">
                                                    {isLoadingAvailability ? (
                                                        <div className="text-center py-4">
                                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                            <p className="text-sm text-gray-500">{isRTL ? 'جاري تحميل الأوقات المتاحة...' : 'Loading available times...'}</p>
                                                        </div>
                                                    ) : doctorAvailability.length === 0 ? (
                                                        <Alert>
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                {isRTL ? 'لا توجد أوقات متاحة لهذا الطبيب' : 'No available times for this doctor'}
                                                            </AlertDescription>
                                                        </Alert>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label>{isRTL ? 'اختر اليوم' : 'Select Day'}</Label>
                                                                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                                                                    {getDayNames().map(day => {
                                                                        const hasSlots = doctorAvailability.some(slot => slot.day === day.key);
                                                                        return (
                                                                            <Button
                                                                                key={day.key}
                                                                                type="button"
                                                                                variant={selectedDay === day.key ? 'default' : 'outline'}
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setSelectedDay(day.key);
                                                                                    setSelectedTimeSlot('');
                                                                                }}
                                                                                disabled={!hasSlots}
                                                                                className="text-xs"
                                                                            >
                                                                                {day.label}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {selectedDay && (
                                                                <div className="space-y-2">
                                                                    <Label>{isRTL ? 'اختر الوقت' : 'Select Time'}</Label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {getAvailableTimeSlots().length === 0 ? (
                                                                            <div className="col-span-2 text-center py-3 text-yellow-600 bg-yellow-50 rounded-md">
                                                                                {isRTL ? 'لا توجد أوقات متاحة لهذا اليوم' : 'No available times for this day'}
                                                                            </div>
                                                                        ) : (
                                                                            getAvailableTimeSlots().map(slot => (
                                                                                <Button
                                                                                    key={slot}
                                                                                    type="button"
                                                                                    variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                                                                                    size="sm"
                                                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                                                    className="text-xs"
                                                                                >
                                                                                    {slot}
                                                                                </Button>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label>{isRTL ? 'السبب (اختياري)' : 'Reason (Optional)'}</Label>
                                                        <Input
                                                            type="text"
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                            placeholder={isRTL ? 'أدخل سبب تغيير الموعد' : 'Enter reason for rescheduling'}
                                                        />
                                                    </div>

                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowRescheduleDialog(false);
                                                                setSelectedAppointment(null);
                                                                setSelectedDay('');
                                                                setSelectedTimeSlot('');
                                                                setNewDate('');
                                                                setNewTime('');
                                                                setReason('');
                                                                setDoctorAvailability([]);
                                                            }}
                                                        >
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                        </Button>
                                                        <Button
                                                            onClick={handleRescheduleAppointment}
                                                            disabled={!selectedDay || !selectedTimeSlot || isProcessing}
                                                        >
                                                            {isProcessing ? (
                                                                <>
                                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                    {isRTL ? 'جاري التحديث...' : 'Updating...'}
                                                                </>
                                                            ) : (
                                                                isRTL ? 'تحديث الموعد' : 'Update Appointment'
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setShowCancelDialog(true);
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            {isRTL ? 'إلغاء الموعد' : 'Cancel Appointment'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                        <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'تأكيد إلغاء الموعد' : 'Confirm Cancel Appointment'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'هل أنت متأكد من إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to cancel this appointment? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {selectedAppointment && (
                        <div className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="space-y-2">
                                <p><strong>{isRTL ? 'الموعد' : 'Appointment'}:</strong> {selectedAppointment.appointment_day} at {selectedAppointment.appointment_time}</p>
                                <p><strong>{isRTL ? 'الطبيب' : 'Doctor'}:</strong> Dr. {selectedAppointment.doctor_name}</p>
                                <p><strong>{isRTL ? 'العيادة' : 'Clinic'}:</strong> {selectedAppointment.clinic_name}</p>
                                <p><strong>{isRTL ? 'المبلغ' : 'Amount'}:</strong> ₪{selectedAppointment.price}</p>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="gap-4">
                        <AlertDialogCancel className="mr-4">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelAppointment}
                            className="bg-red-600 hover:bg-red-700 ml-4"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    {isRTL ? 'جاري الإلغاء...' : 'Cancelling...'}
                                </>
                            ) : (
                                isRTL ? 'إلغاء الموعد' : 'Cancel Appointment'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default PatientDashboard;
