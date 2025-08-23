"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

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

export default function LetterEditor() {
  const [pages, setPages] = useState<Page[]>([
    { background: "/template-papers/sea.png" },
  ]); // Start with one page
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const fabricInstances = useRef<(fabric.Canvas | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [activeCanvas, setActiveCanvas] = useState<fabric.Canvas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templatePapers, setTemplatePapers] = useState<string[]>([]);

  // State for text properties
  const [fontSize, setFontSize] = useState<number>(40);
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [fontFamily, setFontFamily] = useState<string>(
    "'Times New Roman', serif"
  );

  useEffect(() => {
    // In a real app, you might fetch this from an API.
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
          const screenHeight = window.innerHeight * 0.9;
          const scale = screenHeight / img.height;
          const canvasWidth = img.width * scale;

          const canvas = new fabric.Canvas(canvasEl, {
            width: canvasWidth,
            height: screenHeight,
            backgroundColor: "#f0f0f0",
          });
          fabricInstances.current[index] = canvas;

          fabric.Image.fromURL(img.src, (bgImg) => {
            canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
              scaleX: canvas.width! / bgImg.width!,
              scaleY: canvas.height! / bgImg.height!,
            });
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
            setActiveCanvas(canvas);
            setSelectedPageIndex(index);
          });
        };
      }
    });
  }, [pages]);

  useEffect(() => {
    const canvas = fabricInstances.current[selectedPageIndex];
    if (canvas && canvas !== activeCanvas) {
      setActiveCanvas(canvas);
    }
  }, [selectedPageIndex, pages, activeCanvas]);

  // Update text controls when selection changes
  useEffect(() => {
    if (selectedObject && selectedObject.type === "i-text") {
      const textObject = selectedObject as fabric.IText;
      setFontSize(textObject.fontSize || 40);
      setFontColor((textObject.fill as string) || "#000000");
      setFontFamily(textObject.fontFamily || "'Times New Roman', serif");
    }
  }, [selectedObject]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      fabricInstances.current.forEach((canvas) => canvas?.dispose());
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
      left: 100,
      top: 100,
      fontSize: 40,
      fill: "#000",
      fontFamily: "'Times New Roman', serif",
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
        image.scaleToWidth(200);
        activeCanvas.add(image);
        activeCanvas.renderAll();
        activeCanvas.setActiveObject(image);
      });
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const saveCanvas = async () => {
    if (!activeCanvas) return;

    const backgroundImage = activeCanvas.backgroundImage as fabric.Image;
    if (!backgroundImage || !backgroundImage.getSrc) {
      alert("Background image not found!");
      return;
    }

    const sharpObjects = activeCanvas
      .getObjects()
      .map((obj) => {
        const common = {
          left: obj.left,
          top: obj.top,
          width: obj.getScaledWidth(),
          height: obj.getScaledHeight(),
          angle: obj.angle,
        };

        if (obj.type === "i-text") {
          const textObj = obj as fabric.IText;
          return {
            type: "text",
            text: textObj.text,
            fontSize: textObj.fontSize,
            fill: textObj.fill,
            fontFamily: textObj.fontFamily,
            ...common,
          };
        } else if (obj.type === "image") {
          const imgObj = obj as fabric.Image;
          return {
            type: "image",
            src: imgObj.getSrc(), // This will be a data: URL
            ...common,
          };
        }
        return null;
      })
      .filter(Boolean);

    const dataForSharp = {
      width: activeCanvas.width,
      height: activeCanvas.height,
      background: backgroundImage.getSrc().replace(window.location.origin, ""),
      objects: sharpObjects,
    };

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForSharp),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to generate image");
      }

      const result = await response.json();
      alert(`Image saved successfully! URL: ${result.url}`);
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Error saving canvas:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error saving canvas: ${errorMessage}`);
    }
  };

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
            className="px-4 py-2 bg-indigo-500 text-white rounded-md"
            onClick={addPage}
          >
            Add Page
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={addText}
          >
            Add Text
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={addImage}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={saveCanvas}
          >
            Save
          </button>
          {selectedObject && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-bold mb-2">Selected Object</h4>
              <div className="flex flex-col gap-2">
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
                  Bring Forward
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  onClick={sendBackwards}
                >
                  Send Backwards
                </button>
                {selectedObject.type === "i-text" && (
                  <>
                    <div className="flex items-center gap-2">
                      <label>Size:</label>
                      <input
                        type="number"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="px-2 py-1 border rounded-md w-20"
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
                        className="px-2 py-1 border rounded-md"
                      >
                        {availableFonts.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center p-8 overflow-y-auto h-screen bg-gray-200">
        {pages.map((page, index) => (
          <div
            key={index}
            className={`mb-4 shadow-lg ${
              selectedPageIndex === index
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
