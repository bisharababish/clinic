import { CheckCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { freeAutoTranslateAppointmentData } from "../lib/freeTranslationService";

const Confirmation = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const {
        clinicName,
        doctorName,
        specialty,
        appointmentDay,
        appointmentTime,
        paymentMethod,
        confirmationNumber,
        clinicNameAr,
        doctorNameAr,
        specialtyAr
    } = location.state || {
        clinicName: t('payment.selectedClinic'),
        doctorName: t('payment.selectedDoctor'),
        specialty: t('payment.selectedSpecialty'),
        appointmentDay: t('payment.selectedDay'),
        appointmentTime: t('payment.selectedTime'),
        paymentMethod: "cash",
        confirmationNumber: undefined,
        clinicNameAr: undefined,
        doctorNameAr: undefined,
        specialtyAr: undefined
    };

    // Auto-translated appointment data
    const [translatedAppointment, setTranslatedAppointment] = useState({
        clinicName: clinicName || '',
        doctorName: doctorName || '',
        specialty: specialty || '',
        appointmentDay: appointmentDay || '',
        appointmentTime: appointmentTime || ''
    });

    // Auto-translate when language changes
    useEffect(() => {
        const translateData = async () => {
            const translated = await freeAutoTranslateAppointmentData(
                {
                    clinicName,
                    doctorName,
                    specialty,
                    appointmentDay,
                    appointmentTime
                },
                i18n.language
            );
            setTranslatedAppointment(translated);
        };

        translateData();
    }, [clinicName, doctorName, specialty, appointmentDay, appointmentTime, i18n.language]);

    const paymentMethodDisplay: Record<string, string> = {
        cash: t('payment.cash'),
    };

    const fallbackConfirmation = `APT${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 3);

    return (
        <div className={`max-w-3xl mx-auto py-12 px-4 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="text-center mb-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className={`text-3xl font-bold text-green-700 ${isRTL ? 'font-arabic' : ''}`}>
                    {t('paymentSuccess.paymentSuccessfulTitle')}
                </h1>
                <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
                    {t('paymentSuccess.appointmentConfirmedAndPaid')}
                </p>
            </div>

            <Card dir={isRTL ? "rtl" : "ltr"}>
                <CardHeader>
                    <CardTitle className={isRTL ? 'font-arabic text-right' : ''}>
                        {t('paymentSuccess.appointmentDetails')}
                    </CardTitle>
                    <CardDescription className={isRTL ? 'font-arabic text-right' : ''}>
                        {t('paymentSuccess.appointmentDetails')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className={`grid grid-cols-2 gap-3 ${isRTL ? 'font-arabic' : ''}`}>
                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('common.name')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic font-bold' : 'font-bold'}>
                            {confirmationNumber || fallbackConfirmation}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('payment.clinic')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {translatedAppointment.clinicName}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('payment.doctor')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {translatedAppointment.doctorName}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('payment.specialty')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {translatedAppointment.specialty}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('payment.day')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {translatedAppointment.appointmentDay}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('payment.time')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {translatedAppointment.appointmentTime}
                        </div>

                        <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                            {t('paymentSuccess.paymentMethod')}:
                        </div>
                        <div className={isRTL ? 'text-right font-arabic' : ''}>
                            {paymentMethodDisplay[paymentMethod as keyof typeof paymentMethodDisplay] || t('payment.cash')}
                        </div>
                    </div>

                    <div className={`bg-blue-50 border border-blue-100 rounded-md p-4 text-blue-800 ${isRTL ? 'font-arabic text-right' : ''}`}>
                        <h3 className="font-medium mb-2">
                            {isRTL ? 'تعليمات مهمة:' : 'Important Instructions:'}
                        </h3>
                        <ul className={`space-y-1 text-sm ${isRTL ? 'pr-5 list-disc' : 'pl-5 list-disc'}`}>
                            <li>{isRTL ? 'يرجى الحضور قبل 15 دقيقة من موعدك' : 'Please arrive 15 minutes before your appointment time'}</li>
                            <li>{isRTL ? 'أحضر بطاقة الهوية وبطاقة التأمين (إن وجدت)' : 'Bring your ID and insurance card (if applicable)'}</li>
                            <li>{isRTL ? 'ارتدِ كمامة أثناء زيارتك' : 'Wear a mask during your visit'}</li>
                            <li>{isRTL ? 'أعد الجدولة قبل 24 ساعة على الأقل إذا لم تتمكن من الحضور' : 'Reschedule at least 24 hours in advance if unable to attend'}</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex-col space-y-3">
                    <Button className="w-full" asChild>
                        <Link to="/" className={isRTL ? 'font-arabic' : ''}>
                            {isRTL ? 'العودة للرئيسية' : 'Return to Home'}
                        </Link>
                    </Button>
                    <div className={`text-sm text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'تم إرسال بريد إلكتروني للتأكيد إلى عنوان بريدك المسجل' : 'A confirmation email has been sent to your registered email address'}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Confirmation;