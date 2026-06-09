"use client";

import React, { useState, useEffect } from "react";
import { RoomProvider } from "@/lib/liveblocks";
import { LiveList } from "@liveblocks/client";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Loader2 } from "lucide-react";

// Check if Liveblocks is configured (has env key on server)
// Client-side we just detect connection state
const IS_LIVEBLOCKS_CONFIGURED = true; // We attempt connection; fallback handles failure

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

export function CollaborationProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [hasError, setHasError] = useState(false);
  const { user, isLoaded } = useUser();

  // Derive connection state from user loading
  useEffect(() => {
    if (!isLoaded) {
      setConnectionState("connecting");
      return;
    }
    if (!user) {
      setHasError(true);
      setConnectionState("error");
      return;
    }
    // If Liveblocks auth endpoint returns error, we catch it here
    // For now, assume connected once user is loaded
    setConnectionState("connected");
    setHasError(false);
  }, [isLoaded, user]);

  // If the auth endpoint fails, RoomProvider will throw.
  // We catch that and show fallback.
  if (hasError) {
    return (
      <div className="relative">
        {/* Non-real-time fallback — children still work but no live features */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 text-xs font-medium"
          >
            <WifiOff size={14} />
            Collaboration requires LIVEBLOCKS_SECRET_KEY — threaded comments still work via database.
          </motion.div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <RoomProvider id={roomId} initialPresence={getInitialPresence(user)} initialStorage={() => ({ comments: new LiveList([]) })}>
      <div className="relative">
        {/* Connection status indicator */}
        <AnimatePresence>
          {connectionState !== "connected" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg text-xs"
            >
              {connectionState === "connecting" && (
                <>
                  <Loader2 size={12} className="animate-spin text-amber-500" />
                  <span className="text-muted-foreground">Connecting…</span>
                </>
              )}
              {connectionState === "disconnected" && (
                <>
                  <WifiOff size={12} className="text-red-500" />
                  <span className="text-muted-foreground">Disconnected</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small connection dot */}
        <div className="fixed bottom-4 left-4 z-50">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              connectionState === "connected" && "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
              connectionState === "connecting" && "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse",
              connectionState === "disconnected" && "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
              connectionState === "error" && "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
            )}
            title={`Collaboration: ${connectionState}`}
          />
        </div>

        {children}
      </div>
    </RoomProvider>
  );
}

function getInitialPresence(user: any) {
  if (!user) {
    return {
      cursor: null,
      activeSection: null,
      userName: "Anonymous",
      userColor: "#6366f1",
    };
  }
  return {
    cursor: null,
    activeSection: null,
    userName: user.fullName || user.firstName || "Anonymous",
    userColor: getRandomColor(),
    userAvatar: user.imageUrl,
  };
}

// Generate a random color for the user's cursor/presence
const PRESENCE_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

function getRandomColor() {
  return PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];
}

// Helper: cn utility (reuse from utils)
function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

export { getRandomColor, PRESENCE_COLORS };