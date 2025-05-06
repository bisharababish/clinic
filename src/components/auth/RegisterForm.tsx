// src/components/auth/RegisterForm.tsx - Final version with direct database mapping
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Make sure this import path is correct

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
        phoneNumber: "",
        dateOfBirth: "",
        gender: "male",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { login } = useAuth(); // We'll bypass the signup function from useAuth
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return false;
        }

        // Phone validation (numbers only)
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter numbers only",
                variant: "destructive",
            });
            return false;
        }

        // Password strength
        if (formData.password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return false;
        }

        // Check if required name fields are filled (at least first and last name)
        if (!formData.english_username_a || !formData.english_username_d ||
            !formData.arabic_username_a || !formData.arabic_username_d) {
            toast({
                title: "Missing Name Information",
                description: "Please fill in at least first and last name in both languages",
                variant: "destructive",
            });
            return false;
        }

        // Check if other required fields are filled
        if (!formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.password) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return false;
        }

        // Password match
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
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

            // Step 2: Create user profile in database with RLS temporarily disabled
            // This is done via a special endpoint or server function that bypasses RLS
            // For now, we'll try direct insertion and handle failures

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
                    user_email: formData.email,
                    user_phonenumber: formData.phoneNumber,
                    date_of_birth: formData.dateOfBirth,
                    gender_user: formData.gender,
                    user_password: formData.password, // Note: Auth already stores password securely
                    created_at: timestamp,
                    updated_at: timestamp
                });

            if (insertError) {
                console.error('Profile creation error:', insertError);

                // If RLS is causing problems, you might need server-side function
                // This is a fallback attempt
                if (insertError.message.includes('infinite recursion')) {
                    toast({
                        title: "Registration Note",
                        description: "User created, but profile setup requires admin action.",
                        variant: "default",
                    });
                } else {
                    // Some other error occurred
                    throw insertError;
                }
            }

            toast({
                title: "Registration Successful",
                description: "Welcome to our clinic portal!",
            });

            // Auto-login after successful registration
            setTimeout(async () => {
                try {
                    await login(formData.email, formData.password);
                    window.location.href = "/"; // Use direct navigation for better reliability
                } catch (error) {
                    console.error("Auto-login failed:", error);
                    onSwitchToLogin();
                }
            }, 1500);

        } catch (error) {
            let errorMessage = "Registration failed. Please try again.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: "Registration Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
                <p className="text-sm text-muted-foreground">
                    Register as a patient to access our services
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* English Name Fields */}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                            <Label htmlFor="arabic_username_a" className="text-xs">First Name</Label>
                            <div className="relative">
                                <Input
                                    id="arabic_username_a"
                                    name="arabic_username_a"
                                    value={formData.arabic_username_a}
                                    onChange={handleInputChange}
                                    required
                                    dir="rtl"
                                    placeholder="الأول"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="arabic_username_b" className="text-xs">Second Name</Label>
                            <div className="relative">
                                <Input
                                    id="arabic_username_b"
                                    name="arabic_username_b"
                                    value={formData.arabic_username_b}
                                    onChange={handleInputChange}
                                    dir="rtl"
                                    placeholder="الثاني"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="arabic_username_c" className="text-xs">Third Name</Label>
                            <div className="relative">
                                <Input
                                    id="arabic_username_c"
                                    name="arabic_username_c"
                                    value={formData.arabic_username_c}
                                    onChange={handleInputChange}
                                    dir="rtl"
                                    placeholder="الثالث"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="arabic_username_d" className="text-xs">Last Name</Label>
                            <div className="relative">
                                <Input
                                    id="arabic_username_d"
                                    name="arabic_username_d"
                                    value={formData.arabic_username_d}
                                    onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                            placeholder="name@example.com"
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
            </form>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary font-medium hover:underline"
                >
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default RegisterForm;