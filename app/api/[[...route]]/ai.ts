import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  chatModel,
  mindReaderPrompt,
  HeatmapResponseSchema,
  timeTravelerPrompt,
  factCheckPrompt,
  FactCheckResponseSchema,
  cheatSheetPrompt,
  CheatSheetResponseSchema,
  interviewPrepPrompt,
  InterviewPrepResponseSchema,
  skillGapPrompt,
  SkillGapResponseSchema,
  salaryEstimatePrompt,
  SalaryEstimateResponseSchema,
  resumeRoastPrompt,
  atsMatchPrompt,
  AtsMatchResponseSchema,
  autoTailorPrompt,
  AutoTailorResponseSchema,
  resumeDoctorPrompt,
  ResumeDoctorResponseSchema,
  careerRoadmapPrompt,
  CareerRoadmapResponseSchema,
  marketDataPrompt,
  MarketDataResponseSchema,
} from "@/lib/langchain";

const aiRoute = new Hono()
  .post("/chat", getAuthUser, async (c) => {
    try {
      const { prompt } = await c.req.json();
      const response = await chatModel.invoke([{ role: "user", content: prompt }]);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      return c.json({ text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/mind-reader", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(HeatmapResponseSchema);
      const chain = mindReaderPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Mind Reader API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/time-traveler", getAuthUser, async (c) => {
    try {
      const { resumeData, targetYear = 2030 } = await c.req.json();
      const formattedPrompt = await timeTravelerPrompt.format({
        targetYear,
        resumeData: JSON.stringify(resumeData),
      });
      const response = await chatModel.invoke(formattedPrompt);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
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
      const modelWithStructuredOutput = chatModel.withStructuredOutput(FactCheckResponseSchema);
      const chain = factCheckPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
      });
      return c.json(response as any);
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

      const modelWithStructuredOutput = chatModel.withStructuredOutput(CheatSheetResponseSchema);
      const chain = cheatSheetPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        companyName,
        resumeData: JSON.stringify(resumeData),
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Cheat Sheet API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/interview-prep", getAuthUser, async (c) => {
    try {
      const { resumeData, jobDescription } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(InterviewPrepResponseSchema);
      const chain = interviewPrepPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
        jobDescription,
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Interview Prep API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/skill-gap", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(SkillGapResponseSchema);
      const chain = skillGapPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Skill Gap API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/salary-estimate", getAuthUser, async (c) => {
    try {
      const { resumeData, jobTitle, experienceCount, skills } = await c.req.json();
      const finalJobTitle = jobTitle || resumeData?.personalInfo?.jobTitle || "Software Engineer";
      const finalExpCount = experienceCount !== undefined ? experienceCount : (resumeData?.experiences?.length || 0);
      const finalSkills = skills || (resumeData?.skills?.map((s: any) => s.name).join(", ") || "");

      const modelWithStructuredOutput = chatModel.withStructuredOutput(SalaryEstimateResponseSchema);
      const chain = salaryEstimatePrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        jobTitle: finalJobTitle,
        experienceCount: String(finalExpCount),
        skills: finalSkills,
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Salary Estimate API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/resume-roast", getAuthUser, async (c) => {
    try {
      const { resumeData, personaPrompt } = await c.req.json();
      const formattedPrompt = await resumeRoastPrompt.format({
        personaPrompt,
        resumeData: JSON.stringify(resumeData),
      });
      const response = await chatModel.invoke(formattedPrompt);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      return c.json({ roast: text });
    } catch (error: any) {
      console.error("Resume Roast API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/ats-match", getAuthUser, async (c) => {
    try {
      const { resumeData, jobDescription } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(AtsMatchResponseSchema);
      const chain = atsMatchPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
        jobDescription,
      }) as any;

      // Map to backward-compatible frontend format
      const missingKeywords = response.matchedKeywords
        .filter((k: any) => !k.found)
        .map((k: any) => k.keyword);

      return c.json({
        score: response.score,
        missingKeywords,
        suggestions: response.suggestions,
      });
    } catch (error: any) {
      console.error("ATS Match API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/auto-tailor", getAuthUser, async (c) => {
    try {
      const { resumeData, jobDescription } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(AutoTailorResponseSchema);
      const chain = autoTailorPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
        jobDescription,
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Auto Tailor API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/resume-doctor", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(ResumeDoctorResponseSchema);
      const chain = resumeDoctorPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData),
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Resume Doctor API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/interview-session", getAuthUser, async (c) => {
    try {
      const { resumeData, jobDescription, targetRole, messages } = await c.req.json();
      
      const historyStr = messages
        .map((m: any) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
        .join("\n\n");

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are an elite AI Technical Recruiter and Career Coach. You are conducting a mock technical/behavioral interview.
Target Role: {targetRole}
Job Description: {jobDescription}

Candidate Resume:
{resumeData}

Current conversation history:
{history}

Your task:
- If history is empty, greet the candidate warmly and ask the FIRST question. Focus on their background and why they fit the role.
- If history contains questions and answers:
  1. Analyze the candidate's latest answer. Evaluate it for structure (e.g. STAR method), clarity, and technical depth.
  2. If there are fewer than 3 questions asked so far, give 1 sentence of encouraging feedback, and ask the NEXT challenging question.
  3. If they have answered 3 questions, do NOT ask another question. Instead, return a JSON report evaluating their overall performance.

Return format:
- For questions/dialogue:
  {{
    "type": "question",
    "text": "Your next question goes here."
  }}
- For the final evaluation (only when 3 questions have been answered):
  {{
    "type": "evaluation",
    "deliveryScore": 85,
    "contentScore": 90,
    "findings": ["finding 1", "finding 2"],
    "actionItems": ["action item 1", "action item 2"],
    "summary": "Overall summary of performance."
  }}

Ensure you return ONLY a valid JSON object matching the structures above.`,
        ],
      ]);

      const InterviewSessionResponseSchema = z.discriminatedUnion("type", [
        z.object({
          type: z.literal("question"),
          text: z.string().describe("The next question or greeting"),
        }),
        z.object({
          type: z.literal("evaluation"),
          deliveryScore: z.number().min(0).max(100).describe("Delivery score"),
          contentScore: z.number().min(0).max(100).describe("Content score"),
          findings: z.array(z.string()).describe("Findings"),
          actionItems: z.array(z.string()).describe("Action items"),
          summary: z.string().describe("Summary of performance"),
        }),
      ]);

      const modelWithStructuredOutput = chatModel.withStructuredOutput(InterviewSessionResponseSchema);
      const chain = prompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        targetRole: targetRole || "Software Engineer",
        jobDescription: jobDescription || "General Technical Role",
        resumeData: JSON.stringify(resumeData || {}),
        history: historyStr,
      });

      return c.json(response as any);
    } catch (error: any) {
      console.error("Interview Session API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/career-roadmap", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      const modelWithStructuredOutput = chatModel.withStructuredOutput(CareerRoadmapResponseSchema);
      const chain = careerRoadmapPrompt.pipe(modelWithStructuredOutput);
      const response = await chain.invoke({
        resumeData: JSON.stringify(resumeData || {}),
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Career Roadmap API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/market-data", getAuthUser, async (c) => {
    try {
      const { jobTitle, skills, region = "USA" } = await c.req.json();
      
      let searchContext = "";
      if (process.env.TAVILY_API_KEY) {
        try {
          const searchRes = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: `salary range market demand hiring prospects and open positions for ${jobTitle} with ${skills} in region ${region}`,
              search_depth: "basic",
            }),
          });
          
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            searchContext = searchData.results
              ?.map((r: any) => `${r.title}: ${r.content}`)
              .join("\n\n") || "";
          }
        } catch (searchErr) {
          console.warn("Tavily search failed, falling back to LLM estimation:", searchErr);
        }
      }

      const modelWithStructuredOutput = chatModel.withStructuredOutput(MarketDataResponseSchema);
      const chain = marketDataPrompt.pipe(modelWithStructuredOutput);
      
      const skillsWithSearch = searchContext 
        ? `${skills || "None"}\n\nLive Search Market Context:\n${searchContext}`
        : (skills || "JavaScript, TypeScript, React");

      const response = await chain.invoke({
        jobTitle: jobTitle || "Software Engineer",
        skills: skillsWithSearch,
        region,
      });
      return c.json(response as any);
    } catch (error: any) {
      console.error("Market Data API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  })
  .post("/resume-doctor-fix", getAuthUser, async (c) => {
    try {
      const { resumeData } = await c.req.json();
      
      const prompt = `You are a professional resume writer and career coach. Review the provided resume data and automatically fix all structural, grammar, impact, passive voice, and missing details issues.
Rewrite the professional summary to be high impact.
For experiences, rewrite the workSummary descriptions to use power verbs and introduce quantifiable metrics where appropriate. Keep the exact HTML list structure (<ul><li>).
Ensure you do not alter core facts, dates, company names, or educational degrees. Keep the exact same JSON keys and structure.

Return the FULL updated resume JSON object matching the exact schema of the input.`;

      const response = await chatModel.invoke([
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify(resumeData) }
      ]);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      return c.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Resume Doctor Fix API Error:", error);
      return c.json({ error: error.message }, 500);
    }
  });

export default aiRoute;
