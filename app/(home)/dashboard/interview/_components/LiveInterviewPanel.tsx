"use client";

import React from "react";
import {
  Sparkles,
  StopCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AudioVisualizer from "@/components/audio/AudioVisualizer";
import VideoPanel from "@/components/interview/VideoPanel";
import LiveTranscript, { TranscriptEntry } from "@/components/interview/LiveTranscript";
import { PremiumPanel } from "@/components/ui/premium-page";

interface InterviewConfig {
  questionCount: number;
}

interface LiveInterviewPanelProps {
  liveMediaStream: MediaStream | null;
  videoPanelState: "idle" | "active" | "speaking";
  isLiveMuted: boolean;
  onToggleMute: () => void;
  isVideoOff: boolean;
  onToggleVideo: () => void;
  isLiveSession: boolean;
  loading: boolean;
  liveAIAudioLevel: number;
  isLiveListening: boolean;
  liveUserAudioLevel: number;
  currentQuestion: string;
  questionIndex: number;
  interviewConfig: InterviewConfig;
  isProcessingAnswer: boolean;
  onDoneSpeaking: () => void;
  onEndSession: () => void;
  transcriptEntries: TranscriptEntry[];
}

export const LiveInterviewPanel = ({
  liveMediaStream,
  videoPanelState,
  isLiveMuted,
  onToggleMute,
  isVideoOff,
  onToggleVideo,
  isLiveSession,
  loading,
  liveAIAudioLevel,
  isLiveListening,
  liveUserAudioLevel,
  currentQuestion,
  questionIndex,
  interviewConfig,
  isProcessingAnswer,
  onDoneSpeaking,
  onEndSession,
  transcriptEntries,
}: LiveInterviewPanelProps) => (
  <motion.div
    key="live-interviewing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full"
  >
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Left: Video + AI Visualizer (wider) */}
      <div className="xl:col-span-8 flex flex-col gap-5">
        {/* Video panel */}
        <PremiumPanel className="p-2 relative overflow-hidden">
          <VideoPanel
            mediaStream={liveMediaStream}
            state={videoPanelState}
            isMuted={isLiveMuted}
            onToggleMute={onToggleMute}
            isVideoOff={isVideoOff}
            onToggleVideo={onToggleVideo}
            isLive={isLiveSession}
          />
        </PremiumPanel>

        {/* AI visualizer + current question */}
        <PremiumPanel className="p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles size={13} className="text-violet-500" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-500">AI Interviewer</h3>
            {loading && (
              <div className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span className="text-[10px] font-bold text-amber-500">Processing...</span>
              </div>
            )}
          </div>

          <AudioVisualizer
            state={
              loading
                ? "thinking"
                : liveAIAudioLevel > 0
                  ? "speaking"
                  : isLiveListening
                    ? "listening"
                    : "idle"
            }
            mode="live"
            userAudioLevel={liveUserAudioLevel}
            aiAudioLevel={liveAIAudioLevel}
          />

          {currentQuestion && (
            <div className="mt-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
              <p className="text-sm leading-relaxed font-bold text-slate-800 dark:text-slate-100">
                {currentQuestion}
              </p>
            </div>
          )}

          {/* Live status bar + Done Speaking */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                Question {questionIndex} of {interviewConfig.questionCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onDoneSpeaking}
                disabled={loading || isProcessingAnswer}
                size="sm"
                className="h-8 rounded-lg px-3 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold shadow-md shadow-violet-500/20"
              >
                <CheckCircle2 size={12} />
                Done Speaking
              </Button>
              <Button
                onClick={onEndSession}
                disabled={loading}
                size="sm"
                variant="outline"
                className="h-8 rounded-lg px-3 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-bold"
                title="End session (⌘+Enter / Ctrl+Enter)"
              >
                <StopCircle size={12} />
                End Session
                <kbd className="hidden sm:inline text-[8px] font-mono bg-red-500/10 px-1 py-0.5 rounded ml-1">⌘↵</kbd>
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-400">Live</span>
              </div>
            </div>
          </div>
        </PremiumPanel>
      </div>

      {/* Right: Live Transcript */}
      <PremiumPanel className="xl:col-span-4 p-5 flex flex-col min-h-[400px] max-h-[700px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
        <LiveTranscript
          entries={transcriptEntries}
          isListening={isLiveListening && !loading}
        />
      </PremiumPanel>
    </div>
  </motion.div>
);
