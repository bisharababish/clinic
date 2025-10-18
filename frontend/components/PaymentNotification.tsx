// components/PaymentNotification.tsx - Payment Status Notifications
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PaymentNotificationProps {
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    appointmentDetails?: {
        doctorName: string;
        clinicName: string;
        appointmentDate: string;
        appointmentTime: string;
        amount: number;
    };
    onMarkCompleted?: () => void;
    showMarkCompletedButton?: boolean;
}

const PaymentNotification: React.FC<PaymentNotificationProps> = ({
    paymentStatus,
    appointmentDetails,
    onMarkCompleted,
    showMarkCompletedButton = false
}) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'refunded':
                return <AlertCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'completed':
                return t('paymentNotification.completed') || 'Payment completed successfully';
            case 'pending':
                return t('paymentNotification.pending') || 'Payment is pending - please pay at the clinic';
            case 'failed':
                return t('paymentNotification.failed') || 'Payment failed - please try again';
            case 'refunded':
                return t('paymentNotification.refunded') || 'Payment has been refunded';
            default:
                return t('paymentNotification.unknown') || 'Payment status unknown';
        }
    };

    const getAlertVariant = () => {
        switch (paymentStatus) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'default';
            case 'failed':
                return 'destructive';
            case 'refunded':
                return 'default';
            default:
                return 'default';
        }
    };

    if (!isVisible) return null;

    return (
        <Alert variant={getAlertVariant()} className="mb-4">
            <div className="flex items-center gap-2">
                {getStatusIcon()}
                <AlertDescription className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">{getStatusMessage()}</div>
                            {appointmentDetails && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    {appointmentDetails.doctorName} at {appointmentDetails.clinicName}
                                    <br />
                                    {appointmentDetails.appointmentDate} at {appointmentDetails.appointmentTime}
                                    <br />
                                    Amount: ₪{appointmentDetails.amount}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {showMarkCompletedButton && paymentStatus === 'pending' && onMarkCompleted && (
                                <Button
                                    size="sm"
                                    onClick={onMarkCompleted}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {t('paymentNotification.markCompleted') || 'Mark as Completed'}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsVisible(false)}
                            >
                                ✕
                            </Button>
                        </div>
                    </div>
                </AlertDescription>
            </div>
        </Alert>
    );
};

export default PaymentNotification;

