"use client";

import React from "react";
import { useOthers } from "@/lib/liveblocks";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  personalInfo: "Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

// Floating pill at the top of the editor that surfaces what each remote
// collaborator is currently editing, animated with a soft pulse.
export function RemoteEditingBanner() {
  const others = useOthers();

  const editing = others
    .filter((o) => o.presence?.activeSection)
    .map((o) => ({
      id: o.id ?? Math.random(),
      name: o.presence!.userName || "Anonymous",
      color: o.presence!.userColor || "#6366f1",
      section: o.presence!.activeSection!,
      isRecent:
        !o.presence!.lastActivityAt ||
        Date.now() - o.presence!.lastActivityAt < 2000,
    }));

  if (editing.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5">
      <AnimatePresence>
        {editing.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-background/85 backdrop-blur-md border border-border/60 shadow-lg shadow-black/5 pl-2 pr-3 py-1"
            style={{ borderLeftColor: e.color, borderLeftWidth: 3 }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{
                  backgroundColor: e.color,
                  animation: e.isRecent ? "ping 1.2s cubic-bezier(0,0,0.2,1) infinite" : "none",
                }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: e.color }}
              />
            </span>
            <Pencil size={11} style={{ color: e.color }} />
            <span className="text-[11px] font-bold text-foreground">
              {e.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              editing{" "}
              <span className="font-semibold text-foreground">
                {SECTION_LABELS[e.section] || e.section}
              </span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
