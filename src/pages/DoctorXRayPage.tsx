// DoctorXRayPage.tsx - Clean UI without mock data
import React, { useState, useEffect } from 'react';
import { Search, Image, Calendar, User, Filter, Download, Eye, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Type definitions
interface XRayImage {
    id: string;
    patientName: string;
    patientId: string;
    dateOfBirth: string;
    xrayDate: string;
    bodyPart: string;
    indication: string;
    imageUrl: string;
    findings: string;
    impression: string;
    radiologist: string;
    status: string;
    createdAt: string;
}

const DoctorXRayPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [xrayImages, setXrayImages] = useState<XRayImage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<XRayImage | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterBodyPart, setFilterBodyPart] = useState<string>('');
    const [imageZoom, setImageZoom] = useState<number>(100);
    const [imageRotation, setImageRotation] = useState<number>(0);

    // Initialize empty state
    useEffect(() => {
        // Check if user is authenticated and is a doctor
        if (!user || user.role !== 'doctor') {
            setError('Access denied. Only doctors can view X-ray images.');
            return;
        }

        // Set empty results (ready for database integration)
        setXrayImages([]);
    }, [user]);

    // Filter images based on search and filters
    const filteredImages: XRayImage[] = xrayImages.filter(image => {
        const matchesSearch = image.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.patientId.includes(searchTerm) ||
            image.bodyPart.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !filterDate || image.xrayDate.includes(filterDate);
        const matchesBodyPart = !filterBodyPart || image.bodyPart.toLowerCase().includes(filterBodyPart.toLowerCase());

        return matchesSearch && matchesDate && matchesBodyPart;
    });

    const handleViewImage = (image: XRayImage): void => {
        setSelectedImage(image);
        setImageZoom(100);
        setImageRotation(0);
    };

    const handleDownloadImage = async (image: XRayImage): Promise<void> => {
        try {
            if (image.imageUrl) {
                const link = document.createElement('a');
                link.href = image.imageUrl;
                link.download = `xray_${image.patientName}_${image.xrayDate}_${image.bodyPart}.jpg`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image');
        }
    };

    const handleZoomIn = (): void => {
        setImageZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = (): void => {
        setImageZoom(prev => Math.max(prev - 25, 50));
    };

    const handleRotate = (): void => {
        setImageRotation(prev => (prev + 90) % 360);
    };

    const handleRefresh = (): void => {
        // Ready for database refresh implementation
        setLoading(true);
        setTimeout(() => {
            setXrayImages([]);
            setLoading(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('doctorPages.loadingXrayImages') || 'Loading X-ray images...'}</p>
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
                                    <Image className="h-8 w-8 text-blue-600" />
                                    {t('doctorPages.xrayImages') || 'X-Ray Images'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {t('doctorPages.xrayImagesDesc') || 'View and analyze patient X-ray images'}
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
                                placeholder={t('doctorPages.searchPatientsXray') || 'Search patients or body parts...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={filterBodyPart}
                                onChange={(e) => setFilterBodyPart(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('doctorPages.allBodyParts') || 'All Body Parts'}</option>
                                <option value="chest">{t('doctorPages.chest') || 'Chest'}</option>
                                <option value="knee">{t('doctorPages.knee') || 'Knee'}</option>
                                <option value="spine">{t('doctorPages.spine') || 'Spine'}</option>
                                <option value="hand">{t('doctorPages.hand') || 'Hand'}</option>
                                <option value="foot">{t('doctorPages.foot') || 'Foot'}</option>
                                <option value="skull">{t('doctorPages.skull') || 'Skull'}</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {filteredImages.length} {t('doctorPages.imagesFound') || 'images found'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredImages.map((image) => (
                        <div key={image.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                            {/* Image Preview */}
                            <div className="aspect-square bg-gray-900 relative">
                                <img
                                    src={image.imageUrl}
                                    alt={`${image.bodyPart} X-ray for ${image.patientName}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${image.status === 'Normal' || image.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : image.status === 'Abnormal'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {image.status}
                                    </span>
                                </div>
                            </div>

                            {/* Image Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{image.patientName}</h3>
                                        <p className="text-sm text-gray-500">{t('usersManagement.id') || 'ID'}: {image.patientId}</p>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 mb-4">
                                    <p><span className="font-medium">{t('doctorPages.bodyPart') || 'Body Part'}:</span> {image.bodyPart}</p>
                                    <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(image.xrayDate).toLocaleDateString()}</p>
                                    <p><span className="font-medium">{t('doctorPages.radiologist') || 'Radiologist'}:</span> {image.radiologist}</p>
                                </div>

                                {image.indication && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">{t('doctorPages.clinicalIndication') || 'Clinical Indication'}:</span> {image.indication}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewImage(image)}
                                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                                    >
                                        <Eye className="h-4 w-4" />
                                        {t('common.view') || 'View'}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadImage(image)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                                    >
                                        <Download className="h-4 w-4" />
                                        {t('doctorPages.downloadImage') || 'Download'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{t('doctorPages.noXrayImagesFound') || 'No X-ray images found'}</p>
                        <p className="text-gray-400 text-sm mt-2">Connect your database to see patient X-ray images here</p>
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {selectedImage.bodyPart} X-Ray - {selectedImage.patientName}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {t('common.date') || 'Date'}: {new Date(selectedImage.xrayDate).toLocaleDateString()} | {t('usersManagement.id') || 'ID'}: {selectedImage.patientId}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Image Controls */}
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.zoomOut') || 'Zoom Out'}
                                >
                                    <ZoomOut className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                    {imageZoom}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.zoomIn') || 'Zoom In'}
                                >
                                    <ZoomIn className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleRotate}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.rotate') || 'Rotate'}
                                >
                                    <RotateCw className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Image Display */}
                            <div className="flex-1 bg-black flex items-center justify-center overflow-auto">
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={`${selectedImage.bodyPart} X-ray`}
                                    className="max-w-none transition-transform duration-200"
                                    style={{
                                        transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                    }}
                                />
                            </div>

                            {/* Side Panel */}
                            <div className="w-80 bg-gray-50 border-l overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.patientInformation') || 'Patient Information'}</h3>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">{t('common.name') || 'Name'}:</span> {selectedImage.patientName}</p>
                                            <p><span className="font-medium">{t('usersManagement.id') || 'ID'}:</span> {selectedImage.patientId}</p>
                                            <p><span className="font-medium">{t('auth.dateOfBirth') || 'Date of Birth'}:</span> {selectedImage.dateOfBirth}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.examInformation') || 'Exam Information'}</h3>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">{t('doctorPages.bodyPart') || 'Body Part'}:</span> {selectedImage.bodyPart}</p>
                                            <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(selectedImage.xrayDate).toLocaleDateString()}</p>
                                            <p><span className="font-medium">{t('doctorPages.radiologist') || 'Radiologist'}:</span> {selectedImage.radiologist}</p>
                                            <p><span className="font-medium">{t('common.status') || 'Status'}:</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded ${selectedImage.status === 'Normal' || selectedImage.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedImage.status === 'Abnormal'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {selectedImage.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {selectedImage.indication && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.clinicalIndication') || 'Clinical Indication'}</h3>
                                            <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                {selectedImage.indication}
                                            </p>
                                        </div>
                                    )}

                                    {selectedImage.findings && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.findings') || 'Findings'}</h3>
                                            <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                {selectedImage.findings}
                                            </p>
                                        </div>
                                    )}

                                    {selectedImage.impression && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">{t('doctorPages.impression') || 'Impression'}</h3>
                                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                                                {selectedImage.impression}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleDownloadImage(selectedImage)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            {t('doctorPages.downloadImage') || 'Download Image'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorXRayPage;