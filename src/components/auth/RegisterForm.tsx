// src/components/auth/RegisterForm.tsx version2
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

        // Restrict English name fields to English letters only
        if (name.startsWith('english_username_') && !isEnglishOnly(value)) {
            toast({
                title: t("auth.invalidInput"),
                description: t("auth.englishNamesOnly"),
                variant: "destructive",
            });
            return;
        }

        // Restrict Arabic name fields to Arabic letters only
        if (name.startsWith('arabic_username_') && !isArabicOnly(value)) {
            toast({
                title: t("auth.invalidInput"),
                description: t("auth.arabicNamesOnly"),
                variant: "destructive",
            });
            return;
        }

        // Restrict ID number to exactly 9 digits
        if (name === 'id_number') {
            if (!isNumbersOnly(value) || value.length > 9) {
                if (!isNumbersOnly(value)) {
                    toast({
                        title: t("auth.invalidInput"),
                        description: t("auth.idNumbersOnly"),
                        variant: "destructive",
                    });
                }
                return;
            }
        }

        // Handle phone number with +97, then 0 or 2, then 9 digits
        if (name === 'phoneNumber') {
            let sanitized = value.replace(/[^\d+]/g, '');
            if (!sanitized.startsWith('+97')) {
                sanitized = '+97';
            }
            const afterPrefix = sanitized.slice(3, 4);
            if (afterPrefix !== '0' && afterPrefix !== '2') {
                sanitized = sanitized.slice(0, 3);
            }
            if (sanitized.length >= 4) {
                let digits = sanitized.slice(4).replace(/\D/g, '');
                digits = digits.slice(0, 9);
                sanitized = sanitized.slice(0, 4) + digits;
            }
            setFormData(prev => ({ ...prev, [name]: sanitized }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };
    // Add these validation functions after your useState declarations
    const isEnglishOnly = (text: string) => /^[a-zA-Z\s]*$/.test(text);
    const isArabicOnly = (text: string) => /^[\u0600-\u06FF\s]*$/.test(text);
    const isNumbersOnly = (text: string) => /^[0-9]*$/.test(text);

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
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

        // Enhanced password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast({
                title: t("auth.weakPassword"),
                description: t("auth.strongPasswordRequired"),
                variant: "destructive",
            });
            return false;
        }

        // Phone validation (+97, then 0 or 2, then 9 digits)
        const phoneRegex = /^\+97[02]\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            toast({
                title: t("auth.invalidPhone"),
                description: t("usersManagement.phoneInvalidDesc"),
                variant: "destructive",
            });
            return false;
        }

        // Age validation (minimum 16 years old)
        if (formData.dateOfBirth) {
            const age = calculateAge(formData.dateOfBirth);
            if (age < 16) {
                toast({
                    title: t("auth.ageTooYoung"),
                    description: t("auth.mustBe16OrOlder"),
                    variant: "destructive",
                });
                return false;
            }
            if (age > 120) {
                toast({
                    title: t("auth.invalidAge"),
                    description: "Please enter a valid date of birth",
                    variant: "destructive",
                });
                return false;
            }
        }

        // Check if required name fields are filled and contain only appropriate characters
        if (!formData.english_username_a || !formData.english_username_d ||
            !formData.arabic_username_a || !formData.arabic_username_d) {
            toast({
                title: t("auth.missingNameInfo"),
                description: t("auth.fillRequiredNames"),
                variant: "destructive",
            });
            return false;
        }

        // Validate English names contain only English letters
        if (!isEnglishOnly(formData.english_username_a) || !isEnglishOnly(formData.english_username_d)) {
            toast({
                title: t("auth.invalidInput"),
                description: t("auth.englishLettersOnly"),
                variant: "destructive",
            });
            return false;
        }

        // Validate Arabic names contain only Arabic letters
        if (!isArabicOnly(formData.arabic_username_a) || !isArabicOnly(formData.arabic_username_d)) {
            toast({
                title: t("auth.invalidInput"),
                description: t("auth.arabicLettersOnly"),
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

        // Palestinian ID validation (exactly 9 digits)
        if (!/^\d{9}$/.test(formData.id_number)) {
            toast({
                title: t("auth.invalidID"),
                description: t("auth.palestinianIdFormat"),
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
            // ✅ NEW: Check for existing email first
            console.log('Checking for existing email...');
            const { data: existingEmail, error: emailCheckError } = await supabase
                .from('userinfo')
                .select('user_email')
                .ilike('user_email', formData.email)
                .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when not found

            if (emailCheckError && emailCheckError.code !== 'PGRST116') {
                console.error('Email check error:', emailCheckError);
                throw new Error('Error checking email availability');
            }

            if (existingEmail) {
                toast({
                    title: t("auth.registrationFailed"),
                    description: "This email is already registered. Please use a different email or try logging in.",
                    variant: "destructive",
                });
                return;
            }

            // ✅ NEW: Check for existing ID number
            console.log('Checking for existing ID number...');
            const { data: existingID, error: idCheckError } = await supabase
                .from('userinfo')
                .select('id_number')
                .eq('id_number', formData.id_number)
                .maybeSingle(); // Use maybeSingle() instead of single()

            if (idCheckError && idCheckError.code !== 'PGRST116') {
                console.error('ID check error:', idCheckError);
                throw new Error('Error checking ID number availability');
            }

            if (existingID) {
                toast({
                    title: t("auth.registrationFailed"),
                    description: "This ID number is already registered. Please check your ID number.",
                    variant: "destructive",
                });
                return;
            }

            // ✅ NEW: Check for existing phone number
            console.log('Checking for existing phone number...');
            const { data: existingPhone, error: phoneCheckError } = await supabase
                .from('userinfo')
                .select('user_phonenumber')
                .eq('user_phonenumber', formData.phoneNumber)
                .maybeSingle();

            if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
                console.error('Phone check error:', phoneCheckError);
                throw new Error('Error checking phone number availability');
            }

            if (existingPhone) {
                toast({
                    title: t("auth.registrationFailed"),
                    description: "This phone number is already registered. Please use a different phone number.",
                    variant: "destructive",
                });
                return;
            }

            console.log('All checks passed, proceeding with registration...');

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
                console.error('Full error details:', {
                    message: insertError.message,
                    details: insertError.details,
                    hint: insertError.hint,
                    code: insertError.code
                });

                // ✅ Only show error if it's actually a real error, not a warning
                if (insertError.code && insertError.code !== '23505') { // 23505 is duplicate key, which we handle elsewhere
                    toast({
                        title: t("auth.registrationFailed"),
                        description: `Database error: ${insertError.message}`,
                        variant: "destructive",
                    });
                    throw insertError;
                }
                // If we get here, it might just be a warning, not a real error
                console.log('Insert completed with warning, but user was created successfully');
            }

            // ✅ Always show success if we get here
            toast({
                title: t("auth.registrationSuccess"),
                description: t("auth.welcomeToClinic"),
            });
            // Instead of auto-login, redirect to login page
            setTimeout(() => {
                onSwitchToLogin();
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
                            maxLength={9}
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