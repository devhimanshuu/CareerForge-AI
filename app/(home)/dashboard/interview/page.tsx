"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Radio,
  MessageCircle,
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
import VoiceStudio, {
  createElevenLabsAudio,
  defaultVoiceStudioConfig,
  VoiceStudioConfig,
} from "@/components/audio/VoiceStudio";
import AudioVisualizer from "@/components/audio/AudioVisualizer";
import VideoPanel from "@/components/interview/VideoPanel";
import LiveTranscript, { TranscriptEntry } from "@/components/interview/LiveTranscript";
import {
  InterviewSessionManager,
  createSilenceDetector,
} from "@/lib/webrtc-interview";

type InterviewMode = "turn-based" | "live";

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
  const [interviewConfig, setInterviewConfig] = useState({
    interviewType: "mixed",
    difficulty: "adaptive",
    feedbackStyle: "supportive",
    questionCount: 4,
  });

  // Mode state
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("turn-based");

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState<VoiceStudioConfig>(defaultVoiceStudioConfig);
  const recruiterAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Live Mode State ────────────────────────────────────────────
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [liveMediaStream, setLiveMediaStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLiveMuted, setIsLiveMuted] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveUserAudioLevel, setLiveUserAudioLevel] = useState(0);
  const [liveAIAudioLevel, setLiveAIAudioLevel] = useState(0);
  const [videoPanelState, setVideoPanelState] = useState<"idle" | "active" | "speaking">("idle");

  const sessionManagerRef = useRef<InterviewSessionManager | null>(null);
  const silenceDetectorRef = useRef<ReturnType<typeof createSilenceDetector> | null>(null);
  const livePollingRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>("");
  const isProcessingAnswerRef = useRef(false);
  const liveTTSAudioRef = useRef<HTMLAudioElement | null>(null);

  const voiceState = loading
    ? "thinking"
    : isRecording || transcribing
      ? "listening"
      : isSpeaking
        ? "speaking"
        : "idle";

  // ─── Existing TTS Effect (turn-based) ──────────────────────────
  useEffect(() => {
    if (!currentQuestion || isMuted || typeof window === "undefined" || step !== "interviewing") return;
    if (interviewMode === "live") return; // Live mode has its own TTS

    window.speechSynthesis.cancel();
    recruiterAudioRef.current?.pause();
    let objectUrl = "";
    let cancelled = false;

    const speak = async () => {
      setIsSpeaking(true);
      try {
        objectUrl = await createElevenLabsAudio(currentQuestion, voiceConfig);
        const audio = new Audio(objectUrl);
        recruiterAudioRef.current = audio;
        audio.onended = () => !cancelled && setIsSpeaking(false);
        audio.onerror = () => !cancelled && setIsSpeaking(false);
        await audio.play();
      } catch {
        const utterance = new SpeechSynthesisUtterance(currentQuestion);
        utterance.rate = voiceConfig.speed;
        utterance.onend = () => !cancelled && setIsSpeaking(false);
        utterance.onerror = () => !cancelled && setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    };
    speak();

    return () => {
      cancelled = true;
      setIsSpeaking(false);
      recruiterAudioRef.current?.pause();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, isMuted, step, voiceConfig, interviewMode]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        recruiterAudioRef.current?.pause();
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (step === "feedback" || step === "setup") {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        recruiterAudioRef.current?.pause();
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

  // ─── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      cleanupLiveSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Live Mode: Audio Level Polling ────────────────────────────
  useEffect(() => {
    if (!isLiveSession || step !== "interviewing") return;

    const pollAudioLevel = () => {
      const manager = sessionManagerRef.current;
      if (!manager) return;

      const level = manager.getAudioLevel();
      setLiveUserAudioLevel(level);

      // Update video panel state based on audio level
      if (level > 0.1) {
        setVideoPanelState("speaking");
      } else if (isLiveSession) {
        setVideoPanelState("active");
      }

      // Silence detection
      if (silenceDetectorRef.current && !isProcessingAnswerRef.current) {
        const silenceDetected = silenceDetectorRef.current.check(level);
        if (silenceDetected && accumulatedTranscriptRef.current.trim()) {
          handleLiveAnswerComplete();
        }
      }
    };

    livePollingRef.current = setInterval(pollAudioLevel, 150);

    return () => {
      if (livePollingRef.current) {
        clearInterval(livePollingRef.current);
        livePollingRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveSession, step]);

  // ─── Live Mode: TTS for AI responses ──────────────────────────
  const speakLiveResponse = useCallback(
    async (text: string) => {
      if (isLiveMuted || typeof window === "undefined") return;

      window.speechSynthesis.cancel();
      liveTTSAudioRef.current?.pause();

      let objectUrl = "";
      let cancelled = false;

      setVideoPanelState("idle");

      try {
        // Try ElevenLabs first
        objectUrl = await createElevenLabsAudio(text, voiceConfig);
        const audio = new Audio(objectUrl);
        liveTTSAudioRef.current = audio;

        // Track AI audio level for visualizer
        audio.onplay = () => {
          setVideoPanelState("idle");
          setLiveAIAudioLevel(0.7);
        };
        audio.onended = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
          }
        };
        audio.onerror = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
          }
        };

        await audio.play();
      } catch {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceConfig.speed;

        utterance.onstart = () => setLiveAIAudioLevel(0.7);
        utterance.onend = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
          }
        };
        utterance.onerror = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
          }
        };

        window.speechSynthesis.speak(utterance);
      }

      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    },
    [isLiveMuted, voiceConfig],
  );

  // ─── Live Mode: Handle user finished speaking (silence detected) ──
  const handleLiveAnswerComplete = useCallback(async () => {
    if (isProcessingAnswerRef.current) return;

    const answerText = accumulatedTranscriptRef.current.trim();
    if (!answerText) return;

    isProcessingAnswerRef.current = true;
    accumulatedTranscriptRef.current = "";
    silenceDetectorRef.current?.reset();
    setIsLiveListening(false);
    setVideoPanelState("idle");

    // Add user entry to transcript
    const userEntry: TranscriptEntry = {
      id: `user-${Date.now()}`,
      speaker: "user",
      text: answerText,
      timestamp: new Date(),
    };
    setTranscriptEntries((prev) => [...prev, userEntry]);

    // Update messages for AI context
    const userMsg: Message = { role: "user", content: answerText };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      // Send to AI
      sendLiveToAI(updated);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Live Mode: Send transcript to AI ─────────────────────────
  const sendLiveToAI = useCallback(
    async (currentMessages: Message[]) => {
      setLoading(true);

      try {
        const res = await fetch("/api/ai/interview-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeData: selectedResumeInfo || {},
            jobDescription,
            targetRole,
            messages: currentMessages,
            config: interviewConfig,
          }),
        });

        if (!res.ok) throw new Error("Failed to get AI response");
        const data = await res.json();

        if (data.type === "question") {
          setCurrentQuestion(data.text);
          setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);

          const aiEntry: TranscriptEntry = {
            id: `ai-${Date.now()}`,
            speaker: "interviewer",
            text: data.text,
            timestamp: new Date(),
          };
          setTranscriptEntries((prev) => [...prev, aiEntry]);

          // Speak the AI response
          await speakLiveResponse(data.text);
        } else if (data.type === "evaluation") {
          setEvaluation(data);
          setStep("feedback");
          cleanupLiveSession();
          toast({
            title: "Session Completed!",
            description: "Your interview is complete. View your scorecard below.",
          });
        }
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Session Error",
          description: e.message || "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        isProcessingAnswerRef.current = false;
      }
    },
    [selectedResumeInfo, jobDescription, targetRole, interviewConfig, speakLiveResponse],
  );

  // ─── Live Mode: Start live session ────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startLiveSession = useCallback(async () => {
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
    setTranscriptEntries([]);
    accumulatedTranscriptRef.current = "";
    isProcessingAnswerRef.current = false;

    try {
      // Initialize WebRTC session
      const manager = new InterviewSessionManager();
      sessionManagerRef.current = manager;

      const stream = await manager.startSession({ audio: true, video: true });
      setLiveMediaStream(stream);
      setIsLiveSession(true);
      setVideoPanelState("active");

      // Initialize silence detector
      silenceDetectorRef.current = createSilenceDetector(0.08, 2000);

      // Start continuous audio recording with chunk transcription
      manager.startRecording(async (blob) => {
        if (isProcessingAnswerRef.current) return;

        const result = await manager.transcribeChunk(
          blob,
          [targetRole, ...(selectedResumeInfo?.skills || []).map((s: any) => s.name)]
            .filter(Boolean)
            .join(","),
        );

        if (result.success && result.text.trim()) {
          accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? " " : "") + result.text.trim();
          setIsLiveListening(true);
        }
      }, 2000);

      // Get the first question from AI
      const res = await fetch("/api/ai/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResumeInfo || {},
          jobDescription,
          targetRole,
          messages: [],
          config: interviewConfig,
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize session");
      const data = await res.json();

      if (data.type === "question") {
        setCurrentQuestion(data.text);
        setMessages([{ role: "assistant", content: data.text }]);
        setStep("interviewing");

        const aiEntry: TranscriptEntry = {
          id: `ai-${Date.now()}`,
          speaker: "interviewer",
          text: data.text,
          timestamp: new Date(),
        };
        setTranscriptEntries([aiEntry]);

        // Speak the first question
        setTimeout(() => speakLiveResponse(data.text), 500);
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Live Session Failed",
        description: e.message || "Failed to start live interview. Check camera/mic permissions.",
        variant: "destructive",
      });
      cleanupLiveSession();
    } finally {
      setLoading(false);
    }
  }, [targetRole, selectedResumeInfo, jobDescription, interviewConfig, speakLiveResponse]);

  // ─── Live Mode: Cleanup ───────────────────────────────────────
  const cleanupLiveSession = useCallback(() => {
    sessionManagerRef.current?.cleanup();
    sessionManagerRef.current = null;
    silenceDetectorRef.current = null;
    isProcessingAnswerRef.current = false;
    accumulatedTranscriptRef.current = "";

    if (livePollingRef.current) {
      clearInterval(livePollingRef.current);
      livePollingRef.current = null;
    }

    liveTTSAudioRef.current?.pause();
    liveTTSAudioRef.current = null;

    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }

    setLiveMediaStream(null);
    setIsLiveSession(false);
    setVideoPanelState("idle");
    setLiveUserAudioLevel(0);
    setLiveAIAudioLevel(0);
    setIsLiveListening(false);
  }, []);

  // ─── Existing: Turn-based session start ────────────────────────
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
          config: interviewConfig,
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

  // ─── Existing: Submit answer (turn-based) ─────────────────────
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
          config: interviewConfig,
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

  // Recording triggers (turn-based)
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
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "answer.wav");
      formData.append("keyterms", [
        targetRole,
        ...(selectedResumeInfo?.skills || []).map((skill: any) => skill.name),
      ].filter(Boolean).join(","));

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

  // Handle step reset
  const handleReset = () => {
    cleanupLiveSession();
    setStep("setup");
    setMessages([]);
    setCurrentQuestion("");
    setUserAnswer("");
    setEvaluation(null);
  };

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
              onClick={handleReset}
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
        {/* ─── SETUP STEP ────────────────────────────────────────── */}
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
                {/* ─── Mode Toggle ──────────────────────────────── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Interview Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setInterviewMode("turn-based")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        interviewMode === "turn-based"
                          ? "border-indigo-500 bg-indigo-500/5 text-indigo-600"
                          : "border-border/50 bg-muted/20 text-muted-foreground hover:border-indigo-300"
                      )}
                    >
                      <MessageCircle size={20} />
                      <span className="text-xs font-bold">Turn-based</span>
                      <span className="text-[10px] opacity-70">Record & submit each answer</span>
                    </button>
                    <button
                      onClick={() => setInterviewMode("live")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        interviewMode === "live"
                          ? "border-violet-500 bg-violet-500/5 text-violet-600"
                          : "border-border/50 bg-muted/20 text-muted-foreground hover:border-violet-300"
                      )}
                    >
                      <Radio size={20} />
                      <span className="text-xs font-bold">Live Conversation</span>
                      <span className="text-[10px] opacity-70">Real-time video interview with AI</span>
                    </button>
                  </div>
                </div>

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
                      <option key={resume.documentId} value={resume.documentId}>
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

                <VoiceStudio value={voiceConfig} onChange={setVoiceConfig} />

                <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interview Design</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ConfigSelect
                      label="Format"
                      value={interviewConfig.interviewType}
                      options={["mixed", "behavioral", "technical", "case-study", "leadership"]}
                      onChange={(interviewType) => setInterviewConfig({ ...interviewConfig, interviewType })}
                    />
                    <ConfigSelect
                      label="Difficulty"
                      value={interviewConfig.difficulty}
                      options={["adaptive", "standard", "challenging", "expert"]}
                      onChange={(difficulty) => setInterviewConfig({ ...interviewConfig, difficulty })}
                    />
                    <ConfigSelect
                      label="Feedback"
                      value={interviewConfig.feedbackStyle}
                      options={["supportive", "direct", "strict"]}
                      onChange={(feedbackStyle) => setInterviewConfig({ ...interviewConfig, feedbackStyle })}
                    />
                  </div>
                  <label className="block space-y-2">
                    <span className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground"><span>Major Questions</span><span className="text-indigo-500">{interviewConfig.questionCount}</span></span>
                    <input type="range" min={2} max={10} value={interviewConfig.questionCount} onChange={(event) => setInterviewConfig({ ...interviewConfig, questionCount: Number(event.target.value) })} className="w-full accent-indigo-500" />
                  </label>
                </div>
              </div>

              <Button
                onClick={interviewMode === "live" ? startLiveSession : handleStartSession}
                disabled={loading}
                className={cn(
                  "w-full h-12 rounded-xl text-white font-bold gap-2 text-sm",
                  interviewMode === "live"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : interviewMode === "live" ? (
                  <>
                    <Radio size={16} />
                    Start Live Interview
                  </>
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

        {/* ─── INTERVIEWING STEP ────────────────────────────────── */}
        {step === "interviewing" && interviewMode === "turn-based" && (
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

                <div className="relative z-10 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{
                      scale: voiceState !== "idle" ? [1, 1.12, 1] : 1,
                      opacity: voiceState !== "idle" ? [0.35, 0.75, 0.35] : 0.45,
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute h-32 w-32 rounded-full bg-indigo-500 blur-2xl"
                  />
                  <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 shadow-xl shadow-indigo-500/20 backdrop-blur-md">
                    <AudioVisualizer state={voiceState} />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Question {questionIndex} of {interviewConfig.questionCount}</span>
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

        {/* ─── LIVE INTERVIEWING STEP ───────────────────────────── */}
        {step === "interviewing" && interviewMode === "live" && (
          <motion.div
            key="live-interviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Left: Video + AI Visualizer */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Video panel */}
              <PremiumPanel className="p-3">
                <VideoPanel
                  mediaStream={liveMediaStream}
                  state={videoPanelState}
                  isMuted={isLiveMuted}
                  onToggleMute={() => {
                    setIsLiveMuted(!isLiveMuted);
                    if (!isLiveMuted) {
                      window.speechSynthesis.cancel();
                      liveTTSAudioRef.current?.pause();
                    }
                  }}
                  isVideoOff={isVideoOff}
                  onToggleVideo={() => setIsVideoOff(!isVideoOff)}
                  isLive={isLiveSession}
                />
              </PremiumPanel>

              {/* AI visualizer + current question */}
              <PremiumPanel className="p-5">
                <div className="flex items-center gap-3 mb-3">
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
                </div>

                {currentQuestion && (
                  <div className="mt-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} />
                      AI Interviewer
                    </h3>
                    <p className="text-sm leading-relaxed font-bold text-slate-800 dark:text-slate-100">
                      {currentQuestion}
                    </p>
                  </div>
                )}

                {/* Live status bar */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                      Question {questionIndex} of {interviewConfig.questionCount}
                    </span>
                  </div>

                  {loading && (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Loader2 size={12} className="animate-spin text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500">Processing...</span>
                    </div>
                  )}
                </div>
              </PremiumPanel>
            </div>

            {/* Right: Live Transcript */}
            <PremiumPanel className="p-5 flex flex-col min-h-[500px] max-h-[700px]">
              <LiveTranscript
                entries={transcriptEntries}
                isListening={isLiveListening && !loading}
              />
            </PremiumPanel>
          </motion.div>
        )}

        {/* ─── FEEDBACK STEP ─────────────────────────────────────── */}
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

const ConfigSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <label className="space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs font-bold capitalize">
      {options.map((option) => <option key={option} value={option}>{option.replace("-", " ")}</option>)}
    </select>
  </label>
);

export default InterviewLab;
