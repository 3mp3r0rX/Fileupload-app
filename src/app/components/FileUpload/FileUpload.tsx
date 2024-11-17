import React, { useState, useRef } from 'react';
import { FileUploadProps } from './types';

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 10,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.open('POST', '/api/upload');
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error(xhr.response));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      onUploadSuccess?.(response);
      resetState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-gray-600">
            {file ? (
              <span className="text-blue-600 font-medium">{file.name}</span>
            ) : (
              <>
                <p>Drag and drop your file here or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supported formats: {allowedTypes.join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  Maximum size: {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {file && !error && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-2 px-4 rounded ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      )}

      {loading && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;