// pages/Payment.tsx - Updated with real payment processing
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { palestinianPaymentService, PaymentData, CreditCardData } from "../lib/paymentService";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type PaymentMethod = "creditCard" | "cash";
interface LocationState {
    clinicName: string;
    doctorName: string;
    specialty: string;
    appointmentDay: string;
    appointmentTime: string;
    price: number;
}

interface PaymentBookingRecord {
    id: string;
    patient_id: string;
    clinic_name: string;
    doctor_name: string;
    specialty: string;
    appointment_day: string;
    appointment_time: string;
    price: number;
    currency: string;
    payment_status: string;
    booking_status: string;  // ✅ CORRECT
    created_at: string;
    updated_at: string;
}
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // Properly typed location state
    const locationState = location.state as LocationState | null;
    const {
        clinicName,
        doctorName,
        specialty,
        appointmentDay,
        appointmentTime,
        price
    } = locationState || {
        clinicName: t('payment.selectedClinic'),
        doctorName: t('payment.selectedDoctor'),
        specialty: t('payment.selectedSpecialty'),
        appointmentDay: t('payment.selectedDay'),
        appointmentTime: t('payment.selectedTime'),
        price: 150,
    };

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [agreedToCashTerms, setAgreedToCashTerms] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [appointmentId, setAppointmentId] = useState<string>("");

    const [formData, setFormData] = useState({
        // Credit Card
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvv: "",
    });

    useEffect(() => {
        // Get current user and create appointment record
        const initializePayment = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    console.error('Auth error:', userError);
                    throw new Error('Authentication failed');
                }

                if (!user) {
                    toast({
                        title: "Authentication Required",
                        description: "Please log in to continue with payment",
                        variant: "destructive",
                    });
                    navigate("/login");
                    return;
                }
                setUser(user);

                // Create appointment record if it doesn't exist
                const { data: appointment, error } = await supabase
                    .from('payment_bookings')
                    .insert([{
                        patient_id: user.id,
                        clinic_name: clinicName,
                        doctor_name: doctorName,
                        specialty: specialty,
                        appointment_day: appointmentDay,
                        appointment_time: appointmentTime,
                        price: price,
                        currency: 'ILS',
                        payment_status: 'pending',
                        booking_status: 'scheduled'

                    }])
                    .select()
                    .single() as { data: PaymentBookingRecord | null; error: import("@supabase/supabase-js").PostgrestError | null };

                if (error) throw error;
                if (appointment) {

                    setAppointmentId(appointment.id);
                }
            } catch (error) {
                console.error('Error initializing payment:', error);
                toast({
                    title: "Error",
                    description: "Failed to initialize payment. Please try again.",
                    variant: "destructive",
                });
            }
        };

        initializePayment();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formatted.length <= 23) { // Max length for card number with spaces
                setFormData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }

        // Format expiry date
        if (name === 'expiry') {
            const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formatted.length <= 5) {
                setFormData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }

        // Limit CVV to 4 digits
        if (name === 'cvv') {
            const formatted = value.replace(/\D/g, '');
            if (formatted.length <= 4) {
                setFormData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getCardType = (cardNumber: string) => {
        return palestinianPaymentService.getCardType(cardNumber);
    };

    const handleCreditCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (!appointmentId || !user) {
                throw new Error('Missing appointment or user information');
            }

            const paymentData: PaymentData = {
                appointmentId: appointmentId,
                patientId: user.id,
                clinicId: "", // You might want to get this from the clinic selection
                doctorId: "", // You might want to get this from the doctor selection
                amount: price,
                currency: 'ILS',
                paymentMethod: 'credit_card',
                description: `Medical appointment - ${doctorName} at ${clinicName}`
            };

            const cardData: CreditCardData = {
                cardNumber: formData.cardNumber,
                cardName: formData.cardName,
                expiry: formData.expiry,
                cvv: formData.cvv,
                amount: price,
                currency: 'ILS'
            };

            const result = await palestinianPaymentService.processCreditCardPayment(paymentData, cardData);

            if (result.success) {
                toast({
                    title: "Payment Successful",
                    description: "Your payment has been processed successfully.",
                });

                navigate("/confirmation", {
                    state: {
                        clinicName,
                        doctorName,
                        appointmentTime,
                        paymentMethod: 'credit_card',
                        transactionId: result.transactionId,
                        amount: price
                    }
                });
            }

        } catch (error) {
            console.error('Credit card payment error:', error);
            toast({
                title: "Payment Failed",
                description: error instanceof Error ? error.message : "Payment processing failed. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCashSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (!appointmentId || !user) {
                throw new Error('Missing appointment or user information');
            }

            const paymentData: PaymentData = {
                appointmentId: appointmentId,
                patientId: user.id,
                clinicId: "",
                doctorId: "",
                amount: price,
                currency: 'ILS',
                paymentMethod: 'cash',
                description: `Medical appointment - ${doctorName} at ${clinicName}`
            };

            const result = await palestinianPaymentService.processCashPayment(paymentData);

            if (result.success) {
                toast({
                    title: "Cash Payment Registered",
                    description: "Your appointment has been scheduled. Please pay at the clinic.",
                });

                navigate("/confirmation", {
                    state: {
                        clinicName,
                        doctorName,
                        appointmentTime,
                        paymentMethod: 'cash',
                        status: 'pending_payment'
                    }
                });
            }

        } catch (error) {
            console.error('Cash payment error:', error);
            toast({
                title: "Registration Error",
                description: error instanceof Error ? error.message : "Failed to register cash payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="loading-spinner"></div>
                    <p className="mt-4">Loading payment information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-3xl mx-auto py-8 px-4 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
            <Alert className={`mb-6 bg-blue-50 border-blue-200 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <AlertDescription>
                    <span className="font-medium">{t('payment.securePayment')}:</span> {t('payment.allTransactionsEncrypted')}
                </AlertDescription>
            </Alert>

            <Card className={`mb-6 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle>{t('payment.appointmentSummary')}</CardTitle>
                    <CardDescription>{t('payment.reviewAppointmentDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className={`grid grid-cols-2 gap-2 ${isRTL ? 'text-left font-arabic' : 'text-left'}`}>
                        <div className="text-sm font-medium">{t('payment.clinic')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{clinicName}</div>

                        <div className="text-sm font-medium">{t('payment.doctor')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{doctorName}</div>

                        <div className="text-sm font-medium">{t('payment.specialty')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{specialty}</div>

                        <div className="text-sm font-medium">{t('payment.day')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{appointmentDay}</div>

                        <div className="text-sm font-medium">{t('payment.time')}:</div>
                        <div className={isRTL ? 'text-left font-arabic' : ''}>{appointmentTime}</div>

                        <div className="text-sm font-medium">{t('payment.totalAmount')}:</div>
                        <div className={`font-bold ${isRTL ? 'text-left font-arabic' : ''}`}>₪{price}</div>
                    </div>
                </CardContent>
            </Card>

            <Card dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                <CardHeader>
                    <CardTitle className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.paymentMethod')}</CardTitle>
                    <CardDescription className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.choosePaymentMethod')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} dir={isRTL ? "rtl" : "ltr"}>
                        <TabsList className={`grid grid-cols-2 mb-6 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                            <TabsTrigger value="cash">{t('payment.cash')}</TabsTrigger>
                            <TabsTrigger value="creditCard">{t('payment.creditCard')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="cash">
                            <div className="space-y-6 py-4" dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                <div className={`bg-amber-50 p-4 rounded-md border border-amber-200 ${isRTL ? 'text-left font-arabic' : 'text-left'}`}>
                                    <h3 className="font-medium text-amber-800 mb-2">{t('payment.cashPaymentInformation')}</h3>
                                    <p className="text-amber-700 mb-3">
                                        {t('payment.cashPaymentNote', { price })}
                                    </p>
                                    <ul className={`text-sm text-amber-700 space-y-2 list-disc ${isRTL ? 'pr-5 font-arabic' : 'pl-5'}`}>
                                        <li>{t('payment.paymentAtReception')}</li>
                                        <li>{t('payment.onlyCashShekel')}</li>
                                        <li>{t('payment.receiptProvided')}</li>
                                        <li>{t('payment.failureToPayMayReschedule')}</li>
                                    </ul>
                                </div>
                                <form onSubmit={handleCashSubmit} className="space-y-6">
                                    <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
                                        <Checkbox
                                            id="cashTerms"
                                            checked={agreedToCashTerms}
                                            onCheckedChange={(checked) => setAgreedToCashTerms(checked === true)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="cashTerms"
                                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? 'text-right' : 'text-left'}`}
                                            >
                                                {t('payment.agreeToTerms')}
                                            </Label>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isProcessing || !agreedToCashTerms}
                                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                    >
                                        {isProcessing ? t('payment.processing') : t('payment.confirmCashPayment')}
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>

                        <TabsContent value="creditCard">
                            <form onSubmit={handleCreditCardSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.cardNumber')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="cardNumber"
                                            name="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            className={isRTL ? 'text-left font-arabic' : ''}
                                            dir="ltr"
                                            required
                                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                        />
                                        {formData.cardNumber && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                                {getCardType(formData.cardNumber)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cardName" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.nameOnCard')}</Label>
                                    <Input
                                        id="cardName"
                                        name="cardName"
                                        placeholder={t('payment.cardNamePlaceholder')}
                                        value={formData.cardName}
                                        onChange={handleInputChange}
                                        className={isRTL ? 'text-left font-arabic' : ''}
                                        required
                                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.expiryDate')}</Label>
                                        <Input
                                            id="expiry"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={formData.expiry}
                                            onChange={handleInputChange}
                                            className={isRTL ? 'text-left font-arabic' : ''}
                                            dir="ltr"
                                            required
                                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cvv" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.cvv')}</Label>
                                        <Input
                                            id="cvv"
                                            name="cvv"
                                            placeholder="123"
                                            value={formData.cvv}
                                            onChange={handleInputChange}
                                            className={isRTL ? 'text-left font-arabic' : ''}
                                            dir="ltr"
                                            required
                                            style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={isProcessing} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                        {isProcessing ? t('payment.processing') : `${t('payment.payNow')} ₪${price}`}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className={`justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                    <Button variant="outline" onClick={() => navigate("/clinics")}
                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                        {t('payment.back')}
                    </Button>
                    <div className="text-sm text-gray-500">
                        {t('payment.dataProtected')}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Payment;