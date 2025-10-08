import { fabric } from "fabric";

type SparkleEffectGroup = fabric.Group & {
  effectColor?: string;
  initialWidth?: number;
  initialHeight?: number;
};

type SparkleParticle = fabric.Circle & {
  __sparkleStop?: boolean;
  __sparkleTimeoutId?: number;
};

type SparkleEffectOptions = fabric.IGroupOptions & {
  effectColor?: string;
  initialWidth?: number;
  initialHeight?: number;
};

const ensureSparkleEffectClass = () => {
  const fabricAny = fabric as any;

  if (fabricAny.SparkleEffect) {
    return fabricAny.SparkleEffect as typeof fabric.Group;
  }

  const SparkleEffect = fabric.util.createClass(fabric.Group, {
    type: "sparkle-effect",
    initialize(
      this: SparkleEffectGroup,
      objects: fabric.Object[],
      options: SparkleEffectOptions = {}
    ) {
      const { effectColor, initialWidth, initialHeight, ...groupOptions } =
        options;

      (this as any).callSuper("initialize", objects, groupOptions);

      if (effectColor !== undefined) {
        this.set("effectColor", effectColor);
      }
      if (initialWidth !== undefined) {
        this.set("initialWidth", initialWidth);
      }
      if (initialHeight !== undefined) {
        this.set("initialHeight", initialHeight);
      }
    },
    toObject(this: SparkleEffectGroup, propertiesToInclude?: string[]) {
      return {
        ...(this as any).callSuper("toObject", propertiesToInclude),
        effectColor: this.effectColor,
        initialWidth: this.initialWidth,
        initialHeight: this.initialHeight,
      };
    },
  });

  (SparkleEffect as any).fromObject = (
    object: any,
    callback: (sparkleGroup: fabric.Object) => void
  ) => {
    const { objects, ...options } = object || {};
    fabric.util.enlivenObjects(
      objects || [],
      (enlivenedObjects: any) => {
        const sparkleGroup = new SparkleEffect(enlivenedObjects, options);
        callback(sparkleGroup);
      },
      ""
    );
  };

  fabricAny.SparkleEffect = SparkleEffect;

  return SparkleEffect as typeof fabric.Group;
};

// Ensure the custom class is registered as soon as the module is loaded.
ensureSparkleEffectClass();

// Private function to animate a single sparkle particle
const animateSparkle = (
  particle: SparkleParticle,
  canvas: fabric.Canvas,
  areaWidth: number,
  areaHeight: number
) => {
  particle.__sparkleStop = false;

  const loop = () => {
    if (particle.__sparkleStop) {
      return;
    }

    const duration = Math.random() * 1000 + 500;
    const delay = Math.random() * 500;

    particle.__sparkleTimeoutId = window.setTimeout(() => {
      if (particle.__sparkleStop) {
        return;
      }

      fabric.util.animate({
        startValue: 1,
        endValue: 0,
        duration,
        onChange: (value: number) => {
          if (particle.__sparkleStop) {
            return;
          }
          particle.set("opacity", value);
          canvas.requestRenderAll();
        },
        onComplete: () => {
          if (particle.__sparkleStop) {
            return;
          }

          particle.set({
            left: Math.random() * areaWidth,
            top: Math.random() * areaHeight,
            opacity: 1,
          });

          loop();
        },
      });
    }, delay);
  };

  loop();
};

const stopSparkleAnimation = (particle: fabric.Object) => {
  const sparkleParticle = particle as SparkleParticle;
  sparkleParticle.__sparkleStop = true;
  if (sparkleParticle.__sparkleTimeoutId !== undefined) {
    window.clearTimeout(sparkleParticle.__sparkleTimeoutId);
    sparkleParticle.__sparkleTimeoutId = undefined;
  }
};

/**
 * Creates a new sparkle effect and adds it to the canvas.
 * @param canvas The fabric.Canvas instance.
 */
