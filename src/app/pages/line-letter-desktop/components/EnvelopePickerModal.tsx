"use client";

import Image from "next/image";

interface EnvelopePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEnvelope: (envelope: string) => void;
  envelopes: string[];
}

export default function EnvelopePickerModal({
  isOpen,
  onClose,
  onSelectEnvelope,
  envelopes,
}: EnvelopePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">封筒を選択</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
          {envelopes.map((envelope) => (
            <div
              key={envelope}
              className="cursor-pointer border-2 border-transparent hover:border-green-500 rounded-lg overflow-hidden"
              onClick={() => onSelectEnvelope(envelope)}
            >
              <Image
                src={envelope}
                alt={envelope}
                width={200}
                height={200}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
