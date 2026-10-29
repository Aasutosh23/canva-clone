"use client";

import { colorPresets } from "@/config";
import { Check, Palette } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { centerCanvas } from "@/fabric/fabric-utils";

function SettingsPanel() {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const { canvas, markAsModified } = useEditorStore();

  const handleColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleColorPresetApply = (color) => {
    setBackgroundColor(color);
  };

  const handleApplyChanges = () => {
    if (!canvas) return;
    canvas.set("backgroundColor", backgroundColor);
    canvas.renderAll();

    centerCanvas(canvas);
    markAsModified();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Choose background color</h3>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-2 mb-3">
          <TooltipProvider>
            {colorPresets.map((color) => (
              <Tooltip key={color}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => handleColorPresetApply(color)}
                      aria-label={`Choose background color ${color}`}
                      aria-pressed={color === backgroundColor}
                      className={`w-8 h-8 rounded-md border transition-transform hover:scale-110 ${
                        color === backgroundColor ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {color === backgroundColor && (
                        <Check className="w-4 h-4 text-white mx-auto drop-shadow-md" />
                      )}
                    </button>
                  }
                />

                <TooltipContent>
                  <p>{color}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        <div className="flex mt-3 space-x-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={handleColorChange}
            className="w-12 h-10 p-1 cursor-pointer"
            aria-label="Select background color"
          />

          <Input
            type="text"
            value={backgroundColor}
            onChange={handleColorChange}
            className="flex-1"
            placeholder="#FFFFFF"
            aria-label="Enter background hex color"
          />
        </div>

        <Separator className="my-4" />

        <Button className="w-full" onClick={handleApplyChanges}>
          Apply Changes
        </Button>

        {canvas?.getObjects?.()?.some((o) => o.isCanvasBackground) && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold text-gray-800">Background Image</h4>
            <p className="text-xs text-gray-500">A photo is applied as canvas background.</p>
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  const bg = canvas.getObjects().find((o) => o.isCanvasBackground);
                  if (!bg) return;
                  bg.set({
                    selectable: true,
                    evented: true,
                    isCanvasBackground: false,
                  });
                  canvas.setActiveObject(bg);
                  canvas.requestRenderAll();
                }}
              >
                Detach from Background
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  const bg = canvas.getObjects().find((o) => o.isCanvasBackground);
                  if (!bg) return;
                  canvas.remove(bg);
                  canvas.discardActiveObject();
                  canvas.requestRenderAll();
                }}
              >
                Remove Background Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;
