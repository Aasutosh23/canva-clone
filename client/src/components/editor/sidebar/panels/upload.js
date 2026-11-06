"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addImageToCanvas } from "@/fabric/fabric-utils";
import { fetchWithAuth, uploadFileWithAuth } from "@/services/base-service";
import { useEditorStore } from "@/store";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function UploadPanel() {
  const { canvas } = useEditorStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userUploads, setUserUploads] = useState([]);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const { data: session, status } = useSession();
  const fetchUserUploads = useCallback(async () => {
    if (status !== "authenticated" || !session?.idToken) return;

    try {
      setIsLoading(true);
      const data = await fetchWithAuth("/v1/media/get");
      setUserUploads(data?.data || []);
    } catch (e) {
      console.log("fetchUserUploads error:", e);
      toast.error("Failed to load uploads");
    } finally {
      setIsLoading(false);
    }
  }, [status, session?.idToken]);

  useEffect(() => {
    if (status === "authenticated") fetchUserUploads();
  }, [status, fetchUserUploads]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFileWithAuth(file);
      setUserUploads((prev) => [result?.data, ...prev]);
      toast.success("Image uploaded successfully!");
    } catch (e) {
      console.error("Error while uploading the file:", e);
      toast.error(e.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImage = (imageUrl) => {
    if (!canvas) return;
    addImageToCanvas(canvas, imageUrl);
  };

  const handleDeleteUpload = async (e, imageId) => {
    e.stopPropagation();
    if (deletingIds.has(imageId)) return;

    setDeletingIds((prev) => new Set(prev).add(imageId));

    try {
      await fetchWithAuth(`/v1/media/delete/${imageId}`, { method: "DELETE" });
      setUserUploads((prev) => prev.filter((img) => img._id !== imageId));
      toast.success("Upload deleted");
    } catch (err) {
      console.error("Error deleting upload:", err);
      toast.error("Failed to delete upload");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(imageId);
        return next;
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Label
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md cursor-pointer h-12 font-medium transition-colors ${isUploading ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Label>
        </div>
        <p className="text-xs text-gray-400">Max file size: {MAX_FILE_SIZE_MB}MB</p>
        <div className="mt-5">
          <h4 className="text-sm text-gray-500 mb-5">Your Uploads</h4>
          {isLoading ? (
            <div className="border p-6 flex gap-2 rounded-md items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="font-bold text-sm">Loading your uploads...</p>
            </div>
          ) : userUploads.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {userUploads.map((imageData) => (
                <div
                  className="aspect-auto bg-gray-50 rounded-md overflow-hidden hover:opacity-85 transition-opacity relative group cursor-pointer"
                  key={imageData._id}
                  onClick={() => handleAddImage(imageData.url)}
                >
                  <img
                    src={imageData.url}
                    alt={imageData.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete button — shown on hover */}
                  <button
                    onClick={(e) => handleDeleteUpload(e, imageData._id)}
                    disabled={deletingIds.has(imageData._id)}
                    className="absolute top-1 right-1 bg-black hover:bg-gray-800 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Delete upload"
                  >
                    {deletingIds.has(imageData._id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No uploads yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPanel;
