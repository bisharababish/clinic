// pages/api/admin/DeletionRequestsTab.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ar } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    IdCard,
    RefreshCw,
    AlertTriangle
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import {
    getDeletionRequests,
    updateDeletionRequest,
    deleteUserAfterApproval,
    deleteDeletionRequests,
    DeletionRequest
} from '../../../lib/deletionRequests';
import { useAuth } from '../../../hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton";

const DeletionRequestsTab: React.FC = () => {
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    // Modal state
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionType, setActionType] = useState<'approved' | 'declined'>('approved');
    const [showDeclined, setShowDeclined] = useState(false);
    const [selectedDeclined, setSelectedDeclined] = useState<string[]>([]);
    const [isDeletingSelected, setIsDeletingSelected] = useState(false);
    // Load deletion requests
    const loadRequests = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getDeletionRequests();

            if (result.success && result.data) {
                setRequests(result.data);
            } else {
                setError(result.error || 'Failed to load deletion requests');
            }
        } catch (err) {
            console.error('Error loading deletion requests:', err);
            setError('Unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Handle approval/decline
    const handleAction = async (action: 'approved' | 'declined') => {
        if (!selectedRequest || !user?.email) return;

        setProcessingRequest(selectedRequest.id);

        try {
            const result = await updateDeletionRequest(
                selectedRequest.id,
                action,
                user.email,
                adminNotes.trim() || undefined
            );

            if (!result.success) {
                throw new Error(result.error || `Failed to ${action} request`);
            }

            // If approved, actually delete the user
            if (action === 'approved') {
                const deleteResult = await deleteUserAfterApproval(selectedRequest.user_id);

                if (!deleteResult.success) {
                    // Update the request back to pending if deletion failed
                    await updateDeletionRequest(
                        selectedRequest.id,
                        'declined',
                        user.email,
                        `Deletion failed: ${deleteResult.error}`
                    );

                    throw new Error(deleteResult.error || 'Failed to delete user');
                }
            }

            toast({
                title: isRTL ? 'نجح' : 'Success',
                description: action === 'approved'
                    ? (isRTL ? 'تم الموافقة على طلب الحذف وحذف المستخدم' : 'Deletion request approved and user deleted')
                    : (isRTL ? 'تم رفض طلب الحذف' : 'Deletion request declined'),
                style: {
                    backgroundColor: '#16a34a',
                    color: '#fff'
                },
            });
            // Reload requests
            await loadRequests();

        } catch (error) {
            console.error(`Error ${action}ing request:`, error);

            // Create user-friendly error message
            let errorMessage = '';

            if (error instanceof Error) {
                // Check for specific error patterns and provide better messages
                if (error.message.includes('constraint') || error.message.includes('violates')) {
                    errorMessage = isRTL
                        ? 'فشل في حذف المستخدم بسبب قيود في قاعدة البيانات. يرجى المحاولة مرة أخرى أو الاتصال بالدعم التقني.'
                        : 'Failed to delete user due to database constraints. Please try again or contact technical support.';
                } else if (error.message.includes('Failed to delete user')) {
                    errorMessage = isRTL
                        ? 'فشل في حذف المستخدم. يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.'
                        : 'Failed to delete user. Please verify the data and try again.';
                } else if (action === 'approved') {
                    errorMessage = isRTL
                        ? 'فشل في الموافقة على طلب الحذف وحذف المستخدم.'
                        : 'Failed to approve deletion request and delete user.';
                } else {
                    errorMessage = isRTL
                        ? 'فشل في رفض طلب الحذف.'
                        : 'Failed to decline deletion request.';
                }
            } else {
                // Generic fallback message
                errorMessage = action === 'approved'
                    ? (isRTL ? 'فشل في الموافقة على طلب الحذف.' : 'Failed to approve deletion request.')
                    : (isRTL ? 'فشل في رفض طلب الحذف.' : 'Failed to decline deletion request.');
            }

            toast({
                title: t('common.error'),
                description: errorMessage,
                variant: "destructive",
                style: {
                    backgroundColor: '#dc2626',
                    color: '#fff'
                },
            });
        } finally {
            setProcessingRequest(null);
            setShowApprovalModal(false);
            setSelectedRequest(null);
            setAdminNotes('');
        }
    };
    const handleSelectDeclined = (requestId: string) => {
        setSelectedDeclined(prev =>
            prev.includes(requestId)
                ? prev.filter(id => id !== requestId)
                : [...prev, requestId]
        );
    };

    const handleSelectAllDeclined = () => {
        const declinedIds = requests.filter(r => r.status === 'declined').map(r => r.id);
        setSelectedDeclined(prev =>
            prev.length === declinedIds.length ? [] : declinedIds
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedDeclined.length === 0) return;

        setIsDeletingSelected(true);

        try {
            // Actually delete from database first
            const deleteResult = await deleteDeletionRequests(selectedDeclined);

            if (!deleteResult.success) {
                throw new Error(deleteResult.error || 'Failed to delete requests');
            }

            // Only update local state after successful API call
            await loadRequests(); // Reload from database instead of optimistic update
            setSelectedDeclined([]);

            toast({
                title: isRTL ? 'نجح' : 'Success',
                description: isRTL
                    ? `تم حذف ${selectedDeclined.length} طلب مرفوض`
                    : `Deleted ${selectedDeclined.length} declined request(s)`,
                style: {
                    backgroundColor: '#16a34a',
                    color: '#fff'
                },
            });
        } catch (error) {
            console.error('Error deleting requests:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL
                    ? 'فشل في حذف الطلبات المحددة'
                    : 'Failed to delete selected requests',
                variant: "destructive",
                style: {
                    backgroundColor: '#dc2626',
                    color: '#fff'
                },
            });
        } finally {
            setIsDeletingSelected(false);
        }
    };

    const openApprovalModal = (request: DeletionRequest, action: 'approved' | 'declined') => {
        setSelectedRequest(request);
        setActionType(action);
        setAdminNotes('');
        setShowApprovalModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> {isRTL ? 'قيد الانتظار' : 'Pending'}</Badge>;
            case 'approved':
                return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> {isRTL ? 'موافق عليه' : 'Approved'}</Badge>;
            case 'declined':
                return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" /> {isRTL ? 'مرفوض' : 'Declined'}</Badge>;
        }
    };

    const getRequestorBadge = (role: string) => {
        const roleColors = {
            'Secretary': 'bg-blue-100 text-blue-800',
            'Admin': 'bg-purple-100 text-purple-800',
            'Manager': 'bg-green-100 text-green-800'
        };

        const roleTranslations = {
            'Secretary': isRTL ? 'سكرتير' : 'Secretary',
            'Admin': isRTL ? 'مشرف' : 'Admin',
            'Manager': isRTL ? 'مدير' : 'Manager'
        };

        return (
            <Badge className={roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
                {roleTranslations[role.toLowerCase()] || role}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Requests</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={loadRequests}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : ''}`}>
            {/* Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'طلبات الحذف' : 'Deletion Requests'}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isRTL ? 'مراجعة وإدارة طلبات حذف المستخدمين' : 'Review and manage user deletion requests'}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={loadRequests} disabled={isLoading} className="w-full sm:w-auto">
                        <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowDeclined(!showDeclined)}
                        className="w-full sm:w-auto"
                    >
                        {showDeclined
                            ? (isRTL ? 'إخفاء المرفوضة' : 'Hide Declined')
                            : (isRTL ? 'إظهار المرفوضة' : 'Show Declined')
                        }
                    </Button>
                    {showDeclined && requests.some(r => r.status === 'declined') && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleSelectAllDeclined}
                                className="w-full sm:w-auto"
                            >
                                {selectedDeclined.length === requests.filter(r => r.status === 'declined').length
                                    ? (isRTL ? 'إلغاء التحديد' : 'Deselect All')
                                    : (isRTL ? 'تحديد الكل' : 'Select All')
                                }
                            </Button>
                            {selectedDeclined.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteSelected}
                                    disabled={isDeletingSelected}
                                    className="w-full sm:w-auto"
                                >
                                    {isDeletingSelected ? (
                                        isRTL ? 'جاري الحذف...' : 'Deleting...'
                                    ) : (
                                        isRTL ? `حذف (${selectedDeclined.length})` : `Delete (${selectedDeclined.length})`
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                            <div className={`${isRTL ? 'mr-6 sm:mr-8 text-right' : 'ml-6 sm:ml-8'}`}>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
                                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                                    {requests.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                            <div className={`${isRTL ? 'mr-6 sm:mr-8 text-right' : 'ml-6 sm:ml-8'}`}>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">{isRTL ? 'موافق عليه' : 'Approved'}</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">
                                    {requests.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                            <div className={`${isRTL ? 'mr-6 sm:mr-8 text-right' : 'ml-6 sm:ml-8'}`}>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">{isRTL ? 'مرفوض' : 'Declined'}</p>
                                <p className="text-xl sm:text-2xl font-bold text-red-600">
                                    {requests.filter(r => r.status === 'declined').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <Card>
                    <CardContent className="p-6 sm:p-8 text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {isRTL ? 'لا توجد طلبات حذف' : 'No Deletion Requests'}
                        </h3>
                        <p className="text-gray-500 text-sm sm:text-base">
                            {isRTL ? '.لا توجد طلبات حذف في هذا الوقت' : 'There are no deletion requests at this time.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {requests.filter(request => showDeclined || request.status !== 'declined').map((request) => (
                        <Card key={request.id}>
                            <CardHeader className="p-4 sm:p-6">
                                <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                    <div className="space-y-2 flex-1">
                                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                            {request.status === 'declined' && showDeclined && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDeclined.includes(request.id)}
                                                    onChange={() => handleSelectDeclined(request.id)}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                            )}
                                            <h3 className="text-base sm:text-lg font-semibold">
                                                {request.user_details.english_name}
                                            </h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="truncate">{request.user_details.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {isRTL ? (request.user_details.role === 'Patient' ? 'مريض' : request.user_details.role) : request.user_details.role}
                                            </div>
                                            {request.user_details.id_number && (
                                                <div className="flex items-center gap-1">
                                                    <IdCard className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    {request.user_details.id_number}
                                                </div>
                                            )}
                                            {request.user_details.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    {request.user_details.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-right'}`}>
                                        <p>{formatDistanceToNow(new Date(request.created_at), {
                                            addSuffix: true,
                                            locale: isRTL ? ar : undefined
                                        })}</p>                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Request Details */}
                                    <div>
                                        <h4 className={`font-medium text-xs sm:text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                                            {isRTL ? ':تفاصيل الطلب' : 'Request Details:'}
                                        </h4>
                                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 mb-2 ${isRTL ? 'sm:flex-row-reverse text-right' : ''}`}>
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {isRTL ? ':طلب بواسطة' : 'Requested by:'}
                                            </span>
                                            <span className="font-medium text-xs sm:text-sm">{request.requested_by_email}</span>
                                            {getRequestorBadge(request.requested_by_role)}
                                        </div>
                                        <div className={`bg-gray-50 p-2 sm:p-3 rounded-lg`}>
                                            <p className={`text-xs sm:text-sm ${isRTL ? 'flex flex-row-reverse text-right gap-2' : ''}`}>
                                                <strong>{isRTL ? ':السبب' : 'Reason:'}</strong>
                                                <span>{request.reason}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Admin Notes (if any) */}
                                    {request.admin_notes && (
                                        <div>
                                            <h4 className={`font-medium text-xs sm:text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                                                {isRTL ? ':ملاحظات المشرف' : 'Admin Notes:'}
                                            </h4>
                                            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                                <p className={`text-xs sm:text-sm ${isRTL ? 'text-right' : ''}`}>
                                                    {request.admin_notes}
                                                </p>
                                                {request.admin_email && (
                                                    <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
                                                        {isRTL ? `بواسطة ${request.admin_email}` : `by ${request.admin_email}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {request.status === 'pending' && (
                                        <div className={`flex flex-col sm:flex-row gap-2 pt-2 border-t ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => openApprovalModal(request, 'approved')}
                                                disabled={processingRequest === request.id}
                                                className="w-full sm:w-auto"
                                            >
                                                <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {isRTL ? 'موافقة وحذف' : 'Approve & Delete'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openApprovalModal(request, 'declined')}
                                                disabled={processingRequest === request.id}
                                                className="w-full sm:w-auto"
                                            >
                                                <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {isRTL ? 'رفض' : 'Decline'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Approval/Decline Modal */}
            <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                <DialogContent className={`sm:max-w-md ${isRTL ? 'text-right' : 'text-left'} ${isRTL ? '[&>button]:!left-4 [&>button]:!right-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>                    <DialogHeader className={isRTL ? '[&>*:last-child]:left-4 [&>*:last-child]:right-auto' : ''}>
                    <DialogTitle className="flex items-center gap-2">
                        {actionType === 'approved' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {actionType === 'approved'
                            ? (isRTL ? 'تأكيد الموافقة' : 'Confirm Approval')
                            : (isRTL ? 'تأكيد الرفض' : 'Confirm Decline')
                        }
                    </DialogTitle>
                    <DialogDescription className={isRTL ? 'text-right' : ''}>
                        {actionType === 'approved'
                            ? (isRTL ? 'سيؤدي هذا إلى حذف المستخدم نهائياً ولا يمكن التراجع عنه.' : 'This will permanently delete the user and cannot be undone.')
                            : (isRTL ? 'سيتم رفض طلب الحذف وسيبقى المستخدم نشطاً.' : 'The deletion request will be declined and the user will remain active.')
                        }
                    </DialogDescription>
                </DialogHeader>

                    <div className="space-y-4">
                        {selectedRequest && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-sm mb-1">
                                    {actionType === 'approved'
                                        ? (isRTL ? 'المستخدم المراد الموافقة عليه:' : 'User to approve:')
                                        : (isRTL ? 'المستخدم المراد رفضه:' : 'User to decline:')
                                    }
                                </h4>                                <p className="text-sm">{selectedRequest.user_details.english_name}</p>
                                <p className="text-xs text-gray-600">{selectedRequest.user_details.email}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="admin-notes">
                                {actionType === 'approved'
                                    ? (isRTL ? 'ملاحظات المشرف (اختيارية)' : 'Admin Notes (Optional)')
                                    : (isRTL ? 'ملاحظات المشرف *' : 'Admin Notes *')
                                }
                            </Label>
                            <Textarea
                                id="admin-notes"
                                placeholder={
                                    actionType === 'approved'
                                        ? (isRTL ? 'ملاحظات اختيارية حول الموافقة...' : 'Optional notes about the approval...')
                                        : (isRTL ? 'سبب رفض هذا الطلب...' : 'Reason for declining this request...')
                                }
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="min-h-[80px]"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            {actionType === 'declined' && !adminNotes.trim() && (
                                <p className="text-xs text-red-500">
                                    {isRTL ? 'يرجى تقديم سبب للرفض.' : 'Please provide a reason for declining.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                            variant="outline"
                            onClick={() => setShowApprovalModal(false)}
                            disabled={processingRequest === selectedRequest?.id}
                            className="w-full sm:w-auto"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button
                            variant={actionType === 'approved' ? 'destructive' : 'default'}
                            onClick={() => handleAction(actionType)}
                            disabled={
                                processingRequest === selectedRequest?.id ||
                                (actionType === 'declined' && !adminNotes.trim())
                            }
                            className="w-full sm:w-auto"
                        >
                            {processingRequest === selectedRequest?.id ? (
                                isRTL ? 'جاري المعالجة...' : 'Processing...'
                            ) : actionType === 'approved' ? (
                                isRTL ? 'موافقة وحذف' : 'Approve & Delete'
                            ) : (
                                isRTL ? 'رفض الطلب' : 'Decline Request'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeletionRequestsTab;