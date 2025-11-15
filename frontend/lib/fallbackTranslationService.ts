// lib/fallbackTranslationService.ts - Fallback translation without API dependency

/**
 * Fallback translation service that uses predefined translations
 * This is used when the Google Translate API is not available
 */

// Common medical terms translations
const medicalTerms: Record<string, string> = {
    // Days
    'monday': 'الاثنين',
    'tuesday': 'الثلاثاء',
    'wednesday': 'الأربعاء',
    'thursday': 'الخميس',
    'friday': 'الجمعة',
    'saturday': 'السبت',
    'sunday': 'الأحد',

    // Medical specialties
    'dentist': 'طبيب أسنان',
    'dentistry': 'طب الأسنان',
    'ent': 'طب الانف والاذن والحنجرة',
    'cardiology': 'أمراض القلب',
    'pediatrics': 'طب الأطفال',
    'dermatology': 'الأمراض الجلدية',
    'neurology': 'طب الأعصاب',
    'orthopedics': 'جراحة العظام',
    'psychiatry': 'الطب النفسي',
    'gynecology': 'طب النساء',
    'urology': 'المسالك البولية',
    'ophthalmology': 'طب العيون',
    'radiology': ' طب الأشعة',
    'surgery': 'الجراحة',
    'emergency': 'طب الطوارئ',
    'emergency medicine': 'طب الطوارئ',
    'family': 'طب الأسرة',
    'family medicine': 'طب الأسرة',
    'internal': 'الطب الباطني',
    'internal medicine': 'الطب الباطني',
    'general': 'عام',
    'general medicine': 'عام',
    'anesthesiology': 'التخدير',
    'oncology': 'علاج الأورام',
    'endocrinology': 'الغدد الصماء',
    'pulmonology': 'أمراض الرئة',
    'gastroenterology': 'أمراض الجهاز الهضمي',
    'nephrology': 'أمراض الكلى',
    'rheumatology': 'أمراض الروماتيزم',
    'hematology': 'أمراض الدم',
    'immunology': 'المناعة',
    'pathology': 'علم الأمراض',
    'pharmacology': 'علم الأدوية',
    'physiotherapy': 'العلاج الطبيعي',
    'physical therapy': 'العلاج الطبيعي',
    'laboratory': 'المختبر',

    // Common clinic types
    'medical center': 'المركز الطبي',
    'hospital': 'مستشفى',
    'clinic': 'عيادة',
    'bethlehem': 'بيت لحم',
    'bethlehem med center': 'مركز بيت لحم الطبي',
    'bethlehem medical center': 'مركز بيت لحم الطبي',
};

// Common name translations (basic transliterations)
const nameTranslations: Record<string, string> = {
    // Common first names
    'john': 'جون',
    'jane': 'جين',
    'michael': 'مايكل',
    'sarah': 'سارة',
    'david': 'داود',
    'mary': 'مريم',
    'robert': 'روبرت',
    'lisa': 'ليزا',
    'james': 'جيمس',
    'anna': 'آنا',
    'william': 'ويليام',
    'emma': 'إيما',
    'chris': 'كريس',
    'linda': 'ليندا',
    'mark': 'مارك',
    'susan': 'سوزان',
    'paul': 'بول',
    'jennifer': 'جينيفر',
    'thomas': 'توماس',
    'karen': 'كارين',
    'steven': 'ستيفن',
    'nancy': 'نانسي',
    'daniel': 'دانيال',
    'betty': 'بيتي',
    'kevin': 'كيفن',
    'helen': 'هيلين',
    'brian': 'براين',
    'sandra': 'ساندرا',
    'edward': 'إدوارد',
    'donna': 'دونا',
    'ronald': 'رونالد',
    'carol': 'كارول',
    'george': 'جورج',
    'ruth': 'روث',
    'kenneth': 'كينيث',
    'sharon': 'شارون',
    'anthony': 'أنتوني',
    'michelle': 'ميشيل',
    'charles': 'تشارلز',
    'laura': 'لورا',

    // Arabic names (keep as is)
    'ahmed': 'أحمد',
    'mohammed': 'محمد',
    'ali': 'علي',
    'omar': 'عمر',
    'hassan': 'حسن',
    'ibrahim': 'إبراهيم',
    'youssef': 'يوسف',
    'khalil': 'خليل',
    'sami': 'سامي',
    'rami': 'رامي',
    'tariq': 'طارق',
    'nasser': 'ناصر',
    'fadi': 'فادي',
    'saleh': 'صالح',
    'majed': 'ماجد',
    'fouad': 'فؤاد',
    'bishara': 'بشارة',
    'babish': 'بابيش',
    'issa': 'عيسى',
    'handal': 'حندل',
    'judah': 'يهوذا',

    // Common last names
    'smith': 'سميث',
    'johnson': 'جونسون',
    'williams': 'ويليامز',
    'brown': 'براون',
    'jones': 'جونز',
    'garcia': 'غارسيا',
    'miller': 'ميلر',
    'davis': 'ديفيس',
    'rodriguez': 'رودريغيز',
    'martinez': 'مارتينيز',
    'hernandez': 'هيرنانديز',
    'lopez': 'لوبيز',
    'gonzalez': 'غونزاليز',
    'wilson': 'ويلسون',
    'anderson': 'أندرسون',
    'taylor': 'تايلور',
    'moore': 'مور',
    'jackson': 'جاكسون',
    'martin': 'مارتن',
    'lee': 'لي',
    'perez': 'بيريز',
    'thompson': 'طومسون',
    'white': 'وايت',
    'harris': 'هاريس',
    'sanchez': 'سانشيز',
    'clark': 'كلارك',
    'ramirez': 'راميريز',
    'lewis': 'لويس',
    'robinson': 'روبنسون',
    'walker': 'ووكر',
    'young': 'يونغ',
    'allen': 'ألين',
    'king': 'كينغ',
    'wright': 'رايت',
    'scott': 'سكوت',
    'torres': 'توريس',
    'nguyen': 'نجوين',
    'hill': 'هيل',
    'flores': 'فلوريس',
    'green': 'غرين',
    'adams': 'آدامز',
    'nelson': 'نيلسون',
    'baker': 'بيكر',
    'hall': 'هول',
    'rivera': 'ريفيرا',
    'campbell': 'كامبل',
    'mitchell': 'ميتشيل',
    'carter': 'كارتر',
    'roberts': 'روبرتس',
    'gomez': 'غوميز',
    'phillips': 'فيليبس',
    'evans': 'إيفانز',
    'turner': 'تيرنر',
    'diaz': 'دياز',
    'parker': 'باركر',
    'cruz': 'كروز',
    'edwards': 'إدواردز',
    'collins': 'كولينز',
    'reyes': 'رييس',
    'stewart': 'ستيوارت',
    'morris': 'موريس',
    'morales': 'موراليس',
    'murphy': 'مورفي',
    'cook': 'كوك',
    'rogers': 'روجرز',
    'gutierrez': 'غوتيريز',
    'ortiz': 'أورتيز',
    'morgan': 'مورغان',
    'cooper': 'كوبر',
    'peterson': 'بيترسون',
    'bailey': 'بايلي',
    'reed': 'ريد',
    'kelly': 'كيللي',
    'howard': 'هاوارد',
    'ramos': 'راموس',
    'kim': 'كيم',
    'cox': 'كوكس',
    'ward': 'وارد',
    'richardson': 'ريتشاردسون',
    'watson': 'واتسون',
    'brooks': 'بروكس',
    'chavez': 'شافيز',
    'wood': 'وود',
    'bennett': 'بينيت',
    'gray': 'غراي',
    'mendoza': 'مندوزا',
    'ruiz': 'رويز',
    'hughes': 'هيوز',
    'price': 'برايس',
    'alvarez': 'الفاريز',
    'castillo': 'كاستيلو',
    'sanders': 'ساندرز',
    'patel': 'باتيل',
    'myers': 'مايرز',
    'long': 'لونغ',
    'ross': 'روس',
    'foster': 'فوستر',
    'jimenez': 'خيمينيز',
};

