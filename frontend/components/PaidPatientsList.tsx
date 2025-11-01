import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import '../pages/styles/paidpatients.css';
import { useToast } from '../hooks/use-toast';
import {
    User,
    Calendar,
    DollarSign,
    Search,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminState } from '../hooks/useAdminState';
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

interface PaymentBooking {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    unique_patient_id: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    payment_status: string;
    created_at: string;
    updated_at: string;
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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<PaidPatient | null>(null);
    const { toast } = useToast();

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
            const paymentBookingsData = paymentBookings.map((booking: PaymentBooking) => {
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

    // Delete payment booking
    const deletePayment = async (patientId: string) => {
        try {
            console.log('🗑️ Starting delete process for patient ID:', patientId);

            // First delete related payment transactions
            console.log('🗑️ Deleting payment transactions...');
            const { error: transactionError } = await supabase
                .from('payment_transactions')
                .delete()
                .eq('payment_booking_id', patientId);

            if (transactionError) {
                console.error('Error deleting transactions:', transactionError);
                throw transactionError;
            }

            // Then delete the payment booking
            console.log('🗑️ Deleting payment booking...');
            const { error } = await supabase
                .from('payment_bookings')
                .delete()
                .eq('id', patientId);

            if (error) {
                console.error('Error deleting payment booking:', error);
                throw error;
            }

            console.log('✅ Payment deleted successfully');

            toast({
                title: isRTL ? 'تم حذف الدفع' : 'Payment Deleted',
                description: isRTL ? 'تم حذف الدفع بنجاح' : 'Payment deleted successfully',
            });

            loadPaidPatients(); // Refresh data
            setShowDeleteDialog(false);
            setPatientToDelete(null);
        } catch (error) {
            console.error('❌ Error deleting payment:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في حذف الدفع' : 'Error deleting payment',
                variant: "destructive",
            });
        }
    };

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
        if (showOnlyPending) return isRTL ? 'المدفوعات قيد الانتظار' : 'Pending Payments';
        if (showTodayOnly) return isRTL ? 'مواعيد اليوم' : 'Today\'s Appointments';
        return isRTL ? 'جميع المرضى' : 'All Patients';
    };

