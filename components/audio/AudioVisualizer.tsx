"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type VoiceState = "idle" | "speaking" | "listening" | "thinking";

const BAR_COUNT = 24;

const stateConfig: Record<VoiceState, { color: string; label: string; active: boolean }> = {
  idle: { color: "bg-indigo-400/40", label: "Ready", active: false },
  speaking: { color: "bg-indigo-400", label: "AI Speaking", active: true },
  listening: { color: "bg-emerald-400", label: "Listening", active: true },
  thinking: { color: "bg-amber-400", label: "Processing", active: true },
};

const AudioVisualizer = ({ state }: { state: VoiceState }) => {
  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-16 items-end justify-center gap-1">
        {Array.from({ length: BAR_COUNT }).map((_, index) => (
          <motion.div
            key={index}
            className={cn("w-1.5 rounded-full", config.color)}
            animate={
              config.active
                ? {
                    height: [8, 12 + (index % 5) * 8, 10 + (index % 3) * 6, 8],
                    opacity: [0.5, 1, 0.7, 0.5],
                  }
                : { height: 8, opacity: 0.35 }
            }
            transition={{
              duration: config.active ? 0.8 + (index % 4) * 0.1 : 0.3,
              repeat: config.active ? Infinity : 0,
              ease: "easeInOut",
              delay: index * 0.03,
            }}
          />
        ))}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{config.label}</p>
    </div>
  );
};

export default AudioVisualizer;
