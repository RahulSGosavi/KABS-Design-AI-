
import { generateKitchenRender } from '@/ai/flows/generate-kitchen-render';
import { NextResponse } from 'next/server';

// Increase the default body size limit for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const { floorPlanDataUri } = await request.json();

    if (!floorPlanDataUri) {
      return NextResponse.json(
        { error: 'Missing floorPlanDataUri' },
        { status: 400 }
      );
    }

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
