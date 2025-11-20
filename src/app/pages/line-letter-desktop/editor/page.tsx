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
import EnvelopePickerModal from "../components/EnvelopePickerModal";
import { createFlexMessage } from "../components/flex-message";
import {
  createSparkleEffect,
  updateSparkleDensity,
  updateSparkleColor,
} from "@/lib/effects/sparkle";
import {
  createMonochromeIlluminationEffect,
  createRainbowIlluminationEffect,
  updateIlluminationBulbCount,
  updateIlluminationBlinkSpeed,
  updateIlluminationColor,
} from "@/lib/effects/illumination";
import { createGeminiTestEffect } from "@/lib/effects/gemini-test";

const isSparkleEffect = (
  object: fabric.Object | null
): object is fabric.Group => object?.type === "sparkle-effect";

const isIlluminationEffect = (
  object: fabric.Object | null
): object is fabric.Group & { effectType?: string } =>
  object?.type === "illumination-effect";

const isGeminiTestEffect = (
  object: fabric.Object | null
): object is fabric.Group => object?.type === "gemini-test-effect";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = "line-letter";

fabric.Object.prototype.borderColor = "#06C755";
fabric.Object.prototype.cornerColor = "black";
fabric.Object.prototype.cornerStrokeColor = "black";
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
  id: string;
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

const commonColors = [
  { name: "黒", value: "#000000" },
  { name: "白", value: "#FFFFFF" },
  { name: "赤", value: "#FF0000" },
  { name: "青", value: "#0000FF" },
  { name: "緑", value: "#008000" },
  { name: "黄", value: "#FFFF00" },
  { name: "紫", value: "#800080" },
];

// --- LIFF --- //
const LIFF_ID = "2007941017-kPwmN542";

const createLiffMessage = (shareUrl: string) => {
  return [
    {
      type: "text" as const,
      text: `手紙が届きました！\nこちらからご覧ください：\n${shareUrl}`,
    },
  ];
};
// --- END LIFF ---

const SparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L14.34 8.66L20 11L14.34 13.34L12 19L9.66 13.34L4 11L9.66 8.66L12 3z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const BulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18H15" />
    <path d="M10 22h4" />
    <path d="M12 14v4" />
    <path d="M8.5 10.5C8.5 7.46 10.46 5 12 5s3.5 2.46 3.5 5.5" />
  </svg>
);

const availableEnvelopes = [
  "/flex-message-envelope/simple.jpg",
  "/flex-message-envelope/red-rose.png",
];

