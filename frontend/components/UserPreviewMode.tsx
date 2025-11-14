import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    Calendar,
    Clock,
    User,
    MapPin,
    FileText,
    Stethoscope,
    Eye,
    Download,
    AlertCircle,
    CheckCircle,
    XCircle,
    Image as ImageIcon,
    FlaskConical,
    FileImage,
    ChevronLeft,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { UltrasoundIcon } from './icons/UltrasoundIcon';
import { AudiometryIcon } from './icons/AudiometryIcon';
import { Skeleton } from './ui/skeleton';

interface UserPreviewModeProps {
    userEmail: string;
}

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
    payment_method?: string;
    booking_status: string;
    created_at: string;
    updated_at: string;
    source?: 'appointments' | 'payment_bookings';
}

interface ClinicalNote {
    id: number;
    patient_id: number;
    doctor_id: number;
    doctor_name: string;
    note_type: 'consultation' | 'diagnosis' | 'treatment' | 'follow_up' | 'general';
    chief_complaint?: string;
    present_illness?: string;
    examination_findings?: string;
    diagnosis?: string;
    treatment_plan?: string;
    medications?: string;
    follow_up_date?: string;
    follow_up_notes?: string;
    vital_signs?: {
        blood_pressure?: string;
        heart_rate?: string;
        temperature?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
        weight?: string;
        height?: string;
    };
    notes: string;
    status: 'active' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
}

