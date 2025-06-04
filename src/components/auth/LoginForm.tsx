// src/components/auth/LoginForm.tsx
import * as React from "react";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";
import { getDefaultRouteForRole } from "../../lib/rolePermissions";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess?: (userRole: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

  // Helper function to get role-based redirect
  const getRoleBasedRedirect = (role: string): string => {
    return getDefaultRouteForRole(role);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      toast({
        title: t("auth.missingCredentials") || "Missing Credentials",
        description: t("auth.enterCredentials") || "Please enter your email and password",
        variant: "destructive",
      });
      return false;
    }

    if (!emailRegex.test(email)) {
      toast({
        title: t("auth.invalidEmail") || "Invalid Email",
        description: t("auth.invalidEmailDesc") || "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const bypassLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting bypass login for:", email);

      // Direct authentication without hooks
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (data && data.session) {
        console.log("Session created successfully");

        // Store session in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: data.session,
          expiresAt: Date.now() + 3600000 // 1 hour
        }));

        // Get user info from database - case insensitive query
        const { data: userData, error: userError } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', email)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error("Failed to fetch user profile");
        }

        if (userData) {
          console.log("User data retrieved:", userData);

          // Normalize role to lowercase for consistency
          const role = userData.user_roles?.toLowerCase() || '';

          // Store user info in localStorage for immediate access
          const userProfile = {
            id: userData.userid,
            email: userData.user_email,
            name: userData.english_username_a || userData.user_email,
            role: role
          };

          localStorage.setItem('clinic_user_profile', JSON.stringify(userProfile));

          // Special handling for admin
          if (role === 'admin' || userData.user_roles === 'Admin') {
            console.log("Setting admin_login_success flag");
            sessionStorage.setItem('admin_login_success', 'true');
          }

          return {
            success: true,
            role: role,
            name: userData.english_username_a || userData.user_email
          };
        }

        return { success: true, role: null, name: null };
      }

      return { success: false, role: null, name: null };
    } catch (error) {
      console.error("Bypass login error:", error);
      return { success: false, role: null, name: null, error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Starting login process for:", email);

      // Set a flag to indicate we're mid-login to prevent redirects
      sessionStorage.setItem('login_in_progress', 'true');

      // Use bypass login method
      const bypassResult = await bypassLogin(email, password);

      if (bypassResult.success && bypassResult.role) {
        const userRole = bypassResult.role;
        const userName = bypassResult.name;

        console.log(`Login successful for role: ${userRole}`);

        // Get role-based redirect path
        const redirectPath = getRoleBasedRedirect(userRole);
        console.log(`Redirecting ${userRole} to: ${redirectPath}`);

        // Show role-specific success messages
        let toastMessage = `${t("auth.welcomeBack") || "Welcome back"}`;

        if (userName) {
          toastMessage += `, ${userName}!`;
        }

        if (userRole === 'admin') {
          toast({
            title: t("auth.adminLogin") || "Admin Login",
            description: t("auth.secureAdminAccess") || "Secure admin access granted"
          });
        } else if (userRole === 'lab') {
          toast({
            title: t("common.login") || "Login Successful",
            description: toastMessage + " Redirecting to Labs..."
          });
        } else if (userRole === 'xray' || userRole === 'x ray') {
          toast({
            title: t("common.login") || "Login Successful",
            description: toastMessage + " Redirecting to X-Ray..."
          });
        } else {
          toast({
            title: t("common.login") || "Login Successful",
            description: toastMessage
          });
        }

        // Use role-based redirect with a small delay
        setTimeout(() => {
          sessionStorage.removeItem('login_in_progress');

          // Call callback if provided
          if (onLoginSuccess) {
            onLoginSuccess(userRole);
          }

          // Navigate to role-specific route
          console.log(`Navigating to: ${redirectPath}`);
          navigate(redirectPath, { replace: true });
        }, 1000); // Increased delay to show toast

        return;
      }

      // If bypass didn't work, try the hook method (fallback)
      console.log("Bypass login failed, trying hook method...");

      const userData = await login(email, password);

      if (userData && userData.role) {
        const redirectPath = getRoleBasedRedirect(userData.role);
        console.log(`Hook login successful for ${userData.role}, redirecting to: ${redirectPath}`);

        // Show success message
        toast({
          title: t("common.login") || "Login Successful",
          description: `${t("auth.welcomeBack") || "Welcome back"}, ${userData.name}!`
        });

        setTimeout(() => {
          sessionStorage.removeItem('login_in_progress');

          if (onLoginSuccess) {
            onLoginSuccess(userData.role);
          }

          navigate(redirectPath, { replace: true });
        }, 1000);

        return;
      }

      // If we get here, login failed
      throw new Error("Login failed - no user data returned");

    } catch (error: unknown) {
      console.error("Login error:", error);
      sessionStorage.removeItem('login_in_progress');

      let errorMessage = t("auth.missingCredentials") || "Login failed";

      if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: string }).message === "string") {
        const errMsg = (error as { message: string }).message;
        if (errMsg.includes("Invalid login credentials")) {
          errorMessage = t("auth.invalidCredentials") || "Invalid email or password";
        } else {
          errorMessage = errMsg;
        }
      }

      toast({
        title: t("common.login") || "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("auth.welcomeBack") || "Welcome Back"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.enterCredentials2") || "Enter your credentials to continue"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email") || "Email"}</Label>
          <div className="relative">
            <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
              placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "name@example.com"}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("common.password") || "Password"}</Label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-primary hover:underline"
              disabled={isLoading}
            >
              {t("common.forgotPassword") || "Forgot Password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-muted-foreground hover:text-foreground`}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (t("common.loading") || "Loading...") : (t("common.login") || "Login")}
        </Button>
      </form>

      <div className="text-center text-sm">
        {t("auth.dontHaveAccount") || "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary font-medium hover:underline"
          disabled={isLoading}
        >
          {t("common.signup") || "Sign up"}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;