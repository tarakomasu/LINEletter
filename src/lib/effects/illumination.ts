import { fabric } from "fabric";

// =================================================================================
// Type Definitions
// =================================================================================

type IlluminationEffectType = "illumination-monochrome" | "illumination-rainbow";

type Bulb = fabric.Group & {
  isLuminous?: boolean;
};

type IlluminationEffectGroup = fabric.Group & {
  effectType?: IlluminationEffectType;
  bulbCount?: number;
  blinkSpeed?: number;
  color?: string; // For monochrome mode
  __animationStop?: boolean;
  __animationFrameId?: number;
};

type IlluminationEffectOptions = fabric.IGroupOptions & {
  effectType?: IlluminationEffectType;
  bulbCount?: number;
  blinkSpeed?: number;
  color?: string;
};

const rainbowColors = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
];

// =================================================================================
// Custom Fabric.js Class: IlluminationEffect
// =================================================================================

const ensureIlluminationEffectClass = () => {
  const fabricAny = fabric as any;

  if (fabricAny.IlluminationEffect) {
    return fabricAny.IlluminationEffect as typeof fabric.Group;
  }

  const IlluminationEffect = fabric.util.createClass(fabric.Group, {
    type: "illumination-effect",

    initialize(
      this: IlluminationEffectGroup,
      objects: fabric.Object[],
      options: IlluminationEffectOptions = {}
    ) {
      const { effectType, bulbCount, blinkSpeed, color, ...groupOptions } =
        options;
      (this as any).callSuper("initialize", objects, groupOptions);
      this.set("effectType", effectType);
      this.set("bulbCount", bulbCount);
      this.set("blinkSpeed", blinkSpeed);
      this.set("color", color);
    },

    toObject(this: IlluminationEffectGroup, propertiesToInclude?: string[]) {
      return {
        ...(this as any).callSuper("toObject", propertiesToInclude),
        effectType: this.effectType,
        bulbCount: this.bulbCount,
        blinkSpeed: this.blinkSpeed,
        color: this.color,
      };
    },
  });

  (IlluminationEffect as any).fromObject = (
    object: any,
    callback: (group: fabric.Object) => void
  ) => {
    const { objects, ...options } = object || {};
    fabric.util.enlivenObjects(
      objects || [],
      (enlivenedObjects: any) => {
        const group = new IlluminationEffect(enlivenedObjects, options);
        callback(group);
      },
      ""
    );
  };

  fabricAny.IlluminationEffect = IlluminationEffect;
  return IlluminationEffect as typeof fabric.Group;
};

// Ensure the custom class is registered when the module is loaded.
ensureIlluminationEffectClass();

// =================================================================================
// Private Animation & Utility Functions
// =================================================================================

/**
 * Creates a single bulb object (cover + luminous body).
 * @param color The color of the bulb's core.
 */
