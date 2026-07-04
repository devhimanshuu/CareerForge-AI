"use client";

import React from "react";
import { Clock, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  targetRole: string;
  status: string;
  deliveryScore: number | null;
  contentScore: number | null;
  interviewType: string;
  difficulty: string;
  createdAt: string;
  turns?: any[];
}

interface PastSessionsProps {
  sessions: Session[];
  isLoading: boolean;
  onLoadSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

export const PastSessions = ({
  sessions,
  isLoading,
  onLoadSession,
  onDeleteSession,
}: PastSessionsProps) => {
  if (sessions.length === 0) return null;

  return (
    <div className="mt-6">
      <PremiumPanel className="p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-gray-500" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
              <Clock size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Past Sessions</p>
              <p className="text-[10px] text-muted-foreground">
                {sessions.length} completed interviews
              </p>
            </div>
          </div>
          {isLoading && (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-bold text-foreground truncate max-w-[70%]">
                  {session.targetRole}
                </p>
                <span
                  className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full",
                    session.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600",
                  )}
                >
                  {session.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    Delivery:
                  </span>
                  <span className="text-[10px] font-bold text-indigo-500">
                    {session.deliveryScore ?? "--"}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    Content:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500">
                    {session.contentScore ?? "--"}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {session.interviewType} · {session.difficulty} ·{" "}
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
              {session.turns && session.turns.length > 0 && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {session.turns.length} turns completed
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => onLoadSession(session)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors text-[10px] font-bold"
                >
                  <ExternalLink size={10} />
                  View Full Report
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSession(session)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  title="Delete session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PremiumPanel>
    </div>
  );
};
