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
      'A 2D floor plan PDF as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected description
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

const generateKitchenRenderPrompt = ai.definePrompt({
  name: 'generateKitchenRenderPrompt',
  input: {schema: GenerateKitchenRenderInputSchema},
  output: {schema: GenerateKitchenRenderOutputSchema},
  prompt: `You are an AI that generates photorealistic kitchen renders from 2D floor plans.

  Take the provided floor plan and generate a photorealistic kitchen render, preserving the original layout.

  Floor Plan: {{media url=floorPlanDataUri}}
  `, // Corrected Handlebars syntax
});

const generateKitchenRenderFlow = ai.defineFlow(
  {
    name: 'generateKitchenRenderFlow',
    inputSchema: GenerateKitchenRenderInputSchema,
    outputSchema: GenerateKitchenRenderOutputSchema,
  },
  async input => {
    // Call the prompt to generate the kitchen render.
    const {output} = await generateKitchenRenderPrompt(input);
    return output!;
  }
);
