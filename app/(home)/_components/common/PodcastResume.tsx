"use client";

import React, { useState, useRef } from "react";
import { Mic, Play, Pause, Loader2, Sparkles, Volume2, Headphones, Download, Radio, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const PodcastResume = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Conversational voice refs
  const dialogueIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const dialogueRef = useRef<{ speaker: "HOST" | "CANDIDATE"; text: string }[]>([]);

  const parseScript = (text: string) => {
    const lines = text.split("\n");
    const dialogue: { speaker: "HOST" | "CANDIDATE"; text: string }[] = [];
    
    let currentSpeaker: "HOST" | "CANDIDATE" | null = null;
    let currentText = "";
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      
      const hostMatch = cleanLine.match(/^HOST:\s*(.*)/i);
      const candidateMatch = cleanLine.match(/^CANDIDATE:\s*(.*)/i);
      
      if (hostMatch) {
        if (currentSpeaker && currentText) {
          dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = "HOST";
        currentText = hostMatch[1];
      } else if (candidateMatch) {
        if (currentSpeaker && currentText) {
          dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = "CANDIDATE";
        currentText = candidateMatch[1];
      } else {
        if (currentSpeaker) {
          currentText += " " + cleanLine;
        }
      }
    }
    
    if (currentSpeaker && currentText) {
      dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
    }
    
    return dialogue;
  };

  const playDialogue = () => {
    if (typeof window === "undefined") return;
    
    if (!isPlayingRef.current || dialogueIndexRef.current >= dialogueRef.current.length) {
      setPlaying(false);
      isPlayingRef.current = false;
      dialogueIndexRef.current = 0;
      return;
    }
    
    const item = dialogueRef.current[dialogueIndexRef.current];
    const utterance = new SpeechSynthesisUtterance(item.text);
    
    const voices = window.speechSynthesis.getVoices();
    // Host Voice (prefers female/Google US/UK English)
    const hostVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) || 
                      voices.find(v => v.lang.startsWith("en-US")) || 
                      voices[0];
                      
    // Candidate Voice (prefers male/alternative English voice)
    const candidateVoice = voices.find(v => v.lang.startsWith("en") && v.name !== hostVoice?.name) || 
                           voices.find(v => v.lang.startsWith("en-GB")) || 
                           voices[0];
    
    if (item.speaker === "HOST") {
      utterance.voice = hostVoice;
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
    } else {
      utterance.voice = candidateVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
    }
    
    utterance.onend = () => {
      dialogueIndexRef.current += 1;
      playDialogue();
    };
    
    utterance.onerror = () => {
      setPlaying(false);
      isPlayingRef.current = false;
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const generatePodcast = async () => {
    if (!resumeInfo) return;
    setLoading(true);
    // Reset dialogue refs
    dialogueRef.current = [];
    dialogueIndexRef.current = 0;
    isPlayingRef.current = false;
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setPlaying(false);

    try {
      const res = await fetch("/api/audio/generate-podcast", {
        method: "POST",
        body: JSON.stringify({ resumeData: resumeInfo }),
      });
      const data = await res.json();
      
      if (data.success) {
        setAudioUrl(data.audioUrl || null);
        setScript(data.script || "");
        setActive(true);
        toast({
          title: "Podcast Ready!",
          description: data.audioUrl
            ? "Your 2-minute career highlight interview is ready to play."
            : "Your personalized script is ready. Playback will use your browser voice.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Podcast Generation Failed",
        description: "Could not synchronize the AI interviewers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!script) return;
    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeInfo?.personalInfo?.firstName || "Resume"}_Podcast_Script.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Script Downloaded",
      description: "The podcast script has been saved to your device.",
    });
  };

  const togglePlayback = () => {
    if (audioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
      return;
    }

    if (typeof window !== "undefined" && script) {
      if (playing) {
        window.speechSynthesis.cancel();
        setPlaying(false);
        isPlayingRef.current = false;
      } else {
        window.speechSynthesis.cancel();
        
        if (dialogueRef.current.length === 0) {
          dialogueRef.current = parseScript(script);
        }
        
        isPlayingRef.current = true;
        setPlaying(true);
        playDialogue();
      }
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    isPlayingRef.current = false;
    setActive(false);
  };

  return (
    <div className="relative group">
      <Button
        onClick={() => (active ? handleClose() : generatePodcast())}
        disabled={loading}
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all ${
          active ? "bg-amber-500/10 text-amber-500" : "text-slate-400 hover:text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Headphones size={16} />
        )}
      </Button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 overflow-hidden"
          >
            {/* Visualizer Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center gap-1 p-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <motion.div 
                        key={i}
                        animate={playing ? { height: ["20%", "80%", "20%"] } : { height: "20%" }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        className="w-2 bg-amber-500 rounded-full"
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-2">
                        <Radio size={32} className="text-white animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/70">Career Forge FM</h3>
                    </div>
                    <h4 className="text-lg font-black text-white italic tracking-tight">The {resumeInfo?.personalInfo?.firstName}&apos;s Spotlight</h4>
                </div>

                {script && (
                    <div className="w-full max-h-28 overflow-y-auto rounded-2xl bg-white/5 border border-white/10 p-3 text-left text-[10px] text-slate-300 leading-relaxed custom-scrollbar">
                        {script}
                    </div>
                )}

                <div className="w-full space-y-4">
                    <div className="flex items-center justify-center gap-6">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                            <History size={20} />
                        </Button>
                        <Button 
                            onClick={togglePlayback}
                            className="w-16 h-16 rounded-full bg-white text-slate-950 hover:bg-amber-50 shadow-xl"
                        >
                            {playing ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                            <Volume2 size={20} />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                animate={playing ? { width: "100%" } : { width: "0%" }}
                                transition={{ duration: 120, ease: "linear" }}
                                className="h-full bg-amber-500"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>0:00</span>
                            <span>2:00</span>
                        </div>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2">
                    <Button 
                        onClick={downloadScript}
                        variant="outline" 
                        size="sm" 
                        className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase gap-2 text-white hover:text-slate-950"
                    >
                        <Download size={14} />
                        Script
                    </Button>
                    <Button 
                        onClick={handleClose}
                        variant="ghost" 
                        size="sm" 
                        className="h-9 rounded-xl text-slate-500 hover:text-white text-[10px] font-bold uppercase"
                    >
                        Close
                    </Button>
                </div>

                <audio 
                  ref={audioRef}
                  src={audioUrl || ""}
                  onEnded={() => setPlaying(false)}
                  className="hidden"
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PodcastResume;
