"use client";

import { signIn } from "next-auth/react";
import { Header } from "../common-components/header";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white pt-24 md:pt-28">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    想いを込めた手紙を、LINEで。
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    デジタルだからこそ、もっと手軽に、もっと温かく。LINE
                    Letterは、あなたの「伝えたい」気持ちを形にする新しいコミュニケーションの形です。
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#06C755] px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => signIn("line")}
                  >
                    LINEでログインして始める
                  </button>
                </div>
              </div>
              <img
                alt="Hero"
                className="mx-auto h-auto w-full overflow-hidden rounded-xl lg:order-last"
                height="550"
                src="/landing-page/m1kbDbreCW3gAcG57W9u1759468198-1759468215.gif"
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  使い方
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  ３ステップで、想いを届ける
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  受け取った人は、まるで本物の封筒を開けるようなワクワク感を体験できます。
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <h3 className="text-xl font-bold text-[#06C755]">
                  1. 封筒が届く
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  LINEのトーク画面に、特別なデザインの封筒風画像が届きます。
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold text-[#06C755]">
                  2. タップして開封
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  画像をタップすると、あなたからの手紙が表示されます。
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold text-[#06C755]">
                  3. 手紙を読む
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  心のこもったメッセージを、いつでもどこでも読むことができます。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p className="text-gray-500 dark:text-gray-400">
          © 2024 LINE Letter. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
