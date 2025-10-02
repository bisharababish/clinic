// pages/Payment.tsx - Updated with real payment processing
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { palestinianPaymentService, PaymentData } from "../lib/paymentService";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";

type PaymentMethod = "cash";
interface LocationState {
    clinicName: string;
    doctorName: string;
    specialty: string;
    appointmentDay: string;
    appointmentTime: string;
    price: number;
}

interface PaymentBookingRecord {
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
    booking_status: string;  // ✅ CORRECT
    created_at: string;
    updated_at: string;
}
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // Properly typed location state
    const locationState = location.state as LocationState | null;
    const {
        clinicName,
        doctorName,
        specialty,
        appointmentDay,
        appointmentTime,
        price
    } = locationState || {
        clinicName: t('payment.selectedClinic'),
        doctorName: t('payment.selectedDoctor'),
        specialty: t('payment.selectedSpecialty'),
        appointmentDay: t('payment.selectedDay'),
        appointmentTime: t('payment.selectedTime'),
        price: 150,
    };

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [agreedToCashTerms, setAgreedToCashTerms] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [appointmentId, setAppointmentId] = useState<string>("");

    useEffect(() => {
        // Get current user and create appointment record
        const initializePayment = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    console.error('Auth error:', userError);
                    throw new Error('Authentication failed');
                }

                if (!user) {
                    toast({
                        title: "Authentication Required",
                        description: "Please log in to continue with payment",
                        variant: "destructive",
                    });
                    navigate("/login");
                    return;
                }
                setUser(user);

                // Create appointment record
                const { data: appointment, error } = await supabase
                    .from('payment_bookings')
                    .insert([{
                        patient_id: user.id,
                        clinic_name: clinicName,
                        doctor_name: doctorName,
                        specialty: specialty,
                        appointment_day: appointmentDay,
                        appointment_time: appointmentTime,
                        price: price,
                        currency: 'ILS',
                        payment_status: 'pending',
                        booking_status: 'scheduled'

                    }])
                    .select('*')
                    .single();

                if (error) {
                    console.error('payment_bookings insert error:', {
                        message: error.message,
                        details: (error as any).details,
                        hint: (error as any).hint,
                        code: error.code,
                    });
                    throw new Error(error.message || 'Insert failed');
                }
                if (appointment) setAppointmentId((appointment as PaymentBookingRecord).id);
            } catch (error) {
                console.error('Error initializing payment:', error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
                    variant: "destructive",
                });
            }
        };

        initializePayment();
    }, []);

    // Credit card flow removed for cash-only mode

    const handleCashSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (!appointmentId || !user) {
                throw new Error('Missing appointment or user information');
            }

            const paymentData: PaymentData = {
                appointmentId: appointmentId,
                patientId: user.id,
                clinicId: "",
                doctorId: "",
                amount: price,
                currency: 'ILS',
                paymentMethod: 'cash',
                description: `Medical appointment - ${doctorName} at ${clinicName}`
            };

            const result = await palestinianPaymentService.processCashPayment(paymentData);

            if (result.success) {
                toast({
                    title: "Cash Payment Registered",
                    description: "Your appointment has been scheduled. Please pay at the clinic.",
                });

                navigate("/confirmation", {
                    state: {
                        clinicName,
                        doctorName,
                        appointmentTime,
                        paymentMethod: 'cash',
                        status: 'pending_payment'
                    }
                });
            }

        } catch (error) {
            console.error('Cash payment error:', error);
            toast({
                title: "Registration Error",
                description: error instanceof Error ? error.message : "Failed to register cash payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
                    <Skeleton width={180} height={20} className="mx-auto mb-2" />
                    <Skeleton width={120} height={16} className="mx-auto" />
                    <p className="mt-4 text-gray-600">{t('payment.loadingPaymentInfo') || 'Loading payment information...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-3xl mx-auto py-8 px-4 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
            <Alert className={`mb-6 bg-blue-50 border-blue-200 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <AlertDescription>
                    <span className="font-medium">{t('payment.securePayment')}:</span> {t('payment.allTransactionsEncrypted')}
                </AlertDescription>
            </Alert>

            <Card className={`mb-6 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle>{t('payment.appointmentSummary')}</CardTitle>
                    <CardDescription>{t('payment.reviewAppointmentDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className={`grid grid-cols-2 gap-2 ${isRTL ? 'text-left font-arabic' : 'text-left'}`}>
                        <div className="text-sm font-medium">{t('payment.clinic')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{clinicName}</div>

                        <div className="text-sm font-medium">{t('payment.doctor')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{doctorName}</div>

                        <div className="text-sm font-medium">{t('payment.specialty')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{specialty}</div>

                        <div className="text-sm font-medium">{t('payment.day')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{appointmentDay}</div>

                        <div className="text-sm font-medium">{t('payment.time')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{appointmentTime}</div>

                        <div className="text-sm font-medium">{t('payment.totalAmount')}:</div>
                        <div className={`font-bold ${isRTL ? 'text-left font-arabic' : ''}`}>₪{price}</div>
                    </div>
                </CardContent>
            </Card>

            <Card dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.cash')}</CardTitle>
                    <CardDescription className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.cashPaymentInformation')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6 py-2" dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                        <div className={`bg-amber-50 p-4 rounded-md border border-amber-200 ${isRTL ? 'text-left font-arabic' : 'text-left'}`}>
                            <p className="text-amber-700 mb-3">
                                {t('payment.cashPaymentNote', { price })}
                            </p>
                            <ul className={`text-sm text-amber-700 space-y-2 list-disc ${isRTL ? 'pr-5 font-arabic' : 'pl-5'}`}>
                                <li>{t('payment.paymentAtReception')}</li>
                                <li>{t('payment.onlyCashShekel')}</li>
                                <li>{t('payment.receiptProvided')}</li>
                                <li>{t('payment.failureToPayMayReschedule')}</li>
                            </ul>
                        </div>
                        <form onSubmit={handleCashSubmit} className="space-y-6">
                            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
                                <Checkbox
                                    id="cashTerms"
                                    checked={agreedToCashTerms}
                                    onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="cashTerms"
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? 'text-right' : 'text-left'}`}
                                    >
                                        {t('payment.agreeToTerms')}
                                    </label>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isProcessing || !agreedToCashTerms || !appointmentId}
                                style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                            >
                                {isProcessing ? t('payment.processing') : t('payment.confirmCashPayment')}
                            </Button>
                            {!appointmentId && (
                                <div className="text-sm text-amber-700">
                                    {t('payment.loadingPaymentInfo') || 'Preparing your booking...'}
                                </div>
                            )}
                        </form>
                    </div>
                </CardContent>
                <CardFooter className={`justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                    <Button variant="outline" onClick={() => navigate("/clinics")}
                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                        {t('payment.back')}
                    </Button>
                    <div className="text-sm text-gray-500">
                        {t('payment.dataProtected')}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Payment;