interface LabResult {
    id: number;
    patient_id: number;
    patient_name: string;
    patient_email: string;
    date_of_birth: string;
    blood_type: string;
    test_date: string;
    test_type: string;
    test_results: string;
    doctor_notes: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

interface XRayImage {
    id: number;
    patient_id: number;
    patient_name: string;
    date_of_birth: string;
    body_part: string[];
    indication: string;
    requesting_doctor: string;
    image_url: string;
    created_at: string;
}

interface UltrasoundImage {
    id: number;
    patient_id: number;
    patient_name: string;
    date_of_birth: string;
    body_part: string[];
    indication: string;
    requesting_doctor: string;
    image_url: string;
    created_at: string;
}

interface AudiometryImage {
    id: number;
    patient_id: number;
    patient_name: string;
    date_of_birth: string;
    notes?: string;
    requesting_doctor: string;
    image_url?: string;
    image_public_url?: string;
    left_ear_result?: 'passed' | 'failed' | null;
    right_ear_result?: 'passed' | 'failed' | null;
    created_at: string;
}

interface ServiceRequest {
    id: number;
    patient_id: number;
    patient_email: string;
    patient_name: string;
    doctor_id: number;
    doctor_name: string;
    service_type: 'xray' | 'ultrasound' | 'lab' | 'audiometry';
    service_subtype?: string;
    service_name?: string;
    service_name_ar?: string;
    notes?: string;
    price?: number;
    currency?: string;
    payment_status?: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
    status: 'pending' | 'secretary_confirmed' | 'payment_required' | 'in_progress' | 'completed' | 'cancelled';
    secretary_confirmed_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

const UserPreviewMode: React.FC<UserPreviewModeProps> = ({ userEmail }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { user } = useAuth();
    const isFetchingRef = useRef(false);

    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [xrayImages, setXrayImages] = useState<XRayImage[]>([]);
    const [ultrasoundImages, setUltrasoundImages] = useState<UltrasoundImage[]>([]);
    const [audiometryImages, setAudiometryImages] = useState<AudiometryImage[]>([]);
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [servicesPage, setServicesPage] = useState(1);
    const itemsPerPage = 3; // Show 3 items per page
    const [selectedTab, setSelectedTab] = useState<'appointments' | 'notes' | 'labs' | 'xrays' | 'ultrasound' | 'audiometry' | 'services'>('appointments');

    // Load all user data
    const loadUserData = async () => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            setIsLoading(true);
            setError(null);

            // Get user ID from email
            const { data: userData, error: userError } = await supabase
                .from('userinfo')
                .select('userid')
                .eq('user_email', userEmail)
                .single();

            if (userError || !userData) {
                throw new Error('User not found');
            }

            const userId = userData.userid;

            // Load appointments from both payment_bookings and appointments tables
            const [appointmentsFromBookings, appointmentsFromTable] = await Promise.all([
                supabase
                    .from('payment_bookings')
                    .select('*')
                    .eq('patient_email', userEmail)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('appointments')
                    .select(`
                        id,
                        patient_id,
                        doctor_id,
                        clinic_id,
                        date,
                        time,
                        status,
                        payment_status,
                        payment_method,
                        price,
                        notes,
                        created_at,
                        updated_at,
                        doctors:doctor_id(id, name, name_ar),
                        clinics:clinic_id(id, name, name_ar)
                    `)
                    .eq('patient_id', userId)
                    .order('created_at', { ascending: false })
            ]);

            // Load payment methods for payment_bookings
            let paymentMethodsMap: Record<string, string> = {};
            if (appointmentsFromBookings.data && appointmentsFromBookings.data.length > 0) {
                const bookingIds = appointmentsFromBookings.data.map(apt => apt.id);
                const { data: transactionsData } = await supabase
                    .from('payment_transactions')
                    .select('payment_booking_id, payment_method')
                    .in('payment_booking_id', bookingIds)
                    .order('created_at', { ascending: false });

                if (transactionsData) {
                    transactionsData.forEach(trans => {
                        if (trans.payment_booking_id && !paymentMethodsMap[trans.payment_booking_id]) {
                            paymentMethodsMap[trans.payment_booking_id] = trans.payment_method || '';
                        }
                    });
                }
            }

            // Combine and transform appointments
            const combinedAppointments: PatientAppointment[] = [];
            
            // Add from payment_bookings
            if (appointmentsFromBookings.data) {
                appointmentsFromBookings.data.forEach(apt => {
                    // Get payment method from map or payment_bookings table
                    const paymentMethod = paymentMethodsMap[apt.id] || apt.payment_method;
                    
                    combinedAppointments.push({
                        id: apt.id,
                        patient_name: apt.patient_name || '',
                        patient_email: apt.patient_email || userEmail,
                        patient_phone: apt.patient_phone || '',
                        doctor_name: apt.doctor_name || '',
                        clinic_name: apt.clinic_name || '',
                        specialty: apt.specialty || '',
                        appointment_day: apt.appointment_day || '',
                        appointment_time: apt.appointment_time || '',
                        price: apt.price || 0,
                        payment_status: apt.payment_status || 'pending',
                        payment_method: paymentMethod,
                        booking_status: apt.booking_status || 'scheduled',
                        created_at: apt.created_at,
                        updated_at: apt.updated_at,
                        source: 'payment_bookings'
                    });
                });
            }

            // Add from appointments table
            if (appointmentsFromTable.data) {
                appointmentsFromTable.data.forEach(apt => {
                    const doctorData = apt.doctors as any;
                    const clinicData = apt.clinics as any;
                    const doctorName = doctorData?.name || '';
                    const clinicName = clinicData?.name || '';
                    
                    // Check if already exists (avoid duplicates)
                    const exists = combinedAppointments.some(existing => 
                        existing.appointment_day === apt.date && 
                        existing.appointment_time === apt.time &&
                        existing.doctor_name === doctorName
                    );

                    if (!exists) {
                        combinedAppointments.push({
                            id: apt.id,
                            patient_name: '',
                            patient_email: userEmail,
                            patient_phone: '',
                            doctor_name: doctorName,
                            clinic_name: clinicName,
                            specialty: '',
                            appointment_day: apt.date || '',
                            appointment_time: apt.time || '',
                            price: apt.price || 0,
                            payment_status: apt.payment_status || 'pending',
                            payment_method: apt.payment_method,
                            booking_status: apt.status || 'scheduled',
                            created_at: apt.created_at,
                            updated_at: apt.updated_at,
                            source: 'appointments'
                        });
                    }
                });
            }

            // Sort by created_at descending
            combinedAppointments.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Load clinical notes
            const { data: notesData, error: notesError } = await supabase
                .from('clinical_notes')
                .select('*')
                .eq('patient_id', userId)
                .order('created_at', { ascending: false });

            if (notesError) {
                console.error('Error fetching clinical notes:', notesError);
            }

            // Load lab results
            const { data: labData, error: labError } = await supabase
                .from('lab_results')
                .select('*')
                .eq('patient_email', userEmail)
                .order('created_at', { ascending: false });

            if (labError) {
                console.error('Error fetching lab results:', labError);
            }

            // Load X-ray images (filter by patient_id; xray_images has no patient_email)
            const { data: xrayData, error: xrayError } = await supabase
                .from('xray_images')
                .select('*')
                .eq('patient_id', userId)
                .order('created_at', { ascending: false });

            if (xrayError) {
                console.error('Error fetching X-ray images:', xrayError);
            }

            // Load Ultrasound images
            const { data: ultrasoundData, error: ultrasoundError } = await supabase
                .from('ultrasound_images')
                .select('*')
                .eq('patient_id', userId)
                .order('created_at', { ascending: false });

            if (ultrasoundError) {
                console.error('Error fetching Ultrasound images:', ultrasoundError);
            }

            // Load Audiometry records
            const { data: audiometryData, error: audiometryError } = await supabase
                .from('audiometry_images')
                .select('*')
                .eq('patient_id', userId)
                .order('created_at', { ascending: false });

            if (audiometryError) {
                console.error('Error fetching Audiometry records:', audiometryError);
            }

            // Load service requests (only confirmed/completed ones for medical records)
            const { data: serviceRequestsData, error: serviceRequestsError } = await supabase
                .from('service_requests')
                .select('*')
                .eq('patient_email', userEmail)
                .in('status', ['secretary_confirmed', 'payment_required', 'in_progress', 'completed'])
                .order('created_at', { ascending: false });

            if (serviceRequestsError) {
                console.error('Error fetching service requests:', serviceRequestsError);
            }
            
            console.log('📋 Medical Records - Service Requests Found:', serviceRequestsData?.length || 0, serviceRequestsData);

            // Load pricing info for service requests with subtypes
            let enrichedServiceRequests: ServiceRequest[] = serviceRequestsData || [];
            if (enrichedServiceRequests.length > 0) {
                // Use Promise.all to load pricing data in parallel
                const pricingPromises = enrichedServiceRequests.map(async (request) => {
                    if (request.service_subtype) {
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

                enrichedServiceRequests = await Promise.all(pricingPromises);
            }

            // Transform and set data
            setAppointments(combinedAppointments);
            setClinicalNotes(notesData || []);
            setLabResults(labData || []);
            setXrayImages(xrayData || []);
            setUltrasoundImages(ultrasoundData || []);
            setAudiometryImages(audiometryData || []);
            setServiceRequests(enrichedServiceRequests);
            
            console.log('📋 Medical Records - Enriched Service Requests:', enrichedServiceRequests.length, enrichedServiceRequests);

        } catch (error) {
            console.error('Error loading user data:', error);
            setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        if (userEmail) {
            loadUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatBodyParts = (bodyParts: string[] | string): string => {
        if (Array.isArray(bodyParts)) {
            return bodyParts.join(', ');
        }
        return bodyParts || '';
    };

    const getImageUrl = (imagePath: string, bucket: 'xray-images' | 'ultrasound-images' | 'audiometry-images' = 'xray-images'): string => {
        if (!imagePath) return '';

        try {
            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(imagePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return '';
        }
    };

    const getUltrasoundImageUrl = (imagePath: string): string => {
        return getImageUrl(imagePath, 'ultrasound-images');
    };

    const getAudiometryImageUrl = (imagePath: string): string => {
        return getImageUrl(imagePath, 'audiometry-images');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDownloadReport = (type: 'lab' | 'note', data: any) => {
        let content = '';
        let filename = '';

        if (type === 'lab') {
            content = `
Lab Test Report
================
Name: ${data.patient_name}
Patient ID: ${data.patient_id}
Email: ${data.patient_email}
Date of Birth: ${data.date_of_birth || 'N/A'}
Blood Type: ${data.blood_type || 'N/A'}
Test Date: ${new Date(data.test_date).toLocaleDateString()}
Test Type: ${data.test_type}

Test Results:
${data.test_results}

Doctor's Notes:
${data.doctor_notes || 'No notes provided'}

Created At: ${new Date(data.created_at).toLocaleString()}
            `;
            filename = `lab_report_${data.patient_name}_${data.test_date}.txt`;
        } else if (type === 'note') {
            content = `
Clinical Note Report
===================
Patient: ${data.patient_name || 'N/A'}
Doctor: ${data.doctor_name}
Note Type: ${data.note_type}
Status: ${data.status}
Priority: ${data.priority}
Date: ${new Date(data.created_at).toLocaleDateString()}

Notes:
${data.notes}

${data.diagnosis ? `Diagnosis: ${data.diagnosis}` : ''}
${data.treatment_plan ? `Treatment Plan: ${data.treatment_plan}` : ''}
${data.medications ? `Medications: ${data.medications}` : ''}
${data.follow_up_date ? `Follow-up Date: ${new Date(data.follow_up_date).toLocaleDateString()}` : ''}
            `;
            filename = `clinical_note_${data.doctor_name}_${new Date(data.created_at).toLocaleDateString()}.txt`;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 px-2 sm:px-0">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} className="h-10 min-w-[100px] flex-shrink-0" />
                    ))}
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mx-2 sm:mx-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-4">
            {/* Tab Navigation - Mobile & Desktop Optimized */}
            <div className="border-b overflow-x-auto">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 px-2 sm:flex sm:gap-2 sm:px-0 pb-1">
                    <Button
                        variant={selectedTab === 'appointments' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('appointments')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'appointments' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <Calendar className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.appointments')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {appointments.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'notes' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('notes')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'notes' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <FileText className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.notes')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {clinicalNotes.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'labs' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('labs')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'labs' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <FlaskConical className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.labs')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {labResults.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'xrays' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('xrays')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'xrays' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <ImageIcon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.xrays')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {xrayImages.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'ultrasound' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('ultrasound')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'ultrasound' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <UltrasoundIcon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.ultrasound')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {ultrasoundImages.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'audiometry' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('audiometry')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'audiometry' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <AudiometryIcon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{t('preview.audiometry')}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {audiometryImages.length}
                            </Badge>
                        </div>
                    </Button>
                    <Button
                        variant={selectedTab === 'services' ? 'default' : 'ghost'}
                        onClick={() => setSelectedTab('services')}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 h-auto transition-all ${selectedTab === 'services' ? 'shadow-sm' : ''
                            }`}
                        size="sm"
                    >
                        <Stethoscope className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                            <span className="text-[9px] leading-tight sm:text-sm font-medium text-center">{isRTL ? 'الخدمات' : 'Services'}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-auto">
                                {serviceRequests.length}
                            </Badge>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Content based on selected tab */}
            {selectedTab === 'appointments' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {appointments.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {t('preview.noAppointmentsFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        appointments.map((appointment) => (
                            <Card key={appointment.id} className="overflow-hidden">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 text-base sm:text-lg">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                            <span className="truncate">{appointment.doctor_name}</span>
                                        </span>
                                        <Badge className={`${getStatusColor(appointment.payment_status)} text-xs self-start sm:self-auto whitespace-nowrap`}>
                                            {t(`common.${appointment.payment_status}`)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-sm break-words">{appointment.clinic_name}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Stethoscope className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-sm break-words">{appointment.specialty}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-sm break-words">
                                                    {appointment.appointment_day} {t('common.at')} {appointment.appointment_time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t space-y-2">
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                {t('preview.created')}: {new Date(appointment.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm sm:text-base font-medium">
                                                    {t('preview.price')}: ₪{appointment.price}
                                                </div>
                                                {appointment.payment_status === 'paid' && appointment.payment_method && (
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                                        <span className="text-xs sm:text-sm text-muted-foreground capitalize">
                                                            {appointment.payment_method === 'visa' ? 'Visa' : appointment.payment_method}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {selectedTab === 'notes' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {clinicalNotes.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {t('preview.noMedicalNotesFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        clinicalNotes.map((note) => (
                            <Card key={note.id} className="overflow-hidden">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex flex-col gap-2">
                                        <span className="flex items-center gap-2 text-base sm:text-lg">
                                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                            <span className="truncate">{note.doctor_name}</span>
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={`${getPriorityColor(note.priority)} text-xs`}>
                                                {t(`common.${note.priority}`)}
                                            </Badge>
                                            <Badge className={`${getStatusColor(note.status)} text-xs`}>
                                                {t(`common.${note.status}`)}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <h4 className="font-medium mb-1 text-sm">{t('preview.noteType')}</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground capitalize">{t(`common.${note.note_type}`)}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-1 text-sm">{t('preview.date')}</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {note.notes && (
                                            <div>
                                                <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.notes')}</h4>
                                                <p className={`text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.notes}
                                                </p>
                                            </div>
                                        )}

                                        {note.diagnosis && (
                                            <div>
                                                <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.diagnosis')}</h4>
                                                <p className={`text-xs sm:text-sm bg-blue-50 p-2 sm:p-3 rounded break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.diagnosis}
                                                </p>
                                            </div>
                                        )}

                                        {note.treatment_plan && (
                                            <div>
                                                <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.treatmentPlan')}</h4>
                                                <p className={`text-xs sm:text-sm bg-green-50 p-2 sm:p-3 rounded break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.treatment_plan}
                                                </p>
                                            </div>
                                        )}

                                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} pt-2`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadReport('note', note)}
                                                className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="whitespace-nowrap">{t('preview.downloadReport')}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {selectedTab === 'labs' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {labResults.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {t('preview.noLabResultsFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        labResults.map((result) => (
                            <Card key={result.id} className="overflow-hidden">
                                    <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 text-base sm:text-lg">
                                            <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                            <span className="truncate">{result.test_type}</span>
                                        </span>
                                        <Badge variant="outline" className="text-xs self-start sm:self-auto whitespace-nowrap">
                                            {new Date(result.test_date).toLocaleDateString()}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <h4 className="font-medium mb-1 text-sm">{t('preview.testType')}</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground break-words">{result.test_type}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-1 text-sm">{t('preview.bloodType')}</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground">{result.blood_type || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.testResults')}</h4>
                                            <div
                                                className={`text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded overflow-auto ${isRTL ? 'text-right rtl-content' : 'text-left ltr-content'}`}
                                                style={isRTL ? {
                                                    direction: 'rtl',
                                                    textAlign: 'right',
                                                    unicodeBidi: 'bidi-override',
                                                    writingMode: 'horizontal-tb',
                                                    wordBreak: 'break-word'
                                                } : {
                                                    direction: 'ltr',
                                                    textAlign: 'left',
                                                    wordBreak: 'break-word'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: result.test_results }}
                                            />
                                        </div>

                                        {result.doctor_notes && (
                                            <div>
                                                <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.doctorNotes')}</h4>
                                                <div
                                                    className={`text-xs sm:text-sm bg-blue-50 p-2 sm:p-3 rounded overflow-auto ${isRTL ? 'text-right rtl-content' : 'text-left ltr-content'}`}
                                                    style={isRTL ? {
                                                        direction: 'rtl',
                                                        textAlign: 'right',
                                                        unicodeBidi: 'bidi-override',
                                                        writingMode: 'horizontal-tb',
                                                        wordBreak: 'break-word'
                                                    } : {
                                                        direction: 'ltr',
                                                        textAlign: 'left',
                                                        wordBreak: 'break-word'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: result.doctor_notes }}
                                                />
                                            </div>
                                        )}

                                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} pt-2`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadReport('lab', result)}
                                                className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="whitespace-nowrap">{t('preview.downloadReport')}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {selectedTab === 'xrays' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {xrayImages.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {t('preview.noXrayImagesFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {xrayImages.map((image) => (
                                <Card key={image.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate text-sm sm:text-base">{formatBodyParts(image.body_part)}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={getImageUrl(image.image_url)}
                                                    alt={`X-ray of ${formatBodyParts(image.body_part)}`}
                                                    className="w-full h-full object-contain cursor-pointer"
                                                    onClick={() => window.open(getImageUrl(image.image_url), '_blank')}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm">{t('preview.requestingDoctor')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{image.requesting_doctor || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm">{t('preview.date')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        {new Date(image.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {image.indication && (
                                                    <div>
                                                        <h4 className="font-medium text-xs sm:text-sm">{t('preview.clinicalIndication')}</h4>
                                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{image.indication}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedTab === 'ultrasound' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {ultrasoundImages.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {isRTL ? 'لا توجد صور الموجات فوق الصوتية' : 'No ultrasound images found'}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {ultrasoundImages.map((image) => (
                                <Card key={image.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <UltrasoundIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate text-sm sm:text-base">{formatBodyParts(image.body_part)}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={getUltrasoundImageUrl(image.image_url)}
                                                    alt={`Ultrasound of ${formatBodyParts(image.body_part)}`}
                                                    className="w-full h-full object-contain cursor-pointer"
                                                    onClick={() => window.open(getUltrasoundImageUrl(image.image_url), '_blank')}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm">{t('preview.requestingDoctor')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{image.requesting_doctor || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm">{t('preview.date')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        {new Date(image.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {image.indication && (
                                                    <div>
                                                        <h4 className="font-medium text-xs sm:text-sm">{t('preview.clinicalIndication')}</h4>
                                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{image.indication}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedTab === 'audiometry' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {audiometryImages.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {isRTL ? 'لا توجد سجلات قياس السمع' : 'No audiometry records found'}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {audiometryImages.map((record) => (
                                <Card key={record.id} className="overflow-hidden">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <AudiometryIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                            <span className="truncate">{isRTL ? 'قياس السمع' : 'Audiometry Test'}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm mb-1">{t('preview.requestingDoctor')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{record.requesting_doctor || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-xs sm:text-sm mb-1">{t('preview.date')}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        {new Date(record.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Exam Results */}
                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <h4 className="font-medium text-xs sm:text-sm mb-2">{isRTL ? 'الأذن اليسرى' : 'Left Ear'}</h4>
                                                    {record.left_ear_result === 'passed' ? (
                                                        <div className="flex items-center justify-center gap-1 text-green-600">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-xs sm:text-sm font-medium">{isRTL ? 'نجح' : 'Passed'}</span>
                                                        </div>
                                                    ) : record.left_ear_result === 'failed' ? (
                                                        <div className="flex items-center justify-center gap-1 text-red-600">
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="text-xs sm:text-sm font-medium">{isRTL ? 'فشل' : 'Failed'}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm text-muted-foreground">{isRTL ? 'غير متوفر' : 'N/A'}</span>
                                                    )}
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <h4 className="font-medium text-xs sm:text-sm mb-2">{isRTL ? 'الأذن اليمنى' : 'Right Ear'}</h4>
                                                    {record.right_ear_result === 'passed' ? (
                                                        <div className="flex items-center justify-center gap-1 text-green-600">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-xs sm:text-sm font-medium">{isRTL ? 'نجح' : 'Passed'}</span>
                                                        </div>
                                                    ) : record.right_ear_result === 'failed' ? (
                                                        <div className="flex items-center justify-center gap-1 text-red-600">
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="text-xs sm:text-sm font-medium">{isRTL ? 'فشل' : 'Failed'}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm text-muted-foreground">{isRTL ? 'غير متوفر' : 'N/A'}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {record.notes && (
                                                <div className="bg-muted p-3 rounded-lg">
                                                    <h4 className={`font-medium mb-2 text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'ملاحظات' : 'Notes'}</h4>
                                                    <p className={`text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'} break-words`}>{record.notes}</p>
                                                </div>
                                            )}

                                            {record.image_url && (
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={getAudiometryImageUrl(record.image_url) || record.image_public_url || ''}
                                                        alt="Audiometry record"
                                                        className="w-full h-full object-contain cursor-pointer"
                                                        onClick={() => window.open(getAudiometryImageUrl(record.image_url || '') || record.image_public_url || '', '_blank')}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedTab === 'services' && (
                <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                    {serviceRequests.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {isRTL ? 'لا توجد طلبات خدمة' : 'No service requests found'}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {(() => {
                                // Pagination for service requests
                                const startIndex = (servicesPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const paginatedServiceRequests = serviceRequests.slice(startIndex, endIndex);
                                const totalServicesPages = Math.ceil(serviceRequests.length / itemsPerPage);
                                
                                return (
                                    <>
                                        {paginatedServiceRequests.map((request) => (
                            <Card key={request.id} className="overflow-hidden">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 text-base sm:text-lg">
                                            <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                            <span className="truncate">
                                                {isRTL ?
                                                    (request.service_type === 'xray' ? 'أشعة إكس' :
                                                        request.service_type === 'ultrasound' ? 'موجات فوق صوتية' :
                                                            request.service_type === 'lab' ? 'مختبر' : 'قياس السمع')
                                                    : request.service_type.toUpperCase()}
                                                {request.service_subtype && (
                                                    <span className="text-sm font-normal text-gray-600 ml-2">
                                                        {`- ${isRTL ? (request.service_name_ar || request.service_name) : (request.service_name || request.service_name_ar)}`}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                        <Badge className={`${getStatusColor(request.status)} text-xs self-start sm:self-auto whitespace-nowrap`}>
                                            {isRTL ?
                                                (request.status === 'payment_required' ? 'دفع مطلوب' :
                                                    request.status === 'pending' ? 'قيد الانتظار' :
                                                        request.status === 'secretary_confirmed' ? 'مؤكد' :
                                                            request.status === 'in_progress' ? 'قيد المعالجة' :
                                                                request.status === 'completed' ? 'مكتمل' : request.status)
                                                : request.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-muted-foreground">{isRTL ? 'الطبيب' : 'Doctor'}: </span>
                                                <span>{request.doctor_name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-muted-foreground">{isRTL ? 'تاريخ الطلب' : 'Request Date'}: </span>
                                                <span>{new Date(request.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                                            </div>
                                            {request.secretary_confirmed_at && (
                                                <div>
                                                    <span className="font-medium text-muted-foreground">{isRTL ? 'تاريخ التأكيد' : 'Confirmed Date'}: </span>
                                                    <span className="text-green-600">{new Date(request.secretary_confirmed_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                                                </div>
                                            )}
                                            {request.completed_at && (
                                                <div>
                                                    <span className="font-medium text-muted-foreground">{isRTL ? 'تاريخ الإكمال' : 'Completed Date'}: </span>
                                                    <span className="text-blue-600">{new Date(request.completed_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                                                </div>
                                            )}
                                            {request.price && request.price > 0 && (
                                                <div>
                                                    <span className="font-medium text-muted-foreground">{isRTL ? 'السعر' : 'Price'}: </span>
                                                    <span className="font-semibold">₪{request.price} {request.currency || 'ILS'}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-muted-foreground">{isRTL ? 'حالة الدفع' : 'Payment Status'}: </span>
                                                <Badge variant={request.payment_status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                                                    {isRTL ?
                                                        (request.payment_status === 'paid' ? 'مدفوع' :
                                                            request.payment_status === 'pending' ? 'قيد الانتظار' : request.payment_status)
                                                        : request.payment_status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {request.notes && (
                                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                                                <h4 className={`font-medium mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}</h4>
                                                <p className={`text-xs sm:text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{request.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                                        ))}
                                        {totalServicesPages > 1 && (
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
                                                        onClick={() => setServicesPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={servicesPage === 1}
                                                    >
                                                        <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                        {isRTL ? 'التالي' : 'Previous'}
                                                    </Button>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: totalServicesPages }, (_, i) => i + 1).map((page) => (
                                                            <Button
                                                                key={page}
                                                                variant={servicesPage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setServicesPage(page)}
                                                                className="min-w-[2.5rem]"
                                                            >
                                                                {page}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setServicesPage(prev => Math.min(prev + 1, totalServicesPages))}
                                                        disabled={servicesPage === totalServicesPages}
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
                        </>
                    )}
                </div>
            )}

        </div>
    );
};

export default UserPreviewMode;