import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_KIMI_KEY;

const nvidiaClient = new OpenAI({
  apiKey: nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const groqClient = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const aiRoute = new Hono()
  .post("/chat", getAuthUser, async (c) => {
    try {
      const { prompt } = await c.req.json();
      
      try {
        if (!nvidiaApiKey) throw new Error("Missing NVIDIA API Key");
        const response = await nvidiaClient.chat.completions.create({
          model: "moonshotai/kimi-k2.6",
          messages: [{ role: "user", content: prompt }],
        });
        return c.json({ text: response.choices[0].message.content || "" });
      } catch (error) {
        console.warn("NVIDIA NIM failed in API, falling back to Groq:", error);
        if (!groqApiKey) throw new Error("Missing Groq API Key");
        
        const response = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        });
        return c.json({ text: response.choices[0].message.content || "" });
      }
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/mind-reader", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const prompt = `
        You are a senior technical recruiter. Analyze the following resume data and identify the "Hot Zones" where a recruiter's eyes are most likely to linger during a 6-second scan.
        Return a JSON array of coordinates (x, y) where x and y are percentages (0-100) representing positions on a standard A4 page, and an intensity (0.0-1.0).
        Focus on: Job Titles, Company Names, Years of Experience, Key Technical Skills, and the Summary.
        
        RESUME DATA:
        ${JSON.stringify(resumeData)}
        
        OUTPUT FORMAT:
        {
          "hotZones": [
            { "x": 20, "y": 15, "intensity": 0.9, "label": "Name/Header" },
            ...
          ]
        }
      `;

      const response = await nvidiaClient.chat.completions.create({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return c.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/time-traveler", getAuthUser, async (c) => {
    try {
      const { resumeData, targetYear = 2030 } = await c.req.json();
      const prompt = `
        You are a career visionary. Project the professional trajectory of this person to the year ${targetYear}.
        Based on their current skills and experience, predict their future roles, promotions, and new high-impact skills they will acquire.
        Modify the resume data to reflect this future version. Ensure it looks like a natural evolution.
        
        CURRENT DATA:
        ${JSON.stringify(resumeData)}
        
        OUTPUT:
        Return the FULL updated resume JSON object.
      `;

      const response = await nvidiaClient.chat.completions.create({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return c.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  })

  .post("/fact-check", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const prompt = `
        You are an elite AI Auditor and Technical Recruiter. Your task is to perform a "Liar Detection" audit on the following resume.
        Identify internal inconsistencies, temporal overlaps (dates), and "Skill vs Experience" gaps (skills listed but never mentioned in work history).
        
        RESUME DATA:
        ${JSON.stringify(resumeData)}
        
        OUTPUT FORMAT (JSON):
        {
          "veracityScore": 0-100,
          "trustLevel": "High" | "Moderate" | "Low",
          "findings": [
            { "type": "Temporal Inconsistency" | "Skill Gap" | "Logical Error", "detail": "Description...", "severity": "Critical" | "Warning" | "Informational" }
          ],
          "verdict": "A summary of the overall credibility."
        }
      `;

      const response = await nvidiaClient.chat.completions.create({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return c.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/generate-cheat-sheet", getAuthUser, async (c) => {
    try {
      const { resumeData, companyName } = await c.req.json();
      const prompt = `
        You are an elite interview coach. Generate a high-impact "Interview Cheat Sheet" for a candidate applying to ${companyName}.
        (Prompt logic...)
      `;
      const response = await nvidiaClient.chat.completions.create({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return c.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

export default aiRoute;
