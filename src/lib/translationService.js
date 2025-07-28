// lib/translationService.js
export const translateToArabic = async (text) => {
    if (!text || text.trim() === '') return '';

    console.log('🔄 Translating:', text);
    console.log('🔑 API Key exists:', !!import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY);

    try {
        const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: 'ar',
                    source: 'en',
                    format: 'text'
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        const translation = data.data.translations[0].translatedText;

        console.log('✅ Translation result:', translation);
        return translation;
    } catch (error) {
        console.error('❌ Translation error:', error);
        return text; // Fallback to original text
    }
};