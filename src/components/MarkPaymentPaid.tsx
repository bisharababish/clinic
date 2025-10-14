// components/MarkPaymentPaid.tsx - Component to mark cash payments as paid
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface MarkPaymentPaidProps {
    appointmentId: string;
    patientName: string;
    amount: number;
    paymentStatus?: 'pending' | 'paid';
    onPaymentMarked?: () => void;
    children?: React.ReactNode;
    source?: 'payment_bookings';
}

const MarkPaymentPaid: React.FC<MarkPaymentPaidProps> = ({
    appointmentId,
    patientName,
    amount,
    paymentStatus: initialPaymentStatus = 'pending',
    onPaymentMarked,
    children,
    source = 'payment_bookings'
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [isOpen, setIsOpen] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>(initialPaymentStatus);

    // Update payment status when prop changes
    useEffect(() => {
        setPaymentStatus(initialPaymentStatus);
    }, [initialPaymentStatus]);

    // Fetch current payment status from database on mount
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('payment_bookings')
                    .select('payment_status')
                    .eq('id', appointmentId)
                    .single();

                if (!error && data) {
                    setPaymentStatus(data.payment_status as 'pending' | 'paid');
                }
            } catch (error) {
                console.error('Error fetching payment status:', error);
            }
        };

        fetchCurrentStatus();
    }, [appointmentId]);
    const { toast } = useToast();

    const handleMarkPaid = async () => {
        try {
            setIsMarking(true);

            // Check if user is authenticated first
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                console.error('No valid session found for marking payment:', sessionError);
                toast({
                    title: isRTL ? 'خطأ في المصادقة' : 'Authentication Error',
                    description: isRTL ? 'يرجى تسجيل الدخول مرة أخرى' : 'Please login again',
                    variant: 'destructive',
                });
                return;
            }

            // Update payment status to 'paid' in payment_bookings table
            const { error } = await supabase
                .from('payment_bookings')
                .update({
                    payment_status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointmentId);

            if (error) {
                console.error('Error updating payment status:', error);
                throw error;
            }

            // Update local payment status
            setPaymentStatus('paid');

            toast({
                title: isRTL ? 'تم تحديث حالة الدفع' : 'Payment Marked as Completed',
                description: isRTL ? 'تم تحديث حالة الدفع بنجاح' : 'Payment status updated successfully',
                variant: 'default',
            });

            setIsOpen(false);

            // Call the callback to refresh the parent component
            if (onPaymentMarked) {
                onPaymentMarked();
            }
        } catch (error) {
            console.error('Error marking payment as paid:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحديث حالة الدفع' : 'Error marking payment as completed',
                variant: 'destructive',
            });
        } finally {
            setIsMarking(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogTrigger asChild>
                {children || (
                    <Button
                        variant={paymentStatus === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex items-center gap-2 ${paymentStatus === 'paid'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : ''
                            }`}
                        disabled={paymentStatus === 'paid'}
                    >
                        <CheckCircle className="h-4 w-4" />
                        {paymentStatus === 'paid'
                            ? (isRTL ? 'مدفوع' : 'Paid')
                            : (isRTL ? 'تحديد كمكتمل' : 'Mark as Completed')
                        }
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={isRTL ? 'text-right' : 'text-left'}>
                {/* Custom close button for Arabic */}
                {isRTL && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <path d="m18 6-12 12" />
                            <path d="m6 6 12 12" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </button>
                )}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {isRTL ? 'تحديد الدفع كمكتمل' : 'Mark Payment as Completed'}
                    </DialogTitle>
                    <DialogDescription>
                        {isRTL ? 'تأكيد أن الدفع النقدي تم استلامه في العيادة' : 'Confirm that the cash payment has been received at the clinic'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {isRTL ? 'تأكيد أن الدفع النقدي تم استلامه في العيادة' : 'Confirm that the cash payment has been received at the clinic'}
                        </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">{isRTL ? 'المريض' : 'Patient'}:</span>
                                <div>{patientName}</div>
                            </div>
                            <div>
                                <span className="font-medium">{isRTL ? 'المبلغ' : 'Amount'}:</span>
                                <div className="text-lg font-bold text-green-600">₪{amount}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isMarking}
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleMarkPaid}
                            disabled={isMarking}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isMarking ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isRTL ? 'جاري التعليم...' : 'Marking...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isRTL ? 'تحديد كمكتمل' : 'Mark as Completed'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MarkPaymentPaid;