const createBulb = (color: string): Bulb => {
  const luminousBody = new fabric.Circle({
    radius: 5,
    fill: color,
    shadow: new fabric.Shadow({ color, blur: 15 }),
    originX: "center",
    originY: "center",
  });

  const cover = new fabric.Circle({
    radius: 7,
    fill: "transparent",
    stroke: "rgba(255, 255, 255, 0.2)",
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
 * Arranges all bulbs in the group along a sine wave.
 * @param group The IlluminationEffectGroup.
 */
const arrangeBulbsInWave = (group: IlluminationEffectGroup) => {
  const bulbs = group.getObjects() as Bulb[];
  const bulbCount = bulbs.length;
  if (bulbCount === 0 || !group.width) return;

  const spacing = group.width / bulbCount;
  const amplitude = group.height ? group.height / 4 : 20; // Amplitude of the wave
  const wavelength = spacing * 6;

  bulbs.forEach((bulb, i) => {
    const x = i * spacing;
    const y = amplitude * Math.sin((x / wavelength) * 2 * Math.PI);
    bulb.set({
      left: x,
      top: y,
    });
  });

  group.addWithUpdate();
  group.setCoords();
};

/**
 * Toggles the luminous state of a bulb.
 * @param bulb The bulb to toggle.
 * @param state The desired state (true for ON, false for OFF).
 */
const setBulbState = (bulb: Bulb, state: boolean) => {
  const luminousBody = bulb.getObjects()[1] as fabric.Circle;
  if (state) {
    luminousBody.set("opacity", 1);
    luminousBody.set("shadow", new fabric.Shadow({
      color: luminousBody.fill as string,
      blur: 15,
    }));
  } else {
    luminousBody.set("opacity", 0);
    luminousBody.set("shadow", undefined);
  }
};


/**
 * Starts the alternating blinking animation for the entire group.
 * @param group The IlluminationEffectGroup.
 * @param canvas The fabric.Canvas instance.
 */
const startBlinkingAnimation = (
  group: IlluminationEffectGroup,
  canvas: fabric.Canvas
) => {
  group.__animationStop = false;
  let frame = 0;

  const animate = () => {
    if (group.__animationStop) return;

    const blinkSpeed = group.blinkSpeed || 500; // Default 500ms

    group.__animationFrameId = window.setTimeout(() => {
	  frame++;
      const isEvenFrame = frame % 2 === 0;

      group.forEachObject((obj, i) => {
        const isEvenBulb = i % 2 === 0;
        setBulbState(obj as Bulb, isEvenFrame ? isEvenBulb : !isEvenBulb);
      });

      canvas.requestRenderAll();
      animate();
    }, blinkSpeed);
  };

  animate();
};

/**
 * Stops the animation for the group.
 * @param group The IlluminationEffectGroup.
 */
const stopBlinkingAnimation = (group: IlluminationEffectGroup) => {
  group.__animationStop = true;
  if (group.__animationFrameId) {
    clearTimeout(group.__animationFrameId);
  }
};

// =================================================================================
// Public API Functions
// =================================================================================

const createIlluminationEffect = (
  canvas: fabric.Canvas,
  options: {
    effectType: IlluminationEffectType;
    bulbCount?: number;
    blinkSpeed?: number;
    color?: string;
  }
) => {
  if (!canvas) return;

  const {
    effectType,
    bulbCount = 5,
    blinkSpeed = 500,
    color = "#FFFF00",
  } = options;

  const bulbs: Bulb[] = [];
  for (let i = 0; i < bulbCount; i++) {
    const bulbColor =
      effectType === "illumination-rainbow" ? rainbowColors[i % rainbowColors.length] : color;
    bulbs.push(createBulb(bulbColor));
  }

  const IlluminationEffect = ensureIlluminationEffectClass();
  const group = new (IlluminationEffect as any)(bulbs, {
    left: canvas.getWidth() / 4,
    top: canvas.getHeight() / 2,
    width: canvas.getWidth() / 2,
    height: 100,
    effectType,
    bulbCount,
    blinkSpeed,
    color: effectType === "illumination-monochrome" ? color : undefined,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
  }) as IlluminationEffectGroup;

  arrangeBulbsInWave(group);
  canvas.add(group);
  canvas.setActiveObject(group);
  startBlinkingAnimation(group, canvas);
  canvas.renderAll();
};


/**
 * Creates a new monochrome illumination effect.
 * @param canvas The fabric.Canvas instance.
 */
export const createMonochromeIlluminationEffect = (canvas: fabric.Canvas) => {
  createIlluminationEffect(canvas, {
    effectType: "illumination-monochrome",
  });
};

/**
 * Creates a new rainbow illumination effect.
 * @param canvas The fabric.Canvas instance.
 */
export const createRainbowIlluminationEffect = (canvas: fabric.Canvas) => {
  createIlluminationEffect(canvas, {
    effectType: "illumination-rainbow",
  });
};


/**
 * Updates the number of bulbs in an existing illumination effect.
 * @param group The IlluminationEffectGroup.
 * @param canvas The fabric.Canvas instance.
 * @param newCount The new number of bulbs.
 */
export const updateIlluminationBulbCount = (
    group: IlluminationEffectGroup,
    canvas: fabric.Canvas,
    newCount: number
    ) => {
  if (!group || !canvas) return;

  const currentCount = group.bulbCount || 0;
  if (newCount === currentCount) return;

  const color = group.color || "#FFFF00";

  if (newCount > currentCount) {
    for (let i = currentCount; i < newCount; i++) {
      const bulbColor =
        group.effectType === "illumination-rainbow"
          ? rainbowColors[i % rainbowColors.length]
          : color;
      const bulb = createBulb(bulbColor);
      group.add(bulb);
    }
  } else {
    for (let i = currentCount - 1; i >= newCount; i--) {
      const bulb = group.getObjects()[i];
      group.remove(bulb);
    }
  }

  group.set("bulbCount", newCount);
  arrangeBulbsInWave(group);
  canvas.renderAll();
};

/**
 * Updates the blinking speed of the animation.
 * @param group The IlluminationEffectGroup.
 * @param newSpeed The new speed in milliseconds.
 */
export const updateIlluminationBlinkSpeed = (
  group: IlluminationEffectGroup,
  newSpeed: number
) => {
  if (!group) return;
  group.set("blinkSpeed", newSpeed);
};

/**
 * Updates the color of a monochrome illumination effect.
 * @param group The IlluminationEffectGroup.
 * @param canvas The fabric.Canvas instance.
 * @param newColor The new hex color string.
 */
export const updateIlluminationColor = (
  group: IlluminationEffectGroup,
  canvas: fabric.Canvas,
  newColor: string
) => {
  if (
    !group ||
    !canvas ||
    group.effectType !== "illumination-monochrome"
  )
    return;

  group.set("color", newColor);
  group.getObjects().forEach((bulb) => {
    const luminousBody = (bulb as fabric.Group).getObjects()[1] as fabric.Circle;
    luminousBody.set("fill", newColor);
  });
  canvas.renderAll();
};

/**
 * Re-initializes the animation for effects loaded from JSON.
 * @param obj The fabric.Object, potentially an illumination effect group.
 * @param canvas The fabric.Canvas instance.
 */
export const resumeIlluminationAnimation = (
  obj: fabric.Object,
  canvas: fabric.Canvas
) => {
  if (obj.type === "illumination-effect") {
    const group = obj as IlluminationEffectGroup;
    stopBlinkingAnimation(group);
    startBlinkingAnimation(group, canvas);
  }
};
