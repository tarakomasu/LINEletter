"use client";

import { useCallback, useState } from "react";
import type { AnimationEvent } from "react";
import Image from "next/image";

const LETTER_IMAGE = "/template-papers/aquarium.png";

const STROKE_COLOR = "#22c55e";
const STROKE_WIDTH = 8;

// SVGEnvelope は封筒の背面パネルと前面フラップを描画する。
// viewBox は 360x220。親要素に対して preserveAspectRatio="none" を指定しているため、
// 実際の描画位置は親コンテナの幅/高さにスケーリングされる点に注意すること。
const SVGEnvelope = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 360 220"
    preserveAspectRatio="none"
    className="absolute inset-0"
  >
    <g
      fill="#ffffff"
      stroke={STROKE_COLOR}
      strokeWidth={STROKE_WIDTH}
      strokeLinejoin="round"
    >
      {/* 背面パネル
          - 左上角 (10,0) から右上角 (350,0) まで直線: 蓋が接する基準線。
          - 下辺 (y=210) は封筒底部。描画座標は viewBox に合わせて調整する。 */}
      <path d="M 10 0 H 350 V 210 H 10 V 0 Z" />

      {/* 左サイドフラップ
          - 起点 (10,0) は背面パネル左上角に一致。
          - 下端 (10,210) は底辺と揃え、三角頂点 (180,130) で中央と合流する。 */}
      <path d="M 10 0 V 210 L 180 130 Z" />

      {/* 右サイドフラップ
          - 左右対称のため、x=350 を基準に同じ距離を保つ。 */}
      <path d="M 350 0 V 210 L 180 130 Z" />

      {/* ボトムフラップ
          - 左端 (10,210)、右端 (350,210) は背面パネルと同位置。
          - 上頂点 (180,125) を上下すると封の重なり具合が変わる。 */}
      <path d="M 10 210 L 180 125 L 350 210 Z" />
    </g>
  </svg>
);

