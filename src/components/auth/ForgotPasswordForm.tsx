// components/auth/ForgotPasswordForm.tsx - FIXED VERSION
import * as React from "react";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";
import { supabase } from "../../lib/supabase";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t("common.error"),
        description: t("auth.enterEmailAddress"),
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: t("common.error"),
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending password reset email to:", email);

      // Get the current origin to ensure correct redirect URL
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth/reset-password`;
      
      console.log("Using redirect URL:", redirectUrl);

      // Send password reset email using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }

      console.log("Password reset email sent successfully");

      setIsSubmitted(true);
      toast({
        title: t("auth.resetLinkSent") || "Reset Link Sent",
        description: t("auth.resetEmailSentDesc") || "Please check your email for the reset link",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = t("auth.failedToSendResetLink") || "Failed to send reset link";
      
      if (error instanceof Error) {
        // Handle specific Supabase errors
        if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please try again later";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: t("common.error") || "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("auth.checkEmailTitle") || "Check Your Email"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.checkEmailDesc") || "We've sent a password reset link to"} <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="space-y-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Please check your spam/junk folder if you don't see the email in your inbox.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t("auth.didntReceiveEmail") || "Didn't receive the email?"}
          </p>
          
          <Button variant="outline" onClick={() => setIsSubmitted(false)} disabled={isLoading}>
            {t("auth.tryAgain") || "Try Again"}
          </Button>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary font-medium hover:underline text-sm"
            >
              {t("auth.backToLogin") || "Back to Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("auth.resetPasswordTitle") || "Reset Password"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.resetPasswordDesc") || "Enter your email to receive a reset link"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email") || "Email"}</Label>
          <div className="relative">
            <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'
              }`} />
            <Input
              id="email"
              type="email"
              placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className={isRTL ? 'pr-10' : 'pl-10'}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (t("auth.sendingResetLink") || "Sending...") : (t("auth.sendResetLink") || "Send Reset Link")}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-medium hover:underline"
          disabled={isLoading}
        >
          {isRTL ? "العودة لتسجيل الدخول" : "Back To Login"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;