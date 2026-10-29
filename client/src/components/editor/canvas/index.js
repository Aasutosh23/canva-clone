"use client";

import { initializeFabric } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import ZoomToolbar from "./zoom-toolbar";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

function Canvas() {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const initAttemptedRef = useRef(false);

  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const zoomRef = useRef(1);

  const isDraggingRef = useRef(false);
  const isSpaceRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [isPanMode, setIsPanMode] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);

  const { setCanvas, zoomLevel, setZoomLevel, centerCanvasTrigger, markAsModified } =
    useEditorStore();

  const applyTransform = (zoom, px, py) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    wrapper.style.transform = `translate(${px}px, ${py}px) scale(${zoom})`;
  };

  const centerInContainer = (zoom = zoomRef.current || 1) => {
    const container = canvasContainerRef.current;
    const canvas = fabricCanvasRef.current;
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (!cw || !ch) {
      requestAnimationFrame(() => centerInContainer(zoom));
      return;
    }

    const canvasW = (canvas?.getWidth?.() || canvas?.width || 825) * zoom;
    const canvasH = (canvas?.getHeight?.() || canvas?.height || 465) * zoom;

    panXRef.current = Math.round((cw - canvasW) / 2);
    panYRef.current = Math.round((ch - canvasH) / 2);
    applyTransform(zoom, panXRef.current, panYRef.current);
    setHasCentered(true);
  };

  useEffect(() => {
    if (fabricCanvasRef.current) {
      requestAnimationFrame(() => {
        centerInContainer(zoomRef.current);
      });
      const t = setTimeout(() => {
        centerInContainer(zoomRef.current);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [centerCanvasTrigger]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!container || !wrapper) return;

    const ro = new ResizeObserver(() => {
      if (fabricCanvasRef.current) {
        centerInContainer(zoomRef.current);
      }
    });

    ro.observe(container);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    zoomRef.current = zoomLevel;
    applyTransform(zoomLevel, panXRef.current, panYRef.current);
  }, [zoomLevel]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const onKeyDown = (e) => {
      if (e.code === "Space") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const editing =
          tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;
        if (editing) return;
        e.preventDefault();
        isSpaceRef.current = true;
        setIsPanMode(true);
      }

      if (e.key === "Escape") {
        const fc = fabricCanvasRef.current;
        if (fc) {
          fc.discardActiveObject();
          fc.requestRenderAll();
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        const fc = fabricCanvasRef.current;
        if (!fc) return;
        const objs = fc.getActiveObjects();
        if (!objs.length) return;
        objs.forEach((o) => fc.remove(o));
        fc.discardActiveObject();
        fc.renderAll();
      }
    };

    const onKeyUp = (e) => {
      if (e.code === "Space") {
        isSpaceRef.current = false;
        if (!isDraggingRef.current) setIsPanMode(false);
      }
    };

    const onMouseDown = (e) => {
      const isLeft = e.button === 0;
      const isMiddle = e.button === 1;

      if (isLeft && !isSpaceRef.current) {
        const isCanvasElement =
          e.target &&
          (e.target.tagName === "CANVAS" ||
            e.target.classList?.contains("upper-canvas") ||
            e.target.closest?.(".canvas-scale-wrapper"));

        if (!isCanvasElement && fabricCanvasRef.current) {
          fabricCanvasRef.current.discardActiveObject();
          fabricCanvasRef.current.requestRenderAll();
        }
      }

      if (!(isMiddle || (isLeft && isSpaceRef.current))) return;

      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = true;
      setIsPanMode(true);

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panXRef.current,
        panY: panYRef.current,
      };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      panXRef.current = dragStartRef.current.panX + dx;
      panYRef.current = dragStartRef.current.panY + dy;

      applyTransform(zoomRef.current, panXRef.current, panYRef.current);
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (!isSpaceRef.current) setIsPanMode(false);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoomLevel((prev) => {
        const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)) * 100) / 100;
        return next;
      });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    container.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      container.removeEventListener("mousedown", onMouseDown, true);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
    };
  }, [setZoomLevel]);

  useEffect(() => {
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.off("object:added");
          fabricCanvasRef.current.off("object:modified");
          fabricCanvasRef.current.off("object:removed");
          fabricCanvasRef.current.off("path:created");
          fabricCanvasRef.current.off("mouse:down");
        } catch {}
        try {
          fabricCanvasRef.current.dispose();
        } catch {}
        fabricCanvasRef.current = null;
        setCanvas(null);
      }
    };

    cleanUpCanvas();
    initAttemptedRef.current = false;

    const initcanvas = async () => {
      if (!canvasRef.current || initAttemptedRef.current) return;
      initAttemptedRef.current = true;

      try {
        const fabricCanvas = await initializeFabric(canvasRef.current, canvasContainerRef.current);
        if (!fabricCanvas) return;

        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas);

        requestAnimationFrame(() => {
          centerInContainer(zoomRef.current);
        });
        setTimeout(() => {
          centerInContainer(zoomRef.current);
        }, 150);

        fabricCanvas.on("object:added", () => {
          markAsModified();
        });

        fabricCanvas.on("object:modified", () => {
          markAsModified();
        });

        fabricCanvas.on("object:removed", () => {
          markAsModified();
        });

        fabricCanvas.on("path:created", () => {
          markAsModified();
        });
        fabricCanvas.on("mouse:down", (opt) => {
          if (isSpaceRef.current) return;

          if (!opt.target) {
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
          }
        });

        fabricCanvas.on("mouse:dblclick", () => {
          const bg = fabricCanvas.getObjects().find((o) => o.isCanvasBackground);
          if (bg) {
            bg.set({
              selectable: true,
              evented: true,
              isCanvasBackground: false,
            });
            fabricCanvas.setActiveObject(bg);
            fabricCanvas.requestRenderAll();
          }
        });
      } catch (e) {
        console.error("Failed to init canvas", e);
      }
    };

    const timer = setTimeout(initcanvas, 50);
    return () => {
      clearTimeout(timer);
      cleanUpCanvas();
    };
  }, []);

  return (
    <div className="canvas-workspace">
      <div className={`canvas-viewport ${isPanMode ? "pan-mode" : ""}`} ref={canvasContainerRef}>
        <div
          className="canvas-scale-wrapper"
          ref={canvasWrapperRef}
          style={{
            transformOrigin: "0 0",
            opacity: hasCentered ? 1 : 0,
            transition: isPanMode ? "none" : "transform 0.12s ease, opacity 0.2s ease",
          }}
        >
          <canvas ref={canvasRef} width={825} height={465} />
        </div>
      </div>

      <ZoomToolbar
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        step={ZOOM_STEP}
        onCenter={() => centerInContainer(zoomRef.current)}
      />
    </div>
  );
}

export default Canvas;
