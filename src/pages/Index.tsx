// pages/Index.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const Index = () => {
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    weight: "",
    height: "",
    bloodType: "A+",
  });

  const [selectedDisease, setSelectedDisease] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [patientLogs, setPatientLogs] = useState<string[]>([]);

  const commonDiseases = [
    "Hypertension", "Diabetes", "Asthma", "Arthritis", "Migraine"
  ];

  const medicineCategories = [
    { category: "Pain Relief", medicines: ["Paracetamol", "Ibuprofen"] },
    { category: "Flu", medicines: ["Oseltamivir", "Zanamivir"] },
    { category: "Allergy", medicines: ["Loratadine", "Cetirizine"] },
    { category: "Antibiotics", medicines: ["Amoxicillin", "Azithromycin"] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = () => {
    const logEntry = `Patient info updated at ${new Date().toLocaleString()}`;
    setPatientLogs(prev => [...prev, logEntry]);
  };

  const handleMedicineSelect = (medicine: string) => {
    setSelectedMedicines(prev =>
      prev.includes(medicine)
        ? prev.filter(m => m !== medicine)
        : [...prev, medicine]
    );
  };
  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Notification Alert */}
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <AlertDescription>
          <span className="font-medium">Reminder:</span> Reservations are required for clinic visits.
          <Button variant="link" className="h-auto p-0 ml-2" asChild>
            <Link to="/clinics">Book now</Link>
          </Button>
        </AlertDescription>
      </Alert>
      {/* Section 1: Patient Information */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={patientInfo.name}
              onChange={handleInputChange}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={patientInfo.weight}
              onChange={handleInputChange}
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={patientInfo.height}
              onChange={handleInputChange}
              placeholder="175"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Blood Type</Label>
            <RadioGroup
              value={patientInfo.bloodType}
              onValueChange={(value) => setPatientInfo(prev => ({ ...prev, bloodType: value }))}
              className="grid grid-cols-4 md:grid-cols-8 gap-2"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
      </section>

      {/* Section 2: Common Diseases */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Common Diseases</h2>
        <RadioGroup
          value={selectedDisease}
          onValueChange={setSelectedDisease}
          className="grid grid-cols-1 gap-3"
        >
          {commonDiseases.map(disease => (
            <div key={disease} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={disease} id={disease} />
              <Label htmlFor={disease} className="text-lg cursor-pointer w-full">
                {disease}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Section 3: Medicine Categories */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Medicines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicineCategories.map(({ category, medicines }) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">{category}</h3>
              <div className="space-y-3">
                {medicines.map(medicine => (
                  <div key={medicine} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={medicine}
                      checked={selectedMedicines.includes(medicine)}
                      onChange={() => handleMedicineSelect(medicine)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={medicine} className="text-base">{medicine}</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Patient Logs */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Logs</h2>
        <ScrollArea className="h-64 rounded-md border">
          <div className="p-4">
            {patientLogs.length > 0 ? (
              <div className="space-y-3">
                {patientLogs.map((log, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-700">{log}</p>
                    {index < patientLogs.length - 1 && <Separator className="my-3" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No activity logs yet</p>
            )}
          </div>
        </ScrollArea>
      </section>
      <Button className="mt-6 w-full md:w-auto" onClick={handleSaveInfo}>
          Save Information
        </Button>
    </div>
  );
};

export default Index;