"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { fabric } from "fabric";
import { resumeSparkleAnimation } from "@/lib/effects/sparkle";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface LetterImage {
  id: number;
  letterId: string;
  imageURL: string;
  pageNumber: number;
  createdAt: string;
  imageEffectsJson: string | null;
}

function LetterViewer() {
  const searchParams = useSearchParams();
  const letterId = searchParams.get("letterId");
  const [images, setImages] = useState<LetterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const fabricInstances = useRef<(fabric.Canvas | null)[]>([]);

  useEffect(() => {
    if (!letterId) {
      setError("手紙のIDが見つかりません。");
      setLoading(false);
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("letterImages")
          .select("*")
          .eq("letterId", letterId)
          .order("pageNumber", { ascending: true });

        if (fetchError) {
          throw new Error(
            `画像の読み込みに失敗しました: ${fetchError.message}`
          );
        }

        if (!data || data.length === 0) {
          throw new Error("この手紙には画像がありません。");
        }

        setImages(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました。"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [letterId]);

  const updateAllCanvasSizes = () => {
    fabricInstances.current.forEach((canvas) => {
      if (canvas) {
        const logicalWidth = 1400;
        const logicalHeight = 2048;
        const aspectRatio = logicalHeight / logicalWidth;
        const displayHeight = window.innerHeight * 0.9;
        const displayWidth = displayHeight / aspectRatio;

        canvas.setDimensions(
          { width: displayWidth, height: displayHeight },
          { cssOnly: true }
        );
        canvas.calcOffset();
        canvas.renderAll();
      }
    });
  };

  useEffect(() => {
    window.addEventListener("resize", updateAllCanvasSizes);
    return () => {
      window.removeEventListener("resize", updateAllCanvasSizes);
    };
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    images.forEach((image, index) => {
      const canvasEl = canvasRefs.current[index];
      if (!canvasEl || !image.imageEffectsJson || fabricInstances.current[index])
        return;

      const logicalWidth = 1400;
      const logicalHeight = 2048;

      const canvas = new fabric.Canvas(canvasEl);
      fabricInstances.current[index] = canvas;

      canvas.setDimensions(
        { width: logicalWidth, height: logicalHeight },
        { backstoreOnly: true }
      );

      updateAllCanvasSizes();

      canvas.loadFromJSON(image.imageEffectsJson, () => {
        canvas.renderAll();
        canvas.getObjects().forEach((obj) => {
          resumeSparkleAnimation(obj, canvas);
        });
      });
    });
  }, [images]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-4xl">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative mx-auto mb-8 shadow-lg"
            style={{
              width: "90vw",
              maxWidth: `${(window.innerHeight * 0.9) / (2048 / 1400)}px`,
              aspectRatio: "1400 / 2048",
            }}
          >
            <Image
              src={image.imageURL}
              alt={`手紙のページ ${image.pageNumber}`}
              layout="fill"
              objectFit="contain"
              priority={image.pageNumber === 1}
            />
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
              className="absolute top-0 left-0"
            />
          </div>
        ))}
      </div>
      <footer className="mt-10 text-center">
        <p className="text-gray-500">
          <a href="/" className="hover:underline">
            LINE Letterで手紙を作成する
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function LetterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LetterViewer />
    </Suspense>
  );
}
