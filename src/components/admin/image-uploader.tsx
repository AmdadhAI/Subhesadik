'use client';

import { useState, ChangeEvent, useRef } from 'react';
import { useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { UploadCloud, X, Trash2, Info } from 'lucide-react';
import { Separator } from '../ui/separator';
import Image from 'next/image';

interface ImageUploaderProps {
  onUrlChange: (url: string) => void;
  uploadPath: string; // e.g., 'products' or 'categories'
  currentUrl: string;
  formFieldName: string;
  maxSizeKB?: number; // Optional max file size in KB
  autoDeleteOld?: boolean; // Auto-delete old image when uploading new one
}

/**
 * Enhanced image uploader with:
 * - Automatic WebP conversion
 * - Image optimization (resize to max 1920px)
 * - Preview before upload
 * - File size display
 * - Automatic cleanup of old images
 */
export function ImageUploader({
  onUrlChange,
  uploadPath,
  currentUrl,
  formFieldName,
  maxSizeKB = 5000, // 5MB default
  autoDeleteOld = true
}: ImageUploaderProps) {
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);

  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = `file-upload-${formFieldName}`;

  /**
   * Convert image to WebP and optimize size
   */
  const optimizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate new dimensions (max 1920px width, maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxWidth = 1920;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          'image/webp',
          0.85 // 85% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * Delete old image from storage if it exists
   */
  const deleteOldImage = async (url: string) => {
    if (!url || !url.includes('firebasestorage.googleapis.com')) return;

    try {
      // Extract path from Firebase Storage URL
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
      if (!pathMatch) return;

      const filePath = decodeURIComponent(pathMatch[1].split('?')[0]);
      const fileRef = ref(storage, filePath);

      await deleteObject(fileRef);
      console.log('Old image deleted:', filePath);
    } catch (error) {
      console.warn('Failed to delete old image:', error);
      // Don't throw - deletion failure shouldn't block upload
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image file.' });
      return;
    }

    // Validate file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: `Maximum file size is ${maxSizeKB / 1024}MB. Your file is ${(fileSizeKB / 1024).toFixed(2)}MB.`
      });
      return;
    }

    // Set file info and preview
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);

    try {
      // Optimize image to WebP
      const optimizedBlob = await optimizeImage(file);
      const optimizedSizeKB = optimizedBlob.size / 1024;

      // Update file info with optimized size
      setFileInfo({
        name: file.name.replace(/\.[^.]+$/, '.webp'),
        size: optimizedBlob.size,
        type: 'image/webp'
      });

      // Delete old image if auto-cleanup is enabled
      if (autoDeleteOld && currentUrl) {
        await deleteOldImage(currentUrl);
      }

      // Upload optimized image
      const fileName = `${uploadPath}/${Date.now()}_optimized.webp`;
      const storageRef = ref(storage, fileName);
      const task = uploadBytesResumable(storageRef, optimizedBlob);
      setUploadTask(task);
      setIsUploading(true);

      task.on('state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        },
        (error) => {
          setIsUploading(false);
          setUploadTask(null);
          console.error("Upload error:", error);
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message,
          });
        },
        () => {
          getDownloadURL(task.snapshot.ref).then((downloadURL) => {
            onUrlChange(downloadURL);
            setIsUploading(false);
            setUploadTask(null);
            setPreviewUrl(null);
            setFileInfo(null);

            // Clear file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }

            toast({
              title: 'Upload Complete',
              description: `Image optimized to WebP (${(optimizedSizeKB).toFixed(0)}KB) and uploaded successfully.`,
            });
          });
        }
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: error.message || 'Failed to process image',
      });
      setPreviewUrl(null);
      setFileInfo(null);
    }
  };

  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setUploadTask(null);
      setProgress(0);
      setPreviewUrl(null);
      setFileInfo(null);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!currentUrl) return;

    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteOldImage(currentUrl);
      onUrlChange('');
      toast({
        title: 'Image Deleted',
        description: 'Image has been removed from storage.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete image',
      });
    }
  };

  return (
    <div className="rounded-md border p-4 space-y-4">
      {/* Current Image Preview */}
      {currentUrl && !isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Image</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteCurrent}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
            <Image
              src={currentUrl}
              alt="Current"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <label htmlFor={fileInputId} className="cursor-pointer">
          <Button type="button" variant="outline" className="w-full" asChild disabled={isUploading}>
            <span>
              <UploadCloud className="mr-2" />
              {currentUrl ? 'Replace Image' : 'Upload from Device'}
            </span>
          </Button>
        </label>
        <Input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isUploading}
        />
      </div>

      {/* File Info & Preview */}
      {previewUrl && fileInfo && !isUploading && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-xs space-y-1 flex-1">
              <p className="font-medium">{fileInfo.name}</p>
              <p className="text-muted-foreground">
                Size: {(fileInfo.size / 1024).toFixed(0)}KB → Will be converted to WebP
              </p>
            </div>
          </div>
          <div className="relative w-full h-32 bg-background rounded-md overflow-hidden">
            <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {progress < 100 ? `Uploading... ${Math.round(progress)}%` : 'Finalizing...'}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={handleCancelUpload}>
              <X className="mr-2" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
      </div>

      {/* Manual URL Input */}
      <Input
        placeholder="Paste an image URL"
        value={currentUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        disabled={isUploading}
      />
    </div>
  );
}
