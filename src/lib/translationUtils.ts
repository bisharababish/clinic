// lib/translationUtils.ts
import { TFunction } from 'react-i18next';

/**
 * Translate appointment data using database Arabic fields and fallback translations
 * @param appointmentData - Object containing appointment details with potential Arabic fields
 * @param t - Translation function from useTranslation
 * @param currentLanguage - Current language ('en' or 'ar')
 * @returns Object with translated appointment details
 */
export const translateAppointmentData = (
    appointmentData: {
        clinicName?: string;
        clinicNameAr?: string;
        doctorName?: string;
        doctorNameAr?: string;
        specialty?: string;
        specialtyAr?: string;
        appointmentDay?: string;
        appointmentTime?: string;
    },
    t: TFunction,
    currentLanguage: string
) => {
    console.log('🔄 Translating appointment data:', {
        currentLanguage,
        doctorName: appointmentData.doctorName,
        specialty: appointmentData.specialty,
        appointmentDay: appointmentData.appointmentDay
    });
    const getTranslatedValue = (englishValue: string | undefined, arabicValue: string | undefined, fallbackKey?: string): string => {
        if (!englishValue) return '';

        console.log('🔄 Translating value:', { englishValue, arabicValue, fallbackKey, currentLanguage });

        if (currentLanguage === 'ar') {
            // Try Arabic database field first
            if (arabicValue && arabicValue.trim()) {
                console.log('✅ Using Arabic database field:', arabicValue);
                return arabicValue;
            }

            // Fallback to translation key
            if (fallbackKey) {
                const translation = t(fallbackKey, { defaultValue: null });
                console.log('🔍 Trying translation key:', fallbackKey, '→', translation);
                if (translation && translation !== fallbackKey) {
                    console.log('✅ Using translation key:', translation);
                    return translation;
                }
            }

            // Try general medical term translation first
            const medicalTranslation = getMedicalTermTranslation(englishValue, t, currentLanguage);
            console.log('🔍 Medical translation:', englishValue, '→', medicalTranslation);
            if (medicalTranslation !== englishValue) {
                console.log('✅ Using medical translation:', medicalTranslation);
                return medicalTranslation;
            }

            // Always try doctor name translation for any value that looks like a name
            const doctorTranslation = translateDoctorName(englishValue, t, currentLanguage);
            console.log('🔍 Doctor translation:', englishValue, '→', doctorTranslation);
            if (doctorTranslation !== englishValue) {
                console.log('✅ Using doctor translation:', doctorTranslation);
                return doctorTranslation;
            }

            console.log('⚠️ No translation found, using original:', englishValue);
            return medicalTranslation;
        }

        // For English, return the English value
        console.log('🇺🇸 English mode, returning original:', englishValue);
        return englishValue;
    };

    const result = {
        clinicName: getTranslatedValue(
            appointmentData.clinicName,
            appointmentData.clinicNameAr,
            `payment.${appointmentData.clinicName?.toLowerCase().replace(/\s+/g, '')}`
        ),
        doctorName: getTranslatedValue(
            appointmentData.doctorName,
            appointmentData.doctorNameAr,
            `payment.${appointmentData.doctorName?.toLowerCase().replace(/\s+/g, '')}`
        ),
        specialty: getTranslatedValue(
            appointmentData.specialty,
            appointmentData.specialtyAr,
            `payment.${appointmentData.specialty?.toLowerCase().replace(/\s+/g, '')}`
        ),
        appointmentDay: getTranslatedValue(
            appointmentData.appointmentDay,
            undefined,
            `payment.${appointmentData.appointmentDay?.toLowerCase()}`
        ),
        appointmentTime: appointmentData.appointmentTime || '', // Time usually doesn't need translation
    };

    console.log('✅ Translation result:', result);
    return result;
};

/**
 * Translate individual values using database Arabic fields and fallback translations
 * @param englishValue - English value
 * @param arabicValue - Arabic value from database (optional)
 * @param t - Translation function
 * @param currentLanguage - Current language
 * @param fallbackKey - Optional fallback translation key
 * @returns Translated value
 */
