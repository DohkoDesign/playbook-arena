import { useRef } from 'react';
import { Button } from './button';
import { Upload } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadLocalProps {
  onImageUploaded: (url: string) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const ImageUploadLocal = ({ 
  onImageUploaded, 
  accept = "image/*",
  className = "",
  disabled = false,
  variant = "outline",
  size = "default"
}: ImageUploadLocalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToStorage, uploading } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const imageUrl = await uploadToStorage(file);
    if (imageUrl) {
      onImageUploaded(imageUrl);
    }

    // Reset du input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        className="flex items-center gap-2"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Upload...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload fichier
          </>
        )}
      </Button>
    </div>
  );
};