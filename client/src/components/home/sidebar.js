"use client";

import { useState } from "react";
import { saveDesign } from "@/services/design-service";
import { CreditCard, FolderOpen, Home, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store";

function SideBar() {
  const { setShowPremiumModal, setShowTrashModal, setShowDesignsModal } = useEditorStore();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateNewDesign = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const initialDesignData = {
        name: "Untitled design - Youtube Thumbnail",
        canvasData: null,
        width: 825,
        height: 465,
        category: "youtube_thumbnail",
      };

      const newDesign = await saveDesign(initialDesignData);

      if (newDesign?.success) {
        router.push(`/editor/${newDesign?.data?._id}`);
      } else {
        throw new Error("Failed to create new design");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const topMenuItems = [
    { icon: <Home className="h-6 w-6" />, label: "Home", onClick: () => router.push("/") },
    { icon: <FolderOpen className="h-6 w-6" />, label: "Projects", onClick: () => setShowDesignsModal(true) },
    { icon: <CreditCard className="h-6 w-6" />, label: "Billing", onClick: () => setShowPremiumModal(true) },
  ];

  return (
    <aside className="w-18 bg-[#f8f8fc] border-r flex flex-col items-center py-4 fixed left-0 top-0 h-full z-20">
      {/* Create button at top */}
      <div
        onClick={handleCreateNewDesign}
        className="flex flex-col items-center cursor-pointer group"
      >
        <button
          disabled={loading}
          className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
        <div className="text-xs font-medium text-center mt-1 text-gray-700">Create</div>
      </div>

      {/* Top nav items */}
      <nav className="mt-8 flex flex-col items-center space-y-6 w-full flex-1">
        {topMenuItems.map((menuItem, index) => (
          <div
            onClick={menuItem.onClick}
            key={index}
            className="flex cursor-pointer flex-col items-center w-full"
          >
            <div className="w-full flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors">
              <div className="relative">{menuItem.icon}</div>
              <span className="text-xs font-medium mt-1">{menuItem.label}</span>
            </div>
          </div>
        ))}
      </nav>

      {/* Trash pinned to the bottom */}
      <div
        onClick={() => setShowTrashModal(true)}
        className="flex cursor-pointer flex-col items-center w-full mt-auto"
      >
        <div className="w-full flex flex-col items-center py-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors">
          <Trash2 className="h-6 w-6" />
          <span className="text-xs font-medium mt-1">Trash</span>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;
