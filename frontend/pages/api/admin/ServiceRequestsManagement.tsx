// ServiceRequestsManagement.tsx - Secretary and Admin Service Requests Management
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { createNotification } from '../../../lib/deletionRequests';
import {
    CheckCircle,
    Clock,
    XCircle,
    ScanLine,
    Activity,
    FlaskConical,
    Eye,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { UltrasoundIcon } from '../../../components/icons/UltrasoundIcon';

interface ServiceRequest {
    id: number;
    patient_id: number;
    patient_email: string;
    patient_name: string;
    doctor_id: number;
    doctor_name: string;
    service_type: 'xray' | 'ultrasound' | 'lab' | 'audiometry';
    service_subtype?: string | null;
    service_name?: string | null;
    service_name_ar?: string | null;
    notes: string | null;
    price?: number | null;
    currency?: string | null;
    payment_status?: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
    payment_booking_id?: string | null;
    status: 'pending' | 'secretary_confirmed' | 'payment_required' | 'in_progress' | 'completed' | 'cancelled';
    secretary_confirmed_at: string | null;
    secretary_confirmed_by: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

const ServiceRequestsManagement: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();
    const { user } = useAuth();

    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterServiceType, setFilterServiceType] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Load service requests
    const loadRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .order('created_at', { ascending: false });

            // Load pricing info for requests with subtypes
            if (data) {
                for (const request of data) {
                    if (request.service_subtype && request.service_type) {
                        const { data: pricingData } = await supabase
                            .from('service_pricing')
                            .select('service_name, service_name_ar')
                            .eq('service_type', request.service_type)
                            .eq('service_subtype', request.service_subtype)
                            .single();

                        if (pricingData) {
                            request.service_name = pricingData.service_name;
                            request.service_name_ar = pricingData.service_name_ar;
                        }
                    }
                }
            }

            if (error) throw error;
            setRequests(data || []);
        } catch (err: unknown) {
            console.error('Error loading requests:', err);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'فشل تحميل الطلبات' : 'Failed to load requests',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Confirm request (Secretary action)
    const handleConfirmRequest = async (request: ServiceRequest) => {
        if (!user) return;

        try {
            // If request has a price, set status to payment_required, otherwise secretary_confirmed
            const newStatus = request.price && request.price > 0 ? 'payment_required' : 'secretary_confirmed';

            const { error } = await supabase
                .from('service_requests')
                .update({
                    status: newStatus,
                    secretary_confirmed_at: new Date().toISOString(),
                    secretary_confirmed_by: user.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (error) throw error;

            // Notify patient
            const notificationMessage = request.price && request.price > 0
                ? (isRTL
                    ? `تم تأكيد طلب ${getServiceTypeName(request.service_type)} من قبل السكرتير. يجب دفع ₪${request.price} للمتابعة.`
                    : `Your ${request.service_type} request has been confirmed. Please pay ₪${request.price} to proceed.`)
                : (isRTL
                    ? `تم تأكيد طلب ${getServiceTypeName(request.service_type)} من قبل السكرتير`
                    : `Your ${request.service_type} request has been confirmed by the secretary`);

            await createNotification(
                request.patient_email,
                request.price && request.price > 0
                    ? (isRTL ? 'طلب مؤكد - دفع مطلوب' : 'Request Confirmed - Payment Required')
                    : (isRTL ? 'تم تأكيد الطلب' : 'Request Confirmed'),
                notificationMessage,
                request.price && request.price > 0 ? 'warning' : 'success',
                'service_requests',
                request.id.toString()
            );

            // Notify service provider
            const serviceProviderRole = getServiceProviderRole(request.service_type);
            const { data: providers } = await supabase
                .from('userinfo')
                .select('user_email')
                .eq('user_roles', serviceProviderRole);

            if (providers) {
                for (const provider of providers) {
                    await createNotification(
                        provider.user_email,
                        isRTL ? 'طلب جديد يحتاج إلى معالجة' : 'New Request to Process',
                        isRTL
                            ? `طلب ${getServiceTypeName(request.service_type)} جديد للمريض ${request.patient_name}`
                            : `New ${request.service_type} request for patient ${request.patient_name}`,
                        'info',
                        'service_requests',
                        request.id.toString()
                    );
                }
            }

            toast({
                title: isRTL ? 'نجح' : 'Success',
                description: isRTL ? 'تم تأكيد الطلب بنجاح' : 'Request confirmed successfully',
                style: { backgroundColor: '#16a34a', color: '#fff' },
            });

            loadRequests();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error confirming request:', err);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? `فشل تأكيد الطلب: ${errorMessage}` : `Failed to confirm request: ${errorMessage}`,
                variant: 'destructive',
            });
        }
    };

    // Confirm payment (Secretary action after patient pays)
    const handleConfirmPayment = async (request: ServiceRequest) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('service_requests')
                .update({
                    status: 'secretary_confirmed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (error) throw error;

            // Notify patient
            await createNotification(
                request.patient_email,
                isRTL ? 'تم تأكيد الدفع' : 'Payment Confirmed',
                isRTL
                    ? `تم تأكيد دفع طلب ${getServiceTypeName(request.service_type)}. يمكن للمختص البدء في المعالجة.`
                    : `Payment for your ${request.service_type} request has been confirmed. The specialist can now start processing.`,
                'success',
                'service_requests',
                request.id.toString()
            );

            // Notify service provider
            const serviceProviderRole = getServiceProviderRole(request.service_type);
            const { data: providers } = await supabase
                .from('userinfo')
                .select('user_email')
                .eq('user_roles', serviceProviderRole);

            if (providers) {
                for (const provider of providers) {
                    await createNotification(
                        provider.user_email,
                        isRTL ? 'طلب جاهز للمعالجة' : 'Request Ready for Processing',
                        isRTL
                            ? `تم دفع طلب ${getServiceTypeName(request.service_type)} للمريض ${request.patient_name}. يمكنك البدء في المعالجة.`
                            : `Payment confirmed for ${request.service_type} request for patient ${request.patient_name}. You can now start processing.`,
                        'info',
                        'service_requests',
                        request.id.toString()
                    );
                }
            }

            toast({
                title: isRTL ? 'نجح' : 'Success',
                description: isRTL ? 'تم تأكيد الدفع بنجاح' : 'Payment confirmed successfully',
                style: { backgroundColor: '#16a34a', color: '#fff' },
            });

            loadRequests();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error confirming payment:', err);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? `فشل تأكيد الدفع: ${errorMessage}` : `Failed to confirm payment: ${errorMessage}`,
                variant: 'destructive',
            });
        }
    };

    // Get service type name
    const getServiceTypeName = (type: string) => {
        if (isRTL) {
            switch (type) {
                case 'xray': return 'أشعة إكس';
                case 'ultrasound': return 'موجات فوق صوتية';
                case 'lab': return 'مختبر';
                case 'audiometry': return 'قياس السمع';
                default: return type;
            }
        } else {
            return type.toUpperCase();
        }
    };

    // Get service provider role
    const getServiceProviderRole = (type: string) => {
        switch (type) {
            case 'xray': return 'X Ray';
            case 'ultrasound': return 'Ultrasound';
            case 'lab': return 'Lab';
            case 'audiometry': return 'Audiometry';
            default: return '';
        }
    };

    // Get service icon
    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'xray': return <ScanLine className="h-5 w-5" />;
            case 'ultrasound': return <UltrasoundIcon className="h-5 w-5" />;
            case 'lab': return <FlaskConical className="h-5 w-5" />;
            case 'audiometry': return <Activity className="h-5 w-5" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {isRTL ? 'قيد الانتظار' : 'Pending'}</Badge>;
            case 'secretary_confirmed':
                return <Badge variant="default" className="flex items-center gap-1 bg-blue-500"><CheckCircle className="h-3 w-3" /> {isRTL ? 'مؤكد' : 'Confirmed'}</Badge>;
            case 'payment_required':
                return <Badge variant="default" className="flex items-center gap-1 bg-yellow-500"><Clock className="h-3 w-3" /> {isRTL ? 'دفع مطلوب' : 'Payment Required'}</Badge>;
            case 'in_progress':
                return <Badge variant="default" className="flex items-center gap-1 bg-yellow-500"><RefreshCw className="h-3 w-3 animate-spin" /> {isRTL ? 'قيد المعالجة' : 'In Progress'}</Badge>;
            case 'completed':
                return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> {isRTL ? 'مكتمل' : 'Completed'}</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> {isRTL ? 'ملغى' : 'Cancelled'}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter requests
    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesServiceType = filterServiceType === 'all' || req.service_type === filterServiceType;
        return matchesStatus && matchesServiceType;
    });

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{isRTL ? 'إدارة طلبات الخدمات' : 'Service Requests Management'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{isRTL ? 'إدارة طلبات الخدمات' : 'Service Requests Management'}</CardTitle>
                    <Button onClick={loadRequests} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">{isRTL ? 'الحالة' : 'Status'}</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                            <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                            <option value="payment_required">{isRTL ? 'دفع مطلوب' : 'Payment Required'}</option>
                            <option value="secretary_confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
                            <option value="in_progress">{isRTL ? 'قيد المعالجة' : 'In Progress'}</option>
                            <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">{isRTL ? 'نوع الخدمة' : 'Service Type'}</label>
                        <select
                            value={filterServiceType}
                            onChange={(e) => setFilterServiceType(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                            <option value="xray">{isRTL ? 'أشعة إكس' : 'X-Ray'}</option>
                            <option value="ultrasound">{isRTL ? 'موجات فوق صوتية' : 'Ultrasound'}</option>
                            <option value="lab">{isRTL ? 'مختبر' : 'Lab'}</option>
                            <option value="audiometry">{isRTL ? 'قياس السمع' : 'Audiometry'}</option>
                        </select>
                    </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>{isRTL ? 'لا توجد طلبات' : 'No requests found'}</p>
                        </div>
                    ) : (
                        filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getServiceIcon(request.service_type)}
                                            <h3 className="font-semibold text-lg">{request.patient_name}</h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">{isRTL ? 'نوع الخدمة' : 'Service'}:</span> {getServiceTypeName(request.service_type)}
                                            </div>
                                            <div>
                                                <span className="font-medium">{isRTL ? 'الطبيب' : 'Doctor'}:</span> {request.doctor_name}
                                            </div>
                                            <div>
                                                <span className="font-medium">{isRTL ? 'البريد الإلكتروني' : 'Email'}:</span> {request.patient_email}
                                            </div>
                                            <div>
                                                <span className="font-medium">{isRTL ? 'تاريخ الإنشاء' : 'Created'}:</span> {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {request.notes && (
                                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                                <span className="font-medium">{isRTL ? 'ملاحظات' : 'Notes'}:</span> {request.notes}
                                            </div>
                                        )}
                                        {request.price && request.price > 0 && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="font-medium">{isRTL ? 'السعر' : 'Price'}:</span>
                                                <span className="text-lg font-bold">₪{request.price} {request.currency || 'ILS'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {isRTL ? 'عرض' : 'View'}
                                        </Button>
                                        {request.status === 'pending' && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleConfirmRequest(request)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {isRTL ? 'تأكيد' : 'Confirm'}
                                            </Button>
                                        )}
                                        {request.status === 'payment_required' && request.payment_status === 'paid' && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleConfirmPayment(request)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {isRTL ? 'تأكيد الدفع' : 'Confirm Payment'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>

            {/* Details Modal */}
            {showDetailsModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">{isRTL ? 'تفاصيل الطلب' : 'Request Details'}</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedRequest(null);
                                    }}
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="font-medium">{isRTL ? 'المريض' : 'Patient'}:</span> {selectedRequest.patient_name}
                            </div>
                            <div>
                                <span className="font-medium">{isRTL ? 'البريد الإلكتروني' : 'Email'}:</span> {selectedRequest.patient_email}
                            </div>
                            <div>
                                <span className="font-medium">{isRTL ? 'الطبيب' : 'Doctor'}:</span> {selectedRequest.doctor_name}
                            </div>
                            <div>
                                <span className="font-medium">{isRTL ? 'نوع الخدمة' : 'Service Type'}:</span> {getServiceTypeName(selectedRequest.service_type)}
                            </div>
                            <div>
                                <span className="font-medium">{isRTL ? 'الحالة' : 'Status'}:</span> {getStatusBadge(selectedRequest.status)}
                            </div>
                            {selectedRequest.notes && (
                                <div>
                                    <span className="font-medium">{isRTL ? 'ملاحظات' : 'Notes'}:</span>
                                    <div className="mt-2 p-3 bg-gray-100 rounded">{selectedRequest.notes}</div>
                                </div>
                            )}
                            <div>
                                <span className="font-medium">{isRTL ? 'تاريخ الإنشاء' : 'Created At'}:</span> {new Date(selectedRequest.created_at).toLocaleString()}
                            </div>
                            {selectedRequest.secretary_confirmed_at && (
                                <div>
                                    <span className="font-medium">{isRTL ? 'تم التأكيد من قبل' : 'Confirmed By'}:</span> {selectedRequest.secretary_confirmed_by} ({new Date(selectedRequest.secretary_confirmed_at).toLocaleString()})
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ServiceRequestsManagement;

