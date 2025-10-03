import { fabric } from "fabric";

// Private function to animate a single sparkle particle
const animateSparkle = (
  particle: fabric.Object,
  canvas: fabric.Canvas,
  areaWidth: number,
  areaHeight: number
) => {
  const duration = Math.random() * 1000 + 500;
  const delay = Math.random() * 500;

  setTimeout(() => {
    particle.animate("opacity", 0, {
      duration,
      onChange: canvas.renderAll.bind(canvas),
      onComplete: () => {
        particle.set({
          left: Math.random() * areaWidth,
          top: Math.random() * areaHeight,
          opacity: 1,
        });
        animateSparkle(particle, canvas, areaWidth, areaHeight);
      },
    });
  }, delay);
};

/**
 * Creates a new sparkle effect and adds it to the canvas.
 * @param canvas The fabric.Canvas instance.
 */
export const createSparkleEffect = (canvas: fabric.Canvas) => {
  if (!canvas) return;

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
    animateSparkle(particle, canvas, areaWidth, areaHeight);
  }

  const group = new fabric.Group(particles, {
    left: canvas.getWidth() / 2 - areaWidth / 2,
    top: canvas.getHeight() / 2 - areaHeight / 2,
    // Custom properties
    type: "sparkle-effect",
    // @ts-ignore
    effectColor: initialColor,
    // @ts-ignore
    initialWidth: areaWidth,
    initialHeight: areaHeight,
    // Standard properties
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
  });

  canvas.add(group);
  canvas.setActiveObject(group);
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

  const currentParticles = group.getObjects();
  const currentCount = currentParticles.length;
  const areaWidth = (group as any).initialWidth ?? 300;
  const areaHeight = (group as any).initialHeight ?? 300;

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
      animateSparkle(particle, canvas, areaWidth, areaHeight);
    }
  } else if (newDensity < currentCount) {
    for (let i = 0; i < currentCount - newDensity; i++) {
      group.remove(currentParticles[currentParticles.length - 1 - i]);
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

  (group as any).effectColor = newColorHex;

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
  if ((obj as any).type === "sparkle-effect") {
    const group = obj as fabric.Group;
    const areaWidth = (group as any).initialWidth ?? group.width ?? 300;
    const areaHeight = (group as any).initialHeight ?? group.height ?? 300;
    group.getObjects().forEach((particle) => {
      animateSparkle(particle, canvas, areaWidth, areaHeight);
    });
  }
};
