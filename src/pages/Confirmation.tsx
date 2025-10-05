import { CheckCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const Confirmation = () => {
    const location = useLocation();
    const { clinicName, doctorName, appointmentTime, paymentMethod, confirmationNumber } = location.state || {
        clinicName: "Selected Clinic",
        doctorName: "Selected Doctor",
        appointmentTime: "Selected Time",
        paymentMethod: "cash",
        confirmationNumber: undefined
    };

    const paymentMethodDisplay: Record<string, string> = {
        cash: "Cash",
    };

    const fallbackConfirmation = `APT${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 3); // Sample future date

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="text-center mb-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-green-700">Appointment Confirmed!</h1>
                <p className="text-gray-600 mt-2">Your medical appointment has been successfully booked</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appointment Details</CardTitle>
                    <CardDescription>Please keep this information for your records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-sm font-medium">Confirmation Number:</div>
                        <div className="font-bold">{confirmationNumber || fallbackConfirmation}</div>

                        <div className="text-sm font-medium">Clinic:</div>
                        <div>{clinicName}</div>

                        <div className="text-sm font-medium">Doctor:</div>
                        <div>{doctorName}</div>

                        <div className="text-sm font-medium">Appointment Time:</div>
                        <div>{appointmentTime}</div>

                        <div className="text-sm font-medium">Paid Using:</div>
                        <div>{paymentMethodDisplay[paymentMethod as keyof typeof paymentMethodDisplay] || 'Cash'}</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-blue-800">
                        <h3 className="font-medium mb-2">Important Instructions:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Please arrive 15 minutes before your appointment time</li>
                            <li>Bring your ID and insurance card (if applicable)</li>
                            <li>Wear a mask during your visit</li>
                            <li>Reschedule at least 24 hours in advance if unable to attend</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex-col space-y-3">
                    <Button className="w-full" asChild>
                        <Link to="/">Return to Home</Link>
                    </Button>
                    <div className="text-sm text-center text-gray-500">
                        A confirmation email has been sent to your registered email address
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Confirmation;