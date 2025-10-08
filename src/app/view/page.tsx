"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { fabric } from "fabric";
import { resumeSparkleAnimation } from "@/lib/effects/sparkle";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LOGICAL_WIDTH = 1400;
const LOGICAL_HEIGHT = 2048;

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
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    requestAnimationFrame(() => {
      fabricInstances.current.forEach((canvasInstance, index) => {
        const canvasEl = canvasRefs.current[index];
        const containerEl = containerRefs.current[index];
        if (!canvasInstance || !canvasEl || !containerEl) return;

        const wrapperEl = canvasEl.parentElement as HTMLDivElement | null;
        if (!wrapperEl) return;

        const displayWidth = containerEl.clientWidth;
        if (!displayWidth) return;

        const displayHeight = Math.round(
          (displayWidth * LOGICAL_HEIGHT) / LOGICAL_WIDTH
        );

        wrapperEl.style.width = `${displayWidth}px`;
        wrapperEl.style.height = `${displayHeight}px`;
        wrapperEl.style.position = "absolute";
        wrapperEl.style.top = "0";
        wrapperEl.style.left = "0";

        const lowerCanvasEl = canvasInstance.getElement();
        const upperCanvasEl = canvasInstance.getSelectionElement();

        const canvasElements = [canvasEl, lowerCanvasEl, upperCanvasEl].filter(
          (el): el is HTMLCanvasElement => Boolean(el)
        );

        canvasElements.forEach((el) => {
          el.style.width = "100%";
          el.style.height = "100%";
          el.style.position = "absolute";
          el.style.top = "0";
          el.style.left = "0";
        });

        canvasInstance.setDimensions(
          { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
          { backstoreOnly: true }
        );

        canvasInstance.calcOffset();
        canvasInstance.requestRenderAll();
      });
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
      if (
        !canvasEl ||
        fabricInstances.current[index] ||
        !image.imageEffectsJson
      ) {
        return;
      }

      const canvas = new fabric.Canvas(canvasEl, {
        width: LOGICAL_WIDTH,
        height: LOGICAL_HEIGHT,
      });
      fabricInstances.current[index] = canvas;

      canvas.loadFromJSON(image.imageEffectsJson, () => {
        canvas.renderAll();
        canvas.getObjects().forEach((obj) => {
          resumeSparkleAnimation(obj, canvas);
        });
        // Ensure layout is stable before calculating size
        updateAllCanvasSizes();
      });
    });
  }, [images]);

  useEffect(() => {
    return () => {
      fabricInstances.current.forEach((canvas, index) => {
        canvas?.dispose();
        fabricInstances.current[index] = null;
        canvasRefs.current[index] = null;
        containerRefs.current[index] = null;
      });
    };
  }, []);

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
      <div className="w-full max-w-2xl">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative mx-auto mb-8 shadow-lg"
            style={{
              aspectRatio: "1400 / 2048",
            }}
            ref={(el) => {
              containerRefs.current[index] = el;
            }}
          >
            <Image
              src={image.imageURL}
              alt={`手紙のページ ${image.pageNumber}`}
              width={LOGICAL_WIDTH}
              height={LOGICAL_HEIGHT}
              priority={image.pageNumber === 1}
              sizes="(max-width: 768px) 100vw, 672px"
              className="block w-full h-auto"
              onLoadingComplete={updateAllCanvasSizes}
            />
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
              className="absolute top-0 left-0"
              style={{ pointerEvents: "none" }}
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
