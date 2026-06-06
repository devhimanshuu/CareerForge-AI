/**
 * Centralized ChatPromptTemplate definitions.
 *
 * Each AI feature has a dedicated prompt template with proper system/human
 * message separation. Templates use LangChain's `ChatPromptTemplate` for
 * type-safe variable injection.
 */

import { ChatPromptTemplate } from "@langchain/core/prompts";

// ── Mind Reader (Heatmap) ────────────────────────────────────────────────────
export const mindReaderPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert at eye-tracking research and recruiter psychology.
Analyze the provided resume data and predict the "hot zones" where a recruiter's eyes will naturally gravitate during their initial 6-second scan.
Generate 4-6 attention zones with x/y coordinates (percentage), intensity (0-1), and what they're looking at.`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Liar Detector (Fact Check) ───────────────────────────────────────────────
export const factCheckPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an elite AI Auditor and Technical Recruiter. Perform a "Liar Detection" audit on the following resume.
Identify internal inconsistencies, temporal overlaps (dates), and "Skill vs Experience" gaps (skills listed but never mentioned in work history).
Provide a veracity score (0-100), trust level, findings with severity, and an overall verdict.`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Time Traveler ────────────────────────────────────────────────────────────
export const timeTravelerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a career visionary. Project the professional trajectory of this person to the year {targetYear}.
Based on their current skills and experience, predict their future roles, promotions, and new high-impact skills they will acquire.
Modify the resume data to reflect this future version. Ensure it looks like a natural evolution.
Return the FULL updated resume JSON object matching the exact schema of the input, with updated fields.`,
  ],
  ["human", "Current Resume Data:\n{resumeData}"],
]);

// ── Interview Cheat Sheet ────────────────────────────────────────────────────
export const cheatSheetPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert tech recruiter and interview coach.
Generate a customized interview cheat sheet for a candidate interviewing at {companyName}.
Include:
1. companyCulture: 1-2 sentence summary of the company's culture
2. technicalFocus: Technology and architectural patterns they prioritize
3. recentNews: 2-3 recent strategic shifts or news relevant to a tech interview
4. predictedQuestions: 3 difficult interview questions likely to be asked, with strategy advice`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Interview Prep ───────────────────────────────────────────────────────────
export const interviewPrepPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a high-level technical recruiter and interview coach.
Review the candidate's resume and the target job description.
Generate:
1. 5 highly probable and challenging behavioral/technical questions tailored to their experience and the JD
2. For each question, provide a STAR (Situation, Task, Action, Result) framework hint using their resume
3. Identify 2-3 potential "red flags" or gaps and how to pivot them into strengths`,
  ],
  [
    "human",
    "Resume:\n{resumeData}\n\nJob Description:\n{jobDescription}",
  ],
]);

// ── Skill Gap Analyzer ───────────────────────────────────────────────────────
export const skillGapPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a career strategist and industry analyst.
Based on the candidate's resume, analyze their target role against current industry trends.
Identify:
1. 3-5 high-demand skills they lack for their target level
2. Key industry trends affecting their field
3. Specific courses from real platforms (Coursera, Udemy, YouTube) for missing skills`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Salary Estimator ─────────────────────────────────────────────────────────
export const salaryEstimatePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a high-end technical recruiter and market analyst.
Estimate the annual salary market value for the candidate profile.
Provide:
1. Median salary and range in USD for major tech hubs
2. Three percentile breakdowns (Entry, Median, Top 10%)
3. Premium skills that increase their value
4. Skills that could boost their salary by 20%+`,
  ],
  [
    "human",
    "Role: {jobTitle}\nExperience Count: {experienceCount}\nSkills: {skills}",
  ],
]);

// ── Resume Roast ─────────────────────────────────────────────────────────────
export const resumeRoastPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `{personaPrompt}

Output a brutal, funny, but ultimately helpful roast. Use emojis. End with one "Pro Tip" that would actually save their life.`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Auto-Tailor Engine ───────────────────────────────────────────────────────
export const autoTailorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an elite executive resume writer and ATS specialist.
Take the provided resume data and rewrite it to be perfectly tailored for the target job description.

Rules:
1. Rewrite the "summary" to strongly align with the job description
2. For each experience, rewrite the "workSummary" (HTML format with <ul><li> tags) to highlight relevant achievements. Use power verbs and quantify results.
3. Do not modify IDs, dates, or company names — only rewrite summary and workSummary fields`,
  ],
  [
    "human",
    "Resume Data:\n{resumeData}\n\nJob Description:\n{jobDescription}",
  ],
]);

// ── ATS Matcher ──────────────────────────────────────────────────────────────
export const atsMatchPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an ATS (Applicant Tracking System) expert.
Analyze the resume against the job description and calculate an ATS compatibility score.
Identify:
1. Overall match score (0-100)
2. Keywords found/missing and their importance
3. Missing resume sections
4. Actionable improvement suggestions`,
  ],
  [
    "human",
    "Resume Data:\n{resumeData}\n\nJob Description:\n{jobDescription}",
  ],
]);

