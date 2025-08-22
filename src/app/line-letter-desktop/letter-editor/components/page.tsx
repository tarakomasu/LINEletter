'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { EditorCommand } from '../page';

const TEMPLATE_WIDTH = 1400;
const TEMPLATE_HEIGHT = 2048;

export function PageComponent({ page, onSave, command }: { page: any, onSave: (data: any) => void, command: EditorCommand }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const screenHeight = window.innerHeight * 0.9;
    const scale = screenHeight / TEMPLATE_HEIGHT;
    const canvasWidth = TEMPLATE_WIDTH * scale;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: screenHeight,
      backgroundColor: '#f0f0f0',
    });
    canvasInstance.current = canvas;

    if (page.data) {
      canvas.loadFromJSON(page.data, () => canvas.renderAll());
    } else {
      fabric.Image.fromURL(page.bgUrl, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
        });
      });
    }

    const handleCanvasUpdate = () => {
      onSave(canvas.toJSON());
    };

    canvas.on('object:modified', handleCanvasUpdate);
    canvas.on('object:added', handleCanvasUpdate);

    return () => {
      canvas.off('object:modified', handleCanvasUpdate);
      canvas.off('object:added', handleCanvasUpdate);
      canvas.dispose();
    };
  }, [page.bgUrl, page.data, onSave]);

  useEffect(() => {
    if (command && canvasInstance.current) {
      const canvas = canvasInstance.current;
      if (command === 'addText') {
        const text = new fabric.IText('Tap to edit', {
          left: 100,
          top: 100,
          fill: '#000000',
          fontSize: 40,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
      } else if (command === 'addImage') {
        // For now, adds a placeholder rectangle.
        // A real implementation would need an image upload/selection mechanism.
        const rect = new fabric.Rect({
          left: 150,
          top: 150,
          fill: 'red',
          width: 200,
          height: 200,
        });
        canvas.add(rect);
      }
      canvas.renderAll();
      onSave(canvas.toJSON());
    }
  }, [command, onSave]);

  return <canvas ref={canvasRef} />;
}
