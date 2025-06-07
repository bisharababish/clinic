// pages/admin/PatientHealthManagement.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { usePatientHealth, PatientWithHealthData } from "@/hooks/usePatientHealth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    RefreshCw,
    Loader2,
    FileText,
    Database,
    Mail,
    Phone,
    Calendar,
    Heart,
    Pill
} from 'lucide-react';

const PatientHealthManagement: React.FC = () => {
    const { getAllPatientHealthData, isLoading } = usePatientHealth();
    const [records, setRecords] = useState<PatientWithHealthData[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PatientWithHealthData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        fetchAllRecords();
    }, []);

    useEffect(() => {
        // Filter records based on search term
        if (searchTerm.trim() === '') {
            setFilteredRecords(records);
        } else {
            const filtered = records.filter(record =>
                record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patient_id_number?.includes(searchTerm)
            );
            setFilteredRecords(filtered);
        }
    }, [searchTerm, records]);
    useEffect(() => { console.log('Component mounted, current language:', i18n.language); console.log('Available languages:', i18n.languages); console.log('Translation test:', t('patientHealth.failedToLoad')); }, [i18n.language, t]);
    // Fixed section from PatientHealthManagement.tsx - around line 85-95

    const fetchAllRecords = async () => {
        try {
            const data = await getAllPatientHealthData();
            setRecords(data);
            setFilteredRecords(data);
        } catch (error) {
            console.error('Error fetching patient records:', error);

            toast({
                title: t('common.error'),
                description: t('patientHealth.failedToLoad'),
                variant: "destructive",
            });
        }
    };
    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
            case 'secretary': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'patient': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const calculateDiseaseCount = (record: PatientWithHealthData) => {
        return [
            record.has_high_blood_pressure,
            record.has_diabetes,
            record.has_cholesterol_hdl,
            record.has_cholesterol_ldl,
            record.has_kidney_disease,
            record.has_cancer,
            record.has_heart_disease,
            record.has_asthma,
            record.has_alzheimer_dementia
        ].filter(Boolean).length;
    };

    const calculateMedicationCount = (record: PatientWithHealthData) => {
        if (!record.medications) return 0;
        return Object.values(record.medications).flat().length;
    };

    if (isLoading) {
        return (
            <div
                className="flex items-center justify-center py-8"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span className="text-gray-600">{t('patientHealth.loadingRecords')}</span>
            </div>
        );
    }

    return (
        <div
            className={`${isRTL ? 'rtl' : 'ltr'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
            <Card>

                <CardHeader>
                    <CardTitle
                        className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
                        style={{
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr',
                            width: '100%'
                        }}
                    >
                        <Database className="h-5 w-5" />
                        {t('patientHealth.title')}
                    </CardTitle>

                    {/* Record count below title */}
                    <div
                        className="text-sm text-gray-600 font-medium"
                        style={{
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr'
                        }}
                    >
                        {filteredRecords.length} {filteredRecords.length === 1 ? t('patientHealth.record') : t('patientHealth.records')}
                        {searchTerm && ` (${t('patientHealth.filtered')})`}
                    </div>

                    {/* Search and refresh section */}
                    <div
                        className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
                        style={{
                            direction: isRTL ? 'rtl' : 'ltr',
                            width: '100%'
                        }}
                    >
                        <div className="relative flex-1 max-w-sm">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                            <Input
                                placeholder={t('patientHealth.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            />
                        </div>
                        <Button onClick={fetchAllRecords} variant="outline" size="sm">
                            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('patientHealth.refresh')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div
                                    className="bg-blue-50 p-4 rounded-lg"
                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                >
                                    <h3 className="text-sm font-medium text-blue-800">
                                        {t('patientHealth.totalRecords')}
                                    </h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {filteredRecords.length}
                                    </p>
                                </div>
                                <div
                                    className="bg-green-50 p-4 rounded-lg"
                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                >
                                    <h3 className="text-sm font-medium text-green-800">
                                        {t('patientHealth.recentUpdates')}
                                    </h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {filteredRecords.filter(r =>
                                            new Date(r.updated_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                                        ).length}
                                    </p>
                                </div>
                                <div
                                    className="bg-orange-50 p-4 rounded-lg"
                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                >
                                    <h3 className="text-sm font-medium text-orange-800">
                                        {t('patientHealth.withConditions')}
                                    </h3>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {filteredRecords.filter(r => calculateDiseaseCount(r) > 0).length}
                                    </p>
                                </div>
                                <div
                                    className="bg-purple-50 p-4 rounded-lg"
                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                >
                                    <h3 className="text-sm font-medium text-purple-800">
                                        {t('patientHealth.onMedications')}
                                    </h3>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {filteredRecords.filter(r => calculateMedicationCount(r) > 0).length}
                                    </p>
                                </div>
                            </div>

                            {/* Records Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                >
                                                    {t('patientHealth.patientInfo')}
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                >
                                                    {t('patientHealth.healthSummary')}
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                >
                                                    {t('patientHealth.createdBy')}
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                >
                                                    {t('patientHealth.lastUpdatedBy')}
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                >
                                                    {t('patientHealth.dates')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div
                                                            className="space-y-1"
                                                            style={{
                                                                direction: isRTL ? 'rtl' : 'ltr',
                                                                textAlign: isRTL ? 'right' : 'left'
                                                            }}
                                                        >
                                                            <div className="font-medium text-gray-900">
                                                                {record.patient_name || t('patientHealth.unknownPatient')}
                                                            </div>
                                                            <div className={`text-sm text-gray-500 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Mail className="h-3 w-3" />
                                                                {record.patient_email || t('patientHealth.noEmail')}
                                                            </div>
                                                            <div className={`text-sm text-gray-500 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Phone className="h-3 w-3" />
                                                                {record.patient_phone || t('patientHealth.noPhone')}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                ID: {record.patient_id}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div
                                                            className="space-y-2"
                                                            style={{
                                                                direction: isRTL ? 'rtl' : 'ltr',
                                                                textAlign: isRTL ? 'right' : 'left'
                                                            }}
                                                        >
                                                            {/* BMI */}
                                                            {record.weight_kg && record.height_cm && (
                                                                <div className="text-sm">
                                                                    <span className="font-medium">BMI:</span> {
                                                                        ((record.weight_kg / Math.pow(record.height_cm / 100, 2))).toFixed(1)
                                                                    }
                                                                </div>
                                                            )}

                                                            {/* Blood Type */}
                                                            <div className="text-sm">
                                                                <span className="font-medium">{t('patientHealth.bloodType')}:</span> {record.blood_type || t('patientHealth.notSet')}
                                                            </div>

                                                            {/* Conditions and Medications */}
                                                            <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                                    {calculateDiseaseCount(record)} {t('patientHealth.conditions')}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Pill className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                                    {calculateMedicationCount(record)} {t('patientHealth.medications')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {record.created_by_name ? (
                                                            <div
                                                                className="space-y-1"
                                                                style={{
                                                                    direction: isRTL ? 'rtl' : 'ltr',
                                                                    textAlign: isRTL ? 'right' : 'left'
                                                                }}
                                                            >
                                                                <div className="font-medium text-sm text-gray-900">
                                                                    {record.created_by_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {record.created_by_email}
                                                                </div>
                                                                <Badge className={`text-xs ${getRoleColor(record.created_by_role)}`}>
                                                                    {record.created_by_role || t('roles.patient')}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className="text-gray-400 text-sm"
                                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                            >
                                                                {t('patientHealth.unknown')}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {record.updated_by_name ? (
                                                            <div
                                                                className="space-y-1"
                                                                style={{
                                                                    direction: isRTL ? 'rtl' : 'ltr',
                                                                    textAlign: isRTL ? 'right' : 'left'
                                                                }}
                                                            >
                                                                <div className="font-medium text-sm text-gray-900">
                                                                    {record.updated_by_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {record.updated_by_email}
                                                                </div>
                                                                <Badge className={`text-xs ${getRoleColor(record.updated_by_role)}`}>
                                                                    {record.updated_by_role || t('roles.patient')}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className="text-gray-400 text-sm"
                                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                                            >
                                                                {t('patientHealth.unknown')}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div
                                                            className="space-y-1 text-xs text-gray-500"
                                                            style={{
                                                                direction: isRTL ? 'rtl' : 'ltr',
                                                                textAlign: isRTL ? 'right' : 'left'
                                                            }}
                                                        >
                                                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="font-medium">{t('patientHealth.created')}:</span>
                                                            </div>
                                                            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                                                                {new Date(record.created_at || '').toLocaleDateString()}
                                                            </div>
                                                            <div className={`flex items-center gap-1 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="font-medium">{t('patientHealth.updated')}:</span>
                                                            </div>
                                                            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                                                                {new Date(record.updated_at || '').toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {filteredRecords.length === 0 && (
                                <div
                                    className="text-center py-12"
                                    style={{
                                        direction: isRTL ? 'rtl' : 'ltr',
                                        textAlign: isRTL ? 'center' : 'center' // Keep center for empty state
                                    }}
                                >
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3
                                        className="text-lg font-medium text-gray-900 mb-2"
                                        style={{ textAlign: isRTL ? 'center' : 'center' }}
                                    >
                                        {t('patientHealth.noRecordsFound')}
                                    </h3>
                                    <p
                                        className="text-gray-500"
                                        style={{ textAlign: isRTL ? 'center' : 'center' }}
                                    >
                                        {searchTerm ? t('patientHealth.noRecordsFoundSearch') : t('patientHealth.noRecordsCreated')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientHealthManagement;