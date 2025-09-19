"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { createClient } from "@supabase/supabase-js";
import type { Liff } from "@line/liff";
import {
  AddPageIcon,
  AddImageIcon,
  TextIcon,
  HelpIcon,
} from "../components/icons";
import Tooltip from "../components/Tooltip";
import TemplatePickerModal from "../components/TemplatePickerModal";

const supabaseUrl = "https://vqxbspchwzhxghoswyrx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeGJzcGNod3poeGdob3N3eXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIzNTM2NywiZXhwIjoyMDY5ODExMzY3fQ.P9JEaOibrGXvvTsJxf2IfgMJzw53MCA6PfX7UHjs6NM";
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = "line-letter";

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error("Invalid data URL");
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

interface Page {
  background: string;
}

const availableFonts = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  {
    name: "ヒラギノ角ゴ ProN",
    value: "'Hiragino Kaku Gothic ProN', sans-serif",
  },
  { name: "游ゴシック", value: "'Yu Gothic', sans-serif" },
  { name: "MS Pゴシック", value: "'MS P Gothic', sans-serif" },
];

// --- LIFF --- //
const LIFF_ID = "2007941017-kPwmN542";

const createLiffMessage = (imageUrl: string) => {
  return [
    {
      type: "text" as const,
      text: `手紙が届きました！\nこちらからご覧ください：\n${imageUrl}`,
    },
  ];
};
// --- END LIFF ---

