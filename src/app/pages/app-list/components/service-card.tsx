"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

export function ServiceCard() {
  const router = useRouter();

  const handleClick = () => {
    const editorPath = isMobile
      ? "/pages/line-letter-mobile/letter-editor"
      : "/pages/line-letter-desktop/editor";
    router.push(editorPath);
  };

  const steps = [
    {
      title: "1. 作成 (Create)",
      description: "テンプレートを選んで、自由にテキストや画像を追加し、あなただけの手紙を作成します。",
      imageUrl: "https://placehold.co/150x150/EBF5DF/333?text=Create",
    },
    {
      title: "2. 送信 (Send)",
      description: "完成した手紙は画像として生成され、LINEの友だちに簡単に共有できます。",
      imageUrl: "https://placehold.co/150x150/D4EFDF/333?text=Send",
    },
    {
      title: "3. 閲覧 (View)",
      description: "受け取った相手は、まるで本物の手紙を開けるような体験でメッセージを閲覧します。",
      imageUrl: "https://placehold.co/150x150/A9DFBF/333?text=View",
    },
  ];

  return (
    <div
      onClick={handleClick}
      className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer border-4 border-[#06C755]"
    >
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">LINE Letter</h2>
        <p className="text-gray-600 text-center mb-8">デジタルだからこそ、もっと手軽に、もっと温かく。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src={step.imageUrl}
                alt={step.title}
                width={150}
                height={150}
                className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover mb-4 border-4 border-gray-200"
              />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-[#06C755]">カードをクリックして作成を開始</p>
        </div>
      </div>
    </div>
  );
}