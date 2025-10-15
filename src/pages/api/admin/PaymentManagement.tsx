// pages/api/admin/PaymentManagement.tsx - Comprehensive Payment Management System
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdminState } from "@/hooks/useAdminState";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    Calendar,
    User,
    FileText,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    Banknote
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// Enhanced interfaces for comprehensive payment tracking
interface PaymentTransaction {
    id: string;
    payment_booking_id: string;
    payment_method: 'cash' | 'credit_card' | 'paypal';
    amount: number;
    currency: string;
    transaction_status: 'pending' | 'completed' | 'failed' | 'refunded';
    transaction_id?: string;
    gateway_response?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface PaymentBooking {
    id: string;
    patient_id: string;
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    currency: string;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    booking_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    confirmation_number?: string;
    created_at: string;
    updated_at: string;
    // Related payment transaction
    payment_transaction?: PaymentTransaction;
    // For bulk delete functionality
    isBulkDelete?: boolean;
    pendingCount?: number;
}

interface PaymentStats {
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
    todayRevenue: number;
    monthlyRevenue: number;
    averagePayment: number;
}

const PaymentManagement: React.FC = () => {
    const { t, i18n, ready } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();
    const { user } = useAuth();
    const { isLoading, loadAppointments } = useAdminState();

    // Debug logging
    console.log('PaymentManagement Debug:', {
        language: i18n.language,
        isRTL: isRTL,
        ready: ready,
        totalRevenueTranslation: t('paymentManagement.totalRevenue'),
        pendingPaymentsTranslation: t('paymentManagement.pendingPayments')
    });

    // Create a safe translation function with fallbacks
    const safeT = (key: string, fallback?: string) => {
        if (!ready) return fallback || key;
        const translation = t(key);
        // If translation returns the key itself, it means translation failed
        if (translation === key) {
            console.warn(`Translation failed for key: ${key}, using fallback: ${fallback}`);
            return fallback || key;
        }
        return translation;
    };

    // Force re-render when language changes
    useEffect(() => {
        console.log('Language changed to:', i18n.language);
    }, [i18n.language]);

    // Helper function to translate payment status
    const translatePaymentStatus = (status: string) => {
        if (isRTL) {
            switch (status) {
                case 'pending': return 'معلق';
                case 'completed': return 'مكتمل';
                case 'paid': return 'مدفوع';
                case 'failed': return 'فشل';
                case 'refunded': return 'مسترد';
                default: return status;
            }
        } else {
            return status;
        }
    };

    // State management
    const [payments, setPayments] = useState<PaymentBooking[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentBooking[]>([]);
    const [stats, setStats] = useState<PaymentStats>({
        totalRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        averagePayment: 0
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [selectedPayment, setSelectedPayment] = useState<PaymentBooking | null>(null);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<PaymentBooking | null>(null);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);

    // Load payment data
    const loadPayments = async () => {
        try {
            setIsLoadingPayments(true);
            setPaymentsError(null);

            // First, check if user is authenticated
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                console.error('No valid session found:', sessionError);
                setPaymentsError('Authentication required to view payments');
                toast({
                    title: isRTL ? 'خطأ' : 'Error',
                    description: 'Authentication required to view payments',
                    variant: "destructive",
                });
                return;
            }

            // Fetch payment bookings with patient information
            const { data: bookings, error: bookingsError } = await supabase
                .from('payment_bookings')
                .select(`
                    *,
                    payment_transactions (*)
                `)
                .order('created_at', { ascending: false });

            if (bookingsError) {
                console.error('Error fetching payment bookings:', bookingsError);
                throw bookingsError;
            }


            // If no bookings found, set empty arrays and return
            if (!bookings || bookings.length === 0) {
                setPayments([]);
                setFilteredPayments([]);
                calculateStats([]);
                return;
            }

            // Use patient information directly from payment_bookings table
            const paymentsWithPatientInfo = bookings.map((booking: Record<string, unknown>) => {
                // Debug: Log patient information
                console.log('🔍 Payment Booking Debug:', {
                    bookingId: booking.id,
                    patientId: booking.patient_id,
                    storedPatientName: booking.patient_name,
                    storedPatientEmail: booking.patient_email,
                    storedPatientPhone: booking.patient_phone,
                    storedUniqueId: booking.unique_patient_id
                });

                return {
                    ...booking,
                    // Use stored patient information directly from payment_bookings
                    patient_name: (booking.patient_name as string) || 'Unknown Patient',
                    patient_email: (booking.patient_email as string) || '',
                    patient_phone: (booking.patient_phone as string) || '',
                    unique_patient_id: (booking.unique_patient_id as string) || '',
                    payment_transaction: Array.isArray(booking.payment_transactions) ? booking.payment_transactions[0] || null : null
                } as unknown as PaymentBooking;
            });

            setPayments(paymentsWithPatientInfo);
            setFilteredPayments(paymentsWithPatientInfo);
            calculateStats(paymentsWithPatientInfo);
        } catch (error) {
            console.error('Error loading payments:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setPaymentsError(errorMessage);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحميل بيانات المدفوعات' : 'Error loading payment data',
                variant: "destructive",
            });
            // Set empty arrays on error to prevent UI crashes
            setPayments([]);
            setFilteredPayments([]);
            calculateStats([]);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    // Calculate payment statistics
    const calculateStats = (paymentData: PaymentBooking[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats: PaymentStats = {
            totalRevenue: paymentData
                .filter(p => p.payment_status === 'completed')
                .reduce((sum, p) => sum + p.price, 0),
            pendingPayments: paymentData.filter(p => p.payment_status === 'pending').length,
            completedPayments: paymentData.filter(p => p.payment_status === 'completed').length,
            failedPayments: paymentData.filter(p => p.payment_status === 'failed').length,
            todayRevenue: paymentData
                .filter(p => {
                    const paymentDate = new Date(p.created_at);
                    return p.payment_status === 'completed' && paymentDate >= today;
                })
                .reduce((sum, p) => sum + p.price, 0),
            monthlyRevenue: paymentData
                .filter(p => {
                    const paymentDate = new Date(p.created_at);
                    return p.payment_status === 'completed' && paymentDate >= monthStart;
                })
                .reduce((sum, p) => sum + p.price, 0),
            averagePayment: 0
        };

        if (stats.completedPayments > 0) {
            stats.averagePayment = stats.totalRevenue / stats.completedPayments;
        }

        setStats(stats);
    };

    // Filter payments based on search and filters
    useEffect(() => {
        let filtered = payments;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.patient_phone?.includes(searchTerm) ||
                payment.confirmation_number?.includes(searchTerm) ||
                payment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(payment => payment.payment_status === statusFilter);
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date();
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.created_at);
                switch (dateFilter) {
                    case "today":
                        return paymentDate.toDateString() === now.toDateString();
                    case "week": {
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return paymentDate >= weekAgo;
                    }
                    case "month": {
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return paymentDate >= monthAgo;
                    }
                    default:
                        return true;
                }
            });
        }

        setFilteredPayments(filtered);
    }, [payments, searchTerm, statusFilter, dateFilter]);

