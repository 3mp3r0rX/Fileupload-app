// src/app/page.tsx
'use client';

import FileUpload from '../app/components/FileUpload/FileUpload';

export default function UploadPage() {

  
  const handleUploadSuccess = (document: any) => {
    console.log('Upload successful:', document);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Documents</h1>
      
      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        maxSizeMB={10}
        allowedTypes={[
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]}
      />
    </div>
  );
}