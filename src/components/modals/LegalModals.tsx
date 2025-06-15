// components/modals/LegalModals.tsx
import React, { useState, useContext } from 'react';
import { X, Shield, FileText, Lock, Eye, Users, Phone, CheckCircle, AlertCircle, Calendar, CreditCard, Scale, Globe, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../contexts/LanguageContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon }) => {
    const { isRTL } = useContext(LanguageContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Enhanced Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Enhanced Modal */}
            <div
                className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Professional Header */}
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">{title}</h2>
                                <p className="text-white/70 text-sm mt-1">
                                    Bethlehem Medical Center
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-100px)] bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const TermsOfUseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { isRTL } = useContext(LanguageContext);

    const content = isRTL ? {
        title: "شروط الاستخدام والخدمة",
        lastUpdated: "آخر تحديث: 15 يونيو 2025",
        effectiveDate: "تاريخ السريان: 15 يونيو 2025",
        sections: [
            {
                id: "acceptance",
                title: "1. قبول الشروط",
                content: [
                    "بالوصول إلى موقعنا الإلكتروني أو استخدام خدماتنا الطبية، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام.",
                    "إذا كنت لا توافق على هذه الشروط، يجب عليك عدم استخدام موقعنا أو خدماتنا.",
                    "نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق."
                ]
            },
            {
                id: "definitions",
                title: "2. التعريفات",
                content: [
                    "\"المركز\" أو \"نحن\" يشير إلى مركز بيت لحم الطبي وموظفيه ومقدمي الخدمات المعتمدين.",
                    "\"المريض\" أو \"أنت\" يشير إلى أي شخص يستخدم خدماتنا أو يصل إلى موقعنا الإلكتروني.",
                    "\"الخدمات\" تشمل جميع الخدمات الطبية والاستشارية والتشخيصية التي نقدمها."
                ]
            },
            {
                id: "medical-services",
                title: "3. الخدمات الطبية",
                content: [
                    "نقدم خدمات الرعاية الصحية المهنية وفقاً لأعلى المعايير الطبية المعترف بها دولياً.",
                    "جميع الخدمات تخضع للتوفر والتقدير المهني للأطباء المعتمدين لدينا.",
                    "لا نضمن نتائج علاجية محددة، حيث تختلف الاستجابة للعلاج من مريض لآخر.",
                    "يحق لنا رفض تقديم الخدمة في حالات معينة وفقاً لتقديرنا المهني."
                ]
            },
            {
                id: "appointments",
                title: "4. المواعيد والحجوزات",
                content: [
                    "يجب تأكيد جميع المواعيد قبل 24 ساعة على الأقل من الموعد المحدد.",
                    "في حالة التأخير أكثر من 15 دقيقة، قد يتم إعادة جدولة الموعد أو إلغاؤه.",
                    "يتطلب إلغاء الموعد إشعاراً مسبقاً لا يقل عن 24 ساعة، وإلا فقد تطبق رسوم إلغاء.",
                    "نحتفظ بالحق في إعادة جدولة المواعيد في حالات الطوارئ أو الظروف القاهرة."
                ]
            },
            {
                id: "payment",
                title: "5. الدفع والفوترة",
                content: [
                    "الدفع مطلوب وقت تلقي الخدمة ما لم يتم الاتفاق على خلاف ذلك مسبقاً.",
                    "نقبل النقد وبطاقات الائتمان والتأمين الصحي المعتمد.",
                    "المريض مسؤول عن دفع أي مبالغ غير مغطاة بالتأمين الصحي.",
                    "الأسعار قابلة للتغيير دون إشعار مسبق."
                ]
            },
            {
                id: "confidentiality",
                title: "6. السرية الطبية",
                content: [
                    "نلتزم بحماية سرية جميع المعلومات الطبية والشخصية وفقاً للقوانين المحلية والدولية.",
                    "لن نكشف عن معلوماتك الطبية إلا بموافقتك الكتابية أو عند الضرورة القانونية.",
                    "يحق لك الوصول إلى سجلاتك الطبية وطلب تصحيحها عند الضرورة.",
                    "نتخذ جميع التدابير الأمنية اللازمة لحماية معلوماتك من الوصول غير المصرح به."
                ]
            },
            {
                id: "liability",
                title: "7. المسؤولية وإخلاء المسؤولية",
                content: [
                    "نسعى لتقديم أفضل رعاية طبية ممكنة، لكننا لا نضمن نتائج علاجية محددة.",
                    "مسؤوليتنا محدودة بقيمة الخدمات المقدمة فعلياً.",
                    "لا نتحمل المسؤولية عن أي أضرار غير مباشرة أو عرضية أو تبعية.",
                    "المريض مسؤول عن الإفصاح الكامل عن تاريخه الطبي وحالته الصحية."
                ]
            },
            {
                id: "website",
                title: "8. استخدام الموقع الإلكتروني",
                content: [
                    "محتوى الموقع مخصص للأغراض التعليمية والإعلامية فقط وليس بديلاً عن الاستشارة الطبية.",
                    "يحظر استخدام الموقع لأي أغراض غير قانونية أو ضارة.",
                    "جميع حقوق الملكية الفكرية للموقع محفوظة لمركز بيت لحم الطبي.",
                    "نحتفظ بالحق في تعليق أو إنهاء وصولك للموقع في أي وقت."
                ]
            },
            {
                id: "governing-law",
                title: "9. القانون الحاكم",
                content: [
                    "تخضع هذه الشروط للقوانين السارية في دولة فلسطين.",
                    "أي نزاع ينشأ عن هذه الشروط يخضع لاختصاص المحاكم المختصة في بيت لحم.",
                    "إذا تبين أن أي بند من هذه الشروط غير قابل للتنفيذ، فإن باقي البنود تبقى سارية المفعول."
                ]
            }
        ]
    } : {
        title: "Terms of Use and Service",
        lastUpdated: "Last updated: June 15, 2025",
        effectiveDate: "Effective Date: June 15, 2025",
        sections: [
            {
                id: "acceptance",
                title: "1. Acceptance of Terms",
                content: [
                    "By accessing our website or using our medical services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and Service.",
                    "If you do not agree to these terms, you must not use our website or services.",
                    "We reserve the right to modify these terms at any time without prior notice."
                ]
            },
            {
                id: "definitions",
                title: "2. Definitions",
                content: [
                    "\"Center\" or \"We\" refers to Bethlehem Medical Center, its staff, and authorized service providers.",
                    "\"Patient\" or \"You\" refers to any individual using our services or accessing our website.",
                    "\"Services\" includes all medical, consultative, and diagnostic services we provide."
                ]
            },
            {
                id: "medical-services",
                title: "3. Medical Services",
                content: [
                    "We provide professional healthcare services in accordance with internationally recognized medical standards.",
                    "All services are subject to availability and professional discretion of our licensed physicians.",
                    "We do not guarantee specific treatment outcomes, as individual responses to treatment may vary.",
                    "We reserve the right to refuse service in certain circumstances at our professional discretion."
                ]
            },
            {
                id: "appointments",
                title: "4. Appointments and Scheduling",
                content: [
                    "All appointments must be confirmed at least 24 hours in advance.",
                    "Patients arriving more than 15 minutes late may have their appointment rescheduled or cancelled.",
                    "Appointment cancellations require at least 24 hours notice, otherwise cancellation fees may apply.",
                    "We reserve the right to reschedule appointments due to emergencies or unforeseen circumstances."
                ]
            },
            {
                id: "payment",
                title: "5. Payment and Billing",
                content: [
                    "Payment is due at the time of service unless otherwise agreed upon in advance.",
                    "We accept cash, credit cards, and approved health insurance.",
                    "Patients are responsible for payment of any amounts not covered by insurance.",
                    "Prices are subject to change without prior notice."
                ]
            },
            {
                id: "confidentiality",
                title: "6. Medical Confidentiality",
                content: [
                    "We are committed to protecting the confidentiality of all medical and personal information in accordance with local and international laws.",
                    "We will not disclose your medical information except with your written consent or when legally required.",
                    "You have the right to access your medical records and request corrections when necessary.",
                    "We implement all necessary security measures to protect your information from unauthorized access."
                ]
            },
            {
                id: "liability",
                title: "7. Liability and Disclaimers",
                content: [
                    "While we strive to provide the best possible medical care, we do not guarantee specific treatment outcomes.",
                    "Our liability is limited to the value of services actually provided.",
                    "We are not liable for any indirect, incidental, or consequential damages.",
                    "Patients are responsible for full disclosure of their medical history and health condition."
                ]
            },
            {
                id: "website",
                title: "8. Website Usage",
                content: [
                    "Website content is for educational and informational purposes only and is not a substitute for professional medical advice.",
                    "Using the website for any illegal or harmful purposes is prohibited.",
                    "All intellectual property rights for the website are reserved by Bethlehem Medical Center.",
                    "We reserve the right to suspend or terminate your access to the website at any time."
                ]
            },
            {
                id: "governing-law",
                title: "9. Governing Law",
                content: [
                    "These terms are governed by the laws of the State of Palestine.",
                    "Any disputes arising from these terms are subject to the jurisdiction of the competent courts in Bethlehem.",
                    "If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in effect."
                ]
            }
        ]
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={content.title}
            icon={<FileText className="h-6 w-6" />}
        >
            <div className="p-8 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {content.lastUpdated}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {content.effectiveDate}
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        {isRTL 
                            ? "يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا. استخدامك لخدماتنا يعني موافقتك على هذه الشروط."
                            : "Please read these Terms of Use carefully before using our services. Your use of our services constitutes your agreement to these terms."
                        }
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {content.sections.map((section, index) => (
                        <div key={section.id} className="scroll-mt-8" id={section.id}>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                {section.title}
                            </h3>
                            <div className="space-y-3">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-100">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <Phone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {isRTL ? "تحتاج مساعدة؟" : "Need Help?"}
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        +970 2 274 4444
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        legal@bethlehemmedcenter.com
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {isRTL ? "بيت لحم، فلسطين" : "Bethlehem, Palestine"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export const PrivacyPolicyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { isRTL } = useContext(LanguageContext);

    const content = isRTL ? {
        title: "سياسة الخصوصية وحماية البيانات",
        lastUpdated: "آخر تحديث: 15 يونيو 2025",
        effectiveDate: "تاريخ السريان: 15 يونيو 2025",
        sections: [
            {
                id: "introduction",
                title: "1. مقدمة",
                content: [
                    "مركز بيت لحم الطبي ملتزم بحماية خصوصيتك وأمان معلوماتك الشخصية والطبية.",
                    "توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا ومشاركتنا لمعلوماتك.",
                    "باستخدام خدماتنا، فإنك توافق على ممارسات جمع واستخدام المعلومات الموضحة في هذه السياسة."
                ]
            },
            {
                id: "information-collected",
                title: "2. المعلومات التي نجمعها",
                content: [
                    "المعلومات الشخصية: الاسم، تاريخ الميلاد، العنوان، رقم الهاتف، البريد الإلكتروني.",
                    "المعلومات الطبية: التاريخ الطبي، الأعراض، التشخيص، العلاج، نتائج الفحوصات.",
                    "معلومات التأمين: بيانات شركة التأمين ورقم البوليصة.",
                    "المعلومات التقنية: عنوان IP، نوع المتصفح، صفحات الموقع المزارة.",
                    "معلومات الدفع: تفاصيل بطاقة الائتمان (مشفرة وآمنة)."
                ]
            },
            {
                id: "information-use",
                title: "3. كيفية استخدام المعلومات",
                content: [
                    "تقديم الرعاية الطبية والخدمات العلاجية والتشخيصية.",
                    "إدارة المواعيد والتواصل معك بشأن علاجك.",
                    "معالجة المدفوعات ومطالبات التأمين.",
                    "تحسين جودة خدماتنا وتطوير علاجات جديدة.",
                    "الامتثال للمتطلبات القانونية والتنظيمية.",
                    "إرسال تذكيرات المواعيد والمعلومات الصحية المهمة."
                ]
            },
            {
                id: "information-sharing",
                title: "4. مشاركة المعلومات",
                content: [
                    "لا نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية لأطراف ثالثة.",
                    "قد نشارك معلوماتك في الحالات التالية:",
                    "• مع موافقتك الكتابية الصريحة",
                    "• مع مقدمي الرعاية الصحية الآخرين لاستمرارية العلاج",
                    "• مع شركات التأمين لمعالجة المطالبات",
                    "• عند الطلب من السلطات القانونية المختصة",
                    "• في حالات الطوارئ الطبية لحماية سلامتك"
                ]
            },
            {
                id: "data-security",
                title: "5. أمان البيانات",
                content: [
                    "نستخدم أحدث تقنيات التشفير لحماية معلوماتك أثناء النقل والتخزين.",
                    "نطبق ضوابط وصول صارمة لضمان وصول الموظفين المخولين فقط.",
                    "نجري تدقيقات أمنية منتظمة ونحدث أنظمة الحماية باستمرار.",
                    "نتبع المعايير الدولية لأمان المعلومات الطبية (HIPAA, ISO 27001).",
                    "نحتفظ بنسخ احتياطية آمنة لضمان استمرارية الخدمة."
                ]
            },
            {
                id: "patient-rights",
                title: "6. حقوقك كمريض",
                content: [
                    "الحق في الوصول إلى سجلاتك الطبية والحصول على نسخ منها.",
                    "الحق في طلب تصحيح أي معلومات غير دقيقة في سجلاتك.",
                    "الحق في طلب تقييد استخدام أو مشاركة معلوماتك.",
                    "الحق في سحب موافقتك على استخدام معلوماتك في أي وقت.",
                    "الحق في رفع شكوى بشأن ممارسات الخصوصية لدينا.",
                    "الحق في طلب حذف معلوماتك (مع مراعاة المتطلبات القانونية)."
                ]
            },
            {
                id: "cookies-tracking",
                title: "7. ملفات تعريف الارتباط والتتبع",
                content: [
                    "نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة استخدام الموقع.",
                    "ملفات تعريف الارتباط الأساسية: ضرورية لعمل الموقع الأساسي.",
                    "ملفات تعريف الارتباط التحليلية: لفهم كيفية استخدام الموقع وتحسينه.",
                    "ملفات تعريف الارتباط الوظيفية: لحفظ تفضيلاتك وإعداداتك.",
                    "يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح."
                ]
            },
            {
                id: "data-retention",
                title: "8. الاحتفاظ بالبيانات",
                content: [
                    "نحتفظ بسجلاتك الطبية للمدة المطلوبة قانونياً (عادة 7-10 سنوات).",
                    "قد نحتفظ ببعض المعلومات لفترة أطول لأغراض البحث العلمي (مع إخفاء الهوية).",
                    "يتم حذف المعلومات غير الضرورية بشكل آمن وفقاً لجدول زمني محدد.",
                    "في حالة وفاة المريض، قد نحتفظ بالسجلات لفترة إضافية وفقاً للقانون."
                ]
            },
            {
                id: "international-transfers",
                title: "9. النقل الدولي للبيانات",
                content: [
                    "قد ننقل معلوماتك خارج فلسطين في حالات محدودة:",
                    "• للحصول على استشارات طبية متخصصة",
                    "• لمعالجة البيانات من قبل مزودي خدمات موثوقين",
                    "• لأغراض البحث الطبي المعتمد",
                    "نضمن أن أي نقل يتم وفقاً لمعايير الحماية الدولية المناسبة."
                ]
            },
            {
                id: "policy-changes",
                title: "10. التغييرات على السياسة",
                content: [
                    "قد نحدث هذه السياسة من وقت لآخر لتعكس التغييرات في ممارساتنا أو القوانين.",
                    "سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني أو إشعار على موقعنا.",
                    "تصبح السياسة المحدثة سارية المفعول فور نشرها على موقعنا.",
                    "استمرار استخدامك لخدماتنا يعني موافقتك على السياسة المحدثة."
                ]
            }
        ]
    } : {
        title: "Privacy Policy and Data Protection",
        lastUpdated: "Last updated: June 15, 2025",
        effectiveDate: "Effective Date: June 15, 2025",
        sections: [
            {
                id: "introduction",
                title: "1. Introduction",
                content: [
                    "Bethlehem Medical Center is committed to protecting your privacy and the security of your personal and medical information.",
                    "This policy explains how we collect, use, protect, and share your information.",
                    "By using our services, you agree to the information collection and use practices outlined in this policy."
                ]
            },
            {
                id: "information-collected",
                title: "2. Information We Collect",
                content: [
                    "Personal Information: Name, date of birth, address, phone number, email address.",
                    "Medical Information: Medical history, symptoms, diagnoses, treatments, test results.",
                    "Insurance Information: Insurance company details and policy numbers.",
                    "Technical Information: IP address, browser type, pages visited on our website.",
                    "Payment Information: Credit card details (encrypted and secure)."
                ]
            },
            {
                id: "information-use",
                title: "3. How We Use Your Information",
                content: [
                    "To provide medical care and treatment services.",
                    "To manage appointments and communicate with you about your treatment.",
                    "To process payments and insurance claims.",
                    "To improve the quality of our services and develop new treatments.",
                    "To comply with legal and regulatory requirements.",
                    "To send appointment reminders and important health information."
                ]
            },
            {
                id: "information-sharing",
                title: "4. Information Sharing",
                content: [
                    "We do not sell, rent, or trade your personal information to third parties.",
                    "We may share your information in the following circumstances:",
                    "• With your explicit written consent",
                    "• With other healthcare providers for continuity of care",
                    "• With insurance companies to process claims",
                    "• When required by competent legal authorities",
                    "• In medical emergencies to protect your safety"
                ]
            },
            {
                id: "data-security",
                title: "5. Data Security",
                content: [
                    "We use state-of-the-art encryption technologies to protect your information during transmission and storage.",
                    "We implement strict access controls to ensure only authorized personnel can access your data.",
                    "We conduct regular security audits and continuously update our protection systems.",
                    "We follow international standards for medical information security (HIPAA, ISO 27001).",
                    "We maintain secure backups to ensure service continuity."
                ]
            },
            {
                id: "patient-rights",
                title: "6. Your Rights as a Patient",
                content: [
                    "The right to access your medical records and obtain copies.",
                    "The right to request correction of any inaccurate information in your records.",
                    "The right to request restrictions on the use or sharing of your information.",
                    "The right to withdraw your consent for the use of your information at any time.",
                    "The right to file a complaint about our privacy practices.",
                    "The right to request deletion of your information (subject to legal requirements)."
                ]
            },
            {
                id: "cookies-tracking",
                title: "7. Cookies and Tracking",
                content: [
                    "We use cookies to improve your website experience.",
                    "Essential cookies: Necessary for basic website functionality.",
                    "Analytics cookies: To understand how the website is used and improve it.",
                    "Functional cookies: To save your preferences and settings.",
                    "You can manage cookies through your browser settings."
                ]
            },
            {
                id: "data-retention",
                title: "8. Data Retention",
                content: [
                    "We retain your medical records for the legally required period (typically 7-10 years).",
                    "Some information may be retained longer for scientific research purposes (anonymized).",
                    "Unnecessary information is securely deleted according to a defined schedule.",
                    "In case of patient death, records may be retained for an additional period as required by law."
                ]
            },
            {
                id: "international-transfers",
                title: "9. International Data Transfers",
                content: [
                    "We may transfer your information outside Palestine in limited cases:",
                    "• To obtain specialized medical consultations",
                    "• For data processing by trusted service providers",
                    "• For approved medical research purposes",
                    "We ensure any transfer complies with appropriate international protection standards."
                ]
            },
            {
                id: "policy-changes",
                title: "10. Changes to This Policy",
                content: [
                    "We may update this policy from time to time to reflect changes in our practices or laws.",
                    "We will notify you of any significant changes via email or notice on our website.",
                    "The updated policy becomes effective immediately upon posting on our website.",
                    "Continued use of our services constitutes acceptance of the updated policy."
                ]
            }
        ]
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={content.title}
            icon={<Shield className="h-6 w-6" />}
        >
            <div className="p-8 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {content.lastUpdated}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {content.effectiveDate}
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    {isRTL ? "التزامنا بالخصوصية" : "Our Privacy Commitment"}
                                </h4>
                                <p className="text-blue-800 text-sm">
                                    {isRTL 
                                        ? "نحن ملتزمون بحماية خصوصيتك ومعلوماتك الطبية وفقاً لأعلى المعايير الدولية والقوانين المحلية."
                                        : "We are committed to protecting your privacy and medical information according to the highest international standards and local laws."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        {isRTL 
                            ? "توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية والطبية. يرجى قراءتها بعناية."
                            : "This policy explains how we collect, use, and protect your personal and medical information. Please read it carefully."
                        }
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {content.sections.map((section, index) => (
                        <div key={section.id} className="scroll-mt-8" id={section.id}>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                {section.title}
                            </h3>
                            <div className="space-y-3">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-100">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Data Protection Summary */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-green-900 mb-1">
                                {isRTL ? "مشفر وآمن" : "Encrypted & Secure"}
                            </h4>
                            <p className="text-sm text-green-700">
                                {isRTL ? "جميع البيانات محمية بتشفير عالي المستوى" : "All data protected with high-level encryption"}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-blue-900 mb-1">
                                {isRTL ? "وصول محدود" : "Limited Access"}
                            </h4>
                            <p className="text-sm text-blue-700">
                                {isRTL ? "فقط الموظفون المخولون يمكنهم الوصول" : "Only authorized personnel can access"}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-purple-900 mb-1">
                                {isRTL ? "حقوقك محفوظة" : "Your Rights Protected"}
                            </h4>
                            <p className="text-sm text-purple-700">
                                {isRTL ? "تحكم كامل في معلوماتك الشخصية" : "Full control over your personal information"}
                            </p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {isRTL ? "تواصل معنا بشأن الخصوصية" : "Contact Us About Privacy"}
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        privacy@bethlehemmedcenter.com
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        +970 2 274 4444
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {isRTL ? "بيت لحم، فلسطين" : "Bethlehem, Palestine"}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    {isRTL
                                        ? "مسؤول حماية البيانات متاح للإجابة على استفساراتك حول الخصوصية"
                                        : "Our Data Protection Officer is available to answer your privacy questions"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// Hook for managing legal modals
export const useLegalModals = () => {
    const [termsOpen, setTermsOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);

    return {
        termsOpen,
        privacyOpen,
        openTerms: () => setTermsOpen(true),
        closeTerms: () => setTermsOpen(false),
        openPrivacy: () => setPrivacyOpen(true),
        closePrivacy: () => setPrivacyOpen(false),
    };
};