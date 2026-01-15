'use client';

import { getMaskByName } from '@/lib/masks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Paintbrush, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ColorPanelProps {
  onColorChange: (modifications: { elementId: string, maskImage: string, newColor: string }[]) => void;
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

type SelectedColors = Record<string, string | null>;


function ColorPalettePicker({ elementId, selectedColor, onColorSelect, isModifying }: { elementId: string; selectedColor: string | null; onColorSelect: (elementId: string, color: string) => void; isModifying: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {colorPalette.map((color) => (
        <button
          key={`${elementId}-${color.name}`}
          type="button"
          title={color.name}
          onClick={() => onColorSelect(elementId, color.value)}
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


export function ColorPanel({ onColorChange, isModifying }: ColorPanelProps) {
  const [selectedColors, setSelectedColors] = useState<SelectedColors>({});

  const handleColorSelect = (elementId: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [elementId]: prev[elementId] === color ? null : color,
    }));
  };

  const handleApplyColors = () => {
    const modifications = Object.entries(selectedColors)
      .map(([elementId, newColor]) => {
        if (!newColor) return null;
        const maskImage = getMaskByName(elementId);
        if (!maskImage) return null;
        return { elementId, maskImage, newColor };
      })
      .filter((item): item is { elementId: string, maskImage: string, newColor: string } => item !== null);
      
    if (modifications.length > 0) {
      onColorChange(modifications);
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
              <ColorPalettePicker 
                elementId={element.id}
                selectedColor={selectedColors[element.id] || null}
                onColorSelect={handleColorSelect}
                isModifying={isModifying}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button onClick={handleApplyColors} disabled={isModifying || Object.values(selectedColors).every(c => c === null)}>
        <Sparkles className="mr-2" />
        Apply Colors
      </Button>
    </div>
  );
}
