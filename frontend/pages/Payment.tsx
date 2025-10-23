// pages/Payment.tsx - Updated with real payment processing
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { palestinianPaymentService, PaymentData } from "../lib/paymentService";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Skeleton } from "../components/ui/skeleton";
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

            // Flag to prevent booking if duplicate is detected
            let duplicateDetected = false;

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
                let userInfo: { english_username_a?: string; english_username_d?: string; user_email?: string; user_phonenumber?: string; unique_patient_id?: string } | null = null;
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

                // Check for existing appointments that would violate the unique constraint
                console.log('🔍 Checking for appointments that would violate unique constraint...');

                const { data: existingAppointments, error: checkError } = await supabase
                    .from('payment_bookings')
                    .select('id, clinic_name, doctor_name, appointment_day, appointment_time, payment_status, booking_status, created_at, patient_id, patient_email, deleted')
                    .eq('patient_id', user.id) // Match exact constraint: patient_id, clinic_name, doctor_name, appointment_day, appointment_time
                    .eq('clinic_name', clinicName)
                    .eq('doctor_name', doctorName)
                    .eq('appointment_day', actualDate)
                    .eq('appointment_time', appointmentTime)
                    .eq('deleted', false); // Only get non-deleted appointments

                console.log('🔍 ALL ACTIVE APPOINTMENTS FOUND (excluding soft-deleted):', {
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

                // TEMPORARY FIX: Bypass duplicate check to allow booking
                const DEBUG_MODE = true; // Set to true to bypass duplicate check temporarily

                if (DEBUG_MODE) {
                    console.log('🚨 DEBUG MODE ENABLED - BYPASSING DUPLICATE CHECK');
                } else {
                    console.log('🔍 NORMAL MODE - CHECKING FOR DUPLICATES');
                }

                // Since query already filters for exact constraint matches, any results are duplicates
                const exactDuplicates = DEBUG_MODE ? [] : (existingAppointments || []);

                console.log('🔍 CONSTRAINT-BASED DUPLICATE CHECK:', {
                    queryFilters: {
                        patient_id: user.id,
                        clinic_name: clinicName,
                        doctor_name: doctorName,
                        appointment_day: actualDate,
                        appointment_time: appointmentTime
                    },
                    resultsFound: exactDuplicates.length,
                    duplicates: exactDuplicates.map(dup => ({
                        id: dup.id,
                        status: dup.payment_status,
                        deleted: dup.deleted
                    }))
                });

                console.log('🔍 Exact duplicates found (excluding soft-deleted):', exactDuplicates);
                console.log('🔍 DEBUG INFO:', {
                    totalAppointmentsFound: existingAppointments?.length || 0,
                    duplicatesFound: exactDuplicates.length,
                    debugMode: DEBUG_MODE,
                    appointmentDetails: {
                        clinic: clinicName,
                        doctor: doctorName,
                        date: actualDate,
                        time: appointmentTime,
                        patientId: user.id
                    }
                });

                // Also check for soft-deleted duplicates that might cause constraint violation
                if (exactDuplicates.length === 0) {
                    console.log('🔍 Checking for soft-deleted duplicates that might cause constraint violation...');
                    const { data: softDeletedDuplicates } = await supabase
                        .from('payment_bookings')
                        .select('id, deleted, payment_status')
                        .eq('patient_id', user.id)
                        .eq('clinic_name', clinicName)
                        .eq('doctor_name', doctorName)
                        .eq('appointment_day', actualDate)
                        .eq('appointment_time', appointmentTime)
                        .eq('deleted', true);

                    if (softDeletedDuplicates && softDeletedDuplicates.length > 0) {
                        console.log('⚠️ Found soft-deleted duplicates:', softDeletedDuplicates);
                        console.log('⚠️ These might cause database constraint violation');
                    }
                }

                if (exactDuplicates.length > 0) {
                    const existingAppointment = exactDuplicates[0];
                    console.log('🚫 DUPLICATE FOUND:', {
                        existing: existingAppointment,
                        new: { clinicName, doctorName, actualDate, appointmentTime },
                        isDeleted: existingAppointment.deleted,
                        comparison: {
                            timeMatch: existingAppointment.appointment_time === appointmentTime,
                            dateMatch: existingAppointment.appointment_day === actualDate,
                            doctorMatch: existingAppointment.doctor_name === doctorName,
                            clinicMatch: existingAppointment.clinic_name === clinicName
                        }
                    });

                    toast({
                        title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                        description: isRTL
                            ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                            : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                        variant: "destructive",
                    });
                    console.log('🚫 DUPLICATE DETECTED - PREVENTING BOOKING AND STOPPING EXECUTION');

                    // Set flag to prevent booking
                    duplicateDetected = true;

                    // IMMEDIATELY stop all execution and navigate
                    console.log('🚫 HARD STOP - NO BOOKING ALLOWED');
                    navigate("/clinics");

                    // FORCE RETURN - NO FURTHER EXECUTION
                    return;

                    // Throw error to completely stop execution
                    throw new Error('DUPLICATE_APPOINTMENT_DETECTED');
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

                // Double-check: if duplicate was detected, don't proceed
                if (duplicateDetected) {
                    console.log('🚫 DUPLICATE FLAG SET - ABORTING BOOKING');
                    return;
                }

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

                // First, check if appointment already exists
                const { data: existingAppointment, error: checkError } = await supabase
                    .from('payment_bookings')
                    .select('*')
                    .eq('patient_id', user.id)
                    .eq('clinic_name', clinicName)
                    .eq('doctor_name', doctorName)
                    .eq('appointment_day', actualDate)
                    .eq('appointment_time', appointmentTime)
                    .eq('deleted', false)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') {
                    // PGRST116 is "not found" error, which is expected if no appointment exists
                    console.error('Error checking for existing appointment:', checkError);
                    throw checkError;
                }

                let appointment;
                if (existingAppointment) {
                    // Appointment already exists, use the existing one
                    console.log('✅ Using existing appointment:', existingAppointment);
                    appointment = existingAppointment;
                } else {
                    // No existing appointment, create a new one
                    console.log('🆕 Creating new appointment...');
                    const { data: newAppointment, error: insertError } = await supabase
                        .from('payment_bookings')
                        .insert([insertData])
                        .select('*')
                        .single();

                    if (insertError) {
                        console.error('payment_bookings insert error:', {
                            message: insertError.message,
                            details: insertError.details,
                            hint: insertError.hint,
                            code: insertError.code,
                        });

                        // Handle duplicate appointment error specifically
                        if (insertError.code === '23505' || insertError.message?.includes('unique_appointment_booking')) {
                            console.log('🚫 DATABASE CONSTRAINT VIOLATION - Duplicate detected at database level:', {
                                error: insertError.message,
                                details: insertError.details,
                                newAppointment: { clinicName, doctorName, actualDate, appointmentTime }
                            });

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

                        throw new Error(insertError.message || 'Insert failed');
                    }

                    console.log('✅ Successfully created new appointment:', newAppointment);
                    appointment = newAppointment;
                }

                if (appointment) {
                    const appt = appointment as PaymentBookingRecord;
                    setAppointmentId(appt.id);
                    // Generate confirmation number from appointment ID
                    setConfirmationNumber(`#${appt.id.toString().slice(-8)}`);
                }
            } catch (error) {
                console.error('Error initializing payment:', error);

                // Handle duplicate appointment error specifically
                if (error instanceof Error && error.message === 'DUPLICATE_APPOINTMENT_DETECTED') {
                    console.log('🚫 Duplicate appointment error handled - booking prevented');
                    // Don't show additional error toast since we already showed the duplicate error
                    return;
                }

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
    }, [clinicName, doctorName, specialty, appointmentDay, appointmentTime, price, navigate, toast, isCreatingAppointment, isRTL]);

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