    // Load data on component mount
    useEffect(() => {
        loadPayments();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Mark payment as completed (for cash payments received at clinic)
    const markPaymentCompleted = async (paymentId: string) => {
        try {
            // First, get the payment booking details
            const { data: paymentBooking, error: fetchError } = await supabase
                .from('payment_bookings')
                .select('*')
                .eq('id', paymentId)
                .single();

            if (fetchError) throw fetchError;

            // Update payment status to paid
            const { error } = await supabase
                .from('payment_bookings')
                .update({
                    payment_status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId);

            if (error) throw error;

            // Also update the payment transaction if it exists
            await supabase
                .from('payment_transactions')
                .update({
                    transaction_status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('payment_booking_id', paymentId);

            // Create appointment in appointments table
            if (paymentBooking) {
                console.log('🔍 Payment booking details:', {
                    clinicName: paymentBooking.clinic_name,
                    doctorName: paymentBooking.doctor_name,
                    appointmentDay: paymentBooking.appointment_day,
                    appointmentTime: paymentBooking.appointment_time
                });

                // Try to find clinic by name (exact match first)
                let clinic = null;
                let clinicError = null;

                const { data: clinicData, error: clinicErr } = await supabase
                    .from('clinics')
                    .select('id, name, name_ar')
                    .eq('name', paymentBooking.clinic_name)
                    .single();

                if (clinicData) {
                    clinic = clinicData;
                } else {
                    // Try Arabic name if English name not found
                    const { data: clinicArData, error: clinicArErr } = await supabase
                        .from('clinics')
                        .select('id, name, name_ar')
                        .eq('name_ar', paymentBooking.clinic_name)
                        .single();

                    if (clinicArData) {
                        clinic = clinicArData;
                    } else {
                        // Try partial match
                        const { data: clinicPartialData, error: clinicPartialErr } = await supabase
                            .from('clinics')
                            .select('id, name, name_ar')
                            .ilike('name', `%${paymentBooking.clinic_name}%`)
                            .single();

                        if (clinicPartialData) {
                            clinic = clinicPartialData;
                        } else {
                            clinicError = clinicErr || clinicArErr || clinicPartialErr;
                        }
                    }
                }

                // Try to find doctor by name (exact match first)
                let doctor = null;
                let doctorError = null;

                const { data: doctorData, error: doctorErr } = await supabase
                    .from('doctors')
                    .select('id, name, name_ar')
                    .eq('name', paymentBooking.doctor_name)
                    .single();

                if (doctorData) {
                    doctor = doctorData;
                } else {
                    // Try Arabic name if English name not found
                    const { data: doctorArData, error: doctorArErr } = await supabase
                        .from('doctors')
                        .select('id, name, name_ar')
                        .eq('name_ar', paymentBooking.doctor_name)
                        .single();

                    if (doctorArData) {
                        doctor = doctorArData;
                    } else {
                        // Try partial match
                        const { data: doctorPartialData, error: doctorPartialErr } = await supabase
                            .from('doctors')
                            .select('id, name, name_ar')
                            .ilike('name', `%${paymentBooking.doctor_name}%`)
                            .single();

                        if (doctorPartialData) {
                            doctor = doctorPartialData;
                        } else {
                            doctorError = doctorErr || doctorArErr || doctorPartialErr;
                        }
                    }
                }

                console.log('🔍 Clinic search result:', { clinic, clinicError });
                console.log('🔍 Doctor search result:', { doctor, doctorError });

                if (clinic && doctor) {
                    console.log('✅ Found clinic and doctor, creating appointment...');

                    // Convert day name to actual date if needed
                    const convertDayNameToDate = (dayName: string): string => {
                        const dayMap: { [key: string]: number } = {
                            'Monday': 1,
                            'Tuesday': 2,
                            'Wednesday': 3,
                            'Thursday': 4,
                            'Friday': 5,
                            'Saturday': 6,
                            'Sunday': 0
                        };

                        // Also handle Arabic day names
                        const arabicDayMap: { [key: string]: number } = {
                            'الاثنين': 1,
                            'الثلاثاء': 2,
                            'الأربعاء': 3,
                            'الخميس': 4,
                            'الجمعة': 5,
                            'السبت': 6,
                            'الأحد': 0
                        };

                        const dayNumber = dayMap[dayName] ?? arabicDayMap[dayName];
                        if (dayNumber !== undefined) {
                            // Find the next occurrence of this day
                            const today = new Date();
                            const currentDay = today.getDay();
                            let daysUntilTarget = (dayNumber - currentDay + 7) % 7;
                            if (daysUntilTarget === 0) daysUntilTarget = 7; // Next week if today is the target day

                            const targetDate = new Date(today);
                            targetDate.setDate(today.getDate() + daysUntilTarget);

                            return targetDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
                        }

                        // If it's already a date string, return as is
                        if (dayName.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            return dayName;
                        }

                        // Fallback: return today's date
                        console.warn(`Could not convert day name "${dayName}" to date, using today's date`);
                        return new Date().toISOString().split('T')[0];
                    };

                    const actualDate = convertDayNameToDate(paymentBooking.appointment_day);
                    console.log(`Converting "${paymentBooking.appointment_day}" to date: "${actualDate}"`);

                    // Create appointment in appointments table
                    const { data: newAppointment, error: appointmentError } = await supabase
                        .from('appointments')
                        .insert({
                            patient_id: paymentBooking.patient_id,
                            doctor_id: doctor.id,
                            clinic_id: clinic.id,
                            date: actualDate, // Use converted date
                            time: paymentBooking.appointment_time,
                            status: 'scheduled',
                            payment_status: 'paid',
                            price: paymentBooking.price,
                            notes: `Payment completed for booking #${paymentBooking.id}`,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (appointmentError) {
                        console.error('❌ Error creating appointment:', appointmentError);
                        toast({
                            title: isRTL ? 'تحذير' : 'Warning',
                            description: isRTL ? 'تم تحديث الدفع ولكن حدث خطأ في إنشاء الموعد' : 'Payment updated but failed to create appointment',
                            variant: "destructive",
                        });
                    } else {
                        console.log('✅ Appointment created successfully:', newAppointment);
                        toast({
                            title: isRTL ? 'تم تحديث حالة الدفع' : 'Payment Marked as Completed',
                            description: isRTL ? 'تم تحديث حالة الدفع وإنشاء الموعد بنجاح' : 'Payment status updated and appointment created successfully',
                        });
                    }
                } else {
                    console.error('❌ Could not find clinic or doctor:', {
                        clinicError,
                        doctorError,
                        searchedClinicName: paymentBooking.clinic_name,
                        searchedDoctorName: paymentBooking.doctor_name
                    });

                    // Let's try to find clinics and doctors with similar names
                    const { data: allClinics } = await supabase
                        .from('clinics')
                        .select('id, name');
                    const { data: allDoctors } = await supabase
                        .from('doctors')
                        .select('id, name');

                    console.log('🔍 Available clinics:', allClinics);
                    console.log('🔍 Available doctors:', allDoctors);

                    toast({
                        title: isRTL ? 'تحذير' : 'Warning',
                        description: isRTL ? `تم تحديث الدفع ولكن لم يتم العثور على العيادة "${paymentBooking.clinic_name}" أو الطبيب "${paymentBooking.doctor_name}"` : `Payment updated but could not find clinic "${paymentBooking.clinic_name}" or doctor "${paymentBooking.doctor_name}"`,
                        variant: "destructive",
                    });
                }
            }

            loadPayments(); // Refresh payment data

            // Also refresh appointments data to show the new appointment
            if (loadAppointments) {
                await loadAppointments(true); // Force refresh
            }

            setShowMarkPaidDialog(false);
        } catch (error) {
            console.error('Error marking payment as completed:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحديث حالة الدفع' : 'Error marking payment as completed',
                variant: "destructive",
            });
        }
    };

    // Delete payment booking
    const deletePayment = async (paymentId: string, isBulkDelete: boolean = false) => {
        try {
            if (isBulkDelete) {
                // Delete all pending payments
                const pendingPayments = payments.filter(p => p.payment_status === 'pending');
                const pendingIds = pendingPayments.map(p => p.id);

                // First delete related payment transactions
                await supabase
                    .from('payment_transactions')
                    .delete()
                    .in('payment_booking_id', pendingIds);

                // Then delete the payment bookings
                const { error } = await supabase
                    .from('payment_bookings')
                    .delete()
                    .in('id', pendingIds);

                if (error) throw error;

                toast({
                    title: isRTL ? 'تم حذف جميع المدفوعات المعلقة' : 'All Pending Payments Deleted',
                    description: isRTL ? `تم حذف ${pendingPayments.length} مدفوع معلق بنجاح` : `${pendingPayments.length} pending payments deleted successfully`,
                });
            } else {
                // Delete single payment
                // First delete related payment transactions
                await supabase
                    .from('payment_transactions')
                    .delete()
                    .eq('payment_booking_id', paymentId);

                // Then delete the payment booking
                const { error } = await supabase
                    .from('payment_bookings')
                    .delete()
                    .eq('id', paymentId);

                if (error) throw error;

                toast({
                    title: isRTL ? 'تم حذف الدفع' : 'Payment Deleted',
                    description: isRTL ? 'تم حذف الدفع بنجاح' : 'Payment deleted successfully',
                });
            }

            loadPayments(); // Refresh data
            setShowDeleteDialog(false);
            setPaymentToDelete(null);
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في حذف الدفع' : 'Error deleting payment',
                variant: "destructive",
            });
        }
    };

    // Export payments data
    const exportPayments = () => {
        const csvContent = [
            // CSV Header
            [
                isRTL ? 'رقم التأكيد' : 'Confirmation #',
                isRTL ? 'اسم المريض' : 'Patient Name',
                isRTL ? 'بريد المريض الإلكتروني' : 'Patient Email',
                isRTL ? 'هاتف المريض' : 'Patient Phone',
                isRTL ? 'اسم العيادة' : 'Clinic Name',
                isRTL ? 'اسم الطبيب' : 'Doctor Name',
                isRTL ? 'التخصص' : 'Specialty',
                isRTL ? 'تاريخ الموعد' : 'Appointment Date',
                isRTL ? 'وقت الموعد' : 'Appointment Time',
                isRTL ? 'المبلغ' : 'Amount',
                isRTL ? 'حالة الدفع' : 'Payment Status',
                isRTL ? 'حالة الحجز' : 'Booking Status',
                isRTL ? 'طريقة الدفع' : 'Payment Method',
                isRTL ? 'تاريخ الإنشاء' : 'Created At'
            ].join(','),
            // CSV Data
            ...filteredPayments.map(payment => [
                payment.confirmation_number || '',
                payment.patient_name || '',
                payment.patient_email || '',
                payment.patient_phone || '',
                payment.clinic_name,
                payment.doctor_name,
                payment.specialty,
                payment.appointment_day,
                payment.appointment_time,
                payment.price,
                payment.payment_status,
                payment.booking_status,
                payment.payment_transaction?.payment_method || 'cash',
                new Date(payment.created_at).toLocaleString()
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            case 'refunded': return 'outline';
            default: return 'secondary';
        }
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': return <Banknote className="h-4 w-4" />;
            case 'credit_card': return <CreditCard className="h-4 w-4" />;
            default: return <CreditCard className="h-4 w-4" />;
        }
    };


    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Payment Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₪{stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {isRTL ? 'من المدفوعات المكتملة' : 'From completed payments'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? 'المدفوعات المعلقة' : 'Pending Payments'}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                        <p className="text-xs text-muted-foreground">
                            {isRTL ? 'بانتظار الدفع' : 'Awaiting payment'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? 'إيرادات اليوم' : 'Today\'s Revenue'}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₪{stats.todayRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {isRTL ? 'اليوم فقط' : 'Today only'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? 'متوسط الدفع' : 'Average Payment'}
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₪{stats.averagePayment.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {isRTL ? 'لكل موعد' : 'Per appointment'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Filter className="h-5 w-5" />
                        {isRTL ? 'الفلاتر' : 'Filters'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                            <Label>{isRTL ? 'البحث' : 'Search'}</Label>
                            <div className="relative">
                                <Search className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-2.5 h-4 w-4 text-muted-foreground`} />
                                <Input
                                    placeholder={isRTL ? 'البحث في المدفوعات...' : 'Search payments...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`${isRTL ? 'pr-8' : 'pl-8'}`}
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{isRTL ? 'حالة الدفع' : 'Payment Status'}</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                                    <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                                    <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                                    <SelectItem value="failed">{isRTL ? 'فشل' : 'Failed'}</SelectItem>
                                    <SelectItem value="refunded">{isRTL ? 'مسترد' : 'Refunded'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{isRTL ? 'نطاق التاريخ' : 'Date Range'}</Label>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isRTL ? 'جميع التواريخ' : 'All Dates'}</SelectItem>
                                    <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                                    <SelectItem value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                                    <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>{isRTL ? 'الإجراءات' : 'Actions'}</Label>
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={exportPayments} variant="outline" size="sm">
                                    <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {isRTL ? 'تصدير' : 'Export'}
                                </Button>
                                <Button onClick={loadPayments} variant="outline" size="sm">
                                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {isRTL ? 'تحديث' : 'Refresh'}
                                </Button>
                                {stats.pendingPayments > 0 && (
                                    <Button
                                        onClick={() => {
                                            const pendingPayments = payments.filter(p => p.payment_status === 'pending');
                                            if (pendingPayments.length > 0) {
                                                const bulkDeletePayment: PaymentBooking = {
                                                    ...pendingPayments[0],
                                                    isBulkDelete: true,
                                                    pendingCount: pendingPayments.length
                                                };
                                                setPaymentToDelete(bulkDeletePayment);
                                                setShowDeleteDialog(true);
                                            }
                                        }}
                                        variant="destructive"
                                        size="sm"
                                        className="ml-2 px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 border-2 border-red-300 hover:border-red-400"
                                    >
                                        <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {isRTL ? `حذف ${stats.pendingPayments} معلق` : `Delete ${stats.pendingPayments} Pending`}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className={`${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'قائمة المدفوعات' : 'Payments List'} ({filteredPayments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPayments ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>{isRTL ? 'جارٍ تحميل المدفوعات...' : 'Loading payments...'}</span>
                            </div>
                        </div>
                    ) : paymentsError ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {paymentsError}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadPayments}
                                    className={`${isRTL ? 'mr-2' : 'ml-2'}`}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {isRTL ? 'إعادة المحاولة' : 'Retry'}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'رقم التأكيد' : 'Confirmation #'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المريض' : 'Patient'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الموعد' : 'Appointment'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المبلغ' : 'Amount'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'حالة الدفع' : 'Payment Status'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تاريخ الإنشاء' : 'Created At'}</th>
                                        <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                                            <td className={`p-2 font-mono text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {payment.confirmation_number || `#${payment.id.slice(-8)}`}
                                            </td>
                                            <td className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div>
                                                    <div className="font-medium">{payment.patient_name}</div>
                                                    <div className="text-sm text-muted-foreground">{payment.patient_email}</div>
                                                    <div className="text-sm text-muted-foreground">{payment.patient_phone}</div>
                                                </div>
                                            </td>
                                            <td className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div>
                                                    <div className="font-medium">{payment.doctor_name}</div>
                                                    <div className="text-sm text-muted-foreground">{payment.clinic_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {payment.appointment_day} at {payment.appointment_time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`p-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>₪{payment.price}</td>
                                            <td className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <Badge variant={getStatusBadgeVariant(payment.payment_status)}>
                                                    {translatePaymentStatus(payment.payment_status)}
                                                </Badge>
                                            </td>
                                            <td className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="flex items-center gap-2">
                                                    {getPaymentMethodIcon(payment.payment_transaction?.payment_method || 'cash')}
                                                    <span className="capitalize">
                                                        {payment.payment_transaction?.payment_method || 'cash'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`p-2 text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setShowPaymentDetails(true);
                                                        }}
                                                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {payment.payment_status === 'pending' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowMarkPaidDialog(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-700"
                                                            title={isRTL ? 'تحديد كمكتمل' : 'Mark as Paid'}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setPaymentToDelete(payment);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                        title={isRTL ? 'حذف الدفع' : 'Delete Payment'}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredPayments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-lg font-medium mb-2">
                                        {isRTL ? 'لم يتم العثور على مدفوعات' : 'No payments found'}
                                    </p>
                                    <p className="text-sm">
                                        {payments.length === 0
                                            ? (isRTL ? 'لم يتم تسجيل أي مدفوعات بعد.' : 'No payments have been recorded yet.')
                                            : (isRTL ? 'لا توجد مدفوعات تطابق الفلاتر الحالية.' : 'No payments match your current filters.')
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Details Dialog */}
            <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
                <DialogContent className={`max-w-2xl ${isRTL ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}>
                    <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                        <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'تفاصيل الدفع' : 'Payment Details'}
                        </DialogTitle>
                        <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'معلومات مفصلة حول هذا الدفع' : 'Detailed information about this payment'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'رقم التأكيد' : 'Confirmation #'}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPayment.confirmation_number || `#${selectedPayment.id.slice(-8)}`}
                                    </p>
                                </div>
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'حالة الدفع' : 'Payment Status'}</Label>
                                    <Badge variant={getStatusBadgeVariant(selectedPayment.payment_status)}>
                                        {translatePaymentStatus(selectedPayment.payment_status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'اسم المريض' : 'Patient Name'}</Label>
                                    <p className="text-sm">{selectedPayment.patient_name}</p>
                                </div>
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'بريد المريض الإلكتروني' : 'Patient Email'}</Label>
                                    <p className="text-sm">{selectedPayment.patient_email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'اسم الطبيب' : 'Doctor Name'}</Label>
                                    <p className="text-sm">{selectedPayment.doctor_name}</p>
                                </div>
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'اسم العيادة' : 'Clinic Name'}</Label>
                                    <p className="text-sm">{selectedPayment.clinic_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'تاريخ الموعد' : 'Appointment Date'}</Label>
                                    <p className="text-sm">{selectedPayment.appointment_day}</p>
                                </div>
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'وقت الموعد' : 'Appointment Time'}</Label>
                                    <p className="text-sm">{selectedPayment.appointment_time}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <Label className="font-medium">{isRTL ? 'المبلغ' : 'Amount'}</Label>
                                    <p className="text-lg font-bold">₪{selectedPayment.price}</p>
                                </div>
                                <div>
                                    <Label className="font-medium">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</Label>
                                    <div className="flex items-center gap-2">
                                        {getPaymentMethodIcon(selectedPayment.payment_transaction?.payment_method || 'cash')}
                                        <span className="capitalize">
                                            {selectedPayment.payment_transaction?.payment_method || 'cash'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-medium">{isRTL ? 'تاريخ الإنشاء' : 'Created At'}</Label>
                                    <p className="text-sm">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="font-medium">{isRTL ? 'آخر تحديث' : 'Last Updated'}</Label>
                                    <p className="text-sm">{new Date(selectedPayment.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Mark Payment as Completed Dialog */}
            <AlertDialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
                <AlertDialogContent className={isRTL ? '[&>button]:left-4 [&>button]:right-auto' : ''}>
                    <AlertDialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                        <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'تحديد الدفع كمكتمل' : 'Mark Payment as Completed'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'تأكيد أن الدفع النقدي تم استلامه في العيادة' : 'Confirm that the cash payment has been received at the clinic'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {selectedPayment && (
                        <div className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="space-y-2">
                                <p><strong>{isRTL ? 'المريض' : 'Patient'}:</strong> {selectedPayment.patient_name}</p>
                                <p><strong>{isRTL ? 'المبلغ' : 'Amount'}:</strong> ₪{selectedPayment.price}</p>
                                <p><strong>{isRTL ? 'الموعد' : 'Appointment'}:</strong> {selectedPayment.appointment_day} at {selectedPayment.appointment_time}</p>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="gap-4">
                        <AlertDialogCancel className="mr-4">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedPayment && markPaymentCompleted(selectedPayment.id)}
                            className="ml-4"
                        >
                            {isRTL ? 'تأكيد' : 'Mark as Completed'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Payment Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                            {paymentToDelete?.isBulkDelete
                                ? (isRTL ? 'تأكيد حذف جميع المدفوعات المعلقة' : 'Confirm Delete All Pending Payments')
                                : (isRTL ? 'تأكيد حذف الدفع' : 'Confirm Delete Payment')
                            }
                        </AlertDialogTitle>
                        <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {paymentToDelete?.isBulkDelete
                                ? (isRTL ? `هل أنت متأكد من حذف جميع المدفوعات المعلقة (${paymentToDelete?.pendingCount})؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete all pending payments (${paymentToDelete?.pendingCount})? This action cannot be undone.`)
                                : (isRTL ? 'هل أنت متأكد من حذف هذا الدفع؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this payment? This action cannot be undone.')
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {paymentToDelete && !paymentToDelete?.isBulkDelete && (
                        <div className="py-4">
                            <div className="space-y-2">
                                <p><strong>{isRTL ? 'المريض' : 'Patient'}:</strong> {paymentToDelete.patient_name}</p>
                                <p><strong>{isRTL ? 'المبلغ' : 'Amount'}:</strong> ₪{paymentToDelete.price}</p>
                                <p><strong>{isRTL ? 'الموعد' : 'Appointment'}:</strong> {paymentToDelete.appointment_day} at {paymentToDelete.appointment_time}</p>
                                <p><strong>{isRTL ? 'حالة الدفع' : 'Payment Status'}:</strong>
                                    <Badge variant={getStatusBadgeVariant(paymentToDelete.payment_status)} className="ml-2">
                                        {translatePaymentStatus(paymentToDelete.payment_status)}
                                    </Badge>
                                </p>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="gap-4">
                        <AlertDialogCancel className="mr-4">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => paymentToDelete && deletePayment(paymentToDelete.id, paymentToDelete?.isBulkDelete || false)}
                            className="bg-red-600 hover:bg-red-700 ml-4"
                        >
                            {paymentToDelete?.isBulkDelete
                                ? (isRTL ? `حذف جميع المعلقة` : `Delete All Pending`)
                                : (isRTL ? 'حذف' : 'Delete')
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PaymentManagement;
