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
  Download,
  Eye,
  Loader2,
  LogOut,
  Pencil,
  Save,
  SaveOff,
  Star,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ExportModal from "../export";

function Header() {
  const { isEditing, setIsEditing, name, setName, canvas, saveStatus } = useEditorStore();
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
  }, [isEditing]);

  return (
    <header
      className="header-gradient header flex items-center justify-between
     px-4 h-14"
    >
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="header-button flex items-center text-white">
            <span>{isEditing ? "Editing" : "Viewing"}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editing</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setIsEditing(false)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Viewing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="header-button ml-3 relative" title="Save">
          <div className="absolute -top-1.25">
            {saveStatus === "Saving..." && <Loader2 className="h-2 w-2 bg-yellow-400" />}
          </div>
          <Save className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="header-button ml-3 relative"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex justify-center max-w-md">
        <Input className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center space-x-3">
        <button
          className="upgrade-button flex items-center bg-white/10
         hover:bg-white/20 text-white rounded-md h-9 px-3 transition-colors"
        >
          <Star className="mr-1 h-4 w-4 text-yellow-400" />
          <span>Upgrade your plan</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
            <Avatar>
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
              {session?.user?.image && <AvatarImage src={session.user.image} />}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 w-4 h-4" />
              <span className="font-bold">LogOut</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ExportModal isOpen={showExportModal} onClose={setShowExportModal} />
    </header>
  );
}

export default Header;
