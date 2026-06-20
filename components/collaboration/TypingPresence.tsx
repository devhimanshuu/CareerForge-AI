"use client";

import React, { useEffect } from "react";
import { useOthers, useUpdateMyPresence } from "@/lib/liveblocks";
import { motion, AnimatePresence } from "framer-motion";

// Broadcast my "currently typing in this thread" state to other collaborators.
// Renders nothing; render only when inside a RoomProvider.
export function TypingPresence({
  threadId,
  active,
}: {
  threadId: string;
  active: boolean;
}) {
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    updateMyPresence({ typingThreadId: active ? threadId : null });
    return () => updateMyPresence({ typingThreadId: null });
  }, [threadId, active, updateMyPresence]);

  return null;
}

// Renders "Alice is typing…" inside a specific thread when remote users are composing.
export function TypingIndicator({ threadId }: { threadId: string }) {
  const others = useOthers();
  const typing = others.filter((o) => o.presence?.typingThreadId === threadId);

  return (
    <AnimatePresence>
      {typing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="pl-8 mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground"
        >
          <span className="flex gap-0.5">
            <Dot delay={0} color={typing[0].presence?.userColor} />
            <Dot delay={120} color={typing[0].presence?.userColor} />
            <Dot delay={240} color={typing[0].presence?.userColor} />
          </span>
          {typing.length === 1
            ? `${typing[0].presence?.userName || "Someone"} is typing…`
            : `${typing.length} people are typing…`}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Dot = ({ delay, color }: { delay: number; color?: string }) => (
  <span
    className="inline-block w-1 h-1 rounded-full"
    style={{
      backgroundColor: color || "#6366f1",
      animation: `pulse 1s ${delay}ms infinite ease-in-out`,
    }}
  />
);
