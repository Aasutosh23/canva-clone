"use client";

import { useRouter } from "next/navigation";
import DesignPreview from "./design-preview";
import { Trash2 } from "lucide-react";
import { deleteDesign, getUserDesigns } from "@/services/design-service";
import { useEditorStore } from "@/store";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function DesignList({ listOfDesigns = [] }) {
  const router = useRouter();
  const { setUserDesigns } = useEditorStore();
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchUserDesigns() {
    const result = await getUserDesigns();
    if (result?.success) setUserDesigns(result?.data);
  }

  const handleDeleteDesign = async () => {
    if (!confirmId) return;
    try {
      setDeleting(true);
      const response = await deleteDesign(confirmId);
      if (response.success) {
        toast.success("Design moved to trash");
        fetchUserDesigns();
      }
    } catch (e) {
      toast.error("Failed to delete design");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {!listOfDesigns.length && (
          <div className="col-span-full py-8 text-center text-gray-400">
            <p className="text-base font-medium">No designs found!</p>
            <p className="text-sm">Click "+ Create" to start your first design.</p>
          </div>
        )}

        {listOfDesigns.map((design) => (
          <div
            onClick={() => router.push(`/editor/${design?._id}`)}
            key={design._id}
            className="group min-w-0 cursor-pointer"
          >
            <div className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md border">
              {design?.canvasData && <DesignPreview design={design} />}
            </div>

            <div className="flex justify-between items-center">
              <p className="max-w-[80%] font-semibold text-sm truncate">{design.name}</p>
              <Trash2
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmId(design?._id);
                }}
                className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmId} onOpenChange={(open) => { if (!open) setConfirmId(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Move to Trash?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This design will be moved to trash. You can restore or permanently delete it from the Trash.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDesign} disabled={deleting}>
              {deleting ? "Deleting..." : "Move to Trash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DesignList;
