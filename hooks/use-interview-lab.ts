"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import useGetDocuments from "@/features/document/use-get-document";
import VoiceStudio, {
  createElevenLabsAudio,
  defaultVoiceStudioConfig,
  VoiceStudioConfig,
} from "@/components/audio/VoiceStudio";
import { TranscriptEntry } from "@/components/interview/LiveTranscript";
import {
  InterviewSessionManager,
  createSilenceDetector,
} from "@/lib/webrtc-interview";
import { useInterviewMonitoring } from "@/hooks/use-interview-monitoring";

// ─── Types ────────────────────────────────────────────────────────────────

export type InterviewMode = "turn-based" | "live";

export interface Message {
  role: "assistant" | "user";
  content: string;
}

export interface InterviewConfig {
  interviewType: string;
  difficulty: string;
  feedbackStyle: string;
  questionCount: number;
}

export interface RecentJob {
  url: string;
  title: string;
  company: string;
  timestamp: number;
}

export interface EvaluationData {
  type: string;
  deliveryScore: number;
  contentScore: number;
  findings: string[];
  actionItems: string[];
  summary: string;
  [key: string]: unknown;
}

export interface PastSession {
  id: string;
  targetRole: string;
  status: string;
  deliveryScore: number | null;
  contentScore: number | null;
  interviewType: string;
  difficulty: string;
  createdAt: string;
  evaluationData?: string;
  turns?: Array<{ questionText: string; answerText?: string }>;
}

export interface UseInterviewLabReturn {
  // Setup state
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  jobUrl: string;
  setJobUrl: (url: string) => void;
  isFetchingJob: boolean;
  jobFetched: boolean;
  setJobFetched: (v: boolean) => void;
  recentJobs: RecentJob[];
  showRecentJobs: boolean;
  setShowRecentJobs: (v: boolean) => void;
  recentJobsRef: React.RefObject<HTMLDivElement>;
  shortcutsRef: React.RefObject<HTMLDivElement>;
  selectedResumeInfo: any;
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;

  // Mode
  interviewMode: InterviewMode;
  setInterviewMode: (mode: InterviewMode) => void;

  // Dropdowns
  designOpen: boolean;
  setDesignOpen: (v: boolean) => void;
  voiceOpen: boolean;
  setVoiceOpen: (v: boolean) => void;

  // Session
  step: "setup" | "interviewing" | "feedback";
  setStep: (step: "setup" | "interviewing" | "feedback") => void;
  messages: Message[];
  currentQuestion: string;
  userAnswer: string;
  setUserAnswer: (v: string) => void;
  loading: boolean;

  // Audio recording (turn-based)
  isRecording: boolean;
  recordingTime: number;
  transcribing: boolean;

  // Evaluation
  evaluation: EvaluationData | null;

  // TTS
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  isTTSGenerating: boolean;
  voiceConfig: VoiceStudioConfig;
  setVoiceConfig: (config: VoiceStudioConfig) => void;

  // Past sessions
  pastSessions: PastSession[];
  isLoadingSessions: boolean;
  sessionToDelete: PastSession | null;
  setSessionToDelete: (v: PastSession | null) => void;
  isDeletingSession: boolean;
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
  canScrollUp: boolean;
  canScrollDown: boolean;

  // Live mode
  isLiveSession: boolean;
  liveMediaStream: MediaStream | null;
  isVideoOff: boolean;
  setIsVideoOff: (v: boolean) => void;
  isLiveMuted: boolean;
  setIsLiveMuted: (v: boolean) => void;
  transcriptEntries: TranscriptEntry[];
  isLiveListening: boolean;
  isProcessingAnswer: boolean;
  liveUserAudioLevel: number;
  liveAIAudioLevel: number;
  videoPanelState: "idle" | "active" | "speaking";

  // Refs needed by JSX
  sessionLogsRef: React.RefObject<HTMLDivElement>;
  liveTTSAudioRef: React.MutableRefObject<HTMLAudioElement | null>;

  // Derived
  questionIndex: number;
  voiceState: "idle" | "listening" | "speaking" | "thinking";

  // Resumes
  resumes: any[];

