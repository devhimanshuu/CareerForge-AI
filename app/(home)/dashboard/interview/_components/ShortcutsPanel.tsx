"use client";

import React from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const SHORTCUTS = [
  { keys: "Enter", label: "Submit answer", mode: "Turn-based" },
  { keys: "Shift + Enter", label: "New line in answer", mode: "Turn-based" },
  { keys: "⌘ / Ctrl + Enter", label: "End session", mode: "Both modes" },
  { keys: "↑ ↓", label: "Scroll session logs", mode: "Interview" },
  { keys: "Escape", label: "Reset to setup", mode: "Any step" },
];

export const ShortcutsPanel = ({
  showShortcuts,
  setShowShortcuts,
  shortcutsRef,
}: {
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  shortcutsRef: React.RefObject<HTMLDivElement>;
}) => (
  <div className="relative" ref={shortcutsRef}>
    <Button
      onClick={() => setShowShortcuts(!showShortcuts)}
      variant="outline"
      size="icon"
      className="h-9 w-9 border-indigo-500/30 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
      title="Keyboard Shortcuts"
    >
      <Keyboard size={16} />
    </Button>
    <AnimatePresence>
      {showShortcuts && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 z-50 w-64 sm:w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-background shadow-xl p-4 space-y-3"
        >
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Keyboard size={12} />
            Keyboard Shortcuts
          </p>
          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.keys}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-[11px] text-muted-foreground font-medium">
                  {s.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-muted-foreground/50 font-medium">
                    {s.mode}
                  </span>
                  <kbd className="text-[10px] font-mono bg-muted/60 border border-border/50 px-1.5 py-0.5 rounded text-foreground/80 whitespace-nowrap">
                    {s.keys}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
