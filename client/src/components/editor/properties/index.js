"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cloneSelectedObject, deletedSelectedObject } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import {
  Bold,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Italic,
  MoveDown,
  MoveUp,
  Pin,
  PinOff,
  Trash,
  Underline,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontFamilies } from "@/config";

function Properties() {
  const { canvas } = useEditorStore();
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectType, setObjectType] = useState("");

  const [isPinned, setIsPinned] = useState(false);

  const [opacity, setOpacity] = useState(100);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [textBackgroundColor, setTextBackgroundColor] = useState("");
  const [letterSpacing, setLetterSpacing] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;
      console.log(activeObject.type, "activeObjecttype");

      setSelectedObject(activeObject);

      setOpacity(Math.round(activeObject.opacity * 100));
      setWidth(Math.round(activeObject.width * activeObject.scaleX));
      setHeight(Math.round(activeObject.height * activeObject.scaleY));

      if (activeObject.type === "i-text") {
        setObjectType("text");
      } else if (activeObject.type === "image") {
        setObjectType("image");
      } else if (activeObject.type === "path") {
        setObjectType("path");
      } else {
        setObjectType("shape");
      }
    };

    const handleSelectionCleared = () => {
      setSelectedObject(null);
    };

    handleSelectionCreated();

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("object:modified", handleSelectionCreated);
    canvas.on("object:scaling", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("object:modified", handleSelectionCreated);
      canvas.off("object:scaling", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [canvas]);

  const updateObjectProperty = (property, value) => {
    if (!canvas || !selectedObject) return;

    selectedObject.set(property, value);
    canvas.renderAll();
  };

  const handleOpacityChange = (value) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setOpacity(newValue);
    updateObjectProperty("opacity", newValue / 100);
  };

  const handleDuplicate = async () => {
    if (!canvas || !selectedObject) return;
    await cloneSelectedObject(canvas);
  };

  const handleDelete = () => {
    if (!canvas || !selectedObject) return;
    deletedSelectedObject(canvas);
  };

  const handleBringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.requestRenderAll();
  };

  const handleSendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.requestRenderAll();
  };

  const handleFlipHorizontal = () => {
    if (!canvas || !selectedObject) return;
    const flipX = !selectedObject.flipX;
    updateObjectProperty("flipX", flipX);
  };

  const handleFlipVertical = () => {
    if (!canvas || !selectedObject) return;
    const flipY = !selectedObject.flipY;
    updateObjectProperty("flipY", flipY);
  };

  const handleTextChange = (e) => {};

  const handleFontSizeChange = (e) => {};

  const handleFontFamilyChange = (e) => {};

  const handleToggleBold = (e) => {};

  const handleToggleItalic = () => {};

  const handleToggleUnderline = (e) => {};

  const handleToggleTextColorChange = (e) => {};

  const handleToggleTextBackgroundColorChange = (e) => {};

  const handleLetterSpacingChange = (e) => {};

  const handleSizeChange = (dimension, e) => {
    const raw = e.target.value;

    if (dimension === "width") setWidth(raw);
    else setHeight(raw);

    const newValue = parseFloat(raw);
    if (!selectedObject || Number.isNaN(newValue) || newValue <= 0) return;

    if (dimension === "width") {
      selectedObject.set("scaleX", newValue / selectedObject.width);
    } else {
      selectedObject.set("scaleY", newValue / selectedObject.height);
    }

    selectedObject.setCoords();
    canvas.renderAll();
  };

  useEffect(() => {
    console.log("Properties mounted");
    return () => console.log("Properties unmounted");
  }, []);

  if (!selectedObject && !isPinned) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-72 bg-white border border-gray-200 z-10 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <span className="font-medium">Properties</span>
        <Button
          variant={isPinned ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsPinned((prev) => !prev)}
          title={isPinned ? "Unpin panel" : "Pin panel"}
        >
          {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
      </div>

      {!selectedObject ? (
        <div className="p-4 text-sm text-gray-500">Select an object to edit its properties.</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          <h3 className="text-sm font-medium">Size & Position</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className={"text-xs"}>Width</Label>
              <Input
                type="number"
                className="h-9"
                value={width}
                onChange={(e) => handleSizeChange("width", e)}
              />
            </div>
            <div className="space-y-1">
              <Label className={"text-xs"}>Height</Label>
              <Input
                type="number"
                className="h-9"
                value={height}
                onChange={(e) => handleSizeChange("height", e)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="opacity" className={"text-xs"}>
                Opacity
              </Label>
              <span>{opacity}%</span>
            </div>
            <Slider
              id="opacity"
              min={0}
              max={100}
              step={1}
              value={[opacity]}
              onValueChange={(value) => handleOpacityChange(value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleFlipHorizontal}
              variant={"outline"}
              size="sm"
              className={"h-8 text-xs"}
            >
              <FlipHorizontal className="h-4 w-4 mr-1" />
              Flip H
            </Button>
            <Button
              onClick={handleFlipVertical}
              variant={"outline"}
              size="sm"
              className={"h-8 text-xs"}
            >
              <FlipVertical className="h-4 w-4 mr-1" />
              Flip V
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Layer Position</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleBringToFront}
                variant={"outline"}
                size="sm"
                className={"h-8 text-xs"}
              >
                <MoveUp className="h-4 w-4" />
                <span>Bring to front</span>
              </Button>
              <Button
                onClick={handleSendToBack}
                variant={"outline"}
                size="sm"
                className={"h-8 text-xs"}
              >
                <MoveDown className="h-4 w-4" />
                <span>Send to back</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Duplicate and Delete</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDuplicate}
                variant={"default"}
                size="sm"
                className={"h-8 text-xs"}
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </Button>
              <Button
                onClick={handleDelete}
                variant={"destructive"}
                size="sm"
                className={"h-8 text-xs"}
              >
                <Trash className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>

          {objectType === "text" && (
            <div className="space-y-4 border-t">
              <h3 className="text-sm font-medium">Text Properties</h3>
              <div className="space-y-2">
                <Label className={"text-xs"} htmlFor="text-content">
                  Text Content
                </Label>
                <Textarea
                  id="text-content"
                  value={text}
                  onChange={handleTextChange}
                  className={"h-20 resize-none"}
                />
              </div>
              <div className="space-y-2">
                <Label className={"text-xs"} htmlFor="font-size">
                  Font Size
                </Label>
                <Input
                  id="font-size"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(e)}
                  className={"w-16 h-7 text-xs"}
                  type={"number"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-family" className="text-sm">
                  Font Family
                </Label>
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger id="font-family" className={"h-10"}>
                    <SelectValue placeholder="Select Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((fontItem) => (
                      <SelectItem key={fontItem} value={fontItem} style={{ fontFamily: fontItem }}>
                        {fontItem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Style</Label>
                <div className="flex gap-2">
                  <Button
                    variant={fontWeight === "bold" ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleBold}
                    className={"w-8 h-8"}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={fontWeight === "italic" ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleItalic}
                    className={"w-8 h-8"}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={underline ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleUnderline}
                    className={"w-8 h-8"}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Label htmlFor="text-color" className="text-sm">
                    Text Color
                  </Label>
                  <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                    <div className="absolute inset-0" style={{ backgroundColor: textColor }} />
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={handleToggleTextColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-bg-color" className="text-sm">
                    Text BG Color
                  </Label>
                  <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: textBackgroundColor }}
                    />
                    <Input
                      id="text-bg-color"
                      type="color"
                      value={textBackgroundColor}
                      onChange={handleToggleTextBackgroundColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Properties;
