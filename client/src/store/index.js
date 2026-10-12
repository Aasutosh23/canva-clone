"use client";

import { create } from "zustand";
import { centerCanvas } from "@/fabric/fabric-utils";

export const useEditorStore = create((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => {
    set({ canvas });
    if (canvas) {
      centerCanvas(canvas);
    }
  },

  designId: null,
  setDesignId: (id) => set({ designId: id }),

  resetStore: () => {
    set({
      canvas: null,
      designId: null,
    });
  },
}));
