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
    const handleKeyDown = (e) => {
      const isDeleteKey = e.key === "Delete" || e.key === "Backspace";
      if (!isDeleteKey) return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditing =
        tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;
      if (isEditing) return;

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (!activeObjects || activeObjects.length === 0) return;

      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.off("object:added");
          fabricCanvasRef.current.off("object:modified");
          fabricCanvasRef.current.off("object:removed");
          fabricCanvasRef.current.off("path:created");
        } catch (e) {
          console.error("Error removing event listeners", e);
        }
        try {
          fabricCanvasRef.current.dispose();
        } catch (error) {
          console.error("Error disposing canvas", error);
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

        const handleCanvasChange = () => {
          console.log("Canvas Objects Changed || path changed");
        };

        fabricCanvas.on("object:added", handleCanvasChange);
        fabricCanvas.on("object:modified", handleCanvasChange);
        fabricCanvas.on("object:removed", handleCanvasChange);
        fabricCanvas.on("path:created", handleCanvasChange);
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
