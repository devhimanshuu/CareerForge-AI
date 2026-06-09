import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { AIChatSession } from "@/lib/groq-model";
import { z } from "zod";
import {
  assertInterviewVoice,
  listInterviewVoices,
  parsePodcastDialogue,
  synthesizeElevenLabsDialogue,
  synthesizeElevenLabsSpeech,
  transcribeWithElevenLabs,
} from "@/lib/elevenlabs";

const audioRoute = new Hono()
  .get("/voices", getAuthUser, async (c) => {
    try {
      const roleSchema = z.enum(["recruiter", "technical", "executive", "coach", "host", "candidate"]);
      const role = roleSchema.catch("recruiter").parse(c.req.query("role"));
      const voices = await listInterviewVoices(role);
      return c.json({ success: true, role, voices });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to load voices" }, 500);
    }
  })
  .post("/synthesize", getAuthUser, async (c) => {
    try {
      const schema = z.object({
        text: z.string().min(1).max(5000),
        voiceId: z.string().min(1),
        role: z.enum(["recruiter", "technical", "executive", "coach"]).default("recruiter"),
        modelId: z.string().optional(),
        languageCode: z.string().max(10).optional(),
        outputFormat: z.string().optional(),
        settings: z.object({
          stability: z.number().min(0).max(1).optional(),
          similarityBoost: z.number().min(0).max(1).optional(),
          style: z.number().min(0).max(1).optional(),
          speed: z.number().min(0.7).max(1.2).optional(),
          useSpeakerBoost: z.boolean().optional(),
        }).optional(),
      });
      const input = schema.parse(await c.req.json());
      await assertInterviewVoice(input.voiceId, input.role);
      const audio = await synthesizeElevenLabsSpeech(input);

      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to synthesize speech" }, 500);
    }
  })
  .post("/dialogue", getAuthUser, async (c) => {
    try {
      const schema = z.object({
        script: z.string().min(1).max(5000),
        hostVoiceId: z.string().min(1),
        candidateVoiceId: z.string().min(1),
        modelId: z.string().optional(),
        languageCode: z.string().max(10).optional(),
        seed: z.number().int().min(0).max(4294967295).optional(),
      });
      const input = schema.parse(await c.req.json());
      await Promise.all([
        assertInterviewVoice(input.hostVoiceId, "host"),
        assertInterviewVoice(input.candidateVoiceId, "candidate"),
      ]);
      const inputs = parsePodcastDialogue(input.script, input.hostVoiceId, input.candidateVoiceId);
      if (!inputs.length) return c.json({ success: false, message: "No HOST or CANDIDATE dialogue found" }, 400);

      const audio = await synthesizeElevenLabsDialogue({ ...input, inputs });
      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to synthesize dialogue" }, 500);
    }
  })
  .post("/transcribe", getAuthUser, async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return c.json({ success: false, message: "No audio file provided" }, 400);
      }

      if (process.env.ELEVENLABS_API_KEY) {
        const keyterms = String(formData.get("keyterms") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 100);
        const result = await transcribeWithElevenLabs({
          file,
          languageCode: String(formData.get("languageCode") || "") || undefined,
          keyterms,
          noVerbatim: formData.get("noVerbatim") !== "false",
        });
        return c.json({ success: true, provider: "elevenlabs", ...result });
      }

      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        return c.json({ success: false, message: "Missing ElevenLabs and Groq API keys" }, 500);
      }
      
      const groqFormData = new FormData();
      groqFormData.append("file", file);
      groqFormData.append("model", "whisper-large-v3-turbo");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
        },
        body: groqFormData
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return c.json({ success: true, provider: "groq", text: data.text });
    } catch (error: any) {
      console.error("Transcription Error:", error);
      return c.json({ success: false, message: error.message || "Failed to transcribe audio" }, 500);
    }
  })
  .post("/generate-podcast", getAuthUser, async (c) => {
    try {
      const {
        resumeData,
        duration = 120,
        tone = "confident and conversational",
        hostVoiceId,
        candidateVoiceId,
      } = await c.req.json();
      const prompt = `
        You are a world-class podcast producer. Create a concise ${Math.max(45, Math.min(180, Number(duration)))}-second "Career Spotlight" interview script.
        Make it specific to the candidate's resume. Use two speakers: HOST and CANDIDATE.
        Tone: ${tone}.
        Avoid generic hype and mention concrete roles, skills, education, and achievements where available.
        Keep the entire script under 1,850 characters. Every spoken line must begin with HOST: or CANDIDATE:.

        RESUME DATA:
        ${JSON.stringify(resumeData)}

        Return only the script text.
      `;
      const result = await AIChatSession.sendMessage(prompt);
      const script = result.response.text();

      return c.json({
        success: true,
        script,
        hasAudio: Boolean(process.env.ELEVENLABS_API_KEY && hostVoiceId && candidateVoiceId),
        audioUrl: null,
      });
    } catch (error: any) {
      return c.json({ success: false, message: "Failed to generate podcast" }, 500);
    }
  });


export default audioRoute;
