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

interface AudioVisualizerProps {
  state: VoiceState;
  /** When in "live" mode, show bidirectional visualization */
  mode?: "default" | "live";
  /** User audio level 0-1, used in live mode */
  userAudioLevel?: number;
  /** AI TTS audio level 0-1, used in live mode */
  aiAudioLevel?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  state,
  mode = "default",
  userAudioLevel = 0,
  aiAudioLevel = 0,
}) => {
  const config = stateConfig[state];

  if (mode === "live") {
    return <LiveVisualizer userAudioLevel={userAudioLevel} aiAudioLevel={aiAudioLevel} state={state} />;
  }

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

/**
 * Bidirectional live visualizer: left side = user audio, right side = AI audio
 */
const LIVE_BAR_COUNT = 16;

const LiveVisualizer: React.FC<{
  userAudioLevel: number;
  aiAudioLevel: number;
  state: VoiceState;
}> = ({ userAudioLevel, aiAudioLevel, state }) => {
  const isUserSpeaking = userAudioLevel > 0.1;
  const isAISpeaking = aiAudioLevel > 0.1;

  const userLabel = isUserSpeaking ? "Speaking" : state === "listening" ? "Listening" : "Muted";
  const aiLabel = isAISpeaking ? "Speaking" : state === "thinking" ? "Processing" : "Idle";

  return (
    <div className="flex items-center gap-6 w-full">
      {/* User side */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
          You
        </p>
        <div className="flex h-12 items-end justify-center gap-0.5">
          {Array.from({ length: LIVE_BAR_COUNT }).map((_, index) => (
            <motion.div
              key={`user-${index}`}
              className={cn(
                "w-1 rounded-full",
                isUserSpeaking ? "bg-blue-400" : "bg-blue-400/30"
              )}
              animate={{
                height: isUserSpeaking
                  ? 4 + userAudioLevel * (20 + (index % 3) * 8)
                  : 4,
                opacity: isUserSpeaking ? 0.7 + userAudioLevel * 0.3 : 0.3,
              }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {userLabel}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-16 bg-border/50 shrink-0" />

      {/* AI side */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">
          AI
        </p>
        <div className="flex h-12 items-end justify-center gap-0.5">
          {Array.from({ length: LIVE_BAR_COUNT }).map((_, index) => (
            <motion.div
              key={`ai-${index}`}
              className={cn(
                "w-1 rounded-full",
                isAISpeaking ? "bg-purple-400" : "bg-purple-400/30"
              )}
              animate={{
                height: isAISpeaking
                  ? 4 + aiAudioLevel * (20 + (index % 3) * 8)
                  : 4,
                opacity: isAISpeaking ? 0.7 + aiAudioLevel * 0.3 : 0.3,
              }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {aiLabel}
        </p>
      </div>
    </div>
  );
};

export default AudioVisualizer;
