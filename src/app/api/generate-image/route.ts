import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Define the structure of the request body
interface SharpObject {
  type: "raster";
  src: string; // Expecting data URL for the rasterized object
  left?: number;
  top?: number;
}

interface RequestBody {
  width: number;
  height: number;
  background: string;
  objects: SharpObject[];
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { background, objects } = body;
    const width = Math.round(body.width);
    const height = Math.round(body.height);

    if (!width || !height || !background || !objects) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the output directory exists
    const outputDir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(outputDir, { recursive: true });

    // Load the background image
    const backgroundPath = path.join(process.cwd(), "public", background);
    let image = sharp(backgroundPath).resize(width, height);

    // Prepare composite layers from the already rasterized objects
    const compositeLayers = objects.map((obj) => {
      if (obj.type !== "raster" || !obj.src) {
        return null;
      }

      const base64Data = obj.src.split(";base64,").pop();
      if (!base64Data) {
        return null;
      }

      const buffer = Buffer.from(base64Data, "base64");

      return {
        input: buffer,
        left: Math.round(obj.left || 0),
        top: Math.round(obj.top || 0),
      };
    });

    const validLayers = compositeLayers.filter(Boolean) as {
      input: Buffer;
      left: number;
      top: number;
    }[];

    image = image.composite(validLayers);

    // Save the final image
    const outputFileName = `letter-${Date.now()}.png`;
    const outputPath = path.join(outputDir, outputFileName);
    await image.toFile(outputPath);

    const publicUrl = `/generated/${outputFileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Image generation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate image", details: errorMessage },
      { status: 500 }
    );
  }
}
