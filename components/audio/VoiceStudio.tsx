"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Play, SlidersHorizontal, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export type InterviewVoiceRole = "recruiter" | "technical" | "executive" | "coach";

export type VoiceStudioConfig = {
  voiceId: string;
  role: InterviewVoiceRole;
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
};

export type VoiceOption = {
  voiceId: string;
  name: string;
  category?: string;
  description?: string;
  previewUrl?: string;
  labels?: Record<string, string>;
  interviewRole?: string;
  interviewLabel?: string;
};

export const defaultVoiceStudioConfig: VoiceStudioConfig = {
  voiceId: "",
  role: "recruiter",
  stability: 0.55,
  similarityBoost: 0.78,
  style: 0.2,
  speed: 1,
};

export function useElevenLabsVoices(role: string = "recruiter") {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/audio/voices?role=${encodeURIComponent(role)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Voice library unavailable");
        return response.json();
      })
      .then((data) => {
        if (active) setVoices(data.voices || []);
      })
      .catch(() => {
        if (active) setVoices([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  return { voices, loading };
}

export async function createElevenLabsAudio(text: string, config: VoiceStudioConfig) {
  if (!config.voiceId) throw new Error("Choose an interview voice first");
  const response = await fetch("/api/audio/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voiceId: config.voiceId,
      role: config.role,
      settings: config,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Voice synthesis failed");
  }
  return URL.createObjectURL(await response.blob());
}

const VoiceStudio = ({
  value,
  onChange,
  title = "Recruiter Voice Studio",
  compact = false,
}: {
  value: VoiceStudioConfig;
  onChange: (value: VoiceStudioConfig) => void;
  title?: string;
  compact?: boolean;
}) => {
  const { voices, loading } = useElevenLabsVoices(value.role);
  const [previewing, setPreviewing] = useState("");
  const previewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (voices[0] && !voices.some((voice) => voice.voiceId === value.voiceId)) {
      onChange({ ...value, voiceId: voices[0].voiceId });
    }
  }, [voices, value, onChange]);

  useEffect(() => () => previewRef.current?.pause(), []);

  const update = (key: keyof VoiceStudioConfig, nextValue: string | number) => {
    onChange({ ...value, [key]: nextValue });
  };

  const previewSelectedVoice = () => {
    previewRef.current?.pause();
    if (previewing === value.voiceId) {
      setPreviewing("");
      return;
    }
    const voice = voices.find((item) => item.voiceId === value.voiceId);
    if (!voice?.previewUrl) return;
    const audio = new Audio(voice.previewUrl);
    previewRef.current = audio;
    setPreviewing(voice.voiceId);
    audio.onended = () => setPreviewing("");
    audio.play();
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
            <SlidersHorizontal size={12} />
            {title}
          </p>
          {!compact && <p className="mt-1 text-xs text-muted-foreground">Only professional voices matched to the selected interview persona are shown.</p>}
        </div>
        {loading && <Loader2 size={14} className="animate-spin text-indigo-500" />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interview persona</span>
          <select
            value={value.role}
            onChange={(event) => update("role", event.target.value)}
            className="h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="recruiter">Professional Recruiter</option>
            <option value="technical">Technical Interviewer</option>
            <option value="executive">Executive Interviewer</option>
            <option value="coach">Supportive Career Coach</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Curated voice</span>
          <div className="flex gap-2">
            <select
              value={value.voiceId}
              onChange={(event) => update("voiceId", event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-border/70 bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {!voices.length && <option value="">No relevant voices available</option>}
              {voices.map((voice) => (
                <option key={voice.voiceId} value={voice.voiceId}>
                  {voice.name}{voice.labels?.accent ? ` - ${voice.labels.accent}` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              title="Preview selected voice"
              onClick={previewSelectedVoice}
              disabled={!voices.find((voice) => voice.voiceId === value.voiceId)?.previewUrl}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-indigo-500 disabled:opacity-40"
            >
              {previewing === value.voiceId ? <Square size={12} /> : <Play size={13} />}
            </button>
          </div>
        </label>
      </div>

      <div className={compact ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
        <VoiceSlider label="Stability" value={value.stability} onChange={(next) => update("stability", next)} />
        <VoiceSlider label="Similarity" value={value.similarityBoost} onChange={(next) => update("similarityBoost", next)} />
        <VoiceSlider label="Expressiveness" value={value.style} onChange={(next) => update("style", next)} />
        <VoiceSlider label="Speed" value={(value.speed - 0.7) / 0.5} onChange={(next) => update("speed", 0.7 + next * 0.5)} suffix={`${value.speed.toFixed(2)}x`} />
      </div>
    </div>
  );
};

const VoiceSlider = ({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) => (
  <label className="space-y-2">
    <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {label}
      <span className="text-indigo-500">{suffix || `${Math.round(value * 100)}%`}</span>
    </span>
    <Slider min={0} max={1} step={0.01} value={[value]} onValueChange={([next]) => onChange(next)} />
  </label>
);

export default VoiceStudio;
