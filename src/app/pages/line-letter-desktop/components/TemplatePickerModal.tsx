"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setSelectedCategoryType("none");
      setSelectedCategoryId("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // 選択されたカテゴリに応じたテンプレートを取得
  const filteredTemplates = useMemo(() => {
    if (selectedCategoryType === "none") {
      return templates;
    }
    const categories = categoryData[selectedCategoryType];
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    return selectedCategory ? selectedCategory.templates : templates;
  }, [selectedCategoryId, selectedCategoryType, templates]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">テンプレートを選択</h2>
          <button
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="w-2/3 max-w-xl flex flex-col h-full overflow-hidden">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリの種類
              </label>
              <select
                value={selectedCategoryType}
                onChange={(e) => {
                  const newCategoryType = e.target.value as CategoryType;
                  setSelectedCategoryType(newCategoryType);
                  if (newCategoryType === "none") {
                    setSelectedCategoryId("");
                  } else {
                    const newCategories = categoryData[newCategoryType];
                    if (newCategories.length > 0) {
                      setSelectedCategoryId(newCategories[0].id);
                    }
                  }
                  setSelectedTemplate(null);
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

            {selectedCategoryType !== "none" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categoryData[selectedCategoryType].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setSelectedTemplate(null);
                      }}
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

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredTemplates.map((template, index) => (
                  <button
                    key={`${template}-${index}`}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`relative overflow-hidden rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedTemplate === template
                        ? "border-blue-500"
                        : "border-transparent hover:border-blue-400"
                    }`}
                  >
                    <img
                      src={template}
                      alt={`テンプレート ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 text-sm">
                    テンプレートが見つかりませんでした
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <span className="text-sm font-medium text-gray-600 mb-2">
              プレビュー
            </span>
            <div className="flex-1 bg-black rounded-lg border border-gray-700 flex items-center justify-center p-4">
              {selectedTemplate ? (
                <img
                  src={selectedTemplate}
                  alt="選択中のテンプレート"
                  className="max-h-full w-auto border border-white/30"
                />
              ) : (
                <p className="text-gray-400 text-sm">
                  テンプレートを選択するとプレビューが表示されます
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              if (!selectedTemplate) return;
              onSelectTemplate(selectedTemplate);
              onClose();
            }}
            disabled={!selectedTemplate}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              selectedTemplate
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;
