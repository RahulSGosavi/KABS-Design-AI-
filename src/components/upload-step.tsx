'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { KabsLogo } from './kabs-logo';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

interface UploadStepProps {
  onFileSelect: (file: File | null) => void;
  onGenerate: () => void;
  pdfFile: File | null;
}

const bgImage = PlaceHolderImages.find(img => img.id === 'upload-background');

export function UploadStep({ onFileSelect, onGenerate, pdfFile }: UploadStepProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type === 'application/pdf') {
        setUploadProgress(0);
        const reader = new FileReader();
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
        reader.onload = () => {
          onFileSelect(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleGenerateClick = () => {
    setLoading(true);
    onGenerate();
  }

  const handleRemoveFile = () => {
      onFileSelect(null);
      setUploadProgress(null);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="relative z-10 w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <KabsLogo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">KABS Design AI</CardTitle>
          <CardDescription>Transform your 2D floor plans into photorealistic kitchen renders.</CardDescription>
        </CardHeader>
        <CardContent>
          {!pdfFile && uploadProgress === null ? (
            <div
              {...getRootProps()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
                isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Drag & drop a PDF file here</p>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
            </div>
          ) : uploadProgress !== null && uploadProgress < 100 ? (
            <div className='flex flex-col items-center gap-4'>
                <p className='text-muted-foreground'>Uploading file...</p>
                <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <File className="h-6 w-6 shrink-0 text-primary" />
                <span className="truncate font-medium">{pdfFile?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            disabled={!pdfFile || loading}
            onClick={handleGenerateClick}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Render
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
