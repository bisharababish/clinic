// DoctorLabsPage.tsx - Now with real database integration
import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Filter, Download, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

// Type definitions (updated to match your database)
interface LabResult {
    id: number;
    patient_id: number;
    patient_name: string;
    patient_email: string;
    date_of_birth: string;
    blood_type: string;
    test_date: string;
    test_type: string;
    test_results: string;
    doctor_notes: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

const DoctorLabsPage: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');

    // Fetch lab results from database
    const fetchLabResults = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('lab_results')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            console.log('Lab results fetched:', data?.length || 0);
            setLabResults(data || []);

        } catch (error) {
            console.error('Error fetching lab results:', error);
            setError('Failed to load lab results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize and fetch data
    useEffect(() => {
        // Check if user is authenticated and is a doctor
        if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
            setError('Access denied. Only doctors and administrators can view lab results.');
            return;
        }

        // Fetch lab results
        fetchLabResults();
    }, [user]);

    // Filter results based on search and filters
    const filteredResults: LabResult[] = labResults.filter(result => {
        const matchesSearch = result.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.patient_id.toString().includes(searchTerm) ||
            result.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.patient_email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = !filterDate || result.test_date.includes(filterDate);
        const matchesType = !filterType || result.test_type.toLowerCase().includes(filterType.toLowerCase());

        return matchesSearch && matchesDate && matchesType;
    });

    const handleViewDetails = (result: LabResult): void => {
        setSelectedTest(result);
    };

    const handleDownloadReport = (result: LabResult): void => {
        const reportContent = `
${isRTL ? 'تفاصيل الفحص المخبري' : 'Lab Test Details'}
================
${isRTL ? 'الاسم' : 'Name'}: ${result.patient_name}
${isRTL ? 'رقم المريض' : 'Patient ID'}: ${result.patient_id}
${isRTL ? 'البريد الإلكتروني' : 'Email'}: ${result.patient_email}
${isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}: ${result.date_of_birth || 'N/A'}
${isRTL ? 'فصيلة الدم' : 'Blood Type'}: ${result.blood_type || 'N/A'}
${isRTL ? 'تاريخ الفحص' : 'Test Date'}: ${new Date(result.test_date).toLocaleDateString()}
${isRTL ? 'نوع الفحص' : 'Test Type'}: ${result.test_type}

${isRTL ? 'نتائج الفحص' : 'Test Results'}:
${result.test_results}

${isRTL ? 'ملاحظات الطبيب' : 'Doctor\'s Notes'}:
${result.doctor_notes || 'No notes provided'}

${isRTL ? 'تاريخ الإنشاء' : 'Created At'}: ${new Date(result.created_at).toLocaleString()}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab_report_${result.patient_name}_${result.test_date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRefresh = (): void => {
        fetchLabResults();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {isRTL ? 'جاري تحميل نتائج المختبر...' : 'Loading lab results...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isRTL ? 'خطأ' : 'Error'}
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    {isRTL ? 'نتائج المختبر' : 'Lab Results'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {isRTL ? 'عرض وتحليل نتائج الفحوصات المخبرية للمرضى' : 'View and analyze patient laboratory test results'}
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {isRTL ? 'تحديث' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <input
                                type="text"
                                placeholder={isRTL ? 'البحث في المرضى أو الفحوصات...' : 'Search patients or tests...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <div className="relative">
                            <Filter className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="">{isRTL ? 'جميع أنواع الفحوصات' : 'All Test Types'}</option>
                                {/* <option value="blood">{isRTL ? 'فحوصات الدم' : 'Blood Tests'}</option>
                                <option value="urine">{isRTL ? 'فحوصات البول' : 'Urine Tests'}</option>
                                <option value="x-ray">{isRTL ? 'الأشعة السينية' : 'X-Ray'}</option>
                                <option value="mri">{isRTL ? 'الرنين المغناطيسي' : 'MRI'}</option> */}
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {filteredResults.length} {isRTL ? 'نتيجة' : 'results found'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? 'المريض' : 'Patient'}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? 'نوع الفحص' : 'Test Type'}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? 'تاريخ الفحص' : 'Test Date'}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? 'فصيلة الدم' : 'Blood Type'}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? 'الإجراءات' : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-8 w-8 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {result.patient_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {isRTL ? 'رقم:' : 'ID:'} {result.patient_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {result.patient_email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{result.test_type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(result.test_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {result.blood_type || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(result)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {isRTL ? 'عرض' : 'View'}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport(result)}
                                                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {isRTL ? 'تحميل' : 'Download'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredResults.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {isRTL ? 'لم يتم العثور على نتائج مختبر' : 'No lab results found'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            {isRTL ? 'قد تحتاج إلى إضافة بعض نتائج المختبر أولاً' : 'You may need to add some lab results first'}
                        </p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isRTL ? 'تفاصيل الفحص المخبري' : 'Lab Test Details'}
                                </h2>
                                <button
                                    onClick={() => setSelectedTest(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {isRTL ? 'معلومات المريض' : 'Patient Information'}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">{isRTL ? 'الاسم:' : 'Name:'}</span> {selectedTest.patient_name}</p>
                                        <p><span className="font-medium">{isRTL ? 'رقم المريض:' : 'Patient ID:'}</span> {selectedTest.patient_id}</p>
                                        <p><span className="font-medium">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span> {selectedTest.patient_email}</p>
                                        <p><span className="font-medium">{isRTL ? 'تاريخ الميلاد:' : 'Date of Birth:'}</span> {selectedTest.date_of_birth || 'N/A'}</p>
                                        <p><span className="font-medium">{isRTL ? 'فصيلة الدم:' : 'Blood Type:'}</span> {selectedTest.blood_type || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {isRTL ? 'معلومات الفحص' : 'Test Information'}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">{isRTL ? 'نوع الفحص:' : 'Test Type:'}</span> {selectedTest.test_type}</p>
                                        <p><span className="font-medium">{isRTL ? 'تاريخ الفحص:' : 'Test Date:'}</span> {new Date(selectedTest.test_date).toLocaleDateString()}</p>
                                        <p><span className="font-medium">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span> {new Date(selectedTest.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    {isRTL ? 'نتائج الفحص' : 'Test Results'}
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
                                        {selectedTest.test_results}
                                    </pre>
                                </div>
                            </div>

                            {selectedTest.doctor_notes && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {isRTL ? 'ملاحظات الطبيب' : 'Doctor\'s Notes'}
                                    </h3>
                                    <div className="bg-blue-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
                                            {selectedTest.doctor_notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => handleDownloadReport(selectedTest)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {isRTL ? 'تحميل التقرير' : 'Download Report'}
                            </button>
                            <button
                                onClick={() => setSelectedTest(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                {isRTL ? 'إغلاق' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLabsPage;