'use client';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
  templates: string[];
}

const TemplatePickerModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
  templates,
}: TemplatePickerModalProps) => {
  if (!isOpen) {
    return null;
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
          {templates.map((template, index) => (
            <div key={index} className="aspect-w-1 aspect-h-1.414 cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-md overflow-hidden" onClick={() => onSelectTemplate(template)}>
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