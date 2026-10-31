"use client";

import { useEditorStore } from "@/store";
import DesignList from "./design-list";

function RecentDesigns() {
  const { userDesigns } = useEditorStore();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recent Designs</h2>
      <DesignList
        listOfDesigns={userDesigns && userDesigns.length > 0 ? userDesigns.slice(0, 4) : []}
      />
    </div>
  );
}

export default RecentDesigns;
