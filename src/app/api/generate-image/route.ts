import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = process.env.SUPABASE_BUCKET_NAME!;

interface SharpObject {
  type: "text" | "image";
  width?: number;
  height?: number;
  angle?: number;
  centerX?: number;
  centerY?: number;
  text?: string;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  src?: string;
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
    <svg width="${Math.round(width || 100)}" height="${Math.round(height || 100)}">
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
          layer = layer.ensureAlpha().rotate(obj.angle, {
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          });
        }

        const rotatedLayerBuffer = await layer.toBuffer();
        const metadata = await sharp(rotatedLayerBuffer).metadata();

        const finalLeft = Math.round((obj.centerX || 0) - (metadata.width || 0) / 2);
        const finalTop = Math.round((obj.centerY || 0) - (metadata.height || 0) / 2);

        return {
          input: rotatedLayerBuffer,
          left: finalLeft,
          top: finalTop,
        };
      })
    );

    const validLayers = compositeLayers.filter(Boolean) as sharp.OverlayOptions[];
    image = image.composite(validLayers);

    const imageBuffer = await image.png().toBuffer();
    const outputFileName = `letter-${Date.now()}.png`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(outputFileName, imageBuffer, {
        contentType: "image/png",
        upsert: true, // Overwrite file if it exists
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(outputFileName);

    if (!publicUrlData) {
      throw new Error("Failed to get public URL from Supabase.");
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
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
