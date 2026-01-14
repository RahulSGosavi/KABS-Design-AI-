'use client';

import { useState } from 'react';
import { modifyKitchenElementColors, type ModifyKitchenElementColorsInput } from '@/ai/flows/modify-kitchen-colors';
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
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
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
    if (!pdfDataUri) return;
    setStep('rendering');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ floorPlanDataUri: pdfDataUri }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const output = await response.json();
      setRenderedImage(output.renderDataUri);
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

  const handleColorChange = async (input: ModifyKitchenElementColorsInput) => {
    setIsModifyingColor(true);
    try {
      const output = await modifyKitchenElementColors(input);
      return output;
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
    setRenderedImage(null);
  };

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

  if (step === 'editing' && renderedImage && pdfFile && pdfDataUri) {
    return (
      <Editor
        renderedImage={renderedImage}
        isModifyingColor={isModifyingColor}
        pdfFile={pdfFile}
        pdfDataUri={pdfDataUri}
        onColorChange={handleColorChange}
        onStartOver={handleStartOver}
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