export const createSparkleEffect = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  const SparkleEffect = ensureSparkleEffectClass();
  const particles: fabric.Object[] = [];
  const particleCount = 40;
  const areaWidth = 300;
  const areaHeight = 300;
  const initialColor = "#FFFF00";
  const initialColorObj = new fabric.Color(initialColor);
  initialColorObj.setAlpha(0.8);
  const initialRgbaColor = initialColorObj.toRgba();

  for (let i = 0; i < particleCount; i++) {
    const particle = new fabric.Circle({
      left: Math.random() * areaWidth,
      top: Math.random() * areaHeight,
      radius: Math.random() * 2 + 1,
      fill: initialRgbaColor,
      selectable: false,
      evented: false,
    });
    particles.push(particle);
    animateSparkle(particle as SparkleParticle, canvas, areaWidth, areaHeight);
  }

  const sparkleGroup = new (SparkleEffect as any)(particles, {
    left: canvas.getWidth() / 2 - areaWidth / 2,
    top: canvas.getHeight() / 2 - areaHeight / 2,
    effectColor: initialColor,
    initialWidth: areaWidth,
    initialHeight: areaHeight,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
  });

  canvas.add(sparkleGroup);
  canvas.setActiveObject(sparkleGroup);
  canvas.renderAll();
};

/**
 * Updates the density of an existing sparkle effect.
 * @param group The fabric.Group of the sparkle effect.
 * @param canvas The fabric.Canvas instance.
 * @param newDensity The new number of particles.
 * @param sparkleColor The current color of the sparkles.
 */
export const updateSparkleDensity = (
  group: fabric.Group,
  canvas: fabric.Canvas,
  newDensity: number,
  sparkleColor: string
) => {
  if (!group || !canvas) return;

  const sparkleGroup = group as SparkleEffectGroup;
  const currentParticles = group.getObjects();
  const currentCount = currentParticles.length;
  const areaWidth = sparkleGroup.initialWidth ?? 300;
  const areaHeight = sparkleGroup.initialHeight ?? 300;

  if (newDensity > currentCount) {
    const newColorObj = new fabric.Color(sparkleColor);
    newColorObj.setAlpha(0.8);
    const newRgbaColor = newColorObj.toRgba();
    for (let i = 0; i < newDensity - currentCount; i++) {
      const particle = new fabric.Circle({
        left: Math.random() * areaWidth,
        top: Math.random() * areaHeight,
        radius: Math.random() * 2 + 1,
        fill: newRgbaColor,
        selectable: false,
        evented: false,
      });
      group.add(particle);
      animateSparkle(
        particle as SparkleParticle,
        canvas,
        areaWidth,
        areaHeight
      );
    }
  } else if (newDensity < currentCount) {
    for (let i = 0; i < currentCount - newDensity; i++) {
      const particle = currentParticles[currentParticles.length - 1 - i];
      stopSparkleAnimation(particle);
      group.remove(particle);
    }
  }
  group.setCoords();
  canvas.renderAll();
};

/**
 * Updates the color of an existing sparkle effect.
 * @param group The fabric.Group of the sparkle effect.
 * @param canvas The fabric.Canvas instance.
 * @param newColorHex The new hex color string.
 */
export const updateSparkleColor = (
  group: fabric.Group,
  canvas: fabric.Canvas,
  newColorHex: string
) => {
  if (!group || !canvas) return;

  (group as SparkleEffectGroup).effectColor = newColorHex;

  const newColorObj = new fabric.Color(newColorHex);
  newColorObj.setAlpha(0.8);
  const newRgbaColor = newColorObj.toRgba();

  group.getObjects().forEach((particle) => {
    (particle as fabric.Circle).set("fill", newRgbaColor);
  });
  canvas.renderAll();
};

/**
 * Re-initializes the animation for sparkle effects loaded from JSON.
 * @param obj The fabric.Object, potentially a sparkle effect group.
 * @param canvas The fabric.Canvas instance.
 */
export const resumeSparkleAnimation = (
  obj: fabric.Object,
  canvas: fabric.Canvas
) => {
  if (obj.type === "sparkle-effect") {
    const group = obj as SparkleEffectGroup;
    const areaWidth = group.initialWidth ?? group.width ?? 300;
    const areaHeight = group.initialHeight ?? group.height ?? 300;
    group.getObjects().forEach((particle) => {
      stopSparkleAnimation(particle);
      animateSparkle(
        particle as SparkleParticle,
        canvas,
        areaWidth,
        areaHeight
      );
    });
  }
};
