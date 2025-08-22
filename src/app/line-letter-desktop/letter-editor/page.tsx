'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

export default function LetterEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/template-papers/sea.png'
    img.onload = () => {
      const screenHeight = window.innerHeight * 0.9
      const scale = screenHeight / img.height
      const canvasWidth = img.width * scale

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: screenHeight,
        backgroundColor: '#f0f0f0',
      })
      fabricCanvasRef.current = canvas

      fabric.Image.fromURL(img.src, (bgImg) => {
        canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / bgImg.width!,
          scaleY: canvas.height! / bgImg.height!,
        })
      })

      canvas.on('selection:created', (e) => setSelectedObject(e.selected[0]))
      canvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]))
      canvas.on('selection:cleared', () => setSelectedObject(null))
    }

    return () => {
      fabricCanvasRef.current?.dispose()
    }
  }, [])

  const addText = () => {
    const text = new fabric.IText('Tap to edit', {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: '#000',
    })
    fabricCanvasRef.current?.add(text)
  }

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imgObj = new Image()
      imgObj.src = event.target?.result as string
      imgObj.onload = () => {
        const image = new fabric.Image(imgObj)
        image.scaleToWidth(200)
        fabricCanvasRef.current?.add(image)
      }
    }
    reader.readAsDataURL(file)
  }

  const saveCanvas = () => {
    const canvasJson = fabricCanvasRef.current?.toJSON()
    console.log(JSON.stringify(canvasJson, null, 2))
    alert('Canvas content saved to console!')
  }

  const deleteSelected = () => {
    if (selectedObject) {
      fabricCanvasRef.current?.remove(selectedObject)
      setSelectedObject(null)
    }
  }

  const bringForward = () => {
    if (selectedObject) {
      fabricCanvasRef.current?.bringForward(selectedObject)
    }
  }

  const sendBackwards = () => {
    if (selectedObject) {
      fabricCanvasRef.current?.sendBackwards(selectedObject)
    }
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObject && selectedObject.type === 'i-text') {
      (selectedObject as fabric.IText).set('fontSize', parseInt(e.target.value, 10))
      fabricCanvasRef.current?.renderAll()
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObject && selectedObject.type === 'i-text') {
      (selectedObject as fabric.IText).set('fill', e.target.value)
      fabricCanvasRef.current?.renderAll()
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex">
      <div className="w-64 bg-white shadow-md p-4 sticky top-0 h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Controls</h3>
        <div className="flex flex-col gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={addText}>Add Text</button>
          <input type="file" accept="image/*" onChange={addImage} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
          <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={saveCanvas}>Save</button>
          {selectedObject && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-bold mb-2">Selected Object</h4>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={deleteSelected}>Delete</button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-md" onClick={bringForward}>Bring Forward</button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-md" onClick={sendBackwards}>Send Backwards</button>
                {selectedObject.type === 'i-text' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label>Size:</label>
                      <input type="number" value={(selectedObject as fabric.IText).fontSize} onChange={handleFontSizeChange} className="px-2 py-1 border rounded-md w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label>Color:</label>
                      <input type="color" value={(selectedObject as fabric.IText).fill as string} onChange={handleColorChange} className="w-10 h-10" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center p-8">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
