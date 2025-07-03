// components/layout/Footer.tsx
import * as React from "react";
import { useContext } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";
import { TermsOfUseModal, PrivacyPolicyModal, useLegalModals } from "../modals/LegalModals";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";


const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { isRTL } = useContext(LanguageContext);
  const {
    termsOpen,
    privacyOpen,
    openTerms,
    closeTerms,
    openPrivacy,
    closePrivacy
  } = useLegalModals();
  return (
    <footer className="w-full bg-gradient-to-b from-background to-muted/10 border-t shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Clinic Info - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-primary/85 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/85 rounded-full"></div>
                {t("common.clinicName")}
              </h3>
              <p className="text-sm text-primary/85 leading-relaxed font-medium">
                {isRTL
                  ? "نقدم خدمات الرعاية الصحية عالية الجودة والمهنية منذ عام 2025. نحن ملتزمون بتقديم أفضل رعاية طبية لمرضانا الكرام."
                  : "Providing high-quality and professional healthcare services since 2025. We are committed to delivering the best medical care to our valued patients."
                }
              </p>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-primary/85 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/85 rounded-full"></div>
                {t("footer.quickLinks")}
              </h3>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={openTerms}
                  className="group/link relative text-sm text-primary/85 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-primary/25 hover:border-primary/35 transform hover:translate-x-2 hover:shadow-md text-left"
                >
                  <span className="relative z-10">
                    {t("footer.termsOfUse")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent rounded-xl scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
                <button
                  onClick={openPrivacy}
                  className="group/link relative text-sm text-primary/85 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-primary/25 hover:border-primary/35 transform hover:translate-x-2 hover:shadow-md text-left"
                >
                  <span className="relative z-10">
                    {t("footer.privacyPolicy")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent rounded-xl scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info - Enhanced */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-primary/85 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/85 rounded-full"></div>
                {t("footer.contactUs")}
              </h3>
              <div className="space-y-4">

                {/* Phone */}
                <div className={`group/contact relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-primary/25 hover:border-primary/35 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-primary to-primary/85 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs text-primary/75 font-medium text-left">
                      {isRTL ? 'اتصل بنا' : 'Call Us'}
                    </p>
                    <a href="tel:+97022744444" className="text-sm font-bold text-primary/85 hover:text-primary transition-colors" dir="ltr">
                      +970 2 274 4444
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className={`group/contact relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-primary/25 hover:border-primary/35 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-primary to-primary/85 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300 flex-shrink-0">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs text-primary/75 font-medium">
                      {isRTL ? 'راسلنا' : 'Email Us'}
                    </p>
                    <a
                      href="mailto:info@bethlehemmedcenter.com"
                      className="text-xs font-bold text-primary/85 hover:text-primary transition-colors block break-all"
                      dir="ltr"
                    >
                      info@bethlehemmedcenter.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className={`group/contact relative overflow-hidden flex items-start gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-primary/25 hover:border-primary/35 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent scale-x-0 group-hover/contact:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <div className="relative p-2 bg-gradient-to-br from-primary to-primary/85 rounded-lg shadow-sm group-hover/contact:shadow-md group-hover/contact:scale-110 transition-all duration-300 mt-0.5">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="relative">
                    <p className="text-xs text-primary/75 font-medium">
                      {isRTL ? 'عنواننا' : 'Visit Us'}
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Wadi+Musalam+Street+Najib+Nasser+Building+Bethlehem+Palestine"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-bold text-primary/85 hover:text-primary transition-colors cursor-pointer leading-relaxed ${isRTL ? 'text-right' : 'text-left'} hover:underline`}
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

        {/* Social Media Section */}
        <div className="mt-8 flex flex-col items-center">
          <h4 className="font-semibold text-primary/85 mb-3 text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-gradient-to-b from-primary to-primary/85 rounded-full"></span>
            {isRTL ? 'تابعنا على وسائل التواصل' : 'Follow us on Social Media'}
          </h4>
          <div className="flex gap-6">
            <a
              href="https://www.facebook.com/yourclinicpage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full bg-white/60 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors shadow-sm hover:shadow-primary/10"
            >
              <Facebook className="w-6 h-6 text-primary/80 hover:text-primary" />
            </a>
            <a
              href="https://www.instagram.com/yourclinicpage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full bg-white/60 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors shadow-sm hover:shadow-primary/10"
            >
              <Instagram className="w-6 h-6 text-primary/80 hover:text-primary" />
            </a>
            <a
              href="https://twitter.com/yourclinicpage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-2 rounded-full bg-white/60 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors shadow-sm hover:shadow-primary/10"
            >
              <Twitter className="w-6 h-6 text-primary/80 hover:text-primary" />
            </a>
            <a
              href="https://wa.me/97222744444"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2 rounded-full bg-white/60 hover:bg-green-100 border border-primary/20 hover:border-green-400 transition-colors shadow-sm hover:shadow-green-200"
            >
              <MessageCircle className="w-6 h-6 text-primary/80 hover:text-green-500" />
            </a>
          </div>
        </div>

        {/* Copyright Section - Enhanced */}
        <div className="mt-8 flex flex-col items-center">
          {/* Developed by Codefusion.me Section */}
          <div className="developed-by flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 w-full">
            <a
              href="https://codefusion.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary/85 hover:text-primary font-medium text-base px-3 py-2 rounded-lg transition-colors hover:bg-primary/10"
              aria-label="Developed by Codefusion.me"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeWidth="2" /></svg>
              <span className="font-semibold">Developed by Codefusion.me</span>
            </a>
            <a
              href="https://instagram.com/codefusionn.ps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary/85 hover:text-pink-600 font-medium text-base px-3 py-2 rounded-lg transition-colors hover:bg-pink-50"
              aria-label="Instagram Codefusionn.ps"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" /><circle cx="12" cy="12" r="4" strokeWidth="2" /><circle cx="18" cy="6" r="1" /></svg>
              <span>@codefusionn.ps</span>
            </a>
            <a
              href="tel:+972599203837"
              className="flex items-center gap-2 text-primary/85 hover:text-green-600 font-medium text-base px-3 py-2 rounded-lg transition-colors hover:bg-green-50"
              aria-label="Call Codefusion.me"
            >
              <Phone className="h-5 w-5 text-green-500" />
              <span dir="ltr">+972599203837</span>
            </a>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-muted/30 border border-muted/40">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-muted-foreground">
              © {currentYear} {t("common.clinicName")}. {t("footer.rights")}.
            </p>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Legal Modals */}
        <TermsOfUseModal isOpen={termsOpen} onClose={closeTerms} />
        <PrivacyPolicyModal isOpen={privacyOpen} onClose={closePrivacy} />

      </div>
    </footer >
  );
};

export default Footer;

