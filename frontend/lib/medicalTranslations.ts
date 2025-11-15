// utils/medicalTranslations.ts

// Medical category translations dictionary
export const medicalTranslations: Record<string, { en: string; ar: string }> = {
    // Common medical specialties
    pediatrics: { en: "Pediatrics", ar: "طب الأطفال" },
    cardiology: { en: "Cardiology", ar: "طب القلب" },
    dermatology: { en: "Dermatology", ar: "الأمراض الجلدية" },
    neurology: { en: "Neurology", ar: "طب الأعصاب" },
    orthopedics: { en: "Orthopedics", ar: "طب العظام" },
    psychiatry: { en: "Psychiatry", ar: "الطب النفسي" },
    gynecology: { en: "Gynecology", ar: "طب النساء و الولادة" },
    urology: { en: "Urology", ar: "المسالك البولية" },
    ophthalmology: { en: "Ophthalmology", ar: "طب العيون" },
    dentistry: { en: "Dentistry", ar: "طب الانف والاذن والحنجرة" },
    ent: { en: "ENT", ar: "طب الانف والاذن والحنجرة" },
    radiology: { en: "Radiology", ar: " طب الأشعة" },
    anesthesiology: { en: "Anesthesiology", ar: "التخدير" },
    surgery: { en: "Surgery", ar: "الجراحة" },
    emergency: { en: "Emergency Medicine", ar: "طب الطوارئ" },
    family: { en: "Family Medicine", ar: "طب الأسرة" },
    internal: { en: "Internal Medicine", ar: "الطب الباطني" },
    oncology: { en: "Oncology", ar: "علاج الأورام" },
    endocrinology: { en: "Endocrinology", ar: "الغدد الصماء" },
    pulmonology: { en: "Pulmonology", ar: "أمراض الرئة" },
    gastroenterology: { en: "Gastroenterology", ar: "أمراض الجهاز الهضمي" },
    nephrology: { en: "Nephrology", ar: "أمراض الكلى" },
    rheumatology: { en: "Rheumatology", ar: "أمراض الروماتيزم" },
    hematology: { en: "Hematology", ar: "أمراض الدم" },
    immunology: { en: "Immunology", ar: "المناعة" },
    pathology: { en: "Pathology", ar: "علم الأمراض" },
    pharmacology: { en: "Pharmacology", ar: "علم الأدوية" },
    physiotherapy: { en: "Physiotherapy", ar: "العلاج الطبيعي" },
    laboratory: { en: "Laboratory", ar: "المختبر" },

    // Additional medical terms
    clinic: { en: "Clinic", ar: "عيادة" },
    hospital: { en: "Hospital", ar: "مستشفى" },
    medical: { en: "Medical Center", ar: "المركز الطبي" },
    specialized: { en: "Specialized", ar: "متخصص" },
    general: { en: "General", ar: "طب عام" },
    private: { en: "Private", ar: " خاص" },
    public: { en: "Public", ar: "عام" },
};

/**
 * Automatically translate medical category names
 * @param input - The input category name in English
 * @param targetLanguage - Target language ('en' or 'ar')
 * @returns Translated category name or original if no translation found
 */
export const translateMedicalCategory = (input: string, targetLanguage: 'en' | 'ar'): string => {
    if (!input) return input;

    // Normalize input (lowercase, trim)
    const normalizedInput = input.toLowerCase().trim();

    // Check for exact matches first
    const exactMatch = medicalTranslations[normalizedInput];
    if (exactMatch) {
        return exactMatch[targetLanguage];
    }

    // Check for partial matches (useful for compound terms)
    for (const [key, translation] of Object.entries(medicalTranslations)) {
        if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
            return translation[targetLanguage];
        }
    }

    // If no translation found, return original input
    return input;
};

/**
 * Create bilingual category name object
 * @param englishName - Category name in English
 * @returns Object with both English and Arabic names
 */
export const createBilingualCategoryName = (englishName: string) => {
    const arabicName = translateMedicalCategory(englishName, 'ar');

    return {
        en: englishName,
        ar: arabicName !== englishName ? arabicName : englishName, // Keep original if no translation
        original: englishName
    };
};

/**
 * Get category name based on current language
 * @param categoryData - Object containing en/ar translations
 * @param currentLanguage - Current UI language
 * @returns Appropriate category name for current language
 */
export const getCategoryDisplayName = (
    categoryData: { en?: string; ar?: string; name?: string },
    currentLanguage: string
): string => {
    if (currentLanguage === 'ar' && categoryData.ar) {
        return categoryData.ar;
    }

    if (currentLanguage === 'en' && categoryData.en) {
        return categoryData.en;
    }

    // Fallback to name field or English version
    return categoryData.name || categoryData.en || categoryData.ar || '';
};

/**
 * Auto-suggest medical categories based on partial input
 * @param input - Partial category name
 * @param language - Current language for suggestions
 * @returns Array of suggested category names
 */
export const suggestMedicalCategories = (input: string, language: 'en' | 'ar' = 'en'): string[] => {
    if (!input || input.length < 2) return [];

    const normalizedInput = input.toLowerCase().trim();
    const suggestions: string[] = [];

    Object.values(medicalTranslations).forEach(translation => {
        const targetText = translation[language].toLowerCase();
        if (targetText.includes(normalizedInput)) {
            suggestions.push(translation[language]);
        }
    });

    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5);
};

/**
 * Validate if a category name is a known medical term
 * @param categoryName - Category name to validate
 * @returns boolean indicating if it's a recognized medical term
 */
export const isKnownMedicalTerm = (categoryName: string): boolean => {
    const normalized = categoryName.toLowerCase().trim();

    // Check exact matches
    if (medicalTranslations[normalized]) return true;

    // Check if any known term is contained in the input
    return Object.keys(medicalTranslations).some(key =>
        normalized.includes(key) || key.includes(normalized)
    );
};