  // Actions
  handleStartSession: () => Promise<void>;
  startLiveSession: () => Promise<void>;
  handleSubmitAnswer: () => Promise<void>;
  handleTurnBasedEndSession: () => Promise<void>;
  handleEndSession: () => Promise<void>;
  handleDoneSpeaking: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handleReset: () => void;
  handleAutoFillJob: () => Promise<void>;
  handleSelectRecentJob: (job: RecentJob) => void;
  handleRemoveRecentJob: (url: string) => void;
  handleClearRecentJobs: () => void;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  handleLoadPastSession: (session: PastSession) => void;
  formatTime: (seconds: number) => string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useInterviewLab(): UseInterviewLabReturn {
  // Resumes list
  const { data: resumeData } = useGetDocuments();
  const resumes = resumeData?.data || [];

  // Setup state
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isFetchingJob, setIsFetchingJob] = useState(false);
  const [jobFetched, setJobFetched] = useState(false);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [showRecentJobs, setShowRecentJobs] = useState(false);
const recentJobsRef = useRef<HTMLDivElement>(null);
const shortcutsRef = useRef<HTMLDivElement>(null);
  const [selectedResumeInfo, setSelectedResumeInfo] = useState<any>(null);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>({
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

  // Audio recording state (turn-based)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const audioMimeType = useRef<string>("audio/webm");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Final evaluation state
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);

  // Recruiter voice synthesis
  const [isMuted, setIsMuted] = useState(false);
  const [isTTSGenerating, setIsTTSGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState<VoiceStudioConfig>(defaultVoiceStudioConfig);
  const recruiterAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Interview History State ────────────────────────────────────
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<PastSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // ─── Live Mode State ────────────────────────────────────────────
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [liveMediaStream, setLiveMediaStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLiveMuted, setIsLiveMuted] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [liveUserAudioLevel, setLiveUserAudioLevel] = useState(0);
  const [liveAIAudioLevel, setLiveAIAudioLevel] = useState(0);
  const [videoPanelState, setVideoPanelState] = useState<"idle" | "active" | "speaking">("idle");

  // ─── Refs ─────────────────────────────────────────────────────────
  const sessionManagerRef = useRef<InterviewSessionManager | null>(null);
  const silenceDetectorRef = useRef<ReturnType<typeof createSilenceDetector> | null>(null);
  const livePollingRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingAnswerRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const liveTTSAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAISpeakingRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const sendLiveToAIRef = useRef<((msgs: Message[]) => Promise<void>) | null>(null);
  const handleLiveAnswerCompleteRef = useRef<(() => Promise<void>) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const targetRoleRef = useRef(targetRole);
  const selectedResumeInfoRef = useRef(selectedResumeInfo);
  const jobDescriptionRef = useRef(jobDescription);
  const interviewConfigRef = useRef(interviewConfig);

  // Refs for keyboard shortcut handlers to avoid stale closures
  const handleEndSessionRef = useRef<(() => void) | null>(null);
  const handleTurnBasedEndSessionRef = useRef<(() => void) | null>(null);
  const handleSubmitAnswerRef = useRef<(() => void) | null>(null);
  const handleResetRef = useRef<(() => void) | null>(null);
  const cleanupLiveSessionRef = useRef<(() => void) | null>(null);
  const sessionLogsRef = useRef<HTMLDivElement>(null);

  // Browser Speech Recognition refs for fallback
  const recognitionRef = useRef<any>(null);
  const localTranscriptRef = useRef<string>("");
  const cancelCurrentTTS = useRef<(() => void) | null>(null);

  // ─── Live Mode Monitoring ─────────────────────────────────────
  const { trackAudioEvent, startSpeakingTimer, stopSpeakingTimer, clearMonitoring } =
    useInterviewMonitoring(
      useCallback(() => {
        // Force-trigger handleLiveAnswerComplete if user has been speaking >30s
        handleLiveAnswerCompleteRef.current?.();
      }, []),
    );

  // ─── Keep refs in sync with latest state ────────────────────────
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { targetRoleRef.current = targetRole; }, [targetRole]);
  useEffect(() => { selectedResumeInfoRef.current = selectedResumeInfo; }, [selectedResumeInfo]);
  useEffect(() => { jobDescriptionRef.current = jobDescription; }, [jobDescription]);
  useEffect(() => { interviewConfigRef.current = interviewConfig; }, [interviewConfig]);

  // ─── Browser Speech Recognition helpers ─────────────────────────
  const startLocalSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    localTranscriptRef.current = "";
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      localTranscriptRef.current = (finalTranscript + " " + interimTranscript).trim();
    };

