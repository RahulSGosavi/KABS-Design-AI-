'use client';
import { useState } from 'react';

import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Download, Redo, Loader2 } from 'lucide-react';
import { ColorPanel } from '@/components/color-panel';
import type { ModifyKitchenElementColorsInput } from '@/ai/flows/modify-kitchen-colors';
import { KabsLogo } from './kabs-logo';
import { Separator } from './ui/separator';

interface EditorProps {
  renderedImage: string;
  isModifyingColor: boolean;
  pdfFile: File;
  pdfDataUri: string;
  onColorChange: (input: ModifyKitchenElementColorsInput) => Promise<{ modifiedImage: string } | undefined>;
  onStartOver: () => void;
}

export function Editor({
  renderedImage: initialRenderedImage,
  isModifyingColor,
  pdfFile,
  pdfDataUri,
  onColorChange,
  onStartOver,
}: EditorProps) {
  const [renderedImage, setRenderedImage] = useState(initialRenderedImage);

  const handleColorChange = async (input: ModifyKitchenElementColorsInput) => {
    const result = await onColorChange(input);
    if (result && result.modifiedImage) {
      setRenderedImage(result.modifiedImage);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = renderedImage;
    link.download = 'kitchen-render.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = pdfFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <KabsLogo className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold font-headline">KABS Design AI</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
           <ColorPanel
              baseImage={renderedImage}
              onColorChange={handleColorChange}
              isModifying={isModifyingColor}
            />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <div className="flex flex-col gap-2">
            <Separator className="my-2" />
             <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Downloads</h3>
            </div>
            <Button variant="outline" onClick={handleDownloadImage}>
              <Download className="mr-2" /> Download Image
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="mr-2" /> Download PDF
            </Button>
            <Separator className="my-2" />
            <Button variant="secondary" onClick={onStartOver}>
              <Redo className="mr-2" /> Start Over
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="relative flex h-screen w-full items-center justify-center bg-secondary/30 p-4">
          <div className="relative h-full max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg shadow-2xl">
            <Image
              src={renderedImage}
              alt="Generated Kitchen Render"
              fill
              className="object-contain transition-opacity duration-300"
              priority
              key={renderedImage}
            />
            {isModifyingColor && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
                <p className="mt-4 text-lg font-medium text-white">Updating color...</p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}