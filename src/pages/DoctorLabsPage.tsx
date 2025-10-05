// DoctorLabsPage.tsx - Now with comprehensive skeleton loading
import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Calendar, User, Filter, Download, Eye, AlertCircle, File } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadService } from '../lib/fileUploadService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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
    attachments?: LabAttachment[];

}
interface LabAttachment {
    id: number;
    lab_result_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_by: number;
    created_at: string;
}
// Skeleton Loading Component for DoctorLabsPage
const DoctorLabsSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-40" />
                            </div>
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filters Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>

            {/* Results Table Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                                <th className="px-6 py-3">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-6 py-3">
                                    <Skeleton className="h-4 w-18" />
                                </th>
                                <th className="px-6 py-3">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-6 py-3">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(8)].map((_, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                            <div>
                                                <Skeleton className="h-4 w-32 mb-1" />
                                                <Skeleton className="h-3 w-20 mb-1" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-24" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-6 w-12 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

// Authentication Skeleton Loading
const AuthSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto" />
        </div>
    </div>
);

const DoctorLabsPage: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [initializing, setInitializing] = useState<boolean>(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resultToDelete, setResultToDelete] = useState<LabResult | null>(null);
    const isFetchingRef = useRef(false);

    // Fetch lab results from database
    const fetchLabResults = async () => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
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
            const resultsWithAttachments = await Promise.all(
                (data || []).map(async (result) => {
                    const attachments = await FileUploadService.getLabAttachments(result.id);
                    return { ...result, attachments };
                })
            );
            setLabResults(resultsWithAttachments);
        } catch (error) {
            console.error('Error fetching lab results:', error);
            setError('Failed to load lab results. Please try again.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };


    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const handleDownloadFile = async (attachment: LabAttachment) => {
        try {
            const downloadUrl = await FileUploadService.getFileUrl(attachment.file_path);

            // Fetch the file as blob to force download
            const response = await fetch(downloadUrl);
            const blob = await response.blob();

            // Create blob URL and download
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = attachment.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;


        const initializeComponent = async () => {
            if (!user) {
                if (isMounted) {
                    setInitializing(false);
                }
                return;
            }

            const userRole = user.role?.toLowerCase();
            if (userRole !== 'doctor' && userRole !== 'admin') {
                if (isMounted) {
                    setError('Access denied. Only doctors and administrators can view lab results.');
                    setInitializing(false);
                    setLoading(false);
                }
                return;
            }

            await fetchLabResults();
            if (isMounted) {
                setInitializing(false);
            }
        };

        initializeComponent();

        return () => {
            isMounted = false;
            isFetchingRef.current = false;
        };
    }, [user]);
    useEffect(() => {
        return () => {
            isFetchingRef.current = false;
        };
    }, []);
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
    const handleDeleteResult = (result: LabResult) => {
        setResultToDelete(result);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!resultToDelete) return;

        try {
            setLoading(true);
            setError(null);

            // Delete attachments first if they exist
            if (resultToDelete.attachments && resultToDelete.attachments.length > 0) {
                for (const attachment of resultToDelete.attachments) {
                    await FileUploadService.deleteFile(attachment.id, attachment.file_path);
                }
            }

            // Delete the lab result from database
            const { error: deleteError } = await supabase
                .from('lab_results')
                .delete()
                .eq('id', resultToDelete.id);

            if (deleteError) {
                throw deleteError;
            }

            // Remove from local state
            setLabResults(prev => prev.filter(r => r.id !== resultToDelete.id));

            // Close modal if this result was being viewed
            if (selectedTest?.id === resultToDelete.id) {
                setSelectedTest(null);
            }

            // Show success toast
            toast({
                title: isRTL ? 'تم الحذف بنجاح' : 'Deleted Successfully',
                description: isRTL
                    ? `تم حذف نتيجة الفحص لـ ${resultToDelete.patient_name}`
                    : `Lab result for ${resultToDelete.patient_name} has been deleted`,
                style: { backgroundColor: '#16a34a', color: '#fff' },
            });

        } catch (error) {
            console.error('Error deleting lab result:', error);

            // Show error toast
            toast({
                title: isRTL ? 'فشل الحذف' : 'Delete Failed',
                description: isRTL
                    ? 'فشل حذف نتيجة الفحص. يرجى المحاولة مرة أخرى.'
                    : 'Failed to delete lab result. Please try again.',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setResultToDelete(null);
        }
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



    // Show auth skeleton while checking user
    if (!user && initializing) {
        return <AuthSkeletonLoading isRTL={isRTL} />;
    }

    // Show skeleton loading while data is being fetched
    if (loading && initializing) {
        return <DoctorLabsSkeletonLoading isRTL={isRTL} />;
    }

    // Show error state if there's an error or access denied
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isRTL ? 'خطأ' : 'Error'}
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    {!error.includes('Access denied') && (
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {isRTL ? 'تحديث' : 'Refresh'}
                        </button>
                    )}
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
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {loading ? (isRTL ? 'جاري التحديث...' : 'Refreshing...') : (isRTL ? 'تحديث' : 'Refresh')}
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
                            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <input
                                type="text"
                                placeholder={isRTL ? 'البحث في المرضى أو الفحوصات...' : 'Search patients or tests...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                disabled={loading}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                        </div>
                        <div className="relative">
                            <Filter className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                disabled={loading}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <option value="">{isRTL ? 'جميع أنواع الفحوصات' : 'All Test Types'}</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {loading ?
                                    <Skeleton className="h-4 w-24" /> :
                                    `${filteredResults.length} ${isRTL ? 'نتيجة' : 'results found'}`
                                }
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
                                {loading ? (
                                    // Show skeleton rows while loading
                                    [...Array(6)].map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                                    <div>
                                                        <Skeleton className="h-4 w-32 mb-1" />
                                                        <Skeleton className="h-3 w-20 mb-1" />
                                                        <Skeleton className="h-3 w-40" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Skeleton className="h-4 w-24" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Skeleton className="h-4 w-20" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Skeleton className="h-6 w-12 rounded-full" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Show actual data
                                    filteredResults.map((result) => (
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
                                                    {isRTL ? new Date(result.test_date).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : new Date(result.test_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {result.blood_type || (isRTL ? 'غير محدد' : 'N/A')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(result)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 mr-4"
                                                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        {isRTL ? 'عرض' : 'View'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadReport(result)}
                                                        className="text-green-600 hover:text-green-900 flex items-center gap-1 mr-4"
                                                        title={isRTL ? 'تحميل التقرير' : 'Download Report'}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        {isRTL ? 'تحميل' : 'Download'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResult(result)}
                                                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                        title={isRTL ? 'حذف النتيجة' : 'Delete Result'}
                                                        disabled={loading}
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                        {isRTL ? 'حذف' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                                    <div
                                        className="text-sm text-gray-800 whitespace-pre-wrap"
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                        dangerouslySetInnerHTML={{ __html: selectedTest.test_results }}
                                    />
                                </div>
                            </div>

                            {selectedTest.doctor_notes && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {isRTL ? 'ملاحظات الطبيب' : 'Doctor\'s Notes'}
                                    </h3>
                                    <div className="bg-blue-50 p-4 rounded-md">
                                        <div
                                            className="text-sm text-gray-800"
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                            dangerouslySetInnerHTML={{ __html: selectedTest.doctor_notes }}
                                        />
                                    </div>
                                </div>
                            )}
                            {/* ADD YOUR ATTACHMENTS CODE RIGHT HERE */}
                            {selectedTest.attachments && selectedTest.attachments.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {isRTL ? 'المرفقات' : 'Attachments'}
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedTest.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <File className="w-4 h-4" />
                                                    <div>
                                                        <p className="text-sm font-medium">{attachment.file_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadFile(attachment)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
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
            {/* Delete Confirmation Dialog - ADD IT HERE */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isRTL
                                ? `هل أنت متأكد من حذف نتيجة الفحص لـ ${resultToDelete?.patient_name}؟ لا يمكن التراجع عن هذا الإجراء.`
                                : `Are you sure you want to delete the lab result for ${resultToDelete?.patient_name}? This action cannot be undone.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRTL ? 'حذف' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DoctorLabsPage;