/**
 * Fallback translation function
 * @param text - Text to translate
 * @param currentLanguage - Current language
 * @returns Translated text or original if no translation found
 */
export const fallbackTranslate = (
    text: string,
    currentLanguage: string
): string => {
    if (!text || typeof text !== 'string' || currentLanguage !== 'ar') {
        return text;
    }

    const normalizedText = text.toLowerCase().trim();

    // Try medical terms first
    if (medicalTerms[normalizedText]) {
        console.log('🏥 Fallback medical translation:', text, '→', medicalTerms[normalizedText]);
        return medicalTerms[normalizedText];
    }

    // Try name translations
    if (nameTranslations[normalizedText]) {
        console.log('👤 Fallback name translation:', text, '→', nameTranslations[normalizedText]);
        return nameTranslations[normalizedText];
    }

    // For names with multiple parts, try to translate each part
    if (normalizedText.includes(' ')) {
        const parts = normalizedText.split(' ');
        const translatedParts = parts.map(part => nameTranslations[part] || part);

        if (translatedParts.some(part => part !== parts[translatedParts.indexOf(part)])) {
            const result = translatedParts.join(' ');
            console.log('👤 Fallback multi-part name translation:', text, '→', result);
            return result;
        }
    }

    console.log('⚠️ No fallback translation found for:', text);
    return text;
};

/**
 * Fallback translation for appointment data
 * @param appointmentData - Appointment data to translate
 * @param currentLanguage - Current language
 * @returns Translated appointment data
 */
export const fallbackTranslateAppointmentData = (
    appointmentData: {
        clinicName?: string;
        doctorName?: string;
        specialty?: string;
        appointmentDay?: string;
        appointmentTime?: string;
    },
    currentLanguage: string
) => {
    if (currentLanguage !== 'ar') {
        return {
            clinicName: appointmentData.clinicName || '',
            doctorName: appointmentData.doctorName || '',
            specialty: appointmentData.specialty || '',
            appointmentDay: appointmentData.appointmentDay || '',
            appointmentTime: appointmentData.appointmentTime || ''
        };
    }

    console.log('🔄 Using fallback translation for appointment data...');

    return {
        clinicName: fallbackTranslate(appointmentData.clinicName || '', currentLanguage),
        doctorName: fallbackTranslate(appointmentData.doctorName || '', currentLanguage),
        specialty: fallbackTranslate(appointmentData.specialty || '', currentLanguage),
        appointmentDay: fallbackTranslate(appointmentData.appointmentDay || '', currentLanguage),
        appointmentTime: appointmentData.appointmentTime || '' // Time usually doesn't need translation
    };
};
