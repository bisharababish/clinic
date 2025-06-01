// pages/Index.tsx
import { useState, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, Calendar, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/components/contexts/LanguageContext";

const Index = () => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

  const [formData, setFormData] = useState({
    // English name fields
    english_username_a: "",
    english_username_b: "",
    english_username_c: "",
    english_username_d: "",

    // Arabic name fields
    arabic_username_a: "",
    arabic_username_b: "",
    arabic_username_c: "",
    arabic_username_d: "",

    // Other fields 
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

  // Define diseases and medicines with translations
  const commonDiseases = [
    { key: "highBloodPressure", en: "High blood pressure", ar: "ضغط الدم المرتفع" },
    { key: "diabetes", en: "Diabetes", ar: "السكري" },
    { key: "cholesterolHDL", en: "Cholesterol HDL", ar: "الكوليسترول HDL" },
    { key: "cholesterolLDL", en: "Cholesterol LDL", ar: "الكوليسترول LDL" },
    { key: "kidney", en: "Kidney", ar: "الكلى" },
    { key: "cancer", en: "Cancer", ar: "السرطان" },
    { key: "heartDisease", en: "Heart Disease", ar: "أمراض القلب" },
    { key: "asthma", en: "Asthma", ar: "الربو" },
    { key: "alzheimer", en: "Alzheimer/Dementia", ar: "الزهايمر/الخرف" },
    { key: "arthritis", en: "Arthritis", ar: "التهاب المفاصل" }
  ];

  const medicineCategories = [
    {
      category: { en: "Pain Relief", ar: "مسكنات الألم" },
      medicines: [
        { en: "Paracetamol", ar: "باراسيتامول" },
        { en: "Ibuprofen", ar: "إيبوبروفين" }
      ]
    },
    {
      category: { en: "Flu", ar: "الإنفلونزا" },
      medicines: [
        { en: "Oseltamivir", ar: "أوسيلتاميفير" },
        { en: "Zanamivir", ar: "زاناميفير" }
      ]
    },
    {
      category: { en: "Allergy", ar: "الحساسية" },
      medicines: [
        { en: "Loratadine", ar: "لوراتادين" },
        { en: "Cetirizine", ar: "سيتيريزين" }
      ]
    },
    {
      category: { en: "Antibiotics", ar: "المضادات الحيوية" },
      medicines: [
        { en: "Amoxicillin", ar: "أموكسيسيلين" },
        { en: "Azithromycin", ar: "أزيثروميسين" }
      ]
    }
  ];

  // Define placeholders based on current language
  const placeholders = {
    english: {
      first: isRTL ? "الأول (بالإنجليزية)" : "First",
      second: isRTL ? "الثاني (بالإنجليزية)" : "Second",
      third: isRTL ? "الثالث (بالإنجليزية)" : "Third",
      last: isRTL ? "الأخير (بالإنجليزية)" : "Last"
    },
    arabic: {
      first: isRTL ? "الأول" : "الأول",
      second: isRTL ? "الثاني" : "الثاني",
      third: isRTL ? "الثالث" : "الثالث",
      last: isRTL ? "الأخير" : "الأخير"
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = () => {
    const logEntry = `${t("home.patientInfoUpdated")} ${new Date().toLocaleString()}`;
    setPatientLogs(prev => [...prev, logEntry]);
  };

  const handleMedicineSelect = (medicine: string) => {
    setSelectedMedicines(prev =>
      prev.includes(medicine)
        ? prev.filter(m => m !== medicine)
        : [...prev, medicine]
    );
  };

  // Function to check if the current user role can see the user creation section
  const canSeeUserCreation = (): boolean => {
    return ["admin", "doctor", "nurse", "secretary"].includes(userRole);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Notification Alert - visible to all */}
      <Alert variant="default" className={`bg-blue-50 border-blue-200 ${isRTL ? 'mb-12' : 'mb-8'}`}>
        <AlertDescription className={isRTL ? 'py-4 px-2' : 'py-2'}>
          <span className="font-medium">{t("home.reminder")}:</span> {t("home.reservationRequired")}
          <Button variant="link" className={`h-auto p-0 ${isRTL ? 'mr-3' : 'ml-2'}`} asChild>
            <Link to="/clinics">{t("home.bookNow")}</Link>
          </Button>
        </AlertDescription>
      </Alert>

      {/* User Creation Section - Only visible to admin, doctor, nurse, secretary */}
      {canSeeUserCreation() && (
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.userCreation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name Fields */}
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <div>
                  <Label htmlFor="english_username_a" className="text-xs">
                    {isRTL ? t("auth.firstNameEn") : "First Name"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="english_username_a"
                      name="english_username_a"
                      value={formData.english_username_a}
                      onChange={handleFormDataChange}
                      required
                      placeholder={placeholders.english.first}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="english_username_b" className="text-xs">
                    {isRTL ? t("auth.secondNameEn") : "Second Name"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="english_username_b"
                      name="english_username_b"
                      value={formData.english_username_b}
                      onChange={handleFormDataChange}
                      placeholder={placeholders.english.second}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="english_username_c" className="text-xs">
                    {isRTL ? t("auth.thirdNameEn") : "Third Name"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="english_username_c"
                      name="english_username_c"
                      value={formData.english_username_c}
                      onChange={handleFormDataChange}
                      placeholder={placeholders.english.third}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="english_username_d" className="text-xs">
                    {isRTL ? t("auth.lastNameEn") : "Last Name"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="english_username_d"
                      name="english_username_d"
                      value={formData.english_username_d}
                      onChange={handleFormDataChange}
                      required
                      placeholder={placeholders.english.last}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Arabic Name Fields */}
            <div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {isRTL ? (
                  // RTL Layout
                  <>
                    <div>
                      <Label htmlFor="arabic_username_a" className="text-xs">{t("auth.firstNameAr")}</Label>
                      <Input
                        id="arabic_username_a"
                        name="arabic_username_a"
                        value={formData.arabic_username_a}
                        onChange={handleFormDataChange}
                        required
                        dir="rtl"
                        placeholder={placeholders.arabic.first}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_b" className="text-xs">{t("auth.secondNameAr")}</Label>
                      <Input
                        id="arabic_username_b"
                        name="arabic_username_b"
                        value={formData.arabic_username_b}
                        onChange={handleFormDataChange}
                        dir="rtl"
                        placeholder={placeholders.arabic.second}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_c" className="text-xs">{t("auth.thirdNameAr")}</Label>
                      <Input
                        id="arabic_username_c"
                        name="arabic_username_c"
                        value={formData.arabic_username_c}
                        onChange={handleFormDataChange}
                        dir="rtl"
                        placeholder={placeholders.arabic.third}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_d" className="text-xs">{t("auth.lastNameAr")}</Label>
                      <Input
                        id="arabic_username_d"
                        name="arabic_username_d"
                        value={formData.arabic_username_d}
                        onChange={handleFormDataChange}
                        required
                        dir="rtl"
                        placeholder={placeholders.arabic.last}
                      />
                    </div>
                  </>
                ) : (
                  // LTR Layout
                  <>
                    <div>
                      <Label htmlFor="arabic_username_d" className="text-xs text-right w-full block mb-1">الاسم الرابع</Label>
                      <Input
                        id="arabic_username_d"
                        name="arabic_username_d"
                        value={formData.arabic_username_d}
                        onChange={handleFormDataChange}
                        required
                        dir="rtl"
                        placeholder={placeholders.arabic.last}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_c" className="text-xs text-right w-full block mb-1">الاسم الثالث</Label>
                      <Input
                        id="arabic_username_c"
                        name="arabic_username_c"
                        value={formData.arabic_username_c}
                        onChange={handleFormDataChange}
                        dir="rtl"
                        placeholder={placeholders.arabic.third}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_b" className="text-xs text-right w-full block mb-1">الاسم الثاني</Label>
                      <Input
                        id="arabic_username_b"
                        name="arabic_username_b"
                        value={formData.arabic_username_b}
                        onChange={handleFormDataChange}
                        dir="rtl"
                        placeholder={placeholders.arabic.second}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabic_username_a" className="text-xs text-right w-full block mb-1">الاسم الأول</Label>
                      <Input
                        id="arabic_username_a"
                        name="arabic_username_a"
                        value={formData.arabic_username_a}
                        onChange={handleFormDataChange}
                        required
                        dir="rtl"
                        placeholder={placeholders.arabic.first}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormDataChange}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                  required
                  placeholder={t("home.homeemail")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">{t("auth.idNumber")}</Label>
              <div className="relative">
                <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="id_number"
                  name="id_number"
                  type="text"
                  value={formData.id_number}
                  onChange={handleFormDataChange}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                  required
                  placeholder={t("auth.yourIDNumber")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("common.phone")}</Label>
              <div className="relative">
                <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleFormDataChange}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                  required
                  placeholder={isRTL ? "٩٨٧٦٥٤٣٢١" : "123456789"} dir={isRTL ? "rtl" : "ltr"}  // ADD THIS LINE
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t("auth.dateOfBirth")}</Label>
              <div className="relative">
                <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleFormDataChange}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} ${isRTL ? 'text-left' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("auth.gender")}</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                className={`flex gap-4 mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}
              >
                {isRTL ? (
                  // Arabic: Female first, then Male
                  <>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="female">{t("auth.female")}</Label>
                      <RadioGroupItem value="female" id="female" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="male">{t("auth.male")}</Label>
                      <RadioGroupItem value="male" id="male" />
                    </div>
                  </>
                ) : (
                  // English: Male first, then Female
                  <>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">{t("auth.male")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">{t("auth.female")}</Label>
                    </div>
                  </>
                )}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleFormDataChange}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-muted-foreground hover:text-foreground`}
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
              <Label htmlFor="confirmPassword">{t("common.confirmPassword")}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleFormDataChange}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Patient Information Section - visible to ALL users */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.patientInformation")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight">{t("home.weight")} (kg)</Label>
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
            <Label htmlFor="height">{t("home.height")} (cm)</Label>
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
            <Label>{t("home.bloodType")}</Label>
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

      {/* Common Diseases - visible to ALL users */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.commonDiseases")}</h2>
        <RadioGroup
          value={selectedDisease}
          onValueChange={setSelectedDisease}
          className="grid grid-cols-1 gap-3"
        >
          {commonDiseases.map(disease => (
            <div key={disease.key} className="border rounded-lg hover:bg-gray-50">
              <label
                htmlFor={`disease-${disease.key}`}
                className={`flex items-center p-4 cursor-pointer gap-3 ${isRTL ? 'flex-row-reverse' : ''
                  }`}
              >
                <RadioGroupItem value={disease.key} id={`disease-${disease.key}`} />
                <span
                  className={`text-lg flex-1 ${isRTL ? 'text-right' : 'text-left'
                    }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isRTL ? disease.ar : disease.en}
                </span>
              </label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Medicine Categories - visible to ALL users */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.medicinesTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicineCategories.map(({ category, medicines }) => (
            <div key={category.en} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {isRTL ? category.ar : category.en}
              </h3>
              <div className="space-y-3">
                {medicines.map(medicine => (
                  <div key={medicine.en} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                    <input
                      type="checkbox"
                      id={medicine.en}
                      checked={selectedMedicines.includes(medicine.en)}
                      onChange={() => handleMedicineSelect(medicine.en)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={medicine.en} className="text-base">
                      {isRTL ? medicine.ar : medicine.en}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Logs - visible to ALL users */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("home.patientLogs")}</h2>
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
              <p className="text-gray-500 text-center py-8">{t("home.noActivityLogs")}</p>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* Save Button - visible to ALL users */}
      <Button className="mt-6 w-full md:w-auto" onClick={handleSaveInfo}>
        {t("common.save")} {t("home.information")}
      </Button>
    </div>
  );
};

export default Index;