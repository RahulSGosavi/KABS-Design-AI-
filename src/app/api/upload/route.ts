import { generateKitchenRender } from '@/ai/flows/generate-kitchen-render';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdfFile') as File | null;

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'Missing PDF file' },
        { status: 400 }
      );
    }

    // Convert file to buffer, then to Base64 data URI
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const floorPlanDataUri = `data:${pdfFile.type};base64,${buffer.toString('base64')}`;

    const output = await generateKitchenRender({ floorPlanDataUri });

    return NextResponse.json(output);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
