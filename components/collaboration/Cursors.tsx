"use client";

import React, { useEffect, useRef, useState } from "react";
import { useOthers, useMyPresence, useUpdateMyPresence } from "@/lib/liveblocks";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Renders other users' cursors as colored dots with name labels.
 * Placed as an overlay on the preview panel area.
 * Cursor follows mouse movement; fades out after 3s of inactivity.
 */
export function Cursors({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const [inactiveTimers, setInactiveTimers] = useState<Record<string, number>>({});

  // Track mouse movement and broadcast our cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert to container-relative coordinates if containerRef is provided
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateMyPresence({
          cursor: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          },
        });
      } else {
        updateMyPresence({
          cursor: { x: e.clientX, y: e.clientY },
        });
      }
    };

    const handleMouseLeave = () => {
      updateMyPresence({ cursor: null });
    };

    const target = containerRef?.current || window;
    target.addEventListener("mousemove", handleMouseMove as EventListener);
    target.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove as EventListener);
      target.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [updateMyPresence, containerRef]);

  // Track inactivity: hide cursor label after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setInactiveTimers((prev) => {
        const next: Record<string, number> = {};
        for (const [id, timer] of Object.entries(prev)) {
          next[id] = timer + 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Reset timer when cursor moves
  useEffect(() => {
    const activeIds = others
      .filter((o) => o.presence?.cursor !== null)
      .map((o) => (o.id ?? 0).toString());
    setInactiveTimers((prev) => {
      const next = { ...prev };
      for (const id of activeIds) {
        next[id] = 0; // reset on movement
      }
      return next;
    });
  }, [others]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {others
          .filter((o) => o.presence?.cursor !== null)
          .map((o) => {
            const cursor = o.presence!.cursor!;
            const color = o.presence!.userColor || "#6366f1";
            const name = o.presence!.userName || "Anonymous";
            const oid = o.id ?? 0;
            const isInactive = (inactiveTimers[oid.toString()] || 0) > 3000;

            return (
              <motion.div
                key={oid}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isInactive ? 0.3 : 1,
                  scale: 1,
                  x: cursor.x,
                  y: cursor.y,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.5,
                  opacity: { duration: 0.3 },
                }}
                className="absolute left-0 top-0"
                style={{ transform: "none" }} // framer-motion handles position
              >
                {/* Cursor dot */}
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
                {/* Name label */}
                <motion.div
                  animate={{ opacity: isInactive ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-4 top-0 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md"
                  style={{
                    backgroundColor: color,
                    color: "#fff",
                  }}
                >
                  {name}
                </motion.div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}