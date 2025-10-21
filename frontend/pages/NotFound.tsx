import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`text-center ${isRTL ? 'text-right' : 'text-center'}`}>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className={`text-xl text-gray-600 mb-4 ${isRTL ? 'text-right' : 'text-center'}`}>
          {t('notFound.message') || 'Oops! Page not found'}
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('notFound.returnHome') || 'Return to Home'}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
