'use client';

import { useState, ChangeEvent } from 'react';
import { useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { UploadCloud, X } from 'lucide-react';
import { Separator } from '../ui/separator';

interface ImageUploaderProps {
  onUrlChange: (url: string) => void;
  uploadPath: string; // e.g., 'products' or 'categories'
  currentUrl: string;
  formFieldName: string;
}

export function ImageUploader({ onUrlChange, uploadPath, currentUrl, formFieldName }: ImageUploaderProps) {
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const storage = useStorage();
  const fileInputId = `file-upload-${formFieldName}`;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image file.' });
        return;
    }
    
    const fileName = `${uploadPath}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const task = uploadBytesResumable(storageRef, file);
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
          toast({
            title: 'Upload Complete',
            description: 'Image has been successfully uploaded.',
          });
        });
      }
    );
  };
  
  const handleCancelUpload = () => {
    if (uploadTask) {
        uploadTask.cancel();
        setIsUploading(false);
        setUploadTask(null);
        setProgress(0);
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
        <div>
            <label htmlFor={fileInputId} className="cursor-pointer">
                <Button type="button" variant="outline" className="w-full" asChild>
                    <span>
                        <UploadCloud className="mr-2" /> Upload from device
                    </span>
                </Button>
            </label>
            <Input id={fileInputId} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
        </div>

      {isUploading && (
        <div className="space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
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
       <Input 
        placeholder="Paste an image URL" 
        value={currentUrl}
        onChange={(e) => onUrlChange(e.target.value)} 
        disabled={isUploading}
       />
    </div>
  );
}
