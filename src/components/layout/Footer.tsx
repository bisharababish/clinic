// components/layout/Footer.tsx
import * as React from "react";
import { useContext } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);

  return (
    <footer className="w-full bg-background border-t" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Clinic Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{t("common.clinicName")}</h3>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "نقدم خدمات الرعاية الصحية عالية الجودة منذ عام 2025"
                : "Providing quality healthcare services since 2025"
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-primary hover:underline">
                {t("navbar.aboutUs")}
              </a>
              <a href="#" className="text-sm text-primary hover:underline">
                {t("footer.termsOfUse")}
              </a>
              <a href="#" className="text-sm text-primary hover:underline">
                {t("footer.privacyPolicy")}
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t("footer.contactUs")}</h3>
            <div className="space-y-2">
              <div className={`flex items-center text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>+970 2 274 4444</span>
              </div>
              <div className={`flex items-center text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>info@bethlehemmedcenter.com</span>
              </div>
              <div className={`flex items-start text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className={`h-4 w-4 ${isRTL ? 'ml-2 mt-0.5' : 'mr-2 mt-0.5'}`} />
                <span className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL
                    ? "شارع وادي مسلم - مبنى نجيب ناصر"
                    : "Wadi Musalam St. - Najib Nasser Building"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full flex justify-center">
            <p className="text-sm text-muted-foreground">
              © 2025 {t("common.clinicName")}. {t("footer.rights")}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;