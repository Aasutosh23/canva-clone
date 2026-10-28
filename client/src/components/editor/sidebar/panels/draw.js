"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import {
  Droplets,
  EraserIcon,
  Minus,
  Paintbrush,
  Palette,
  PencilIcon,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { brushSizes, drawingPanelColorPresets } from "@/config";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toggleDrawingMode, toggleEraseMode, updateDrawingBrush } from "@/fabric/fabric-utils";

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
    if (!canvas) return;

    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);

    toggleDrawingMode(canvas, newMode, drawingColor, brushWidth);
  };

  const handleDrawingColorChange = (color) => {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      setDrawingColor(color);
    }

    if (canvas && isDrawingMode && !isErasing) {
      updateDrawingBrush(canvas, { color });
    }
  };

  const handleBrushWidthChange = (value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const width = Number(raw);

    if (!Number.isFinite(width)) return;

    const nextWidth = Math.min(30, Math.max(1, width));
    setBrushWidth(nextWidth);

    if (canvas && isDrawingMode) {
      updateDrawingBrush(canvas, {
        width: isErasing ? nextWidth * 2 : nextWidth,
      });
    }
  };

  const handleDrawingOpacityChange = (value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const opacity = Number(raw);

    if (!Number.isFinite(opacity)) return;

    const nextOpacity = Math.min(100, Math.max(1, opacity));
    setDrawingOpacity(nextOpacity);

    if (canvas && isDrawingMode && !isErasing) {
      updateDrawingBrush(canvas, { opacity: nextOpacity / 100 });
    }
  };

  const handleToggleErasing = () => {
    if (!canvas || !isDrawingMode) return;

    const newErasing = !isErasing;
    setIsErasing(newErasing);

    toggleEraseMode(canvas, newErasing, drawingColor, brushWidth * 2);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <PencilIcon className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Draw</h2>
            <p className="text-sm text-muted-foreground">
              Create freehand drawings on your design.
            </p>
          </div>
        </div>

        <Button
          variant={isDrawingMode ? "default" : "outline"}
          className="w-full py-6 transition-all"
          size="lg"
          onClick={handleToggleDrawingMode}
          disabled={!canvas}
        >
          <PencilIcon className="mr-2 h-5 w-5" />
          <span className="font-medium">
            {isDrawingMode ? "Exit Drawing Mode" : "Enter Drawing Mode"}
          </span>
        </Button>

        {!isDrawingMode && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Ready to draw?</h3>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Select Enter Drawing Mode, then click and drag on the canvas to sketch. Customize
                your color, brush size, and opacity below.
              </p>

              {!canvas && (
                <p className="mt-3 text-sm text-destructive">
                  The canvas is still loading. Drawing tools will be available when it is ready.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Current Brush</h3>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
                  style={{ backgroundColor: drawingColor }}
                >
                  <Paintbrush className="h-5 w-5 text-white drop-shadow" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{drawingColor}</p>
                  <p className="text-xs text-muted-foreground">
                    {brushWidth}px brush · {drawingOpacity}% opacity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Quick colors</Label>
              </div>

              <div className="flex flex-wrap gap-2">
                {drawingPanelColorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Choose ${color}`}
                    aria-pressed={color === drawingColor}
                    className={`h-8 w-8 rounded-full border transition-transform hover:scale-110 ${
                      color === drawingColor ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleDrawingColorChange(color)}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="color"
                  value={drawingColor}
                  onChange={(event) => handleDrawingColorChange(event.target.value)}
                  className="h-10 w-12 cursor-pointer p-1"
                />

                <Input
                  type="text"
                  value={drawingColor}
                  onChange={(event) => handleDrawingColorChange(event.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {isDrawingMode && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
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
                className="w-full py-6"
                size="lg"
              >
                <EraserIcon className="mr-2 h-5 w-5" />
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
