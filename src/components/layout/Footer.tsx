import * as React from "react";
import { useContext } from "react";
import { Mail, MapPin, Phone, Clock, Users, Building, Heart, Award, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";
import { TermsOfUseModal, PrivacyPolicyModal, useLegalModals } from "../modals/LegalModals";
import { Facebook, Instagram, MessageCircle, createLucideIcon } from "lucide-react";


const XIcon = createLucideIcon("X", [
  [
    "path",
    {
      d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
      stroke: "none",
      fill: "currentColor",
    },
  ],
]);

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

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">

          {/* Company Story & Services */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/85 rounded-xl shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-primary/85">
                  {t("common.clinicName")}
                </h3>
              </div>

              <div className="text-sm text-primary/85 leading-relaxed font-medium mb-4">
                <div className="text-sm text-primary/85 leading-relaxed font-medium mb-4">
                  {isRTL ? (
                    <ul className="space-y-2" dir="rtl">
                      <li className="flex items-start">
                        <span className="ml-2 mt-1">•</span>
                        <span>نقدم خدمات الرعاية الصحية عالية الجودة والمهنية منذ عام 2025</span>
                      </li>
                      <li className="flex items-start">
                        <span className="ml-2 mt-1">•</span>
                        <span>نحن ملتزمون بتقديم أفضل رعاية طبية لمرضانا الكرام</span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>Providing high-quality and professional healthcare services since 2025</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>We are committed to delivering the best medical care to our valued patients</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <Award className="h-3 w-3" />
                  <span className="font-medium">
                    {isRTL ? "خبرة طبية متميزة." : "Medical Excellence."}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium">
                    {isRTL ? "معايير سلامة عالية." : "High Safety Standards."}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">
                    {isRTL ? "فريق طبي متخصص." : "Expert Medical Team."}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <Building className="h-3 w-3" />
                  <span className="font-medium">
                    {isRTL ? "مرافق حديثة." : "Modern Facilities."}
                  </span>
                </div>
                {/* Hours */}
                <div className="p-3 bg-white/50 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary/80" />
                    <h4 className="font-bold text-sm text-primary/90">
                      {isRTL ? 'ساعات العمل' : 'Working Hours'}
                    </h4>
                  </div>
                  <p className="text-xs text-primary/85 font-medium">
                    {isRTL ? 'جميع أيام الأسبوع' : 'All Days'}
                  </p>
                  <p className="text-sm font-bold text-primary/90" dir={isRTL ? 'rtl' : 'ltr'}>
                    {isRTL ? '٨:٠٠ ص - ٨:٠٠ م' : '8:00 AM - 8:00 PM'}
                  </p>
                  <p className="text-xs text-primary/70">
                    {isRTL ? 'مفتوح كل يوم' : 'Open every day'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information & Hours */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/85 rounded-xl shadow-lg">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-primary/85">
                  {t("footer.contactUs")}
                </h3>
              </div>

              <div className="space-y-3 mb-4">
                {/* Phone */}
                <div className={`flex items-center gap-2 p-2 rounded-lg bg-white/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Phone className="h-4 w-4 text-primary/80" />
                  <div className="flex-1">
                    <a href="tel:+97022744444" className="text-sm font-bold text-primary/85 hover:text-primary transition-colors" dir="ltr">
                      +970 2 274 4444
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className={`flex items-center gap-2 p-2 rounded-lg bg-white/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="h-4 w-4 text-primary/80 flex-shrink-0" />
                  <div className="flex-1 min-w-0">

                    <a
                      href="mailto:info@bethlehemmedcenter.com"
                      className={`text-xs font-bold text-primary/85 hover:text-primary transition-colors block break-all ${isRTL ? 'text-right' : 'text-left'}`}
                      dir="ltr"
                    >
                      info@bethlehemmedcenter.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className={`flex items-start gap-2 p-2 rounded-lg bg-white/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="h-4 w-4 text-primary/80 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Wadi+Musalam+Street+Najib+Nasser+Building+Bethlehem+Palestine"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-bold text-primary/85 hover:text-primary transition-colors leading-relaxed hover:underline`}
                    >
                      {isRTL
                        ? "شارع وادي مسلم - مبنى نجيب ناصر، بيت لحم، فلسطين"
                        : "Wadi Musalam St. - Najib Nasser Building, Bethlehem, Palestine"
                      }
                    </a>
                  </div>
                </div>
                {/* Social Media Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative">
                      <h4 className="font-semibold text-primary/85 mb-3 text-lg flex items-center gap-2">
                        <div className="p-1 bg-gradient-to-br from-primary to-primary/85 rounded-lg">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        {isRTL ? 'تابعنا على وسائل التواصل' : 'Follow us on Social Media'}
                      </h4>
                      <div className="flex gap-3">
                        <a
                          href="https://www.facebook.com/yourclinicpage"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="group/social p-2 rounded-xl bg-white/60 hover:bg-blue-50 border border-primary/20 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-blue-200 transform hover:scale-110"
                        >
                          <Facebook className="w-5 h-5 text-primary/80 group-hover/social:text-blue-600 transition-colors" />
                        </a>
                        <a
                          href="https://www.instagram.com/yourclinicpage"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="group/social p-2 rounded-xl bg-white/60 hover:bg-pink-50 border border-primary/20 hover:border-pink-400 transition-all duration-300 shadow-sm hover:shadow-pink-200 transform hover:scale-110"
                        >
                          <Instagram className="w-5 h-5 text-primary/80 group-hover/social:text-pink-600 transition-colors" />
                        </a>
                        <a
                          href="https://x.com/yourclinicpage"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="X (formerly Twitter)"
                          className="group/social p-2 rounded-xl bg-white/60 hover:bg-gray-50 border border-primary/20 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-gray-200 transform hover:scale-110"
                        >
                          <XIcon className="w-5 h-5 text-primary/80 group-hover/social:text-gray-800 transition-colors" />
                        </a>
                        <a
                          href="https://wa.me/97222744444"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="WhatsApp"
                          className="group/social p-2 rounded-xl bg-white/60 hover:bg-green-50 border border-primary/20 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-green-200 transform hover:scale-110"
                        >
                          <MessageCircle className="w-5 h-5 text-primary/80 group-hover/social:text-green-600 transition-colors" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>


            </div>
          </div>

          {/* Facility & Quick Links */}
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/15 border border-primary/25 hover:border-primary/35 transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/85 rounded-xl shadow-lg">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-primary/85">
                  {t('aboutUs.ourFacility')}
                </h3>
              </div>

              <p className="text-sm text-primary/85 leading-relaxed font-medium mb-3">
                {isRTL
                  ? "مرافق حديثة مجهزة بأحدث التقنيات الطبية."
                  : "Modern facilities equipped with the latest medical technology."
                }
              </p>

              <div className="space-y-2 mb-4">
                {[
                  {
                    icon: "🏥",
                    text: isRTL ? "غرف فحص متطورة." : "Advanced Examination Rooms."
                  },
                  {
                    icon: "🔬",
                    text: isRTL ? "مختبر طبي شامل." : "Comprehensive Lab Services."
                  },
                  {
                    icon: "📱",
                    text: isRTL ? "مركز تصوير حديث." : "Modern Imaging Center."
                  },
                  {
                    icon: "♿",
                    text: isRTL ? "تسهيلات لذوي الاحتياجات الخاصة." : "Accessibility Features."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-primary/20">
                    <span className="text-sm">{feature.icon}</span>
                    <span className="text-xs text-primary/80 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-sm text-primary/85 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/85 rounded-full"></div>
                  {t("footer.quickLinks")}
                </h4>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={openTerms}
                    className="text-xs text-primary/85 hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg bg-white/40 hover:bg-white/60 border border-primary/25 hover:border-primary/35 text-left"
                  >
                    {t("footer.termsOfUse")}
                  </button>
                  <button
                    onClick={openPrivacy}
                    className="text-xs text-primary/85 hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg bg-white/40 hover:bg-white/60 border border-primary/25 hover:border-primary/35 text-left"
                  >
                    {t("footer.privacyPolicy")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Copyright Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-muted/40">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-muted-foreground">
              © {currentYear} {t("common.clinicName")}. {t("footer.rights")}.
            </p>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>

          {/* Developed by Codefusion.me */}
          <div className="developed-by">
            <a
              href="https://codefusion.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary/85 hover:text-primary font-medium text-sm px-3 py-2 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:shadow-sm"
              aria-label="Developed by Codefusion.me"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeWidth="2" />
              </svg>
              <span className="font-semibold">Developed by Codefusion.me</span>
            </a>
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