// src/components/auth/RegisterForm.tsx
import * as React from "react";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
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
        gender: "male",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isRTL } = useContext(LanguageContext);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: t("auth.invalidEmail"),
                description: t("auth.invalidEmail"),
                variant: "destructive",
            });
            return false;
        }

        // Phone validation (numbers only)
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            toast({
                title: t("auth.invalidPhone"),
                description: t("auth.phoneNumbersOnly"),
                variant: "destructive",
            });
            return false;
        }

        // Password strength
        if (formData.password.length < 6) {
            toast({
                title: t("auth.weakPassword"),
                description: t("auth.passwordLength"),
                variant: "destructive",
            });
            return false;
        }

        // Check if required name fields are filled (at least first and last name)
        if (!formData.english_username_a || !formData.english_username_d ||
            !formData.arabic_username_a || !formData.arabic_username_d) {
            toast({
                title: t("auth.missingNameInfo"),
                description: t("auth.fillRequiredNames"),
                variant: "destructive",
            });
            return false;
        }

        // Check if other required fields are filled
        if (!formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.password) {
            toast({
                title: t("auth.missingInfo"),
                description: t("auth.fillRequiredFields"),
                variant: "destructive",
            });
            return false;
        }

        if (!/^\d{9}$/.test(formData.id_number)) {
            toast({
                title: t("auth.invalidID"),
                description: t("auth.validIDRequired"),
                variant: "destructive",
            });
            return false;
        }

        // Password match
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: t("auth.passwordMismatch"),
                description: t("auth.passwordsDoNotMatch"),
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Step 1: Create auth user directly with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (authError) {
                console.error('Auth signup error:', authError);
                throw authError;
            }

            if (!authData.user) {
                throw new Error('Failed to create auth user');
            }

            console.log("Auth user created successfully");

            // Step 2: Create user profile in database
            const timestamp = new Date().toISOString();

            const { error: insertError } = await supabase
                .from('userinfo')
                .insert({
                    user_roles: 'Patient',
                    english_username_a: formData.english_username_a,
                    english_username_b: formData.english_username_b || "",
                    english_username_c: formData.english_username_c || "",
                    english_username_d: formData.english_username_d,
                    arabic_username_a: formData.arabic_username_a,
                    arabic_username_b: formData.arabic_username_b || "",
                    arabic_username_c: formData.arabic_username_c || "",
                    arabic_username_d: formData.arabic_username_d,
                    id_number: formData.id_number,
                    user_email: formData.email,
                    user_phonenumber: formData.phoneNumber,
                    date_of_birth: formData.dateOfBirth,
                    gender_user: formData.gender,
                    user_password: formData.password,
                    created_at: timestamp,
                    updated_at: timestamp
                });

            if (insertError) {
                console.error('Profile creation error:', insertError);

                if (insertError.message.includes('infinite recursion')) {
                    toast({
                        title: t("auth.registrationNote"),
                        description: t("auth.profileSetupAdmin"),
                        variant: "default",
                    });
                } else {
                    throw insertError;
                }
            }

            toast({
                title: t("auth.registrationSuccess"),
                description: t("auth.welcomeToClinic"),
            });

            // Auto-login after successful registration
            setTimeout(async () => {
                try {
                    await login(formData.email, formData.password);
                    window.location.href = "/";
                } catch (error) {
                    console.error("Auto-login failed:", error);
                    onSwitchToLogin();
                }
            }, 1500);

        } catch (error) {
            let errorMessage = t("auth.registrationFailed");

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: t("auth.registrationFailed"),
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Define placeholders based on current language
    const placeholders = {
        english: {
            first: isRTL ? "الأول " : "First",
            second: isRTL ? "الثاني " : "Second",
            third: isRTL ? "الثالث " : "Third",
            last: isRTL ? "الأخير " : "Last"
        },
        arabic: {
            first: isRTL ? "الأول" : "الأول",
            second: isRTL ? "الثاني" : "الثاني",
            third: isRTL ? "الثالث" : "الثالث",
            last: isRTL ? "الأخير" : "الأخير"
        }
    };

    return (
        <div className="w-full space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">{t("auth.createAccount")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("auth.registerAsPatient")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* English Name Fields */}
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {isRTL ? (
                            // RTL Layout - English names REVERSED order
                            <>
                                <div>
                                    <Label htmlFor="english_username_d" className="text-xs !text-left !w-full !block" dir="ltr" style={{ textAlign: 'left' }}>
                                        Last Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_d"
                                            name="english_username_d"
                                            value={formData.english_username_d}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Last"
                                            dir="ltr"
                                            style={{ textAlign: 'left' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="english_username_c" className="text-xs !text-left w-full block" dir="ltr" style={{ textAlign: 'left' }}>
                                        Third Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_c"
                                            name="english_username_c"
                                            value={formData.english_username_c}
                                            onChange={handleInputChange}
                                            placeholder="Third"
                                            dir="ltr"
                                            style={{ textAlign: 'left' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="english_username_b" className="text-xs !text-left w-full block" dir="ltr" style={{ textAlign: 'left' }}>
                                        Second Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_b"
                                            name="english_username_b"
                                            value={formData.english_username_b}
                                            onChange={handleInputChange}
                                            placeholder="Second"
                                            dir="ltr"
                                            style={{ textAlign: 'left' }}
                                        />
                                    </div>
                                </div>
                                <div>

                                    <Label htmlFor="english_username_a" className="text-xs !text-left w-full block" dir="ltr" style={{ textAlign: 'left' }}>
                                        First Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_a"
                                            name="english_username_a"
                                            value={formData.english_username_a}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="First"
                                            dir="ltr"
                                            style={{ textAlign: 'left' }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            // LTR Layout - English names normal order
                            <>
                                <div>
                                    <Label htmlFor="english_username_a" className="text-xs">
                                        First Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_a"
                                            name="english_username_a"
                                            value={formData.english_username_a}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="First"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="english_username_b" className="text-xs">
                                        Second Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_b"
                                            name="english_username_b"
                                            value={formData.english_username_b}
                                            onChange={handleInputChange}
                                            placeholder="Second"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="english_username_c" className="text-xs">
                                        Third Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_c"
                                            name="english_username_c"
                                            value={formData.english_username_c}
                                            onChange={handleInputChange}
                                            placeholder="Third"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="english_username_d" className="text-xs ">
                                        Last Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="english_username_d"
                                            name="english_username_d"
                                            value={formData.english_username_d}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Last"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Arabic Name Fields */}
                <div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {isRTL ? (
                            // RTL Layout (Arabic first)
                            <>
                                <div>
                                    <Label htmlFor="arabic_username_a" className="text-xs">
                                        {t("auth.firstNameAr")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_a"
                                            name="arabic_username_a"
                                            value={formData.arabic_username_a}
                                            onChange={handleInputChange}
                                            required
                                            dir="rtl"
                                            placeholder={placeholders.arabic.first}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_b" className="text-xs">
                                        {t("auth.secondNameAr")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_b"
                                            name="arabic_username_b"
                                            value={formData.arabic_username_b}
                                            onChange={handleInputChange}
                                            dir="rtl"
                                            placeholder={placeholders.arabic.second}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_c" className="text-xs">
                                        {t("auth.thirdNameAr")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_c"
                                            name="arabic_username_c"
                                            value={formData.arabic_username_c}
                                            onChange={handleInputChange}
                                            dir="rtl"
                                            placeholder={placeholders.arabic.third}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_d" className="text-xs">
                                        {t("auth.lastNameAr")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_d"
                                            name="arabic_username_d"
                                            value={formData.arabic_username_d}
                                            onChange={handleInputChange}
                                            required
                                            dir="rtl"
                                            placeholder={placeholders.arabic.last}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            // LTR Layout (Original)
                            <>
                                <div>
                                    <Label htmlFor="arabic_username_d" className="text-xs text-right w-full block">
                                        الاسم الرابع
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_d"
                                            name="arabic_username_d"
                                            value={formData.arabic_username_d}
                                            onChange={handleInputChange}
                                            required
                                            dir="rtl"
                                            placeholder={placeholders.arabic.last}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_c" className="text-xs text-right w-full block">
                                        الاسم الثالث
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_c"
                                            name="arabic_username_c"
                                            value={formData.arabic_username_c}
                                            onChange={handleInputChange}
                                            dir="rtl"
                                            placeholder={placeholders.arabic.third}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_b" className="text-xs text-right w-full block">
                                        الاسم الثاني
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_b"
                                            name="arabic_username_b"
                                            value={formData.arabic_username_b}
                                            onChange={handleInputChange}
                                            dir="rtl"
                                            placeholder={placeholders.arabic.second}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="arabic_username_a" className="text-xs text-right w-full block">
                                        الاسم الأول
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="arabic_username_a"
                                            name="arabic_username_a"
                                            value={formData.arabic_username_a}
                                            onChange={handleInputChange}
                                            required
                                            dir="rtl"
                                            placeholder={placeholders.arabic.first}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t("common.email")}
                    </Label>
                    <div className="relative">
                        <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            required
                            placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "name@example.com"}
                            dir={isRTL ? "rtl" : "ltr"}  // CHANGED: Now RTL when in Arabic
                        />
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            required
                            placeholder={isRTL ? "٩٧٠٠٠٠٠٠٠٠٠+" : "+97000000000"} dir={isRTL ? "rtl" : "ltr"}
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
                            type="date"  // CHANGED: Use text input for Arabic
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                            required
                            dir={isRTL ? "rtl" : "ltr"}
                            placeholder={isRTL ? "سنة/شهر/يوم" : ""}  // CHANGED: Arabic date format
                            pattern={isRTL ? "\\d{4}/\\d{2}/\\d{2}" : undefined}  // CHANGED: Pattern for validation
                            style={isRTL ? { textAlign: 'right' } : {}}  // ADD THIS: Force right alignment
                        />
                    </div>

                </div>

                <div className="space-y-2">
                    <Label>{t("auth.gender")}</Label>
                    <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                        className={`flex gap-6 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">{t("auth.male")}</Label>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">{t("auth.female")}</Label>
                        </div>
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            className={isRTL ? 'pr-10' : 'pl-10'}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("common.loading") : t("auth.createAccount")}
                </Button>
            </form>

            <div className="text-center text-sm">
                {t("auth.alreadyHaveAccount")}{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary font-medium hover:underline"
                >
                    {t("common.login")}
                </button>
            </div>
        </div>
    );
};

export default RegisterForm;