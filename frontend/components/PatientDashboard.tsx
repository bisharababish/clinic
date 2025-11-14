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
    XCircle,
    DollarSign,
    Receipt,
    FileText,
    Activity,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translateMedicalCategory } from '../lib/medicalTranslations';
import { fallbackTranslate } from '../lib/fallbackTranslationService';

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

interface PaymentHistoryItem {
    id: string;
    patient_id?: string;
    patient_email: string;
    patient_name: string;
    doctor_name: string;
    clinic_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time?: string;
    price: number;
    currency?: string;
    payment_status: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
    booking_status: string;
    created_at: string;
    updated_at: string;
    source?: 'appointments' | 'payment_bookings' | 'service_request';
    transactions?: Array<{
        id: string;
        payment_booking_id: string;
        payment_method: string;
        transaction_status: string;
        amount: number;
        created_at: string;
    }>;
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

    // Function to translate clinic names
    const getClinicDisplayName = useCallback((clinicName: string) => {
        // If not RTL, return English name
        if (!isRTL) {
            return clinicName;
        }
        
        // Try to translate using medical translations
        const medicalTranslation = translateMedicalCategory(clinicName.trim(), 'ar');
        if (medicalTranslation !== clinicName.trim()) {
            return medicalTranslation;
        }
        
        // Final fallback: Use fallback translation service
        const fallbackTranslation = fallbackTranslate(clinicName.trim(), 'ar');
        if (fallbackTranslation !== clinicName.trim()) {
            return fallbackTranslation;
        }
        
        // If no translation found, return original
        return clinicName;
    }, [isRTL]);

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
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
    const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
    interface ServiceRequestData {
        id: number;
        patient_email: string;
        patient_name: string;
        doctor_name: string;
        service_type: string;
        service_subtype?: string;
        service_name?: string;
        service_name_ar?: string;
        price?: number;
        currency?: string;
        payment_status?: string;
        status: string;
        payment_booking_id?: string;
        created_at: string;
        updated_at: string;
        notes?: string;
    }
    const [serviceRequests, setServiceRequests] = useState<ServiceRequestData[]>([]);
    const [isLoadingServiceRequests, setIsLoadingServiceRequests] = useState(false);
    
    // Pagination states
    const [serviceRequestsPage, setServiceRequestsPage] = useState(1);
    const [paymentHistoryPage, setPaymentHistoryPage] = useState(1);
    const itemsPerPage = 3; // Show 3 items per page

