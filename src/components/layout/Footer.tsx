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
    <footer className="w-full bg-gradient-to-b from-background to-muted/10 border-t shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Clinic Info - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-100/50 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/50 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-blue-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                {t("common.clinicName")}
              </h3>
              <p className="text-sm text-blue-600/80 leading-relaxed font-medium">
                {isRTL
                  ? "نقدم خدمات الرعاية الصحية عالية الجودة والمهنية منذ عام 2025. نحن ملتزمون بتقديم أفضل رعاية طبية لمرضانا الكرام."
                  : "Providing high-quality and professional healthcare services since 2025. We are committed to delivering the best medical care to our valued patients."
                }
              </p>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-green-100/50 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-100/50 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-emerald-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                {t("footer.quickLinks")}
              </h3>
              <div className="flex flex-col space-y-4">
                <a
                  href="#"
                  className="group/link relative text-sm text-emerald-600/80 hover:text-emerald-700 transition-all duration-300 font-medium px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-emerald-200/30 hover:border-emerald-300/50 transform hover:translate-x-2 hover:shadow-md"
                >
                  <span className="relative z-10">
                    {t("navbar.aboutUs")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-transparent rounded-xl scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></div>
                </a>
                <a
                  href="#"
                  className="group/link relative text-sm text-emerald-600/80 hover:text-emerald-700 transition-all duration-300 font-medium px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-emerald-200/30 hover:border-emerald-300/50 transform hover:translate-x-2 hover:shadow-md"
                >
                  <span className="relative z-10">
                    {t("footer.termsOfUse")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-transparent rounded-xl scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></div>
                </a>
                <a
                  href="#"
                  className="group/link relative text-sm text-emerald-600/80 hover:text-emerald-700 transition-all duration-300 font-medium px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-emerald-200/30 hover:border-emerald-300/50 transform hover:translate-x-2 hover:shadow-md"
                >
                  <span className="relative z-10">
                    {t("footer.privacyPolicy")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-transparent rounded-xl scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 to-pink-100/50 border border-purple-200/30 hover:border-purple-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-100/50 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-purple-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                {t("footer.contactUs")}
              </h3>
              <div className="space-y-4">

                {/* Phone */}
                <div className={`group/contact relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-purple-200/40 hover:border-purple-300/60 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative">
                    <p className="text-xs text-purple-600/60 font-medium">
                      {isRTL ? 'اتصل بنا' : 'Call Us'}
                    </p>
                    <a href="tel:+97022744444" className="text-sm font-bold text-purple-700 hover:text-purple-800 transition-colors" dir="ltr">
                      +970 2 274 4444
                    </a>
                  </div>
                </div>


                {/* Email */}
                <div className={`group/contact relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-purple-200/40 hover:border-purple-300/60 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300 flex-shrink-0">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs text-purple-600/60 font-medium">
                      {isRTL ? 'راسلنا' : 'Email Us'}
                    </p>
                    <a
                      href="mailto:info@bethlehemmedcenter.com"
                      className="text-xs font-bold text-purple-700 hover:text-purple-800 transition-colors block break-all"
                      dir="ltr"
                    >
                      info@bethlehemmedcenter.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className={`group/contact relative overflow-hidden flex items-start gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-purple-200/40 hover:border-purple-300/60 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300 mt-0.5">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative">
                    <p className="text-xs text-purple-600/60 font-medium">
                      {isRTL ? 'عنواننا' : 'Visit Us'}
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Wadi+Musalam+Street+Najib+Nasser+Building+Bethlehem+Palestine"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-bold text-purple-700 hover:text-purple-800 transition-colors cursor-pointer leading-relaxed ${isRTL ? 'text-right' : 'text-left'} hover:underline`}
                    >
                      {isRTL
                        ? "شارع وادي مسلم - مبنى نجيب ناصر، بيت لحم، فلسطين"
                        : "Wadi Musalam St. - Najib Nasser Building, Bethlehem, Palestine"
                      }
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section - Enhanced */}
        <div className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-muted/50 to-transparent relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-muted/30 border border-muted/40">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-muted-foreground">
                © {currentYear} {t("common.clinicName")}. {t("footer.rights")}.
              </p>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;