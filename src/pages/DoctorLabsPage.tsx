// DoctorLabsPage.tsx - Clean UI without mock data
import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Filter, Download, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Type definitions
interface LabResult {
    id: string;
    patientName: string;
    patientId: string;
    dateOfBirth: string;
    testDate: string;
    testType: string;
    results: string;
    doctorNotes: string;
    status: string;
    labTechnician: string;
    createdAt: string;
}

const DoctorLabsPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');

    // Initialize empty state
    useEffect(() => {
        // Check if user is authenticated and is a doctor
        if (!user || user.role !== 'doctor') {
            setError('Access denied. Only doctors can view lab results.');
            return;
        }

        // Set empty results (ready for database integration)
        setLabResults([]);
    }, [user]);

    // Filter results based on search and filters
    const filteredResults: LabResult[] = labResults.filter(result => {
        const matchesSearch = result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.patientId.includes(searchTerm) ||
            result.testType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !filterDate || result.testDate.includes(filterDate);
        const matchesType = !filterType || result.testType.toLowerCase().includes(filterType.toLowerCase());

        return matchesSearch && matchesDate && matchesType;
    });

    const handleViewDetails = (result: LabResult): void => {
        setSelectedTest(result);
    };

    const handleDownloadReport = (result: LabResult): void => {
        const reportContent = `
${t('doctorPages.labTestDetails') || 'Lab Test Details'}
================
${t('common.name') || 'Name'}: ${result.patientName}
${t('usersManagement.id') || 'ID'}: ${result.patientId}
${t('auth.dateOfBirth') || 'Date of Birth'}: ${result.dateOfBirth}
${t('labs.testDate') || 'Test Date'}: ${result.testDate}
${t('labs.testType') || 'Test Type'}: ${result.testType}

${t('doctorPages.testResults') || 'Test Results'}:
${result.results}

${t('doctorPages.doctorsNotes') || 'Doctor\'s Notes'}:
${result.doctorNotes}

${t('doctorPages.labTechnician') || 'Lab Technician'}: ${result.labTechnician}
${t('common.status') || 'Status'}: ${result.status}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab_report_${result.patientName}_${result.testDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRefresh = (): void => {
        // Ready for database refresh implementation
        setLoading(true);
        setTimeout(() => {
            setLabResults([]);
            setLoading(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('doctorPages.loadingLabResults') || 'Loading lab results...'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.error') || 'Error'}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {t('common.refresh') || 'Refresh'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    {t('doctorPages.labResults') || 'Lab Results'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {t('doctorPages.labResultsDesc') || 'View and analyze patient laboratory test results'}
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('common.refresh') || 'Refresh'}
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('doctorPages.searchPatientsTests') || 'Search patients or tests...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('doctorPages.allTestTypes') || 'All Test Types'}</option>
                                <option value="blood">{t('doctorPages.bloodTests') || 'Blood Tests'}</option>
                                <option value="urine">{t('doctorPages.urineTests') || 'Urine Tests'}</option>
                                <option value="lipid">{t('doctorPages.lipidProfile') || 'Lipid Profile'}</option>
                                <option value="diabetes">{t('doctorPages.diabetesPanel') || 'Diabetes Panel'}</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {filteredResults.length} {t('doctorPages.resultsFound') || 'results found'}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('appointmentsManagement.patient') || 'Patient'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('labs.testType') || 'Test Type'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('labs.testDate') || 'Test Date'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.status') || 'Status'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.actions') || 'Actions'}
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
                                                        {result.patientName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {t('usersManagement.id') || 'ID'}: {result.patientId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{result.testType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(result.testDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.status === 'Normal' || result.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : result.status === 'Abnormal'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {result.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(result)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {t('common.view') || 'View'}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport(result)}
                                                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {t('doctorPages.downloadReport') || 'Download'}
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
                        <p className="text-gray-500 text-lg">{t('doctorPages.noLabResultsFound') || 'No lab results found'}</p>
                        <p className="text-gray-400 text-sm mt-2">Connect your database to see patient lab results here</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">{t('doctorPages.labTestDetails') || 'Lab Test Details'}</h2>
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
                                    <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.patientInformation') || 'Patient Information'}</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">{t('common.name') || 'Name'}:</span> {selectedTest.patientName}</p>
                                        <p><span className="font-medium">{t('usersManagement.id') || 'ID'}:</span> {selectedTest.patientId}</p>
                                        <p><span className="font-medium">{t('auth.dateOfBirth') || 'Date of Birth'}:</span> {selectedTest.dateOfBirth}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.testInformation') || 'Test Information'}</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">{t('labs.testType') || 'Test Type'}:</span> {selectedTest.testType}</p>
                                        <p><span className="font-medium">{t('labs.testDate') || 'Test Date'}:</span> {new Date(selectedTest.testDate).toLocaleDateString()}</p>
                                        <p><span className="font-medium">{t('doctorPages.labTechnician') || 'Lab Technician'}:</span> {selectedTest.labTechnician}</p>
                                        <p><span className="font-medium">{t('common.status') || 'Status'}:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs rounded ${selectedTest.status === 'Normal' || selectedTest.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedTest.status === 'Abnormal'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {selectedTest.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.testResults') || 'Test Results'}</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {selectedTest.results}
                                    </pre>
                                </div>
                            </div>

                            {selectedTest.doctorNotes && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.doctorsNotes') || 'Doctor\'s Notes'}</h3>
                                    <div className="bg-blue-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-800">{selectedTest.doctorNotes}</p>
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
                                {t('doctorPages.downloadReport') || 'Download Report'}
                            </button>
                            <button
                                onClick={() => setSelectedTest(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                {t('appointmentsManagement.close') || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLabsPage;