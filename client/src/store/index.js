"use client";

import { create } from "zustand";
import debounce from "lodash/debounce";
import { centerCanvas } from "@/fabric/fabric-utils";
import { saveCanvasState } from "@/services/design-service";

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

  isEditing: true,
  setIsEditing: (flag) => set({ isEditing: flag }),

  name: "Untitled Design",
  setName: (value) => set({ name: value }),

  showProperties: false,
  setShowProperties: (flag) => set({ showProperties: flag }),

  zoomLevel: 1,
  setZoomLevel: (levelOrUpdater) =>
    set((state) => ({
      zoomLevel:
        typeof levelOrUpdater === "function" ? levelOrUpdater(state.zoomLevel) : levelOrUpdater,
    })),

  activeSidebar: null,
  setActiveSidebar: (id) => set({ activeSidebar: id }),

  centerCanvasTrigger: 0,
  triggerCenterCanvas: () =>
    set((state) => ({ centerCanvasTrigger: state.centerCanvasTrigger + 1 })),

  saveStatus: "saved",
  setSaveStatus: (status) => set({ saveStatus: status }),
  lastModified: Date.now(),
  isModified: false,

  markAsModified: () => {
    const designId = get().designId;

    if (designId) {
      set({
        lastModified: Date.now(),
        saveStatus: "Saving...",
        isModified: true,
      });

      get().debounceSaveToServer();
    } else {
      console.error("No design ID Available");
    }
  },

  saveToServer: async () => {
    const designId = get().designId;
    const canvas = get().canvas;

    if (!canvas || !designId) {
      console.log("No design ID Available or canvas instance is not available");
      return null;
    }

    try {
      const saveDesign = await saveCanvasState(canvas, designId, get().name);
      set({
        saveStatus: "Saved",
        isModified: false,
      });

      return saveDesign;
    } catch (e) {
      set({ saveStatus: "Error" });
      return null;
    }
  },

  debounceSaveToServer: debounce(() => {
    get().saveToServer();
  }, 500),

  resetStore: () => {
    set({
      canvas: null,
      designId: null,
      isEditing: true,
      name: "Untitled Design",
      showProperties: false,
      zoomLevel: 1,
      activeSidebar: null,
      centerCanvasTrigger: 0,
      saveStatus: "Saved",
      isModified: false,
      lastModified: Date.now(),
    });
  },
}));
