import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { AIChatSession } from "@/lib/groq-model";

const aiRoute = new Hono()
  .post("/chat", getAuthUser, async (c) => {
    try {
      const { prompt } = await c.req.json();
      const aiResponse = await AIChatSession.sendMessage(prompt);
      return c.json({ text: aiResponse.response.text() });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/mind-reader", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const prompt = `
      You are an expert at eye-tracking research and recruiter psychology. 
      Analyze the provided Resume Data and predict the "hot zones" where a recruiter's eyes will naturally gravitate during their initial 6-second scan.
      
      Generate 4-6 attention zones. For each zone, provide:
      - x: horizontal position percentage (0 to 100). (e.g. left side is 10-30, center is 40-60).
      - y: vertical position percentage (0 to 100). (e.g. top is 10-30).
      - intensity: how strongly it attracts attention (0.0 to 1.0).
      - label: What they are looking at (e.g., "Current Job Title", "University Name", "Key Achievement").
      
      Output ONLY a valid JSON object matching this structure:
      {
        "hotZones": [
          { "x": 20, "y": 15, "intensity": 0.9, "label": "Recent Job Title" },
          { "x": 50, "y": 40, "intensity": 0.7, "label": "Metrics/Numbers" }
        ]
      }

      Resume Data:
      ${JSON.stringify(resumeData)}
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonMatch = aiResponse.response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      return c.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Mind Reader API Error:", error);
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
      Return the FULL updated resume JSON object matching the exact schema of the input, but with updated fields.
      Output ONLY a valid JSON object.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonMatch = aiResponse.response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      return c.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Time Traveler API Error:", error);
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
        "veracityScore": 85,
        "trustLevel": "Moderate",
        "findings": [
          { "type": "Temporal Inconsistency", "detail": "Description...", "severity": "Warning" }
        ],
        "verdict": "A summary of the overall credibility."
      }
      Output ONLY a valid JSON object matching this structure.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonMatch = aiResponse.response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      return c.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Fact Check API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/generate-cheat-sheet", getAuthUser, async (c) => {
    try {
      const { resumeData, companyName } = await c.req.json();
      
      if (!companyName) {
        return c.json({ error: "Company name is required" }, 400);
      }

      const prompt = `
      You are an expert tech recruiter and interview coach. 
      Generate a customized interview cheat sheet for a candidate interviewing at ${companyName}, based on their Resume Data.
      
      Generate the following intelligence:
      1. companyCulture: A 1-2 sentence summary of ${companyName}'s working culture.
      2. technicalFocus: What technology or architectural patterns they prioritize.
      3. recentNews: 2-3 recent (imagined or real) strategic shifts or news points about the company relevant to a tech interview.
      4. predictedQuestions: 3 difficult interview questions they are likely to ask THIS specific candidate based on their resume, along with strategy advice.
      
      Output ONLY a valid JSON object matching this structure:
      {
        "companyCulture": "...",
        "technicalFocus": "...",
        "recentNews": ["...", "..."],
        "predictedQuestions": [
          {
            "question": "...",
            "advice": "..."
          }
        ]
      }

      Resume Data:
      ${JSON.stringify(resumeData)}
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonMatch = aiResponse.response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      return c.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Cheat Sheet API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  });

export default aiRoute;
