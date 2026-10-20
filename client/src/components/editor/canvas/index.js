"use client";

import { initializeFabric } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { useEffect, useRef } from "react";

function Canvas() {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const initAttemptedRef = useRef(false);

  const { setCanvas } = useEditorStore();

  useEffect(() => {
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
        } catch (error) {
          console.error("Error disposing canvas", e);
        }

        fabricCanvasRef.current = null;
        setCanvas(null);
      }
    };

    cleanUpCanvas();

    initAttemptedRef.current = false;

    const initcanvas = async () => {
      if (typeof window === undefined || !canvasRef.current || initAttemptedRef.current) {
        return;
      }

      initAttemptedRef.current = true;

      try {
        const fabricCanvas = await initializeFabric(canvasRef.current, canvasContainerRef.current);

        if (!fabricCanvas) {
          console.error("Failed to initialize Fabric.js canvas");

          return;
        }

        fabricCanvasRef.current = fabricCanvas;

        setCanvas(fabricCanvas);

        console.log("Canvas init is done and set in store");
      } catch (e) {
        console.error("Failed to init canvas", e);
      }
    };

    const timer = setTimeout(() => {
      initcanvas();
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanUpCanvas();
    };
  }, []);

  return (
    <div className="relative w-full h-150 overflow-auto" ref={canvasContainerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Canvas;
