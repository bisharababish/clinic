// lib/freeTranslationService.ts - Free translation services
import { fallbackTranslateAppointmentData } from './fallbackTranslationService';

// Cache for free translations
const translationCache = new Map<string, string>();

/**
 * LibreTranslate API (completely free, no API key needed)
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @returns Promise<string> - Translated text
 */
const translateWithLibreTranslate = async (text: string, targetLang: string = 'ar'): Promise<string> => {
    try {
        // LibreTranslate public instance (free)
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: targetLang,
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`LibreTranslate API error: ${response.status}`);
        }

        const data = await response.json();
        return data.translatedText || text;
    } catch (error) {
        console.error('LibreTranslate error:', error);
        throw error;
    }
};

/**
 * MyMemory API (1,000 requests per day free)
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @returns Promise<string> - Translated text
 */
const translateWithMyMemory = async (text: string, targetLang: string = 'ar'): Promise<string> => {
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
        );

        if (!response.ok) {
            throw new Error(`MyMemory API error: ${response.status}`);
        }

        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch (error) {
        console.error('MyMemory error:', error);
        throw error;
    }
};

/**
 * Free auto-translation using multiple free services
 * @param text - Text to translate
 * @param currentLanguage - Current language
 * @returns Promise<string> - Translated text
 */
export const freeAutoTranslateText = async (
    text: string,
    currentLanguage: string
): Promise<string> => {
    if (!text || typeof text !== 'string') return text;

    console.log('🆓 Free auto-translation called:', { text, currentLanguage });

    // If not Arabic, return as is
    if (currentLanguage !== 'ar') {
        console.log('🇺🇸 Not Arabic, returning original text:', text);
        return text;
    }

    // Check cache first
    const cacheKey = `free_${text}_${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
        console.log('📦 Using cached free translation:', text, '→', translationCache.get(cacheKey));
        return translationCache.get(cacheKey)!;
    }

    try {
        console.log('🌐 Trying free translation services...');

        // Try LibreTranslate first (completely free)
        try {
            const libreResult = await translateWithLibreTranslate(text, 'ar');
            if (libreResult && libreResult !== text) {
                translationCache.set(cacheKey, libreResult);
                console.log('✅ LibreTranslate result:', text, '→', libreResult);
                return libreResult;
            }
        } catch (libreError) {
            console.log('⚠️ LibreTranslate failed, trying MyMemory...');
        }

        // Try MyMemory as backup (1,000 requests/day free)
        try {
            const myMemoryResult = await translateWithMyMemory(text, 'ar');
            if (myMemoryResult && myMemoryResult !== text) {
                translationCache.set(cacheKey, myMemoryResult);
                console.log('✅ MyMemory result:', text, '→', myMemoryResult);
                return myMemoryResult;
            }
        } catch (myMemoryError) {
            console.log('⚠️ MyMemory also failed');
        }

        // If all free services fail, return original text
        console.log('⚠️ All free translation services failed, returning original:', text);
        return text;

    } catch (error) {
        console.error('❌ Free translation error:', error);
        return text; // Fallback to original text
    }
};

/**
 * Free auto-translation for appointment data
 * @param appointmentData - Appointment data to translate
 * @param currentLanguage - Current language
 * @returns Promise with translated appointment data
 */
export const freeAutoTranslateAppointmentData = async (
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

    console.log('🚀 Free auto-translating appointment data...');

    try {
        // Try free translation services first
        const [translatedClinicName, translatedDoctorName, translatedSpecialty, translatedDay] = await Promise.all([
            appointmentData.clinicName ? freeAutoTranslateText(appointmentData.clinicName, currentLanguage) : Promise.resolve(''),
            appointmentData.doctorName ? freeAutoTranslateText(appointmentData.doctorName, currentLanguage) : Promise.resolve(''),
            appointmentData.specialty ? freeAutoTranslateText(appointmentData.specialty, currentLanguage) : Promise.resolve(''),
            appointmentData.appointmentDay ? freeAutoTranslateText(appointmentData.appointmentDay, currentLanguage) : Promise.resolve('')
        ]);

        const result = {
            clinicName: translatedClinicName,
            doctorName: translatedDoctorName,
            specialty: translatedSpecialty,
            appointmentDay: translatedDay,
            appointmentTime: appointmentData.appointmentTime || ''
        };

        console.log('✅ Free auto-translation complete:', result);
        return result;
    } catch (error) {
        console.error('❌ Free translation failed, using fallback:', error);

        // Use fallback translation when free services fail
        const fallbackResult = fallbackTranslateAppointmentData(appointmentData, currentLanguage);
        console.log('🔄 Fallback translation result:', fallbackResult);
        return fallbackResult;
    }
};

/**
 * Clear free translation cache
 */
export const clearFreeTranslationCache = () => {
    translationCache.clear();
    console.log('🗑️ Free translation cache cleared');
};
