"use client";

import { useState } from "react";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
  templates: string[];
}

// カテゴリの種類
type CategoryType = "none" | "theme" | "mood" | "season";

// カテゴリ種類の定義
const categoryTypes = [
  { value: "none", label: "カテゴリ種類を選択しない" },
  { value: "theme", label: "テーマごと" },
  { value: "mood", label: "雰囲気ごと" },
  { value: "season", label: "季節ごと" },
];

// 仮のカテゴリデータ（後でpublic/template-papers内の対応表から読み込む予定）
const categoryData = {
  theme: [
    {
      id: "nature",
      label: "自然",
      templates: [
        "/template-papers/aquarium.png",
        "/template-papers/beach.png",
        "/template-papers/camp.png",
        "/template-papers/sea.png",
      ],
    },
    {
      id: "romantic",
      label: "ロマンチック",
      templates: ["/template-papers/rose.png"],
    },
    {
      id: "simple",
      label: "シンプル",
      templates: ["/template-papers/simple-laef.png"],
    },
  ],
  mood: [
    {
      id: "bright",
      label: "明るい",
      templates: [
        "/template-papers/beach.png",
        "/template-papers/aquarium.png",
      ],
    },
    {
      id: "calm",
      label: "落ち着いた",
      templates: [
        "/template-papers/sea.png",
        "/template-papers/simple-laef.png",
      ],
    },
    {
      id: "vibrant",
      label: "華やか",
      templates: ["/template-papers/rose.png", "/template-papers/camp.png"],
    },
  ],
  season: [
    { id: "spring", label: "春", templates: ["/template-papers/rose.png"] },
    {
      id: "summer",
      label: "夏",
      templates: [
        "/template-papers/beach.png",
        "/template-papers/aquarium.png",
      ],
    },
    { id: "autumn", label: "秋", templates: ["/template-papers/camp.png"] },
    { id: "winter", label: "冬", templates: ["/template-papers/sea.png"] },
    {
      id: "all-season",
      label: "通年",
      templates: ["/template-papers/simple-laef.png"],
    },
  ],
};

const TemplatePickerModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
  templates,
}: TemplatePickerModalProps) => {
  const [selectedCategoryType, setSelectedCategoryType] =
    useState<CategoryType>("none");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  if (!isOpen) {
    return null;
  }

  // 選択されたカテゴリに応じたテンプレートを取得
  const getFilteredTemplates = () => {
    if (selectedCategoryType === "none") {
      return templates;
    }
    const categories = categoryData[selectedCategoryType];
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    return selectedCategory ? selectedCategory.templates : templates;
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">テンプレートを選択</h2>

        {/* カテゴリ種類選択ドロップダウン */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリの種類
          </label>
          <select
            value={selectedCategoryType}
            onChange={(e) => {
              const newCategoryType = e.target.value as CategoryType;
              setSelectedCategoryType(newCategoryType);
              // カテゴリ種類が変わったら、最初のカテゴリを選択
              if (newCategoryType === "none") {
                setSelectedCategoryId("");
              } else {
                const newCategories = categoryData[newCategoryType];
                if (newCategories.length > 0) {
                  setSelectedCategoryId(newCategories[0].id);
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* カテゴリチップ */}
        {selectedCategoryType !== "none" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categoryData[selectedCategoryType].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategoryId === category.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
          {filteredTemplates.map((template, index) => (
            <div
              key={index}
              className="aspect-w-1 aspect-h-1.414 cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-md overflow-hidden"
              onClick={() => onSelectTemplate(template)}
            >
              <img
                src={template}
                alt={`テンプレート ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="text-right mt-6">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;
