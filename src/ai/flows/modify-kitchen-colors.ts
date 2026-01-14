'use server';

/**
 * @fileOverview Allows users to modify the colors of kitchen elements like cabinets and walls,
 * using Leonardo AI's masked region update tool, ensuring the layout and lighting remain consistent.
 *
 * - modifyKitchenElementColors - A function that handles the color modification process.
 * - ModifyKitchenElementColorsInput - The input type for the modifyKitchenElementColors function.
 * - ModifyKitchenElementColorsOutput - The return type for the modifyKitchenElementColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyKitchenElementColorsInputSchema = z.object({
  baseImage: z
    .string()
    .describe(
      "The base image of the kitchen render, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  maskImage: z
    .string()
    .describe(
      "The mask image highlighting the region to be recolored, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  newColor: z
    .string()
    .describe("The desired new color for the selected region (e.g., '#RRGGBB')."),
});

export type ModifyKitchenElementColorsInput = z.infer<
  typeof ModifyKitchenElementColorsInputSchema
>;

const ModifyKitchenElementColorsOutputSchema = z.object({
  modifiedImage: z
    .string()
    .describe(
      "The modified image with the new color applied to the specified region, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ModifyKitchenElementColorsOutput = z.infer<
  typeof ModifyKitchenElementColorsOutputSchema
>;

export async function modifyKitchenElementColors(
  input: ModifyKitchenElementColorsInput
): Promise<ModifyKitchenElementColorsOutput> {
  return modifyKitchenElementColorsFlow(input);
}

const modifyKitchenElementColorsFlow = ai.defineFlow(
  {
    name: 'modifyKitchenElementColorsFlow',
    inputSchema: ModifyKitchenElementColorsInputSchema,
    outputSchema: ModifyKitchenElementColorsOutputSchema,
  },
  async ({baseImage, maskImage, newColor}) => {
    const prompt = {
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {
            text: `You are an AI that takes in a base image of a kitchen render, a mask image highlighting a region (e.g., cabinets, walls), and a desired new color.

Your task is to modify the color of the specified region in the base image to the new color, ensuring that the layout, lighting, and overall realism of the image are preserved.
You must only modify the color of the region specified in the mask, and leave the rest of the image unchanged.

New Color: ${newColor}

Return the modified image as a data URI.`,
          },
          {media: {url: baseImage}},
          {media: {url: maskImage}},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    };

    try {
        const {output} = await ai.generate({
            ...prompt,
            output: {
                schema: ModifyKitchenElementColorsOutputSchema,
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
