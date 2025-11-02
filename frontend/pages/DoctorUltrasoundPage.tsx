// DoctorUltrasoundPage.tsx - With comprehensive skeleton loading
import React, { useState, useEffect, useRef } from 'react';
import { Search, Image, Calendar, User, Filter, Download, Eye, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "../components/ui/alert-dialog";

// Type definitions matching your database structure
interface UltrasoundImage {
    id: number;
    patient_id: number;
    patient_name: string;
    date_of_birth: string;
    body_part: string[]; // Changed from string to string[] for multiple body parts
    indication: string;
    requesting_doctor: string;
    image_url: string;
    created_at: string;
    // Additional display fields
    imageUrl?: string;
    patientName?: string;
    patientId?: string;
    ultrasoundDate?: string;
    radiologist?: string;
    status?: string;
    findings?: string;
    impression?: string;
}

// Skeleton Loading Component for DoctorUltrasoundPage
const DoctorUltrasoundSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
    <div className="min-h-screen bg-gray-50">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
            </div>

            {/* Images Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        {/* Image Preview Skeleton */}
                        <div className="aspect-square bg-gray-900 relative">
                            <Skeleton className="w-full h-full" />
                            <div className="absolute top-2 right-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>

                        {/* Image Info Skeleton */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-40" />
                            </div>

                            <Skeleton className="h-4 w-full mb-4" />

                            {/* Action Buttons Skeleton */}
                            <div className="flex space-x-2">
                                <Skeleton className="h-9 flex-1" />
                                <Skeleton className="h-9 flex-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Authentication Skeleton Loading
const AuthSkeletonLoading = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto" />
        </div>
    </div>
);

// Loading Skeleton with Text
const LoadingSkeletonWithText = ({ text }: { text: string }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <p className="mt-4 text-gray-600">{text}</p>

            {/* Grid Skeleton for images */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <Skeleton className="w-full h-60" />
                            <div className="p-4">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-3 w-20 mb-1" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const DoctorUltrasoundPage: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [ultrasoundImages, setUltrasoundImages] = useState<UltrasoundImage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [initializing, setInitializing] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<UltrasoundImage | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterBodyPart, setFilterBodyPart] = useState<string>('');
    const [imageZoom, setImageZoom] = useState<number>(100);
    const [imageRotation, setImageRotation] = useState<number>(0);
    // 1. Add state for tracking deletion
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteImage, setConfirmDeleteImage] = useState<UltrasoundImage | null>(null);
    const { toast } = useToast();
    const isFetchingRef = useRef(false);

    // Helper function to format body parts for display with translations
    const formatBodyParts = (bodyParts: string[] | string): string => {
        if (Array.isArray(bodyParts)) {
            return bodyParts.map(part => {
                // Try to get translation for the body part
                const translation = t(`ultrasound.bodyParts.${part}`);
                return translation !== `ultrasound.bodyParts.${part}` ? translation : part;
            }).join(', ');
        }
        const translation = t(`ultrasound.bodyParts.${bodyParts}`);
        return translation !== `ultrasound.bodyParts.${bodyParts}` ? translation : bodyParts || '';
    };

    // Helper function to get body part category based on Ultrasound component categories
    const getBodyPartCategory = (bodyPart: string): string => {
        const lowerPart = bodyPart.toLowerCase();

        // Ultrasound specific body parts
        if (lowerPart === 'neck') return 'neck';
        if (lowerPart === 'head') return 'head';
        if (lowerPart === 'abdomen') return 'abdomen';
        if (lowerPart === 'abdomen_kidney') return 'abdomen_kidney';
        if (lowerPart === 'abdomen_spleen') return 'abdomen_spleen';
        if (lowerPart === 'abdomen_liver') return 'abdomen_liver';
        if (lowerPart === 'abdomen_stomach') return 'abdomen_stomach';
        if (lowerPart === 'spine') return 'spine';
        if (lowerPart === 'scrotum') return 'scrotum';
        if (lowerPart === 'hip') return 'hip';

        return 'other';
    };

    // Helper function to get image URL from Supabase storage
    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';

        try {
            // If the path already contains the full URL, return it
            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            // Otherwise, construct the public URL
            const { data } = supabase.storage
                .from('ultrasound-images')
                .getPublicUrl(imagePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return '';
        }
    };

    // Fetch Ultrasound images from database
    const fetchUltrasoundImages = async () => {
        if (isFetchingRef.current) return; // Prevent concurrent fetches

        isFetchingRef.current = true;
        try {
            setLoading(true);
            setError(null); // Reset error state
            console.log('Fetching Ultrasound images...');

            const { data: ultrasoundData, error: ultrasoundError } = await supabase
                .from('ultrasound_images')
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

            if (ultrasoundError) {
                console.error('Error fetching Ultrasound images:', ultrasoundError);
                throw new Error(ultrasoundError.message);
            }

            console.log('Raw Ultrasound data:', ultrasoundData);

            if (ultrasoundData && ultrasoundData.length > 0) {
                const transformedData: UltrasoundImage[] = ultrasoundData.map(item => {
                    const imageUrl = getImageUrl(item.image_url);

                    return {
                        ...item,
                        imageUrl,
                        patientName: item.patient_name,
                        patientId: item.patient_id.toString(),
                        ultrasoundDate: item.created_at,
                        radiologist: item.requesting_doctor || 'Unknown',
                        status: 'Completed',
                        findings: item.indication || '',
                        impression: ''
                    };
                });

                console.log('Transformed Ultrasound data:', transformedData);
                setUltrasoundImages(transformedData);
            } else {
                setUltrasoundImages([]);
            }

        } catch (err) {
            console.error('Error in fetchUltrasoundImages:', err);
            setError(err instanceof Error ? err.message : 'Failed to load Ultrasound images');
        } finally {
            setLoading(false);
            isFetchingRef.current = false; // Reset the flag
        }
    };

    // Initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                setInitializing(true);
                setLoading(true);
                setError(null); // Reset error state

                // Check if user is authenticated and is a doctor
                if (!user) {
                    setInitializing(false);
                    setLoading(false);
                    return;
                }

                if (user.role !== 'doctor' && user.role !== 'admin') {
                    setError(t('admin.accessDenied') || 'Access denied. Only doctors and administrators can view Ultrasound images.');
                    setInitializing(false);
                    setLoading(false);
                    return;
                }

                // Fetch Ultrasound images
                await fetchUltrasoundImages();
            } catch (err) {
                console.error('Error initializing component:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize');
            } finally {
                setInitializing(false);
                setLoading(false); // Always reset loading
            }
        };

        // Only run if user is defined (not undefined)
        if (user !== undefined) {
            initializeComponent();
        }
    }, [user, t]);
    // ADD THIS NEW useEffect:
    useEffect(() => {
        return () => {
            // Cleanup function to reset states when component unmounts
            setLoading(false);
            setInitializing(false);
            setError(null);
            isFetchingRef.current = false;
        };
    }, []);
    // Filter images based on search and filters
    const filteredImages: UltrasoundImage[] = ultrasoundImages.filter(image => {
        const matchesSearch =
            (image.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (image.patient_id || '').toString().includes(searchTerm) ||
            (image.body_part && Array.isArray(image.body_part)
                ? image.body_part.some(part => part.toLowerCase().includes(searchTerm.toLowerCase()))
                : (image.body_part || '').toString().toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = !filterDate ||
            (image.created_at && image.created_at.includes(filterDate));

        const matchesBodyPart = !filterBodyPart ||
            (image.body_part && Array.isArray(image.body_part)
                ? image.body_part.some(part => getBodyPartCategory(part) === filterBodyPart)
                : getBodyPartCategory((image.body_part || '').toString()) === filterBodyPart);

        return matchesSearch && matchesDate && matchesBodyPart;
    });

    const handleViewImage = (image: UltrasoundImage): void => {
        setSelectedImage(image);
        setImageZoom(100);
        setImageRotation(0);
    };

    const handleDownloadImage = async (image: UltrasoundImage): Promise<void> => {
        try {
            if (!image.imageUrl) {
                toast({
                    title: t('doctorPages.noImageUrl') || 'No image URL available',
                    description: undefined,
                    variant: 'destructive',
                });
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
            const fileName = `ultrasound_${image.patient_name.replace(/\s+/g, '_')}_${formatBodyParts(image.body_part).replace(/\s+/g, '_')}_${new Date(image.created_at).toLocaleDateString().replace(/\//g, '-')}.${fileExtension}`;

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
            toast({
                title: t('doctorPages.downloadFailed') || 'Failed to download image.',
                description: error instanceof Error ? error.message : undefined,
                variant: 'destructive',
            });
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
        setError(null); // Clear any previous errors

        await fetchUltrasoundImages();
    };

    const extractFilePathFromUrl = (url: string): string | null => {
        if (!url) return null;

        try {
            console.log('🔍 Original URL:', url);

            // Extract just the filename from the URL
            // Extract just the filename from the URL
            const parts = url.split('/');
            const filename = parts[parts.length - 1];

            // Remove query params if any
            let cleanFilename = filename.split('?')[0];

            // Check if the URL has double bucket prefix (ultrasound-images/ultrasound-images/)
            // If so, we need to include the bucket prefix in the path
            if (url.includes('/ultrasound-images/ultrasound-images/')) {
                cleanFilename = 'ultrasound-images/' + cleanFilename;
            }

            console.log('📁 Extracted filename:', cleanFilename);
            return cleanFilename;

        } catch (error) {
            console.error('Error extracting filename:', error);
            return null;
        }
    };

    const handleDeleteImage = async (image: UltrasoundImage): Promise<void> => {
        setDeletingId(image.id);
        setError(null);

        try {
            // First, extract the file path from the URL before deleting from database
            // First, extract the file path from the URL before deleting from database
            let filePathToDelete: string | null = null;
            if (image.imageUrl) {
                filePathToDelete = extractFilePathFromUrl(image.imageUrl);
                console.log('🔍 Extracted from imageUrl:', filePathToDelete);
            } else if (image.image_url) {
                // Fallback: use image_url directly if it's just a filename
                filePathToDelete = image.image_url;
                console.log('📁 Using image_url directly:', filePathToDelete);
            }

            // Delete from database first
            const { error: dbError } = await supabase
                .from('ultrasound_images')
                .delete()
                .eq('id', image.id);

            if (dbError) {
                throw dbError;
            }

            // Delete from storage bucket if we have a valid file path
            let storageDeleted = false;
            if (filePathToDelete) {
                try {
                    // Remove the 'ultrasound-images/' prefix if present
                    let cleanPath = filePathToDelete;
                    if (filePathToDelete.startsWith('ultrasound-images/')) {
                        cleanPath = filePathToDelete.replace('ultrasound-images/', '');
                    }

                    console.log('🗑️ Deleting from bucket: ultrasound-images');
                    console.log('📁 Original path:', filePathToDelete);
                    console.log('📁 Clean path:', cleanPath);

                    const { error: storageError, data } = await supabase.storage
                        .from('ultrasound-images')
                        .remove([cleanPath]);

                    if (storageError) {
                        console.error('❌ Storage error:', storageError.message);
                        toast({
                            title: t('ultrasound.doctorUltrasoundPage.deleteSuccess') || 'Ultrasound Image Deleted',
                            description: `Database deleted, but storage error: ${storageError.message}`,
                            variant: 'default',
                            style: { backgroundColor: '#16a34a', color: '#fff' },
                        });
                    } else {
                        console.log('✅ Storage deleted successfully!', data);
                        storageDeleted = true;
                    }
                } catch (storageErr) {
                    console.error('❌ Storage exception:', storageErr);
                    toast({
                        title: t('ultrasound.doctorUltrasoundPage.deleteSuccess') || 'Ultrasound Image Deleted',
                        description: `Database deleted, but storage exception: ${storageErr instanceof Error ? storageErr.message : 'Unknown error'}`,
                        variant: 'default',
                        style: { backgroundColor: '#16a34a', color: '#fff' },
                    });
                }
            } else {
                console.warn('⚠️ No file path extracted from URL:', image.image_url);
            }

            // Remove from UI
            setUltrasoundImages(prev => prev.filter(x => x.id !== image.id));

            // Show success toast if storage was deleted or if no file path was found
            if (storageDeleted || !filePathToDelete) {
                toast({
                    title: t('ultrasound.doctorUltrasoundPage.deleteSuccess') || 'The ultrasound image was deleted successfully.',
                    description: '',
                    variant: 'default',
                    style: { backgroundColor: '#16a34a', color: '#fff' },
                });
            }
        } catch (err) {
            toast({
                title: t('doctorPages.deleteFailed') || 'Failed to delete image.',
                description: err instanceof Error ? err.message : undefined,
                variant: 'destructive',
            });
            console.error('Delete error:', err);
        } finally {
            setDeletingId(null);
        }
    };

    // Show auth skeleton while checking user
    if (!user && initializing) {
        return <AuthSkeletonLoading />;
    }

    // Show skeleton loading while data is being fetched
    if (loading) {
        return <LoadingSkeletonWithText text={t('doctorPages.loadingUltrasoundImages') || 'Loading Ultrasound images...'} />;
    }

    // Show error state
    if (error && (error.includes('Access denied') || !user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.error') || 'Error'}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    {!error.includes('Access denied') && !error.includes('Please log in') && (
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {t('common.refresh') || 'Refresh'}
                        </button>
                    )}
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
                                    {t('doctorPages.ultrasoundImages') || 'Ultrasound Images'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {t('doctorPages.ultrasoundImagesDesc') || 'View and analyze patient Ultrasound images'}
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
                                {loading ? (t('common.refreshing') || 'Refreshing...') : (t('common.refresh') || 'Refresh')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('doctorPages.searchPatientsUltrasound') || 'Search patients or body parts...'}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (error && !error.includes('Access denied')) setError(null);
                                }} disabled={loading}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={filterBodyPart}
                                onChange={(e) => {
                                    setFilterBodyPart(e.target.value);
                                    if (error && !error.includes('Access denied')) setError(null);
                                }} disabled={loading}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">{t('doctorPages.allBodyParts') || 'All Body Parts'}</option>
                                <option value="neck">{t('ultrasound.bodyParts.neck') || 'Neck'}</option>
                                <option value="head">{t('ultrasound.bodyParts.head') || 'Head'}</option>
                                <option value="abdomen">{t('ultrasound.bodyParts.abdomen') || 'Abdomen'}</option>
                                <option value="abdomen_kidney">{t('ultrasound.bodyParts.abdomen_kidney') || 'Abdomen (Kidney)'}</option>
                                <option value="abdomen_spleen">{t('ultrasound.bodyParts.abdomen_spleen') || 'Abdomen (Spleen)'}</option>
                                <option value="abdomen_liver">{t('ultrasound.bodyParts.abdomen_liver') || 'Abdomen (Liver)'}</option>
                                <option value="abdomen_stomach">{t('ultrasound.bodyParts.abdomen_stomach') || 'Abdomen (Stomach)'}</option>
                                <option value="spine">{t('ultrasound.bodyParts.spine') || 'Spine'}</option>
                                <option value="scrotum">{t('ultrasound.bodyParts.scrotum') || 'Scrotum'}</option>
                                <option value="hip">{t('ultrasound.bodyParts.hip') || 'Hip (Infant)'}</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    if (error && !error.includes('Access denied')) setError(null);
                                }} disabled={loading}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        // Show skeleton cards while loading
                        [...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                {/* Image Preview Skeleton */}
                                <div className="aspect-square bg-gray-900 relative">
                                    <Skeleton className="w-full h-full" />
                                    <div className="absolute top-2 right-2">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </div>
                                </div>

                                {/* Image Info Skeleton */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <Skeleton className="h-5 w-32 mb-1" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>

                                    <Skeleton className="h-4 w-full mb-4" />

                                    {/* Action Buttons Skeleton */}
                                    <div className="flex space-x-2">
                                        <Skeleton className="h-9 flex-1" />
                                        <Skeleton className="h-9 flex-1" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Show actual data
                        filteredImages.map((image) => (
                            <div key={image.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                {/* Image Preview */}
                                <div className="aspect-square bg-gray-900 relative">
                                    <img
                                        src={image.imageUrl}
                                        alt={`${formatBodyParts(image.body_part)} Ultrasound for ${image.patient_name}`}
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
                                        <p><span className="font-medium">{t('ultrasound.doctorUltrasoundPage.bodyPart') || 'Body Part'}:</span> {formatBodyParts(image.body_part)}</p>
                                        <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(image.created_at).toLocaleDateString()}</p>
                                        <p><span className="font-medium">{t('ultrasound.doctorUltrasoundPage.requestingDoctor') || 'Requesting Doctor'}:</span> {image.requesting_doctor || 'N/A'}</p>
                                    </div>

                                    {image.indication && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">{t('ultrasound.clinicalIndication.title') || t('ultrasound.doctorUltrasoundPage.clinicalIndication') || 'Clinical Indication'}:</span> {image.indication}
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
                                        {user?.role === 'admin' && (
                                            <AlertDialog>                                            <AlertDialogTrigger asChild>
                                                <button
                                                    onClick={() => setConfirmDeleteImage(image)}
                                                    disabled={deletingId === image.id}
                                                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    {deletingId === image.id ? (t('doctorPages.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
                                                </button>
                                            </AlertDialogTrigger>
                                                <AlertDialogContent className={`${isRTL ? 'text-right' : 'text-left'} ${isRTL ? '[&>button]:left-4 [&>button]:right-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                                    <AlertDialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                                                        <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('ultrasound.doctorUltrasoundPage.deleteConfirmTitle') || 'Delete Ultrasound Image?'}</AlertDialogTitle>
                                                        <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                                                            {t('ultrasound.doctorUltrasoundPage.deleteConfirm') || 'Are you sure you want to delete this Ultrasound image? This action cannot be undone.'}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className={`gap-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                                                        <AlertDialogCancel asChild>
                                                            <button type="button" onClick={() => setConfirmDeleteImage(null)} className={isRTL ? 'order-2' : ''}>
                                                                {t('common.cancel') || 'Cancel'}
                                                            </button>
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction asChild>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (confirmDeleteImage) {
                                                                        await handleDeleteImage(confirmDeleteImage);
                                                                        setConfirmDeleteImage(null);
                                                                    }
                                                                }}
                                                                disabled={deletingId === image.id}
                                                                className={`bg-red-600 hover:bg-red-700 ${isRTL ? 'order-1' : ''}`}
                                                            >
                                                                {deletingId === image.id ? (t('doctorPages.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
                                                            </button>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {filteredImages.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{t('doctorPages.noUltrasoundImagesFound') || 'No Ultrasound images found matching your criteria.'}</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {ultrasoundImages.length === 0
                                ? t('doctorPages.noUltrasoundImagesUploaded') || 'No Ultrasound images have been uploaded yet.'
                                : t('doctorPages.tryAdjustingSearch') || 'Try adjusting your search or filter criteria.'}
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
                                    {formatBodyParts(selectedImage.body_part)} Ultrasound - {selectedImage.patient_name}
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
                                        alt={`${formatBodyParts(selectedImage.body_part)} Ultrasound`}
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
                                            {t('doctorPages.patientInformation') || 'Patient Information'}
                                        </h3>
                                        <div className="space-y-1 text-xs sm:text-sm">
                                            <p><span className="font-medium">{t('common.name') || 'Name'}:</span> {selectedImage.patient_name}</p>
                                            <p><span className="font-medium">{t('usersManagement.id') || 'ID'}:</span> {selectedImage.patient_id}</p>
                                            <p><span className="font-medium">{t('ultrasound.patientInfo.dateOfBirth') || 'Date of Birth'}:</span> {selectedImage.date_of_birth || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {/* Exam Information */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                            {t('doctorPages.examInformation') || 'Exam Information'}
                                        </h3>
                                        <div className="space-y-1 text-xs sm:text-sm">
                                            <p><span className="font-medium">{t('ultrasound.doctorUltrasoundPage.bodyPart') || 'Body Part'}:</span> {formatBodyParts(selectedImage.body_part)}</p>
                                            <p><span className="font-medium">{t('common.date') || 'Date'}:</span> {new Date(selectedImage.created_at).toLocaleDateString()}</p>
                                            <p><span className="font-medium">{t('ultrasound.doctorUltrasoundPage.requestingDoctor') || 'Requesting Doctor'}:</span> {selectedImage.requesting_doctor || 'N/A'}</p>
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
                                                {t('ultrasound.clinicalIndication.title') || t('ultrasound.doctorUltrasoundPage.clinicalIndication') || 'Clinical Indication'}
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

export default DoctorUltrasoundPage;