export const translateValue = (
    englishValue: string | undefined,
    arabicValue: string | undefined,
    t: TFunction,
    currentLanguage: string,
    fallbackKey?: string
): string => {
    if (!englishValue) return '';

    if (currentLanguage === 'ar') {
        // Try Arabic database field first
        if (arabicValue && arabicValue.trim()) {
            return arabicValue;
        }

        // Fallback to translation key
        if (fallbackKey) {
            const translation = t(fallbackKey, { defaultValue: null });
            if (translation && translation !== fallbackKey) {
                return translation;
            }
        }

        // Try general medical term translation first
        const medicalTranslation = getMedicalTermTranslation(englishValue, t, currentLanguage);
        if (medicalTranslation !== englishValue) {
            return medicalTranslation;
        }

        // For doctor names, try the specialized doctor name translation
        if (fallbackKey && fallbackKey.includes('payment.')) {
            const doctorTranslation = translateDoctorName(englishValue, t, currentLanguage);
            if (doctorTranslation !== englishValue) {
                return doctorTranslation;
            }
        }

        return medicalTranslation;
    }

    // For English, return the English value
    return englishValue;
};

/**
 * Translate appointment details (clinic, doctor, specialty, day, time)
 * @param appointmentData - Object containing appointment details
 * @param t - Translation function
 * @param currentLanguage - Current language
 * @returns Object with translated appointment details
 */
export const translateAppointmentDetails = (
    appointmentData: {
        clinicName?: string;
        doctorName?: string;
        specialty?: string;
        appointmentDay?: string;
        appointmentTime?: string;
    },
    t: TFunction,
    currentLanguage: string
) => {
    return {
        clinicName: translateDynamicContent(appointmentData.clinicName || '', t, currentLanguage),
        doctorName: translateDynamicContent(appointmentData.doctorName || '', t, currentLanguage),
        specialty: translateDynamicContent(appointmentData.specialty || '', t, currentLanguage),
        appointmentDay: translateDynamicContent(appointmentData.appointmentDay || '', t, currentLanguage),
        appointmentTime: appointmentData.appointmentTime || '', // Time usually doesn't need translation
    };
};

/**
 * Get translation for common medical terms
 * @param term - Medical term to translate
 * @param t - Translation function
 * @param currentLanguage - Current language
 * @returns Translated term
 */
