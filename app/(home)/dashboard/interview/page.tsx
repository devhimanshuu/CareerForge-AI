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
  Link as LinkIcon,
  Zap,
  CheckCircle2,
  ChevronDown,
  SlidersHorizontal,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [jobUrl, setJobUrl] = useState("");
  const [isFetchingJob, setIsFetchingJob] = useState(false);
  const [jobFetched, setJobFetched] = useState(false);
  const [recentJobs, setRecentJobs] = useState<Array<{ url: string; title: string; company: string; timestamp: number }>>([]);
  const [showRecentJobs, setShowRecentJobs] = useState(false);
  const recentJobsRef = useRef<HTMLDivElement>(null);
  const [selectedResumeInfo, setSelectedResumeInfo] = useState<any>(null);
  const [interviewConfig, setInterviewConfig] = useState({
    interviewType: "mixed",
    difficulty: "adaptive",
    feedbackStyle: "supportive",
    questionCount: 4,
  });

  // Mode state
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("turn-based");

  // Dropdown state for setup panels (accordion: only one open at a time)
  const [designOpen, setDesignOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(false);

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
  const isProcessingAnswerRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const liveTTSAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAISpeakingRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const sendLiveToAIRef = useRef<((msgs: Message[]) => Promise<void>) | null>(null);
  const targetRoleRef = useRef(targetRole);
  const selectedResumeInfoRef = useRef(selectedResumeInfo);
  const jobDescriptionRef = useRef(jobDescription);
  const interviewConfigRef = useRef(interviewConfig);

  // Keep refs in sync with latest state
  useEffect(() => { targetRoleRef.current = targetRole; }, [targetRole]);
  useEffect(() => { selectedResumeInfoRef.current = selectedResumeInfo; }, [selectedResumeInfo]);
  useEffect(() => { jobDescriptionRef.current = jobDescription; }, [jobDescription]);
  useEffect(() => { interviewConfigRef.current = interviewConfig; }, [interviewConfig]);

  // Load recent jobs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("careerforge_recent_jobs");
      if (stored) {
        setRecentJobs(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Close recent jobs dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recentJobsRef.current && !recentJobsRef.current.contains(event.target as Node)) {
        setShowRecentJobs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!isLiveSession || step !== "interviewing") return;      const pollAudioLevel = () => {
      const manager = sessionManagerRef.current;
      if (!manager) return;

      const level = manager.getAudioLevel();
      setLiveUserAudioLevel(level);

      // Track if user has spoken at all (skip when AI is speaking)
      if (level > 0.1 && !isAISpeakingRef.current) {
        hasSpokenRef.current = true;
        setVideoPanelState("speaking");
      } else if (isLiveSession && !isAISpeakingRef.current) {
        setVideoPanelState("active");
      }

      // Silence detection — skip when AI is speaking or already processing
      if (silenceDetectorRef.current && !isProcessingAnswerRef.current && !isAISpeakingRef.current) {
        const silenceDetected = silenceDetectorRef.current.check(level);
        if (silenceDetected && hasSpokenRef.current) {
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

  // ─── Live Mode: Helper to restart recording for next answer ──────
  const restartRecordingForNextAnswer = useCallback(() => {
    hasSpokenRef.current = false;
    const mgr = sessionManagerRef.current;
    if (mgr && !isCleaningUpRef.current) {
      try {
        mgr.startRecording();
      } catch (err) {
        console.error("Failed to restart recording:", err);
      }
    }
  }, []);

  // ─── Live Mode: TTS for AI responses ──────────────────────────
  const speakLiveResponse = useCallback(
    async (text: string) => {
      if (isLiveMuted || typeof window === "undefined") {
        // Even when muted, restart recording for next answer
        restartRecordingForNextAnswer();
        return;
      }

      window.speechSynthesis.cancel();
      liveTTSAudioRef.current?.pause();

      let objectUrl = "";
      let cancelled = false;

      setVideoPanelState("idle");
      isAISpeakingRef.current = true;

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
            isAISpeakingRef.current = false;
            // Reset silence detector after AI finishes speaking
            silenceDetectorRef.current?.reset();
            // Restart recording for next user answer
            restartRecordingForNextAnswer();
          }
        };
        audio.onerror = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            restartRecordingForNextAnswer();
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
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            restartRecordingForNextAnswer();
          }
        };
        utterance.onerror = () => {
          if (!cancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            restartRecordingForNextAnswer();
          }
        };

        window.speechSynthesis.speak(utterance);
      }

      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    },
    [isLiveMuted, voiceConfig, restartRecordingForNextAnswer],
  );

  // ─── Live Mode: Transcribe accumulated audio and send to AI ──────
  const handleLiveAnswerComplete = useCallback(async () => {
    if (isProcessingAnswerRef.current) return;

    const manager = sessionManagerRef.current;
    if (!manager) return;

    isProcessingAnswerRef.current = true;
    silenceDetectorRef.current?.reset();
    hasSpokenRef.current = false;
    setIsLiveListening(false);
    setVideoPanelState("idle");

    try {
      // Stop recording and get full audio
      manager.stopRecording();
      const fullRecording = manager.getFullRecording();

      let answerText = "";

      // Transcribe the complete audio blob (has proper headers)
      if (fullRecording && fullRecording.size > 500) {
        const currentTargetRole = targetRoleRef.current;
        const currentSkills = selectedResumeInfoRef.current?.skills || [];
        const keyterms = [currentTargetRole, ...currentSkills.map((s: any) => s.name)]
          .filter(Boolean)
          .join(",");

        try {
          const result = await manager.transcribeChunk(fullRecording, keyterms);
          if (result.success && result.text.trim()) {
            answerText = result.text.trim();
          }
        } catch (err) {
          console.error("Transcription failed:", err);
        }
      }

      if (!answerText) {
        // No answer captured — restart recording and wait for user
        isProcessingAnswerRef.current = false;
        restartRecordingForNextAnswer();
        return;
      }

      // Add user entry to transcript
      const userEntry: TranscriptEntry = {
        id: `user-${Date.now()}`,
        speaker: "user",
        text: answerText,
        timestamp: new Date(),
      };
      setTranscriptEntries((prev) => [...prev, userEntry]);

      // Update messages for AI context and send to AI
      const userMsg: Message = { role: "user", content: answerText };
      setMessages((prev) => {
        const updated = [...prev, userMsg];
        sendLiveToAIRef.current?.(updated);
        return updated;
      });
    } catch (err) {
      console.error("Error in handleLiveAnswerComplete:", err);
      isProcessingAnswerRef.current = false;
      restartRecordingForNextAnswer();
    }
  }, [restartRecordingForNextAnswer]);

  // ─── Live Mode: Manual "Done Speaking" handler ─────────────────
  const handleDoneSpeaking = useCallback(() => {
    if (isProcessingAnswerRef.current) return;
    if (!hasSpokenRef.current) {
      toast({
        title: "Nothing to submit",
        description: "Please speak your answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    handleLiveAnswerComplete();
  }, [handleLiveAnswerComplete]);

  // ─── Live Mode: Send transcript to AI ─────────────────────────
  const sendLiveToAI = useCallback(
    async (currentMessages: Message[]) => {
      setLoading(true);

      try {
        const res = await fetch("/api/ai/interview-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeData: selectedResumeInfoRef.current || {},
            jobDescription: jobDescriptionRef.current,
            targetRole: targetRoleRef.current,
            messages: currentMessages,
            config: interviewConfigRef.current,
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
    [speakLiveResponse, cleanupLiveSession],
  );

  // Keep the ref in sync with the latest sendLiveToAI
  useEffect(() => {
    sendLiveToAIRef.current = sendLiveToAI;
  }, [sendLiveToAI]);

  // ─── Live Mode: Cleanup ───────────────────────────────────────
  const cleanupLiveSession = useCallback(() => {
    // Guard against double-cleanup
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    sessionManagerRef.current?.cleanup();
    sessionManagerRef.current = null;
    silenceDetectorRef.current = null;
    isProcessingAnswerRef.current = false;
    hasSpokenRef.current = false;

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

  // ─── Live Mode: Start live session ────────────────────────────
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
    isProcessingAnswerRef.current = false;
    hasSpokenRef.current = false;
    isCleaningUpRef.current = false;

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

      // Start continuous audio recording (batch transcription on silence/done)
      manager.startRecording();

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
      let description = e.message || "Failed to start live interview.";
      if (e.name === "NotAllowedError" || e.message?.includes("permission")) {
        description = "Camera/microphone access was denied. Please allow permissions and try again.";
      } else if (e.name === "NotFoundError") {
        description = "No camera or microphone found. Please connect a device and try again.";
      } else if (e.name === "NotReadableError") {
        description = "Camera/microphone is already in use by another application.";
      }
      toast({
        title: "Live Session Failed",
        description,
        variant: "destructive",
      });
      cleanupLiveSession();
    } finally {
      setLoading(false);
    }
  }, [targetRole, selectedResumeInfo, jobDescription, interviewConfig, speakLiveResponse, cleanupLiveSession]);

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
    setJobUrl("");
    setJobFetched(false);
    setIsFetchingJob(false);
    setShowRecentJobs(false);
  };

  // ─── Auto-fill job from URL ──────────────────────────────────
  const handleAutoFillJob = async () => {
    if (!jobUrl.trim()) return;
    setIsFetchingJob(true);
    try {
      // Validate URL format
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(jobUrl.trim());
      } catch {
        throw new Error("Please enter a valid URL (e.g. https://linkedin.com/jobs/...)"
        );
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only http and https URLs are supported");
      }

      // Step 1: Fetch raw text from URL
      const fetchRes = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      if (!fetchRes.ok) throw new Error("Failed to fetch URL content");
      const fetchData = await fetchRes.json();
      if (!fetchData.text) throw new Error("No content extracted from URL");

      // Step 2: AI extract structured job details
      const extractRes = await fetch("/api/ai/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fetchData.text }),
      });
      if (!extractRes.ok) throw new Error("Failed to extract job details");
      const extractData = await extractRes.json();

      // Step 3: Auto-fill form fields
      if (extractData.jobTitle) setTargetRole(extractData.jobTitle);
      if (extractData.jobDescription) setJobDescription(extractData.jobDescription);
      setJobFetched(true);

      // Step 4: Save to recent jobs
      const newJob = {
        url: jobUrl.trim(),
        title: extractData.jobTitle || "Unknown Position",
        company: extractData.company || "Unknown Company",
        timestamp: Date.now(),
      };
      setRecentJobs((prev) => {
        const filtered = prev.filter((j) => j.url !== newJob.url);
        const updated = [newJob, ...filtered].slice(0, 10);
        localStorage.setItem("careerforge_recent_jobs", JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "Job Details Extracted",
        description: extractData.company
          ? `Auto-filled from ${extractData.company}${extractData.location ? ` (${extractData.location})` : ""}`
          : "Job details have been auto-filled successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Extraction Failed",
        description: err.message || "Could not extract job details. Try pasting the description manually.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingJob(false);
    }
  };

  // Select a recent job to auto-fill
  const handleSelectRecentJob = (job: { url: string; title: string; company: string }) => {
    setJobUrl(job.url);
    setTargetRole(job.title);
    setJobFetched(false);
    setShowRecentJobs(false);
    toast({
      title: "Job Selected",
      description: `Loaded ${job.title} from ${job.company}`,
    });
  };

  // Remove a recent job
  const handleRemoveRecentJob = (url: string) => {
    setRecentJobs((prev) => {
      const updated = prev.filter((j) => j.url !== url);
      localStorage.setItem("careerforge_recent_jobs", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all recent jobs
  const handleClearRecentJobs = () => {
    setRecentJobs([]);
    localStorage.removeItem("careerforge_recent_jobs");
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
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
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
        <PremiumStatCard
          icon={<Radio size={18} />}
          label="Interview Mode"
          value={interviewMode === "live" ? "Live" : "Turn"}
          detail={interviewMode === "live" ? "Real-time conversation" : "Record & submit"}
          tone="slate"
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
            className="w-full"
          >
            {/* Landscape header card */}
            <PremiumPanel className="p-6 md:p-8 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                    <Play size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">Configure Mock Interview</h2>
                    <p className="text-xs text-muted-foreground">Setup target role, background parameters, and interview style.</p>
                  </div>
                </div>
                {/* Quick Mode Switcher */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/30 border border-border/50">
                  <button
                    onClick={() => setInterviewMode("turn-based")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
                      interviewMode === "turn-based"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageCircle size={14} />
                    Turn-based
                  </button>
                  <button
                    onClick={() => setInterviewMode("live")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
                      interviewMode === "live"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Radio size={14} />
                    Live Conversation
                  </button>
                </div>
              </div>
            </PremiumPanel>

            {/* Landscape two-column setup form */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Left: Form fields (3/5 width) */}
              <PremiumPanel className="lg:col-span-3 p-6 md:p-8 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                <div className="space-y-4">
                  {/* Job Link Auto-fill */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Job Posting Link (Auto-fill)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Paste job link (LinkedIn, Indeed, etc.)"
                          value={jobUrl}
                          onChange={(e) => {
                            setJobUrl(e.target.value);
                            setJobFetched(false);
                          }}
                          className="h-11 rounded-xl pl-9"
                        />
                      </div>
                      <Button
                        onClick={handleAutoFillJob}
                        disabled={isFetchingJob || !jobUrl.trim()}
                        className="h-11 rounded-xl px-4 gap-2 shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
                      >
                        {isFetchingJob ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : jobFetched ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Zap size={14} />
                        )}
                        {isFetchingJob ? "Extracting..." : jobFetched ? "Done" : "Auto-fill"}
                      </Button>
                    </div>
                    {jobFetched && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 size={10} /> Job details extracted and filled below
                      </motion.p>
                    )}
                  </div>

                  {/* Recent Jobs History */}
                  {recentJobs.length > 0 && (
                    <div ref={recentJobsRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setShowRecentJobs(!showRecentJobs)}
                        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Clock size={12} />
                        Recent Jobs ({recentJobs.length})
                        <motion.div animate={{ rotate: showRecentJobs ? 180 : 0 }} transition={{ duration: 0.15 }}>
                          <ChevronDown size={10} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {showRecentJobs && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 rounded-xl border bg-muted/30 divide-y divide-border/50 max-h-[240px] overflow-y-auto">
                              {recentJobs.map((job) => (
                                <div
                                  key={job.url}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleSelectRecentJob(job)}
                                    className="flex-1 text-left min-w-0"
                                  >
                                    <p className="text-xs font-bold text-foreground truncate">
                                      {job.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {job.company} · {new URL(job.url).hostname.replace("www.", "")}
                                    </p>
                                  </button>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectRecentJob(job)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                                      title="Use this job"
                                    >
                                      <Zap size={12} />
                                    </button>
                                    <a
                                      href={job.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                      title="Open in new tab"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink size={11} />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveRecentJob(job.url);
                                      }}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remove from history"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleClearRecentJobs}
                              className="mt-2 text-[10px] font-bold text-destructive hover:text-destructive/80 transition-colors"
                            >
                              Clear all history
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Context Resume (Optional)
                    </label>
                    <Select value={selectedResumeId || undefined} onValueChange={(v) => setSelectedResumeId(v || "")}>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border/70">
                        <SelectValue placeholder="No resume context (pure interview)" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume: any) => (
                          <SelectItem key={resume.documentId} value={resume.documentId}>
                            {resume.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Target Job Title
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
                      Target Job Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Paste the Job Description to tailor the interview questions specifically to the position..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[120px] rounded-xl resize-none"
                    />
                  </div>
                </div>

                <Button
                  onClick={interviewMode === "live" ? startLiveSession : handleStartSession}
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-xl text-white font-bold gap-2 text-sm shadow-lg",
                    interviewMode === "live"
                      ? "bg-violet-600 hover:bg-violet-700 shadow-violet-500/25"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
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

              {/* Right: Config & Voice (2/5 width) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Interview Design Dropdown */}
                <PremiumPanel className="relative overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (!designOpen) {
                        setVoiceOpen(false);
                      }
                      setDesignOpen(!designOpen);
                    }}
                    className="w-full flex items-center justify-between p-5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <SlidersHorizontal size={14} className="text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Interview Design</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {interviewConfig.interviewType} · {interviewConfig.difficulty} · {interviewConfig.questionCount}Q&apos;s
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: designOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {designOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4">
                          <div className="grid grid-cols-1 gap-3">
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
                              label="Feedback Style"
                              value={interviewConfig.feedbackStyle}
                              options={["supportive", "direct", "strict"]}
                              onChange={(feedbackStyle) => setInterviewConfig({ ...interviewConfig, feedbackStyle })}
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>Major Questions</span>
                              <span className="text-indigo-500 tabular-nums">{interviewConfig.questionCount}</span>
                            </span>
                            <input
                              type="range"
                              min={2}
                              max={10}
                              value={interviewConfig.questionCount}
                              onChange={(event) => setInterviewConfig({ ...interviewConfig, questionCount: Number(event.target.value) })}
                              className="w-full accent-indigo-500"
                            />
                            <div className="flex justify-between text-[9px] font-bold text-muted-foreground/50">
                              <span>Quick (2)</span>
                              <span>Deep (10)</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumPanel>

                {/* Voice Studio Dropdown */}
                <PremiumPanel className="relative overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (!voiceOpen) {
                        setDesignOpen(false);
                      }
                      setVoiceOpen(!voiceOpen);
                    }}
                    className="w-full flex items-center justify-between p-5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Volume2 size={14} className="text-violet-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Recruiter Voice Studio</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {voiceConfig.role === "recruiter" ? "Professional Recruiter" : voiceConfig.role === "technical" ? "Technical Interviewer" : voiceConfig.role === "executive" ? "Executive Interviewer" : "Career Coach"} · {voiceConfig.speed.toFixed(1)}x speed
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: voiceOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {voiceOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <VoiceStudio value={voiceConfig} onChange={setVoiceConfig} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumPanel>

                {/* Mode description card */}
                <PremiumPanel className={cn(
                  "p-5 relative overflow-hidden transition-all duration-300",
                  interviewMode === "live"
                    ? "border-violet-500/30 bg-violet-500/5"
                    : "border-indigo-500/30 bg-indigo-500/5"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      interviewMode === "live"
                        ? "bg-violet-500/10 text-violet-500"
                        : "bg-indigo-500/10 text-indigo-500"
                    )}>
                      {interviewMode === "live" ? <Radio size={18} /> : <MessageCircle size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {interviewMode === "live" ? "Live Conversation Mode" : "Turn-based Mode"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        {interviewMode === "live"
                          ? "Real-time video interview with AI. Your camera and mic will be activated for a natural conversation flow."
                          : "Record and submit each answer individually. Type or speak your responses at your own pace."
                        }
                      </p>
                    </div>
                  </div>
                </PremiumPanel>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── INTERVIEWING STEP (Turn-based) ──────────────────── */}
        {step === "interviewing" && interviewMode === "turn-based" && (
          <motion.div
            key="interviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Landscape interviewing layout: video + question on left, answer + logs on right */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Left: Video feed + Question (wider) */}
              <div className="xl:col-span-8 flex flex-col gap-5">
                {/* Video / Visualizer - landscape aspect ratio */}
                <PremiumPanel className="flex flex-col relative overflow-hidden">
                  <div className="w-full aspect-video lg:aspect-[16/7] relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

                    {/* Top bar */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Question {questionIndex} of {interviewConfig.questionCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30">
                          <Sparkles size={10} className="text-indigo-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">AI Recruiter</span>
                        </div>
                      </div>
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
                  <div className="space-y-3 flex-1">
                    <div className="relative">
                      <Textarea
                        placeholder="Type your structured STAR answer here, or click 'Record Audio' to respond verbally..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
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
                          onClick={stopRecording}
                          className="sm:flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 font-bold transition-all shadow-md shadow-red-500/10"
                        >
                          <StopCircle size={16} />
                          Stop Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={startRecording}
                          disabled={loading || transcribing}
                          variant="outline"
                          className="sm:flex-1 h-11 rounded-xl gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold"
                        >
                          <Mic size={16} />
                          Record Audio
                        </Button>
                      )}
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={loading || transcribing || !userAnswer.trim()}
                        className="sm:flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 text-sm shadow-lg shadow-indigo-500/15"
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
                </PremiumPanel>
              </div>

              {/* Right: Session Logs */}
              <PremiumPanel className="xl:col-span-4 p-5 flex flex-col min-h-[400px] max-h-[700px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b pb-3">
                  <MessageSquare size={14} />
                  Session Logs
                  <span className="ml-auto text-[9px] font-bold bg-muted/50 px-2 py-0.5 rounded-full">
                    {messages.filter(m => m.role === "assistant").length} Q&apos;s
                  </span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
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
                          : "bg-muted text-muted-foreground ml-6"
                      )}
                    >
                      <span className="block font-black text-[9px] uppercase tracking-widest opacity-60 mb-1">
                        {m.role === "assistant" ? "Interviewer" : "Candidate"}
                      </span>
                      {m.content}
                    </motion.div>
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
            className="w-full"
          >
            {/* Landscape live interview layout */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Left: Video + AI Visualizer (wider) */}
              <div className="xl:col-span-8 flex flex-col gap-5">
                {/* Video panel - landscape aspect ratio */}
                <PremiumPanel className="p-2 relative overflow-hidden">
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
                        onClick={handleDoneSpeaking}
                        disabled={loading || isProcessingAnswerRef.current}
                        size="sm"
                        className="h-8 rounded-lg px-3 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold shadow-md shadow-violet-500/20"
                      >
                        <CheckCircle2 size={12} />
                        Done Speaking
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
        )}

        {/* ─── FEEDBACK STEP ─────────────────────────────────────── */}
        {step === "feedback" && evaluation && (
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
                  <p className="text-3xl font-black text-violet-500 mt-1">{Math.round((evaluation.deliveryScore + evaluation.contentScore) / 2)}%</p>
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
  <div className="space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 rounded-lg text-xs font-bold capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-xs font-bold capitalize">
            {option.replace("-", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default InterviewLab;
