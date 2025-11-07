// pages/Payment.tsx - Updated with real payment processing
import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { CreditCard, Banknote } from "lucide-react";
import { apiCall } from "../src/lib/api";

type PaymentMethod = "cash" | "visa";
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
    const isInitializingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const [serviceRequestId, setServiceRequestId] = useState<string | null>(null);
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
        notes?: string;
        created_at: string;
    }
    const [serviceRequest, setServiceRequest] = useState<ServiceRequestData | null>(null);
    const [isServiceRequestPayment, setIsServiceRequestPayment] = useState(false);

    // Check for service request payment from URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const requestId = urlParams.get('service_request_id');
        const amount = urlParams.get('amount');
        const serviceType = urlParams.get('service_type');

        if (requestId) {
            setIsServiceRequestPayment(true);
            setServiceRequestId(requestId);
            // Load service request details
            const loadServiceRequest = async () => {
                const { data, error } = await supabase
                    .from('service_requests')
                    .select('*')
                    .eq('id', requestId)
                    .single();

                if (!error && data) {
                    setServiceRequest(data);
                    // Load pricing info if needed
                    if (data.service_subtype && data.service_type) {
                        const { data: pricingData } = await supabase
                            .from('service_pricing')
                            .select('service_name, service_name_ar')
                            .eq('service_type', data.service_type)
                            .eq('service_subtype', data.service_subtype)
                            .single();

                        if (pricingData) {
                            data.service_name = pricingData.service_name;
                            data.service_name_ar = pricingData.service_name_ar;
                        }
                    }
                }
            };
            loadServiceRequest();
        }
    }, []);

    useEffect(() => {
        // Get current user and create appointment record
        const initializePayment = async () => {
            // Skip if this is a service request payment
            if (isServiceRequestPayment) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                }
                return;
            }
            
            // Prevent multiple simultaneous appointment creations using ref
            if (isInitializingRef.current) {
                console.log('🚫 Appointment creation already in progress (ref check), skipping...');
                return;
            }
            
            // Prevent re-execution if already initialized
            if (hasInitializedRef.current) {
                console.log('🚫 Already initialized, skipping...');
                return;
            }

            isInitializingRef.current = true;
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
                        title: isRTL ? "المصادقة مطلوبة" : "Authentication Required",
                        description: isRTL ? "يرجى تسجيل الدخول للمتابعة مع الدفع" : "Please log in to continue with payment",
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

                // Query for potential duplicates - be very specific to avoid false positives
                // Only check for exact matches: same patient, clinic, doctor, date, and time
                // IMPORTANT: Query by email first to avoid patient_id mismatches
                const { data: existingAppointments, error: checkError } = await supabase
                    .from('payment_bookings')
                    .select('id, clinic_name, doctor_name, appointment_day, appointment_time, payment_status, booking_status, created_at, patient_id, patient_email, deleted')
                    .eq('patient_email', user.email) // Use email instead of patient_id to be more accurate
                    .eq('appointment_day', actualDate)
                    .eq('deleted', false) // Only non-deleted appointments
                    .neq('booking_status', 'cancelled'); // Exclude cancelled appointments

                // Now filter by clinic and doctor to avoid false positives
                // Some appointments might have time ranges like "08:00-20:00", so we need to handle that

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

                // Normalize values for accurate comparison
                const normalizeString = (str: string) => (str || '').trim().toLowerCase();
                const normalizeTime = (time: string) => {
                    // Handle time ranges (e.g., "08:00-20:00") - extract start time
                    let normalized = (time || '').trim();
                    
                    // If it's a range, get the start time
                    if (normalized.includes('-')) {
                        normalized = normalized.split('-')[0].trim();
                    }
                    
                    // Remove seconds if present (e.g., "10:00:00" -> "10:00")
                    normalized = normalized.replace(/:\d{2}$/, '');
                    
                    return normalized;
                };

                const normalizedClinicName = normalizeString(clinicName);
                const normalizedDoctorName = normalizeString(doctorName);
                const normalizedTime = normalizeTime(appointmentTime);

                // Filter out false positives by doing strict comparison
                // Only consider it a duplicate if ALL fields match exactly
                const exactDuplicates = (existingAppointments || []).filter(apt => {
                    // Check if appointment is actually active (not cancelled, not deleted)
                    if (apt.deleted === true) return false;
                    if (apt.booking_status === 'cancelled') return false;
                    
                    // Verify it's the same patient (by email)
                    if (apt.patient_email !== user.email) return false;
                    
                    // Strict comparison with normalized values
                    const aptClinic = normalizeString(apt.clinic_name || '');
                    const aptDoctor = normalizeString(apt.doctor_name || '');
                    const aptTime = normalizeTime(apt.appointment_time || '');
                    
                    // ALL must match: clinic, doctor, date, and time
                    const clinicMatch = aptClinic === normalizedClinicName;
                    const doctorMatch = aptDoctor === normalizedDoctorName;
                    const dateMatch = apt.appointment_day === actualDate;
                    const timeMatch = aptTime === normalizedTime;
                    
                    // Log for debugging
                    if (!clinicMatch || !doctorMatch || !dateMatch || !timeMatch) {
                        console.log('🔍 Appointment filtered out (not exact match):', {
                            apt,
                            matches: { clinicMatch, doctorMatch, dateMatch, timeMatch },
                            normalized: {
                                aptClinic,
                                aptDoctor,
                                aptTime,
                                expectedClinic: normalizedClinicName,
                                expectedDoctor: normalizedDoctorName,
                                expectedTime: normalizedTime
                            }
                        });
                    }
                    
                    // Only return true if ALL match
                    return clinicMatch && doctorMatch && dateMatch && timeMatch;
                });

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

                // Only block if we found exact duplicates
                if (exactDuplicates.length > 0) {
                    console.log('🚫 EXACT DUPLICATE FOUND:', {
                        duplicates: exactDuplicates,
                        new: { clinicName, doctorName, actualDate, appointmentTime }
                    });

                    toast({
                        title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                        description: isRTL
                            ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                            : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                        variant: "destructive",
                    });
                    console.log('🚫 DUPLICATE DETECTED - STOPPING BOOKING PROCESS');
                    
                    // Set flag and stop execution immediately
                    duplicateDetected = true;
                    setIsCreatingAppointment(false);
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

                // Double-check: if duplicate was detected, don't proceed
                if (duplicateDetected) {
                    console.log('🚫 DUPLICATE FLAG SET - ABORTING BOOKING');
                    setIsCreatingAppointment(false);
                    return;
                }

                // Triple-check: Make one final query right before insert to be absolutely sure
                // Use email instead of patient_id for more accurate matching
                const { data: finalCheck, error: finalCheckError } = await supabase
                    .from('payment_bookings')
                    .select('id, clinic_name, doctor_name, appointment_time')
                    .eq('patient_email', user.email)
                    .eq('clinic_name', clinicName)
                    .eq('doctor_name', doctorName)
                    .eq('appointment_day', actualDate)
                    .eq('appointment_time', appointmentTime)
                    .eq('deleted', false)
                    .neq('booking_status', 'cancelled')
                    .maybeSingle();

                if (finalCheckError && finalCheckError.code !== 'PGRST116') {
                    console.error('Final check error:', finalCheckError);
                    throw finalCheckError;
                }

                if (finalCheck) {
                    console.log('🚫 FINAL CHECK: Duplicate found right before insert, aborting!');
                    toast({
                        title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                        description: isRTL
                            ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                            : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                        variant: "destructive",
                    });
                    setIsCreatingAppointment(false);
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

                // First, check if appointment already exists (using maybeSingle to avoid errors)
                const { data: existingAppointment, error: appointmentCheckError } = await supabase
                    .from('payment_bookings')
                    .select('*')
                    .eq('patient_email', user.email) // Use email for more reliable matching
                    .eq('clinic_name', clinicName)
                    .eq('doctor_name', doctorName)
                    .eq('appointment_day', actualDate)
                    .eq('appointment_time', appointmentTime)
                    .eq('deleted', false)
                    .maybeSingle(); // Use maybeSingle instead of single to avoid errors

                if (appointmentCheckError && appointmentCheckError.code !== 'PGRST116') {
                    // PGRST116 is "not found" error, which is expected if no appointment exists
                    console.error('Error checking for existing appointment:', appointmentCheckError);
                    throw appointmentCheckError;
                }

                let appointment;
                if (existingAppointment) {
                    // Appointment already exists, use the existing one
                    console.log('✅ Using existing appointment:', existingAppointment);
                    appointment = existingAppointment;
                    hasInitializedRef.current = true; // Mark as initialized
                } else {
                    // No existing appointment, create a new one
                    console.log('🆕 Creating new appointment...');
                    
                    // Final safety check: Make absolutely sure no duplicate exists
                    const { data: lastCheck } = await supabase
                        .from('payment_bookings')
                        .select('id')
                        .eq('patient_email', user.email)
                        .eq('clinic_name', clinicName)
                        .eq('doctor_name', doctorName)
                        .eq('appointment_day', actualDate)
                        .eq('appointment_time', appointmentTime)
                        .eq('deleted', false)
                        .maybeSingle();
                    
                    if (lastCheck) {
                        console.log('⚠️ Last check found existing appointment, using it:', lastCheck);
                        const { data: foundAppointment } = await supabase
                            .from('payment_bookings')
                            .select('*')
                            .eq('id', lastCheck.id)
                            .single();
                        appointment = foundAppointment;
                        hasInitializedRef.current = true;
                    } else {
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
                            if (insertError.code === '23505' || insertError.code === 'PGRST301' || insertError.message?.includes('unique') || insertError.message?.includes('duplicate')) {
                                console.log('🚫 DATABASE CONSTRAINT VIOLATION - Duplicate detected at database level:', {
                                    error: insertError.message,
                                    details: insertError.details,
                                    newAppointment: { clinicName, doctorName, actualDate, appointmentTime }
                                });

                                // Try to find the existing appointment instead
                                const { data: existingAppt } = await supabase
                                    .from('payment_bookings')
                                    .select('*')
                                    .eq('patient_email', user.email)
                                    .eq('clinic_name', clinicName)
                                    .eq('doctor_name', doctorName)
                                    .eq('appointment_day', actualDate)
                                    .eq('appointment_time', appointmentTime)
                                    .eq('deleted', false)
                                    .maybeSingle();

                                if (existingAppt) {
                                    console.log('✅ Found existing appointment, using it:', existingAppt);
                                    appointment = existingAppt;
                                    hasInitializedRef.current = true;
                                } else {
                                    toast({
                                        title: isRTL ? "موعد مكرر" : "Duplicate Appointment",
                                        description: isRTL
                                            ? `لديك موعد موجود مسبقاً مع ${doctorName} في ${clinicName} في ${actualDate} الساعة ${appointmentTime}. لا يمكن حجز نفس الموعد مرتين.`
                                            : `You already have an existing appointment with ${doctorName} at ${clinicName} on ${actualDate} at ${appointmentTime}. Cannot book the same appointment twice.`,
                                        variant: "destructive",
                                    });
                                    hasInitializedRef.current = true; // Prevent retry
                                    return;
                                }
                            } else {
                                throw new Error(insertError.message || 'Insert failed');
                            }
                        } else {
                            console.log('✅ Successfully created new appointment:', newAppointment);
                            appointment = newAppointment;
                            hasInitializedRef.current = true; // Mark as initialized
                        }
                    }
                }

                if (appointment) {
                    const appt = appointment as PaymentBookingRecord;
                    setAppointmentId(appt.id);
                    // Generate confirmation number from appointment ID
                    setConfirmationNumber(`#${appt.id.toString().slice(-8)}`);
                    hasInitializedRef.current = true; // Mark as initialized
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
                    title: isRTL ? "خطأ" : "Error",
                    description: error instanceof Error ? error.message : (isRTL ? "فشل تهيئة الدفع. يرجى المحاولة مرة أخرى." : "Failed to initialize payment. Please try again."),
                    variant: "destructive",
                });
                } finally {
                    setIsCreatingAppointment(false);
                    isInitializingRef.current = false; // Reset ref
                }
            };

            initializePayment();
        }, [clinicName, doctorName, specialty, appointmentDay, appointmentTime, price, navigate, toast, isRTL, isServiceRequestPayment]);

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
                    style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
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
                title: isRTL ? "خطأ في التسجيل" : "Registration Error",
                description: error instanceof Error ? error.message : (isRTL ? "فشل تسجيل الدفع النقدي. يرجى المحاولة مرة أخرى." : "Failed to register cash payment. Please try again."),
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle Visa payment using CyberSource Hosted Checkout
    const handleHostedCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (!user) {
                throw new Error(isRTL ? 'يرجى تسجيل الدخول لإتمام الدفع' : 'Please sign in to continue with payment');
            }

            const isServiceRequest = Boolean(isServiceRequestPayment && serviceRequestId);
            const referenceNumber = isServiceRequest
                ? (serviceRequestId ? `SR-${serviceRequestId}` : '')
                : (appointmentId ? `APT-${appointmentId}` : '');

            const amountValue = isServiceRequest
                ? serviceRequest?.price
                : price;

            const currencyValue = isServiceRequest
                ? (serviceRequest?.currency || 'ILS')
                : 'ILS';

            if (!referenceNumber) {
                throw new Error(isRTL ? 'معرّف الدفع غير متاح' : 'Payment reference is missing');
            }

            if (amountValue === undefined || amountValue === null) {
                throw new Error(isRTL ? 'قيمة المبلغ غير متوفرة' : 'Unable to determine payment amount');
            }

            const payload = await apiCall<{
                success: boolean;
                endpoint: string;
                fields: Record<string, string>;
            }>('/api/payments/cybersource/session', {
                method: 'POST',
                body: JSON.stringify({
                    amount: amountValue,
                    currency: currencyValue,
                    referenceNumber,
                    successUrl: `${window.location.origin}/payment/result`,
                    cancelUrl: `${window.location.origin}/payment/result`,
                }),
            });

            if (!payload?.success || !payload.endpoint || !payload.fields) {
                throw new Error(isRTL ? 'تعذر بدء عملية الدفع. حاول مرة أخرى.' : 'Failed to initialize payment. Please try again.');
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payload.endpoint;
            form.style.display = 'none';

            Object.entries(payload.fields).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value ?? '';
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Hosted checkout error:', error);
            toast({
                title: isRTL ? 'خطأ في الدفع' : 'Payment Error',
                description: error instanceof Error
                    ? error.message
                    : (isRTL ? 'فشل بدء الدفع. يرجى المحاولة مرة أخرى.' : 'Failed to start the payment. Please try again.'),
                variant: 'destructive',
            });
        } finally {
            // If the browser prevented navigation for any reason, re-enable the button
            setIsProcessing(false);
        }
    };

    // Handle service request payment (cash)
    const handleServiceRequestPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (!serviceRequestId || !user || !serviceRequest) {
                throw new Error('Missing service request or user information');
            }

            // Create payment booking record for service request
            const { data: bookingData, error: bookingError } = await supabase
                .from('payment_bookings')
                .insert([{
                    patient_id: user.id,
                    patient_email: user.email,
                    patient_name: serviceRequest.patient_name,
                    clinic_name: 'Service Request',
                    doctor_name: serviceRequest.doctor_name,
                    specialty: serviceRequest.service_type,
                    appointment_day: new Date().toISOString().split('T')[0],
                    appointment_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    price: serviceRequest.price,
                    currency: serviceRequest.currency || 'ILS',
                    payment_status: 'pending',
                    booking_status: 'scheduled'
                }])
                .select()
                .single();

            if (bookingError) throw bookingError;

            // Record payment transaction
            const paymentData: PaymentData = {
                appointmentId: bookingData.id,
                patientId: user.id,
                clinicId: "",
                doctorId: "",
                amount: serviceRequest.price || 0,
                currency: serviceRequest.currency || 'ILS',
                paymentMethod: 'cash',
                description: `Service request payment - ${serviceRequest.service_type}${serviceRequest.service_subtype ? ` - ${serviceRequest.service_subtype}` : ''}`,
                clinicName: 'Service Request',
                doctorName: serviceRequest.doctor_name,
                specialty: serviceRequest.service_type,
                appointmentDay: new Date().toISOString().split('T')[0],
                appointmentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            };

            const result = await palestinianPaymentService.processCashPayment(paymentData);

            if (result.success) {
                // Update service request payment status (keep status as payment_required, secretary will confirm)
                const { error: updateError } = await supabase
                    .from('service_requests')
                    .update({
                        payment_status: 'paid',
                        payment_booking_id: bookingData.id,
                        // Keep status as payment_required - secretary needs to confirm payment
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', serviceRequestId);

                if (updateError) {
                    console.error('Error updating service request:', updateError);
                    // Don't throw - payment was successful
                }

                // Notify service provider
                const { createNotification } = await import('../lib/deletionRequests');
                const serviceProviderRole =
                    serviceRequest.service_type === 'xray' ? 'X Ray' :
                        serviceRequest.service_type === 'ultrasound' ? 'Ultrasound' :
                            serviceRequest.service_type === 'lab' ? 'Lab' :
                                serviceRequest.service_type === 'audiometry' ? 'Audiometry' : '';

                if (serviceProviderRole) {
                    const { data: providers } = await supabase
                        .from('userinfo')
                        .select('user_email')
                        .eq('user_roles', serviceProviderRole);

                    if (providers) {
                        for (const provider of providers) {
                            await createNotification(
                                provider.user_email,
                                isRTL ? 'تم دفع الطلب - جاهز للمعالجة' : 'Request Paid - Ready to Process',
                                isRTL
                                    ? `تم دفع طلب ${serviceRequest.service_type} للمريض ${serviceRequest.patient_name}. يمكنك البدء في المعالجة.`
                                    : `Service request for ${serviceRequest.service_type} for patient ${serviceRequest.patient_name} has been paid. You can now start processing.`,
                                'success',
                                'service_requests',
                                serviceRequestId
                            );
                        }
                    }
                }

                // Notify patient
                await createNotification(
                    serviceRequest.patient_email,
                    isRTL ? 'تم دفع الطلب' : 'Payment Received',
                    isRTL
                        ? `تم استلام الدفع لطلب ${serviceRequest.service_type} بنجاح`
                        : `Payment for ${serviceRequest.service_type} request has been received successfully`,
                    'success',
                    'service_requests',
                    serviceRequestId
                );

                toast({
                    title: isRTL ? "تم تسجيل الدفع النقدي" : "Cash Payment Registered",
                    description: isRTL ? "تم دفع طلب الخدمة بنجاح." : "Service request payment has been registered successfully.",
                    style: { backgroundColor: '#16a34a', color: '#fff' },
                });

                navigate("/patient/dashboard");
            }

        } catch (error) {
            console.error('Service request payment error:', error);
            toast({
                title: isRTL ? "خطأ في التسجيل" : "Registration Error",
                description: error instanceof Error ? error.message : (isRTL ? "فشل تسجيل الدفع النقدي. يرجى المحاولة مرة أخرى." : "Failed to register cash payment. Please try again."),
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
                    <CardTitle>{isServiceRequestPayment ? (isRTL ? 'ملخص طلب الخدمة' : 'Service Request Summary') : t('payment.appointmentSummary')}</CardTitle>
                    <CardDescription>{isServiceRequestPayment ? (isRTL ? 'راجع تفاصيل طلب الخدمة' : 'Review service request details') : t('payment.reviewAppointmentDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isServiceRequestPayment && serviceRequest ? (
                        <div className={`grid grid-cols-2 gap-2 ${isRTL ? 'text-left font-arabic' : 'text-left'}`}>
                            <div className="text-sm font-medium">{isRTL ? 'نوع الخدمة' : 'Service Type'}:</div>
                            <div className={isRTL ? 'text-left font-arabic' : ''}>
                                {isRTL ?
                                    (serviceRequest.service_type === 'xray' ? 'أشعة إكس' :
                                        serviceRequest.service_type === 'ultrasound' ? 'موجات فوق صوتية' :
                                            serviceRequest.service_type === 'lab' ? 'مختبر' : 'قياس السمع')
                                    : serviceRequest.service_type.toUpperCase()}
                                {serviceRequest.service_subtype && (
                                    <span className="text-sm text-gray-600">
                                        {` - ${isRTL ? serviceRequest.service_name_ar : serviceRequest.service_name}`}
                                    </span>
                                )}
                            </div>

                            <div className="text-sm font-medium">{isRTL ? 'الطبيب' : 'Doctor'}:</div>
                            <div className={isRTL ? 'text-left font-arabic' : ''}>
                                {serviceRequest.doctor_name}
                            </div>

                            {serviceRequest.notes && (
                                <>
                                    <div className="text-sm font-medium">{isRTL ? 'ملاحظات' : 'Notes'}:</div>
                                    <div className={isRTL ? 'text-left font-arabic' : ''}>
                                        {serviceRequest.notes}
                                    </div>
                                </>
                            )}

                            <div className="text-sm font-medium">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}:</div>
                            <div className={`font-bold ${isRTL ? 'text-left font-arabic' : ''}`}>₪{serviceRequest.price} {serviceRequest.currency || 'ILS'}</div>
                        </div>
                    ) : (
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
                    )}
                </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle className={isRTL ? 'text-left font-arabic' : 'text-left'}>
                        {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </CardTitle>
                    <CardDescription className={isRTL ? 'text-left font-arabic' : 'text-left'}>
                        {isRTL ? 'اختر طريقة الدفع المفضلة' : 'Choose your preferred payment method'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setPaymentMethod('cash');
                            }}
                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'cash'
                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <Banknote className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`font-medium ${paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-700'}`}>
                                {isRTL ? 'نقدي' : 'Cash'}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('visa')}
                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'visa'
                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <CreditCard className={`h-6 w-6 ${paymentMethod === 'visa' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`font-medium ${paymentMethod === 'visa' ? 'text-blue-600' : 'text-gray-700'}`}>
                                {isRTL ? 'بطاقة ائتمانية' : 'Credit Card'}
                            </span>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Form - Cash */}
            {paymentMethod === 'cash' && (
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
                        <form onSubmit={isServiceRequestPayment ? handleServiceRequestPayment : handleCashSubmit} className="space-y-6">
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
                                disabled={isProcessing || !agreedToCashTerms || (!isServiceRequestPayment && !appointmentId) || (isServiceRequestPayment && !serviceRequest)}
                                style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                            >
                                {isProcessing ? t('payment.processing') : t('payment.confirmCashPayment')}
                            </Button>
                            {!isServiceRequestPayment && !appointmentId && (
                                <div className="text-sm text-amber-700">
                                    {t('payment.loadingPaymentInfo') || 'Preparing your booking...'}
                                </div>
                            )}
                            {isServiceRequestPayment && !serviceRequest && (
                                <div className="text-sm text-amber-700">
                                    {isRTL ? 'جاري تحميل تفاصيل الطلب...' : 'Loading service request details...'}
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
            )}

            {/* Payment Form - Visa */}
            {paymentMethod === 'visa' && (
            <Card dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle className={isRTL ? 'text-left font-arabic' : 'text-left'}>
                        {isRTL ? 'الدفع بالبطاقة الائتمانية' : 'Credit Card Payment'}
                    </CardTitle>
                    <CardDescription className={isRTL ? 'text-left font-arabic' : 'text-left'}>
                        {isRTL ? 'أدخل معلومات بطاقتك الائتمانية' : 'Enter your credit card information'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleHostedCheckout} className="space-y-6 py-2" dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-800">
                            {isRTL
                                ? 'ستتم إعادة توجيهك إلى صفحة الدفع الآمنة الخاصة بـ CyberSource لإدخال تفاصيل البطاقة وإكمال العملية.'
                                : 'You will be redirected to CyberSource’s secure checkout page to enter your card details and complete the payment.'}
                        </div>
                        <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {!isRTL && (
                                <Checkbox
                                    id="visaTerms"
                                    checked={agreedToCashTerms}
                                    onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                />
                            )}
                            <div className="grid gap-1.5 leading-none flex-1">
                                <label
                                    htmlFor="visaTerms"
                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? 'text-right' : 'text-left'}`}
                                >
                                    {isRTL
                                        ? 'أوافق على معالجة الدفع عبر بوابة آمنة وأتحمل الرسوم المرتبطة'
                                        : 'I agree to proceed to the secure payment gateway and accept associated fees'}
                                </label>
                            </div>
                            {isRTL && (
                                <Checkbox
                                    id="visaTerms"
                                    checked={agreedToCashTerms}
                                    onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                />
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isProcessing || !agreedToCashTerms || (!isServiceRequestPayment && !appointmentId) || (isServiceRequestPayment && !serviceRequest)}
                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                        >
                            {isProcessing
                                ? (isRTL ? 'جاري التحويل...' : 'Redirecting...')
                                : (isRTL
                                    ? `دفع ₪${isServiceRequestPayment ? serviceRequest?.price || price : price}`
                                    : `Pay ₪${isServiceRequestPayment ? serviceRequest?.price || price : price}`)
                            }
                        </Button>
                        {!isServiceRequestPayment && !appointmentId && (
                            <div className="text-sm text-amber-700">
                                {t('payment.loadingPaymentInfo') || 'Preparing your booking...'}
                            </div>
                        )}
                        {isServiceRequestPayment && !serviceRequest && (
                            <div className="text-sm text-amber-700">
                                {isRTL ? 'جاري تحميل تفاصيل الطلب...' : 'Loading service request details...'}
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className={`justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                    <Button variant="outline" onClick={() => navigate("/clinics")}
                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                        {t('payment.back')}
                    </Button>
                    <div className="text-sm text-gray-500">
                        {isRTL ? 'جميع المعاملات محمية بتشفير SSL' : 'All transactions are protected by SSL encryption'}
                    </div>
                </CardFooter>
            </Card>
            )}
        </div>
    );
};

export default Payment;
