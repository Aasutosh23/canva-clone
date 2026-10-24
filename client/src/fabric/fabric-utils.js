import { shapeDefinitions } from "./shapes/shape-definitions";
import { createShape } from "./shapes/shape-factory";

export const initializeFabric = async (canvasEl, containerEl) => {
  try {
    const fabricModule = await import("fabric");
    const fabric = fabricModule.fabric;

    const canvas = new fabric.Canvas(canvasEl, {
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

  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.top = "50%";
  canvasWrapper.style.left = "50%";
  canvasWrapper.style.transform = "translate(-50%, -50%)";
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
