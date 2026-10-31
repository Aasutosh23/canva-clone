"use client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Sparkles } from "lucide-react";
import DesignList from "./design-list";

function DesignModal({ isOpen, onClose, userDesigns }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] p-6 overflow-y-auto">
        <DialogTitle className="text-2xl font-bold mb-4 flex items-center">
          <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
          All Projects
        </DialogTitle>
        <div className="mt-2">
          <DesignList listOfDesigns={userDesigns || []} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DesignModal;
