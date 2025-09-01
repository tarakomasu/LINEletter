import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: 'No image data provided.' }, { status: 400 });
    }

    // The data URL is in the format "data:image/png;base64,iVBORw0KGgo..."
    // We need to strip the prefix to get the pure base64 data.
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Vercel allows writing to the /tmp directory
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, `letter-${Date.now()}.png`);

    // Ensure the /tmp directory exists (it should on Vercel)
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    // Return the path of the saved file (relative to the server)
    return NextResponse.json({ message: 'Canvas saved successfully!', path: filePath });
  } catch (error) {
    console.error('Error saving canvas:', error);
    // Check if error is a recognizable type, otherwise cast to Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Error saving canvas', details: errorMessage }, { status: 500 });
  }
}
