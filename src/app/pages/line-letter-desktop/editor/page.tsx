"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { createClient } from "@supabase/supabase-js";
import Script from "next/script";
import type { Liff } from "@line/liff";

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

/**
 * Creates the message object to be sent via LIFF.
 * This function can be modified later to return a Flex Message.
 * @param imageUrl The URL of the generated letter image.
 * @returns An array of message objects for LIFF.
 */
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

  useEffect(() => {
    setTemplatePapers([
      "/template-papers/sea.png",
      "/template-papers/本文を追加.png",
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
      setFontSize(textObject.fontSize || 40);
      setFontColor((textObject.fill as string) || "#000000");
      setFontFamily(textObject.fontFamily || "'Times New Roman', serif");
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
      fontSize: 40,
      fill: "#000",
      fontFamily: "'Times New Roman', serif",
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
      (selectedObject as fabric.IText).set("fontSize", newSize);
      activeCanvas.renderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    if (selectedObject && selectedObject.type === "i-text" && activeCanvas) {
      (selectedObject as fabric.IText).set("fill", newColor);
      activeCanvas.renderAll();
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    if (selectedObject && selectedObject.type === "i-text" && activeCanvas) {
      (selectedObject as fabric.IText).set("fontFamily", newFontFamily);
      activeCanvas.renderAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex">
      {/* No need for <Script> tag if using dynamic import */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Choose a Template</h2>
            <div className="grid grid-cols-2 gap-4">
              {templatePapers.map((template, index) => (
                <img
                  key={index}
                  src={template}
                  alt={`Template ${index + 1}`}
                  className="w-48 h-auto cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="w-64 bg-white shadow-md p-4 sticky top-0 h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Controls</h3>
        <div className="flex flex-col gap-4">
          <button
            className="flex justify-center items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors w-full"
            onClick={addPage}
          >
            <img
              src="/control-panel-icons/multiple-pages-add-svgrepo-com.svg"
              alt="Add Page"
              className="w-6 h-6"
            />
            <span>Add Page</span>
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md w-full"
            onClick={addText}
          >
            Add Text
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={addImage}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer text-center w-full"
          >
            Add Image
          </label>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 w-full"
            onClick={saveCanvasToSupabaseDirectly}
            disabled={isSavingDirectly}
          >
            {isSavingDirectly ? "保存中..." : "Save"}
          </button>

          {/* --- LIFF Share Button --- */}
          {savedImageUrl && liff && (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md w-full"
              onClick={handleShare}
            >
              Share
            </button>
          )}
          {/* --- END LIFF --- */}
        </div>

        {selectedObject && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-bold mb-2">Selected Object</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={deleteSelected}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={bringForward}
              >
                Forward
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={sendBackwards}
              >
                Backwards
              </button>
            </div>
            {selectedObject.type === "i-text" && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <label>Size:</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="px-2 py-1 border rounded-md w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={handleColorChange}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>Font:</label>
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
