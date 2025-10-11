// lib/translationTestUtils.ts - Test utilities for translation system
import { translateAppointmentData, translateDoctorName, getMedicalTermTranslation } from './translationUtils';

// Mock translation function for testing
const mockT = (key: string, options?: { defaultValue?: any }) => {
    const translations: Record<string, string> = {
        'payment.dentist': 'طبيب أسنان',
        'payment.dentistSpecialty': 'طب الأسنان',
        'payment.cardiology': 'أمراض القلب',
        'payment.pediatrics': 'طب الأطفال',
        'payment.monday': 'الاثنين',
        'payment.tuesday': 'الثلاثاء',
        'payment.bisharaBabish': 'بشارة بابيش',
        'payment.ahmedMohammed': 'أحمد محمد',
        'payment.issaHandal': 'عيسى حندل',
        'payment.bethlehemMedCenter': 'مركز بيت لحم الطبي',
    };

    return translations[key] || options?.defaultValue || key;
};

/**
 * Test the translation system with sample data
 */
export const testTranslationSystem = () => {
    console.log('🧪 Testing Translation System...\n');

    // Test 1: Specialty Translation
    console.log('1. Testing Specialty Translation:');
    console.log('   English: "Cardiology" → Arabic:', getMedicalTermTranslation('Cardiology', mockT, 'ar'));
    console.log('   English: "Dentistry" → Arabic:', getMedicalTermTranslation('Dentistry', mockT, 'ar'));
    console.log('   English: "Pediatrics" → Arabic:', getMedicalTermTranslation('Pediatrics', mockT, 'ar'));
    console.log('   English: "Emergency Medicine" → Arabic:', getMedicalTermTranslation('Emergency Medicine', mockT, 'ar'));
    console.log();

    // Test 2: Doctor Name Translation
    console.log('2. Testing Doctor Name Translation:');
    console.log('   English: "Dr. Ahmed Mohammed" → Arabic:', translateDoctorName('Dr. Ahmed Mohammed', mockT, 'ar'));
    console.log('   English: "Bishara Babish" → Arabic:', translateDoctorName('Bishara Babish', mockT, 'ar'));
    console.log('   English: "issa handal" → Arabic:', translateDoctorName('issa handal', mockT, 'ar'));
    console.log('   English: "Dr. John Smith" → Arabic:', translateDoctorName('Dr. John Smith', mockT, 'ar'));
    console.log('   English: "Mary Johnson" → Arabic:', translateDoctorName('Mary Johnson', mockT, 'ar'));
    console.log();

    // Test 3: Day Translation
    console.log('3. Testing Day Translation:');
    console.log('   English: "Monday" → Arabic:', getMedicalTermTranslation('Monday', mockT, 'ar'));
    console.log('   English: "Tuesday" → Arabic:', getMedicalTermTranslation('Tuesday', mockT, 'ar'));
    console.log();

    // Test 4: Complete Appointment Data Translation
    console.log('4. Testing Complete Appointment Translation:');
    const appointmentData = {
        clinicName: 'Bethlehem Med Center',
        clinicNameAr: 'مركز بيت لحم الطبي',
        doctorName: 'issa handal',
        doctorNameAr: 'عيسى حندل',
        specialty: 'Dentist',
        specialtyAr: 'طبيب أسنان',
        appointmentDay: 'Monday',
        appointmentTime: '08:00-20:00'
    };

    const translatedEn = translateAppointmentData(appointmentData, mockT, 'en');
    const translatedAr = translateAppointmentData(appointmentData, mockT, 'ar');

    console.log('   English Version:');
    console.log('     Clinic:', translatedEn.clinicName);
    console.log('     Doctor:', translatedEn.doctorName);
    console.log('     Specialty:', translatedEn.specialty);
    console.log('     Day:', translatedEn.appointmentDay);
    console.log();

    console.log('   Arabic Version:');
    console.log('     Clinic:', translatedAr.clinicName);
    console.log('     Doctor:', translatedAr.doctorName);
    console.log('     Specialty:', translatedAr.specialty);
    console.log('     Day:', translatedAr.appointmentDay);
    console.log();

    console.log('✅ Translation system test completed!');
};

// Export for use in development/testing
export default testTranslationSystem;
