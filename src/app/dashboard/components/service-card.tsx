"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export const cardData = [
  {
    title: "LINEletter",
    description:
      "LINEletterは、あなたが作った手紙をLINEで送れるサービスです。作った手紙はLINE以外でも送信、保存ができます",
    imageUrl: "https://placehold.co/600x400?text=Card+1",
    path: "/line-letter",
  },
  {
    title: "Card 2",
    description: "This is a short description for card 2.",
    imageUrl: "https://placehold.co/600x400?text=Card+2",
    path: "/card2",
  },
  {
    title: "Card 3",
    description: "This is a short description for card 3.",
    imageUrl: "https://placehold.co/600x400?text=Card+3",
    path: "/card3",
  },
];

export function ServiceCard(
  { card,devise }: { card: (typeof cardData)[0],devise: string }
) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={card.imageUrl}
        alt={card.title}
        width={600}
        height={400}
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => {
          router.push(`${card.path}` + `-${devise}`);
        }}
      />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{card.title}</h2>
        <p className="text-gray-700">{card.description}</p>
      </div>
    </div>
  );
}
