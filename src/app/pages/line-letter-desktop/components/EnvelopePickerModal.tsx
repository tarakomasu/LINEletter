"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEnvelope(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-5xl w-full h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">封筒を選択</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            閉じる
          </button>
        </div>
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="w-2/3 max-w-xl flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {envelopes.map((envelope) => (
                  <button
                    key={envelope}
                    type="button"
                    onClick={() => setSelectedEnvelope(envelope)}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      selectedEnvelope === envelope
                        ? "border-green-500"
                        : "border-transparent hover:border-green-400"
                    }`}
                  >
                    <Image
                      src={envelope}
                      alt={envelope}
                      width={200}
                      height={200}
                      className="w-full h-auto object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-medium text-gray-600 mb-2">
              プレビュー
            </span>
            <div className="flex-1 bg-black rounded-lg border border-gray-700 flex items-center justify-center p-4">
              {selectedEnvelope ? (
                <Image
                  src={selectedEnvelope}
                  alt="選択中の封筒"
                  width={360}
                  height={360}
                  className="max-h-full w-auto border border-white/30"
                />
              ) : (
                <p className="text-gray-400 text-sm">
                  封筒を選択するとプレビューが表示されます
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              if (!selectedEnvelope) return;
              onSelectEnvelope(selectedEnvelope);
              onClose();
            }}
            disabled={!selectedEnvelope}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              selectedEnvelope
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-300 cursor-not-allowed"
            }`}
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}
