'use server';

/**
 * @fileOverview Flow for generating photorealistic kitchen renders from a 2D floor plan PDF using Leonardo AI's image-to-image capability.
 *
 * - generateKitchenRender - A function that handles the kitchen render generation process.
 * - GenerateKitchenRenderInput - The input type for the generateKitchenRender function.
 * - GenerateKitchenRenderOutput - The return type for the generateKitchenRender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKitchenRenderInputSchema = z.object({
  floorPlanDataUri: z
    .string()
    .describe(
      "A 2D floor plan PDF as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateKitchenRenderInput = z.infer<
  typeof GenerateKitchenRenderInputSchema
>;

const GenerateKitchenRenderOutputSchema = z.object({
  renderDataUri: z
    .string()
    .describe(
      'The generated photorealistic kitchen render as a data URI (PNG or JPG) that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateKitchenRenderOutput = z.infer<
  typeof GenerateKitchenRenderOutputSchema
>;

export async function generateKitchenRender(
  input: GenerateKitchenRenderInput
): Promise<GenerateKitchenRenderOutput> {
  return generateKitchenRenderFlow(input);
}

const generateKitchenRenderFlow = ai.defineFlow(
  {
    name: 'generateKitchenRenderFlow',
    inputSchema: GenerateKitchenRenderInputSchema,
    outputSchema: GenerateKitchenRenderOutputSchema,
  },
  async ({floorPlanDataUri}) => {
    const {output} = await ai.generate({
      prompt: [
        {text: 'You are an AI that generates photorealistic kitchen renders from 2D floor plans. Take the provided floor plan and generate a photorealistic kitchen render, preserving the original layout.'},
        {media: {url: floorPlanDataUri}}
      ],
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: GenerateKitchenRenderOutputSchema,
      },
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    // Fallback in case the model does not return the expected output format.
    if (output) {
      return output;
    } else {
      // Find the first media part and assume it is the rendered image.
      const { message } = await ai.generate({
        prompt: [
          {text: 'You are an AI that generates photorealistic kitchen renders from 2D floor plans. Take the provided floor plan and generate a photorealistic kitchen render, preserving the original layout.'},
          {media: {url: floorPlanDataUri}}
        ],
        model: 'googleai/gemini-2.5-flash',
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const imagePart = message.content.find(part => part.media);
      if (!imagePart || !imagePart.media) {
        throw new Error("Render generation failed: No image was returned from the model.");
      }
      return { renderDataUri: imagePart.media.url };
    }
  }
);