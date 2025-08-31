import { useState } from "react";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setUploading(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploading(false);
        resolve(result); // Retourne l'image en base64 pour usage local
      };
      
      reader.onerror = () => {
        setUploading(false);
        reject(new Error("Erreur lors de la lecture du fichier"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  return {
    uploadImage,
    uploading
  };
};