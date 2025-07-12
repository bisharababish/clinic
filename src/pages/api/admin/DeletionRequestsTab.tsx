// pages/api/admin/DeletionRequestsTab.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
                title: t('common.success'),
                description: action === 'approved'
                    ? t('deletionRequest.requestApproved') || 'Deletion request approved and user deleted'
                    : t('deletionRequest.requestDeclined') || 'Deletion request declined',
            });

            // Reload requests
            await loadRequests();

        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            toast({
                title: t('common.error'),
                description: error instanceof Error ? error.message : `Failed to ${action} request`,
                variant: "destructive",
            });
        } finally {
            setProcessingRequest(null);
            setShowApprovalModal(false);
            setSelectedRequest(null);
            setAdminNotes('');
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
            'secretary': 'bg-blue-100 text-blue-800',
            'admin': 'bg-purple-100 text-purple-800',
            'manager': 'bg-green-100 text-green-800'
        };

        return (
            <Badge className={roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
                {role}
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
                    <h2 className="text-xl sm:text-2xl font-bold">
                        {isRTL ? 'طلبات الحذف' : 'Deletion Requests'}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isRTL ? 'مراجعة وإدارة طلبات حذف المستخدمين' : 'Review and manage user deletion requests'}
                    </p>
                </div>
                <Button variant="outline" onClick={loadRequests} disabled={isLoading} className="w-full sm:w-auto">
                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                            <div className={`ml-3 sm:ml-4 ${isRTL ? 'mr-3 sm:mr-4 ml-0' : ''}`}>
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
                        <div className="flex items-center">
                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                            <div className={`ml-3 sm:ml-4 ${isRTL ? 'mr-3 sm:mr-4 ml-0' : ''}`}>
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
                        <div className="flex items-center">
                            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                            <div className={`ml-3 sm:ml-4 ${isRTL ? 'mr-3 sm:mr-4 ml-0' : ''}`}>
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
                            {isRTL ? 'لا توجد طلبات حذف في هذا الوقت.' : 'There are no deletion requests at this time.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {requests.map((request) => (
                        <Card key={request.id}>
                            <CardHeader className="p-4 sm:p-6">
                                <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                    <div className="space-y-2 flex-1">
                                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
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
                                                {request.user_details.role}
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
                                    <div className={`text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        <p>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Request Details */}
                                    <div>
                                        <h4 className="font-medium text-xs sm:text-sm mb-2">
                                            {isRTL ? 'تفاصيل الطلب:' : 'Request Details:'}
                                        </h4>
                                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 mb-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {isRTL ? 'طلب بواسطة:' : 'Requested by:'}
                                            </span>
                                            <span className="font-medium text-xs sm:text-sm">{request.requested_by_email}</span>
                                            {getRequestorBadge(request.requested_by_role)}
                                        </div>
                                        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                            <p className="text-xs sm:text-sm"><strong>{isRTL ? 'السبب:' : 'Reason:'}</strong> {request.reason}</p>
                                        </div>
                                    </div>

                                    {/* Admin Notes (if any) */}
                                    {request.admin_notes && (
                                        <div>
                                            <h4 className="font-medium text-xs sm:text-sm mb-2">{isRTL ? 'ملاحظات المشرف:' : 'Admin Notes:'}</h4>
                                            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                                <p className="text-xs sm:text-sm">{request.admin_notes}</p>
                                                {request.admin_email && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        by {request.admin_email}
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
                <DialogContent className={`sm:max-w-md ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
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
                        <DialogDescription>
                            {actionType === 'approved'
                                ? (isRTL ? 'سيؤدي هذا إلى حذف المستخدم نهائياً ولا يمكن التراجع عنه.' : 'This will permanently delete the user and cannot be undone.')
                                : (isRTL ? 'سيتم رفض طلب الحذف وسيبقى المستخدم نشطاً.' : 'The deletion request will be declined and the user will remain active.')
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedRequest && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-sm mb-1">User to {actionType}:</h4>
                                <p className="text-sm">{selectedRequest.user_details.english_name}</p>
                                <p className="text-xs text-gray-600">{selectedRequest.user_details.email}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="admin-notes">
                                {t('deletionRequest.adminNotes') || 'Admin Notes'}
                                {actionType === 'declined' ? ' *' : ' (Optional)'}
                            </Label>
                            <Textarea
                                id="admin-notes"
                                placeholder={
                                    actionType === 'approved'
                                        ? (t('deletionRequest.approvalNotesPlaceholder') || 'Optional notes about the approval...')
                                        : (t('deletionRequest.declineNotesPlaceholder') || 'Reason for declining this request...')
                                }
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="min-h-[80px]"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            {actionType === 'declined' && !adminNotes.trim() && (
                                <p className="text-xs text-red-500">
                                    {t('deletionRequest.declineReasonRequired') || 'Please provide a reason for declining.'}
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
                                t('deletionRequest.processing') || 'Processing...'
                            ) : actionType === 'approved' ? (
                                t('deletionRequest.approveAndDelete') || 'Approve & Delete'
                            ) : (
                                t('deletionRequest.decline') || 'Decline Request'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeletionRequestsTab;