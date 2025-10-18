// lib/testTranslation.ts - Test translation services
import { translateToArabic } from './translationService.js';
import { freeAutoTranslateText } from './freeTranslationService';

export const testGoogleTranslate = async () => {
    console.log('🧪 Testing Google Translate API...');

    try {
        const testText = 'judah issa';
        console.log('Testing translation of:', testText);

        const result = await translateToArabic(testText);
        console.log('✅ Google Translate result:', result);

        return result;
    } catch (error) {
        console.error('❌ Google Translate test failed:', error);
        return null;
    }
};

export const testFreeTranslation = async () => {
    console.log('🆓 Testing Free Translation Services...');

    try {
        const testText = 'judah issa';
        console.log('Testing free translation of:', testText);

        const result = await freeAutoTranslateText(testText, 'ar');
        console.log('✅ Free translation result:', result);

        return result;
    } catch (error) {
        console.error('❌ Free translation test failed:', error);
        return null;
    }
};

// Test functions that can be called from browser console
(window as { testGoogleTranslate?: typeof testGoogleTranslate; testFreeTranslation?: typeof testFreeTranslation }).testGoogleTranslate = testGoogleTranslate;
(window as { testGoogleTranslate?: typeof testGoogleTranslate; testFreeTranslation?: typeof testFreeTranslation }).testFreeTranslation = testFreeTranslation;