    if (isLoading) {
        return (
            <Card dir={isRTL ? 'rtl' : 'ltr'} className={`paid-patients-container ${isRTL ? 'rtl' : 'ltr'}`}>                <CardHeader>
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
        <>
            <Card dir={isRTL ? 'rtl' : 'ltr'} className="w-full overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                <div className="space-y-3">
    <CardTitle className={`flex items-center gap-2 text-base sm:text-lg ${isRTL ? 'text-right justify-end flex-row-reverse' : 'text-left'}`}>
        <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <span className="truncate">{getTitle()} ({filteredPatients.length})</span>
    </CardTitle>
    <Button
        variant="outline"
        size="sm"
        onClick={loadPaidPatients}
        disabled={isLoading}
        className="w-full sm:w-auto"
    >
        <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
        {isRTL ? 'تحديث' : 'Refresh'}
    </Button>
</div>

                    {/* Search and Filter */}
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <div className="flex-1 relative paid-patients-search-container w-full">
                            <Search className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10`} />
                            <Input
                                placeholder={isRTL ? 'البحث برقم المريض...' : 'Search by Patient ID...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${isRTL ? 'pr-8' : 'pl-8'} w-full`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md w-full sm:w-auto min-w-[140px]"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            <option value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                            <option value="completed">{isRTL ? 'مدفوع' : 'Paid'}</option>
                            <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                            <option value="failed">{isRTL ? 'فاشل' : 'Failed'}</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    {filteredPatients.length === 0 ? (
                        <Alert>
                            <AlertDescription>
                                {isRTL ? 'لم يتم العثور على مرضى مطابقين لمعاييرك.' : 'No patients found matching your criteria.'}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={`${patient.source}-${patient.id}`}
                                    className={`p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors ${(patient.payment_status === 'paid' || patient.payment_status === 'completed') ? 'border-green-200 bg-green-50' :
                                        patient.payment_status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                                            'border-red-200 bg-red-50'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
                                        <div className="flex-1 w-full min-w-0">
                                            <div className={`flex flex-wrap items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                                {getStatusIcon(patient.payment_status)}
                                                <h3 className={`font-semibold text-base sm:text-lg truncate ${isRTL ? 'text-right' : 'text-left'}`}>{patient.patient_name}</h3>
                                                <Badge variant={getStatusBadgeVariant(patient.payment_status)} className="flex-shrink-0">
                                                    {isRTL ?
                                                        (patient.payment_status === 'paid' ? 'مدفوع' :
                                                            patient.payment_status === 'pending' ? 'قيد الانتظار' :
                                                                patient.payment_status === 'failed' ? 'فاشل' : patient.payment_status) :
                                                        patient.payment_status
                                                    }
                                                </Badge>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {patient.source === 'payment_bookings' ? 'Patient Booking' : 'Admin Created'}
                                                </Badge>
                                            </div>

                                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{patient.appointment_day} at {patient.appointment_time}</span>
                                                </div>
                                                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <User className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">Dr. {patient.doctor_name}</span>
                                                </div>
                                                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <DollarSign className="h-3 w-3 flex-shrink-0" />
                                                    <span>₪{patient.amount}</span>
                                                </div>
                                            </div>

                                            <div className={`mt-2 text-xs text-muted-foreground space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="truncate">🆔 {isRTL ? 'رقم المريض' : 'Patient ID'}: {patient.unique_patient_id}</div>
                                                <div className="truncate">📧 {patient.patient_email}</div>
                                                <div>📞 {patient.patient_phone}</div>
                                                <div className="truncate">🏥 {patient.clinic_name} - {patient.specialty}</div>
                                                <div>📋 {isRTL ? 'تأكيد' : 'Confirmation'}: {patient.confirmation_number}</div>
                                            </div>
                                        </div>

                                        {!compact && (
                                            <div className={`w-full sm:w-auto ${isRTL ? 'text-left sm:text-right' : 'text-right'} flex-shrink-0`}>
                                                <div className="text-base sm:text-lg font-bold text-green-600 mb-1">
                                                    ₪{patient.amount}
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-3 sm:mb-2">
                                                    {patient.payment_method}
                                                </div>

                                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                    {patient.payment_status === 'pending' && (
                                                        <MarkPaymentPaid
                                                            appointmentId={patient.id}
                                                            patientName={patient.patient_name}
                                                            amount={patient.amount}
                                                            paymentStatus={patient.payment_status as 'pending' | 'paid'}
                                                            onPaymentMarked={loadPaidPatients}
                                                            source={patient.source}
                                                        />
                                                    )}

                                                    {/* Delete Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            console.log('🗑️ Delete button clicked for patient:', patient);
                                                            setPatientToDelete(patient);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {isRTL ? 'حذف' : 'Delete'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                        <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'تأكيد حذف الدفع' : 'Confirm Delete Payment'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                            {isRTL ? 'هل أنت متأكد من حذف هذا الدفع؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this payment? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {patientToDelete && (
                        <div className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="space-y-2">
                                <p><strong>{isRTL ? 'المريض' : 'Patient'}:</strong> {patientToDelete.patient_name}</p>
                                <p><strong>{isRTL ? 'المبلغ' : 'Amount'}:</strong> ₪{patientToDelete.amount}</p>
                                <p><strong>{isRTL ? 'الموعد' : 'Appointment'}:</strong> {patientToDelete.appointment_day} at {patientToDelete.appointment_time}</p>
                                <div><strong>{isRTL ? 'حالة الدفع' : 'Payment Status'}:</strong>
                                    <Badge variant={getStatusBadgeVariant(patientToDelete.payment_status)} className={isRTL ? 'mr-2' : 'ml-2'}>
                                        {isRTL ?
                                            (patientToDelete.payment_status === 'paid' ? 'مدفوع' :
                                                patientToDelete.payment_status === 'pending' ? 'قيد الانتظار' :
                                                    patientToDelete.payment_status === 'failed' ? 'فاشل' : patientToDelete.payment_status) :
                                            patientToDelete.payment_status
                                        }
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="gap-4">
                        <AlertDialogCancel className="mr-4">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => patientToDelete && deletePayment(patientToDelete.id)}
                            className="bg-red-600 hover:bg-red-700 ml-4"
                        >
                            {isRTL ? 'حذف' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PaidPatientsList;
