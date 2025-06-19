// pages/PaymentCancel.tsx - PayPal cancel handler with Arabic support
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PaymentCancel = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        toast({
            title: t('paymentCancel.paymentCancelled'),
            description: t('paymentCancel.paypalCancelledNoCharges'),
            variant: "default",
        });
    }, [toast, t]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
                <CardHeader>
                    <CardTitle className={`text-orange-600 text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('paymentCancel.paymentCancelledTitle')}
                    </CardTitle>
                    <CardDescription className={`text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('paymentCancel.cancelledPaymentDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className={`text-center text-gray-600 space-y-2 ${isRTL ? 'font-arabic' : ''}`}>
                            <p>{t('paymentCancel.appointmentNotConfirmed')}</p>
                            <p>{t('paymentCancel.tryDifferentMethodOrBookLater')}</p>
                        </div>

                        <Button
                            onClick={() => navigate('/payment')}
                            className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                        >
                            {t('paymentCancel.tryDifferentPaymentMethod')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/clinics')}
                            className={`w-full ${isRTL ? 'font-arabic' : ''}`}
                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                        >
                            {t('paymentCancel.backToClinics')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCancel;