"use client";

import { useParams, useRouter } from "next/navigation";
import Canvas from "./canvas";
import Header from "./header";
import Sidebar from "./sidebar";
import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store";
import { getUserDesignById } from "@/services/design-service";
import Properties from "./properties";
import { useSession } from "next-auth/react";

function MainEditor() {
  const params = useParams();
  const router = useRouter();
  const designId = params?.slug;
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(!!designId);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [error, setError] = useState(null);

  const { canvas, setDesignId, resetStore, setName, setShowProperties, showProperties, isEditing } =
    useEditorStore();

  useEffect(() => {
    resetStore();

    if (designId) setDesignId(designId);

    return () => {
      resetStore();
    };
  }, []);

  useEffect(() => {
    setLoadAttempted(false);
    setError(null);
  }, [designId]);

  useEffect(() => {
    if (isLoading && !canvas && designId) {
      const timer = setTimeout(() => {
        if (isLoading) {
          console.log("Canvas init timeout");
          setIsLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, canvas, designId]);

  const loadDesign = useCallback(async () => {
    if (!canvas || !designId || loadAttempted) return;
    if (status !== "authenticated" || !session?.idToken) return;

    try {
      setIsLoading(true);
      setLoadAttempted(true);

      const response = await getUserDesignById(designId);
      const design = response?.data;

      if (design) {
        setName(design.name || "Untitled Design");
        setDesignId(designId);

        const width = design.width || 825;
        const height = design.height || 465;

        canvas.setWidth(width);
        canvas.setHeight(height);

        try {
          if (design.canvasData) {
            canvas.clear();
            canvas.setWidth(width);
            canvas.setHeight(height);

            const canvasData =
              typeof design.canvasData === "string"
                ? JSON.parse(design.canvasData)
                : design.canvasData;

            const hasObjects = canvasData.objects && canvasData.objects.length > 0;

            if (canvasData.background) {
              canvas.backgroundColor = canvasData.background;
            } else {
              canvas.backgroundColor = "#ffffff";
            }

            if (!hasObjects) {
              canvas.renderAll();
              useEditorStore.getState().triggerCenterCanvas();
              return;
            }

            canvas.loadFromJSON(design.canvasData, () => {
              canvas.setWidth(width);
              canvas.setHeight(height);
              canvas.renderAll();
              useEditorStore.getState().triggerCenterCanvas();
            });
          } else {
            canvas.clear();
            canvas.setWidth(width);
            canvas.setHeight(height);
            canvas.backgroundColor = "#ffffff";
            canvas.renderAll();
            useEditorStore.getState().triggerCenterCanvas();
          }
        } catch (e) {
          console.error("Error loading canvas", e);
          setError("Error loading canvas");
        } finally {
          setIsLoading(false);
          useEditorStore.getState().triggerCenterCanvas();
        }
      }
    } catch (e) {
      console.error("Failed to load design", e);
      setLoadAttempted(false);
      setIsLoading(false);
    }
  }, [canvas, designId, loadAttempted, status, session?.idToken, setDesignId, setName]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status === "authenticated" && designId && canvas && !loadAttempted) {
      loadDesign();
    }
  }, [canvas, designId, loadDesign, loadAttempted, status, router]);

  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject();

      if (activeObject) {
        setShowProperties(true);
      }
    };

    const handleSelectionCleared = () => {
      setShowProperties(false);
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [canvas]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isEditing && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-hidden bg-[#f0f0f0]">
            <Canvas />
          </main>
        </div>
      </div>
      {isEditing && <Properties />}
    </div>
  );
}

export default MainEditor;
