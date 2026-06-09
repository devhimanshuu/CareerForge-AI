"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageSquare,
  Mic,
  Lightbulb,
  Briefcase,
  Check,
  CheckCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

// ─── Types ───
type NotificationType =
  | "collaboration_comment"
  | "interview_score"
  | "insight_generated"
  | "job_match";

interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, any> | null;
  read: boolean | null;
  channel: string | null;
  createdAt: string | null;
}

// ─── Helpers ───
const typeIcon: Record<NotificationType, React.ReactNode> = {
  collaboration_comment: <MessageSquare size={14} className="text-blue-500" />,
  interview_score: <Mic size={14} className="text-purple-500" />,
  insight_generated: <Lightbulb size={14} className="text-amber-500" />,
  job_match: <Briefcase size={14} className="text-emerald-500" />,
};

const typeUrl: Record<NotificationType, string> = {
  collaboration_comment: "/dashboard",
  interview_score: "/dashboard/interview",
  insight_generated: "/dashboard/automation",
  job_match: "/dashboard/applications",
};

function getUrlForNotification(n: Notification): string {
  if (n.type === "collaboration_comment" && n.metadata?.documentId) {
    return `/dashboard/document/${n.metadata.documentId}/edit`;
  }
  return typeUrl[n.type] || "/dashboard";
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

// ─── Component ───
const NotificationCenter: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notification?limit=30");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silently ignore
    }
  }, []);

  // Poll every 30s when tab is active
  useEffect(() => {
    fetchNotifications();

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchNotifications, 30000);
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Use visibility API to poll only when tab is active
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchNotifications]);

  // Mark single as read
  const markAsRead = async (id: number) => {
    try {
      await fetch("/api/notification/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch("/api/notification/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Navigate on notification click
  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n.id);
    setOpen(false);
    router.push(getUrlForNotification(n));
  };

  // Group by today / earlier
  const todayNotifications = notifications.filter((n) => isToday(n.createdAt));
  const earlierNotifications = notifications.filter(
    (n) => !isToday(n.createdAt)
  );

  const renderGroup = (items: Notification[], label: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-muted/60 transition-colors rounded-lg mx-0 ${
              n.read ? "opacity-60" : ""
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {typeIcon[n.type] || <Bell size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                {n.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                {n.body}
              </p>
              {n.createdAt && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
            {!n.read && (
              <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-xl border-border/50 shadow-2xl glass overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Notifications
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-6 px-2 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 gap-1"
              >
                <CheckCheck size={12} />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/notifications/settings");
              }}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <Settings size={12} />
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-muted-foreground"
              >
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[10px] mt-0.5">
                  We&apos;ll alert you when something arrives
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {renderGroup(todayNotifications, "Today")}
                {todayNotifications.length > 0 &&
                  earlierNotifications.length > 0 && <Separator />}
                {renderGroup(earlierNotifications, "Earlier")}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
