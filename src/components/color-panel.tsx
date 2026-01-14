'use client';

import type { ModifyKitchenElementColorsInput } from '@/ai/flows/modify-kitchen-colors';
import { getMaskByName } from '@/lib/masks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Paintbrush, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ColorPanelProps {
  baseImage: string;
  onColorChange: (input: ModifyKitchenElementColorsInput) => void;
  isModifying: boolean;
}

const colorableElements = [
  { id: 'baseCabinets', name: 'Base Cabinets' },
  { id: 'wallCabinets', name: 'Wall Cabinets' },
  { id: 'walls', name: 'Walls' },
];

const colorPalette = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Gray', value: '#E5E5E5' },
  { name: 'Sage Green', value: '#B2C2A3' },
  { name: 'Navy Blue', value: '#3A4D6F' },
  { name: 'Cream', value: '#F5F5DC' },
  { name: 'Charcoal', value: '#36454F' },
];

function ColorPalette({ elementId, onColorSelect, isModifying }: { elementId: string; onColorSelect: (color: string) => void; isModifying: boolean }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {colorPalette.map((color) => (
        <button
          key={`${elementId}-${color.name}`}
          type="button"
          title={color.name}
          onClick={() => handleSelect(color.value)}
          disabled={isModifying}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border-2 transition-all disabled:cursor-not-allowed',
            selectedColor === color.value ? 'border-primary' : 'border-transparent'
          )}
          style={{ backgroundColor: color.value }}
        >
          {selectedColor === color.value && <Check className="h-5 w-5 text-primary-foreground mix-blend-difference" />}
          <span className="sr-only">{color.name}</span>
        </button>
      ))}
    </div>
  );
}


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
              <ColorPalette 
                elementId={element.id}
                onColorSelect={(color) => handleColorSelect(element.id, color)}
                isModifying={isModifying}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
