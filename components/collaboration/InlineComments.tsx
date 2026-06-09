"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  X,
  Check,
  Reply,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRandomColor, PRESENCE_COLORS } from "./CollaborationProvider";

// Thread comment type (matches DB schema)
type ThreadCommentData = {
  id: string;
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

type InlineCommentsProps = {
  documentId: string;
  sectionId: string;
  children: React.ReactNode;
};

/**
 * InlineComments wraps a form section and provides:
 * - Text selection triggers a "Comment" popover button
 * - Thread creation / reply / resolve / delete
 * - Highlight selected text with author's color
 * - Persists to DB via API + syncs via Liveblocks (if available)
 */
export function InlineComments({
  documentId,
  sectionId,
  children,
}: InlineCommentsProps) {
  const { user, isLoaded } = useUser();
  const [threads, setThreads] = useState<ThreadCommentData[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [commentButtonPos, setCommentButtonPos] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load threads from DB on mount
  useEffect(() => {
    loadThreads();
  }, [documentId, sectionId]);

  const loadThreads = async () => {
    try {
      const res = await fetch(
        `/api/collaboration/threads/${documentId}?sectionId=${sectionId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  // Detect text selection within this section
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setShowCommentButton(false);
      setSelectedText(null);
      setSelectionRange(null);
      return;
    }

    // Check if selection is within our container
    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setShowCommentButton(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setShowCommentButton(false);
      return;
    }

    setSelectedText(text);

    // Get the bounding rect for positioning the comment button
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setCommentButtonPos({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top - 30,
    });
    setShowCommentButton(true);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  // Create a new thread
  const createThread = async () => {
    if (!newCommentText.trim() || !selectedText) return;

    const authorName = user?.fullName || user?.firstName || "Anonymous";
    const authorColor = getRandomColor();
    const authorAvatar = user?.imageUrl;

    const newThread: ThreadCommentData = {
      id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sectionId,
      selectedText,
      author: { name: authorName, avatar: authorAvatar, color: authorColor },
      content: newCommentText.trim(),
      replies: [],
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    // Save to DB
    try {
      const res = await fetch(`/api/collaboration/threads/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newThread.id,
          sectionId,
          selectedText,
          authorName,
          authorEmail: user?.emailAddresses?.[0]?.emailAddress,
          authorColor,
          content: newCommentText.trim(),
        }),
      });
      if (!res.ok) {
        console.error("Failed to save thread to DB");
      }
    } catch (err) {
      console.error("Failed to save thread:", err);
    }

    // Update local state
    setThreads((prev) => [...prev, newThread]);
    setNewCommentText("");
    setShowNewThreadForm(false);
    setShowCommentButton(false);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  };

  // Add reply to thread
  const addReply = async (threadId: string) => {
    const replyContent = replyTexts[threadId]?.trim();
    if (!replyContent) return;

    const authorName = user?.fullName || user?.firstName || "Anonymous";
    const authorColor = getRandomColor();
    const authorAvatar = user?.imageUrl;

    const newReply = {
      author: { name: authorName, avatar: authorAvatar, color: authorColor },
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    // Update DB
    try {
      await fetch(`/api/collaboration/threads/${threadId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReply),
      });
    } catch (err) {
      console.error("Failed to save reply:", err);
    }

    // Update local state
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t,
      ),
    );
    setReplyTexts((prev) => ({ ...prev, [threadId]: "" }));
  };

  // Resolve/unresolve thread
  const toggleResolve = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    const newResolved = !thread.resolved;

    try {
      await fetch(`/api/collaboration/threads/${threadId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: newResolved }),
      });
    } catch (err) {
      console.error("Failed to update thread:", err);
    }

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              resolved: newResolved,
            }
          : t,
      ),
    );
  };

  // Delete thread
  const deleteThread = async (threadId: string) => {
    try {
      await fetch(`/api/collaboration/threads/${threadId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }

    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  // Filter threads for this section
  const sectionThreads = threads.filter(
    (t) => t.sectionId === sectionId && !t.resolved,
  );
  const resolvedThreads = threads.filter(
    (t) => t.sectionId === sectionId && t.resolved,
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Render children (the section content) */}
      {children}

      {/* Comment button on text selection */}
      <AnimatePresence>
        {showCommentButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-50 flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold shadow-lg hover:bg-indigo-700 transition-colors pointer-events-auto"
            style={{
              left: commentButtonPos.x,
              top: commentButtonPos.y,
            }}
            onClick={() => setShowNewThreadForm(true)}
          >
            <MessageSquare size={12} />
            Comment
          </motion.button>
        )}
      </AnimatePresence>

      {/* New thread creation form */}
      <AnimatePresence>
        {showNewThreadForm && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-72 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-xl shadow-2xl p-4 pointer-events-auto"
            style={{
              left: Math.min(commentButtonPos.x, 200),
              top: commentButtonPos.y + 20,
            }}
          >
            {/* Selected text preview */}
            <div
              className="px-2 py-1.5 rounded-md bg-indigo-500/10 text-xs text-indigo-600 mb-3 font-medium border border-indigo-500/20"
            >
              &ldquo;{selectedText.slice(0, 60)}{selectedText.length > 60 ? "…" : ""}&rdquo;
            </div>

            {/* Comment input */}
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-muted-foreground"
              rows={3}
              autoFocus
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setShowNewThreadForm(false);
                  setNewCommentText("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                onClick={createThread}
                disabled={!newCommentText.trim()}
              >
                Post Comment
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline thread markers (anchored comments) */}
      <AnimatePresence>
        {sectionThreads.map((thread) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-0 top-0 z-30 pointer-events-auto"
          >
            {/* Thread marker dot */}
            <button
              className="w-4 h-4 rounded-full shadow-md hover:scale-1.3 transition-transform relative"
              style={{ backgroundColor: thread.author.color }}
              onClick={() =>
                setExpandedThreads((prev) => ({
                  ...prev,
                  [thread.id]: !prev[thread.id],
                }))
              }
            >
              <MessageSquare
                size={8}
                className="absolute inset-0 m-auto text-white"
              />
            </button>

            {/* Expanded thread view */}
            <AnimatePresence>
              {expandedThreads[thread.id] && (
                <motion.div
                  initial={{ opacity: 0, x: 10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 280 }}
                  exit={{ opacity: 0, x: 10, width: 0 }}
                  className="absolute left-6 top-0 w-[280px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-xl shadow-2xl p-3 space-y-3"
                >
                  {/* Header: Author + selected text */}
                  <div className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: thread.author.color }}
                    >
                      {thread.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">
                        {thread.author.name}
                      </div>
                      {thread.selectedText && (
                        <div
                          className="text-[10px] px-1.5 py-0.5 rounded mt-1 truncate"
                          style={{
                            backgroundColor: `${thread.author.color}15`,
                            color: thread.author.color,
                          }}
                        >
                          &ldquo;{thread.selectedText.slice(0, 40)}&hellip;&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment content */}
                  <div className="text-sm text-foreground/90 pl-8">
                    {thread.content}
                  </div>

                  {/* Replies */}
                  {thread.replies.length > 0 && (
                    <div className="pl-8 space-y-2 border-l-2 border-border/30 ml-2">
                      {thread.replies.map((reply, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                            style={{
                              backgroundColor: reply.author.color,
                            }}
                          >
                            {reply.author.name[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-semibold">
                              {reply.author.name}
                            </span>
                            <p className="text-xs text-foreground/80">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  <div className="pl-8 flex gap-1">
                    <input
                      value={replyTexts[thread.id] || ""}
                      onChange={(e) =>
                        setReplyTexts((prev) => ({
                          ...prev,
                          [thread.id]: e.target.value,
                        }))
                      }
                      placeholder="Reply…"
                      className="flex-1 px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addReply(thread.id);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-1"
                      onClick={() => addReply(thread.id)}
                    >
                      <Reply size={12} />
                    </Button>
                  </div>

                  {/* Actions: resolve / delete */}
                  <div className="flex items-center justify-between pl-8 pt-1 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                      onClick={() => toggleResolve(thread.id)}
                    >
                      <Check size={12} />
                      Resolve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteThread(thread.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}