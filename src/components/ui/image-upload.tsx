import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string;
  placeholder?: string;
  className?: string;
  variant?: "avatar" | "banner" | "square";
  size?: "sm" | "md" | "lg" | "xl";
}

export const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  placeholder,
  className,
  variant = "avatar",
  size = "md"
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearImage = () => {
    onImageSelect("");
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: "w-16 h-16",
      md: "w-24 h-24", 
      lg: "w-32 h-32",
      xl: "w-48 h-48"
    };
    return sizes[size];
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "avatar":
        return "rounded-full";
      case "banner":
        return "rounded-lg aspect-video w-full max-w-md h-32";
      case "square":
        return "rounded-lg aspect-square";
      default:
        return "rounded-full";
    }
  };

  if (variant === "avatar") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className="relative">
          <Avatar 
            className={cn(
              getSizeClasses(),
              "cursor-pointer border-2 border-dashed transition-colors",
              dragOver ? "border-primary bg-primary/10" : "border-muted-foreground/30",
              currentImage ? "border-solid border-border" : ""
            )}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <AvatarImage src={currentImage} />
            <AvatarFallback className="bg-muted">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </AvatarFallback>
          </Avatar>
          
          {currentImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {currentImage ? "Changer" : "Ajouter une photo"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Glissez-déposez ou cliquez pour sélectionner
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
          getVariantClasses(),
          dragOver ? "border-primary bg-primary/10" : "border-muted-foreground/30",
          currentImage ? "border-solid border-border" : ""
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImage ? (
          <div className="relative w-full h-full">
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm font-medium">
              {placeholder || "Ajouter une image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Glissez-déposez ou cliquez pour sélectionner
            </p>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={handleClick}
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {currentImage ? "Changer l'image" : "Sélectionner une image"}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};