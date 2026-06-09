import { z } from "zod";
import { chatModel } from "@/lib/langchain";

export interface ApplicationPackage {
  jobId: string;
  tailoredSummary: string;
  tailoredBulletPoints: { section: string; original: string; tailored: string }[];
  coverLetter: string;
  commonAnswers: { question: string; answer: string }[];
  matchScore: number;
  gaps: string[];
}

const applicationPackageSchema = z.object({
  tailoredSummary: z.string().describe("A tailored professional summary that aligns the candidate's background with the job description"),
  tailoredBulletPoints: z.array(
    z.object({
      section: z.string().describe("Which resume section this bullet belongs to (e.g. 'Experience', 'Skills', 'Summary')"),
      original: z.string().describe("The original text from the resume"),
      tailored: z.string().describe("The rewritten, tailored version for this specific job"),
    }),
  ).min(1).max(8).describe("Key bullet points rewritten to match the job description"),
  coverLetter: z.string().describe("A compelling cover letter tailored to this specific role and company"),
  commonAnswers: z.array(
    z.object({
      question: z.string(),
      answer: z.string().describe("A strong, authentic answer using STAR method where applicable"),
    }),
  ).min(3).max(5).describe("Answers to common interview questions for this role"),
  matchScore: z.number().min(0).max(100).describe("Percentage of JD requirements matched by the resume (0-100)"),
  gaps: z.array(z.string()).min(0).max(8).describe("Specific skills or experience gaps between resume and job requirements"),
});

export async function generateApplicationPackage(
  resumeData: any,
  jobDescription: string,
  jobTitle: string,
  company: string,
): Promise<ApplicationPackage> {
  const model = chatModel.withStructuredOutput(applicationPackageSchema);

  const result = await model.invoke([
    {
      role: "system",
      content: `You are an elite career strategist and application coach. Your goal is to create a compelling, authentic application package that maximizes the candidate's chances of landing an interview.

Rules:
- Never invent facts about the candidate. Only use information present in their resume.
- Tailor language to match the job description's keywords and tone.
- Rewrite bullet points to be achievement-oriented and JD-aligned.
- The cover letter should be 3-4 paragraphs, professional but personable.
- Common answers should use the STAR method (Situation, Task, Action, Result) where applicable.
- Match score must be an honest assessment — don't inflate it.
- Gaps should be constructive (e.g. "No explicit leadership experience mentioned" rather than "Unqualified").`,
    },
    {
      role: "user",
      content: buildPrompt(resumeData, jobDescription, jobTitle, company),
    },
  ]);

  return {
    jobId: `${company}-${jobTitle}-${Date.now()}`,
    tailoredSummary: result.tailoredSummary,
    tailoredBulletPoints: result.tailoredBulletPoints,
    coverLetter: result.coverLetter,
    commonAnswers: result.commonAnswers,
    matchScore: result.matchScore,
    gaps: result.gaps,
  };
}

function buildPrompt(
  resumeData: any,
  jobDescription: string,
  jobTitle: string,
  company: string,
): string {
  const summary = resumeData.summary || "No summary provided";
  const personalInfo = resumeData.personalInfo || {};
  const experiences = (resumeData.experiences || []).map((exp: any) => ({
    title: exp.title,
    company: exp.companyName,
    summary: exp.workSummary,
  }));
  const skills = (resumeData.skills || []).map((s: any) => s.name).filter(Boolean);
  const educations = (resumeData.educations || []).map((edu: any) => ({
    school: edu.universityName,
    degree: edu.degree,
    major: edu.major,
  }));

  return `CANDIDATE RESUME:
Name: ${personalInfo.firstName || ""} ${personalInfo.lastName || ""}
Job Title: ${personalInfo.jobTitle || "Not specified"}
Summary: ${summary}

Experience:
${experiences.map((e: any) => `- ${e.title} at ${e.company}: ${e.summary || "No summary"}`).join("\n")}

Education:
${educations.map((e: any) => `- ${e.degree} in ${e.major} from ${e.school}`).join("\n")}

Skills: ${skills.join(", ")}

TARGET JOB:
Company: ${company}
Role: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

Please generate a complete application package based on the above.`;
}
