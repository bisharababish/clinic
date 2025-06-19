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

type PaymentMethod = "paypal" | "creditCard" | "insurance" | "cash";
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

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("creditCard");
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

        // Insurance
        insuranceProvider: "",
        policyNumber: "",
        memberID: "",
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

    const handlePayPalSubmit = async () => {
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
                paymentMethod: 'paypal',
                description: `Medical appointment - ${doctorName} at ${clinicName}`
            };

            // Create PayPal order
            const paypalOrder = await palestinianPaymentService.createPayPalOrder(paymentData);

            if (paypalOrder.approvalUrl) {
                // Redirect to PayPal for approval
                window.location.href = paypalOrder.approvalUrl;
            } else {
                throw new Error('Failed to create PayPal order');
            }

        } catch (error) {
            console.error('PayPal payment error:', error);
            toast({
                title: "PayPal Error",
                description: error instanceof Error ? error.message : "PayPal payment failed. Please try again.",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    const handleInsuranceSubmit = async (e: React.FormEvent) => {
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
                paymentMethod: 'insurance',
                description: `Medical appointment - ${doctorName} at ${clinicName}`
            };

            const insuranceData = {
                provider: formData.insuranceProvider,
                policyNumber: formData.policyNumber,
                memberID: formData.memberID
            };

            const result = await palestinianPaymentService.processInsurancePayment(paymentData, insuranceData);

            if (result.success) {
                toast({
                    title: "Insurance Claim Submitted",
                    description: "Your insurance claim has been submitted for verification.",
                });

                navigate("/confirmation", {
                    state: {
                        clinicName,
                        doctorName,
                        appointmentTime,
                        paymentMethod: 'insurance',
                        status: 'pending_verification'
                    }
                });
            }

        } catch (error) {
            console.error('Insurance processing error:', error);
            toast({
                title: "Insurance Error",
                description: error instanceof Error ? error.message : "Insurance processing failed. Please try again.",
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

    const insuranceProviders = [
        "Clalit Health Services",
        "Maccabi Healthcare Services",
        "Meuhedet Health Maintenance Organization",
        "Leumit Health Care Services",
        "Palestinian Medical Relief Society",
        "Augusta Victoria Hospital Insurance",
        "Caritas Baby Hospital Insurance",
        "Al-Makassed Hospital Insurance",
        t('payment.other')
    ];

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
                        <TabsList className={`grid grid-cols-4 mb-6 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                            <TabsTrigger value="creditCard">{t('payment.creditCard')}</TabsTrigger>
                            <TabsTrigger value="paypal">{t('payment.paypal')}</TabsTrigger>
                            <TabsTrigger value="insurance">{t('payment.insurance')}</TabsTrigger>
                            <TabsTrigger value="cash">{t('payment.cash')}</TabsTrigger>
                        </TabsList>

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

                        <TabsContent value="paypal">
                            <div className={`text-center space-y-4 py-4 ${isRTL ? 'text-left font-arabic' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                <div className="mb-6 flex justify-center">
                                    <svg className="h-12" viewBox="0 0 124 33" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z" fill="#003087" />
                                        <path d="M68.94 13.374h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#009cde" />
                                        <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746z" fill="#003087" />
                                    </svg>
                                </div>
                                <p className="text-lg text-center">{t('payment.continueWithPaypal')}</p>
                                <p className="text-sm text-gray-600">Amount will be converted from ₪{price} to USD</p>
                                <div className="flex justify-center">
                                    <Button onClick={handlePayPalSubmit} className="w-full max-w-xs" disabled={isProcessing} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                        {isProcessing ? t('payment.processing') : t('payment.payWithPaypal')}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="insurance">
                            <form onSubmit={handleInsuranceSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                <div className="space-y-2">
                                    <Label htmlFor="insuranceProvider" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.insuranceProvider')}</Label>
                                    <Select
                                        value={formData.insuranceProvider}
                                        onValueChange={(value) => handleSelectChange("insuranceProvider", value)}
                                        dir={isRTL ? "rtl" : "ltr"}
                                    >
                                        <SelectTrigger className={isRTL ? 'text-left font-arabic' : 'text-left'} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                            <SelectValue placeholder={t('payment.selectInsuranceProvider')} />
                                        </SelectTrigger>
                                        <SelectContent style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                            {insuranceProviders.map(provider => (
                                                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policyNumber" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.policyNumber')}</Label>
                                    <Input
                                        id="policyNumber"
                                        name="policyNumber"
                                        placeholder={t('payment.policyNumberPlaceholder')}
                                        value={formData.policyNumber}
                                        onChange={handleInputChange}
                                        required
                                        className={isRTL ? 'text-left font-arabic' : ''}
                                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="memberID" className={isRTL ? 'text-left font-arabic' : 'text-left'}>{t('payment.memberID')}</Label>
                                    <Input
                                        id="memberID"
                                        name="memberID"
                                        placeholder={t('payment.memberIDPlaceholder')}
                                        value={formData.memberID}
                                        onChange={handleInputChange}
                                        required
                                        className={isRTL ? 'text-left font-arabic' : ''}
                                        style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={isProcessing} style={isRTL ? { fontFamily: 'Noto Sans Arabic, Cairo, Tajawal, Segoe UI, Tahoma, Arial, sans-serif' } : {}}>
                                        {isProcessing ? t('payment.verifyingInsurance') : t('payment.submitInsurance')}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

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