// pages/Payment.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaymentMethod = "paypal" | "creditCard" | "insurance";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clinicName, doctorName, appointmentTime, price } = location.state || {
        clinicName: "Selected Clinic",
        doctorName: "Selected Doctor",
        appointmentTime: "Selected Time",
        price: 150,
    };

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("creditCard");
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            // Redirect to confirmation page
            navigate("/confirmation", {
                state: {
                    clinicName,
                    doctorName,
                    appointmentTime,
                    paymentMethod
                }
            });
        }, 2000);
    };

    const insuranceProviders = [
        "Blue Cross Blue Shield",
        "UnitedHealthcare",
        "Cigna",
        "Aetna",
        "Humana",
        "Kaiser Permanente",
        "Medicare",
        "Medicaid",
        "Other"
    ];

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription>
                    <span className="font-medium">Secure Payment:</span> All transactions are encrypted and secure.
                </AlertDescription>
            </Alert>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Appointment Summary</CardTitle>
                    <CardDescription>Please review your appointment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Clinic:</div>
                        <div>{clinicName}</div>

                        <div className="text-sm font-medium">Doctor:</div>
                        <div>{doctorName}</div>

                        <div className="text-sm font-medium">Appointment Time:</div>
                        <div>{appointmentTime}</div>

                        <div className="text-sm font-medium">Total Amount:</div>
                        <div className="font-bold">${price}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                        <TabsList className="grid grid-cols-3 mb-6">
                            <TabsTrigger value="creditCard">Credit Card</TabsTrigger>
                            <TabsTrigger value="paypal">PayPal</TabsTrigger>
                            <TabsTrigger value="insurance">Insurance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="creditCard">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input
                                        id="cardNumber"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cardName">Name on Card</Label>
                                    <Input
                                        id="cardName"
                                        name="cardName"
                                        placeholder="John Doe"
                                        value={formData.cardName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input
                                            id="expiry"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={formData.expiry}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input
                                            id="cvv"
                                            name="cvv"
                                            placeholder="123"
                                            value={formData.cvv}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={isProcessing}>
                                        {isProcessing ? "Processing..." : "Pay Now"}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="paypal">
                            <div className="text-center space-y-4 py-4">
                                <div className="mb-6">
                                    <svg className="mx-auto h-12" viewBox="0 0 124 33" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z" fill="#003087" />
                                        <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z" fill="#003087" />
                                        <path d="M68.94 13.374h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#009cde" />
                                        <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746z" fill="#003087" />
                                    </svg>
                                </div>
                                <p className="text-lg">Continue with PayPal to complete payment</p>
                                <Button onClick={handleSubmit} className="w-full max-w-xs mx-auto" disabled={isProcessing}>
                                    {isProcessing ? "Processing..." : "Pay with PayPal"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="insurance">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                                    <Select
                                        value={formData.insuranceProvider}
                                        onValueChange={(value) => handleSelectChange("insuranceProvider", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your insurance provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {insuranceProviders.map(provider => (
                                                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policyNumber">Policy Number</Label>
                                    <Input
                                        id="policyNumber"
                                        name="policyNumber"
                                        placeholder="Policy number"
                                        value={formData.policyNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="memberID">Member ID</Label>
                                    <Input
                                        id="memberID"
                                        name="memberID"
                                        placeholder="Member ID"
                                        value={formData.memberID}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={isProcessing}>
                                        {isProcessing ? "Verifying Insurance..." : "Submit Insurance"}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-between border-t pt-4">
                    <Button variant="outline" onClick={() => navigate("/clinics")}>
                        Back
                    </Button>
                    <div className="text-sm text-gray-500">
                        Your data is protected
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Payment;