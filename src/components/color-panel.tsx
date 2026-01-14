'use client';

import { useRef } from 'react';
import type { ModifyKitchenElementColorsInput } from '@/ai/flows/modify-kitchen-colors';
import { getMaskByName } from '@/lib/masks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Paintbrush } from 'lucide-react';

interface ColorPanelProps {
  baseImage: string;
  onColorChange: (input: ModifyKitchenElementColorsInput) => void;
  isModifying: boolean;
}

const colorableElements = [
  { id: 'baseCabinets', name: 'Base Cabinets', defaultColor: '#A0A0A0' },
  { id: 'wallCabinets', name: 'Wall Cabinets', defaultColor: '#C0C0C0' },
  { id: 'walls', name: 'Walls', defaultColor: '#F0F0F0' },
];

export function ColorPanel({ baseImage, onColorChange, isModifying }: ColorPanelProps) {
  const handleColorSelect = (elementId: string, newColor: string) => {
    const maskImage = getMaskByName(elementId);
    if (maskImage) {
      onColorChange({
        baseImage,
        maskImage,
        newColor,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Paintbrush className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Live Color Change</h3>
      </div>
      <Accordion type="single" collapsible defaultValue="baseCabinets" className="w-full">
        {colorableElements.map((element) => (
          <AccordionItem value={element.id} key={element.id}>
            <AccordionTrigger>{element.name}</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-4 p-2">
                <Label htmlFor={`${element.id}-color-picker`} className="sr-only">
                  {element.name} Color
                </Label>
                <input
                  id={`${element.id}-color-picker`}
                  type="color"
                  defaultValue={element.defaultColor}
                  onChange={(e) => handleColorSelect(element.id, e.target.value)}
                  disabled={isModifying}
                  className="h-10 w-10 cursor-pointer appearance-none rounded-md border-none bg-transparent p-0 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-muted-foreground">Select a color to instantly update the render.</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}