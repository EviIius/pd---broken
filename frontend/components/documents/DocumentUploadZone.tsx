import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  compact?: boolean; // New prop for compact mode
}

const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  compact = false
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    const newErrors: string[] = [];

    // Check for rejected files
    rejectedFiles.forEach((rejectedFile) => {
      rejectedFile.errors.forEach((error: any) => {
        switch (error.code) {
          case 'file-too-large':
            newErrors.push(`${rejectedFile.file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
            break;
          case 'file-invalid-type':
            newErrors.push(`${rejectedFile.file.name} is not a supported file type.`);
            break;
          case 'too-many-files':
            newErrors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
            break;
          default:
            newErrors.push(`${rejectedFile.file.name}: ${error.message}`);
        }
      });
    });

    // Validate accepted files
    const validFiles: File[] = [];
    acceptedFiles.forEach((file) => {
      if (file.size > maxFileSize) {
        newErrors.push(`${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, maxFiles, maxFileSize]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles,
    maxSize: maxFileSize,
    noClick: true,
    noKeyboard: true
  });

  const getBorderColor = () => {
    if (isDragReject) return 'border-red-400 bg-red-50';
    if (isDragAccept) return 'border-green-400 bg-green-50';
    if (isDragActive) return 'border-blue-400 bg-blue-50';
    return 'border-gray-300 hover:border-gray-400';
  };

  const clearErrors = () => setErrors([]);

  // Compact mode - just a button
  if (compact) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={open}
          className="px-4 py-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          Add Files
        </Button>
        <input {...getInputProps()} />
        
        {/* Error Messages for compact mode */}
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <Alert key={index} variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearErrors}
                    className="h-auto p-1 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${getBorderColor()}`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`h-12 w-12 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop documents here'
              }
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF (.pdf) and Word (.docx, .doc) files
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files • {maxFileSize / (1024 * 1024)}MB per file
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={open}
              className="px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearErrors}
                  className="h-auto p-1 hover:bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* File Type Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Supported File Types:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span>PDF Documents (.pdf)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>Word Documents (.docx)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded"></div>
            <span>Legacy Word (.doc)</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          ✓ Large file support up to 50MB per document
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadZone;
