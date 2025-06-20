// pages/Auth.tsx
import * as React from "react";
import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { LanguageContext } from "@/components/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "@/lib/rolePermissions";

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ AUTOMATIC REDIRECT: If user is already logged in, redirect them
  useEffect(() => {
    if (user && user.role) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      console.log(`User already authenticated as ${user.role}, redirecting to: ${defaultRoute}`);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, navigate]);

  const handleSwitchToRegister = () => {
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

  // ✅ LOGIN SUCCESS HANDLER: Pass this to LoginForm to handle redirect
  const handleLoginSuccess = (userRole: string) => {
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`Login successful for ${userRole}, redirecting to: ${defaultRoute}`);

    // Small delay to ensure state is properly updated
    setTimeout(() => {
      navigate(defaultRoute, { replace: true });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Language Switcher - RTL Safe Positioning */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-6 z-50">
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
            className="bg-white/95 backdrop-blur-md border-gray-200/60 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 font-semibold shadow-md w-12 h-8 sm:w-14 sm:h-10 md:w-auto md:h-auto rounded-md flex items-center justify-center text-xs sm:text-sm font-bold px-2 sm:px-3"
          />
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-primary mb-2 ">
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
                  <TabsContent value="login">
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoginForm
                        onSwitchToRegister={handleSwitchToRegister}
                        onSwitchToForgotPassword={handleSwitchToForgotPassword}
                        onLoginSuccess={handleLoginSuccess}
                      />
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="register">
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
                    </motion.div>
                  </TabsContent>
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