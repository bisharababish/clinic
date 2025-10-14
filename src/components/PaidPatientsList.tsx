import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Calendar,
    DollarSign,
    Search,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminState } from '@/hooks/useAdminState';
import MarkPaymentPaid from './MarkPaymentPaid';

interface PaidPatient {
    id: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    unique_patient_id: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    amount: number;
    payment_status: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
    payment_method: string;
    confirmation_number: string;
    created_at: string;
    updated_at: string;
    source: 'payment_bookings';
}

interface PaidPatientsListProps {
    showOnlyPaid?: boolean;
    showOnlyPending?: boolean;
    showTodayOnly?: boolean;
    compact?: boolean;
}

const PaidPatientsList: React.FC<PaidPatientsListProps> = ({
    showOnlyPaid = false,
    showOnlyPending = false,
    showTodayOnly = false,
    compact = false
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { isLoading: adminLoading } = useAdminState();

    const [patients, setPatients] = useState<PaidPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<PaidPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Load patient payment data from both sources
    const loadPaidPatients = useCallback(async () => {
        try {
            setIsLoading(true);

            // Check if user is authenticated first - only check once
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                console.error('No valid session found:', sessionError);
                setPatients([]);
                setFilteredPatients([]);
                return;
            }


            // Fetch only from payment_bookings table (patient-initiated bookings)
            const { data: paymentBookings, error: paymentBookingsError } = await supabase
                .from('payment_bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (paymentBookingsError) {
                console.error('Error fetching payment bookings:', paymentBookingsError);
                setPatients([]);
                setFilteredPatients([]);
                return;
            }

            // Use patient information directly from payment_bookings table
            const paymentBookingsData = paymentBookings.map((booking: any) => {
                // Debug: Log patient information
                console.log('🔍 PaidPatientsList - Payment Booking Debug:', {
                    bookingId: booking.id,
                    patientId: booking.patient_id,
                    storedPatientName: booking.patient_name,
                    storedPatientEmail: booking.patient_email,
                    storedPatientPhone: booking.patient_phone,
                    storedUniqueId: booking.unique_patient_id
                });

                return {
                    id: booking.id,
                    // Use stored patient information directly from payment_bookings
                    patient_name: booking.patient_name || 'Unknown Patient',
                    patient_email: booking.patient_email || '',
                    patient_phone: booking.patient_phone || '',
                    unique_patient_id: booking.unique_patient_id || 'N/A',
                    clinic_name: booking.clinic_name || 'Unknown Clinic',
                    doctor_name: booking.doctor_name || 'Unknown Doctor',
                    specialty: booking.specialty || 'General',
                    appointment_day: booking.appointment_day,
                    appointment_time: booking.appointment_time,
                    amount: booking.price || 0,
                    payment_status: (booking.payment_status || 'pending') as 'pending' | 'paid' | 'completed' | 'failed' | 'refunded',
                    payment_method: 'cash',
                    confirmation_number: `#${booking.id.toString().slice(-8)}`,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                    source: 'payment_bookings' as const
                };
            });

            // Use only payment_bookings data (no appointments table)
            const allPatients = paymentBookingsData;

            // Apply initial filters
            let filtered = allPatients;

            if (showOnlyPaid) {
                filtered = filtered.filter(p => p.payment_status === 'paid' || p.payment_status === 'completed');
            }

            if (showOnlyPending) {
                filtered = filtered.filter(p => p.payment_status === 'pending');
            }

            if (showTodayOnly) {
                const today = new Date().toDateString();
                filtered = filtered.filter(p =>
                    new Date(p.appointment_day).toDateString() === today
                );
            }

            setPatients(filtered);
            setFilteredPatients(filtered);
        } catch (error) {
            console.error('Error loading paid patients:', error);
            // Don't throw error, just log it and show empty state
            setPatients([]);
            setFilteredPatients([]);
        } finally {
            setIsLoading(false);
        }
    }, [showOnlyPaid, showOnlyPending, showTodayOnly]);

    // Real-time subscriptions disabled to prevent infinite loops
    // Data will be refreshed manually or when component mounts

    // Filter patients based on search and status
    useEffect(() => {
        let filtered = patients;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(patient =>
                patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.patient_phone.includes(searchTerm) ||
                patient.unique_patient_id.includes(searchTerm) ||
                patient.confirmation_number.includes(searchTerm) ||
                patient.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'completed') {
                filtered = filtered.filter(patient => patient.payment_status === 'paid' || patient.payment_status === 'completed');
            } else {
                filtered = filtered.filter(patient => patient.payment_status === statusFilter);
            }
        }

        setFilteredPatients(filtered);
    }, [patients, searchTerm, statusFilter]);

    // Load data on mount
    useEffect(() => {
        loadPaidPatients();
    }, [loadPaidPatients]);

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
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    // Get title based on props
    const getTitle = () => {
        if (showOnlyPaid) return isRTL ? 'المرضى المدفوعين' : 'Paid Patients';
        if (showOnlyPending) return isRTL ? 'المدفوعات المعلقة' : 'Pending Payments';
        if (showTodayOnly) return isRTL ? 'مواعيد اليوم' : 'Today\'s Appointments';
        return isRTL ? 'جميع المرضى' : 'All Patients';
    };

    if (isLoading) {
        return (
            <Card dir={isRTL ? 'rtl' : 'ltr'}>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <User className="h-5 w-5" />
                        {getTitle()}
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
                        {getTitle()} ({filteredPatients.length})
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPaidPatients}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isRTL ? 'البحث برقم المريض...' : 'Search by Patient ID...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <option value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                        <option value="completed">{isRTL ? 'مدفوع' : 'Paid'}</option>
                        <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                        <option value="failed">{isRTL ? 'فاشل' : 'Failed'}</option>
                    </select>
                </div>
            </CardHeader>

            <CardContent>
                {filteredPatients.length === 0 ? (
                    <Alert>
                        <AlertDescription>
                            {isRTL ? 'لم يتم العثور على مرضى مطابقين لمعاييرك.' : 'No patients found matching your criteria.'}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        {filteredPatients.map((patient) => (
                            <div
                                key={`${patient.source}-${patient.id}`}
                                className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${(patient.payment_status === 'paid' || patient.payment_status === 'completed') ? 'border-green-200 bg-green-50' :
                                    patient.payment_status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-red-200 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(patient.payment_status)}
                                            <h3 className="font-semibold text-lg">{patient.patient_name}</h3>
                                            <Badge variant={getStatusBadgeVariant(patient.payment_status)}>
                                                {isRTL ?
                                                    (patient.payment_status === 'paid' ? 'مدفوع' :
                                                        patient.payment_status === 'pending' ? 'معلق' :
                                                            patient.payment_status === 'failed' ? 'فاشل' : patient.payment_status) :
                                                    patient.payment_status
                                                }
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {patient.source === 'payment_bookings' ? 'Patient Booking' : 'Admin Created'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {patient.appointment_day} at {patient.appointment_time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Dr. {patient.doctor_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                ₪{patient.amount}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <div>🆔 {isRTL ? 'رقم المريض' : 'Patient ID'}: {patient.unique_patient_id}</div>
                                            <div>📧 {patient.patient_email}</div>
                                            <div>📞 {patient.patient_phone}</div>
                                            <div>🏥 {patient.clinic_name} - {patient.specialty}</div>
                                            <div>📋 {isRTL ? 'تأكيد' : 'Confirmation'}: {patient.confirmation_number}</div>
                                        </div>
                                    </div>

                                    {!compact && (
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                                ₪{patient.amount}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {patient.payment_method}
                                            </div>
                                            {patient.payment_status === 'pending' && (
                                                <div className="mt-2">
                                                    <MarkPaymentPaid
                                                        appointmentId={patient.id}
                                                        patientName={patient.patient_name}
                                                        amount={patient.amount}
                                                        paymentStatus={patient.payment_status as 'pending' | 'paid'}
                                                        onPaymentMarked={loadPaidPatients}
                                                        source={patient.source}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PaidPatientsList;