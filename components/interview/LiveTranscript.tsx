"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TranscriptEntry {
  id: string;
  speaker: "user" | "interviewer";
  text: string;
  timestamp: Date;
}

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
  isListening?: boolean;
  className?: string;
}

const speakerConfig = {
  user: {
    label: "You",
    color: "text-blue-500",
    bg: "bg-blue-500/5",
    border: "border-blue-500/10",
    dotColor: "bg-blue-500",
  },
  interviewer: {
    label: "Interviewer",
    color: "text-purple-500",
    bg: "bg-purple-500/5",
    border: "border-purple-500/10",
    dotColor: "bg-purple-500",
  },
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  entries,
  isListening = false,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, isListening]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2 mb-3 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Live Transcript
        </h3>

        <span className="text-[10px] font-bold text-muted-foreground">
          {entries.length} entries
        </span>
      </div>

      {/* Transcript body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin min-h-0"
      >
        {entries.length === 0 && !isListening && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-xs font-medium text-center">
              Transcript will appear here as the conversation unfolds...
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const config = speakerConfig[entry.speaker];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={cn(
                  "p-3 rounded-xl border",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto font-mono">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                  {entry.text}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-indigo-500 animate-pulse">
                Listening...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveTranscript;
