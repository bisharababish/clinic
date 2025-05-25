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

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      toast({
        title: t("auth.missingCredentials"),
        description: t("auth.enterCredentials"),
        variant: "destructive",
      });
      return false;
    }

    if (!emailRegex.test(email)) {
      toast({
        title: t("auth.invalidEmail"),
        description: t("auth.invalidEmail"),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const bypassLogin = async (email, password) => {
    try {
      // Direct authentication without hooks
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data && data.session) {
        // Store session in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: data.session,
          expiresAt: Date.now() + 3600000 // 1 hour
        }));

        // Get user info from database - case insensitive query
        const { data: userData } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', email)
          .single();

        if (userData) {
          // Normalize role to lowercase for consistency
          const role = userData.user_roles.toLowerCase();

          // Store user info in localStorage for immediate access
          localStorage.setItem('clinic_user_profile', JSON.stringify({
            id: userData.userid,
            email: userData.user_email,
            name: userData.english_username_a,
            role: role
          }));

          // Special handling for admin
          if (role === 'admin' || userData.user_roles === 'Admin') {
            console.log("Setting admin_login_success flag in bypass login");
            sessionStorage.setItem('admin_login_success', 'true');
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Bypass login error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Set a flag to indicate we're mid-login to prevent redirects
      sessionStorage.setItem('login_in_progress', 'true');

      // Use regular bypass login for all users (including admins)
      const bypassSuccess = await bypassLogin(email, password);

      if (bypassSuccess) {
        // Check if user is admin from the cached profile and redirect accordingly
        const cachedUserProfile = localStorage.getItem('clinic_user_profile');
        if (cachedUserProfile) {
          const userObj = JSON.parse(cachedUserProfile);
          if (userObj.role === 'admin') {
            // Set admin login success flag (still needed for some parts of the app)
            sessionStorage.setItem('admin_login_success', 'true');

            toast({
              title: t("auth.adminLogin"),
              description: t("auth.secureAdminAccess")
            });

            // Redirect admin to admin dashboard
            setTimeout(() => {
              sessionStorage.removeItem('login_in_progress');
              window.location.href = "/admin";
            }, 500);

            return;
          }
        }

        // Default redirect for non-admin users
        toast({
          title: t("common.login"),
          description: t("auth.welcomeBack")
        });

        // Wait for the toast to appear before redirect
        setTimeout(() => {
          // Clear the login progress flag
          sessionStorage.removeItem('login_in_progress');

          // Force a hard redirect to the home page
          window.location.href = "/";
        }, 500);

        return;
      }

      // If bypass didn't work, try the hook method (fallback)
      const userData = await login(email, password);

      // Check if user is admin and redirect accordingly
      if (userData.role === 'admin') {
        // Set admin login success flag
        sessionStorage.setItem('admin_login_success', 'true');

        toast({
          title: t("auth.adminLogin"),
          description: `${t("common.welcome")}, ${userData.name}!`
        });

        // Redirect admin to admin dashboard
        setTimeout(() => {
          sessionStorage.removeItem('login_in_progress');
          window.location.href = "/admin";
        }, 500);

        return;
      }

      // Default redirect for non-admin users
      toast({
        title: t("common.login"),
        description: `${t("auth.welcomeBack")}, ${userData.name}!`
      });

      // Wait for the toast to be seen before redirect
      setTimeout(() => {
        // Clear the login progress flag
        sessionStorage.removeItem('login_in_progress');

        // Force a hard redirect to the home page
        window.location.href = "/";
      }, 500);

    } catch (error) {
      console.error("Login error:", error);
      sessionStorage.removeItem('login_in_progress');

      let errorMessage = t("auth.missingCredentials");
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: t("common.login"),
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
        <h2 className="text-3xl font-bold tracking-tight">{t("auth.welcomeBack")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.enterCredentials2")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email")}</Label>
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("common.password")}</Label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-primary hover:underline"
            >
              {t("common.forgotPassword")}
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
              className={isRTL ? 'pr-10' : 'pl-10'}
              required
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("common.loading") : t("common.login")}
        </Button>
      </form>

      <div className="text-center text-sm">
        {t("auth.dontHaveAccount")}{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary font-medium hover:underline"
        >
          {t("common.signup")}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;