export default function EditorTest() {
  const { data: session, status } = useSession();
  const [pages, setPages] = useState<Page[]>([
    { background: "/template-papers/sea.png" },
  ]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const fabricInstances = useRef<(fabric.Canvas | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [activeCanvas, setActiveCanvas] = useState<fabric.Canvas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templatePapers, setTemplatePapers] = useState<string[]>([]);
  const [isSavingDirectly, setIsSavingDirectly] = useState(false);
  const [liff, setLiff] = useState<Liff | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Authenticated user:", session.user);
    } else if (status === "unauthenticated") {
      console.log("User is not authenticated.");
    }
  }, [status, session]);

  // --- LIFF ---
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = (await import("@line/liff")).default;
        await liffModule.init({
          liffId: LIFF_ID,
          withLoginOnExternalBrowser: true,
        });
        setLiff(liffModule);
        console.log("LIFF initialized successfully");
      } catch (error) {
        console.error("LIFF initialization failed", error);
      }
    };
    initLiff();
  }, []);
  // --- END LIFF ---

  // State for text properties
  const [fontSize, setFontSize] = useState<number>(40);
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [fontFamily, setFontFamily] = useState<string>(
    "'Times New Roman', serif"
  );
  const [lastUsedTextStyle, setLastUsedTextStyle] = useState({
    fontSize: 40,
    fill: "#000000",
    fontFamily: "'Times New Roman', serif",
  });

  useEffect(() => {
    setTemplatePapers([
      "/template-papers/aquarium.png",
      "/template-papers/beach.png",
      "/template-papers/camp.png",
      "/template-papers/rose.png",
      "/template-papers/sea.png",
    ]);
  }, []);

  useEffect(() => {
    pages.forEach((page, index) => {
      const canvasEl = canvasRefs.current[index];
      if (canvasEl && !fabricInstances.current[index]) {
        const img = new Image();
        img.src = page.background;
        img.onload = () => {
          const targetWidth = 1400;
          const targetHeight = 2048;
          const aspectRatio = targetWidth / targetHeight;
          const displayHeight = window.innerHeight * 0.9;
          const displayWidth = displayHeight * aspectRatio;

          const canvas = new fabric.Canvas(canvasEl, {
            width: displayWidth,
            height: displayHeight,
          });
          fabricInstances.current[index] = canvas;
          if (index === selectedPageIndex) {
            setActiveCanvas(canvas);
          }

          fabric.Image.fromURL(img.src, (bgImg) => {
            if (bgImg.width && bgImg.height) {
              canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
                scaleX: displayWidth / bgImg.width,
                scaleY: displayHeight / bgImg.height,
              });
            } else {
              canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
            }
          });

          const handleSelection = (e: fabric.IEvent) => {
            const selection = e.selected?.[0] ?? null;
            setSelectedObject(selection);
            setActiveCanvas(canvas);
          };

          canvas.on("selection:created", handleSelection);
          canvas.on("selection:updated", handleSelection);
          canvas.on("selection:cleared", () => setSelectedObject(null));
          canvas.on("mouse:down", () => {
            setSelectedPageIndex(index);
          });
        };
      }
    });

    return () => {
      fabricInstances.current.forEach((canvas, index) => {
        if (!pages[index]) {
          canvas?.dispose();
          fabricInstances.current[index] = null;
        }
      });
    };
  }, [pages]);

  useEffect(() => {
    const canvas = fabricInstances.current[selectedPageIndex];
    if (canvas && canvas !== activeCanvas) {
      setActiveCanvas(canvas);
    }
  }, [selectedPageIndex, pages, activeCanvas]);

  useEffect(() => {
    if (selectedObject && selectedObject.type === "i-text") {
      const textObject = selectedObject as fabric.IText;
      const style = {
        fontSize: textObject.fontSize || 40,
        fill: (textObject.fill as string) || "#000000",
        fontFamily: textObject.fontFamily || "'Times New Roman', serif",
      };
      setFontSize(style.fontSize);
      setFontColor(style.fill);
      setFontFamily(style.fontFamily);
    }
  }, [selectedObject]);

  useEffect(() => {
    return () => {
      fabricInstances.current.forEach((canvas) => canvas?.dispose());
      fabricInstances.current = [];
    };
  }, []);

  const addPage = () => {
    setIsModalOpen(true);
  };

  const handleSelectTemplate = (template: string) => {
    const newPage = { background: template };
    setPages((prevPages) => {
      const newPages = [...prevPages, newPage];
      setSelectedPageIndex(newPages.length - 1);
      return newPages;
    });
    setIsModalOpen(false);
  };

  const addText = () => {
    if (!activeCanvas) return;
    const text = new fabric.IText("Tap to edit", {
      left: activeCanvas.getWidth() / 2,
      top: activeCanvas.getHeight() / 2,
      ...lastUsedTextStyle,
      originX: "center",
      originY: "center",
    });
    activeCanvas.add(text);
    activeCanvas.renderAll();
    activeCanvas.setActiveObject(text);
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCanvas) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      fabric.Image.fromURL(dataUrl, (image) => {
        image.scaleToWidth(activeCanvas.getWidth() / 4);
        image.set({
          left: activeCanvas.getWidth() / 2,
          top: activeCanvas.getHeight() / 2,
          originX: "center",
          originY: "center",
        });
        activeCanvas.add(image);
        activeCanvas.renderAll();
        activeCanvas.setActiveObject(image);
      });
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const saveCanvasToSupabaseDirectly = async () => {
    if (!activeCanvas || isSavingDirectly) return;

    setIsSavingDirectly(true);
    setSavedImageUrl(null); // Reset on new save attempt
    try {
      const targetWidth = 1400;
      const displayWidth = activeCanvas.getWidth();
      const multiplier = targetWidth / displayWidth;
      const dataUrl = activeCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: multiplier,
      });

      const blob = dataURLtoBlob(dataUrl);
      const fileName = `letter-direct-${Date.now()}.png`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (!publicUrlData) {
        throw new Error("Failed to get public URL from Supabase.");
      }

      alert("Image saved! You can now share it on LINE.");
      setSavedImageUrl(publicUrlData.publicUrl); // Set state to show share button
    } catch (error) {
      console.error("Error saving canvas directly:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error saving canvas directly: ${errorMessage}`);
    } finally {
      setIsSavingDirectly(false);
    }
  };

  // --- LIFF ---
  const handleShare = async () => {
    if (!savedImageUrl || !liff) {
      alert("Image not saved or LIFF not initialized.");
      return;
    }

    if (!liff.isLoggedIn()) {
      // Although shareTargetPicker can work without this, it's good practice
      // to ensure the user is logged in for a better experience.
      liff.login();
      return; // login() redirects, so we stop here.
    }

    try {
      const messages = createLiffMessage(savedImageUrl);
      const result = await liff.shareTargetPicker(messages as any);
      if (result) {
        alert("Letter shared successfully!");
      } else {
        console.log("Share was cancelled by the user.");
      }
    } catch (error) {
      console.error("Error sharing message:", error);
      alert("Failed to share letter. Please try again.");
    }
  };
  // --- END LIFF ---

  const deleteSelected = () => {
    if (selectedObject && activeCanvas) {
      activeCanvas.remove(selectedObject);
      setSelectedObject(null);
    }
  };

  const bringForward = () => {
    if (selectedObject && activeCanvas) {
      activeCanvas.bringForward(selectedObject);
    }
  };

  const sendBackwards = () => {
    if (selectedObject && activeCanvas) {
      activeCanvas.sendBackwards(selectedObject);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    if (selectedObject && selectedObject.type === "i-text" && activeCanvas) {
      const textObject = selectedObject as fabric.IText;
      textObject.set("fontSize", newSize);
      activeCanvas.renderAll();
      setLastUsedTextStyle((prev) => ({ ...prev, fontSize: newSize }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    if (selectedObject && selectedObject.type === "i-text" && activeCanvas) {
      const textObject = selectedObject as fabric.IText;
      textObject.set("fill", newColor);
      activeCanvas.renderAll();
      setLastUsedTextStyle((prev) => ({ ...prev, fill: newColor }));
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    if (selectedObject && selectedObject.type === "i-text" && activeCanvas) {
      const textObject = selectedObject as fabric.IText;
      textObject.set("fontFamily", newFontFamily);
      activeCanvas.renderAll();
      setLastUsedTextStyle((prev) => ({ ...prev, fontFamily: newFontFamily }));
    }
  };

  const buttonStyle =
    "flex-grow justify-center items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white transition-colors flex font-bold";
  const disabledButtonStyle =
    "flex-grow justify-center items-center gap-2 px-4 py-2 bg-gray-200 border-2 border-gray-400 text-gray-400 rounded-md flex font-bold";

  return (
    <div className="min-h-screen bg-gray-200 flex">
      <TemplatePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        templates={templatePapers}
      />
      <div className="w-80 bg-white shadow-md p-4 sticky top-0 h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">コントロール</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button className={buttonStyle} onClick={addPage}>
              <AddPageIcon className="w-6 h-6" />
              <span>ページを追加</span>
            </button>
            <Tooltip content="新しいページを便箋に追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <button className={buttonStyle} onClick={addText}>
              <TextIcon className="w-6 h-6" />
              <span>テキストを追加</span>
            </button>
            <Tooltip content="キャンバスに新しいテキストボックスを追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={addImage}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`${buttonStyle} cursor-pointer flex-grow`}
            >
              <AddImageIcon className="w-6 h-6" />
              <span>画像を追加</span>
            </label>
            <Tooltip content="デバイスから画像をアップロードして追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={isSavingDirectly ? disabledButtonStyle : buttonStyle}
              onClick={saveCanvasToSupabaseDirectly}
              disabled={isSavingDirectly}
            >
              {isSavingDirectly ? "保存中..." : "保存"}
            </button>
            <Tooltip content="作成した手紙を画像として保存します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>

          {savedImageUrl && liff && (
            <div className="flex items-center gap-2">
              <button className={buttonStyle} onClick={handleShare}>
                LINEで送信
              </button>
              <Tooltip content="保存した手紙をLINEの友だちに共有します。">
                <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
              </Tooltip>
            </div>
          )}
        </div>

        {selectedObject && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-bold mb-2">選択中のオブジェクト</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={deleteSelected}
              >
                削除
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={bringForward}
              >
                前面へ
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={sendBackwards}
              >
                背面へ
              </button>
            </div>
            {selectedObject.type === "i-text" && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <label>サイズ:</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="px-2 py-1 border rounded-md w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>色:</label>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={handleColorChange}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>フォント:</label>
                  <select
                    value={fontFamily}
                    onChange={handleFontFamilyChange}
                    className="px-2 py-1 border rounded-md w-full"
                  >
                    {availableFonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col items-center p-8 overflow-y-auto h-screen bg-gray-200">
        {pages.map((page, index) => (
          <div
            key={index}
            className={`mb-4 shadow-lg ${selectedPageIndex === index
              ? "border-4 border-blue-500 rounded-lg"
              : "border-4 border-transparent"
            }`}
            onClick={() => setSelectedPageIndex(index)}
          >
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}