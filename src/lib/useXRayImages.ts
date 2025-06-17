import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface XRayImage {
  id: string;
  patient_name: string;
  patient_id: string;
  date_of_birth: string;
  xray_date: string;
  body_part: string;
  indication: string;
  image_url: string;
  image_path: string;
  findings: string;
  impression: string;
  radiologist: string;
  status: string;
  uploaded_by: string;
  requesting_doctor: string;
  created_at: string;
  updated_at: string;
}

export const useXRayImages = () => {
  const [images, setImages] = useState<XRayImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xray_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for images
      const imagesWithUrls = await Promise.all(
        (data || []).map(async (image) => {
          if (image.image_path) {
            const { data: urlData } = await supabase.storage
              .from('xray-images')
              .createSignedUrl(image.image_path, 3600); // 1 hour expiry

            return {
              ...image,
              image_url: urlData?.signedUrl || image.image_url
            };
          }
          return image;
        })
      );

      setImages(imagesWithUrls);
      setError(null);
    } catch (err) {
      console.error('Error fetching X-ray images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const uploadXRayImage = async (
    file: File,
    patientInfo: {
      patient_name: string;
      patient_id: string;
      date_of_birth?: string;
      body_part: string;
      indication?: string;
      requesting_doctor?: string;
    }
  ) => {
    try {
      setLoading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${patientInfo.patient_id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('xray-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('xray-images')
        .createSignedUrl(filePath, 3600);

      // Insert record into database
      const { data, error: insertError } = await supabase
        .from('xray_images')
        .insert({
          ...patientInfo,
          image_path: filePath,
          image_url: urlData?.signedUrl,
          status: 'Pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh images list
      await fetchImages();

      return data;
    } catch (err) {
      console.error('Error uploading X-ray image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateXRayImage = async (
    id: string,
    updates: Partial<Pick<XRayImage, 'findings' | 'impression' | 'radiologist' | 'status'>>
  ) => {
    try {
      const { error } = await supabase
        .from('xray_images')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh images list
      await fetchImages();
    } catch (err) {
      console.error('Error updating X-ray image:', err);
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchImages();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('xray_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'xray_images'
        },
        () => {
          // Refresh images when changes occur
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    images,
    loading,
    error,
    fetchImages,
    uploadXRayImage,
    updateXRayImage
  };
};