    // Load patient appointments
    const loadAppointments = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No valid session found');
                return;
            }

            // Load patient's Arabic name for RTL display
            const { data: userInfo } = await supabase
                .from('userinfo')
                .select('arabic_username_a, arabic_username_b, arabic_username_c, arabic_username_d')
                .eq('user_email', patientEmail)
                .single();

            const arabicFullName = userInfo
                ? [userInfo.arabic_username_a, userInfo.arabic_username_b, userInfo.arabic_username_c, userInfo.arabic_username_d]
                    .filter(Boolean)
                    .join(' ')
                : '';

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
                patient_name: (isRTL && arabicFullName) ? arabicFullName : (pb.patient_name || 'Unknown Patient'),
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

    // Load payment history
    const loadPaymentHistory = async () => {
        try {
            setIsLoadingPaymentHistory(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch payment bookings (including service request payments)
            const { data: bookings, error: bookingsError } = await supabase
                .from('payment_bookings')
                .select('*')
                .or(`patient_id.eq.${session.user.id},patient_email.eq.${patientEmail}`)
                .order('created_at', { ascending: false });

            if (bookingsError) {
                console.error('Error fetching payment bookings:', bookingsError);
            }

            // Also fetch service requests that require payment or have been paid
            const { data: serviceRequests, error: serviceRequestsError } = await supabase
                .from('service_requests')
                .select('*')
                .eq('patient_email', patientEmail)
                .in('status', ['payment_required', 'secretary_confirmed', 'in_progress', 'completed'])
                .order('created_at', { ascending: false });

            if (serviceRequestsError) {
                console.error('Error fetching service requests:', serviceRequestsError);
            }
            
            console.log('📊 Payment History - Service Requests Found:', serviceRequests?.length || 0, serviceRequests);

            // Add service request payments to history (show all confirmed services by secretary)
            // Include: secretary_confirmed, payment_required, in_progress, completed
            const serviceRequestPayments: PaymentHistoryItem[] = [];
            if (serviceRequests && serviceRequests.length > 0) {
                // Load pricing info for service requests
                const enrichedRequests = await Promise.all(
                    serviceRequests.map(async (sr) => {
                        let serviceName = '';
                        let serviceNameAr = '';
                        
                        if (sr.service_subtype && sr.service_type) {
                            const { data: pricingData } = await supabase
                                .from('service_pricing')
                                .select('service_name, service_name_ar')
                                .eq('service_type', sr.service_type)
                                .eq('service_subtype', sr.service_subtype)
                                .single();
                            
                            if (pricingData) {
                                serviceName = pricingData.service_name || '';
                                serviceNameAr = pricingData.service_name_ar || '';
                            }
                        }
                        
                        return {
                            ...sr,
                            service_name: serviceName,
                            service_name_ar: serviceNameAr
                        };
                    })
                );
                
                enrichedRequests
                    .filter((sr) => {
                        // Include all services confirmed by secretary (not just pending)
                        return ['secretary_confirmed', 'payment_required', 'in_progress', 'completed'].includes(sr.status);
                    })
                    .forEach((sr) => {
                        // Determine payment status for display
                        // When secretary confirms and requires payment, it means payment is secured/completed
                        let paymentStatus: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded' = 'pending';
                        if (sr.payment_status === 'paid') {
                            paymentStatus = 'paid';
                        } else if (sr.status === 'completed') {
                            paymentStatus = 'completed';
                        } else if (sr.status === 'payment_required') {
                            // Secretary has secured the money, so show as completed
                            paymentStatus = 'completed';
                        } else if (sr.status === 'secretary_confirmed' && (sr.price === 0 || !sr.price)) {
                            paymentStatus = 'completed'; // Free service
                        } else if (sr.status === 'secretary_confirmed') {
                            // Secretary confirmed but payment not yet required/collected, show as pending
                            paymentStatus = 'pending';
                        }
                        
                        // Build service display name
                        const serviceTypeName = sr.service_type === 'xray' ? (isRTL ? 'أشعة إكس' : 'X-Ray') :
                            sr.service_type === 'ultrasound' ? (isRTL ? 'موجات فوق صوتية' : 'Ultrasound') :
                            sr.service_type === 'lab' ? (isRTL ? 'مختبر' : 'Lab') :
                            (isRTL ? 'قياس السمع' : 'Audiometry');
                        
                        const serviceSubtypeName = sr.service_subtype && (isRTL ? (sr.service_name_ar || sr.service_name) : (sr.service_name || sr.service_name_ar))
                            ? ` - ${isRTL ? (sr.service_name_ar || sr.service_name) : (sr.service_name || sr.service_name_ar)}`
                            : '';
                        
                        serviceRequestPayments.push({
                            id: `sr-${sr.id}`,
                            patient_id: session.user.id,
                            patient_email: sr.patient_email,
                            patient_name: sr.patient_name,
                            clinic_name: `${serviceTypeName}${serviceSubtypeName}`,
                            doctor_name: sr.doctor_name,
                            specialty: sr.service_type,
                            appointment_day: sr.created_at?.split('T')[0] || '',
                            appointment_time: '',
                            price: sr.price || 0,
                            currency: sr.currency || 'ILS',
                            payment_status: paymentStatus,
                            booking_status: sr.status,
                            created_at: sr.created_at,
                            updated_at: sr.updated_at,
                            source: 'service_request' as const
                        });
                    });
            }

            // Combine regular bookings with service request payments
            const allBookings = [...(bookings || []), ...serviceRequestPayments];
            
            console.log('📊 Payment History - Total Bookings:', bookings?.length || 0, 'Service Request Payments:', serviceRequestPayments.length, 'Total:', allBookings.length);

            // Sort by created_at descending
            allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Fetch payment transactions for all bookings
            const bookingIds = allBookings.map(b => b.id);
            interface PaymentTransaction {
                id: string;
                payment_booking_id: string;
                payment_method: string;
                transaction_status: string;
                amount: number;
                created_at: string;
            }
            let transactions: PaymentTransaction[] = [];
            if (bookingIds.length > 0) {
                // For service requests, we need to check if they have payment_booking_id
                const serviceRequestIds = serviceRequests?.filter(sr => sr.payment_booking_id).map(sr => sr.payment_booking_id) || [];
                const regularBookingIds = (bookings || []).map(b => b.id);
                const allTransactionIds = [...regularBookingIds, ...serviceRequestIds];

                if (allTransactionIds.length > 0) {
                    const { data: transData, error: transError } = await supabase
                        .from('payment_transactions')
                        .select('*')
                        .in('payment_booking_id', allTransactionIds)
                        .order('created_at', { ascending: false });

                    if (!transError && transData) {
                        transactions = transData as PaymentTransaction[];
                    }
                }
            }

            // Combine bookings with transactions
            const history = allBookings.map(booking => ({
                ...booking,
                transactions: transactions.filter(t => {
                    // For service requests, match by payment_booking_id from the service request
                    if (booking.source === 'service_request') {
                        const sr = serviceRequests?.find(s => s.id === parseInt(booking.id.replace('sr-', '')));
                        return sr?.payment_booking_id && t.payment_booking_id === sr.payment_booking_id;
                    }
                    return t.payment_booking_id === booking.id;
                })
            }));

            setPaymentHistory(history);
        } catch (error) {
            console.error('Error loading payment history:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحميل سجل الدفع' : 'Error loading payment history',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingPaymentHistory(false);
        }
    };


    // Load service requests - memoized
    const loadServiceRequestsMemo = useCallback(async () => {
        try {
            setIsLoadingServiceRequests(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Load service requests
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .eq('patient_email', patientEmail)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading service requests:', error);
                return;
            }

            // Load pricing info for service requests with subtypes using Promise.all for parallel loading
            let enrichedData = data || [];
            if (enrichedData.length > 0) {
                const pricingPromises = enrichedData.map(async (request) => {
                    if (request.service_subtype && request.service_type) {
                        try {
                            const { data: pricingData, error: pricingError } = await supabase
                                .from('service_pricing')
                                .select('service_name, service_name_ar')
                                .eq('service_type', request.service_type)
                                .eq('service_subtype', request.service_subtype)
                                .single();

                            if (!pricingError && pricingData) {
                                request.service_name = pricingData.service_name;
                                request.service_name_ar = pricingData.service_name_ar;
                            }
                        } catch (error) {
                            console.error(`Error loading pricing for ${request.service_type}/${request.service_subtype}:`, error);
                            // Continue even if pricing fails
                        }
                    }
                    return request;
                });

                enrichedData = await Promise.all(pricingPromises);
            }

            setServiceRequests(enrichedData);
        } catch (error) {
            console.error('Error loading service requests:', error);
        } finally {
            setIsLoadingServiceRequests(false);
        }
    }, [patientEmail]);

    // Load appointments on mount
    useEffect(() => {
        loadAppointments();
        loadServiceRequestsMemo();
    }, [loadAppointments, loadServiceRequestsMemo]);

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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                setShowPaymentHistory(!showPaymentHistory);
                                if (!showPaymentHistory) {
                                    await loadPaymentHistory();
                                }
                            }}
                        >
                            <DollarSign className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {isRTL ? 'سجل الدفع' : 'Payment History'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadAppointments}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                            {isRTL ? 'تحديث' : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Payment History Section */}
                {showPaymentHistory && (
                    <div className="mb-6 border-b pb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {isRTL ? 'سجل المدفوعات' : 'Payment History'}
                        </h3>
                        {isLoadingPaymentHistory ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                            </div>
                        ) : paymentHistory.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {isRTL ? 'لا توجد مدفوعات مسجلة' : 'No payment history found'}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {(() => {
                                        // Pagination for payment history
                                        const startIndex = (paymentHistoryPage - 1) * itemsPerPage;
                                        const endIndex = startIndex + itemsPerPage;
                                        const paginatedPaymentHistory = paymentHistory.slice(startIndex, endIndex);
                                        const totalPaymentPages = Math.ceil(paymentHistory.length / itemsPerPage);
                                        
                                        return (
                                            <>
                                                {paginatedPaymentHistory.map((payment) => (
                                    <div key={payment.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="font-semibold">
                                                    {payment.source === 'service_request'
                                                        ? (isRTL
                                                            ? `${getClinicDisplayName(payment.clinic_name)} - ${payment.doctor_name}`
                                                            : `${getClinicDisplayName(payment.clinic_name)} - ${payment.doctor_name}`)
                                                        : `${payment.doctor_name} - ${getClinicDisplayName(payment.clinic_name)}`
                                                    }
                                                </div>
                                                {payment.source === 'service_request' ? (
                                                    <div className="text-sm text-gray-600">
                                                        {isRTL ? 'طلب خدمة' : 'Service Request'} - {getClinicDisplayName(payment.clinic_name)} - {payment.appointment_day}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-600">
                                                        {payment.appointment_day} {payment.appointment_time ? t('common.at') : ''} {payment.appointment_time}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant={payment.payment_status === 'paid' ? 'default' : 'secondary'}>
                                                {isRTL ?
                                                    (payment.payment_status === 'paid' ? 'مدفوع' : payment.payment_status === 'pending' ? 'قيد الانتظار' : payment.payment_status) :
                                                    payment.payment_status
                                                }
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-lg font-bold">
                                                ₪{payment.price || 0} {payment.currency || 'ILS'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ''}
                                            </div>
                                        </div>
                                        {payment.transactions && payment.transactions.length > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="text-sm font-medium mb-2">{isRTL ? 'المعاملات' : 'Transactions'}:</div>
                                                {payment.transactions.map((trans) => (
                                                    <div key={trans.id} className="text-sm text-gray-600">
                                                        {trans.payment_method} - {trans.transaction_status} - ₪{trans.amount}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                                ))}
                                                {totalPaymentPages > 1 && (
                                                    <div className={`flex items-center justify-between mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <div className="text-sm text-gray-500">
                                                            {isRTL 
                                                                ? `عرض ${startIndex + 1}-${Math.min(endIndex, paymentHistory.length)} من ${paymentHistory.length}`
                                                                : `Showing ${startIndex + 1}-${Math.min(endIndex, paymentHistory.length)} of ${paymentHistory.length}`
                                                            }
                                                        </div>
                                                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setPaymentHistoryPage(prev => Math.max(prev - 1, 1))}
                                                                disabled={paymentHistoryPage === 1}
                                                            >
                                                                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                                {isRTL ? 'التالي' : 'Previous'}
                                                            </Button>
                                                            <div className="flex items-center gap-1">
                                                                {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((page) => (
                                                                    <Button
                                                                        key={page}
                                                                        variant={paymentHistoryPage === page ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => setPaymentHistoryPage(page)}
                                                                        className="min-w-[2.5rem]"
                                                                    >
                                                                        {page}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setPaymentHistoryPage(prev => Math.min(prev + 1, totalPaymentPages))}
                                                                disabled={paymentHistoryPage === totalPaymentPages}
                                                            >
                                                                {isRTL ? 'السابق' : 'Next'}
                                                                <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Service Requests Section */}
                {serviceRequests.length > 0 && (
                    <div className="mb-6 border-b pb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {isRTL ? 'طلبات الخدمات' : 'Service Requests'}
                        </h3>
                        <div className="space-y-4">
                            {(() => {
                                // Pagination for service requests
                                const startIndex = (serviceRequestsPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const paginatedServiceRequests = serviceRequests.slice(startIndex, endIndex);
                                const totalServiceRequestsPages = Math.ceil(serviceRequests.length / itemsPerPage);
                                
                                return (
                                    <>
                                        {paginatedServiceRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {isRTL ?
                                                    (request.service_type === 'xray' ? 'أشعة إكس' :
                                                        request.service_type === 'ultrasound' ? 'موجات فوق صوتية' :
                                                            request.service_type === 'lab' ? 'مختبر' : 'قياس السمع')
                                                    : request.service_type.toUpperCase()}
                                                {request.service_subtype && (
                                                    <span className="text-sm font-normal text-gray-600">
                                                        {` - ${isRTL ? request.service_name_ar : request.service_name}`}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {isRTL ? 'الطبيب' : 'Doctor'}: {request.doctor_name}
                                            </div>
                                            {request.notes && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {isRTL ? 'ملاحظات' : 'Notes'}: {request.notes}
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant={
                                            request.status === 'payment_required' ? 'default' : // Show as completed since secretary secured payment
                                                request.status === 'completed' ? 'default' :
                                                    request.status === 'in_progress' ? 'secondary' :
                                                        request.status === 'secretary_confirmed' ? 'default' :
                                                            'outline'
                                        }>
                                            {isRTL ?
                                                (request.status === 'payment_required' ? 'مكتمل' : // Show as completed since payment is secured
                                                    request.status === 'pending' ? 'قيد الانتظار' :
                                                        request.status === 'secretary_confirmed' ? 'مكتمل' :
                                                            request.status === 'in_progress' ? 'قيد المعالجة' :
                                                                request.status === 'completed' ? 'مكتمل' : request.status)
                                                : request.status === 'payment_required' ? 'COMPLETED' : // Show as completed since payment is secured
                                                    request.status === 'secretary_confirmed' ? 'COMPLETED' :
                                                        request.status === 'pending' ? 'PENDING' :
                                                            request.status === 'in_progress' ? 'IN PROGRESS' :
                                                                request.status === 'completed' ? 'COMPLETED' : request.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    {request.price && request.price > 0 && (
                                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-600">{isRTL ? 'السعر' : 'Price'}</div>
                                                <div className="text-lg font-bold">₪{request.price} {request.currency || 'ILS'}</div>
                                            </div>
                                            {/* When payment_required, it means secretary secured payment, so show as paid/completed */}
                                            {(request.status === 'payment_required' || request.status === 'secretary_confirmed' || request.payment_status === 'paid') && (
                                                <Badge variant="default" className="bg-green-500">
                                                    {isRTL ? 'مدفوع' : 'Paid'}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                                        ))}
                                        {totalServiceRequestsPages > 1 && (
                                            <div className={`flex items-center justify-between mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <div className="text-sm text-gray-500">
                                                    {isRTL 
                                                        ? `عرض ${startIndex + 1}-${Math.min(endIndex, serviceRequests.length)} من ${serviceRequests.length}`
                                                        : `Showing ${startIndex + 1}-${Math.min(endIndex, serviceRequests.length)} of ${serviceRequests.length}`
                                                    }
                                                </div>
                                                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setServiceRequestsPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={serviceRequestsPage === 1}
                                                    >
                                                        <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                        {isRTL ? 'التالي' : 'Previous'}
                                                    </Button>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: totalServiceRequestsPages }, (_, i) => i + 1).map((page) => (
                                                            <Button
                                                                key={page}
                                                                variant={serviceRequestsPage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setServiceRequestsPage(page)}
                                                                className="min-w-[2.5rem]"
                                                            >
                                                                {page}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setServiceRequestsPage(prev => Math.min(prev + 1, totalServiceRequestsPages))}
                                                        disabled={serviceRequestsPage === totalServiceRequestsPages}
                                                    >
                                                        {isRTL ? 'السابق' : 'Next'}
                                                        <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

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
                                <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
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
                                                {appointment.appointment_day} {t('common.at')} {appointment.appointment_time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {isRTL ? '' : 'Dr. '} {appointment.doctor_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {getClinicDisplayName(appointment.clinic_name)}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <div>📧 {appointment.patient_email}</div>
                                            <div>📞 {appointment.patient_phone}</div>
                                            <div>💰 ₪{appointment.price}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
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
                                            <DialogContent className={`w-[92vw] sm:w-auto max-w-[92vw] sm:max-w-lg p-4 sm:p-6 max-h-[80vh] overflow-y-auto rounded-md sm:rounded-lg ${isRTL ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}>
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
                                                                                className="text-sm min-h-9"
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
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                                                                    className="text-sm min-h-9"
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

                                                    <div className="flex gap-2 justify-end flex-col sm:flex-row">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full sm:w-auto"
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
                                                            className="w-full sm:w-auto"
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
                <AlertDialogContent className="w-[92vw] sm:w-auto max-w-[92vw] sm:max-w-lg p-4 sm:p-6 rounded-md sm:rounded-lg">
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
                                <p><strong>{isRTL ? 'الموعد' : 'Appointment'}:</strong> {selectedAppointment.appointment_day} {t('common.at')} {selectedAppointment.appointment_time}</p>
                                <p><strong>{isRTL ? 'الطبيب' : 'Doctor'}:</strong> {isRTL ? '' : 'Dr. '}{selectedAppointment.doctor_name}</p>
                                <p><strong>{isRTL ? 'العيادة' : 'Clinic'}:</strong> {getClinicDisplayName(selectedAppointment.clinic_name)}</p>
                                <p><strong>{isRTL ? 'المبلغ' : 'Amount'}:</strong> ₪{selectedAppointment.price}</p>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="gap-2 sm:gap-4 flex-col-reverse sm:flex-row">
                        <AlertDialogCancel className="mr-0 sm:mr-4 w-full sm:w-auto">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelAppointment}
                            className="bg-red-600 hover:bg-red-700 ml-0 sm:ml-4 w-full sm:w-auto"
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
