// components/auth/ForgotPasswordForm.tsx
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

    setIsLoading(true);

    try {
      // Send password reset email using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: t("auth.resetLinkSent"),
        description: t("auth.resetEmailSentDesc"),
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("auth.failedToSendResetLink"),
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
            {t("auth.checkEmailTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.checkEmailDesc")} <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("auth.didntReceiveEmail")}
          </p>
          <Button variant="outline" onClick={() => setIsSubmitted(false)}>
            {t("auth.tryAgain")}
          </Button>
          <div className="pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary font-medium hover:underline text-sm"
            >
              {t("auth.backToLogin")}
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
          {t("auth.resetPasswordTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.resetPasswordDesc")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email")}</Label>
          <div className="relative">
            <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'
              }`} />
            <Input
              id="email"
              type="email"
              placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-medium hover:underline"
        >
          {isRTL ? "العودة لتسجيل الدخول" : "Back To Login"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;