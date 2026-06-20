"use client";

import { useEffect } from "react";
import { useUpdateMyPresence } from "@/lib/liveblocks";

// Broadcasts which form section the local user is currently editing so other
// users see live "Alice is editing Experience" indicators. Renders nothing.
// MUST be rendered inside a RoomProvider (i.e. when CollaborationProvider is active).
export function CollabSectionSync({ sectionId }: { sectionId: string | null }) {
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    updateMyPresence({
      activeSection: sectionId,
      lastActivityAt: Date.now(),
    });
  }, [sectionId, updateMyPresence]);

  return null;
}
