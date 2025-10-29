// hooks/usePatientHealth.ts - Fixed version with correct data types and patient self-save capability
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './use-toast';

export interface PatientHealthData {
    id?: number;
    patient_id: number;
    weight_kg?: number;
    height_cm?: number;
    blood_type?: string;
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    has_high_blood_pressure: boolean;
    has_diabetes: boolean;
    has_cholesterol_hdl: boolean;
    has_cholesterol_ldl: boolean;
    has_kidney_disease: boolean;
    has_cancer: boolean;
    has_heart_disease: boolean;
    has_asthma: boolean;
    has_alzheimer_dementia: boolean;
    medications: {
        pain_relief: string[];
        allergy: string[];
        flu: string[];
        antibiotics: string[];
    };
    allergies?: string[];
    social_situation?: 'married' | 'single';

    // User tracking fields
    created_by_user_id?: number;
    created_by_email?: string;
    created_by_name?: string;
    created_by_role?: string;
    updated_by_user_id?: number;
    updated_by_email?: string;
    updated_by_name?: string;
    updated_by_role?: string;

    created_at?: string;
    updated_at?: string;
}

export interface PatientWithHealthData extends PatientHealthData {
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    patient_id_number?: string;
}

export const usePatientHealth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Get patient health data with user tracking
    const getPatientHealthData = useCallback(async (patientId: number): Promise<PatientHealthData | null> => {
        console.log('🔍 Fetching health data for patient ID:', patientId);
        setIsLoading(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('❌ Authentication error:', authError);
                throw new Error('User not authenticated');
            }

            console.log('✅ User authenticated:', user.email);

            const { data, error } = await supabase
                .from('patient_health_info')
                .select(`
                    *,
                    created_by_user_id,
                    created_by_email,
                    created_by_name,
                    created_by_role,
                    updated_by_user_id,
                    updated_by_email,
                    updated_by_name,
                    updated_by_role
                `)
                .eq('patient_id', patientId)
                .maybeSingle();

            console.log('📊 Supabase response:', { data, error });

            if (error) {
                console.error('❌ Database error:', error);
                throw error;
            }

            if (!data) {
                console.log('ℹ️ No health data found for patient - this is normal for new patients');
                return null;
            }

            console.log('✅ Health data fetched successfully with user tracking:', data);
            return data;

        } catch (error: unknown) {
            console.error('❌ Error fetching patient health data:', error);

            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage !== 'No data found') {
                toast({
                    title: "Error",
                    description: `Failed to load health information: ${errorMessage}`,
                    variant: "destructive",
                });
            }

            return null;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // FIXED: Save or update patient health data - now works for both patients and staff
    const savePatientHealthData = useCallback(async (data: Omit<PatientHealthData, 'id' | 'created_at' | 'updated_at' | 'created_by_user_id' | 'created_by_email' | 'created_by_name' | 'created_by_role' | 'updated_by_user_id' | 'updated_by_email' | 'updated_by_name' | 'updated_by_role'>): Promise<boolean> => {
        console.log('💾 Saving health data:', data);
        setIsSaving(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('User not authenticated');
            }

            // Get current user info from userinfo table
            const { data: currentUserData, error: userError } = await supabase
                .from('userinfo')
                .select('userid, user_email, english_username_a, user_roles')
                .eq('user_email', user.email)
                .single();

            if (userError || !currentUserData) {
                console.error('❌ Error getting user data:', userError);
                throw new Error('Failed to get user information');
            }

            console.log('👤 Current user data:', currentUserData);

            // Check if this is an existing record
            const { data: existingRecord } = await supabase
                .from('patient_health_info')
                .select('id')
                .eq('patient_id', data.patient_id)
                .maybeSingle();

            const isUpdate = !!existingRecord;
            console.log('🔄 Is update operation:', isUpdate);

            // Prepare data for database with explicit user tracking
            const dbData = {
                ...data,
                patient_id: data.patient_id,
                // For new records, set both created and updated fields
                ...(isUpdate ? {} : {
                    created_by_user_id: currentUserData.userid,
                    created_by_email: currentUserData.user_email,
                    created_by_name: currentUserData.english_username_a,
                    created_by_role: currentUserData.user_roles,
                }),
                // Always set updated fields
                updated_by_user_id: currentUserData.userid,
                updated_by_email: currentUserData.user_email,
                updated_by_name: currentUserData.english_username_a,
                updated_by_role: currentUserData.user_roles,
                updated_at: new Date().toISOString(),
            };

            console.log('📤 Data being sent to database:', dbData);

            const { error, data: savedData } = await supabase
                .from('patient_health_info')
                .upsert(dbData, {
                    onConflict: 'patient_id',
                })
                .select();

            if (error) {
                console.error('❌ Save error:', error);
                throw error;
            }

            console.log('✅ Health data saved successfully:', savedData);

            // Locale-aware toast (English/Arabic)
            const isArabic = (typeof window !== 'undefined' && (localStorage.getItem('i18nextLng') || '').startsWith('ar'));
            toast({
                title: isArabic ? 'نجاح' : 'Success',
                description: isArabic ? 'تم حفظ المعلومات الصحية بنجاح' : 'Health information saved successfully',
                style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
            });

            return true;
        } catch (error: unknown) {
            console.error('❌ Error saving patient health data:', error);

            let errorMessage = 'Unknown error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage = String(error.message);
            }

            {
                const isArabic = (typeof window !== 'undefined' && (localStorage.getItem('i18nextLng') || '').startsWith('ar'));
                toast({
                    title: isArabic ? 'خطأ' : 'Error',
                    description: isArabic ? `فشل حفظ المعلومات الصحية: ${errorMessage}` : `Failed to save health information: ${errorMessage}`,
                    variant: "destructive",
                    style: { backgroundColor: '#dc2626', color: '#fff' }, // Red bg, white text
                });
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Get all patient health records (for admin/doctor view)
    const getAllPatientHealthData = useCallback(async (): Promise<PatientWithHealthData[]> => {
        console.log('🔍 Fetching all patient health records...');
        setIsLoading(true);

        try {
            // First, get all health records with user tracking info
            const { data: healthRecords, error: healthError } = await supabase
                .from('patient_health_info')
                .select(`
                    *,
                    created_by_user_id,
                    created_by_email,
                    created_by_name,
                    created_by_role,
                    updated_by_user_id,
                    updated_by_email,
                    updated_by_name,
                    updated_by_role
                `)
                .order('updated_at', { ascending: false });

            if (healthError) {
                console.error('❌ Database error fetching health records:', healthError);
                throw healthError;
            }

            if (!healthRecords || healthRecords.length === 0) {
                console.log('ℹ️ No health records found');
                return [];
            }

            // Get patient IDs from health records
            const patientIds = healthRecords.map(record => record.patient_id);

            // Fetch patient info for these IDs
            const { data: patientInfo, error: patientError } = await supabase
                .from('userinfo')
                .select('userid, user_email, english_username_a, english_username_b, english_username_c, english_username_d, user_phonenumber, id_number')
                .in('userid', patientIds);

            if (patientError) {
                console.error('❌ Database error fetching patient info:', patientError);
                // Continue with health records even if patient info fails
            }

            // Combine health records with patient info
            const combinedRecords: PatientWithHealthData[] = healthRecords.map(record => {
                const patient = patientInfo?.find(p => p.userid === record.patient_id);

                const patientName = patient ?
                    `${patient.english_username_a || ''} ${patient.english_username_b || ''} ${patient.english_username_c || ''} ${patient.english_username_d || ''}`.trim() :
                    'Unknown Patient';

                return {
                    ...record,
                    patient_name: patientName,
                    patient_email: patient?.user_email || 'Unknown',
                    patient_phone: patient?.user_phonenumber || 'Unknown',
                    patient_id_number: patient?.id_number || 'Unknown',
                };
            });

            console.log('✅ All patient records fetched successfully:', combinedRecords.length);
            return combinedRecords;

        } catch (error: unknown) {
            console.error('❌ Error fetching all patient health data:', error);
            toast({
                title: "Error",
                description: `Failed to load patient records: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Delete patient health data
    const deletePatientHealthData = useCallback(async (patientId: number): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('patient_health_info')
                .delete()
                .eq('patient_id', patientId);

            if (error) {
                throw error;
            }

            toast({
                title: "Success",
                description: "Health information deleted successfully",
                style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
            });

            return true;
        } catch (error: unknown) {
            console.error('Error deleting patient health data:', error);
            toast({
                title: "Error",
                description: `Failed to delete health information: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
            return false;
        }
    }, [toast]);

    // Calculate health statistics
    const calculateHealthStats = useCallback((data: PatientHealthData) => {
        const stats: { bmi?: number; bmiCategory?: string; riskFactors: string[] } = {
            riskFactors: []
        };

        // Calculate BMI
        if (data.weight_kg && data.height_cm) {
            const heightInMeters = data.height_cm / 100;
            stats.bmi = Number((data.weight_kg / (heightInMeters * heightInMeters)).toFixed(1));

            // BMI Categories
            if (stats.bmi < 18.5) {
                stats.bmiCategory = 'Underweight';
            } else if (stats.bmi >= 18.5 && stats.bmi < 25) {
                stats.bmiCategory = 'Normal weight';
            } else if (stats.bmi >= 25 && stats.bmi < 30) {
                stats.bmiCategory = 'Overweight';
            } else {
                stats.bmiCategory = 'Obese';
            }
        }

        // Identify risk factors
        if (data.has_high_blood_pressure) stats.riskFactors.push('High Blood Pressure');
        if (data.has_diabetes) stats.riskFactors.push('Diabetes');
        if (data.has_heart_disease) stats.riskFactors.push('Heart Disease');
        if (data.has_cholesterol_hdl || data.has_cholesterol_ldl) stats.riskFactors.push('Cholesterol Issues');
        if (data.has_kidney_disease) stats.riskFactors.push('Kidney Disease');
        if (data.has_cancer) stats.riskFactors.push('Cancer');
        if (data.has_asthma) stats.riskFactors.push('Asthma');
        if (data.has_alzheimer_dementia) stats.riskFactors.push('Alzheimer/Dementia');

        return stats;
    }, []);

    return {
        isLoading,
        isSaving,
        getPatientHealthData,
        savePatientHealthData,
        getAllPatientHealthData,
        deletePatientHealthData,
        calculateHealthStats,
    };
};
