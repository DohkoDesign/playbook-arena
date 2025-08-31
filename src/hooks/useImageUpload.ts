import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const uploadToStorage = async (file: File, bucket: string = 'avatars'): Promise<string | null> => {
    try {
      setUploading(true);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      toast({
        title: "Image uploadée",
        description: "L'image a été uploadée avec succès",
      });

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploadToStorage,
    uploading
  };
};