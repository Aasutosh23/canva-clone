"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Droplets, EraserIcon, Minus, Paintbrush, Palette, PencilIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { brushSizes, drawingPanelColorPresets } from "@/config";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

function DrawingPanel() {
  const { canvas } = useEditorStore();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);
  const [drawingOpacity, setDrawingOpacity] = useState(100);
  const [activeTab, setActiveTab] = useState("colors");

  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = isDrawingMode;

    if (canvas.freeDrawingBrush) {
      const hex = drawingColor.replace("#", "");

      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        const red = parseInt(hex.slice(0, 2), 16);
        const green = parseInt(hex.slice(2, 4), 16);
        const blue = parseInt(hex.slice(4, 6), 16);
        const alpha = drawingOpacity / 100;

        canvas.freeDrawingBrush.color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }

      canvas.freeDrawingBrush.width = brushWidth;
    }

    canvas.requestRenderAll();
  }, [canvas, isDrawingMode, drawingColor, brushWidth, drawingOpacity]);

  const handleToggleDrawingMode = () => {
    setIsDrawingMode((previous) => !previous);
  };

  const handleDrawingColorChange = (color) => {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      setDrawingColor(color);
    }
  };

  const handleBrushWidthChange = (value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const width = Number(raw);

    if (!Number.isFinite(width)) return;

    setBrushWidth(Math.min(30, Math.max(1, width)));
  };

  const handleDrawingOpacityChange = (value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const opacity = Number(raw);

    if (!Number.isFinite(opacity)) return;

    setDrawingOpacity(Math.min(100, Math.max(1, opacity)));
  };

  const handleToggleErasing = () => {
    const newErasing = !isErasing;
    setIsErasing(newErasing);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-5">
        <Button
          variant={isDrawingMode ? "default" : "outline"}
          className="group w-full py-6 transition-all"
          size="lg"
          onClick={handleToggleDrawingMode}
        >
          <PencilIcon
            className={`mr-2 h-5 w-5 ${isDrawingMode ? "animate-bounce" : "hover:animate-bounce"}`}
          />

          <span className="font-medium">
            {isDrawingMode ? "Exit Drawing Mode" : "Enter Drawing Mode"}
          </span>
        </Button>

        {isDrawingMode && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="colors">
                <Palette className="mr-2 h-4 w-4" />
                Colors
              </TabsTrigger>

              <TabsTrigger value="brush">
                <Paintbrush className="mr-2 h-4 w-4" />
                Brush
              </TabsTrigger>

              <TabsTrigger value="tools">
                <EraserIcon className="mr-2 h-4 w-4" />
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Color Palette</Label>

                  <div
                    className="h-6 w-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: drawingColor }}
                  />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {drawingPanelColorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choose ${color}`}
                      aria-pressed={color === drawingColor}
                      className={`h-10 w-10 rounded-full border transition-transform hover:scale-110 ${
                        color === drawingColor ? "ring-1 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleDrawingColorChange(color)}
                      disabled={isErasing}
                    />
                  ))}
                </div>

                <div className="mt-5 flex space-x-2">
                  <Input
                    type="color"
                    value={drawingColor}
                    onChange={(event) => handleDrawingColorChange(event.target.value)}
                    className="h-10 w-12 cursor-pointer p-1"
                    disabled={isErasing}
                  />

                  <Input
                    type="text"
                    value={drawingColor}
                    onChange={(event) => handleDrawingColorChange(event.target.value)}
                    className="flex-1"
                    disabled={isErasing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brush" className="space-y-4">
              <div className="space-y-3">
                <Label className="block text-sm font-semibold">Brush Size</Label>

                <div className="flex items-center space-x-3">
                  <Minus className="h-4 w-4 text-gray-500" />

                  <Slider
                    value={[brushWidth]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={handleBrushWidthChange}
                    className="flex-1"
                  />

                  <Plus className="h-4 w-4 text-gray-500" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {brushSizes.map((size) => (
                    <Button
                      key={size.value}
                      variant={Number(size.value) === brushWidth ? "default" : "outline"}
                      className="h-auto px-2 py-1"
                      onClick={() => handleBrushWidthChange(size.value)}
                    >
                      {size.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center font-medium">
                      <Droplets className="mr-2 h-4 w-4" />
                      Opacity
                    </Label>

                    <span className="text-sm font-medium">{drawingOpacity}%</span>
                  </div>

                  <Slider
                    value={[drawingOpacity]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={handleDrawingOpacityChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools">
              <Button
                onClick={handleToggleErasing}
                variant={isErasing ? "destructive" : "outline"}
                className={"w-full py-6"}
                size="lg"
              >
                <EraserIcon className="mr-2 w-5 h-5" />
                {isErasing ? "Stop Erasing" : "Eraser mode"}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default DrawingPanel;