export default function EditorTest() {
  const { data: session, status } = useSession();
  const [pages, setPages] = useState<Page[]>([
    {
      id: `page-${Date.now()}`,
      background: "/template-papers/simple-laef.png",
    },
  ]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const fabricInstances = useRef<(fabric.Canvas | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const clipboardRef = useRef<fabric.Object | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [activeCanvas, setActiveCanvas] = useState<fabric.Canvas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState<string>(
    availableEnvelopes[0]
  );
  const [templatePapers, setTemplatePapers] = useState<string[]>([]);
  const [liff, setLiff] = useState<Liff | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Authenticated user:", session.user);
    } else if (status === "unauthenticated") {
      console.log("User is not authenticated.");
    }
  }, [status, session]);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = (await import("@line/liff")).default;
        await liffModule.init({
          liffId: LIFF_ID,
          // withLoginOnExternalBrowser: true,
        });
        setLiff(liffModule);
        console.log("LIFF initialized successfully");
      } catch (error) {
        console.error("LIFF initialization failed", error);
      }
    };
    initLiff();
  }, []);

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
  // State for sparkle effect
  const [sparkleDensity, setSparkleDensity] = useState(40);
  const [sparkleColor, setSparkleColor] = useState<string>("#FFFF00");

  // State for illumination effect
  const [illuminationBulbCount, setIlluminationBulbCount] = useState(5);
  const [illuminationBlinkSpeed, setIlluminationBlinkSpeed] = useState(500);
  const [illuminationColor, setIlluminationColor] = useState<string>("#FFFF00");

  const updateAllCanvasSizes = () => {
    setTimeout(() => {
      fabricInstances.current.forEach((canvas) => {
        if (canvas) {
          const logicalWidth = 1400;
          const logicalHeight = 2048;
          const aspectRatio = logicalHeight / logicalWidth;
          const displayHeight = window.innerHeight * 0.9;
          const displayWidth = displayHeight / aspectRatio;

          // Set the CSS size of the <canvas> element
          canvas.setDimensions(
            { width: displayWidth, height: displayHeight },
            { cssOnly: true }
          );

          const domCanvas = canvas.getElement();
          domCanvas.style.width = `${displayWidth}px`;
          domCanvas.style.height = `${displayHeight}px`;

          const selectionCanvas = canvas.getSelectionElement();
          selectionCanvas.style.width = `${displayWidth}px`;
          selectionCanvas.style.height = `${displayHeight}px`;

          const wrapperEl = domCanvas.parentElement;
          if (wrapperEl) {
            wrapperEl.style.width = `${displayWidth}px`;
            wrapperEl.style.height = `${displayHeight}px`;
          }

          canvas.calcOffset();
          canvas.renderAll();
        }
      });
    }, 0);
  };

  useEffect(() => {
    window.addEventListener("resize", updateAllCanvasSizes);
    return () => {
      window.removeEventListener("resize", updateAllCanvasSizes);
    };
  }, []);

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
          const logicalWidth = 1400;
          const logicalHeight = 2048;

          const canvas = new fabric.Canvas(canvasEl);
          fabricInstances.current[index] = canvas;

          canvas.setDimensions(
            { width: logicalWidth, height: logicalHeight },
            { backstoreOnly: true }
          );

          updateAllCanvasSizes();

          canvas.selectionBorderColor = "black";
          if (index === selectedPageIndex) {
            setActiveCanvas(canvas);
          }

          fabric.Image.fromURL(img.src, (bgImg) => {
            if (bgImg.width && bgImg.height) {
              canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
                scaleX: logicalWidth / bgImg.width,
                scaleY: logicalHeight / bgImg.height,
              });
            } else {
              canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
            }
          });

          // Add initial text only to the first page
          if (index === 0 && canvas.getObjects().length === 0) {
            const text = new fabric.IText("テキストを入力してください", {
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              fontSize: 60,
              fill: "#333333",
              fontFamily: "'Hiragino Kaku Gothic ProN', sans-serif",
              originX: "center",
              originY: "center",
            });
            canvas.add(text);
            canvas.setActiveObject(text);
          }

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
    if (selectedObject) {
      if (selectedObject.type === "i-text") {
        const textObject = selectedObject as fabric.IText;
        const style = {
          fontSize: textObject.fontSize || 40,
          fill: (textObject.fill as string) || "#000000",
          fontFamily: textObject.fontFamily || "'Times New Roman', serif",
        };
        setFontSize(style.fontSize);
        setFontColor(style.fill);
        setFontFamily(style.fontFamily);
      } else if (isSparkleEffect(selectedObject)) {
        const effectGroup = selectedObject;
        setSparkleDensity(effectGroup.getObjects().length);
        const currentColor =
          (effectGroup as fabric.Object & { effectColor?: string })
            .effectColor || "#FFFF00";
        setSparkleColor(currentColor);
      } else if (isIlluminationEffect(selectedObject)) {
        const effectGroup = selectedObject as fabric.Group & {
          bulbCount?: number;
          blinkSpeed?: number;
          color?: string;
        };
        setIlluminationBulbCount(effectGroup.bulbCount || 5);
        setIlluminationBlinkSpeed(effectGroup.blinkSpeed || 500);
        setIlluminationColor(effectGroup.color || "#FFFF00");
      }
    }
  }, [selectedObject]);

  useEffect(() => {
    return () => {
      fabricInstances.current.forEach((canvas) => canvas?.dispose());
      fabricInstances.current = [];
    };
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      const tagName = element.tagName;
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        element.isContentEditable
      ) {
        return true;
      }
      if (element.closest("input, textarea, [contenteditable='true']")) {
        return true;
      }
      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeCanvas) return;
      if (event.defaultPrevented) return;
      if (isEditableTarget(event.target)) return;

      const activeObjects = activeCanvas.getActiveObjects();
      const activeObject = activeCanvas.getActiveObject();
      const hasEffectSelected = activeObjects.some(
        (obj) =>
          isSparkleEffect(obj) ||
          isIlluminationEffect(obj) ||
          isGeminiTestEffect(obj)
      );
      if (
        hasEffectSelected ||
        (!!activeObject &&
          (isSparkleEffect(activeObject) ||
            isIlluminationEffect(activeObject) ||
            isGeminiTestEffect(activeObject)))
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "delete" || key === "backspace") {
        if (!activeObjects.length) return;
        event.preventDefault();
        activeObjects.forEach((obj) => {
          activeCanvas.remove(obj);
        });
        activeCanvas.discardActiveObject();
        setSelectedObject(null);
        activeCanvas.requestRenderAll();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "c") {
        if (!activeObject) return;
        event.preventDefault();
        activeObject.clone((cloned: fabric.Object) => {
          clipboardRef.current = cloned;
          if (cloned && cloned.type === "activeSelection") {
            (cloned as fabric.ActiveSelection).canvas = activeCanvas;
          }
        });
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "v") {
        const clipboard = clipboardRef.current;
        if (!clipboard) return;
        event.preventDefault();
        clipboard.clone((clonedObj: fabric.Object) => {
          if (!clonedObj) return;
          activeCanvas.discardActiveObject();

          const left = (clonedObj.left ?? 0) + 20;
          const top = (clonedObj.top ?? 0) + 20;

          clonedObj.set({
            left,
            top,
            evented: true,
          });

          if (clonedObj.type === "activeSelection") {
            (clonedObj as fabric.ActiveSelection).canvas = activeCanvas;
            (clonedObj as fabric.ActiveSelection).forEachObject((obj) => {
              activeCanvas.add(obj);
            });
            (clonedObj as fabric.ActiveSelection).setCoords();
          } else {
            activeCanvas.add(clonedObj);
          }

          clipboardRef.current = clonedObj;
          activeCanvas.setActiveObject(clonedObj);
          setSelectedObject(clonedObj);
          activeCanvas.requestRenderAll();
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCanvas, setSelectedObject]);

  const addPage = () => {
    setIsModalOpen(true);
  };

  const handleSelectTemplate = (template: string) => {
    const newPage = {
      id: `page-${Date.now()}`,
      background: template,
    };
    setPages((prevPages) => {
      const newPages = [...prevPages, newPage];
      setSelectedPageIndex(newPages.length - 1);
      return newPages;
    });
    setIsModalOpen(false);
  };

  const deletePage = () => {
    if (pages.length <= 1) {
      alert("最後のページは削除できません。");
      return;
    }

    if (
      window.confirm(
        `ページ ${
          selectedPageIndex + 1
        } を削除しますか？この操作は元に戻せません。`
      )
    ) {
      const canvasToDispose = fabricInstances.current[selectedPageIndex];
      if (canvasToDispose) {
        canvasToDispose.dispose();
      }

      const newPages = pages.filter((_, index) => index !== selectedPageIndex);
      const newFabricInstances = fabricInstances.current.filter(
        (_, index) => index !== selectedPageIndex
      );
      const newCanvasRefs = canvasRefs.current.filter(
        (_, index) => index !== selectedPageIndex
      );

      fabricInstances.current = newFabricInstances;
      canvasRefs.current = newCanvasRefs;
      setPages(newPages);

      if (selectedPageIndex >= newPages.length) {
        setSelectedPageIndex(newPages.length - 1);
      }
    }
  };

  const addText = () => {
    if (!activeCanvas) return;
    const text = new fabric.IText("テキスト", {
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

  const addSparkleEffect = () => {
    if (activeCanvas) {
      createSparkleEffect(activeCanvas);
    }
  };

  const addMonoIlluminationEffect = () => {
    if (activeCanvas) {
      createMonochromeIlluminationEffect(activeCanvas);
    }
  };

  const addRainbowIlluminationEffect = () => {
    if (activeCanvas) {
      createRainbowIlluminationEffect(activeCanvas);
    }
  };

  const addGeminiTestEffect = () => {
    if (activeCanvas) {
      createGeminiTestEffect(activeCanvas);
    }
  };

  const handleSparkleDensityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDensity = parseInt(e.target.value, 10);
    setSparkleDensity(newDensity);

    if (isSparkleEffect(selectedObject) && activeCanvas) {
      updateSparkleDensity(
        selectedObject,
        activeCanvas,
        newDensity,
        sparkleColor
      );
    }
  };

  const handleSparkleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColorHex = e.target.value;
    setSparkleColor(newColorHex);

    if (isSparkleEffect(selectedObject) && activeCanvas) {
      updateSparkleColor(selectedObject, activeCanvas, newColorHex);
    }
  };

  const handleIlluminationBulbCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newCount = parseInt(e.target.value, 10);
    setIlluminationBulbCount(newCount);

    if (isIlluminationEffect(selectedObject) && activeCanvas) {
      updateIlluminationBulbCount(
        selectedObject as any,
        activeCanvas,
        newCount
      );
    }
  };

  const handleIlluminationBlinkSpeedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSpeed = parseInt(e.target.value, 10);
    setIlluminationBlinkSpeed(newSpeed);

    if (isIlluminationEffect(selectedObject) && activeCanvas) {
      updateIlluminationBlinkSpeed(
        selectedObject as any,
        activeCanvas,
        newSpeed
      );
    }
  };

  const handleIlluminationColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColor = e.target.value;
    setIlluminationColor(newColor);

    if (isIlluminationEffect(selectedObject) && activeCanvas) {
      updateIlluminationColor(selectedObject as any, activeCanvas, newColor);
    }
  };

  const handleShare = async (selectedEnvelopePath: string) => {
    if (!liff) {
      alert(
        "LIFFの初期化が完了していません。しばらく待ってから再度お試しください。"
      );
      return;
    }

    if (!liff.isLoggedIn()) {
      liff.login();
      return; // login() redirects, so we stop here.
    }

    try {
      if (isSharing) return;
      setIsSharing(true);

      const canvases = fabricInstances.current;
      if (!canvases.length) {
        throw new Error("ページが存在しません。先にページを追加してください。");
      }

      const letterId = crypto.randomUUID();
      const author =
        (session?.user?.name && session.user.name.trim()) ||
        (session?.user?.name && session.user.name.trim()) ||
        "ゲスト";

      const uploadedImages: {
        url: string;
        pageNumber: number;
        imageEffectsJson: string;
      }[] = [];

      for (let index = 0; index < pages.length; index += 1) {
        const canvas = canvases[index];
        if (!canvas) {
          throw new Error(
            `ページ${
              index + 1
            }のキャンバスが準備できていません。少し待ってから再度お試しください。`
          );
        }

        // 1. Generate static image (excluding effects)
        const dynamicEffects = canvas
          .getObjects()
          .filter(
            (obj) =>
              obj.type === "sparkle-effect" ||
              obj.type === "illumination-effect"
          );

        dynamicEffects.forEach((effect) => effect.set("visible", false));

        let dataUrl: string;
        try {
          const targetWidth = 1400;
          const displayWidth = canvas.getWidth();
          const multiplier = targetWidth / displayWidth;
          dataUrl = canvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier,
          });
        } finally {
          dynamicEffects.forEach((effect) => effect.set("visible", true));
        }

        // 2. Generate JSON for dynamic effects
        const dynamicObjectsJSON = dynamicEffects.map((obj) => obj.toJSON());
        const dynamicLayerJSON = JSON.stringify({
          version: fabric.version,
          objects: dynamicObjectsJSON,
        });

        // 3. Upload static image
        const blob = dataURLtoBlob(dataUrl);
        const filePath = `${letterId}/page-${String(index + 1).padStart(
          2,
          "0"
        )}-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, blob, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Supabase Storageへのアップロードに失敗しました: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("アップロードした画像の公開URL取得に失敗しました。");
        }

        uploadedImages.push({
          url: publicUrlData.publicUrl,
          pageNumber: index + 1,
          imageEffectsJson: dynamicLayerJSON,
        });
      }

      // 4. Save records to database
      const { error: letterInsertError } = await supabase
        .from("letters")
        .insert({ id: letterId, author });

      if (letterInsertError) {
        throw new Error(
          `lettersテーブルへの登録に失敗しました: ${letterInsertError.message}`
        );
      }

      const imageRecords = uploadedImages.map(
        ({ url, pageNumber, imageEffectsJson }) => ({
          letterId,
          imageURL: url,
          pageNumber,
          imageEffectsJson,
        })
      );

      const { error: letterImagesError } = await supabase
        .from("letterImages")
        .insert(imageRecords);

      if (letterImagesError) {
        throw new Error(
          `letterImagesテーブルへの登録に失敗しました: ${letterImagesError.message}`
        );
      }

      // 5. Share via LIFF
      const shareUrl = `${window.location.origin}/view?letterId=${letterId}`;
      const envelopeUrl = `${window.location.origin}${selectedEnvelopePath}`;

      const flexMessage = createFlexMessage(envelopeUrl, shareUrl);

      const result = await liff.shareTargetPicker([flexMessage] as any);
      if (result) {
        alert("LINEでの共有が完了しました！");
      } else {
        console.log("ユーザーが共有をキャンセルしました。");
      }
    } catch (error) {
      console.error("Error during share process:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "原因不明のエラーが発生しました。";
      alert(`送信処理に失敗しました: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
  };

  const promptEnvelopeAndShare = () => {
    setIsEnvelopeModalOpen(true);
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

  const handleColorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      <EnvelopePickerModal
        isOpen={isEnvelopeModalOpen}
        onClose={() => setIsEnvelopeModalOpen(false)}
        onSelectEnvelope={async (envelope) => {
          setIsEnvelopeModalOpen(false);
          // TODO: Add animation here in the future
          await handleShare(envelope);
        }}
        envelopes={availableEnvelopes}
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
            <button className={buttonStyle} onClick={addSparkleEffect}>
              <SparkleIcon className="w-6 h-6" />
              <span>キラキラ</span>
            </button>
            <Tooltip content="キラキラするエフェクトを追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <button className={buttonStyle} onClick={addMonoIlluminationEffect}>
              <BulbIcon className="w-6 h-6" />
              <span>イルミネーション(単色)</span>
            </button>
            <Tooltip content="単色のイルミネーションエフェクトを追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <button className={buttonStyle} onClick={addRainbowIlluminationEffect}>
              <BulbIcon className="w-6 h-6" />
              <span>イルミネーション(虹)</span>
            </button>
            <Tooltip content="虹色のイルミネーションエフェクトを追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <button className={buttonStyle} onClick={addGeminiTestEffect}>
              <BulbIcon className="w-6 h-6" />
              <span>Gemini Test</span>
            </button>
            <Tooltip content="Gemini Testエフェクトを追加します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={isSharing ? disabledButtonStyle : buttonStyle}
              onClick={promptEnvelopeAndShare}
              disabled={isSharing}
            >
              {isSharing ? "送信準備中..." : "LINEで送信"}
            </button>
            <Tooltip content="全ページを保存し、LINEで送信します。">
              <HelpIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>
        </div>

        {pages.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-bold mb-2">ページ {selectedPageIndex + 1}</h4>
            <div className="flex flex-col gap-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-bold"
                onClick={deletePage}
              >
                このページを削除
              </button>
            </div>
          </div>
        )}

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
                  <select
                    value={fontColor}
                    onChange={handleColorChange}
                    className="px-2 py-1 border rounded-md w-full"
                  >
                    <option value="" disabled>
                      色を選択
                    </option>
                    {commonColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
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
            {isSparkleEffect(selectedObject) && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <label>キラキラの密度:</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={sparkleDensity}
                    onChange={handleSparkleDensityChange}
                    className="w-full"
                  />
                  <span>{sparkleDensity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label>色:</label>
                  <input
                    type="color"
                    value={sparkleColor}
                    onChange={handleSparkleColorChange}
                    className="w-10 h-10"
                  />
                </div>
              </div>
            )}
            {isIlluminationEffect(selectedObject) && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <label>電球の数:</label>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={illuminationBulbCount}
                    onChange={handleIlluminationBulbCountChange}
                    className="w-full"
                  />
                  <span>{illuminationBulbCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label>アニメーション速度:</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={illuminationBlinkSpeed}
                    onChange={handleIlluminationBlinkSpeedChange}
                    className="w-full"
                  />
                  <span>{illuminationBlinkSpeed}ms</span>
                </div>
                {selectedObject.effectType ===
                  "illumination-monochrome" && (
                  <div className="flex items-center gap-2">
                    <label>色:</label>
                    <input
                      type="color"
                      value={illuminationColor}
                      onChange={handleIlluminationColorChange}
                      className="w-10 h-10"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col items-center p-8 overflow-y-auto h-screen bg-gray-200">
        {pages.map((page, index) => (
          <div
            key={page.id}
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
