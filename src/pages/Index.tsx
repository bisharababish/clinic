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
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, Calendar, CreditCard } from "lucide-react";

const Index = () => {
  const [formData, setFormData] = useState({
    english_username_a: "",
    english_username_b: "",
    english_username_c: "",
    english_username_d: "",
    arabic_username_a: "",
    arabic_username_b: "",
    arabic_username_c: "",
    arabic_username_d: "",
    email: "",
    id_number: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    weight: "",
    height: "",
    bloodType: "A+",
  });

  const [selectedDisease, setSelectedDisease] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [patientLogs, setPatientLogs] = useState<string[]>([]);

  const commonDiseases = [
    "High blood pressure", "Diabetes", `Cholesterol HDL`, `Cholesterol LDL`, "Kidney", "Cancer", `Heart Disease`, "Asthma", "Alzheimer/Dementia", "Arthritis"
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
  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">User Creation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-medium">Full Name (English) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <Label htmlFor="english_username_a" className="text-xs">First Name</Label>
                <div className="relative">
                  <Input
                    id="english_username_a"
                    name="english_username_a"
                    value={formData.english_username_a}
                    onChange={handleFormDataChange}
                    required
                    placeholder="First"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="english_username_b" className="text-xs">Second Name</Label>
                <div className="relative">
                  <Input
                    id="english_username_b"
                    name="english_username_b"
                    value={formData.english_username_b}
                    onChange={handleFormDataChange}
                    placeholder="Second"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="english_username_c" className="text-xs">Third Name</Label>
                <div className="relative">
                  <Input
                    id="english_username_c"
                    name="english_username_c"
                    value={formData.english_username_c}
                    onChange={handleFormDataChange}
                    placeholder="Third"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="english_username_d" className="text-xs">Last Name</Label>
                <div className="relative">
                  <Input
                    id="english_username_d"
                    name="english_username_d"
                    value={formData.english_username_d}
                    onChange={handleFormDataChange}
                    required
                    placeholder="Last"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Arabic Name Fields */}
          <div>
            <Label className="text-base font-medium">Full Name (Arabic) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <Label htmlFor="arabic_username_a" className="text-xs">الاسم الأول</Label>
                <div className="relative">
                  <Input
                    id="arabic_username_a"
                    name="arabic_username_a"
                    value={formData.arabic_username_a}
                    onChange={handleFormDataChange}
                    required
                    dir="rtl"
                    placeholder="الأول"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="arabic_username_b" className="text-xs">الاسم الثاني</Label>
                <div className="relative">
                  <Input
                    id="arabic_username_b"
                    name="arabic_username_b"
                    value={formData.arabic_username_b}
                    onChange={handleFormDataChange}
                    dir="rtl"
                    placeholder="الثاني"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="arabic_username_c" className="text-xs">الاسم الثالث</Label>
                <div className="relative">
                  <Input
                    id="arabic_username_c"
                    name="arabic_username_c"
                    value={formData.arabic_username_c}
                    onChange={handleFormDataChange}
                    dir="rtl"
                    placeholder="الثالث"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="arabic_username_d" className="text-xs">الاسم الرابع</Label>
                <div className="relative">
                  <Input
                    id="arabic_username_d"
                    name="arabic_username_d"
                    value={formData.arabic_username_d}
                    onChange={handleFormDataChange}
                    required
                    dir="rtl"
                    placeholder="الأخير"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormDataChange}
                className="pl-10"
                required
                placeholder="name@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_number">ID Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="id_number"
                name="id_number"
                type="text"
                value={formData.id_number}
                onChange={handleFormDataChange}
                className="pl-10"
                required
                placeholder="Your ID Number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleFormDataChange}
                className="pl-10"
                required
                placeholder="123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleFormDataChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender *</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleFormDataChange}
                className="pl-10"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleFormDataChange}
                className="pl-10"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

        </div>

      </section>
      {/* Section 1: Patient Information */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={patientInfo.weight}
              onChange={handleFormDataChange}
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
              onChange={handleFormDataChange}
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
              <RadioGroupItem value={disease} id={`disease-${disease}`} />
              <Label htmlFor={`disease-${disease}`} className="text-lg cursor-pointer w-full">
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