// DoctorXRayPage.tsx - With Database Integration
import React, { useState, useEffect } from 'react';
import { Search, Image, Calendar, User, Filter, Download, Eye, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";

// Type definitions matching your database structure
interface XRayImage {
    id: number;
    patient_id: number;
    patient_name: string;
    date_of_birth: string;
    body_part: string;
    indication: string;
    requesting_doctor: string;
    image_url: string;
    created_at: string;
    // Additional display fields
    imageUrl?: string;
    patientName?: string;
    patientId?: string;
    xrayDate?: string;
    radiologist?: string;
    status?: string;
    findings?: string;
    impression?: string;
}

const DoctorXRayPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [xrayImages, setXrayImages] = useState<XRayImage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<XRayImage | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterBodyPart, setFilterBodyPart] = useState<string>('');
    const [imageZoom, setImageZoom] = useState<number>(100);
    const [imageRotation, setImageRotation] = useState<number>(0);

    // Fetch X-ray images from database
    useEffect(() => {
        const fetchXrayImages = async () => {
            try {
                // Check if user is authenticated and is a doctor
                if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
                    setError(t('admin.accessDenied') || 'Access denied. Only doctors and administrators can view X-ray images.');
                    setLoading(false);
                    return;
                }

                setLoading(true);
                console.log('Fetching X-ray images...');

                // Fetch X-ray images from your database
                const { data: xrayData, error: xrayError } = await supabase
                    .from('xray_images') // Make sure this matches your table name
                    .select(`
                        id,
                        patient_id,
                        patient_name,
                        date_of_birth,
                        body_part,
                        indication,
                        requesting_doctor,
                        image_url,
                        created_at
                    `)
                    .order('created_at', { ascending: false });

                if (xrayError) {
                    console.error('Error fetching X-ray images:', xrayError);
                    throw new Error(xrayError.message);
                }

                console.log('Raw X-ray data:', xrayData);

                if (xrayData && xrayData.length > 0) {
                    // Transform the data to match the component interface
                    const transformedData: XRayImage[] = xrayData.map(item => {
                        // Get the full image URL from Supabase storage
                        const imageUrl = getImageUrl(item.image_url);

                        return {
                            ...item,
                            // Map database fields to component fields
                            imageUrl,
                            patientName: item.patient_name,
                            patientId: item.patient_id.toString(),
                            xrayDate: item.created_at,
                            radiologist: item.requesting_doctor || 'Unknown',
                            status: 'Completed', // Default status
                            findings: item.indication || '',
                            impression: ''
                        };
                    });

                    console.log('Transformed X-ray data:', transformedData);
                    setXrayImages(transformedData);
                } else {
                    setXrayImages([]);
                }

            } catch (err) {
                console.error('Error in fetchXrayImages:', err);
                setError(err instanceof Error ? err.message : 'Failed to load X-ray images');
            } finally {
                setLoading(false);
            }
        };

        fetchXrayImages();
    }, [user, t]);

    // Helper function to get image URL from Supabase storage
    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';

        try {
            const { data } = supabase.storage
                .from('xray-images')
                .getPublicUrl(imagePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return '';
        }
    };

    // Filter images based on search and filters
    const filteredImages: XRayImage[] = xrayImages.filter(image => {
        const matchesSearch =
            (image.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (image.patient_id || '').toString().includes(searchTerm) ||
            (image.body_part || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = !filterDate ||
            (image.created_at && image.created_at.includes(filterDate));

        const matchesBodyPart = !filterBodyPart ||
            (image.body_part && image.body_part.toLowerCase().includes(filterBodyPart.toLowerCase()));

        return matchesSearch && matchesDate && matchesBodyPart;
    });

    const handleViewImage = (image: XRayImage): void => {
        setSelectedImage(image);
        setImageZoom(100);
        setImageRotation(0);
    };

    const handleDownloadImage = async (image: XRayImage): Promise<void> => {
        try {
            if (!image.imageUrl) {
                alert(t('doctorPages.noImageUrl') || 'No image URL available');
                return;
            }

            // Show loading state
            console.log('Starting download for:', image.imageUrl);

            // Fetch the image as a blob
            const response = await fetch(image.imageUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();

            // Create object URL from blob
            const blobUrl = window.URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = blobUrl;

            // Create filename with proper extension
            const fileExtension = image.imageUrl.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `xray_${image.patient_name.replace(/\s+/g, '_')}_${image.body_part}_${new Date(image.created_at).toLocaleDateString().replace(/\//g, '-')}.${fileExtension}`;

            link.download = fileName;
            link.style.display = 'none';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            console.log('Download completed successfully');

        } catch (error) {
            console.error('Error downloading image:', error);
            alert(t('doctorPages.downloadFailed') || 'Failed to download image. Please try again.');
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

    const handleRefresh = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const { data: xrayData, error: xrayError } = await supabase
                .from('xray_images')
                .select(`
                    id,
                    patient_id,
                    patient_name,
                    date_of_birth,
                    body_part,
                    indication,
                    requesting_doctor,
                    image_url,
                    created_at
                `)
                .order('created_at', { ascending: false });

            if (xrayError) throw new Error(xrayError.message);

            if (xrayData) {
                const transformedData: XRayImage[] = xrayData.map(item => ({
                    ...item,
                    imageUrl: getImageUrl(item.image_url),
                    patientName: item.patient_name,
                    patientId: item.patient_id.toString(),
                    xrayDate: item.created_at,
                    radiologist: item.requesting_doctor || 'Unknown',
                    status: 'Completed',
                    findings: item.indication || '',
                    impression: ''
                }));

                setXrayImages(transformedData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
                    <Skeleton width={180} height={20} className="mx-auto mb-2" />
                    <Skeleton width={120} height={16} className="mx-auto" />
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
                                <option value="chest">{t('xray.bodyParts.chest') || 'Chest'}</option>
                                <option value="knee">{t('xray.bodyParts.knee') || 'Knee'}</option>
                                <option value="spine">{t('xray.bodyParts.spine') || 'Spine'}</option>
                                <option value="hand">{t('xray.bodyParts.hand') || 'Hand'}</option>
                                <option value="foot">{t('xray.bodyParts.foot') || 'Foot'}</option>
                                <option value="skull">{t('xray.bodyParts.skull') || 'Skull'}</option>
                                <option value="pelvis">{t('xray.bodyParts.pelvis') || 'Pelvis'}</option>
                                <option value="shoulder">{t('xray.bodyParts.shoulder') || 'Shoulder'}</option>
                                <option value="elbow">{t('xray.bodyParts.elbow') || 'Elbow'}</option>
                                <option value="wrist">{t('xray.bodyParts.wrist') || 'Wrist'}</option>
                                <option value="ankle">{t('xray.bodyParts.ankle') || 'Ankle'}</option>
                                <option value="hip">{t('xray.bodyParts.hip') || 'Hip'}</option>
                            </select>
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
                                    alt={`${image.body_part} X-ray for ${image.patient_name}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {t('admin.completed') || 'Completed'}
                                    </span>
                                </div>
                            </div>

                            {/* Image Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{image.patient_name}</h3>
                                        <p className="text-sm text-gray-500">{t('usersManagement.id') || 'ID'}: {image.patient_id}</p>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 mb-4">
                                    <p><span className="font-medium">{t('xray.bodyPart') || 'Body Part'}:</span> {image.body_part}</p>
                                    <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(image.created_at).toLocaleDateString()}</p>
                                    <p><span className="font-medium">{t('xray.requestingDoctor') || 'Requesting Doctor'}:</span> {image.requesting_doctor || 'N/A'}</p>
                                </div>

                                {image.indication && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">{t('xray.clinicalIndication') || 'Clinical Indication'}:</span> {image.indication}
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
                        <p className="text-gray-500 text-lg">{t('doctorPages.noXrayImagesFound') || 'No X-ray images found matching your criteria.'}</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {xrayImages.length === 0
                                ? 'No X-ray images have been uploaded yet.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                )}
            </div>


            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg w-full h-full sm:max-w-6xl sm:w-full sm:max-h-[95vh] flex flex-col">
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b flex items-center justify-between flex-shrink-0">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {selectedImage.body_part} X-Ray - {selectedImage.patient_name}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    {t('common.date') || 'Date'}: {new Date(selectedImage.created_at).toLocaleDateString()} | {t('usersManagement.id') || 'ID'}: {selectedImage.patient_id}
                                </p>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                                {/* Image Controls */}
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.zoomOut') || 'Zoom Out'}
                                >
                                    <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <span className="text-xs sm:text-sm text-gray-600 min-w-[45px] sm:min-w-[60px] text-center">
                                    {imageZoom}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.zoomIn') || 'Zoom In'}
                                >
                                    <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                    onClick={handleRotate}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title={t('doctorPages.rotate') || 'Rotate'}
                                >
                                    <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    title="Close"
                                >
                                    <span className="text-lg">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content - Mobile: Vertical Stack, Desktop: Horizontal */}
                        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                            {/* Image Display */}
                            <div className="flex-1 bg-black flex items-center justify-center overflow-auto order-1 sm:order-1">
                                <div className="w-full h-full flex items-center justify-center p-2">
                                    <img
                                        src={selectedImage.imageUrl}
                                        alt={`${selectedImage.body_part} X-ray`}
                                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                                        style={{
                                            transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiIGZvbnQtc2l6ZT0iMTZweCIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Information Panel - Mobile: Bottom Sheet, Desktop: Side Panel */}
                            <div className="w-full sm:w-80 bg-gray-50 border-t sm:border-t-0 sm:border-l overflow-y-auto order-2 sm:order-2 max-h-[40vh] sm:max-h-none">
                                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                                    {/* Patient Information */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                            {t('xray.patientInformation') || 'Patient Information'}
                                        </h3>
                                        <div className="space-y-1 text-xs sm:text-sm">
                                            <p><span className="font-medium">{t('common.name') || 'Name'}:</span> {selectedImage.patient_name}</p>
                                            <p><span className="font-medium">{t('usersManagement.id') || 'ID'}:</span> {selectedImage.patient_id}</p>
                                            <p><span className="font-medium">{t('xray.dateOfBirth') || 'Date of Birth'}:</span> {selectedImage.date_of_birth || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Exam Information */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                            {t('doctorPages.examInformation') || 'Exam Information'}
                                        </h3>
                                        <div className="space-y-1 text-xs sm:text-sm">
                                            <p><span className="font-medium">{t('xray.bodyPart') || 'Body Part'}:</span> {selectedImage.body_part}</p>
                                            <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(selectedImage.created_at).toLocaleDateString()}</p>
                                            <p><span className="font-medium">{t('xray.requestingDoctor') || 'Requesting Doctor'}:</span> {selectedImage.requesting_doctor || 'N/A'}</p>
                                            <p className="flex items-center">
                                                <span className="font-medium">{t('common.status') || 'Status'}:</span>
                                                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                                                    {t('admin.completed') || 'Completed'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Clinical Indication */}
                                    {selectedImage.indication && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                                {t('xray.clinicalIndication') || 'Clinical Indication'}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-700 bg-white p-2 sm:p-3 rounded border">
                                                {selectedImage.indication}
                                            </p>
                                        </div>
                                    )}

                                    {/* Download Button */}
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleDownloadImage(selectedImage)}
                                            className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
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