"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Loader2, Sparkles, Wand2, Volume2, ArrowRight, Play, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIChatSession } from "@/lib/groq-model";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceToResumeProps {
  onGenerated: (content: string) => void;
  jobTitle?: string;
}

const VoiceToResume: React.FC<VoiceToResumeProps> = ({ onGenerated, jobTitle }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [open, setOpen] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      // 1. Transcribe using Groq Whisper (via our API)
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const res = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      const text = data.text;
      setTranscript(text);

      // 2. Format using Kimi 2.6
      const prompt = `
        You are an expert resume writer. Convert the following spoken job description into high-impact, professional bullet points for a resume.
        
        CONTEXT:
        Job Title: ${jobTitle || "Professional"}
        
        SPOKEN DESCRIPTION:
        "${text}"
        
        REQUIREMENTS:
        - Use the STAR method (Situation, Task, Action, Result) where possible.
        - Start each bullet point with a strong action verb.
        - Quantify achievements if mentioned (or suggest places to add numbers).
        - Output ONLY a clean HTML <ul> list with <li> elements. No extra text.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const formatted = aiResponse.response.text();
      setResult(formatted);
      
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process voice data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeep = () => {
    onGenerated(result);
    setOpen(false);
    setTranscript("");
    setResult("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
        >
          <Mic size={12} />
          Voice Record
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="bg-indigo-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Volume2 size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Mic size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white">Voice-to-Resume</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium">
                            Just talk about your work. AI will do the rest.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 bg-background min-h-[300px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {!transcript && !loading && (
                    <motion.div 
                        key="record"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="relative">
                            {isRecording && (
                                <motion.div 
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute inset-0 bg-red-500 rounded-full"
                                />
                            )}
                            <Button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-24 h-24 rounded-full shadow-2xl transition-all duration-300 ${
                                    isRecording 
                                    ? "bg-red-500 hover:bg-red-600 scale-110" 
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                {isRecording ? <Square size={32} /> : <Mic size={32} />}
                            </Button>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold">
                                {isRecording ? "Listening to your brilliance..." : "Ready to record?"}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-[250px]">
                                {isRecording 
                                    ? "Describe your daily tasks, achievements, and responsibilities naturally."
                                    : "Click the mic and describe your job. No need to be formal, just ramble!"}
                            </p>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Wand2 size={24} className="text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-bold">Structuring your content...</h3>
                            <p className="text-xs text-muted-foreground">Using Kimi 2.6 to build high-impact bullets</p>
                        </div>
                    </motion.div>
                )}

                {result && !loading && (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6"
                    >
                        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm prose dark:prose-invert max-h-[300px] overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: result }} />
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => { setTranscript(""); setResult(""); }}
                                className="flex-1 h-12 rounded-xl border-indigo-200 text-indigo-600 font-bold gap-2"
                            >
                                <RefreshCw size={16} />
                                Record Again
                            </Button>
                            <Button 
                                onClick={handleKeep}
                                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 shadow-xl shadow-indigo-600/20"
                            >
                                <Check size={16} />
                                Use These Bullets
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceToResume;
