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
    const prompt = {
        prompt: [
        {text: 'You are an AI that generates photorealistic kitchen renders from 2D floor plans. Your task is to take the provided floor plan and generate a photorealistic kitchen render. It is crucial that you preserve the original layout, cabinet styles (e.g., wooden, not glass), and appliance placements exactly as specified in the floor plan. Do not add or change elements like cabinet materials.'},
        {media: {url: floorPlanDataUri}}
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    try {
      const {output} = await ai.generate({
        ...prompt,
        output: {
          schema: GenerateKitchenRenderOutputSchema,
        },
      });

      if (output) {
        return output;
      }
    } catch (e) {
      console.log('Structured output failed, falling back to direct media extraction.', e);
    }

    // Fallback in case the model does not return the expected output format.
    const { message } = await ai.generate(prompt);

    const imagePart = message.content.find(part => part.media);
    if (!imagePart || !imagePart.media) {
      throw new Error("Render generation failed: No image was returned from the model.");
    }
    return { renderDataUri: imagePart.media.url };
  }
);
