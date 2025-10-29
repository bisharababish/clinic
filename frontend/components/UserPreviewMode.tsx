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
    TestTube,
    FileImage
} from 'lucide-react';
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

const UserPreviewMode: React.FC<UserPreviewModeProps> = ({ userEmail }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { user } = useAuth();
    const isFetchingRef = useRef(false);

    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [xrayImages, setXrayImages] = useState<XRayImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'appointments' | 'notes' | 'labs' | 'xrays'>('appointments');

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

            // Load appointments
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('payment_bookings')
                .select('*')
                .eq('patient_email', userEmail)
                .order('created_at', { ascending: false });

            if (appointmentsError) {
                console.error('Error fetching appointments:', appointmentsError);
            }

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

            // Load X-ray images
            const { data: xrayData, error: xrayError } = await supabase
                .from('xray_images')
                .select('*')
                .eq('patient_email', userEmail)
                .order('created_at', { ascending: false });

            if (xrayError) {
                console.error('Error fetching X-ray images:', xrayError);
            }

            // Transform and set data
            setAppointments(appointmentsData || []);
            setClinicalNotes(notesData || []);
            setLabResults(labData || []);
            setXrayImages(xrayData || []);

        } catch (error) {
            console.error('Error loading user data:', error);
            setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        loadUserData();
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

    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';

        try {
            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            const { data } = supabase.storage
                .from('xray-images')
                .getPublicUrl(imagePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return '';
        }
    };

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
            <div className="space-y-6">
                <div className="flex space-x-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-32" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b overflow-x-auto py-1 -mx-1 px-1">
                <Button
                    variant={selectedTab === 'appointments' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTab('appointments')}
                    className="flex items-center gap-2 shrink-0"
                >
                    <Calendar className="h-4 w-4" />
                    {t('preview.appointments')}
                    <Badge variant="secondary" className="ml-2">
                        {appointments.length}
                    </Badge>
                </Button>
                <Button
                    variant={selectedTab === 'notes' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTab('notes')}
                    className="flex items-center gap-2 shrink-0"
                >
                    <FileText className="h-4 w-4" />
                    {t('preview.notes')}
                    <Badge variant="secondary" className="ml-2">
                        {clinicalNotes.length}
                    </Badge>
                </Button>
                <Button
                    variant={selectedTab === 'labs' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTab('labs')}
                    className="flex items-center gap-2 shrink-0"
                >
                    <TestTube className="h-4 w-4" />
                    {t('preview.labs')}
                    <Badge variant="secondary" className="ml-2">
                        {labResults.length}
                    </Badge>
                </Button>
                <Button
                    variant={selectedTab === 'xrays' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTab('xrays')}
                    className="flex items-center gap-2 shrink-0"
                >
                    <ImageIcon className="h-4 w-4" />
                    {t('preview.xrays')}
                    <Badge variant="secondary" className="ml-2">
                        {xrayImages.length}
                    </Badge>
                </Button>
            </div>

            {/* Content based on selected tab */}
            {selectedTab === 'appointments' && (
                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('preview.noAppointmentsFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        appointments.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardHeader>
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 min-w-0">
                                            <Calendar className="h-5 w-5" />
                                            <span className="truncate">{appointment.doctor_name}</span>
                                        </span>
                                        <Badge className={getStatusColor(appointment.payment_status)}>
                                            {t(`common.${appointment.payment_status}`)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{appointment.clinic_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{appointment.specialty}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {appointment.appointment_day} at {appointment.appointment_time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                {t('preview.created')}: {new Date(appointment.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {t('preview.price')}: ₪{appointment.price}
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
                <div className="space-y-4">
                    {clinicalNotes.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('preview.noMedicalNotesFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        clinicalNotes.map((note) => (
                            <Card key={note.id}>
                                <CardHeader>
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 min-w-0">
                                            <FileText className="h-5 w-5" />
                                            <span className="truncate">{note.doctor_name}</span>
                                        </span>
                                        <div className="flex gap-2 flex-wrap">
                                            <Badge className={getPriorityColor(note.priority)}>
                                                {t(`common.${note.priority}`)}
                                            </Badge>
                                            <Badge className={getStatusColor(note.status)}>
                                                {t(`common.${note.status}`)}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium mb-2">{t('preview.noteType')}</h4>
                                                <p className="text-sm text-muted-foreground capitalize">{t(`common.${note.note_type}`)}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">{t('preview.date')}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {note.notes && (
                                            <div>
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.notes')}</h4>
                                                <p className={`text-sm bg-muted p-3 rounded ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.notes}
                                                </p>
                                            </div>
                                        )}

                                        {note.diagnosis && (
                                            <div>
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.diagnosis')}</h4>
                                                <p className={`text-sm bg-blue-50 p-3 rounded ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.diagnosis}
                                                </p>
                                            </div>
                                        )}

                                        {note.treatment_plan && (
                                            <div>
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.treatmentPlan')}</h4>
                                                <p className={`text-sm bg-green-50 p-3 rounded ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {note.treatment_plan}
                                                </p>
                                            </div>
                                        )}

                                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadReport('note', note)}
                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                <Download className="h-4 w-4" />
                                                {t('preview.downloadReport')}
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
                <div className="space-y-4">
                    {labResults.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('preview.noLabResultsFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        labResults.map((result) => (
                            <Card key={result.id}>
                                <CardHeader>
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="flex items-center gap-2 min-w-0">
                                            <TestTube className="h-5 w-5" />
                                            <span className="truncate">{result.test_type}</span>
                                        </span>
                                        <Badge variant="outline">
                                            {new Date(result.test_date).toLocaleDateString()}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium mb-2">{t('preview.testType')}</h4>
                                                <p className="text-sm text-muted-foreground">{result.test_type}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">{t('preview.bloodType')}</h4>
                                                <p className="text-sm text-muted-foreground">{result.blood_type || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.testResults')}</h4>
                                            <div
                                                className={`text-sm bg-muted p-3 rounded ${isRTL ? 'text-right rtl-content' : 'text-left ltr-content'}`}
                                                style={isRTL ? {
                                                    direction: 'rtl',
                                                    textAlign: 'right',
                                                    unicodeBidi: 'bidi-override',
                                                    writingMode: 'horizontal-tb',
                                                    textDirection: 'rtl'
                                                } : {
                                                    direction: 'ltr',
                                                    textAlign: 'left'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: result.test_results }}
                                            />
                                        </div>

                                        {result.doctor_notes && (
                                            <div>
                                                <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('preview.doctorNotes')}</h4>
                                                <div
                                                    className={`text-sm bg-blue-50 p-3 rounded ${isRTL ? 'text-right rtl-content' : 'text-left ltr-content'}`}
                                                    style={isRTL ? {
                                                        direction: 'rtl',
                                                        textAlign: 'right',
                                                        unicodeBidi: 'bidi-override',
                                                        writingMode: 'horizontal-tb',
                                                        textDirection: 'rtl'
                                                    } : {
                                                        direction: 'ltr',
                                                        textAlign: 'left'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: result.doctor_notes }}
                                                />
                                            </div>
                                        )}

                                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadReport('lab', result)}
                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                <Download className="h-4 w-4" />
                                                {t('preview.downloadReport')}
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
                <div className="space-y-4">
                    {xrayImages.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('preview.noXrayImagesFound')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {xrayImages.map((image) => (
                                <Card key={image.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            {formatBodyParts(image.body_part)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={getImageUrl(image.image_url)}
                                                    alt={`X-ray of ${formatBodyParts(image.body_part)}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <h4 className="font-medium text-sm">{t('preview.requestingDoctor')}</h4>
                                                    <p className="text-sm text-muted-foreground">{image.requesting_doctor || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm">{t('preview.date')}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(image.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {image.indication && (
                                                    <div>
                                                        <h4 className="font-medium text-sm">{t('preview.clinicalIndication')}</h4>
                                                        <p className="text-sm text-muted-foreground">{image.indication}</p>
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
        </div>
    );
};

export default UserPreviewMode;
