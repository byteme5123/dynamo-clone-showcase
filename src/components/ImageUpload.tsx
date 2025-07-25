import React, { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  bucket: string;
  folder?: string;
  onUploadComplete: (url: string) => void;
  existingImage?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  folder = '',
  onUploadComplete,
  existingImage,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImage || null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      uploadImage(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="text-center">
            <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <div className="mt-4">
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-foreground">
                  {uploading ? 'Uploading...' : 'Upload an image'}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 5MB
                </span>
              </label>
              <input
                id="image-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};