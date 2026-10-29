import { shapeDefinitions } from "./shapes/shape-definitions";
import { createShape } from "./shapes/shape-factory";

export const initializeFabric = async (canvasEl, containerEl) => {
  try {
    const fabricModule = await import("fabric");
    const fabric = fabricModule.fabric;

    const width = canvasEl.width || 825;
    const height = canvasEl.height || 465;

    const canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      preserveObjectStacking: true,
      isDrawingMode: false,
      renderOnAddRemove: true,
    });

    const brush = new fabric.PencilBrush(canvas);
    brush.color = "#000000";
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    return canvas;
  } catch (e) {
    console.error("Failed to load fabric", e);
    return null;
  }
};

export const centerCanvas = (canvas) => {
  if (!canvas || !canvas.wrapperEl) return;

  const canvasWrapper = canvas.wrapperEl;

  canvasWrapper.style.width = `${canvas.width}px`;
  canvasWrapper.style.height = `${canvas.height}px`;

  canvasWrapper.style.position = "relative";
  canvasWrapper.style.margin = "auto";
  canvasWrapper.style.top = "";
  canvasWrapper.style.left = "";
  canvasWrapper.style.transform = "";

  canvas.calcOffset();
};

export const addShapeToCanvas = async (canvas, shapeType, customProps = {}) => {
  if (!canvas) {
    console.error("Canvas is not initialized");
    return null;
  }

  try {
    const fabricModule = await import("fabric");
    const fabric = fabricModule.fabric || fabricModule.default;

    const shape = createShape(fabric, shapeType, shapeDefinitions, {
      left: 100,
      top: 100,
      ...customProps,
    });

    if (!shape) {
      console.error("Shape creation failed:", shapeType);
      return null;
    }

    shape.id = `${shapeType}-${Date.now()}`;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();

    return shape;
  } catch (e) {
    console.error("Error adding shape:", e);
    return null;
  }
};

export const addTextToCanvas = async (canvas, text, options = {}, withBackground = false) => {
  if (!canvas) {
    console.error("Canvas is not initialized");
    return null;
  }

  try {
    const fabricModule = await import("fabric");
    const fabric = fabricModule.fabric || fabricModule.default;

    const defaultProps = {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      padding: withBackground ? 10 : 0,
      textAlign: "left",
      id: `text-${Date.now()}`,
    };

    const textObj = new fabric.IText(text, {
      ...defaultProps,
      ...options,
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();

    return textObj;
  } catch (e) {
    console.error("Error adding text to canvas:", e);
    return null;
  }
};

export const addImageToCanvas = async (canvas, imageUrl) => {
  if (!canvas) return null;

  try {
    const fabricModule = await import("fabric");
    const fabric = fabricModule.fabric || fabricModule.default;

    const imgObj = new window.Image();
    imgObj.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      imgObj.onload = resolve;
      imgObj.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));

      imgObj.src = imageUrl;
    });

    const image = new fabric.Image(imgObj);

    image.set({
      id: `image-${Date.now()}`,
      top: 100,
      left: 100,
      padding: 10,
      cornerSize: 10,
    });

    const maxDimension = 400;

    if (image.width > maxDimension || image.height > maxDimension) {
      image.scaleToWidth(
        image.width >= image.height ? maxDimension : (image.width * maxDimension) / image.height
      );

      if (image.height > maxDimension) {
        image.scaleToHeight(maxDimension);
      }
    }

    canvas.add(image);
    canvas.setActiveObject(image);
    canvas.calcOffset();
    canvas.requestRenderAll();

    return image;
  } catch (error) {
    console.error("Error adding image to canvas:", error);
    return null;
  }
};

export const toggleDrawingMode = (
  canvas,
  isDrawingMode,
  drawingColor = "#000000",
  brushWidth = 5
) => {
  if (!canvas) return null;

  try {
    canvas.isDrawingMode = isDrawingMode;
    if (isDrawingMode) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const toggleEraseMode = (canvas, isErasing, previousColor = "#000000", eraserWidth = 20) => {
  if (!canvas || !canvas.freeDrawingBrush) return false;

  try {
    if (isErasing) {
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = eraserWidth;
    } else {
      canvas.freeDrawingBrush.color = previousColor;
      canvas.freeDrawingBrush.width = 5;
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const updateDrawingBrush = (canvas, properties = {}) => {
  if (!canvas || !canvas.freeDrawingBrush) return false;

  try {
    const { color, width, opacity } = properties;
    if (color !== undefined) {
      canvas.freeDrawingBrush.color = color;
    }

    if (width !== undefined) {
      canvas.freeDrawingBrush.width = width;
    }

    if (opacity !== undefined) {
      canvas.freeDrawingBrush.opacity = opacity;
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const cloneSelectedObject = async (canvas) => {
  if (!canvas) return null;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return null;

  try {
    const clonedObj = await new Promise((resolve) => {
      activeObject.clone(resolve, ["id"]);
    });

    clonedObj.set({
      left: activeObject.left + 10,
      top: activeObject.top + 10,
      id: `${activeObject.type || "object"}-${Date.now()}`,
    });

    if (clonedObj.type === "activeSelection") {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject((obj) => canvas.add(obj));
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }

    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();

    return clonedObj;
  } catch (e) {
    console.error("Error while cloning", e);
    return null;
  }
};

export const deletedSelectedObject = async (canvas) => {
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();

  if (!activeObject) return;

  try {
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();

    return true;
  } catch (e) {
    console.error("Error while deleting", e);
    return false;
  }
};

export const customizeBoundingBox = (canvas) => {
  if (!canvas) return;

  try {
    canvas.on("object:added", (e) => {
      if (e.target) {
        e.target.set({
          borderColor: "#2196f3",
          cornerColor: "#ffffff",
          cornerStrokeColor: "#2196f3",
          cornerSize: 10,
          transparentCorners: false,
        });
      }
    });

    canvas.getObjects().forEach((obj) => {
      obj.set({
        borderColor: "#2196f3",
        cornerColor: "#ffffff",
        cornerStrokeColor: "#2196f3",
        cornerSize: 10,
        transparentCorners: false,
      });
    });

    canvas.renderAll();
  } catch (e) {
    console.error("Failed to customize boundingbox");
  }
};
