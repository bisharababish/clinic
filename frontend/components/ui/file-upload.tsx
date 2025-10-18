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
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesSelected,
    selectedFiles,
    onFileRemove,
    maxFiles = 5,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    disabled = false,
    className
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (maxFileSize && file.size > maxFileSize) {
            return `File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`;
        }

        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
            return `File type ${file.type} is not allowed`;
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
            setError(`Maximum ${maxFiles} files allowed`);
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
                        className="flex flex-col items-center justify-center space-y-4 text-center"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Drag and drop files here, or{' '}
                                <span className="text-primary hover:underline font-medium">
                                    browse
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Maximum {maxFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Accepted: PDF, Images, Text, Word documents
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
                    <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length}/{maxFiles})</h4>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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