    rec.onerror = (event: any) => {
      console.warn("Local speech recognition error:", event.error);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error("Failed to start local SpeechRecognition:", err);
    }
  }, []);

  const stopLocalSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  // ─── Effects ──────────────────────────────────────────────────────

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

  // Fetch past interview sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const res = await fetch("/api/ai/interview-sessions");
        const data = await res.json();
        if (data.success) {
          setPastSessions(data.sessions || []);
        }
      } catch {
        // Ignore errors silently
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchSessions();
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

  // Update scroll indicators visibility
  useEffect(() => {
    const container = sessionLogsRef.current;
    if (!container) return;
    const update = () => {
      setCanScrollUp(container.scrollTop > 4);
      setCanScrollDown(container.scrollTop < container.scrollHeight - container.clientHeight - 4);
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, []);

  // Close shortcuts panel when clicking outside or pressing Escape
  useEffect(() => {
    if (!showShortcuts) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(event.target as Node)) {
        setShowShortcuts(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowShortcuts(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showShortcuts]);

  // ─── Derived voice state ──────────────────────────────────────────
  const voiceState: "idle" | "listening" | "speaking" | "thinking" = loading
    ? "thinking"
    : isRecording || transcribing
      ? "listening"
      : isSpeaking
        ? "speaking"
        : "idle";

  // ─── TTS Effect (turn-based) ──────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion || isMuted || typeof window === "undefined" || step !== "interviewing") return;
    if (interviewMode === "live") return; // Live mode has its own TTS

    window.speechSynthesis.cancel();
    recruiterAudioRef.current?.pause();
    let objectUrl = "";
    let cancelled = false;

    const speak = async () => {
      setIsSpeaking(true);
      setIsTTSGenerating(true);
      try {
        objectUrl = await createElevenLabsAudio(currentQuestion, voiceConfig);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setIsTTSGenerating(false);
        const audio = new Audio(objectUrl);
        recruiterAudioRef.current = audio;
        audio.onended = () => !cancelled && setIsSpeaking(false);
        audio.onerror = () => !cancelled && setIsSpeaking(false);
        await audio.play();
      } catch {
        if (cancelled) return;
        setIsTTSGenerating(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Audio timer (turn-based)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupLiveSessionRef.current?.();
    };
  }, []);

  // Keep sendLiveToAI ref in sync after it's defined
  // (This effect will be placed after sendLiveToAI is declared)

  // ─── Live Mode: Audio Level Polling ────────────────────────────
  useEffect(() => {
    if (!isLiveSession || step !== "interviewing") return;

    const pollAudioLevel = () => {
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

      // Track speaking start/stop for prolonged-speaking watchdog
      if (level > 0.1 && !isAISpeakingRef.current) {
        startSpeakingTimer();
      } else {
        stopSpeakingTimer();
      }

      // Silence detection — skip when AI is speaking or already processing
      if (silenceDetectorRef.current && !isProcessingAnswerRef.current && !isAISpeakingRef.current) {
        const silenceDetected = silenceDetectorRef.current.check(level);
        if (silenceDetected && hasSpokenRef.current) {
          trackAudioEvent({ type: "silence_detected", silenceDurationMs: 2000 });
          handleLiveAnswerCompleteRef.current?.();
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

  // ─── Keyboard Shortcuts ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sessionToDelete) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Escape → Close shortcuts panel or reset to setup
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (step !== "setup") {
          e.preventDefault();
          handleResetRef.current?.();
          return;
        }
      }

      // Arrow Up/Down → Scroll session logs panel
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && step === "interviewing" && !isMod) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        const container = sessionLogsRef.current;
        if (container) {
          e.preventDefault();
          const scrollAmount = 60;
          container.scrollBy({ top: e.key === "ArrowDown" ? scrollAmount : -scrollAmount, behavior: "smooth" });
        }
        return;
      }

      // Only active during the interviewing step for remaining shortcuts
      if (step !== "interviewing") return;

      // Cmd/Ctrl+Enter → End session (both modes)
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        if (interviewMode === "live") {
          handleEndSessionRef.current?.();
        } else {
          handleTurnBasedEndSessionRef.current?.();
        }
        return;
      }

      // Enter (without Shift) → Submit answer (turn-based only)
      if (e.key === "Enter" && !isMod && !e.shiftKey && interviewMode === "turn-based") {
        const target = e.target as HTMLElement;
        const isAnswerTextarea = target.tagName === "TEXTAREA" && target.closest("[data-submit-on-enter]");
        if (!isAnswerTextarea) return;
        e.preventDefault();
        handleSubmitAnswerRef.current?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, interviewMode, sessionToDelete, showShortcuts]);

  // ─── Live Mode: Helper to restart recording for next answer ──────
  const restartRecordingForNextAnswer = useCallback(() => {
    hasSpokenRef.current = false;
    const mgr = sessionManagerRef.current;
    if (mgr && !isCleaningUpRef.current) {
      try {
        mgr.startRecording();
        startLocalSpeechRecognition();
      } catch (err) {
        console.error("Failed to restart recording:", err);
      }
    }
  }, [startLocalSpeechRecognition]);

  // ─── Live Mode: Cleanup ───────────────────────────────────────
  const cleanupLiveSession = useCallback((endReason?: "manual" | "error" | "completed") => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    if (endReason) {
      trackAudioEvent({ type: "session_end", reason: endReason });
    }
    clearMonitoring();

    sessionManagerRef.current?.cleanup();
    sessionManagerRef.current = null;
    silenceDetectorRef.current = null;
    isProcessingAnswerRef.current = false;
    hasSpokenRef.current = false;
    stopLocalSpeechRecognition();

    if (cancelCurrentTTS.current) {
      cancelCurrentTTS.current();
      cancelCurrentTTS.current = null;
    }

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
  }, [stopLocalSpeechRecognition, trackAudioEvent, clearMonitoring]);

  // Keep cleanupLiveSession ref in sync
  cleanupLiveSessionRef.current = cleanupLiveSession;

  // ─── Live Mode: TTS for AI responses ──────────────────────────
  const speakLiveResponse = useCallback(
    async (text: string) => {
      if (isLiveMuted || typeof window === "undefined") {
        trackAudioEvent({ type: "tts_muted_skip" });
        restartRecordingForNextAnswer();
        return;
      }

      if (cancelCurrentTTS.current) {
        cancelCurrentTTS.current();
      }

      window.speechSynthesis.cancel();
      liveTTSAudioRef.current?.pause();

      let objectUrl = "";
      let localCancelled = false;

      cancelCurrentTTS.current = () => {
        localCancelled = true;
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // Ignore
          }
        }
      };

      setVideoPanelState("idle");
      isAISpeakingRef.current = true;
      setIsTTSGenerating(true);
      const ttsStartTime = Date.now();

      try {
        objectUrl = await createElevenLabsAudio(text, voiceConfig);
        setIsTTSGenerating(false);
        if (localCancelled) return;

        const audio = new Audio(objectUrl);
        liveTTSAudioRef.current = audio;

        audio.onplay = () => {
          if (!localCancelled) {
            setVideoPanelState("idle");
            setLiveAIAudioLevel(0.7);
          }
        };
        audio.onended = () => {
          if (!localCancelled) {
            URL.revokeObjectURL(objectUrl);
            trackAudioEvent({ type: "tts_success", durationMs: Date.now() - ttsStartTime });
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            setIsLiveListening(true);
            restartRecordingForNextAnswer();
          }
        };
        audio.onerror = () => {
          if (!localCancelled) {
            URL.revokeObjectURL(objectUrl);
            trackAudioEvent({ type: "tts_error", error: "audio playback error", usedFallback: false });
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            setIsLiveListening(true);
            restartRecordingForNextAnswer();
          }
        };

        await audio.play();
      } catch {
        if (localCancelled) {
          trackAudioEvent({ type: "tts_cancelled" });
          return;
        }
        setIsTTSGenerating(false);
        trackAudioEvent({ type: "tts_error", error: "ElevenLabs failed, using fallback", usedFallback: true });
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceConfig.speed;

        utterance.onstart = () => {
          if (!localCancelled) {
            setLiveAIAudioLevel(0.7);
          }
        };
        utterance.onend = () => {
          if (!localCancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            setIsLiveListening(true);
            restartRecordingForNextAnswer();
          }
        };
        utterance.onerror = () => {
          if (!localCancelled) {
            setLiveAIAudioLevel(0);
            setVideoPanelState("active");
            isAISpeakingRef.current = false;
            silenceDetectorRef.current?.reset();
            setIsLiveListening(true);
            restartRecordingForNextAnswer();
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    },
    [isLiveMuted, voiceConfig, restartRecordingForNextAnswer],
  );

  // ─── Live Mode: Transcribe accumulated audio and send to AI ──────
  const handleLiveAnswerComplete = useCallback(async () => {
    if (isProcessingAnswerRef.current) return;

    const manager = sessionManagerRef.current;
    if (!manager) return;

    isProcessingAnswerRef.current = true;
    setIsProcessingAnswer(true);
    silenceDetectorRef.current?.reset();
    hasSpokenRef.current = false;
    setIsLiveListening(false);
    setVideoPanelState("idle");

    try {
      await manager.stopRecordingAsync();
      stopLocalSpeechRecognition();
      const fullRecording = manager.getFullRecording();

      let answerText = "";

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
            trackAudioEvent({
              type: "transcribe_success",
              audioSize: fullRecording.size,
              textLength: answerText.length,
            });
          } else {
            trackAudioEvent({
              type: "transcribe_error",
              error: result.error || "empty result",
            });
          }
        } catch (err) {
          console.error("Transcription failed:", err);
          trackAudioEvent({
            type: "transcribe_error",
            error: err instanceof Error ? err.message : "unknown error",
          });
        }
      } else if (fullRecording && fullRecording.size <= 500) {
        trackAudioEvent({ type: "transcribe_small_blob", size: fullRecording.size });
      }

      // Fallback to client-side SpeechRecognition
      if (!answerText && localTranscriptRef.current.trim()) {
        answerText = localTranscriptRef.current.trim();
        trackAudioEvent({ type: "transcribe_fallback", textLength: answerText.length });
        toast({
          title: "Speech Recognition Fallback",
          description: "Server transcription failed. Used browser native speech recognition instead.",
        });
      }

      if (!answerText) {
        trackAudioEvent({ type: "transcribe_empty_audio" });
        isProcessingAnswerRef.current = false;
        setIsProcessingAnswer(false);
        setIsLiveListening(true);
        restartRecordingForNextAnswer();
        return;
      }

      const userEntry: TranscriptEntry = {
        id: `user-${Date.now()}`,
        speaker: "user",
        text: answerText,
        timestamp: new Date(),
      };
      setTranscriptEntries((prev) => [...prev, userEntry]);

      const userMsg: Message = { role: "user", content: answerText };
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      sendLiveToAIRef.current?.(updatedMessages);
    } catch (err) {
      console.error("Error in handleLiveAnswerComplete:", err);
      isProcessingAnswerRef.current = false;
      setIsProcessingAnswer(false);
      setIsLiveListening(true);
      restartRecordingForNextAnswer();
    }
  }, [restartRecordingForNextAnswer, stopLocalSpeechRecognition]);

  // Keep ref in sync
  handleLiveAnswerCompleteRef.current = handleLiveAnswerComplete;

  // ─── Save completed session to database ────────────────────────
  const saveSessionToDb = useCallback(async (evalData: EvaluationData, msgs: Message[]) => {
    try {
      const turns: { questionText: string; answerText?: string }[] = [];
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].role === "assistant") {
          const nextUser = msgs[i + 1];
          turns.push({
            questionText: msgs[i].content,
            answerText: nextUser?.role === "user" ? nextUser.content : undefined,
          });
        }
      }

      await fetch("/api/ai/interview-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedResumeId || null,
          targetRole,
          jobDescription,
          interviewType: interviewConfig.interviewType,
          difficulty: interviewConfig.difficulty,
          deliveryScore: evalData.deliveryScore,
          contentScore: evalData.contentScore,
          totalScore: Math.round((evalData.deliveryScore + evalData.contentScore) / 2),
          evaluationData: {
            findings: evalData.findings || [],
            actionItems: evalData.actionItems || [],
            summary: evalData.summary || "",
            feedbackStyle: interviewConfig.feedbackStyle,
          },
          turns,
        }),
      });
      // Refresh the history list
      const res = await fetch("/api/ai/interview-sessions");
      const data = await res.json();
      if (data.success) setPastSessions(data.sessions || []);
    } catch {
      // Non-critical: don't show error to user
    }
  }, [selectedResumeId, targetRole, jobDescription, interviewConfig]);

  // ─── Live Mode: End Session handler ─────────────────────────
  const handleEndSession = useCallback(async () => {
    if (loading) return;

    const manager = sessionManagerRef.current;
    if (manager) {
      try { manager.stopRecording(); } catch { /* ignore */ }
    }
    silenceDetectorRef.current?.reset();
    hasSpokenRef.current = false;
    setIsLiveListening(false);
    setVideoPanelState("idle");

    if (messagesRef.current.length === 0) {
      cleanupLiveSession("manual");
      setStep("setup");
      return;
    }

    setLoading(true);
    try {
      const endMessages = [
        ...messagesRef.current,
        { role: "user" as const, content: "[END_SESSION] Please provide your final evaluation and scorecard now." },
      ];

      const res = await fetch("/api/ai/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResumeInfoRef.current || {},
          jobDescription: jobDescriptionRef.current,
          targetRole: targetRoleRef.current,
          messages: endMessages,
          config: interviewConfigRef.current,
        }),
      });

      if (!res.ok) throw new Error("Failed to get evaluation");
      const data = await res.json();

      if (data.type === "evaluation") {
        setEvaluation(data);
        setMessages(endMessages);
        setStep("feedback");
        await saveSessionToDb(data, endMessages);
        cleanupLiveSession("completed");
        toast({
          title: "Session Completed!",
          description: "Your interview is complete. View your scorecard below.",
        });
      } else if (data.type === "question") {
        toast({
          title: "Session Ending",
          description: "The AI provided a follow-up. Please answer it or try ending again.",
        });
        const restoredMessages = [...endMessages, { role: "assistant" as const, content: data.text || "" }];
        setMessages(restoredMessages);
        messagesRef.current = restoredMessages;
      } else {
        cleanupLiveSession("error");
        throw new Error(`Unexpected end-session response: ${JSON.stringify(data).slice(0, 200)}`);
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Session Error",
        description: e.message || "Failed to end session.",
        variant: "destructive",
      });
      cleanupLiveSession("error");
      setStep("setup");
    } finally {
      setLoading(false);
    }
  }, [loading, cleanupLiveSession, saveSessionToDb]);

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

          await speakLiveResponse(data.text);
        } else if (data.type === "evaluation") {
          setEvaluation(data);
          setStep("feedback");
          await saveSessionToDb(data, currentMessages);
          cleanupLiveSession("completed");
          toast({
            title: "Session Completed!",
            description: "Your interview is complete. View your scorecard below.",
          });
        } else {
          throw new Error(`Unexpected AI response type: ${JSON.stringify(data).slice(0, 200)}`);
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
        setIsProcessingAnswer(false);
      }
    },
    [speakLiveResponse, cleanupLiveSession, saveSessionToDb],
  );

  // Keep the ref in sync with the latest sendLiveToAI
  useEffect(() => {
    sendLiveToAIRef.current = sendLiveToAI;
  }, [sendLiveToAI]);

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

    trackAudioEvent({ type: "session_start" });

    try {
      const manager = new InterviewSessionManager();
      sessionManagerRef.current = manager;

      const stream = await manager.startSession({ audio: true, video: true });
      setLiveMediaStream(stream);
      setIsLiveSession(true);
      setVideoPanelState("active");

      silenceDetectorRef.current = createSilenceDetector(0.08, 2000);

      manager.startRecording();
      setIsLiveListening(true);

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

        setTimeout(() => speakLiveResponse(data.text), 500);
      } else {
        cleanupLiveSession("error");
        throw new Error(`Unexpected API response: ${JSON.stringify(data).slice(0, 200)}`);
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
      trackAudioEvent({
        type: "session_error",
        errorType: e.name || "unknown",
        errorMessage: description,
      });
      toast({
        title: "Live Session Failed",
        description,
        variant: "destructive",
      });
      cleanupLiveSession("error");
    } finally {
      setLoading(false);
    }
  }, [targetRole, selectedResumeInfo, jobDescription, interviewConfig, speakLiveResponse, cleanupLiveSession]);

  // ─── Turn-based session start ──────────────────────────────────
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
      } else {
        throw new Error(`Unexpected API response: ${JSON.stringify(data).slice(0, 200)}`);
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

  // ─── Submit answer (turn-based) ───────────────────────────────
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
        saveSessionToDb(data, updatedMessages);
        toast({
          title: "Session Completed!",
          description: "Your interview is complete. View your scorecard below.",
        });
      } else {
        throw new Error(`Unexpected AI response: ${JSON.stringify(data).slice(0, 200)}`);
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

  // ─── Recording triggers (turn-based) ───────────────────────────
  const startRecording = async () => {
    // If already recording, stop and release the previous stream first
    if (mediaRecorder && isRecording) {
      const capturedChunks = [...audioChunks.current];
      const capturedMimeType = audioMimeType.current;

      mediaRecorder.onstop = async () => {
        if (capturedChunks.length > 0) {
          const audioBlob = new Blob(capturedChunks, { type: capturedMimeType });
          await transcribeAudio(audioBlob);
        }
      };
      try {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch { /* ignore */ }
      setMediaRecorder(null);
      setIsRecording(false);
    }

    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
      audioMimeType.current = mimeType;
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: audioMimeType.current });
        await transcribeAudio(audioBlob);
      };
      recorder.start(200);
      setMediaRecorder(recorder);
      setIsRecording(true);
      startLocalSpeechRecognition();
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
      stopLocalSpeechRecognition();
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
      if (localTranscriptRef.current.trim()) {
        const fallbackText = localTranscriptRef.current.trim();
        setUserAnswer((prev) => (prev ? prev + " " + fallbackText : fallbackText));
        toast({
          title: "Speech Recognition Fallback",
          description: "Server transcription failed. Used browser native speech recognition instead.",
        });
      } else {
        toast({
          title: "Transcription Failed",
          description: "Failed to transcribe audio. You can still type your answer instead.",
          variant: "destructive",
        });
      }
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

  // ─── Turn-based: End Session handler ────────────────────────
  const handleTurnBasedEndSession = async () => {
    if (loading) return;
    if (messages.length === 0) {
      setStep("setup");
      return;
    }

    setLoading(true);
    try {
      const endMessages = [
        ...messages,
        { role: "user" as const, content: "[END_SESSION] Please provide your final evaluation and scorecard now." },
      ];

      const res = await fetch("/api/ai/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResumeInfo || {},
          jobDescription,
          targetRole,
          messages: endMessages,
          config: interviewConfig,
        }),
      });

      if (!res.ok) throw new Error("Failed to get evaluation");
      const data = await res.json();

      if (data.type === "evaluation") {
        setEvaluation(data);
        setMessages(endMessages);
        setStep("feedback");
        await saveSessionToDb(data, endMessages);
        toast({
          title: "Session Completed!",
          description: "Your interview is complete. View your scorecard below.",
        });
      } else if (data.type === "question") {
        toast({
          title: "Session Ending",
          description: "The AI provided a follow-up. Please answer it or try ending again.",
        });
        setMessages([...endMessages, { role: "assistant" as const, content: data.text || "" }]);
      } else {
        throw new Error(`Unexpected end-session response: ${JSON.stringify(data).slice(0, 200)}`);
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Session Error",
        description: e.message || "Failed to end session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle step reset ──────────────────────────────────────────
  const handleReset = () => {
    cleanupLiveSession("manual");

    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch { /* ignore */ }
      setMediaRecorder(null);
      setIsRecording(false);
    }

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
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(jobUrl.trim());
      } catch {
        throw new Error("Please enter a valid URL (e.g. https://linkedin.com/jobs/...)");
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only http and https URLs are supported");
      }

      const fetchRes = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      if (!fetchRes.ok) throw new Error("Failed to fetch URL content");
      const fetchData = await fetchRes.json();
      if (!fetchData.text) throw new Error("No content extracted from URL");

      const extractRes = await fetch("/api/ai/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fetchData.text }),
      });
      if (!extractRes.ok) throw new Error("Failed to extract job details");
      const extractData = await extractRes.json();

      if (extractData.jobTitle) setTargetRole(extractData.jobTitle);
      if (extractData.jobDescription) setJobDescription(extractData.jobDescription);
      setJobFetched(true);

      const newJob: RecentJob = {
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

  const handleSelectRecentJob = (job: RecentJob) => {
    setJobUrl(job.url);
    setTargetRole(job.title);
    setJobFetched(false);
    setShowRecentJobs(false);
    toast({
      title: "Job Selected",
      description: `Loaded ${job.title} from ${job.company}`,
    });
  };

  const handleRemoveRecentJob = (url: string) => {
    setRecentJobs((prev) => {
      const updated = prev.filter((j) => j.url !== url);
      localStorage.setItem("careerforge_recent_jobs", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecentJobs = () => {
    setRecentJobs([]);
    localStorage.removeItem("careerforge_recent_jobs");
  };

  // ─── Delete a past session ──────────────────────────────────
  const handleDeleteSession = async (sessionId: string) => {
    setIsDeletingSession(true);
    try {
      const res = await fetch("/api/ai/interview-sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setPastSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast({
          title: "Session Deleted",
          description: "The interview session has been removed.",
        });
      } else {
        throw new Error(data.error || "Failed to delete session");
      }
    } catch (e: any) {
      toast({
        title: "Delete Failed",
        description: e.message || "Could not delete the session.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  // ─── Load a past session into the feedback view ────────────────
  const handleLoadPastSession = (session: PastSession) => {
    const reconstructedMessages: Message[] = [];
    if (session.turns && session.turns.length > 0) {
      for (const turn of session.turns) {
        reconstructedMessages.push({ role: "assistant", content: turn.questionText });
        if (turn.answerText) {
          reconstructedMessages.push({ role: "user", content: turn.answerText });
        }
      }
    }

    let evalData;
    try {
      const stored = session.evaluationData ? JSON.parse(session.evaluationData) : null;
      evalData = {
        type: "evaluation",
        deliveryScore: session.deliveryScore ?? 0,
        contentScore: session.contentScore ?? 0,
        findings: stored?.findings || ["Session completed. Detailed findings were not saved for this session."],
        actionItems: stored?.actionItems || ["Practice more mock interviews to generate detailed action items."],
        summary: stored?.summary || `${session.targetRole} interview (${session.interviewType}, ${session.difficulty}). Delivered ${session.deliveryScore ?? 0}% on delivery and ${session.contentScore ?? 0}% on content across ${session.turns?.length ?? 0} turns.`,
      };
    } catch {
      evalData = {
        type: "evaluation",
        deliveryScore: session.deliveryScore ?? 0,
        contentScore: session.contentScore ?? 0,
        findings: ["Session completed."],
        actionItems: ["Practice more mock interviews."],
        summary: `${session.targetRole} interview completed on ${new Date(session.createdAt).toLocaleDateString()}.`,
      };
    }

    setEvaluation(evalData);
    setMessages(reconstructedMessages);
    setStep("feedback");

    toast({
      title: "Session Loaded",
      description: `Viewing ${session.targetRole} interview from ${new Date(session.createdAt).toLocaleDateString()}.`,
    });
  };

  // ─── Sync keyboard shortcut refs ─────────────────────────
  handleEndSessionRef.current = handleEndSession;
  handleTurnBasedEndSessionRef.current = handleTurnBasedEndSession;
  handleSubmitAnswerRef.current = handleSubmitAnswer;
  handleResetRef.current = handleReset;
  cleanupLiveSessionRef.current = cleanupLiveSession;

  // ─── Return all values needed by JSX ──────────────────────────
  return {
    // Setup state
    selectedResumeId,
    setSelectedResumeId,
    targetRole,
    setTargetRole,
    jobDescription,
    setJobDescription,
    jobUrl,
    setJobUrl,
    isFetchingJob,
    jobFetched,
    setJobFetched,
    recentJobs,
    showRecentJobs,
    setShowRecentJobs,
    recentJobsRef,
    shortcutsRef,
    selectedResumeInfo,
    interviewConfig,
    setInterviewConfig,

    // Mode
    interviewMode,
    setInterviewMode,

    // Dropdowns
    designOpen,
    setDesignOpen,
    voiceOpen,
    setVoiceOpen,

    // Session
    step,
    setStep,
    messages,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    loading,

    // Audio recording (turn-based)
    isRecording,
    recordingTime,
    transcribing,

    // Evaluation
    evaluation,

    // TTS
    isMuted,
    setIsMuted,
    isTTSGenerating,
    voiceConfig,
    setVoiceConfig,

    // Past sessions
    pastSessions,
    isLoadingSessions,
    sessionToDelete,
    setSessionToDelete,
    isDeletingSession,
    showShortcuts,
    setShowShortcuts,
    canScrollUp,
    canScrollDown,

    // Live mode
    isLiveSession,
    liveMediaStream,
    isVideoOff,
    setIsVideoOff,
    isLiveMuted,
    setIsLiveMuted,
    transcriptEntries,
    isLiveListening,
    isProcessingAnswer,
    liveUserAudioLevel,
    liveAIAudioLevel,
    videoPanelState,

    // Refs
    sessionLogsRef,
    liveTTSAudioRef,

    // Derived
    questionIndex,
    voiceState,

    // Resumes
    resumes,

    // Actions
    handleStartSession,
    startLiveSession,
    handleSubmitAnswer,
    handleTurnBasedEndSession,
    handleEndSession,
    handleDoneSpeaking,
    startRecording,
    stopRecording,
    handleReset,
    handleAutoFillJob,
    handleSelectRecentJob,
    handleRemoveRecentJob,
    handleClearRecentJobs,
    handleDeleteSession,
    handleLoadPastSession,
    formatTime,
  };
}
