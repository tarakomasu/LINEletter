"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { fabric } from "fabric";
import { resumeSparkleAnimation } from "@/lib/effects/sparkle";

const LOGICAL_WIDTH = 1400;
const LOGICAL_HEIGHT = 2048;
const LOGICAL_ASPECT_RATIO = LOGICAL_HEIGHT / LOGICAL_WIDTH;

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
  const [displaySize, setDisplaySize] = useState(() => {
    if (typeof window === "undefined") {
      return { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT };
    }
    const height = window.innerHeight * 0.9;
    return { width: height / LOGICAL_ASPECT_RATIO, height };
  });

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
    setTimeout(() => {
      const height = window.innerHeight * 0.9;
      const width = height / LOGICAL_ASPECT_RATIO;
      setDisplaySize({ width, height });
      fabricInstances.current.forEach((canvas) => {
        if (canvas) {
          canvas.setDimensions({ width, height }, { cssOnly: true });

          const domCanvas = canvas.getElement();
          const wrapperEl = domCanvas.parentElement;
          if (wrapperEl) {
            wrapperEl.style.width = `${width}px`;
            wrapperEl.style.height = `${height}px`;
          }

          canvas.calcOffset();
          canvas.renderAll();
        }
      });
    }, 0);
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
      if (!canvasEl || !image.imageEffectsJson) {
        return;
      }

      if (fabricInstances.current[index]) {
        fabricInstances.current[index]?.dispose();
        fabricInstances.current[index] = null;
      }

      const canvas = new fabric.Canvas(canvasEl);
      fabricInstances.current[index] = canvas;

      canvas.setDimensions(
        { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
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

    return () => {
      fabricInstances.current.forEach((canvas, idx) => {
        canvas?.dispose();
        fabricInstances.current[idx] = null;
      });
    };
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
              width: `${Math.min(
                displaySize.width,
                window.innerWidth * 0.9
              )}px`,
              height: `${displaySize.height}px`,
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
