"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  getTrashedDesigns,
  permanentlyDeleteDesign,
  recoverDesign,
  getUserDesigns,
} from "@/services/design-service";
import { Trash2, Loader, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function TrashModal() {
  const {
    showTrashModal,
    setShowTrashModal,
    deletedDesigns,
    setDeletedDesigns,
    setUserDesigns,
  } = useEditorStore();

  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null); // tracks which design is being acted on

  const fetchTrashedDesigns = async () => {
    try {
      setLoading(true);
      const result = await getTrashedDesigns();
      if (result?.success) setDeletedDesigns(result.data);
    } catch (e) {
      toast.error("Failed to load trash");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showTrashModal) fetchTrashedDesigns();
  }, [showTrashModal]);

  const handleRecover = async (designId) => {
    try {
      setActionId(designId + "_recover");
      const res = await recoverDesign(designId);
      if (res.success) {
        toast.success("Design recovered!");
        // Remove from trash list
        setDeletedDesigns(deletedDesigns.filter((d) => d._id !== designId));
        // Refresh main designs list
        const updated = await getUserDesigns();
        if (updated?.success) setUserDesigns(updated.data);
      }
    } catch (e) {
      toast.error("Failed to recover design");
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async (designId) => {
    try {
      setActionId(designId + "_delete");
      const res = await permanentlyDeleteDesign(designId);
      if (res.success) {
        toast.success("Design permanently deleted");
        setDeletedDesigns(deletedDesigns.filter((d) => d._id !== designId));
      }
    } catch (e) {
      toast.error("Failed to permanently delete design");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Dialog open={showTrashModal} onOpenChange={setShowTrashModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          Trash
        </DialogTitle>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : deletedDesigns.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Trash2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Trash is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {deletedDesigns.map((design) => (
              <div
                key={design._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{design.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Deleted {new Date(design.deletedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {/* Recover button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!!actionId}
                    onClick={() => handleRecover(design._id)}
                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  >
                    {actionId === design._id + "_recover" ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Recover
                      </>
                    )}
                  </Button>

                  {/* Permanent delete button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!!actionId}
                    onClick={() => handlePermanentDelete(design._id)}
                  >
                    {actionId === design._id + "_delete" ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      "Delete Forever"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TrashModal;
