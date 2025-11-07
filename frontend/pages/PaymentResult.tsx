import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { apiCall } from "../src/lib/api";
import { useToast } from "../components/ui/use-toast";

interface HostedCheckoutConfirmResponse {
    success: boolean;
    status: "completed" | "failed";
    decision?: string;
    referenceNumber?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    error?: string;
    details?: string;
}

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const isRTL = useMemo(() => i18n.dir() === "rtl", [i18n]);

    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
    const [details, setDetails] = useState<HostedCheckoutConfirmResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (!params.has("signature")) {
            setStatus("failed");
            setErrorMessage(isRTL ? "بيانات الدفع غير متوفرة." : "Payment confirmation data is missing.");
            return;
        }

        const fields: Record<string, string> = {};
        params.forEach((value, key) => {
            fields[key] = value;
        });

        let isCancelled = false;

        const confirmPayment = async () => {
            try {
                const response = await apiCall<HostedCheckoutConfirmResponse>("/api/payments/cybersource/confirm", {
                    method: "POST",
                    body: JSON.stringify({ fields }),
                });

                if (isCancelled) {
                    return;
                }

                if (response.success && response.status === "completed") {
                    setStatus("success");
                    setDetails(response);
                    toast({
                        title: isRTL ? "تم تأكيد الدفع" : "Payment Confirmed",
                        description: isRTL ? "تمت معالجة دفعتك بنجاح." : "Your payment has been processed successfully.",
                    });
                } else {
                    setStatus("failed");
                    setDetails(response);
                    setErrorMessage(response.error || (isRTL ? "تعذر معالجة الدفع." : "The payment could not be processed."));
                }
            } catch (error) {
                if (isCancelled) {
                    return;
                }
                console.error("Hosted checkout confirmation failed:", error);
                setStatus("failed");
                setErrorMessage(error instanceof Error ? error.message : (isRTL ? "فشل التحقق من الدفع." : "Failed to verify payment."));
            }
        };

        confirmPayment();

        return () => {
            isCancelled = true;
        };
    }, [i18n, isRTL, location.search, toast]);

    const handleGoHome = () => {
        navigate("/home");
    };

    const handleGoToDashboard = () => {
        navigate("/patient/dashboard");
    };

    const handleRetry = () => {
        navigate("/payment");
    };

    const amountDisplay = useMemo(() => {
        if (!details?.amount) return null;
        const currency = details.currency || "ILS";
        const amount = details.amount.toFixed(2);
        if (currency === "ILS") {
            return `₪${amount}`;
        }
        if (currency === "USD") {
            return `$${amount}`;
        }
        return `${amount} ${currency}`;
    }, [details]);

    return (
        <div className={`min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="mx-auto max-w-2xl">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                            {status === "processing" && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
                            {status === "success" && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                            {status === "failed" && <XCircle className="h-6 w-6 text-red-600" />}
                            <span>
                                {status === "processing"
                                    ? (isRTL ? "جاري التحقق من الدفع" : "Verifying payment")
                                    : status === "success"
                                        ? (isRTL ? "تم الدفع بنجاح" : "Payment Successful")
                                        : (isRTL ? "فشل الدفع" : "Payment Failed")}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status === "processing" && (
                            <p className="text-muted-foreground text-sm">
                                {isRTL
                                    ? "يرجى الانتظار بينما نقوم بالتحقق من تفاصيل الدفع الخاصة بك."
                                    : "Please wait while we verify your payment details."}
                            </p>
                        )}

                        {status !== "processing" && (
                            <div className="space-y-4">
                                {details?.referenceNumber && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                        <p className="font-medium text-slate-700">
                                            {isRTL ? "رقم المرجع" : "Reference Number"}
                                        </p>
                                        <p className="text-slate-500">{details.referenceNumber}</p>
                                    </div>
                                )}
                                {amountDisplay && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                        <p className="font-medium text-slate-700">
                                            {isRTL ? "المبلغ المدفوع" : "Amount"}
                                        </p>
                                        <p className="text-slate-500">{amountDisplay}</p>
                                    </div>
                                )}
                                {details?.transactionId && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                        <p className="font-medium text-slate-700">
                                            {isRTL ? "معرّف العملية" : "Transaction ID"}
                                        </p>
                                        <p className="text-slate-500">{details.transactionId}</p>
                                    </div>
                                )}
                                {status === "failed" && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        <p className="font-medium">
                                            {isRTL ? "تفاصيل الخطأ" : "Error Details"}
                                        </p>
                                        <p>{errorMessage || (isRTL ? "حدث خطأ غير متوقع." : "An unexpected error occurred.")}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className={`flex flex-col gap-3 sm:flex-row sm:justify-end ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                        {status === "success" ? (
                            <>
                                <Button variant="outline" onClick={handleGoHome}>
                                    {isRTL ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
                                </Button>
                                <Button onClick={handleGoToDashboard}>
                                    {isRTL ? "الانتقال إلى لوحة المريض" : "Go to Patient Dashboard"}
                                </Button>
                            </>
                        ) : status === "failed" ? (
                            <>
                                <Button variant="outline" onClick={handleGoHome}>
                                    {isRTL ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
                                </Button>
                                <Button onClick={handleRetry}>
                                    {isRTL ? "إعادة المحاولة" : "Try Again"}
                                </Button>
                            </>
                        ) : null}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default PaymentResult;
