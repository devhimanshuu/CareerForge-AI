"use client";

import React from "react";
import {
  Sparkles,
  MessageSquare,
  StopCircle,
  Mic,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AudioVisualizer from "@/components/audio/AudioVisualizer";
import { PremiumPanel } from "@/components/ui/premium-page";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface InterviewConfig {
  questionCount: number;
  difficulty: string;
}

interface TurnBasedInterviewPanelProps {
  currentQuestion: string;
  questionIndex: number;
  interviewConfig: InterviewConfig;
  messages: Message[];
  canScrollUp: boolean;
  canScrollDown: boolean;
  sessionLogsRef: React.RefObject<HTMLDivElement>;
  userAnswer: string;
  onUserAnswerChange: (val: string) => void;
  loading: boolean;
  transcribing: boolean;
  isRecording: boolean;
  recordingTime: number;
  isTTSGenerating: boolean;
  voiceState: "idle" | "listening" | "speaking" | "thinking";
  isMuted: boolean;
  onToggleMute: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitAnswer: () => void;
  onEndSession: () => void;
  formatTime: (seconds: number) => string;
}

export const TurnBasedInterviewPanel = ({
  currentQuestion,
  questionIndex,
  interviewConfig,
  messages,
  canScrollUp,
  canScrollDown,
  sessionLogsRef,
  userAnswer,
  onUserAnswerChange,
  loading,
  transcribing,
  isRecording,
  recordingTime,
  isTTSGenerating,
  voiceState,
  isMuted,
  onToggleMute,
  onStartRecording,
  onStopRecording,
  onSubmitAnswer,
  onEndSession,
  formatTime,
}: TurnBasedInterviewPanelProps) => (
  <motion.div
    key="interviewing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full"
  >
    {/* Landscape interviewing layout */}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Left: Visualizer + Question (wider) */}
      <div className="xl:col-span-8 flex flex-col gap-5">
        {/* Video / Visualizer */}
        <PremiumPanel className="flex flex-col relative overflow-hidden">
          <div className="w-full aspect-video lg:aspect-[16/7] relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

            {/* Top bar */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    Question {questionIndex} of {interviewConfig.questionCount}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30">
                  <Sparkles size={10} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">AI Recruiter</span>
                </div>
              </div>
              <Button
                onClick={onToggleMute}
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 hover:bg-slate-800 text-white hover:text-white"
              >
                {isMuted ? (
                  <VolumeX size={14} className="text-red-400" />
                ) : (
                  <Volume2 size={14} className="text-emerald-400" />
                )}
              </Button>
            </div>

            {/* Center visualizer */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  scale: voiceState !== "idle" ? [1, 1.15, 1] : 1,
                  opacity: voiceState !== "idle" ? [0.3, 0.7, 0.3] : 0.4,
                }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute h-36 w-36 rounded-full bg-indigo-500 blur-3xl"
              />
              <motion.div
                animate={{
                  scale: voiceState !== "idle" ? [1, 1.08, 1] : 1,
                  opacity: voiceState !== "idle" ? [0.2, 0.5, 0.2] : 0.3,
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
                className="absolute h-48 w-48 rounded-full bg-violet-500 blur-3xl"
              />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 px-10 py-7 shadow-xl shadow-indigo-500/20 backdrop-blur-md">
                <AudioVisualizer state={voiceState} />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-400">STAR Format</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 backdrop-blur-md border border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground capitalize">{interviewConfig.difficulty} Difficulty</span>
                </div>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black text-red-400 tracking-wider">REC {formatTime(recordingTime)}</span>
                </div>
              )}
              {isTTSGenerating && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 backdrop-blur-md border border-violet-500/30">
                  <Loader2 size={10} className="animate-spin text-violet-400" />
                  <span className="text-[10px] font-black text-violet-400 tracking-wider">Generating Voice...</span>
                </div>
              )}
            </div>
          </div>
        </PremiumPanel>

        {/* Question + Answer zone */}
        <PremiumPanel className="p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          {/* Current question display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Sparkles size={13} className="text-indigo-500" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Recruiter</h3>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-sm leading-relaxed font-bold text-slate-800 dark:text-slate-100">
              {currentQuestion}
            </div>
          </div>

          {/* Answer textarea */}
          <div className="space-y-3 flex-1" data-submit-on-enter>
            <div className="relative">
              <Textarea
                placeholder="Type your structured STAR answer here (Shift+Enter for newline, Enter to submit)..."
                value={userAnswer}
                onChange={(e) => onUserAnswerChange(e.target.value)}
                disabled={loading || transcribing}
                className="min-h-[100px] rounded-2xl pr-12 focus-visible:ring-indigo-500/30 border-border/70 resize-none text-sm font-medium leading-relaxed"
              />
              {transcribing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-xs font-bold text-indigo-600 animate-pulse">Transcribing your voice...</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isRecording ? (
                <Button
                  onClick={onStopRecording}
                  className="sm:flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 font-bold transition-all shadow-md shadow-red-500/10"
                >
                  <StopCircle size={16} />
                  Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={onStartRecording}
                  disabled={loading || transcribing}
                  variant="outline"
                  className="sm:flex-1 h-11 rounded-xl gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold"
                >
                  <Mic size={16} />
                  Record Audio
                </Button>
              )}
              <Button
                onClick={onSubmitAnswer}
                disabled={loading || transcribing || !userAnswer.trim()}
                className="sm:flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 text-sm shadow-lg shadow-indigo-500/15"
                title="Submit answer (Enter)"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Submit Answer
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>
              <Button
                onClick={onEndSession}
                disabled={loading || messages.length === 0}
                variant="outline"
                className="sm:flex-1 h-11 rounded-xl gap-2 border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-sm"
                title="End session (⌘+Enter / Ctrl+Enter)"
              >
                <StopCircle size={16} />
                End Session
                <kbd className="hidden sm:inline text-[8px] font-mono bg-red-500/10 px-1.5 py-0.5 rounded ml-1">⌘↵</kbd>
              </Button>
            </div>
          </div>
        </PremiumPanel>
      </div>

      {/* Right: Session Logs */}
      <PremiumPanel className="xl:col-span-4 p-5 flex flex-col min-h-[400px] max-h-[700px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b pb-3">
          <MessageSquare size={14} />
          Session Logs
          <span className="ml-auto text-[9px] font-bold bg-muted/50 px-2 py-0.5 rounded-full">
            {messages.filter((m) => m.role === "assistant").length} Q&apos;s
          </span>
        </h3>
        <div className="relative flex-1 min-h-0">
          {/* Scroll fade overlays */}
          <div
            className={cn(
              "pointer-events-none absolute top-0 left-0 right-0 h-6 z-10 bg-gradient-to-b from-background to-transparent transition-opacity duration-200",
              canScrollUp ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10 bg-gradient-to-t from-background to-transparent transition-opacity duration-200",
              canScrollDown ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            ref={sessionLogsRef}
            className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin max-h-[580px]"
          >
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-4 rounded-2xl text-xs leading-relaxed font-semibold",
                  m.role === "assistant"
                    ? "bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 border border-indigo-500/10"
                    : "bg-muted text-muted-foreground ml-6",
                )}
              >
                <span className="block font-black text-[9px] uppercase tracking-widest opacity-60 mb-1">
                  {m.role === "assistant" ? "Interviewer" : "Candidate"}
                </span>
                {m.content}
              </motion.div>
            ))}
          </div>
        </div>
      </PremiumPanel>
    </div>
  </motion.div>
);
