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

  const [fillColor, setFillColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState("solid");

  const [filter, setFilter] = useState("none");
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject();

      if (!activeObject) return;

      setSelectedObject(activeObject);

      setOpacity(Math.round((activeObject.opacity ?? 1) * 100));
      setWidth(Math.round((activeObject.width ?? 0) * (activeObject.scaleX ?? 1)));
      setHeight(Math.round((activeObject.height ?? 0) * (activeObject.scaleY ?? 1)));
      setBorderColor(activeObject.stroke || "#000000");
      setBorderWidth(activeObject.strokeWidth || 0);

      if (activeObject.type === "i-text") {
        setObjectType("text");
        setText(activeObject.text || "");
        setFontSize(activeObject.fontSize || 24);
        setFontFamily(activeObject.fontFamily || "Arial");
        setFontWeight(activeObject.fontWeight || "normal");
        setFontStyle(activeObject.fontStyle || "normal");
        setUnderline(activeObject.underline || false);
        setTextColor(typeof activeObject.fill === "string" ? activeObject.fill : "#000000");
        setTextBackgroundColor(activeObject.backgroundColor || "");
        setLetterSpacing(activeObject.charSpacing || 0);
      } else if (activeObject.type === "image") {
        setObjectType("image");
        setFilter("none");
        setBlur(0);

        if (activeObject.filters && activeObject.filters.length > 0) {
          const filterObj = activeObject.filters[0];
          if (filterObj.type === "Grayscale") setFilter("grayscale");
          else if (filterObj.type === "Sepia") setFilter("sepia");
          else if (filterObj.type === "Invert") setFilter("invert");
          else if (filterObj.type === "Blur") {
            setFilter("blur");
            setBlur(filterObj.blur * 100 || 0);
          } else setFilter("none");
        }
      } else if (activeObject.type === "path") {
        setObjectType("path");

        if (activeObject.strokeDashArray) {
          if (activeObject.strokeDashArray[0] === 5 && activeObject.strokeDashArray[1] === 5) {
            setBorderStyle("dashed");
          } else if (
            activeObject.strokeDashArray[0] === 2 &&
            activeObject.strokeDashArray[1] === 2
          ) {
            setBorderStyle("dotted");
          } else {
            setBorderStyle("solid");
          }
        }
      } else {
        setObjectType("shape");

        if (activeObject.fill && typeof activeObject.fill === "string") {
          setFillColor(activeObject.fill);
        }

        if (activeObject.strokeDashArray) {
          if (activeObject.strokeDashArray[0] === 5 && activeObject.strokeDashArray[1] === 5) {
            setBorderStyle("dashed");
          } else if (
            activeObject.strokeDashArray[0] === 2 &&
            activeObject.strokeDashArray[1] === 2
          ) {
            setBorderStyle("dotted");
          } else {
            setBorderStyle("solid");
          }
        }

        if (activeObject.strokeDashArray) {
          if (activeObject.strokeDashArray[0] === 5 && activeObject.strokeDashArray[1] === 5) {
            setBorderStyle("dashed");
          } else if (
            activeObject.strokeDashArray[0] === 2 &&
            activeObject.strokeDashArray[1] === 2
          ) {
            setBorderStyle("dotted");
          } else {
            setBorderStyle("solid");
          }
        }

        setFillColor(typeof activeObject.fill === "string" ? activeObject.fill : "#ffffff");

        setBorderColor(typeof activeObject.stroke === "string" ? activeObject.stroke : "#000000");

        setBorderWidth(activeObject.strokeWidth ?? 0);

        const dashArray = activeObject.strokeDashArray;

        if (dashArray?.[0] === 2) {
          setBorderStyle("dotted");
        } else if (dashArray?.[0] === 5) {
          setBorderStyle("dashed");
        } else {
          setBorderStyle("solid");
        }
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
    canvas.requestRenderAll();
  };

  const handleOpacityChange = (value) => {
    const newValue = Array.isArray(value) ? value[0] : value;

    if (!Number.isFinite(newValue)) return;

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
    if (!selectedObject) return;

    updateObjectProperty("flipX", !selectedObject.flipX);
  };

  const handleFlipVertical = () => {
    if (!selectedObject) return;

    updateObjectProperty("flipY", !selectedObject.flipY);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;

    setText(newText);
    updateObjectProperty("text", newText);
  };

  const handleFontSizeChange = (e) => {
    const newSize = Number(e.target.value);

    setFontSize(newSize);

    if (Number.isFinite(newSize) && newSize > 0) {
      updateObjectProperty("fontSize", newSize);
    }
  };

  const handleFontFamilyChange = (value) => {
    setFontFamily(value);
    updateObjectProperty("fontFamily", value);
  };

  const handleToggleBold = () => {
    const newWeight = fontWeight === "bold" ? "normal" : "bold";

    setFontWeight(newWeight);
    updateObjectProperty("fontWeight", newWeight);
  };

  const handleToggleItalic = () => {
    const newStyle = fontStyle === "italic" ? "normal" : "italic";

    setFontStyle(newStyle);
    updateObjectProperty("fontStyle", newStyle);
  };

  const handleToggleUnderline = () => {
    const newUnderline = !underline;

    setUnderline(newUnderline);
    updateObjectProperty("underline", newUnderline);
  };

  const handleToggleTextColorChange = (e) => {
    const newTextColor = e.target.value;

    setTextColor(newTextColor);
    updateObjectProperty("fill", newTextColor);
  };

  const handleToggleTextBackgroundColorChange = (e) => {
    const newTextBgColor = e.target.value;

    setTextBackgroundColor(newTextBgColor);
    updateObjectProperty("backgroundColor", newTextBgColor);
  };

  const handleLetterSpacingChange = (value) => {
    const newSpacing = Array.isArray(value) ? value[0] : value;

    if (!Number.isFinite(newSpacing)) return;

    setLetterSpacing(newSpacing);
    updateObjectProperty("charSpacing", newSpacing);
  };

  const handleFillColorChange = (e) => {
    const newFillColor = e.target.value;

    setFillColor(newFillColor);
    updateObjectProperty("fill", newFillColor);
  };

  const handleBorderColorChange = (e) => {
    const newBorderColor = e.target.value;

    setBorderColor(newBorderColor);
    updateObjectProperty("stroke", newBorderColor);
  };

  const handleBorderWidthChange = (value) => {
    const newBorderWidth = Array.isArray(value) ? value[0] : value;

    if (!Number.isFinite(newBorderWidth)) return;

    setBorderWidth(newBorderWidth);
    updateObjectProperty("strokeWidth", newBorderWidth);
  };

  const handleBorderStyleChange = (newBorderStyle) => {
    setBorderStyle(newBorderStyle);

    let strokeDashArray = null;

    if (newBorderStyle === "dashed") {
      strokeDashArray = [5, 5];
    } else if (newBorderStyle === "dotted") {
      strokeDashArray = [2, 2];
    }

    updateObjectProperty("strokeDashArray", strokeDashArray);
  };

  const handleSizeChange = (dimension, e) => {
    const raw = e.target.value;

    if (dimension === "width") {
      setWidth(raw);
    } else {
      setHeight(raw);
    }

    const newValue = parseFloat(raw);

    if (!canvas || !selectedObject || !Number.isFinite(newValue) || newValue <= 0) {
      return;
    }

    if (dimension === "width") {
      if (!selectedObject.width) return;

      selectedObject.set("scaleX", newValue / selectedObject.width);
    } else {
      if (!selectedObject.height) return;

      selectedObject.set("scaleY", newValue / selectedObject.height);
    }

    selectedObject.setCoords();
    canvas.requestRenderAll();
  };

  const handleImageFilterChange = async (value) => {
    setFilter(value);

    if (!canvas || !selectedObject || selectedObject.type !== "image") return;

    try {
      const fabricModule = await import("fabric");
      const fabric =
        fabricModule.fabric || fabricModule.default?.fabric || fabricModule.default || fabricModule;

      const filters = fabric.Image.filters;

      selectedObject.filters = [];

      switch (value) {
        case "grayscale":
          selectedObject.filters.push(new filters.Grayscale());
          break;

        case "sepia":
          selectedObject.filters.push(new filters.Sepia());
          break;

        case "invert":
          selectedObject.filters.push(new filters.Invert());
          break;

        case "blur":
          selectedObject.filters.push(new filters.Blur({ blur: blur / 100 }));
          break;

        case "none":
        default:
          break;
      }

      selectedObject.applyFilters();
      canvas.setActiveObject(selectedObject);
      canvas.requestRenderAll();
    } catch (error) {
      console.error("Failed to apply image filter:", error);
    }
  };

  const handleBlurChange = async (value) => {
    const newBlurValue = Array.isArray(value) ? value[0] : value;

    if (!Number.isFinite(newBlurValue)) return;

    setBlur(newBlurValue);

    if (!canvas || !selectedObject || selectedObject.type !== "image" || filter !== "blur") {
      return;
    }

    try {
      const fabricModule = await import("fabric");
      const fabric =
        fabricModule.fabric || fabricModule.default?.fabric || fabricModule.default || fabricModule;

      const filters = fabric.Image.filters;

      selectedObject.filters = [new filters.Blur({ blur: newBlurValue / 100 })];

      selectedObject.applyFilters();
      canvas.requestRenderAll();
    } catch (error) {
      console.error("Error while applying blur:", error);
    }
  };

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
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                className="h-9"
                value={width}
                onChange={(e) => handleSizeChange("width", e)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Height</Label>
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
              <Label htmlFor="opacity" className="text-xs">
                Opacity
              </Label>
              <span className="text-xs">{opacity}%</span>
            </div>

            <Slider
              id="opacity"
              min={0}
              max={100}
              step={1}
              value={[Number.isFinite(opacity) ? opacity : 100]}
              onValueChange={handleOpacityChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleFlipHorizontal}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <FlipHorizontal className="h-4 w-4 mr-1" />
              Flip H
            </Button>

            <Button
              onClick={handleFlipVertical}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
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
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <MoveUp className="h-4 w-4" />
                <span>Bring to front</span>
              </Button>

              <Button
                onClick={handleSendToBack}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <MoveDown className="h-4 w-4" />
                <span>Send to back</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Duplicate and Delete</h3>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDuplicate} variant="default" size="sm" className="h-8 text-xs">
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </Button>

              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="h-8 text-xs"
              >
                <Trash className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>

          {objectType === "text" && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Text Properties</h3>

              <div className="space-y-2">
                <Label className="text-xs" htmlFor="text-content">
                  Text Content
                </Label>
                <Textarea
                  id="text-content"
                  value={text}
                  onChange={handleTextChange}
                  className="h-20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs" htmlFor="font-size">
                  Font Size
                </Label>
                <Input
                  id="font-size"
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="w-16 h-7 text-xs"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family" className="text-sm">
                  Font Family
                </Label>

                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger id="font-family" className="h-10">
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
                    className="w-8 h-8"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={fontStyle === "italic" ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleItalic}
                    className="w-8 h-8"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={underline ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleUnderline}
                    className="w-8 h-8"
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
                      style={{
                        backgroundColor: textBackgroundColor || "#ffffff",
                      }}
                    />
                    <Input
                      id="text-bg-color"
                      type="color"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(textBackgroundColor)
                          ? textBackgroundColor
                          : "#ffffff"
                      }
                      onChange={handleToggleTextBackgroundColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs" htmlFor="letter-spacing">
                    Letter Spacing
                  </Label>
                  <span className="text-xs">{letterSpacing}</span>
                </div>

                <Slider
                  id="letter-spacing"
                  min={-200}
                  max={800}
                  step={10}
                  value={[Number.isFinite(letterSpacing) ? letterSpacing : 0]}
                  onValueChange={handleLetterSpacingChange}
                />
              </div>
            </div>
          )}

          {objectType === "shape" && (
            <div className="space-y-4 p-4 border-t">
              <h3 className="text-sm font-medium">Shape Properties</h3>

              <div className="flex items-start gap-8">
                <div className="space-y-2">
                  <Label htmlFor="fill-color" className="text-xs">
                    Fill Color
                  </Label>

                  <div className="relative w-10 h-10 overflow-hidden rounded-md border">
                    <div className="absolute inset-0" style={{ backgroundColor: fillColor }} />
                    <Input
                      id="fill-color"
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(fillColor) ? fillColor : "#ffffff"}
                      onChange={handleFillColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="border-color" className="text-xs">
                    Border Color
                  </Label>

                  <div className="relative w-10 h-10 overflow-hidden rounded-md border">
                    <div className="absolute inset-0" style={{ backgroundColor: borderColor }} />
                    <Input
                      id="border-color"
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(borderColor) ? borderColor : "#000000"}
                      onChange={handleBorderColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="border-width" className="text-xs">
                    Border Width
                  </Label>
                  <span className="text-xs">
                    {Number.isFinite(borderWidth) ? borderWidth : 0}px
                  </span>
                </div>

                <Slider
                  id="border-width"
                  min={0}
                  max={20}
                  step={1}
                  value={[Number.isFinite(borderWidth) ? borderWidth : 0]}
                  onValueChange={handleBorderWidthChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-style" className="text-xs">
                  Border Style
                </Label>

                <Select value={borderStyle} onValueChange={handleBorderStyleChange}>
                  <SelectTrigger id="border-style" className="h-10">
                    <SelectValue placeholder="Select Border Style" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {objectType === "image" && (
            <div className="space-y-4 p-4 border-t">
              <h3 className="text-sm font-medium">Image Properties</h3>

              <div className="space-y-2">
                <Label htmlFor="image-border-color" className="text-xs">
                  Border Color
                </Label>

                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                  <div className="absolute inset-0" style={{ backgroundColor: borderColor }} />
                  <Input
                    id="image-border-color"
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(borderColor) ? borderColor : "#000000"}
                    onChange={handleBorderColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="image-border-width" className="text-xs">
                    Border Width
                  </Label>
                  <span className="text-xs">
                    {Number.isFinite(borderWidth) ? borderWidth : 0}px
                  </span>
                </div>

                <Slider
                  id="image-border-width"
                  min={0}
                  max={20}
                  step={1}
                  value={[Number.isFinite(borderWidth) ? borderWidth : 0]}
                  onValueChange={handleBorderWidthChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-border-style" className="text-xs">
                  Border Style
                </Label>

                <Select value={borderStyle} onValueChange={handleBorderStyleChange}>
                  <SelectTrigger id="image-border-style" className="h-10">
                    <SelectValue placeholder="Select Border Style" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter" className="text-xs">
                  Filter
                </Label>

                <Select value={filter} onValueChange={handleImageFilterChange}>
                  <SelectTrigger id="filter" className="h-10">
                    <SelectValue placeholder="Select Image Style" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">Solid</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                    <SelectItem value="invert">Invert</SelectItem>
                    <SelectItem value="blur">Blur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filter === "blur" && (
                <div className="space-y-2">
                  <div className="flex justify-between mb-4">
                    <Label htmlFor="blur" className="text-xs">
                      Blur Amount
                    </Label>
                    <span className="font-medium text-xs">{blur}</span>
                  </div>

                  <Slider
                    id="blur"
                    min={0}
                    max={100}
                    step={1}
                    value={[blur]}
                    onValueChange={handleBlurChange}
                  />
                </div>
              )}
            </div>
          )}

          {objectType === "path" && (
            <div className="space-y-4 p-4 border-t">
              <h3 className="text-sm font-medium">Path Properties</h3>

              <div className="space-y-2">
                <Label htmlFor="image-border-color" className="text-xs">
                  Border Color
                </Label>

                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                  <div className="absolute inset-0" style={{ backgroundColor: borderColor }} />
                  <Input
                    id="image-border-color"
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(borderColor) ? borderColor : "#000000"}
                    onChange={handleBorderColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="image-border-width" className="text-xs">
                    Border Width
                  </Label>
                  <span className="text-xs">
                    {Number.isFinite(borderWidth) ? borderWidth : 0}px
                  </span>
                </div>

                <Slider
                  id="image-border-width"
                  min={0}
                  max={20}
                  step={1}
                  value={[Number.isFinite(borderWidth) ? borderWidth : 0]}
                  onValueChange={handleBorderWidthChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-border-style" className="text-xs">
                  Border Style
                </Label>

                <Select value={borderStyle} onValueChange={handleBorderStyleChange}>
                  <SelectTrigger id="image-border-style" className="h-10">
                    <SelectValue placeholder="Select Border Style" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Properties;
