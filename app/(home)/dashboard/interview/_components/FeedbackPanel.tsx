"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface FeedbackPanelProps {
  evaluation: any;
  messages: Message[];
}

export const FeedbackPanel = ({ evaluation, messages }: FeedbackPanelProps) => {
  if (!evaluation) return null;

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Score summary banner */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <PremiumPanel className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Delivery</p>
            <p className="text-3xl font-black text-indigo-500 mt-1">{evaluation.deliveryScore}%</p>
          </div>
        </PremiumPanel>
        <PremiumPanel className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Content</p>
            <p className="text-3xl font-black text-emerald-500 mt-1">{evaluation.contentScore}%</p>
          </div>
        </PremiumPanel>
        <PremiumPanel className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall</p>
            <p className="text-3xl font-black text-violet-500 mt-1">
              {Math.round((evaluation.deliveryScore + evaluation.contentScore) / 2)}%
            </p>
          </div>
        </PremiumPanel>
        <PremiumPanel className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action Items</p>
            <p className="text-3xl font-black text-amber-500 mt-1">{evaluation.actionItems.length}</p>
          </div>
        </PremiumPanel>
      </div>

      {/* Landscape feedback layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Scorecard Analysis (wider) */}
        <PremiumPanel className="xl:col-span-8 p-6 md:p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Grading Report</h2>
              <p className="text-xs text-muted-foreground">Comprehensive performance metrics and analytics.</p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Executive Summary</h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
              {evaluation.summary}
            </p>
          </div>

          {/* Key Findings */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              Key Strengths & Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.findings.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3 text-sm font-semibold p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              Actionable Improvement Areas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.actionItems.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3 text-sm font-semibold p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumPanel>

        {/* Conversation Logs recap */}
        <PremiumPanel className="xl:col-span-4 p-5 flex flex-col max-h-[600px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-gray-500" />
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b pb-3">
            <MessageSquare size={14} />
            Session Recap
            <span className="ml-auto text-[9px] font-bold bg-muted/50 px-2 py-0.5 rounded-full">
              {messages.length} msgs
            </span>
          </h3>
          <div className="overflow-y-auto space-y-3 flex-1">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                  {m.role === "assistant" ? "Interviewer" : "Candidate"}
                </span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/30 p-3 rounded-xl">
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </PremiumPanel>
      </div>
    </motion.div>
  );
};
