"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoPanelState = "idle" | "active" | "speaking";

interface VideoPanelProps {
  mediaStream: MediaStream | null;
  state: VideoPanelState;
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOff: boolean;
  onToggleVideo: () => void;
  isLive: boolean;
}

const VideoPanel: React.FC<VideoPanelProps> = ({
  mediaStream,
  state,
  isMuted,
  onToggleMute,
  isVideoOff,
  onToggleVideo,
  isLive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPiP, setIsPiP] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Picture-in-Picture toggle
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      // PiP not supported or denied
    }
  };

  // Listen for PiP exit
  useEffect(() => {
    const handler = () => {
      if (!document.pictureInPictureElement) {
        setIsPiP(false);
      }
    };
    document.addEventListener("leavepictureinpicture", handler);
    return () => document.removeEventListener("leavepictureinpicture", handler);
  }, []);

  const borderColors: Record<VideoPanelState, string> = {
    idle: "border-white/10",
    active: "border-indigo-500/30",
    speaking: "border-emerald-500/50",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl overflow-hidden bg-slate-950 border-2 transition-colors duration-500",
        borderColors[state],
        "aspect-video",
        isPiP && "opacity-0 pointer-events-none absolute"
      )}
    >
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          state === "idle" && "blur-md brightness-50",
          isVideoOff && "hidden"
        )}
      />

      {/* No video fallback — AI Interviewer avatar */}
      {(isVideoOff || !mediaStream) && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Avatar glow background */}
          <motion.div
            animate={{
              scale: state !== "idle" ? [1, 1.15, 1] : 1,
              opacity: state !== "idle" ? [0.25, 0.6, 0.25] : 0.3,
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute h-28 w-28 rounded-full bg-violet-500 blur-2xl"
          />

          {/* Head tilt animation */}
          <motion.div
            animate={{
              rotate: state !== "idle" ? [0, 2, 0, -2, 0] : 0,
              y: state !== "idle" ? [0, -2, 0] : 0,
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
            className="relative z-10"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <span className="text-3xl">🤖</span>
            </div>
          </motion.div>

          {/* Breathing ring */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-full border-2 border-violet-400/30"
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* LIVE indicator */}
      {isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              LIVE
            </span>
          </div>
        </div>
      )}

      {/* Speaking indicator */}
      <AnimatePresence>
        {state === "speaking" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-3 right-3 z-10"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Speaking
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all",
              isMuted
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-slate-900/60 border-white/10 text-white hover:bg-slate-800/60"
            )}
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={onToggleVideo}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all",
              isVideoOff
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-slate-900/60 border-white/10 text-white hover:bg-slate-800/60"
            )}
          >
            {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
          </button>
        </div>

        <button
          onClick={togglePiP}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900/60 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800/60 transition-all"
          title="Picture-in-Picture"
        >
          {isPiP ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );
};

export default VideoPanel;
