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
        description: t("auth.enterEmailAddress") || "Please enter your email address",
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

      // Use the specific redirect URLs that match your Supabase configuration
      const redirectUrl = `https://www.bethlehemmedcenter.com/auth/reset-password`;

      console.log("Using redirect URL:", redirectUrl);


      // Skip database check - Supabase will handle email validation
      console.log("Sending password reset email to:", email);
      // Send password reset email using Supabase (always attempt this)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);

        // Handle specific error cases
        if (error.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a few minutes before trying again.');
        } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message.includes('not authorized')) {
          throw new Error('Email service is not properly configured. Please contact support.');
        } else {
          throw new Error(error.message || 'Failed to send reset email.');
        }
      }

      console.log("Password reset email sent successfully");

      // Always show success message (even if user doesn't exist - for security)
      setIsSubmitted(true);
      toast({
        title: t("forgotpassowrd.resetLinkSent") || "Reset Link Sent",
        description: t("forgotpassowrd.resetEmailSentDesc") || "If an account with this email exists, you will receive a password reset link.",
      });

    } catch (error) {
      console.error("Password reset error:", error);

      let errorMessage = "Failed to send reset link. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
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
            {t("forgotpassowrd.checkEmailDesc") || "If an account exists with"} <span className="font-medium">{email}</span>, {t("forgotpassowrd.willReceiveLink") || "you will receive a password reset link"}.
          </p>
        </div>

        <div className="space-y-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>{t("forgotpassowrd.important") || "Important"}:</strong> {t("forgotpassowrd.checkSpamFolder") || "Please check your spam/junk folder if you don't see the email in your inbox within a few minutes."}
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
            <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              id="email"
              type="email"
              placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className={isRTL ? 'pr-10' : 'pl-10'}
              required
              disabled={isLoading}
              autoComplete="email"
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