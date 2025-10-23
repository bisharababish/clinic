import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Alert, AlertDescription } from './alert';
import { Upload, X, File, FileText, Image, FileX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    selectedFiles: File[];
    onFileRemove: (index: number) => void;
    maxFiles?: number;
    maxFileSize?: number; // in bytes
    acceptedTypes?: string[];
    disabled?: boolean;
    className?: string;
    // Translation props
    isRTL?: boolean;
    translations?: {
        dragAndDrop: string;
        browse: string;
        maxFiles: string;
        acceptedTypes: string;
        selectedFiles: string;
        fileTooLarge: string;
        fileTypeNotAllowed: string;
        maximumFilesAllowed: string;
    };
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesSelected,
    selectedFiles,
    onFileRemove,
    maxFiles = 5,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    disabled = false,
    className,
    isRTL = false,
    translations = {
        dragAndDrop: 'Drag and drop files here, or',
        browse: 'browse',
        maxFiles: `Maximum {maxFiles} files, up to {maxSize}MB each`,
        acceptedTypes: 'Accepted: PDF, Images, Text, Word documents',
        selectedFiles: 'Selected Files',
        fileTooLarge: 'File {fileName} is too large. Maximum size is {maxSize}MB',
        fileTypeNotAllowed: 'File type {fileType} is not allowed',
        maximumFilesAllowed: 'Maximum {maxFiles} files allowed'
    }
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (maxFileSize && file.size > maxFileSize) {
            return translations.fileTooLarge
                .replace('{fileName}', file.name)
                .replace('{maxSize}', Math.round(maxFileSize / 1024 / 1024).toString());
        }

        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
            return translations.fileTypeNotAllowed.replace('{fileType}', file.type);
        }

        return null;
    };

    const handleFiles = useCallback((files: FileList | File[]) => {
        setError(null);
        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        // Check if adding these files would exceed maxFiles
        if (selectedFiles.length + fileArray.length > maxFiles) {
            setError(translations.maximumFilesAllowed.replace('{maxFiles}', maxFiles.toString()));
            return;
        }

        fileArray.forEach(file => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors.join(', '));
        }

        if (validFiles.length > 0) {
            onFilesSelected(validFiles);
        }
    }, [selectedFiles.length, maxFiles, acceptedTypes, maxFileSize, onFilesSelected]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <Image className="w-4 h-4" />;
        } else if (file.type === 'application/pdf') {
            return <FileText className="w-4 h-4" />;
        } else {
            return <File className="w-4 h-4" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={cn("space-y-4", className)}>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
            />

            <Card
                className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer hover:border-primary hover:bg-primary/5",
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleClick}
            >
                <CardContent className="p-6">
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center space-y-4 text-center",
                            isRTL ? "rtl" : "ltr"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {translations.dragAndDrop}{' '}
                                <span className="text-primary hover:underline font-medium">
                                    {translations.browse}
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {translations.maxFiles
                                    .replace('{maxFiles}', maxFiles.toString())
                                    .replace('{maxSize}', Math.round(maxFileSize / 1024 / 1024).toString())}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {translations.acceptedTypes}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <FileX className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className={cn("text-sm font-medium", isRTL ? "text-right" : "text-left")}>
                        {translations.selectedFiles} ({selectedFiles.length}/{maxFiles})
                    </h4>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className={cn(
                                    "flex items-center justify-between p-3 bg-muted rounded-lg",
                                    isRTL ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center",
                                    isRTL ? "space-x-reverse space-x-3" : "space-x-3"
                                )}>
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            isRTL ? "text-right" : "text-left"
                                        )}>{file.name}</p>
                                        <p className={cn(
                                            "text-xs text-muted-foreground",
                                            isRTL ? "text-right" : "text-left"
                                        )}>{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFileRemove(index)}
                                    disabled={disabled}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload; 