export const getMedicalTermTranslation = (
    term: string,
    t: TFunction,
    currentLanguage: string
): string => {
    if (!term || typeof term !== 'string') return term;

    console.log('🏥 Translating medical term:', { term, currentLanguage });

    const normalizedTerm = term.toLowerCase().trim();
    console.log('🔍 Normalized medical term:', normalizedTerm);

    // First, try exact match with translation keys
    const medicalTerms: Record<string, string> = {
        // Common specialties
        'dentist': 'payment.dentist',
        'dentistry': 'payment.dentistSpecialty',
        'pediatrics': 'payment.pediatrics',
        'cardiology': 'payment.cardiology',
        'dermatology': 'payment.dermatology',
        'neurology': 'payment.neurology',
        'orthopedics': 'payment.orthopedics',
        'psychiatry': 'payment.psychiatry',
        'gynecology': 'payment.gynecology',
        'urology': 'payment.urology',
        'ophthalmology': 'payment.ophthalmology',
        'radiology': 'payment.radiology',
        'surgery': 'payment.surgery',
        'emergency': 'payment.emergency',
        'emergency medicine': 'payment.emergency',
        'family': 'payment.family',
        'family medicine': 'payment.family',
        'internal': 'payment.internal',
        'internal medicine': 'payment.internal',
        'general': 'payment.general',
        'general medicine': 'payment.general',
        'anesthesiology': 'payment.anesthesiology',
        'oncology': 'payment.oncology',
        'endocrinology': 'payment.endocrinology',
        'pulmonology': 'payment.pulmonology',
        'gastroenterology': 'payment.gastroenterology',
        'nephrology': 'payment.nephrology',
        'rheumatology': 'payment.rheumatology',
        'hematology': 'payment.hematology',
        'immunology': 'payment.immunology',
        'pathology': 'payment.pathology',
        'pharmacology': 'payment.pharmacology',
        'physiotherapy': 'payment.physiotherapy',
        'physical therapy': 'payment.physiotherapy',
        'laboratory': 'payment.laboratory',

        // Days
        'monday': 'payment.monday',
        'tuesday': 'payment.tuesday',
        'wednesday': 'payment.wednesday',
        'thursday': 'payment.thursday',
        'friday': 'payment.friday',
        'saturday': 'payment.saturday',
        'sunday': 'payment.sunday',

        // Common doctor names
        'bishara babish': 'payment.bisharaBabish',
        'ahmed mohammed': 'payment.ahmedMohammed',
        'fatima ali': 'payment.fatimaAli',
        'omar hassan': 'payment.omarHassan',
        'mariam ibrahim': 'payment.mariamIbrahim',
        'issa handal': 'payment.issaHandal',

        // Common clinic names
        'bethlehem med center': 'payment.bethlehemMedCenter',
        'al-makassed hospital': 'payment.alMakassedHospital',
        'hadassah hospital': 'payment.hadassahHospital',
        'al-shifa hospital': 'payment.alShifaHospital',
        'ramallah hospital': 'payment.ramallahHospital',
    };

    // Try exact match first
    const exactMatch = medicalTerms[normalizedTerm];
    if (exactMatch) {
        const translation = t(exactMatch, { defaultValue: null });
        if (translation && translation !== exactMatch) {
            return translation;
        }
    }

    // Try partial matches for specialties (e.g., "cardiology" matches "cardio")
    if (currentLanguage === 'ar') {
        for (const [key, translationKey] of Object.entries(medicalTerms)) {
            if (normalizedTerm.includes(key) || key.includes(normalizedTerm)) {
                const translation = t(translationKey, { defaultValue: null });
                if (translation && translation !== translationKey) {
                    return translation;
                }
            }
        }
    }

    // If no translation found, return original term
    console.log('🏥 Medical term translation result:', { original: term, translated: term });
    return term;
};

/**
 * Translate doctor names using common Arabic name patterns
 * @param doctorName - Doctor's name in English
 * @param t - Translation function
 * @param currentLanguage - Current language
 * @returns Translated doctor name
 */
export const translateDoctorName = (
    doctorName: string,
    t: TFunction,
    currentLanguage: string
): string => {
    if (!doctorName || typeof doctorName !== 'string') return doctorName;

    console.log('👨‍⚕️ Translating doctor name:', { doctorName, currentLanguage });

    if (currentLanguage !== 'ar') {
        console.log('🇺🇸 English mode, returning original doctor name:', doctorName);
        return doctorName; // Return English name for English language
    }

    const normalizedName = doctorName.toLowerCase().trim();
    console.log('🔍 Normalized name:', normalizedName);

    // Try exact match first
    const exactMatch = medicalTerms[normalizedName];
    if (exactMatch) {
        const translation = t(exactMatch, { defaultValue: null });
        if (translation && translation !== exactMatch) {
            return translation;
        }
    }

    // For Arabic language, try to transliterate common English names to Arabic
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
        'thomas': 'توماس',
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
        'james': 'جيمس',
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

    // Split the name into parts
    const nameParts = normalizedName.split(/\s+/);
    const translatedParts: string[] = [];

    for (const part of nameParts) {
        // Remove common titles
        const cleanPart = part.replace(/^(dr\.?|doctor|prof\.?|professor|mr\.?|mrs\.?|ms\.?)$/i, '').trim();

        if (cleanPart && nameTranslations[cleanPart]) {
            translatedParts.push(nameTranslations[cleanPart]);
        } else if (cleanPart) {
            // If no translation found, keep original (might be already in Arabic)
            translatedParts.push(part);
        }
    }

    const result = translatedParts.length > 0 ? translatedParts.join(' ') : doctorName;
    console.log('👨‍⚕️ Doctor name translation result:', { original: doctorName, translated: result });
    return result;
};
