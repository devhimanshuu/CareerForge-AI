const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io";
let voiceCache: { expiresAt: number; voices: ElevenLabsVoice[] } | null = null;

export type ElevenLabsVoice = {
  voiceId: string;
  name: string;
  category?: string;
  description?: string;
  previewUrl?: string;
  labels?: Record<string, string>;
  interviewRole?: InterviewVoiceRole;
  interviewLabel?: string;
};

export type InterviewVoiceRole =
  | "recruiter"
  | "technical"
  | "executive"
  | "coach"
  | "host"
  | "candidate";

export type ElevenLabsVoiceSettings = {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
  useSpeakerBoost?: boolean;
};

type DialogueInput = {
  text: string;
  voiceId: string;
};

function apiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
}

async function elevenLabsFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${ELEVENLABS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "xi-api-key": apiKey(),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  return response;
}

export async function listElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  if (voiceCache && voiceCache.expiresAt > Date.now()) return voiceCache.voices;
  const response = await elevenLabsFetch("/v2/voices?page_size=100&sort=name&sort_direction=asc");
  const data = await response.json();

  const voices = (data.voices || []).map((voice: any) => ({
    voiceId: voice.voice_id,
    name: voice.name,
    category: voice.category,
    description: voice.description,
    previewUrl: voice.preview_url,
    labels: voice.labels,
  }));
  voiceCache = { voices, expiresAt: Date.now() + 5 * 60 * 1000 };
  return voices;
}

const roleProfiles: Record<InterviewVoiceRole, { label: string; keywords: string[] }> = {
  recruiter: {
    label: "Professional Recruiter",
    keywords: ["professional", "conversational", "recruiter", "corporate", "confident", "clear", "business"],
  },
  technical: {
    label: "Technical Interviewer",
    keywords: ["technical", "calm", "analytical", "clear", "focused", "professional", "informative"],
  },
  executive: {
    label: "Executive Interviewer",
    keywords: ["executive", "authoritative", "mature", "confident", "deep", "professional", "corporate"],
  },
  coach: {
    label: "Supportive Career Coach",
    keywords: ["warm", "friendly", "supportive", "calm", "conversational", "encouraging", "professional"],
  },
  host: {
    label: "Career Podcast Host",
    keywords: ["host", "podcast", "narration", "engaging", "conversational", "professional", "clear"],
  },
  candidate: {
    label: "Candidate Voice",
    keywords: ["conversational", "natural", "professional", "confident", "friendly", "clear"],
  },
};

const excludedVoiceKeywords = [
  "anime",
  "asmr",
  "cartoon",
  "character",
  "child",
  "creature",
  "dramatic",
  "gaming",
  "monster",
  "seductive",
  "whisper",
];

export async function listInterviewVoices(role: InterviewVoiceRole = "recruiter") {
  const profile = roleProfiles[role];
  const voices = await listElevenLabsVoices();
  const ranked = voices
    .map((voice) => {
      const searchable = [
        voice.name,
        voice.category,
        voice.description,
        ...Object.entries(voice.labels || {}).flatMap(([key, value]) => [key, value]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (excludedVoiceKeywords.some((keyword) => searchable.includes(keyword))) return null;
      const score = profile.keywords.reduce(
        (total, keyword) => total + (searchable.includes(keyword) ? 2 : 0),
        0,
      ) + (searchable.includes("premade") ? 1 : 0);
      return { ...voice, score };
    })
    .filter((voice): voice is ElevenLabsVoice & { score: number } => Boolean(voice))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const selected = ranked.filter((voice) => voice.score >= 2).slice(0, 8);
  return selected.map(({ score, ...voice }) => ({
    ...voice,
    interviewRole: role,
    interviewLabel: profile.label,
  }));
}

export async function assertInterviewVoice(
  voiceId: string,
  roles: InterviewVoiceRole | InterviewVoiceRole[],
) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const catalogs = await Promise.all(allowedRoles.map((role) => listInterviewVoices(role)));
  if (!catalogs.flat().some((voice) => voice.voiceId === voiceId)) {
    throw new Error("This voice is not approved for the selected interview context");
  }
}

export async function synthesizeElevenLabsSpeech(input: {
  text: string;
  voiceId: string;
  modelId?: string;
  outputFormat?: string;
  languageCode?: string;
  settings?: ElevenLabsVoiceSettings;
}) {
  const settings = input.settings || {};
  const outputFormat = input.outputFormat || "mp3_44100_128";
  const response = await elevenLabsFetch(
    `/v1/text-to-speech/${encodeURIComponent(input.voiceId)}?output_format=${encodeURIComponent(outputFormat)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.text,
        model_id: input.modelId || "eleven_multilingual_v2",
        language_code: input.languageCode || undefined,
        voice_settings: {
          stability: settings.stability ?? 0.55,
          similarity_boost: settings.similarityBoost ?? 0.78,
          style: settings.style ?? 0.2,
          speed: settings.speed ?? 1,
          use_speaker_boost: settings.useSpeakerBoost ?? true,
        },
      }),
    },
  );

  return response.arrayBuffer();
}

export async function synthesizeElevenLabsDialogue(input: {
  inputs: DialogueInput[];
  modelId?: string;
  outputFormat?: string;
  languageCode?: string;
  seed?: number;
}) {
  const totalCharacters = input.inputs.reduce((sum, item) => sum + item.text.length, 0);
  if (totalCharacters > 2000) {
    throw new Error("Podcast dialogue is longer than ElevenLabs' reliable 2,000 character limit");
  }

  const response = await elevenLabsFetch(
    `/v1/text-to-dialogue?output_format=${encodeURIComponent(input.outputFormat || "mp3_44100_128")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: input.inputs.map((item) => ({
          text: item.text,
          voice_id: item.voiceId,
        })),
        model_id: input.modelId || "eleven_v3",
        language_code: input.languageCode || undefined,
        seed: input.seed,
      }),
    },
  );

  return response.arrayBuffer();
}

export async function transcribeWithElevenLabs(input: {
  file: File;
  languageCode?: string;
  keyterms?: string[];
  noVerbatim?: boolean;
}) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("model_id", "scribe_v2");
  formData.append("tag_audio_events", "false");
  formData.append("timestamps_granularity", "none");
  formData.append("no_verbatim", String(input.noVerbatim ?? true));
  if (input.languageCode) formData.append("language_code", input.languageCode);
  for (const keyterm of input.keyterms || []) formData.append("keyterms", keyterm);

  const response = await elevenLabsFetch("/v1/speech-to-text", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  return {
    text: data.text || "",
    languageCode: data.language_code,
    languageProbability: data.language_probability,
  };
}

export function parsePodcastDialogue(script: string, hostVoiceId: string, candidateVoiceId: string) {
  const entries: DialogueInput[] = [];
  let current: DialogueInput | null = null;

  for (const rawLine of script.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(HOST|CANDIDATE)\s*:\s*(.+)$/i);

    if (match) {
      current = {
        voiceId: match[1].toUpperCase() === "HOST" ? hostVoiceId : candidateVoiceId,
        text: match[2].trim(),
      };
      entries.push(current);
    } else if (current) {
      current.text += ` ${line}`;
    }
  }

  return entries;
}
