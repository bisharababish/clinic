// lib/autoTranslationService.ts - Auto-translation service for any text
import { translateToArabic } from './translationService.js';
import { fallbackTranslateAppointmentData } from './fallbackTranslationService';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Auto-translate any text to Arabic using Google Translate API
 * @param text - Text to translate
 * @param currentLanguage - Current language ('en' or 'ar')
 * @returns Promise<string> - Translated text or original if error
 */
export const autoTranslateText = async (
    text: string,
    currentLanguage: string
): Promise<string> => {
    if (!text || typeof text !== 'string') return text;

    console.log('🌐 autoTranslateText called:', { text, currentLanguage });

    // If not Arabic, return as is
    if (currentLanguage !== 'ar') {
        console.log('🇺🇸 Not Arabic, returning original text:', text);
        return text;
    }

    // Check cache first
    const cacheKey = `${text}_${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
        console.log('📦 Using cached translation:', text, '→', translationCache.get(cacheKey));
        return translationCache.get(cacheKey)!;
    }

    try {
        console.log('🌐 Auto-translating:', text);
        const translatedText = await translateToArabic(text);

        // Cache the translation
        translationCache.set(cacheKey, translatedText);
        console.log('✅ Auto-translation result:', text, '→', translatedText);

        return translatedText;
    } catch (error) {
        console.error('❌ Auto-translation error for:', text, error);
        return text; // Fallback to original text
    }
};

/**
 * Auto-translate appointment data using Google Translate API
 * @param appointmentData - Appointment data to translate
 * @param currentLanguage - Current language
 * @returns Promise with translated appointment data
 */
export const autoTranslateAppointmentData = async (
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

    console.log('🚀 Auto-translating appointment data...');

    try {
        // Try Google Translate API first
        const [translatedClinicName, translatedDoctorName, translatedSpecialty, translatedDay] = await Promise.all([
            appointmentData.clinicName ? autoTranslateText(appointmentData.clinicName, currentLanguage) : Promise.resolve(''),
            appointmentData.doctorName ? autoTranslateText(appointmentData.doctorName, currentLanguage) : Promise.resolve(''),
            appointmentData.specialty ? autoTranslateText(appointmentData.specialty, currentLanguage) : Promise.resolve(''),
            appointmentData.appointmentDay ? autoTranslateText(appointmentData.appointmentDay, currentLanguage) : Promise.resolve('')
        ]);

        const result = {
            clinicName: translatedClinicName,
            doctorName: translatedDoctorName,
            specialty: translatedSpecialty,
            appointmentDay: translatedDay,
            appointmentTime: appointmentData.appointmentTime || '' // Time usually doesn't need translation
        };

        console.log('✅ Auto-translation complete:', result);
        return result;
    } catch (error) {
        console.error('❌ Google Translate API failed, using fallback translation:', error);

        // Use fallback translation when API fails
        const fallbackResult = fallbackTranslateAppointmentData(appointmentData, currentLanguage);
        console.log('🔄 Fallback translation result:', fallbackResult);
        return fallbackResult;
    }
};

/**
 * Clear translation cache (useful for testing or if you want fresh translations)
 */
export const clearTranslationCache = () => {
    translationCache.clear();
    console.log('🗑️ Translation cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    return {
        size: translationCache.size,
        entries: Array.from(translationCache.entries())
    };
};
