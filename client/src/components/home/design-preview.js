"use client";

import { useEffect, useRef, useState } from "react";

function DesignPreview({ design }) {
  const [canvasId] = useState(`canvas-${design._id}-${Date.now()}`);

  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    if (!design?.canvasData) return;

    let isMounted = true;
    let previewCanvas = null;

    async function loadDesignPreview() {
      try {
        const { fabric } = await import("fabric");

        if (!isMounted) return;

        const canvasElement = document.getElementById(canvasId);

        if (!canvasElement) return;

        previewCanvas = new fabric.StaticCanvas(canvasElement, {
          width: 300,
          height: 300,
          renderOnAddRemove: true,
          selection: false,
        });

        fabricCanvasRef.current = previewCanvas;

        let canvasData;

        try {
          canvasData =
            typeof design.canvasData === "string"
              ? JSON.parse(design.canvasData)
              : design.canvasData;
        } catch (error) {
          console.error("Error parsing canvas data:", error);
          return;
        }

        previewCanvas.loadFromJSON(canvasData, () => {
          if (!isMounted) return;

          previewCanvas.requestRenderAll();
        });
      } catch (error) {
        console.error("Error rendering design preview:", error);
      }
    }

    loadDesignPreview();

    return () => {
      isMounted = false;

      if (previewCanvas) {
        previewCanvas.dispose();
        previewCanvas = null;
        fabricCanvasRef.current = null;
      }
    };
  }, [design?._id, design?.canvasData, canvasId]);

  return <canvas id={canvasId} width="300" height="300" className="h-full w-full object-contain" />;
}

export default DesignPreview;
