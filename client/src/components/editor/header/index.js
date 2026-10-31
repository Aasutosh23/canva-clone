"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/store";
import {
  ChevronDown,
  CloudAlert,
  CloudCheck,
  Download,
  Eye,
  Home,
  Loader2,
  LogOut,
  Pencil,
  Star,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExportModal from "../export";
import { toast } from "sonner";

function Header() {
  const router = useRouter();
  const {
    isEditing,
    setIsEditing,
    name,
    setName,
    canvas,
    saveStatus,
    markAsModified,
    saveToServer,
    userDesigns,
    userSubscription,
    setShowPremiumModal,
  } = useEditorStore();
  const { data: session } = useSession();
  const [showExportModal, setShowExportModal] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  useEffect(() => {
    if (!canvas) return;
    canvas.selection = isEditing;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = isEditing;
      obj.evented = isEditing;
    });
  }, [isEditing, canvas]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    markAsModified();
  };

  const handleManualSave = async () => {
    const res = await saveToServer();
    if (res?.success) {
      toast.success("Design saved successfully");
    }
  };

  const handleExport = () => {
    if (userDesigns?.length >= 5 && !userSubscription?.isPremium) {
      toast.error("Please upgrade to premium!", {
        description: "You need to upgrade to premium to create more designs",
      });
      return;
    }
    setShowExportModal(true);
  };

  return (
    <header className="header-gradient header flex items-center justify-between px-4 h-14 select-none">
      <div className="flex items-center space-x-2">
        {/* Home logo / button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1"
          title="Back to Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* View / Edit Mode Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="header-button flex items-center text-white cursor-pointer">
            <span>{isEditing ? "Editing" : "Viewing"}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editing</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setIsEditing(false)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              <span>Viewing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Modern Save Status Indicator */}
        {saveStatus === "Saving..." ? (
          <div className="flex items-center text-xs font-medium text-white/90 bg-white/10 px-2.5 py-1.5 rounded-full gap-1.5 shadow-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-300" />
            <span>Saving...</span>
          </div>
        ) : saveStatus === "Error" ? (
          <button
            onClick={handleManualSave}
            className="flex items-center text-xs font-medium text-red-200 bg-red-500/20 hover:bg-red-500/30 px-2.5 py-1.5 rounded-full gap-1.5 transition-colors cursor-pointer"
            title="Save error. Click to retry."
          >
            <CloudAlert className="w-3.5 h-3.5 text-red-300" />
            <span>Retry save</span>
          </button>
        ) : (
          <button
            onClick={handleManualSave}
            className="flex items-center text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-full gap-1.5 transition-colors cursor-pointer"
            title="All changes saved. Click to save now."
          >
            <CloudCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Saved</span>
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="header-button flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
          title="Export Design"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Design Name Input */}
      <div className="flex-1 flex justify-center max-w-md mx-4">
        <Input
          className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 text-center font-medium"
          value={name}
          onChange={handleNameChange}
        />
      </div>

      {/* Right Actions: Premium & Avatar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={!userSubscription?.isPremium ? () => setShowPremiumModal(true) : null}
          className="upgrade-button flex items-center bg-white/10 hover:bg-white/20 text-white rounded-md h-9 px-3 transition-colors cursor-pointer"
        >
          <Star className="mr-1.5 h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">
            {!userSubscription?.isPremium ? "Upgrade to Premium" : "Premium Member"}
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
              {session?.user?.image && <AvatarImage src={session.user.image} />}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 w-4 h-4" />
              <span className="font-semibold">Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ExportModal isOpen={showExportModal} onClose={setShowExportModal} />
    </header>
  );
}

export default Header;
