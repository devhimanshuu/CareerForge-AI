"use client";

import React from "react";
import {
  Mic,
  Play,
  Loader2,
  Volume2,
  RefreshCw,
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
} from "@/components/ui/premium-page";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VoiceStudio from "@/components/audio/VoiceStudio";
import { useInterviewLab } from "@/hooks/use-interview-lab";
import { PastSessions } from "./_components/PastSessions";
import { ConfigSelect } from "./_components/ConfigSelect";
import { ShortcutsPanel } from "./_components/ShortcutsPanel";
import { StatsBanner } from "./_components/StatsBanner";
import { TurnBasedInterviewPanel } from "./_components/TurnBasedInterviewPanel";
import { LiveInterviewPanel } from "./_components/LiveInterviewPanel";
import { FeedbackPanel } from "./_components/FeedbackPanel";
import { DeleteSessionModal } from "./_components/DeleteSessionModal";

const InterviewLab = () => {
  const {
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
  } = useInterviewLab();

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Practice Studio"
        title="Interview Lab"
        description="A premium mock rehearsal space with Whisper speech-to-text and adaptive coaching logs. Conduct deep, multi-turn STAR methodology interviews."
        icon={<Mic size={13} />}
        action={
          step !== "setup" && (
            <div className="flex items-center gap-2">
              <ShortcutsPanel
                showShortcuts={showShortcuts}
                setShowShortcuts={setShowShortcuts}
                shortcutsRef={shortcutsRef}
              />
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2 border-indigo-500/30 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              >
                <RefreshCw size={16} />
                Reset Lab
              </Button>
            </div>
          )
        }
      />

      <StatsBanner evaluation={evaluation} interviewMode={interviewMode} />

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

            <PastSessions
              sessions={pastSessions}
              isLoading={isLoadingSessions}
              onLoadSession={handleLoadPastSession}
              onDeleteSession={(session) => setSessionToDelete(session)}
            />
          </motion.div>
        )}

        {/* ─── INTERVIEWING STEP (Turn-based) ──────────────────── */}
        {step === "interviewing" && interviewMode === "turn-based" && (
          <TurnBasedInterviewPanel
            currentQuestion={currentQuestion}
            questionIndex={questionIndex}
            interviewConfig={interviewConfig}
            messages={messages}
            canScrollUp={canScrollUp}
            canScrollDown={canScrollDown}
            sessionLogsRef={sessionLogsRef}
            userAnswer={userAnswer}
            onUserAnswerChange={setUserAnswer}
            loading={loading}
            transcribing={transcribing}
            isRecording={isRecording}
            recordingTime={recordingTime}
            isTTSGenerating={isTTSGenerating}
            voiceState={voiceState}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSubmitAnswer={handleSubmitAnswer}
            onEndSession={handleTurnBasedEndSession}
            formatTime={formatTime}
          />
        )}

        {/* ─── LIVE INTERVIEWING STEP ───────────────────────────── */}
        {step === "interviewing" && interviewMode === "live" && (
          <LiveInterviewPanel
            liveMediaStream={liveMediaStream}
            videoPanelState={videoPanelState}
            isLiveMuted={isLiveMuted}
            onToggleMute={() => {
              setIsLiveMuted(!isLiveMuted);
              if (!isLiveMuted) {
                window.speechSynthesis.cancel();
                liveTTSAudioRef.current?.pause();
              }
            }}
            isVideoOff={isVideoOff}
            onToggleVideo={() => setIsVideoOff(!isVideoOff)}
            isLiveSession={isLiveSession}
            loading={loading}
            liveAIAudioLevel={liveAIAudioLevel}
            isLiveListening={isLiveListening}
            liveUserAudioLevel={liveUserAudioLevel}
            currentQuestion={currentQuestion}
            questionIndex={questionIndex}
            interviewConfig={interviewConfig}
            isProcessingAnswer={isProcessingAnswer}
            onDoneSpeaking={handleDoneSpeaking}
            onEndSession={handleEndSession}
            transcriptEntries={transcriptEntries}
          />
        )}

        {/* ─── FEEDBACK STEP ─────────────────────────────────────── */}
        {step === "feedback" && evaluation && (
          <FeedbackPanel evaluation={evaluation} messages={messages} />
        )}
      </AnimatePresence>

      <DeleteSessionModal
        sessionToDelete={sessionToDelete}
        isDeletingSession={isDeletingSession}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
      />
    </PremiumPage>
  );
};

export default InterviewLab;
