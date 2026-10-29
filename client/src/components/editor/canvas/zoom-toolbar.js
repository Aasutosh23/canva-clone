"use client";

import { useEditorStore } from "@/store";
import { Minus, Plus, Maximize2, Hand } from "lucide-react";

export default function ZoomToolbar({ minZoom = 0.1, maxZoom = 4, step = 0.1, onCenter }) {
  const { zoomLevel, setZoomLevel } = useEditorStore();

  const clamp = (val) => Math.round(Math.min(maxZoom, Math.max(minZoom, val)) * 100) / 100;

  const handleZoomIn = () => setZoomLevel((z) => clamp(z + step));
  const handleZoomOut = () => setZoomLevel((z) => clamp(z - step));
  const handleReset = () => {
    setZoomLevel(1);
    onCenter?.();
  };
  const handleFit = () => onCenter?.();

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className="zoom-toolbar">
      <button
        className="zoom-btn zoom-btn-icon"
        onClick={handleFit}
        title="Fit canvas to screen"
        aria-label="Fit canvas to screen"
      >
        <Maximize2 size={14} />
      </button>

      <div className="zoom-divider" />

      <button
        className="zoom-btn"
        onClick={handleZoomOut}
        disabled={zoomLevel <= minZoom}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus size={14} />
      </button>

      <button
        className="zoom-pct"
        onClick={handleReset}
        title="Reset zoom to 100%"
        aria-label={`Zoom ${zoomPercent}% — click to reset`}
      >
        {zoomPercent}%
      </button>

      <button
        className="zoom-btn"
        onClick={handleZoomIn}
        disabled={zoomLevel >= maxZoom}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus size={14} />
      </button>

      <div className="zoom-divider" />

      <div className="zoom-pan-hint" title="Hold Space + drag to pan canvas">
        <Hand size={12} />
        <span>Space+drag</span>
      </div>
    </div>
  );
}
