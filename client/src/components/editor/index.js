"use client";

import Canvas from "./canvas";
import Header from "./header";
import Sidebar from "./sidebar";

function MainEditor() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main
            className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center 
            justify-center"
          >
            <Canvas />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainEditor;
