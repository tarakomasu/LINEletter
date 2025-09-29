"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Suspense } from "react";

const supabaseUrl = "https://vqxbspchwzhxghoswyrx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeGJzcGNod3poeGdob3N3eXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIzNTM2NywiZXhwIjoyMDY5ODExMzY3fQ.P9JEaOibrGXvvTsJxf2IfgMJzw53MCA6PfX7UHjs6NM";
const supabase = createClient(supabaseUrl, supabaseKey);

interface LetterImage {
  id: number;
  letterId: string;
  imageURL: string;
  pageNumber: number;
  createdAt: string;
}

function LetterViewer() {
  const searchParams = useSearchParams();
  const letterId = searchParams.get("letterId");
  const [images, setImages] = useState<LetterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        {images.map((image) => (
          <div key={image.id} className="mb-8 shadow-lg">
            <Image
              src={image.imageURL}
              alt={`手紙のページ ${image.pageNumber}`}
              width={1400}
              height={2048}
              layout="responsive"
              priority={image.pageNumber === 1}
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
