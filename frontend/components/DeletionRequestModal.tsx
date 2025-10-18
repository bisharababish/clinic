// components/DeletionRequestModal.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeletionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userName: string;
    userEmail: string;
    isLoading: boolean;
}

const DeletionRequestModal: React.FC<DeletionRequestModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    userEmail,
    isLoading
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setReasonError(isRTL ? 'يرجى تقديم سبب للحذف' : 'Please provide a reason for deletion');
            return;
        }

        if (reason.trim().length < 10) {
            setReasonError(isRTL ? 'السبب يجب أن يكون 10 أحرف على الأقل' : 'Reason must be at least 10 characters');
            return;
        }

        onConfirm(reason.trim());
    };

    const handleClose = () => {
        setReason('');
        setReasonError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className={`sm:max-w-md ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isRTL ? 'طلب حذف المستخدم' : 'Request User Deletion'}
                    </DialogTitle>

                    <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                        {isRTL ?
                            'أنت تطلب حذف المستخدم التالي. يتطلب هذا الإجراء موافقة المشرف.' :
                            'You are requesting to delete the following user. This action requires admin approval.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User Details */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">
                            {isRTL ? 'تفاصيل المستخدم:' : 'User Details:'}
                        </h4>
                        <div className="space-y-1 text-sm">
                            <div><strong>{isRTL ? 'الاسم' : 'Name'}:</strong> {userName}</div>
                            <div><strong>{isRTL ? 'البريد الإلكتروني' : 'Email'}:</strong> {userEmail}</div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <Label htmlFor="deletion-reason">
                            {isRTL ? 'سبب الحذف' : 'Reason for deletion'}
                        </Label>
                        <Textarea
                            id="deletion-reason"
                            placeholder={isRTL ? 'أدخل سبب حذف هذا المستخدم...' : 'Enter reason for deleting this user...'}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (reasonError) setReasonError('');
                            }}
                            className={`min-h-[100px] ${reasonError ? 'border-red-500' : ''}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                        {reasonError && (
                            <p className="text-sm text-red-500">{reasonError}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            {isRTL ? 'يرجى تقديم سبب مفصل. الحد الأدنى 10 أحرف.' : 'Please provide a detailed reason. Minimum 10 characters.'}
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-700">
                                <strong>{isRTL ? 'تحذير' : 'Warning'}:</strong>
                                <p className="mt-1">
                                    {isRTL ?
                                        'سيتم إرسال هذا الطلب إلى المشرفين للمراجعة. لن يتم حذف المستخدم حتى يوافق المشرف على هذا الطلب.' :
                                        'This request will be sent to administrators for review. The user will not be deleted until an admin approves this request.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={isLoading || !reason.trim()}>
                        {isLoading ?
                            (isRTL ? 'جاري الإرسال...' : 'Submitting...') :
                            (isRTL ? 'إرسال الطلب' : 'Submit Request')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeletionRequestModal;
