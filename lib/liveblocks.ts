import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Presence type — what each user broadcasts to others
type Presence = {
  cursor: { x: number; y: number } | null;
  activeSection: string | null; // which form section the user is editing
  userName: string;
  userColor: string;
  userAvatar?: string;
};

// Storage type — synced structured data for inline comments/threads
type ThreadComment = {
  id: string;
  threadId: string;
  sectionId: string;
  selectedText?: string;
  highlightRange?: { start: number; end: number };
  author: { name: string; avatar?: string; color: string };
  content: string;
  replies: {
    author: { name: string; avatar?: string; color: string };
    content: string;
    createdAt: string;
  }[];
  resolved: boolean;
  createdAt: string;
};

type Storage = {
  comments: LiveList<LiveObject<ThreadComment>>;
};

export const {
  RoomProvider,
  useOthers,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useStorage,
  useMutation,
  useRoom,
} = createRoomContext<Presence, Storage>(client);

export type { Presence, ThreadComment };