// hooks/usePatientHealth.ts - Complete version with user tracking
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface PatientHealthData {
    id?: number;
    patient_id: number | string;
    weight_kg?: number;
    height_cm?: number;
    blood_type?: string;
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

    // User tracking fields
    created_by_user_id?: number | string;
    created_by_email?: string;
    created_by_name?: string;
    created_by_role?: string;
    updated_by_user_id?: number | string;
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
    const getPatientHealthData = useCallback(async (patientId: number | string): Promise<PatientHealthData | null> => {
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
                .eq('patient_id', patientId.toString())
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

    // Save or update patient health data
    const savePatientHealthData = useCallback(async (data: Omit<PatientHealthData, 'id' | 'created_at' | 'updated_at' | 'created_by_user_id' | 'created_by_email' | 'created_by_name' | 'created_by_role' | 'updated_by_user_id' | 'updated_by_email' | 'updated_by_name' | 'updated_by_role'>): Promise<boolean> => {
        console.log('💾 Saving health data:', data);
        setIsSaving(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('User not authenticated');
            }

            // The trigger will automatically populate user tracking fields
            const { error } = await supabase
                .from('patient_health_info')
                .upsert({
                    ...data,
                    patient_id: data.patient_id.toString(),
                }, {
                    onConflict: 'patient_id',
                });

            if (error) {
                console.error('❌ Save error:', error);
                throw error;
            }

            console.log('✅ Health data saved successfully');

            toast({
                title: "Success",
                description: "Health information saved successfully",
            });

            return true;
        } catch (error: unknown) {
            console.error('❌ Error saving patient health data:', error);
            toast({
                title: "Error",
                description: `Failed to save health information: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
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
            const { data, error } = await supabase
                .from('patient_health_info')
                .select(`
                    *,
                    userinfo!patient_id (
                        user_email,
                        english_username_a,
                        english_username_b,
                        english_username_c,
                        english_username_d,
                        user_phone,
                        user_id_number
                    )
                `)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('❌ Database error:', error);
                throw error;
            }

            // Process the data to include patient info
            const processedRecords: PatientWithHealthData[] = data?.map(record => {
                const patientInfo = record.userinfo;
                const patientName = patientInfo ?
                    `${patientInfo.english_username_a || ''} ${patientInfo.english_username_b || ''} ${patientInfo.english_username_c || ''} ${patientInfo.english_username_d || ''}`.trim() :
                    'Unknown Patient';

                return {
                    ...record,
                    patient_name: patientName,
                    patient_email: patientInfo?.user_email || 'Unknown',
                    patient_phone: patientInfo?.user_phone || 'Unknown',
                    patient_id_number: patientInfo?.user_id_number || 'Unknown',
                };
            }) || [];

            console.log('✅ All patient records fetched successfully:', processedRecords.length);
            return processedRecords;

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
    const deletePatientHealthData = useCallback(async (patientId: number | string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('patient_health_info')
                .delete()
                .eq('patient_id', patientId.toString());

            if (error) {
                throw error;
            }

            toast({
                title: "Success",
                description: "Health information deleted successfully",
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