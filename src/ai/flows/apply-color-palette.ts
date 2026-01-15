'use server';

/**
 * @fileOverview Applies a palette of colors to a base kitchen render image.
 * This flow takes a base image and a set of modifications (element, mask, and new color)
 * and applies them in a single operation to generate a new image.
 *
 * - applyColorPalette - A function that handles the color palette application.
 * - ApplyColorPaletteInput - The input type for the function.
 * - ApplyColorPaletteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColorModificationSchema = z.object({
  elementId: z.string().describe("The ID of the element to modify (e.g., 'baseCabinets')."),
  maskImage: z
    .string()
    .describe(
      "The mask image for the region to be recolored, as a data URI."
    ),
  newColor: z
    .string()
    .describe("The desired new color for the selected region (e.g., '#RRGGBB')."),
});

const ApplyColorPaletteInputSchema = z.object({
  baseImage: z
    .string()
    .describe(
      "The base image of the kitchen render, as a data URI."
    ),
  modifications: z.array(ColorModificationSchema).describe("An array of color modifications to apply."),
});
export type ApplyColorPaletteInput = z.infer<
  typeof ApplyColorPaletteInputSchema
>;

const ApplyColorPaletteOutputSchema = z.object({
  modifiedImage: z
    .string()
    .describe(
      "The modified image with the new colors applied, as a data URI."
    ),
});
export type ApplyColorPaletteOutput = z.infer<
  typeof ApplyColorPaletteOutputSchema
>;

export async function applyColorPalette(
  input: ApplyColorPaletteInput
): Promise<ApplyColorPaletteOutput> {
  return applyColorPaletteFlow(input);
}

const applyColorPaletteFlow = ai.defineFlow(
  {
    name: 'applyColorPaletteFlow',
    inputSchema: ApplyColorPaletteInputSchema,
    outputSchema: ApplyColorPaletteOutputSchema,
  },
  async ({baseImage, modifications}) => {
    // If there are no modifications, return the original image
    if (modifications.length === 0) {
      return { modifiedImage: baseImage };
    }
    
    const modificationInstructions = modifications.map(mod => 
        `For the element '${mod.elementId}', apply the color ${mod.newColor}.`
    ).join('\n');

    const mediaParts = [{url: baseImage}, ...modifications.map(mod => ({url: mod.maskImage}))];

    const prompt = {
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {
            text: `You are an AI that modifies kitchen render images. You will receive a base image, and one or more mask images, along with instructions to change the color for each masked region.

Your task is to apply all the color changes to the base image, preserving the original layout, lighting, and realism. Ensure each color is applied only to its corresponding masked area.

Instructions:
${modificationInstructions}

Return the final modified image as a data URI.`,
          },
          ...mediaParts.map(media => ({ media })),
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    };

    try {
        const {output} = await ai.generate({
            ...prompt,
            output: {
                schema: ApplyColorPaletteOutputSchema,
                format: 'json',
            },
        });
        if (output) {
            return output;
        }
    } catch(e) {
        console.log('Structured output failed, falling back to direct media extraction.', e);
    }


     // Fallback in case the model does not return the expected output format.
      const { message } = await ai.generate(prompt);

      const imagePart = message.content.find(part => part.media);
      if (!imagePart || !imagePart.media) {
        throw new Error("Color modification failed: No image was returned from the model.");
      }
      return { modifiedImage: imagePart.media.url };
  }
);