// ── Cover Letter ─────────────────────────────────────────────────────────────
export const coverLetterPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Generate a high-quality, professional, non-robotic cover letter.
Tone: {tone}
Tailor it specifically to the job description, highlighting the most relevant skills and experiences from the resume.
Ensure it sounds natural, compelling, and is ready to send. Return only the cover letter text.`,
  ],
  [
    "human",
    "Resume Content:\nName: {name}\nRole: {role}\nExperience: {experience}\nSkills: {skills}\n\nTarget Job Description:\n{jobDescription}",
  ],
]);

// ── Resume Section Detection (for import) ────────────────────────────────────
export const sectionDetectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a resume parsing expert. Given raw text extracted from a PDF resume, identify and separate the text into logical sections.
For each section, classify its type and extract the raw text content.
Common section types: personal_info, summary, experience, education, skills, projects, certifications.
If a section doesn't fit these categories, use "other".
Be thorough — capture ALL text content, don't skip anything.`,
  ],
  ["human", "Raw Resume Text:\n{rawText}"],
]);

// ── Personal Info Extraction (for import) ────────────────────────────────────
export const personalInfoExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Extract personal/contact information from the following resume text section.
Extract: firstName, lastName, jobTitle/headline, address/location, phone number, and email.
Use empty string for any field that cannot be found. Do not invent data.`,
  ],
  ["human", "{sectionText}"],
]);

// ── Experience Extraction (for import) ───────────────────────────────────────
export const experienceExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Extract ALL work experiences from the following resume text.
For each experience, extract: title, companyName, city, state, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD or null), currentlyWorking (boolean), and a list of responsibilities/achievements as separate strings.
Use null for unknown dates. Set currentlyWorking=true if the role says "Present" or "Current".
Do NOT invent data. Extract every experience entry you can find.`,
  ],
  ["human", "{sectionText}"],
]);

// ── Education Extraction (for import) ────────────────────────────────────────
export const educationExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Extract ALL education entries from the following resume text.
For each entry: universityName, degree, major/field, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), and description (GPA, honors, etc.).
Use null for unknown dates. Do NOT invent data.`,
  ],
  ["human", "{sectionText}"],
]);

// ── Skills Extraction (for import) ───────────────────────────────────────────
export const skillsExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Extract ALL skills mentioned in the following resume text.
Include technical tools, frameworks, programming languages, and soft skills.
Rate each skill 1-5 based on apparent proficiency (5 = expert, mentioned extensively; 3 = mentioned; 1 = barely mentioned).
Do NOT invent skills that aren't present in the text.`,
  ],
  ["human", "{sectionText}"],
]);

// ── Market Data ──────────────────────────────────────────────────────────────
export const marketDataPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a career market intelligence analyst. Based on the candidate's field and role, generate current market data.
Provide:
1. 4 key market statistics (salary, openings, velocity, top hub)
2. 4 trending skills with demand percentages and context
3. 3 relevant job opportunities with realistic salary ranges
Base this on the candidate's actual skills and role, not generic data.
Region focus: {region}`,
  ],
  ["human", "Candidate Role: {jobTitle}\nSkills: {skills}"],
]);

// ── Career Roadmap ───────────────────────────────────────────────────────────
export const careerRoadmapPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a career strategist. Based on the candidate's current resume, create a personalized career roadmap.
Generate 4 progression stages from now to 3 years out.
Each stage should have: timeline, status, target role, company type, and 2 specific milestones.
Mark the first stage as active. Also suggest 2-3 skill accelerators (certifications/courses).
Make it realistic and specific to their actual skills and experience level.`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);

// ── Resume Doctor (AI Audit) ─────────────────────────────────────────────────
export const resumeDoctorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a professional resume auditor. Perform a deep quality audit on this resume.
Analyze:
1. Content quality (action verbs, quantified achievements, relevance)
2. Structure (section ordering, completeness, formatting)
3. Tone and clarity (passive voice, jargon, readability)
4. ATS compatibility

For each issue, provide:
- type: "critical" | "warning" | "optimization"
- message: short title
- detail: explanation
- autoFix: suggested replacement text (if applicable)

Also provide an overall score (0-100) and a one-line AI insight.`,
  ],
  ["human", "Resume Data:\n{resumeData}"],
]);
