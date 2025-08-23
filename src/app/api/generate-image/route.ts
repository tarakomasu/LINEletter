import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Define the structure of the request body
interface SharpObject {
  type: "text" | "image";
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  angle?: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  // Image specific
  src?: string; // Expecting data URL for images
}

interface RequestBody {
  width: number;
  height: number;
  background: string;
  objects: SharpObject[];
}

// Function to create an SVG for text rendering
const createTextSvg = (obj: SharpObject): Buffer => {
  const { text, fontSize, fill, fontFamily, width, height } = obj;
  // A simple SVG with basic text styling.
  const svg = `
        <svg width="${Math.round(width || 100)}" height="${Math.round(
    height || 100
  )}">
            <style>
                .title { 
                    fill: ${fill}; 
                    font-size: ${fontSize}px; 
                    font-family: ${fontFamily}; 
                }
            </style>
            <text x="0" y="${
              fontSize! * 0.8
            }" class="title">${text}</text>
        </svg>
    `;
  return Buffer.from(svg);
};

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

    // Prepare composite layers
    const compositeLayers = await Promise.all(
      objects.map(async (obj) => {
        let buffer: Buffer;
        let layer: sharp.Sharp;

        if (obj.type === "text") {
          buffer = createTextSvg(obj);
          // Render SVG at a higher density for better quality, then resize.
          layer = sharp(buffer, { density: 300 });
        } else if (obj.type === "image" && obj.src) {
          const base64Data = obj.src.split(";base64,").pop();
          if (!base64Data) {
            // This might be a relative URL, try to resolve it
            const imagePath = path.join(process.cwd(), "public", obj.src);
            try {
              await fs.access(imagePath);
              buffer = await fs.readFile(imagePath);
            } catch (e) {
              throw new Error(`Invalid image src: ${obj.src}`);
            }
          } else {
            buffer = Buffer.from(base64Data, "base64");
          }
          layer = sharp(buffer);
        } else {
          return null; // Skip unknown objects
        }

        if (obj.width && obj.height) {
          layer = layer.resize(
            Math.round(obj.width),
            Math.round(obj.height)
          );
        }
        if (obj.angle) {
          layer = layer.rotate(obj.angle, {
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          });
        }

        return {
          input: await layer.toBuffer(),
          left: Math.round(obj.left || 0),
          top: Math.round(obj.top || 0),
        };
      })
    );

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
