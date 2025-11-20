import { fabric } from "fabric";

// =================================================================================
// Type Definitions
// =================================================================================

type GeminiTestEffectGroup = fabric.Group & {
  bulbCount?: number;
  blinkSpeed?: number;
};

type Bulb = fabric.Group & {
  __animationStop?: boolean;
  __animationTimeoutId?: number;
};

type GeminiTestEffectOptions = fabric.IGroupOptions & {
  bulbCount?: number;
  blinkSpeed?: number;
};

// =================================================================================
// Custom Fabric.js Class: GeminiTestEffect
// =================================================================================

const ensureGeminiTestEffectClass = () => {
  const fabricAny = fabric as any;

  if (fabricAny.GeminiTestEffect) {
    return fabricAny.GeminiTestEffect as typeof fabric.Group;
  }

  const GeminiTestEffect = fabric.util.createClass(fabric.Group, {
    type: "gemini-test-effect",

    initialize(
      this: GeminiTestEffectGroup,
      objects: fabric.Object[],
      options: GeminiTestEffectOptions = {}
    ) {
      const { bulbCount, blinkSpeed, ...groupOptions } = options;
      (this as any).callSuper("initialize", objects, groupOptions);
      this.set("bulbCount", bulbCount);
      this.set("blinkSpeed", blinkSpeed);
    },

    toObject(this: GeminiTestEffectGroup, propertiesToInclude?: string[]) {
      return {
        ...(this as any).callSuper("toObject", propertiesToInclude),
        bulbCount: this.bulbCount,
        blinkSpeed: this.blinkSpeed,
      };
    },
  });

  (GeminiTestEffect as any).fromObject = (
    object: any,
    callback: (group: fabric.Object) => void
  ) => {
    const { objects, ...options } = object || {};
    fabric.util.enlivenObjects(
      objects || [],
      (enlivenedObjects: any) => {
        const group = new GeminiTestEffect(enlivenedObjects, options);
        callback(group);
      },
      ""
    );
  };

  fabricAny.GeminiTestEffect = GeminiTestEffect;
  return GeminiTestEffect as typeof fabric.Group;
};

// Ensure the custom class is registered when the module is loaded.
ensureGeminiTestEffectClass();

// =================================================================================
// Private Animation & Utility Functions
// =================================================================================

/**
 * Creates a single bulb object (cover + luminous body).
 */
const createBulb = (): Bulb => {
  const color = "#FFC107"; // Warm Golden

  const luminousBody = new fabric.Circle({
    radius: 4,
    fill: color,
    shadow: new fabric.Shadow({ color, blur: 20 }),
    originX: "center",
    originY: "center",
  });

  const cover = new fabric.Circle({
    radius: 6,
    fill: "transparent",
    stroke: "rgba(255, 255, 255, 0.3)",
    strokeWidth: 1,
    originX: "center",
    originY: "center",
  });

  const bulb = new fabric.Group([cover, luminousBody], {
    originX: "center",
    originY: "center",
  }) as Bulb;

  return bulb;
};

/**
 * Arranges bulbs in an "Icicle / Curtain" pattern.
 * Strands hang down from the top.
 */
const arrangeBulbsInCurtain = (group: GeminiTestEffectGroup) => {
  const bulbs = group.getObjects() as Bulb[];
  const bulbCount = bulbs.length;
  if (bulbCount === 0 || !group.width) return;

  const groupWidth = group.width;
  const strandCount = Math.ceil(Math.sqrt(bulbCount)); // Rough grid approximation
  const bulbsPerStrand = Math.ceil(bulbCount / strandCount);
  const spacingX = groupWidth / (strandCount + 1);
  const spacingY = 30; // Vertical distance between bulbs in a strand

  bulbs.forEach((bulb, i) => {
    const strandIndex = i % strandCount;
    const positionInStrand = Math.floor(i / strandCount);

    // Randomize strand length slightly for natural look
    const strandOffset = (strandIndex % 3) * 15; 

    const x = -groupWidth / 2 + spacingX * (strandIndex + 1);
    const y = -group.height! / 2 + positionInStrand * spacingY + strandOffset;

    bulb.set({
      left: x,
      top: y,
    });
  });

  group.setCoords();
};

const stopBulbAnimation = (bulb: Bulb) => {
  bulb.__animationStop = true;
  if (bulb.__animationTimeoutId) {
    clearTimeout(bulb.__animationTimeoutId);
  }
};

const animateBulb = (
  bulb: Bulb,
  canvas: fabric.Canvas,
  blinkSpeed: number
) => {
  bulb.__animationStop = false;
  const luminousBody = bulb.getObjects()[1] as fabric.Circle;

  const loop = () => {
    if (bulb.__animationStop) return;

    const duration = (blinkSpeed / 2) * (0.8 + Math.random() * 0.4);

    // Fade Out
    fabric.util.animate({
      startValue: 1,
      endValue: 0.2, // Don't go completely dark
      duration,
      onChange: (value) => {
        if (bulb.__animationStop) return;
        luminousBody.set("opacity", value);
        canvas.requestRenderAll();
      },
      onComplete: () => {
        if (bulb.__animationStop) return;
        // Fade In
        fabric.util.animate({
          startValue: 0.2,
          endValue: 1,
          duration,
          onChange: (value) => {
            if (bulb.__animationStop) return;
            luminousBody.set("opacity", value);
            canvas.requestRenderAll();
          },
          onComplete: () => {
            if (bulb.__animationStop) return;
            bulb.__animationTimeoutId = window.setTimeout(
              loop,
              Math.random() * 500
            );
          },
        });
      },
    });
  };

  loop();
};

const startAnimation = (
  group: GeminiTestEffectGroup,
  canvas: fabric.Canvas
) => {
  const blinkSpeed = group.blinkSpeed || 1500;
  group.forEachObject((obj) => {
    animateBulb(obj as Bulb, canvas, blinkSpeed);
  });
};

const stopAnimation = (group: GeminiTestEffectGroup) => {
  group.forEachObject((obj) => {
    stopBulbAnimation(obj as Bulb);
  });
};

// =================================================================================
// Public API Functions
// =================================================================================

export const createGeminiTestEffect = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  const bulbCount = 20;
  const blinkSpeed = 1500;

  const bulbs: Bulb[] = [];
  for (let i = 0; i < bulbCount; i++) {
    bulbs.push(createBulb());
  }

  const GeminiTestEffect = ensureGeminiTestEffectClass();
  const group = new (GeminiTestEffect as any)(bulbs, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 4,
    width: 300,
    height: 200,
    bulbCount,
    blinkSpeed,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    originX: "center",
    originY: "center",
  }) as GeminiTestEffectGroup;

  arrangeBulbsInCurtain(group);
  canvas.add(group);
  canvas.setActiveObject(group);
  startAnimation(group, canvas);
  canvas.renderAll();
};

export const resumeGeminiTestAnimation = (
  obj: fabric.Object,
  canvas: fabric.Canvas
) => {
  if (obj.type === "gemini-test-effect") {
    const group = obj as GeminiTestEffectGroup;
    stopAnimation(group);
    startAnimation(group, canvas);
  }
};
