// pages/PaymentSuccess.tsx - PayPal success handler with proper types and Arabic support
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { palestinianPaymentService } from '../lib/paymentService'; // FIXED: Changed from ../lib/paymentService
import { supabase } from '../lib/supabase';

// FIXED: Updated interfaces to match new table structure
interface PaymentBookingDetails {
    id: string;
    patient_id: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    currency: string;
    payment_status: string;
    booking_status: string; // FIXED: Changed from status to booking_status
    created_at: string;
    updated_at: string;
}

interface PaymentLogEntry {
    id: string;
    payment_booking_id: string; // FIXED: Changed from appointment_id to payment_booking_id
    payment_method: string;
    amount: number;
    log_status: string; // FIXED: Changed from status to log_status
    error_message: string;
    created_at: string;
}

interface PaymentResult {
    success: boolean;
    transactionId?: string;
    appointment?: PaymentBookingDetails; // FIXED: Updated interface name
    error?: string;
}

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [isProcessing, setIsProcessing] = useState(true);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

    useEffect(() => {
        const handlePayPalReturn = async () => {
            try {
                const token = searchParams.get('token'); // PayPal order ID
                const payerId = searchParams.get('PayerID');

                if (!token) {
                    throw new Error('Missing PayPal order ID');
                }

                // Get the payment booking details from the payment logs
                const { data: logs, error: logsError } = await supabase
                    .from('payment_logs') // FIXED: Changed from payment_attempts to payment_logs
                    .select('*')
                    .eq('error_message', `PayPal order created: ${token}`)
                    .order('created_at', { ascending: false })
                    .limit(1) as { data: PaymentLogEntry[] | null; error: unknown };

                if (logsError || !logs || logs.length === 0) {
                    throw new Error('Could not find payment attempt');
                }

                const logEntry = logs[0]; // FIXED: Changed from attempt to logEntry

                // Get booking details
                const { data: booking, error: bookingError } = await supabase
                    .from('payment_bookings') // FIXED: Changed from appointments to payment_bookings
                    .select('*')
                    .eq('id', logEntry.payment_booking_id) // FIXED: Changed from log.payment_booking_id to logEntry.payment_booking_id
                    .single() as { data: PaymentBookingDetails | null; error: unknown };

                if (bookingError || !booking) {
                    throw new Error('Could not find booking');
                }

                // Prepare payment data
                const paymentData = {
                    appointmentId: booking.id,
                    patientId: booking.patient_id,
                    clinicId: '',
                    doctorId: '',
                    amount: booking.price,
                    currency: booking.currency,
                    paymentMethod: 'paypal' as const,
                    description: `Medical appointment - ${booking.doctor_name} at ${booking.clinic_name}`
                };

                // Capture the PayPal payment
                const result = await palestinianPaymentService.confirmPayPalPayment(token, paymentData);

                if (result.success) {
                    setPaymentResult({
                        success: true,
                        transactionId: token,
                        appointment: booking // FIXED: Changed from appointment to booking
                    });

                    toast({
                        title: t('paymentSuccess.paymentSuccessful'),
                        description: t('paymentSuccess.paypalProcessedSuccessfully'),
                    });
                } else {
                    throw new Error('PayPal payment confirmation failed');
                }

            } catch (error) {
                console.error('PayPal return handling error:', error);
                setPaymentResult({
                    success: false,
                    error: error instanceof Error ? error.message : 'Payment processing failed'
                });

                toast({
                    title: t('paymentSuccess.paymentError'),
                    description: error instanceof Error ? error.message : t('paymentSuccess.paymentProcessingFailed'),
                    variant: "destructive",
                });
            } finally {
                setIsProcessing(false);
            }
        };

        handlePayPalReturn();
    }, [searchParams, toast, t]);

    if (isProcessing) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Card className="w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="loading-spinner mx-auto"></div>
                            <h3 className={`text-lg font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                                {t('paymentSuccess.processingPayPalPayment')}
                            </h3>
                            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                {t('paymentSuccess.pleaseWaitConfirming')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!paymentResult?.success) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Card className="w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
                    <CardHeader>
                        <CardTitle className={`text-red-600 ${isRTL ? 'font-arabic text-right' : ''}`}>
                            {t('paymentSuccess.paymentFailed')}
                        </CardTitle>
                        <CardDescription className={isRTL ? 'font-arabic text-right' : ''}>
                            {paymentResult?.error || t('paymentSuccess.errorProcessingPayment')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button
                                onClick={() => navigate('/payment')}
                                className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                                style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                            >
                                {t('paymentSuccess.tryAgain')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/clinics')}
                                className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                                style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                            >
                                {t('paymentSuccess.backToClinics')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
                <CardHeader>
                    <CardTitle className={`text-green-600 text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('paymentSuccess.paymentSuccessfulTitle')}
                    </CardTitle>
                    <CardDescription className={`text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('paymentSuccess.appointmentConfirmedAndPaid')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 space-y-2">
                            <h4 className={`font-semibold ${isRTL ? 'font-arabic text-right' : ''}`}>
                                {t('paymentSuccess.appointmentDetails')}:
                            </h4>
                            <div className={`space-y-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                <p>
                                    <strong>{t('paymentSuccess.clinic')}:</strong> {paymentResult.appointment?.clinic_name}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.doctor')}:</strong> {paymentResult.appointment?.doctor_name}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.date')}:</strong> {paymentResult.appointment?.appointment_day}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.time')}:</strong> {paymentResult.appointment?.appointment_time}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.amountPaid')}:</strong> ₪{paymentResult.appointment?.price}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.paymentMethod')}:</strong> {t('paymentSuccess.paypal')}
                                </p>
                                <p>
                                    <strong>{t('paymentSuccess.transactionId')}:</strong> {paymentResult.transactionId}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/appointments')}
                            className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                        >
                            {t('paymentSuccess.viewMyAppointments')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/clinics')}
                            className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                        >
                            {t('paymentSuccess.bookAnotherAppointment')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;