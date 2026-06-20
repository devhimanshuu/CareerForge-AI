"use client";

import React, { useState, useEffect } from "react";
import { useOthers, useSelf } from "@/lib/liveblocks";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";

// Section labels for display
const SECTION_LABELS: Record<string, string> = {
  personalInfo: "Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

/**
 * Shows avatars/initials of users currently in the document.
 * Displays which section each user is editing.
 * Avatar stack with overflow counter (+N more).
 * Tooltip on hover showing full name and active section.
 */
export function PresenceIndicator() {
  const others = useOthers();
  const self = useSelf();
  const [followingId, setFollowingId] = useState<number | string | null>(null);

  // When following a user, throttle scroll updates so we only react to the
  // followed user's cursor moving — and at most ~5x/sec. Avoids jitter when
  // other collaborators also move.
  const followedCursor = followingId != null
    ? others.find((o) => o.id === followingId)?.presence?.cursor
    : null;
  const followedY = followedCursor?.y ?? null;
  const lastScrollAt = React.useRef(0);

  useEffect(() => {
    if (followedY == null) return;
    const now = Date.now();
    if (now - lastScrollAt.current < 200) return;
    lastScrollAt.current = now;
    window.scrollTo({
      top: window.scrollY + (followedY - window.innerHeight / 2),
      behavior: "smooth",
    });
  }, [followedY]);

  // Combine self + others for the full presence list
  const allUsers = [self, ...others].filter(Boolean);
  const otherUsers = others.filter(
    (o) => o.presence?.userName || o.presence?.userColor,
  );

  // Max visible avatars before showing overflow
  const MAX_VISIBLE = 4;
  const visibleUsers = otherUsers.slice(0, MAX_VISIBLE);
  const overflowCount = otherUsers.length - MAX_VISIBLE;

  if (otherUsers.length === 0) {
    return null; // Solo mode — no indicator needed
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30"
    >
      {/* Online count */}
      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        {allUsers.length} online
      </div>

      {/* Avatar stack */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visibleUsers.map((o, i) => {
            const name = o.presence?.userName || "Anon";
            const color = o.presence?.userColor || "#6366f1";
            const avatar = o.presence?.userAvatar;
            const section = o.presence?.activeSection;
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative group"
                style={{ zIndex: visibleUsers.length - i }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setFollowingId((cur) => (cur === o.id ? null : o.id ?? null))
                  }
                  title={followingId === o.id ? "Stop following" : `Follow ${name}`}
                  className="relative"
                >
                  <Avatar
                    className="w-6 h-6 shadow-sm cursor-pointer hover:ring-2 transition-all"
                    style={{ boxShadow: `0 0 0 2px ${color}` }}
                  >
                    {avatar && <AvatarImage src={avatar} alt={name} />}
                    <AvatarFallback
                      className="text-[9px] font-bold"
                      style={{ backgroundColor: color, color: "#fff" }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {followingId === o.id && (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 text-white p-0.5 shadow">
                      <Eye size={8} />
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-popover border border-border shadow-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50"
                >
                  <span className="font-semibold">{name}</span>
                  {section && (
                    <span className="text-muted-foreground">
                      {" · editing "}
                      {SECTION_LABELS[section] || section}
                    </span>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Overflow counter */}
        {overflowCount > 0 && (
          <div
            className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground shadow-sm"
          >
            +{overflowCount}
          </div>
        )}
      </div>
    </motion.div>
  );
}