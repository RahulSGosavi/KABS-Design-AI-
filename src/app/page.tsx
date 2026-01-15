'use client';

import { useState } from 'react';
import { applyColorPalette, type ApplyColorPaletteInput } from '@/ai/flows/apply-color-palette';
import { useToast } from '@/hooks/use-toast';
import { UploadStep } from '@/components/upload-step';
import { Editor } from '@/components/editor';
import { Loader2 } from 'lucide-react';
import { KabsLogo } from '@/components/kabs-logo';

type Step = 'upload' | 'rendering' | 'editing';

export default function Home() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [originalRenderedImage, setOriginalRenderedImage] = useState<string | null>(null);
  const [modifiedRenderedImage, setModifiedRenderedImage] = useState<string | null>(null);
  const [isModifyingColor, setIsModifyingColor] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setPdfFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          setPdfDataUri(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPdfDataUri(null);
    }
  };

  const handleGenerate = async () => {
    if (!pdfFile) return;
    setStep('rendering');
    try {
      const formData = new FormData();
      formData.append('pdfFile', pdfFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const output = await response.json();
      setOriginalRenderedImage(output.renderDataUri);
      setModifiedRenderedImage(output.renderDataUri);
      setStep('editing');
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Render Failed',
        description: err.message || 'Could not generate the kitchen render. Please try again.',
      });
      setStep('upload');
    }
  };

  const handleColorChange = async (input: ApplyColorPaletteInput) => {
    if (!originalRenderedImage) return;
    setIsModifyingColor(true);
    try {
      // Always use the original image as the base for modifications
      const finalInput = { ...input, baseImage: originalRenderedImage };
      const output = await applyColorPalette(finalInput);
      if (output && output.modifiedImage) {
        setModifiedRenderedImage(output.modifiedImage);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Color Change Failed',
        description: err.message || 'Could not apply the color change. Please try again.',
      });
    } finally {
      setIsModifyingColor(false);
    }
  };

  const handleStartOver = () => {
    setStep('upload');
    setPdfFile(null);
    setPdfDataUri(null);
    setOriginalRenderedImage(null);
    setModifiedRenderedImage(null);
  };
  
  const handleResetToOriginal = () => {
    setModifiedRenderedImage(originalRenderedImage);
  }

  if (step === 'rendering') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <KabsLogo className="h-12 w-12 text-primary" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Generating Your Kitchen
        </h1>
        <p className="text-muted-foreground">
          The AI is working its magic. This might take a moment...
        </p>
      </main>
    );
  }

  if (step === 'editing' && modifiedRenderedImage && pdfFile && pdfDataUri) {
    return (
      <Editor
        renderedImage={modifiedRenderedImage}
        isModifyingColor={isModifyingColor}
        pdfFile={pdfFile}
        pdfDataUri={pdfDataUri}
        onColorChange={handleColorChange}
        onStartOver={handleStartOver}
        onResetToOriginal={handleResetToOriginal}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <UploadStep
        onFileSelect={handleFileSelect}
        onGenerate={handleGenerate}
        pdfFile={pdfFile}
      />
    </main>
  );
}