// SVGTopFlap は封筒上部の蓋。rotateX アニメーションで開閉するため、基点となる上辺の座標合わせが重要。
const SVGTopFlap = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 360 132"
    preserveAspectRatio="none"
  >
    {/* 蓋の輪郭
            - 左端 (10,0)、右端 (350,0): 背面パネル上辺と同じライン。pivot のズレ防止に重要。
            - 下頂点 (180,120): 前面ボトムフラップの頂点と合わせる。 */}
    <path
      d="M 10 0 L 350 0 L 180 120 Z"
      fill="#ffffff"
      stroke={STROKE_COLOR}
      strokeWidth={STROKE_WIDTH}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export default function AnimationTestPage() {
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlay = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
  }, [isAnimating]);

  const handleEnvelopeAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (event.animationName === "envelope-bounce") {
        setIsAnimating(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4 py-16 gap-10">
      <div className="text-center max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">封筒アニメーション テスト</h1>
        <p className="text-slate-300 text-sm md:text-base">
          手紙が封筒に吸い込まれる演出と、封筒が跳ねるアニメーションをここで確認できます。
          「再生」ボタンでアニメーションをスタートしてください。
        </p>
      </div>

      <button
        onClick={handlePlay}
        className="px-8 py-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isAnimating}
      >
        {isAnimating ? "再生中..." : "再生"}
      </button>

      <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
        {/* Letter */}
        <div
          className={`absolute inset-x-0 mx-auto w-[220px] sm:w-[260px] origin-bottom z-10 will-change-transform will-change-opacity ${
            isAnimating ? "animate-letter" : "opacity-0"
          }`}
        >
          <div className="rounded-md overflow-hidden shadow-2xl">
            <Image
              src={LETTER_IMAGE}
              alt="テスト用の手紙"
              width={260}
              height={360}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Stamper Tool */}
        <div
          className={`absolute left-1/2 top-1/2 z-50 will-change-transform ${
            isAnimating ? "animate-stamper" : "opacity-0"
          }`}
        >
          <div className="relative w-16 h-48">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#2c1b10] rounded-b-full" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-32 bg-gradient-to-b from-[#5a3219] via-[#422412] to-[#2b160b] rounded-full shadow-[0_10px_14px_rgba(0,0,0,0.35)]" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-[#e5c98b] to-[#cfa24d] rounded-full border border-[#b0823d]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4.5rem] h-16 rounded-full bg-gradient-to-b from-[#f7e8a1] via-[#d4a441] to-[#b47624] shadow-[0_10px_16px_rgba(0,0,0,0.4)] border-4 border-[#9c651b]" />
          </div>
        </div>

        {/* Envelope */}
        <div
          onAnimationEnd={handleEnvelopeAnimationEnd}
          className={`relative w-[300px] sm:w-[360px] h-[200px] sm:h-[220px] ${
            isAnimating ? "animate-envelope" : ""
          }`}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 z-0">
              <SVGEnvelope />
            </div>

            {/* Top Flap (z-40) */}
            <div
              className="absolute inset-x-0 top-0 h-[60%] z-40"
              style={{ perspective: "1400px" }}
            >
              <div
                className={`w-full h-full origin-top will-change-transform ${
                  isAnimating ? "animate-flap" : ""
                }`}
              >
                <SVGTopFlap />
              </div>
            </div>

            {/* Seal (z-50) */}
            <div
              className={`absolute left-1/2 top-[45%] z-50 -translate-x-1/2 ${
                isAnimating ? "animate-seal" : "opacity-0 scale-0"
              }`}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-[0_6px_12px_rgba(0,0,0,0.3)]" />
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] text-red-900/50 opacity-80"
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes letter-move {
          0% {
            transform: translateY(-240px) scale(1);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-170px) scale(1.01);
          }
          45% {
            transform: translateY(0px) scale(0.98);
            opacity: 1;
          }
          65% {
            transform: translateY(40px) scale(0.96);
            opacity: 1;
          }
          100% {
            transform: translateY(60px) scale(0.93);
            opacity: 0;
          }
        }

        @keyframes flap-motion {
          0% {
            transform: rotateX(0deg);
          }
          18% {
            transform: rotateX(-175deg);
          }
          65% {
            transform: rotateX(-175deg);
          }
          90% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        @keyframes stamper-press {
          0% {
            transform: translate(100px, -200px) rotate(45deg);
            opacity: 0;
          }
          25% {
            transform: translate(0, -20px) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(0, 25px) scale(1.05);
          }
          70% {
            transform: translate(0, -20px) scale(1);
          }
          100% {
            transform: translate(-100px, -200px) rotate(-45deg);
            opacity: 0;
          }
        }

        @keyframes seal-reveal {
          0%,
          50% {
            transform: scale(0.5);
            opacity: 0;
          }
          80% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes envelope-bounce {
          0% {
            transform: translateY(0) scale(1);
          }
          20% {
            transform: translateY(-14px) scale(1.06, 0.95);
          }
          45% {
            transform: translateY(8px) scale(0.95, 1.05);
          }
          65% {
            transform: translateY(-4px) scale(1.02, 0.98);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        .animate-letter {
          animation: letter-move 2.4s cubic-bezier(0.42, 0, 0.2, 1) 0.3s
            forwards;
        }
        .animate-flap {
          animation: flap-motion 2.5s cubic-bezier(0.42, 0, 0.2, 1) forwards;
        }
        .animate-stamper {
          animation: stamper-press 1.5s cubic-bezier(0.42, 0, 0.2, 1) 2.4s
            forwards;
        }
        .animate-seal {
          animation: seal-reveal 0.6s cubic-bezier(0.3, 0, 0.2, 1.5) 3s forwards;
        }
        .animate-envelope {
          animation: envelope-bounce 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 3.9s
            forwards;
        }
      `}</style>
    </div>
  );
}
