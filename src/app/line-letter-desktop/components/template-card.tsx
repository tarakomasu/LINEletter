'use client'

import Image from "next/image"

export const templateData = [
  {
    id: "template1",
    title: "Template 1",
    description: "A simple and clean template.",
    imageUrl: "https://placehold.co/600x400?text=Template+1",
  },
  {
    id: "template2",
    title: "Template 2",
    description: "A template with a modern design.",
    imageUrl: "https://placehold.co/600x400?text=Template+2",
  },
  {
    id: "template3",
    title: "Template 3",
    description: "A colorful and vibrant template.",
    imageUrl: "https://placehold.co/600x400?text=Template+3",
  },
]

export function TemplateCard({ 
  card, 
  isSelected, 
  onSelect 
}: { 
  card: typeof templateData[0], 
  isSelected: boolean, 
  onSelect: (id: string) => void 
}) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(card.id)}
    >
      <Image
        src={card.imageUrl}
        alt={card.title}
        width={600}
        height={400}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{card.title}</h2>
        <p className="text-gray-700">{card.description}</p>
      </div>
    </div>
  )
}
