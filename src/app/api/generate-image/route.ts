import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

interface SharpObject {
  type: "text" | "image";
  width?: number;
  height?: number;
  angle?: number;
  centerX?: number;
  centerY?: number;
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

const createTextSvg = (obj: SharpObject): Buffer => {
  const { text, fontSize, fill, fontFamily, width, height } = obj;
  const svg = `
        <svg width="${Math.round(width || 100)}" height="${Math.round(
    height || 100
  )}">
            <style>
                .title { 
                    fill: ${fill}; 
                    font-size: ${fontSize}px; 
                    font-family: ${fontFamily}; 
                    text-anchor: middle;
                    dominant-baseline: middle;
                }
            </style>
            <text x="50%" y="50%" class="title">${text}</text>
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

    const outputDir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(outputDir, { recursive: true });

    const backgroundPath = path.join(process.cwd(), "public", background);
    let image = sharp(backgroundPath).resize(width, height);

    const compositeLayers = await Promise.all(
      objects.map(async (obj) => {
        let layerBuffer: Buffer;

        if (obj.type === "text") {
          const textSvg = createTextSvg(obj);
          layerBuffer = await sharp(textSvg, { density: 300 }).toBuffer();
        } else if (obj.type === "image" && obj.src) {
          const base64Data = obj.src.split(";base64,").pop();
          if (!base64Data) return null;
          layerBuffer = Buffer.from(base64Data, "base64");
        } else {
          return null;
        }

        let layer = sharp(layerBuffer);

        if (obj.width && obj.height) {
          layer = layer.resize(Math.round(obj.width), Math.round(obj.height));
        }

        if (obj.angle) {
          // Ensure alpha channel exists before rotating to make background transparent
          layer = layer.ensureAlpha().rotate(obj.angle, {
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          });
        }

        const rotatedLayerBuffer = await layer.toBuffer();
        const metadata = await sharp(rotatedLayerBuffer).metadata();

        const finalLeft = Math.round(
          (obj.centerX || 0) - (metadata.width || 0) / 2
        );
        const finalTop = Math.round(
          (obj.centerY || 0) - (metadata.height || 0) / 2
        );

        return {
          input: rotatedLayerBuffer,
          left: finalLeft,
          top: finalTop,
        };
      })
    );

    const validLayers = compositeLayers.filter(
      Boolean
    ) as sharp.OverlayOptions[];
    image = image.composite(validLayers);

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
