import { supabase } from './supabase';

export interface UploadedFile {
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
}

export interface UploadProgress {
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export class FileUploadService {
    private static BUCKET_NAME = 'lab-attachments';

    /**
     * Check if current user has Lab or Admin role
     */
    private static async checkUserAuthorization(): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data: userData, error } = await supabase
                .from('userinfo')
                .select('user_roles')
                .eq('user_email', user.email)
                .single();

            if (error || !userData) return false;

            return userData.user_roles === 'Lab' || userData.user_roles === 'Admin';
        } catch (error) {
            console.error('Authorization check failed:', error);
            return false;
        }
    }

    /**
     * Generate patient-specific folder path
     * Format: patient_[patient_id]
     */
    private static async getPatientFolder(labResultId: number): Promise<string> {
        // Get patient ID from lab result
        const { data: labResult, error } = await supabase
            .from('lab_results')
            .select('patient_id')
            .eq('id', labResultId)
            .single();

        if (error || !labResult) {
            throw new Error('Failed to fetch lab result details');
        }

        return `patient_${labResult.patient_id}`;
    }

    /**
     * Upload a single file to Supabase storage
     */
    static async uploadFile(
        file: File,
        labResultId: number,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadedFile> {
        // Check authorization
        const isAuthorized = await this.checkUserAuthorization();
        if (!isAuthorized) {
            throw new Error('Unauthorized: Only Lab and Admin users can upload files');
        }

        try {
            // Get patient-specific folder
            const patientFolder = await this.getPatientFolder(labResultId);

            // Generate unique file path within patient folder
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedName}`;

            // Full path: patient_folder/filename
            const filePath = `${patientFolder}/${fileName}`;

            // Start upload
            onProgress?.({
                file,
                progress: 0,
                status: 'uploading'
            });

            const { data, error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw new Error(`Upload failed: ${error.message}`);
            }

            // Upload completed
            onProgress?.({
                file,
                progress: 100,
                status: 'completed'
            });

            return {
                file_name: file.name,
                file_path: data.path, // This will be "patient_123/timestamp_filename.ext"
                file_size: file.size,
                mime_type: file.type
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';

            onProgress?.({
                file,
                progress: 0,
                status: 'error',
                error: errorMessage
            });

            throw error;
        }
    }

    /**
     * Upload multiple files to Supabase storage
     */
    static async uploadFiles(
        files: File[],
        labResultId: number,
        onProgress?: (progress: UploadProgress[]) => void
    ): Promise<UploadedFile[]> {
        // Check authorization
        const isAuthorized = await this.checkUserAuthorization();
        if (!isAuthorized) {
            throw new Error('Unauthorized: Only Lab and Admin users can upload files');
        }

        const progress: UploadProgress[] = files.map(file => ({
            file,
            progress: 0,
            status: 'uploading'
        }));

        const uploadedFiles: UploadedFile[] = [];
        const errors: string[] = [];

        // Upload files sequentially to avoid overwhelming the server
        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const uploadedFile = await this.uploadFile(file, labResultId, (fileProgress) => {
                    progress[i] = fileProgress;
                    onProgress?.(progress);
                });
                uploadedFiles.push(uploadedFile);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`${files[i].name}: ${errorMessage}`);
                progress[i] = {
                    file: files[i],
                    progress: 0,
                    status: 'error',
                    error: errorMessage
                };
                onProgress?.(progress);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Some files failed to upload: ${errors.join(', ')}`);
        }

        return uploadedFiles;
    }

    /**
     * Save file metadata to the database
     */
    static async saveFileMetadata(
        uploadedFiles: UploadedFile[],
        labResultId: number,
        uploadedBy: number
    ): Promise<void> {
        // Check authorization
        const isAuthorized = await this.checkUserAuthorization();
        if (!isAuthorized) {
            throw new Error('Unauthorized: Only Lab and Admin users can save file metadata');
        }

        const fileRecords = uploadedFiles.map(file => ({
            lab_result_id: labResultId,
            file_name: file.file_name,
            file_path: file.file_path, // Full path with patient folder
            file_size: file.file_size,
            mime_type: file.mime_type,
            uploaded_by: uploadedBy
        }));

        const { error } = await supabase
            .from('lab_attachments')
            .insert(fileRecords);

        if (error) {
            throw new Error(`Failed to save file metadata: ${error.message}`);
        }
    }

    /**
     * Get file download URL
     */
    static async getFileUrl(filePath: string): Promise<string> {
        // Check authorization
        const isAuthorized = await this.checkUserAuthorization();
        if (!isAuthorized) {
            throw new Error('Unauthorized: Only Lab and Admin users can download files');
        }

        const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
            throw new Error(`Failed to get file URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    /**
     * FIXED: Delete a file - STORAGE FIRST, then DATABASE
     */
    static async deleteFile(attachmentId: number, filePath: string): Promise<void> {
        try {
            console.log('Starting deletion process for:', { attachmentId, filePath });

            // STEP 1: Delete from STORAGE FIRST (this is the critical fix!)
            console.log('Step 1: Deleting from storage bucket...');
            const { error: storageError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove([filePath]); // filePath includes folder: "patient_123/file.jpg"

            if (storageError) {
                console.error('Storage deletion error:', storageError);
                throw new Error(`Failed to delete file from storage: ${storageError.message}`);
            }
            console.log('✓ Storage deletion successful');

            // STEP 2: Delete from DATABASE SECOND
            console.log('Step 2: Deleting from database...');
            const { error: dbError } = await supabase
                .from('lab_attachments')
                .delete()
                .eq('id', attachmentId);

            if (dbError) {
                console.error('Database deletion error:', dbError);
                throw new Error(`Failed to delete attachment record: ${dbError.message}`);
            }
            console.log('✓ Database deletion successful');

            console.log('Deletion completed successfully');
        } catch (error) {
            console.error('Error in deleteFile:', error);
            throw error;
        }
    }

    /**
     * NEW: Delete all attachments for a lab result (used when deleting entire lab result)
     */
    static async deleteLabResultAttachments(labResultId: number): Promise<void> {
        try {
            // Get all attachments for this lab result
            const attachments = await this.getLabAttachments(labResultId);

            if (attachments.length === 0) {
                console.log('No attachments to delete');
                return;
            }

            console.log(`Deleting ${attachments.length} attachments for lab result ${labResultId}`);

            // Collect all file paths for batch deletion from storage
            const filePaths = attachments.map(att => att.file_path as string);

            // STEP 1: Delete all files from STORAGE in batch
            console.log('Step 1: Deleting files from storage...');
            const { error: storageError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove(filePaths);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
                throw new Error(`Failed to delete files from storage: ${storageError.message}`);
            }
            console.log('✓ All files deleted from storage');

            // STEP 2: Delete all attachment records from DATABASE
            console.log('Step 2: Deleting attachment records from database...');
            const { error: dbError } = await supabase
                .from('lab_attachments')
                .delete()
                .eq('lab_result_id', labResultId);

            if (dbError) {
                console.error('Database deletion error:', dbError);
                throw new Error(`Failed to delete attachment records: ${dbError.message}`);
            }
            console.log('✓ All attachment records deleted from database');

            console.log('All attachments deleted successfully');
        } catch (error) {
            console.error('Error deleting lab result attachments:', error);
            throw error;
        }
    }

    /**
     * Get attachments for a lab result
     */
    static async getLabAttachments(labResultId: number): Promise<Record<string, unknown>[]> {
        const { data, error } = await supabase
            .from('lab_attachments')
            .select('*')
            .eq('lab_result_id', labResultId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get attachments: ${error.message}`);
        }

        return data || [];
    }
}