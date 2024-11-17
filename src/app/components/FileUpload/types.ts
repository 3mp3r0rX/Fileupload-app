export interface FileUploadProps {
    onUploadSuccess?: (document: any) => void;
    onUploadError?: (error: string) => void;
    maxSizeMB?: number;
    allowedTypes?: string[];
    className?: string;
  }

  export interface UserInfo {
    name: string;
    email: string;
  }

  