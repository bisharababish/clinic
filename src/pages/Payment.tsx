// pages/Payment.tsx - Updated with real payment processing
import { useState, useEffect, useMemo } from "react";
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
import { freeAutoTranslateAppointmentData } from "../lib/freeTranslationService";

type PaymentMethod = "cash";
interface LocationState {
    clinicName: string;
    doctorName: string;
    specialty: string;
    appointmentDay: string;
    appointmentTime: string;
    price: number;
    // Arabic values (optional)
    clinicNameAr?: string;
    doctorNameAr?: string;
    specialtyAr?: string;
}

interface PaymentBookingRecord {
    id: string;
    patient_id: string;
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    unique_patient_id?: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    currency: string;
    payment_status: string;
    booking_status: string;
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
        price,
        clinicNameAr,
        doctorNameAr,
        specialtyAr
    } = locationState || {
        clinicName: t('payment.selectedClinic'),
        doctorName: t('payment.selectedDoctor'),
        specialty: t('payment.selectedSpecialty'),
        appointmentDay: t('payment.selectedDay'),
        appointmentTime: t('payment.selectedTime'),
        price: 150,
        clinicNameAr: undefined,
        doctorNameAr: undefined,
        specialtyAr: undefined,
    };

    // Auto-translated appointment data
    const [translatedAppointment, setTranslatedAppointment] = useState({
        clinicName: clinicName || '',
        doctorName: doctorName || '',
        specialty: specialty || '',
        appointmentDay: appointmentDay || '',
        appointmentTime: appointmentTime || ''
    });

    // Auto-translate when language changes
    useEffect(() => {
        console.log('🔄 Payment useEffect triggered:', {
            language: i18n.language,
            doctorName,
            specialty,
            appointmentDay
        });

        const translateData = async () => {
            console.log('🚀 Starting free auto-translation...');
            const translated = await freeAutoTranslateAppointmentData(
                {
                    clinicName,
                    doctorName,
                    specialty,
                    appointmentDay,
                    appointmentTime
                },
                i18n.language
            );
            console.log('✅ Free translation complete, updating state:', translated);
            setTranslatedAppointment(translated);
        };

        translateData();
    }, [clinicName, doctorName, specialty, appointmentDay, appointmentTime, i18n.language]);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [agreedToCashTerms, setAgreedToCashTerms] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [appointmentId, setAppointmentId] = useState<string>("");
    const [confirmationNumber, setConfirmationNumber] = useState<string>("");

    useEffect(() => {
        // Get current user and create appointment record
        const initializePayment = async () => {
            // Prevent multiple simultaneous appointment creations
            if (isCreatingAppointment) {
                console.log('🚫 Appointment creation already in progress, skipping...');
                return;
            }

            setIsCreatingAppointment(true);

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

                // Get user information from userinfo table
                let userInfo = null;
                try {
                    const { data: userInfoData, error: userInfoError } = await supabase
                        .from('userinfo')
                        .select('english_username_a, english_username_d, user_email, user_phonenumber, unique_patient_id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (!userInfoError && userInfoData) {
                        userInfo = userInfoData;
                    }
                } catch (error) {
                    console.warn('Could not fetch user info:', error);
                }

                // Convert day name to actual date first
                const convertDayNameToDate = (dayName: string): string => {
                    // Handle placeholder text
                    if (dayName.includes('الوقت المختار') || dayName.includes('The Chosen Time')) {
                        console.warn(`Detected placeholder text "${dayName}", using tomorrow's date`);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split('T')[0];
                    }

                    const dayMap: { [key: string]: number } = {
                        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0
                    };

                    const arabicDayMap: { [key: string]: number } = {
                        'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6, 'الأحد': 0
                    };

                    const dayNumber = dayMap[dayName] ?? arabicDayMap[dayName];
                    if (dayNumber !== undefined) {
                        const today = new Date();
                        const currentDay = today.getDay();
                        let daysUntilTarget = (dayNumber - currentDay + 7) % 7;
                        if (daysUntilTarget === 0) daysUntilTarget = 7;

                        const targetDate = new Date(today);
                        targetDate.setDate(today.getDate() + daysUntilTarget);
                        return targetDate.toISOString().split('T')[0];
                    }

                    if (dayName.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        return dayName;
                    }

                    console.warn(`Could not convert day name "${dayName}" to date, using today's date`);
                    return new Date().toISOString().split('T')[0];
                };

                const actualDate = convertDayNameToDate(appointmentDay);

                // Check for exact duplicate appointments (same patient, doctor, clinic, date, time)
                console.log('🔍 Checking for duplicates with:', {
                    patient_id: user.id,
                    clinic_name: clinicName,
                    doctor_name: doctorName,
                    appointment_day: actualDate,
                    appointment_time: appointmentTime
                });

                // Check for existing appointments INCLUDING soft-deleted ones
                console.log('🔍 Checking for appointments including soft-deleted records...');

                const { data: existingAppointments, error: checkError } = await supabase
                    .from('payment_bookings')
                    .select('id, clinic_name, doctor_name, appointment_day, appointment_time, payment_status, booking_status, created_at, patient_id, patient_email, deleted')
                    .or(`patient_id.eq.${user.id},patient_email.eq.${user.email}`);

                console.log('🔍 ALL APPOINTMENTS FOUND (including soft-deleted):', {
                    count: existingAppointments?.length || 0,
                    appointments: existingAppointments?.map(apt => ({
                        id: apt.id,
                        clinic: apt.clinic_name,
                        doctor: apt.doctor_name,
                        date: apt.appointment_day,
                        time: apt.appointment_time,
                        status: apt.payment_status,
                        deleted: apt.deleted
                    }))
                });

                if (checkError) {
                    console.error('Error checking existing appointments:', checkError);
                    throw new Error('Failed to check existing appointments');
                }

                // Check for exact duplicates (regardless of deleted status)
                const exactDuplicates = (existingAppointments || []).filter(existing => {
                    const timeMatch = existing.appointment_time === appointmentTime;
                    const dateMatch = existing.appointment_day === actualDate;
                    const doctorMatch = existing.doctor_name === doctorName;
                    const clinicMatch = existing.clinic_name === clinicName;
                    return timeMatch && dateMatch && doctorMatch && clinicMatch;
                });

                console.log('🔍 Exact duplicates found (including soft-deleted):', exactDuplicates);

                if (exactDuplicates.length > 0) {
                    const existingAppointment = exactDuplicates[0];
                    console.log('🚫 DUPLICATE FOUND:', {
                        existing: existingAppointment,
                        new: { clinicName, doctorName, actualDate, appointmentTime },
                        isDeleted: existingAppointment.deleted
                    });

                    toast({
                        title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                        description: isRTL
                            ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                            : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                        variant: "destructive",
                    });
                    console.log('🚫 DUPLICATE DETECTED - PREVENTING BOOKING');
                    navigate("/clinics");
                    return;
                } else {
                    console.log('✅ NO DUPLICATES FOUND - PROCEEDING TO INSERT');
                }

                // Debug: Log user information
                console.log('🔍 User Info Debug:', {
                    userId: user.id,
                    userEmail: user.email,
                    userInfo: userInfo,
                    constructedName: userInfo ?
                        `${userInfo.english_username_a || ''} ${userInfo.english_username_d || ''}`.trim() ||
                        userInfo.user_email ||
                        'Unknown Patient' :
                        user.email || 'Unknown Patient'
                });
                console.log(`Using converted date: "${actualDate}"`);

                // Final check before booking - make sure no duplicates exist
                console.log('✅ PROCEEDING WITH BOOKING - No duplicates found');

                const insertData = {
                    patient_id: user.id,
                    patient_name: userInfo ?
                        `${userInfo.english_username_a || ''} ${userInfo.english_username_d || ''}`.trim() ||
                        userInfo.user_email ||
                        'Unknown Patient' :
                        user.email || 'Unknown Patient',
                    patient_email: userInfo?.user_email || user.email || '',
                    patient_phone: userInfo?.user_phonenumber || '',
                    unique_patient_id: userInfo?.unique_patient_id || '',
                    clinic_name: clinicName,
                    doctor_name: doctorName,
                    specialty: specialty,
                    appointment_day: actualDate, // Use converted date
                    appointment_time: appointmentTime,
                    price: price,
                    currency: 'ILS',
                    payment_status: 'pending',
                    booking_status: 'scheduled'
                };

                console.log('🔍 EXACT DATA BEING INSERTED:', {
                    constraint_fields: {
                        patient_id: insertData.patient_id,
                        clinic_name: `"${insertData.clinic_name}"`,
                        doctor_name: `"${insertData.doctor_name}"`,
                        appointment_day: `"${insertData.appointment_day}"`,
                        appointment_time: `"${insertData.appointment_time}"`
                    },
                    full_data: insertData
                });

                // Try to insert the appointment
                const { data: appointment, error } = await supabase
                    .from('payment_bookings')
                    .insert([insertData])
                    .select('*')
                    .single();

                if (error) {
                    console.error('payment_bookings insert error:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code,
                    });

                    // Handle duplicate appointment error specifically
                    if (error.code === '23505' || error.message?.includes('unique_appointment_booking')) {
                        console.log('🚫 DATABASE CONSTRAINT VIOLATION - Duplicate detected at database level:', {
                            error: error.message,
                            details: error.details,
                            newAppointment: { clinicName, doctorName, actualDate, appointmentTime }
                        });

                        // Instead of showing error, let's try to find and delete the conflicting record
                        console.log('🔧 Attempting to resolve constraint violation by cleaning up conflicting records...');

                        const { error: deleteError } = await supabase
                            .from('payment_bookings')
                            .delete()
                            .eq('patient_id', user.id)
                            .eq('clinic_name', clinicName)
                            .eq('doctor_name', doctorName)
                            .eq('appointment_day', actualDate)
                            .eq('appointment_time', appointmentTime);

                        if (deleteError) {
                            console.error('Failed to delete conflicting record:', deleteError);
                        } else {
                            console.log('✅ Deleted conflicting record, retrying insert...');

                            // Retry the insert
                            const { data: retryAppointment, error: retryError } = await supabase
                                .from('payment_bookings')
                                .insert([insertData])
                                .select('*')
                                .single();

                            if (retryError) {
                                console.error('Retry insert failed:', retryError);
                                throw new Error(retryError.message || 'Insert failed after cleanup');
                            } else {
                                console.log('✅ Successfully inserted after cleanup:', retryAppointment);
                                const appt = retryAppointment as any;
                                setAppointmentId(appt.id);
                                setConfirmationNumber(`#${appt.id.toString().slice(-8)}`);
                                return; // Success, exit early
                            }
                        }

                        toast({
                            title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                            description: isRTL
                                ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                                : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                            variant: "destructive",
                        });
                        navigate("/clinics");
                        return;
                    }

                    throw new Error(error.message || 'Insert failed');
                }
                if (appointment) {
                    const appt = appointment as PaymentBookingRecord;
                    setAppointmentId(appt.id);
                    // Generate confirmation number from appointment ID
                    setConfirmationNumber(`#${appt.id.toString().slice(-8)}`);
                }
            } catch (error) {
                console.error('Error initializing payment:', error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsCreatingAppointment(false);
            }
        };

        initializePayment();
    }, [clinicName, doctorName, specialty, appointmentDay, appointmentTime, price, navigate, toast]);

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
                description: `Medical appointment - ${doctorName} at ${clinicName}`,
                clinicName: clinicName,
                doctorName: doctorName,
                specialty: specialty,
                appointmentDay: appointmentDay,
                appointmentTime: appointmentTime
            };

            const result = await palestinianPaymentService.processCashPayment(paymentData);

            if (result.success) {
                toast({
                    title: isRTL ? "تم تسجيل الدفع النقدي" : "Cash Payment Registered",
                    description: isRTL ? "تم جدولة موعدك. يرجى الدفع في العيادة." : "Your appointment has been scheduled. Please pay at the clinic.",
                });
                navigate("/confirmation", {
                    state: {
                        clinicName,
                        doctorName,
                        specialty,
                        appointmentDay,
                        appointmentTime,
                        paymentMethod: 'cash',
                        status: 'pending_payment',
                        confirmationNumber: confirmationNumber,
                        appointmentId: appointmentId,
                        // Arabic values
                        clinicNameAr,
                        doctorNameAr,
                        specialtyAr
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
                        <div className={isRTL ? 'text-left font-arabic' : ''}>
                            {translatedAppointment.clinicName}
                        </div>

                        <div className="text-sm font-medium">{t('payment.doctor')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>
                            {translatedAppointment.doctorName}
                        </div>

                        <div className="text-sm font-medium">{t('payment.specialty')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>
                            {translatedAppointment.specialty}
                        </div>

                        <div className="text-sm font-medium">{t('payment.day')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>
                            {translatedAppointment.appointmentDay}
                        </div>

                        <div className="text-sm font-medium">{t('payment.time')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{translatedAppointment.appointmentTime}</div>

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
                            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {!isRTL && (
                                    <Checkbox
                                        id="cashTerms"
                                        checked={agreedToCashTerms}
                                        onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                    />
                                )}
                                <div className="grid gap-1.5 leading-none flex-1">
                                    <label
                                        htmlFor="cashTerms"
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? 'text-right' : 'text-left'}`}
                                    >
                                        {t('payment.agreeToTerms')}
                                    </label>
                                </div>
                                {isRTL && (
                                    <Checkbox
                                        id="cashTerms"
                                        checked={agreedToCashTerms}
                                        onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                    />
                                )}
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