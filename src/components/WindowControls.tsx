import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

export function WindowControls() {
  return (
    <div className="fixed top-0 right-0 z-[50000] flex h-8">
      <button
        onClick={() => appWindow.minimize()}
        className="flex items-center justify-center w-[46px] h-8 bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Minimize"
      >
        <Minus className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={() => appWindow.toggleMaximize()}
        className="flex items-center justify-center w-[46px] h-8 bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Maximize"
      >
        <Square className="h-3 w-3 text-foreground" />
      </button>
      <button
        onClick={() => appWindow.close()}
        className="flex items-center justify-center w-[46px] h-8 bg-transparent hover:bg-[#e81123] transition-colors group"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-foreground group-hover:text-white" />
      </button>
    </div>
  );
}
