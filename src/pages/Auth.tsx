// pages/Auth.tsx
import * as React from "react";
import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { LanguageContext } from "@/components/contexts/LanguageContext";

const LoginRedirectHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Check if we have a redirect request
    const handleRedirectAttempt = () => {
      const loginSuccess = localStorage.getItem('loginSuccess');
      if (loginSuccess === 'true') {
        console.log("Login success detected in Auth page, redirecting to home");
        localStorage.removeItem('loginSuccess');
        navigate('/', { replace: true });
        // Fallback in case React Router navigation fails
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    };

    handleRedirectAttempt();

    // Set up a short interval to check for the login flag
    const intervalId = setInterval(handleRedirectAttempt, 500);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return null;
};

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Switches the current active tab to "register" and hides the forgot password section.
 */

/*******  fa658a7e-c6d4-4225-93a8-9ae87943246b  *******/  const handleSwitchToRegister = () => {
    setActiveTab("register");
    setShowForgotPassword(false);
  };

  const handleSwitchToLogin = () => {
    setActiveTab("login");
    setShowForgotPassword(false);
  };

  const handleSwitchToForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <LoginRedirectHandler />

      {/* IMPROVED: Fixed Language Switcher - Top Right Corner */}
      <div className="absolute top-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, type: "spring", stiffness: 120 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LanguageSwitcher
            showText={true}
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-md border-gray-200/60 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 font-semibold shadow-md"
          />
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          {/* REMOVED: Old language switcher div that was here */}

          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-primary mb-2">
                {t('common.clinicName')}
              </h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-gray-200"
          >
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPasswordForm onSwitchToLogin={handleSwitchToLogin} />
                </motion.div>
              ) : (
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full mb-6">
                    <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
                    <TabsTrigger value="register">{t('common.signup')}</TabsTrigger>
                  </TabsList>
                  <AnimatePresence mode="wait">
                    <TabsContent value="login">
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LoginForm
                          onSwitchToRegister={handleSwitchToRegister}
                          onSwitchToForgotPassword={handleSwitchToForgotPassword}
                        />
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="register">
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;