// Image optimization utilities
export const optimizeImage = (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
} = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;

    // If using a CDN like Cloudinary or similar
    if (src.includes('cloudinary.com') || src.includes('your-cdn.com')) {
        const params = new URLSearchParams();
        if (width) params.append('w', width.toString());
        if (height) params.append('h', height.toString());
        params.append('q', quality.toString());
        params.append('f', format);

        return `${src}?${params.toString()}`;
    }

    // For local images, return as-is (you might want to implement local optimization)
    return src;
};

// Simple image optimization function
export const getOptimizedImageUrl = (src: string, width?: number, height?: number) => {
    return optimizeImage(src, { width, height });
};
