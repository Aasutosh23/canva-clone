"use client";

import { Search } from "lucide-react";
import { useSession } from "next-auth/react";

function Header() {
  const { data: session } = useSession();
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 fixed top-0 right-0 left-18 z-10">
      <div className="flex-1 max-w-2xl mx-auto relative">
        <Search className="absoulte top-1/2 left-3 transform -translate-y-1/2" />
      </div>
    </header>
  );
}

export default Header;
