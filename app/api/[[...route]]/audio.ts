import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
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
import { zValidator } from "@hono/zod-validator";

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
  /**
   * @deprecated Use POST /audio/podcast instead for unified script + audio generation.
   * This endpoint will be removed in a future version.
   */
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
  /**
   * POST /audio/podcast — Unified podcast generation (script + audio in one call).
   *
   * Accepts topic/context/resume data, generates a dialogue script via Groq LLM,
   * then synthesizes each speaker turn into audio via ElevenLabs (when available).
   * Returns { audioUrl, transcript, duration, speakers } in a single response.
   */
  .post("/podcast", getAuthUser, async (c) => {
    try {
      const schema = z.object({
        resumeData: z.any().optional(),
        topic: z.string().max(500).optional(),
        duration: z.number().int().min(30).max(300).default(120),
        tone: z.string().max(100).default("confident and conversational"),
        hostVoiceId: z.string().min(1).optional(),
        candidateVoiceId: z.string().min(1).optional(),
        modelId: z.string().optional(),
        languageCode: z.string().max(10).optional(),
      });
      const input = schema.parse(await c.req.json());

      // ── Build prompt ─────────────────────────────────────────────────
      const contextSection = input.topic
        ? `TOPIC: ${input.topic}`
        : `RESUME DATA:\n${JSON.stringify(input.resumeData)}`;

      const prompt = `
        You are a world-class podcast producer. Create a concise ${Math.max(45, Math.min(180, input.duration))}-second "Career Spotlight" interview script.
        ${input.topic ? `Focus on the topic: ${input.topic}.` : "Make it specific to the candidate's resume."}
        Use two speakers: HOST and CANDIDATE.
        Tone: ${input.tone}.
        Avoid generic hype and mention concrete roles, skills, education, and achievements where available.
        Keep the entire script under 1,850 characters. Every spoken line must begin with HOST: or CANDIDATE:.

        ${contextSection}

        Return only the script text.
      `;

      // ── Generate script via Groq LLM ────────────────────────────────
      const result = await AIChatSession.sendMessage(prompt);
      const transcript = result.response.text();

      // Extract unique speakers from the transcript
      const speakers = Array.from(
        new Set(
          [...transcript.matchAll(/^(HOST|CANDIDATE)\s*:/gim)].map((m) => m[1].toUpperCase()),
        ),
      );

      // Estimate duration based on spoken-word character count (~15 chars/sec)
      const spokenText = transcript.replace(/^(HOST|CANDIDATE)\s*:\s*/gim, "").trim();
      const estimatedDuration = Math.max(1, Math.round(spokenText.length / 15));

      // ── Attempt audio synthesis via ElevenLabs ───────────────────────
      const canSynthesize = Boolean(
        process.env.ELEVENLABS_API_KEY && input.hostVoiceId && input.candidateVoiceId,
      );

      let audioUrl: string | null = null;
      let note: string | undefined;

      if (canSynthesize) {
        try {
          if (!input.hostVoiceId || !input.candidateVoiceId) {
            throw new Error("Host and candidate voice IDs are required for audio synthesis");
          }

          await Promise.all([
            assertInterviewVoice(input.hostVoiceId, "host"),
            assertInterviewVoice(input.candidateVoiceId, "candidate"),
          ]);

          const dialogueInputs = parsePodcastDialogue(
            transcript,
            input.hostVoiceId,
            input.candidateVoiceId,
          );

          if (dialogueInputs.length > 0) {
            const audioBuffer = await synthesizeElevenLabsDialogue({
              inputs: dialogueInputs,
              modelId: input.modelId,
              languageCode: input.languageCode,
            });

            const base64Audio = Buffer.from(audioBuffer).toString("base64");
            audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
          }
        } catch (audioError: any) {
          note = `Audio synthesis failed: ${audioError.message}. Transcript is available.`;
        }
      } else {
        note =
          "Audio synthesis unavailable. Provide hostVoiceId and candidateVoiceId with a valid ELEVENLABS_API_KEY to enable TTS.";
      }

      return c.json({
        success: true,
        audioUrl,
        transcript,
        duration: estimatedDuration,
        speakers,
        ...(note ? { note } : {}),
      });
    } catch (error: any) {
      return c.json(
        { success: false, message: error.message || "Failed to generate podcast" },
        500,
      );
    }
  })

  /**
   * POST /audio/podcast/stream — SSE endpoint that streams progress updates
   * during long podcast generation.
   *
   * Stages emitted: "generating_script" → "synthesizing_audio" → "complete"
   *
   * Body: topic, resumeData (JSON), duration, tone,
   *       hostVoiceId, candidateVoiceId, modelId, languageCode
   */
  .post(
    "/podcast/stream",
    zValidator(
      "json",
      z.object({
        topic: z.string().optional(),
        resumeData: z.any().optional(),
        duration: z.number().min(30).max(300).optional(),
        tone: z.string().optional(),
        hostVoiceId: z.string().optional(),
        candidateVoiceId: z.string().optional(),
        modelId: z.string().optional(),
        languageCode: z.string().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      const body = c.req.valid("json");
      const topic = body.topic || "";
      const duration = body.duration || 120;
      const tone = body.tone || "confident and conversational";
      const hostVoiceId = body.hostVoiceId || "";
      const candidateVoiceId = body.candidateVoiceId || "";
      const modelId = body.modelId || undefined;
      const languageCode = body.languageCode || undefined;
      const resumeData = body.resumeData || undefined;

    return streamSSE(c, async (stream) => {
      try {
        // ── Stage 1: generating_script ───────────────────────────────
        await stream.writeSSE({
          event: "stage",
          data: JSON.stringify({ stage: "generating_script", message: "Generating podcast script..." }),
        });

        const contextSection = topic
          ? `TOPIC: ${topic}`
          : `RESUME DATA:\n${JSON.stringify(resumeData)}`;

        const prompt = `
          You are a world-class podcast producer. Create a concise ${Math.max(45, Math.min(180, duration))}-second "Career Spotlight" interview script.
          ${topic ? `Focus on the topic: ${topic}.` : "Make it specific to the candidate's resume."}
          Use two speakers: HOST and CANDIDATE.
          Tone: ${tone}.
          Avoid generic hype and mention concrete roles, skills, education, and achievements where available.
          Keep the entire script under 1,850 characters. Every spoken line must begin with HOST: or CANDIDATE:.

          ${contextSection}

          Return only the script text.
        `;

        const result = await AIChatSession.sendMessage(prompt);
        const transcript = result.response.text();

        const speakers = Array.from(
          new Set(
            [...transcript.matchAll(/^(HOST|CANDIDATE)\s*:/gim)].map((m) => m[1].toUpperCase()),
          ),
        );

        const spokenText = transcript.replace(/^(HOST|CANDIDATE)\s*:\s*/gim, "").trim();
        const estimatedDuration = Math.max(1, Math.round(spokenText.length / 15));

        await stream.writeSSE({
          event: "script",
          data: JSON.stringify({ transcript, speakers, duration: estimatedDuration }),
        });

        // ── Stage 2: synthesizing_audio ──────────────────────────────
        const canSynthesize = Boolean(
          process.env.ELEVENLABS_API_KEY && hostVoiceId && candidateVoiceId,
        );

        let audioUrl: string | null = null;
        let note: string | undefined;

        if (canSynthesize) {
          await stream.writeSSE({
            event: "stage",
            data: JSON.stringify({ stage: "synthesizing_audio", message: "Synthesizing audio..." }),
          });

          try {
            await Promise.all([
              assertInterviewVoice(hostVoiceId, "host"),
              assertInterviewVoice(candidateVoiceId, "candidate"),
            ]);

            const dialogueInputs = parsePodcastDialogue(transcript, hostVoiceId, candidateVoiceId);

            if (dialogueInputs.length > 0) {
              const audioBuffer = await synthesizeElevenLabsDialogue({
                inputs: dialogueInputs,
                modelId,
                languageCode,
              });

              const base64Audio = Buffer.from(audioBuffer).toString("base64");
              audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
            }
          } catch (audioError: any) {
            note = `Audio synthesis failed: ${audioError.message}. Transcript is available.`;
          }
        } else {
          note =
            "Audio synthesis unavailable. Provide hostVoiceId and candidateVoiceId with a valid ELEVENLABS_API_KEY to enable TTS.";
        }

        await stream.writeSSE({
          event: "audio",
          data: JSON.stringify({
            audioUrl,
            ...(note ? { note } : {}),
          }),
        });

        // ── Stage 3: complete ────────────────────────────────────────
        await stream.writeSSE({
          event: "stage",
          data: JSON.stringify({ stage: "complete" }),
        });
      } catch (error: any) {
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify({ message: error.message || "Failed to generate podcast" }),
        });
      }
    });
  })

  /**
   * @deprecated Use POST /audio/podcast instead for unified script + audio generation.
   * This endpoint will be removed in a future version.
   */
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
