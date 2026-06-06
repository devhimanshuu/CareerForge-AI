"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Video,
  Sparkles,
  Trophy,
  MessageSquare,
  Play,
  Gauge,
  ClipboardCheck,
  StopCircle,
  Loader2,
  HelpCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  User,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  PremiumPage,
  PremiumPageHeader,
  PremiumPanel,
  PremiumStatCard,
} from "@/components/ui/premium-page";
import { toast } from "@/hooks/use-toast";
import useGetDocuments from "@/features/document/use-get-document";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const InterviewLab = () => {
  // Resumes list
  const { data: resumeData, isLoading: isResumesLoading } = useGetDocuments();
  const resumes = resumeData?.data || [];

  // Setup state
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeInfo, setSelectedResumeInfo] = useState<any>(null);

  // Session state
  const [step, setStep] = useState<"setup" | "interviewing" | "feedback">("setup");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Final evaluation state
  const [evaluation, setEvaluation] = useState<any>(null);

  // Recruiter voice synthesis
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!currentQuestion || isMuted || typeof window === "undefined" || step !== "interviewing") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    const voices = window.speechSynthesis.getVoices();
    const recruiterVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("male")) || 
                           voices.find(v => v.lang.startsWith("en-US")) || 
                           voices.find(v => v.lang.startsWith("en")) || 
                           voices[0];
    if (recruiterVoice) {
      utterance.voice = recruiterVoice;
    }
    utterance.pitch = 0.95;
    utterance.rate = 1.0;

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, isMuted, step]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (step === "feedback" || step === "setup") {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    }
  }, [step]);

  // Pre-populate target role when resume is selected
  useEffect(() => {
    if (!selectedResumeId) return;

    const fetchResumeDetail = async () => {
      try {
        const res = await fetch(`/api/document/${selectedResumeId}`);
        const json = await res.json();
        if (json.success) {
          setSelectedResumeInfo(json.data);
          if (json.data.personalInfo?.jobTitle) {
            setTargetRole(json.data.personalInfo.jobTitle);
          }
        }
      } catch (e) {
        console.error("Failed to load resume details:", e);
      }
    };

    fetchResumeDetail();
  }, [selectedResumeId]);

  // Audio timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartSession = async () => {
    if (!targetRole.trim()) {
      toast({
        title: "Setup Required",
        description: "Please specify your target role.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setMessages([]);
    setUserAnswer("");
    setEvaluation(null);

    try {
      const res = await fetch("/api/ai/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResumeInfo || {},
          jobDescription,
          targetRole,
          messages: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize session");
      const data = await res.json();

      if (data.type === "question") {
        setCurrentQuestion(data.text);
        setMessages([{ role: "assistant", content: data.text }]);
        setStep("interviewing");
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Session Failed",
        description: e.message || "Failed to start interview session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please speak or type your answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const userMsg: Message = { role: "user", content: userAnswer };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserAnswer("");

    try {
      const res = await fetch("/api/ai/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResumeInfo || {},
          jobDescription,
          targetRole,
          messages: updatedMessages,
        }),
      });

      if (!res.ok) throw new Error("Failed to process answer");
      const data = await res.json();

      if (data.type === "question") {
        setCurrentQuestion(data.text);
        setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
      } else if (data.type === "evaluation") {
        setEvaluation(data);
        setStep("feedback");
        toast({
          title: "Session Completed!",
          description: "Your interview is complete. View your scorecard below.",
        });
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Session Error",
        description: e.message || "Failed to get AI response. Please try submitting again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Recording triggers
  const startRecording = async () => {
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        await transcribeAudio(audioBlob);
      };
      recorder.start(200);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      toast({
        title: "Microphone Access Failed",
        description: "Could not access microphone. Please ensure permissions are granted.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      // stop tracks to release hardware light indicator
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "answer.wav");

      const response = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.text) {
        setUserAnswer((prev) => (prev ? prev + " " + data.text : data.text));
      } else {
        throw new Error(data.message || "Could not transcribe audio");
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe audio. You can still type your answer instead.",
        variant: "destructive",
      });
    } finally {
      setTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to count questions asked
  const questionIndex = messages.filter((m) => m.role === "assistant").length;

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Practice Studio"
        title="Interview Lab"
        description="A premium mock rehearsal space with Whisper speech-to-text and adaptive coaching logs. Conduct deep, multi-turn STAR methodology interviews."
        icon={<Mic size={13} />}
        action={
          step !== "setup" && (
            <Button
              onClick={() => setStep("setup")}
              variant="outline"
              className="gap-2 border-indigo-500/30 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            >
              <RefreshCw size={16} />
              Reset Lab
            </Button>
          )
        }
      />

      {/* Dynamic Stats Banner */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PremiumStatCard
          icon={<Gauge size={18} />}
          label="Delivery Score"
          value={evaluation ? `${evaluation.deliveryScore}%` : "--"}
          detail={evaluation ? "Communication clarity" : "Awaiting session"}
          tone="indigo"
        />
        <PremiumStatCard
          icon={<Trophy size={18} />}
          label="Content Score"
          value={evaluation ? `${evaluation.contentScore}%` : "--"}
          detail={evaluation ? "STAR method structured" : "Not measured"}
          tone="emerald"
        />
        <PremiumStatCard
          icon={<ClipboardCheck size={18} />}
          label="Action Items"
          value={evaluation ? String(evaluation.actionItems.length) : "0"}
          detail={evaluation ? "Recommendations" : "Clean slate"}
          tone="amber"
        />
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP STEP */}
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto"
          >
            <PremiumPanel className="p-8 space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Play size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Configure Mock Interview</h2>
                  <p className="text-xs text-muted-foreground">Setup target role and background parameters.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    1. Choose Context Resume (Optional)
                  </label>
                  <select
                    className="w-full h-11 px-3 bg-muted/30 border border-border/70 rounded-xl text-sm focus:ring-2 ring-indigo-500/20 outline-none"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    <option value="">-- No resume context (pure interview) --</option>
                    {resumes.map((resume: any) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    2. Target Job Title
                  </label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    3. Target Job Description (Optional)
                  </label>
                  <Textarea
                    placeholder="Paste the Job Description to tailor the interview questions specifically to the position..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px] rounded-xl resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleStartSession}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Initialize AI Recruiter
                  </>
                )}
              </Button>
            </PremiumPanel>
          </motion.div>
        )}

        {/* INTERVIEWING STEP */}
        {step === "interviewing" && (
          <motion.div
            key="interviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Live Recruiter View */}
            <PremiumPanel className="lg:col-span-2 flex flex-col min-h-[500px]">
              {/* Camera feed mockup / glow */}
              <div className="aspect-video relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-b">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />

                <div className="absolute top-4 right-4 z-20">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
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

                {/* Animated Pulsing AI Avatar */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isRecording || loading ? [1, 1.15, 1] : 1,
                      opacity: isRecording || loading ? [0.4, 0.8, 0.4] : 0.5,
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-28 h-28 rounded-full bg-indigo-500 blur-xl"
                  />
                  <div className="w-20 h-20 rounded-full border-2 border-indigo-400 bg-slate-900 flex items-center justify-center shadow-xl shadow-indigo-500/20 relative z-10">
                    {loading ? (
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    ) : (
                      <Volume2 className={cn("w-8 h-8 text-indigo-400", isRecording && "animate-pulse")} />
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Question {questionIndex} of 3</span>
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30">
                      <span className="text-[10px] font-black text-red-400 tracking-wider">REC {formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat interaction zone */}
              <div className="flex-1 p-6 flex flex-col gap-6 bg-muted/10">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    AI Recruiter
                  </h3>
                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-md leading-relaxed font-bold text-slate-800 dark:text-slate-100">
                    {currentQuestion}
                  </div>
                </div>

                {/* User Response Area */}
                <div className="space-y-4 flex-1 flex flex-col justify-end">
                  <div className="relative">
                    <Textarea
                      placeholder="Type your structured STAR answer here, or click 'Record Audio' to respond verbally..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={loading || transcribing}
                      className="min-h-[120px] rounded-2xl pr-12 focus-visible:ring-indigo-500/30 border-border/70 resize-none text-sm font-medium leading-relaxed"
                    />

                    {transcribing && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        <span className="text-xs font-bold text-indigo-600 animate-pulse">Transcribing your voice...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {isRecording ? (
                      <Button
                        onClick={stopRecording}
                        className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 font-bold transition-all shadow-md shadow-red-500/10"
                      >
                        <StopCircle size={18} />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={startRecording}
                        disabled={loading || transcribing}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold"
                      >
                        <Mic size={18} />
                        Record Audio
                      </Button>
                    )}

                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={loading || transcribing || !userAnswer.trim()}
                      className="px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 text-sm shadow-lg shadow-indigo-500/15"
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
                  </div>
                </div>
              </div>
            </PremiumPanel>

            {/* Conversation Logs */}
            <div className="space-y-6">
              <PremiumPanel className="p-5 flex flex-col h-full max-h-[500px]">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b pb-2">
                  <MessageSquare size={14} />
                  Session Logs
                </h3>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed font-semibold",
                        m.role === "assistant"
                          ? "bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 border border-indigo-500/10 self-start"
                          : "bg-muted text-muted-foreground ml-auto self-end"
                      )}
                    >
                      <span className="block font-black text-[9px] uppercase tracking-widest opacity-60 mb-1">
                        {m.role === "assistant" ? "Interviewer" : "Candidate"}
                      </span>
                      {m.content}
                    </div>
                  ))}
                </div>
              </PremiumPanel>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK STEP */}
        {step === "feedback" && evaluation && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Scorecard Analysis */}
            <PremiumPanel className="lg:col-span-2 p-8 space-y-8">
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
                <ul className="space-y-2.5">
                  {evaluation.findings.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm font-semibold p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  Actionable Improvement Areas
                </h3>
                <ul className="space-y-2.5">
                  {evaluation.actionItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm font-semibold p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </PremiumPanel>

            {/* Conversation Logs recap */}
            <div className="space-y-6">
              <PremiumPanel className="p-5 flex flex-col max-h-[500px]">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
                  Session Recap
                </h3>
                <div className="overflow-y-auto space-y-4 flex-1">
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
        )}
      </AnimatePresence>
    </PremiumPage>
  );
};

export default InterviewLab;
