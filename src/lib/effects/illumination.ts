import { fabric } from "fabric";

// =================================================================================
// Type Definitions
// =================================================================================

type IlluminationEffectType = "illumination-monochrome" | "illumination-rainbow";

type Bulb = fabric.Group & {
  __animationStop?: boolean;
  __animationTimeoutId?: number;
};

type IlluminationEffectGroup = fabric.Group & {
  effectType?: IlluminationEffectType;
  bulbCount?: number;
  blinkSpeed?: number;
  color?: string; // For monochrome mode
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
    shadow: new fabric.Shadow({ color, blur: 30 }), // Increased blur
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
 * Arranges all bulbs in the group along a vertical sine wave.
 * @param group The IlluminationEffectGroup.
 */
const arrangeBulbsInWave = (group: IlluminationEffectGroup) => {
  const bulbs = group.getObjects() as Bulb[];
  const bulbCount = bulbs.length;
  if (bulbCount === 0 || !group.height || !group.width) return;

  const groupHeight = group.height;
  const amplitude = group.width / 2;

  bulbs.forEach((bulb, i) => {
    // Distribute bulbs vertically from the top to the bottom of the group's bounding box.
    // The `y` coordinate is relative to the group's center.
    const y =
      bulbCount > 1
        ? -groupHeight / 2 + (i / (bulbCount - 1)) * groupHeight
        : 0;

    // The original wave shape was dependent on the bulb's index `i`, not its `y` position.
    // Let's preserve that for consistent appearance.
    // Original: x = amplitude * sin(( (i * spacing) / (spacing * 6) ) * 2 * PI)
    // Simplified: x = amplitude * sin(i * PI / 3)
    const x = amplitude * Math.sin((i / 6) * 2 * Math.PI);

    bulb.set({
      left: x,
      top: y,
    });
  });

  // Calling `addWithUpdate` caused the group to be resized based on its content,
  // which is the root of the bug. We want to arrange bulbs within the *existing*
  // group dimensions.
  // group.addWithUpdate();

  // We still need to update the controls of the object.
  group.setCoords();
};

/**
 * Stops the animation for a single bulb.
 * @param bulb The bulb to stop animating.
 */
const stopBulbAnimation = (bulb: Bulb) => {
  bulb.__animationStop = true;
  if (bulb.__animationTimeoutId) {
    clearTimeout(bulb.__animationTimeoutId);
  }
};

/**
 * Starts a sparkle-like fade animation for a single bulb.
 * @param bulb The bulb to animate.
 * @param canvas The fabric.Canvas instance.
 * @param blinkSpeed The base speed for the animation cycle.
 */
const animateBulb = (
  bulb: Bulb,
  canvas: fabric.Canvas,
  blinkSpeed: number
) => {
  bulb.__animationStop = false;
  const luminousBody = bulb.getObjects()[1] as fabric.Circle;

  const loop = () => {
    if (bulb.__animationStop) return;

    const duration = (blinkSpeed / 2) * (0.5 + Math.random()); // Randomize duration slightly

    // Fade Out
    fabric.util.animate({
      startValue: 1,
      endValue: 0,
      duration,
      onChange: (value) => {
        if (bulb.__animationStop) return;
        luminousBody.set("opacity", value);
        canvas.requestRenderAll();
      },
      onComplete: () => {
        if (bulb.__animationStop) return;
        // Wait for a bit before fading back in
        bulb.__animationTimeoutId = window.setTimeout(() => {
          if (bulb.__animationStop) return;
          luminousBody.set("opacity", 0);
          // Fade In
          fabric.util.animate({
            startValue: 0,
            endValue: 1,
            duration,
            onChange: (value) => {
              if (bulb.__animationStop) return;
              luminousBody.set("opacity", value);
              canvas.requestRenderAll();
            },
            onComplete: () => {
              if (bulb.__animationStop) return;
              // Restart the loop after a delay
              bulb.__animationTimeoutId = window.setTimeout(
                loop,
                blinkSpeed * (0.5 + Math.random() * 2)
              );
            },
          });
        }, 200 * Math.random());
      },
    });
  };

  loop();
};

/**
 * Starts the animation for all bulbs in the group.
 * @param group The IlluminationEffectGroup.
 * @param canvas The fabric.Canvas instance.
 */
const startAnimation = (
  group: IlluminationEffectGroup,
  canvas: fabric.Canvas
) => {
  const blinkSpeed = group.blinkSpeed || 1000;
  group.forEachObject((obj) => {
    animateBulb(obj as Bulb, canvas, blinkSpeed);
  });
};

/**
 * Stops the animation for the entire group.
 * @param group The IlluminationEffectGroup.
 */
const stopAnimation = (group: IlluminationEffectGroup) => {
  group.forEachObject((obj) => {
    stopBulbAnimation(obj as Bulb);
  });
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
    blinkSpeed = 1000, // Default speed 1s
    color = "#FFFF00",
  } = options;

  const bulbs: Bulb[] = [];
  for (let i = 0; i < bulbCount; i++) {
    const bulbColor =
      effectType === "illumination-rainbow"
        ? rainbowColors[i % rainbowColors.length]
        : color;
    bulbs.push(createBulb(bulbColor));
  }

  const IlluminationEffect = ensureIlluminationEffectClass();
  const group = new (IlluminationEffect as any)(bulbs, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 4,
    width: 100, // Initial width for vertical orientation
    height: canvas.getHeight() / 2, // Initial height for vertical orientation
    effectType,
    bulbCount,
    blinkSpeed,
    color: effectType === "illumination-monochrome" ? color : undefined,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    originX: "center",
    originY: "center",
  }) as IlluminationEffectGroup;

  arrangeBulbsInWave(group);
  canvas.add(group);
  canvas.setActiveObject(group);
  startAnimation(group, canvas);
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

  stopAnimation(group);

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
  startAnimation(group, canvas);
  canvas.renderAll();
};

/**
 * Updates the blinking speed of the animation.
 * @param group The IlluminationEffectGroup.
 * @param canvas The fabric.Canvas instance.
 * @param newSpeed The new speed in milliseconds.
 */
export const updateIlluminationBlinkSpeed = (
  group: IlluminationEffectGroup,
  canvas: fabric.Canvas,
  newSpeed: number
) => {
  if (!group || !canvas) return;
  group.set("blinkSpeed", newSpeed);
  // Restart animation to apply new speed
  stopAnimation(group);
  startAnimation(group, canvas);
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
  if (!group || !canvas || group.effectType !== "illumination-monochrome")
    return;

  group.set("color", newColor);
  group.getObjects().forEach((bulb) => {
    const luminousBody = (bulb as fabric.Group).getObjects()[1] as fabric.Circle;
    luminousBody.set("fill", newColor);
    // Also update shadow color if it exists
    const shadow = luminousBody.shadow as fabric.Shadow;
    if (shadow) {
      shadow.color = newColor;
    }
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
    stopAnimation(group);
    startAnimation(group, canvas);
  }
};
