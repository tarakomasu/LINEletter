"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateCard, templateData } from "./components/template-card";

export default function LINEletter() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Choose a Template
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateData.map((card) => (
            <TemplateCard
              key={card.id}
              card={card}
              isSelected={selectedTemplate === card.id}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            disabled={!selectedTemplate}
            onClick={() => {
              router.push(`./letter-editor/${selectedTemplate}`);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
