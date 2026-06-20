/**
 * Zod schemas for all AI response types.
 *
 * These are used with LangChain's `.withStructuredOutput()` to guarantee
 * that AI responses always match the expected shape. This replaces the
 * fragile `match(/\{[\s\S]*\}/)` regex pattern used everywhere.
 */

import { z } from "zod";

// ── Mind Reader (Attention Heatmap) ──────────────────────────────────────────
export const HeatmapZoneSchema = z.object({
  x: z.number().min(0).max(100).describe("Horizontal position percentage (0-100)"),
  y: z.number().min(0).max(100).describe("Vertical position percentage (0-100)"),
  intensity: z.number().min(0).max(1).describe("Attention intensity (0.0-1.0)"),
  label: z.string().describe("What the recruiter is looking at"),
});

export const HeatmapResponseSchema = z.object({
  hotZones: z.array(HeatmapZoneSchema).min(4).max(8).describe("Attention zones on the resume"),
});

export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;

// ── Liar Detector (Fact Check) ───────────────────────────────────────────────
export const FactCheckFindingSchema = z.object({
  type: z.string().describe("Type of inconsistency, e.g. 'Temporal Inconsistency', 'Skill Gap'"),
  detail: z.string().describe("Detailed description of the finding"),
  severity: z.enum(["Critical", "Warning", "Info"]).describe("Severity level"),
});

export const FactCheckResponseSchema = z.object({
  veracityScore: z.number().min(0).max(100).describe("Overall credibility score (0-100)"),
  trustLevel: z.enum(["High", "Moderate", "Low", "Suspicious"]).describe("Trust classification"),
  findings: z.array(FactCheckFindingSchema).describe("List of findings"),
  verdict: z.string().describe("Summary of overall credibility"),
});

export type FactCheckResponse = z.infer<typeof FactCheckResponseSchema>;

// ── Interview Cheat Sheet ────────────────────────────────────────────────────
export const PredictedQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  advice: z.string().describe("Strategy advice for answering"),
});

export const CheatSheetResponseSchema = z.object({
  companyCulture: z.string().describe("Summary of company culture"),
  technicalFocus: z.string().describe("Technology and architecture focus"),
  recentNews: z.array(z.string()).describe("Recent company news points"),
  predictedQuestions: z.array(PredictedQuestionSchema).describe("Predicted interview questions"),
});

export type CheatSheetResponse = z.infer<typeof CheatSheetResponseSchema>;

// ── Interview Prep Assistant ─────────────────────────────────────────────────
export const StarHintSchema = z.object({
  s: z.string().describe("Situation hint"),
  t: z.string().describe("Task hint"),
  a: z.string().describe("Action hint"),
  r: z.string().describe("Result hint"),
});

export const InterviewQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  intent: z.string().describe("What the interviewer is looking for"),
  starHint: StarHintSchema.describe("STAR framework answer guide"),
});

export const WeakPointSchema = z.object({
  gap: z.string().describe("The identified weakness or gap"),
  pivot: z.string().describe("How to pivot this into a strength"),
});

export const InterviewPrepResponseSchema = z.object({
  questions: z.array(InterviewQuestionSchema).min(3).max(7).describe("Tailored interview questions"),
  weakPoints: z.array(WeakPointSchema).min(1).max(4).describe("Potential red flags with pivots"),
});

export type InterviewPrepResponse = z.infer<typeof InterviewPrepResponseSchema>;

// ── Skill Gap Analyzer ───────────────────────────────────────────────────────
export const CourseRecommendationSchema = z.object({
  skill: z.string().describe("The skill to learn"),
  course: z.string().describe("Course title"),
  platform: z.string().describe("Platform name (Coursera, Udemy, etc.)"),
  link: z.string().describe("Search query for finding the course"),
});

export const SkillGapResponseSchema = z.object({
  missingSkills: z.array(z.string()).min(2).max(6).describe("High-demand skills the candidate lacks"),
  trends: z.array(z.string()).min(2).max(5).describe("Industry trends in their field"),
  recommendations: z.array(CourseRecommendationSchema).min(2).max(4).describe("Course recommendations"),
});

export type SkillGapResponse = z.infer<typeof SkillGapResponseSchema>;

// ── Salary Estimator ─────────────────────────────────────────────────────────
export const PercentileSchema = z.object({
  label: z.string().describe("Percentile label (e.g. 'Entry', 'Median', 'Top 10%')"),
  value: z.string().describe("Salary value (e.g. '$145k')"),
});

export const SalaryEstimateResponseSchema = z.object({
  median: z.string().describe("Median salary estimate"),
  range: z.string().describe("Salary range (e.g. '$120k - $185k')"),
  percentiles: z.array(PercentileSchema).length(3).describe("25th, 50th, 75th percentile"),
  premiumSkills: z.array(z.string()).describe("Skills that increase market value"),
  growthTips: z.array(z.string()).describe("Skills to add for higher salary"),
});

export type SalaryEstimateResponse = z.infer<typeof SalaryEstimateResponseSchema>;

// ── Auto-Tailor Engine ───────────────────────────────────────────────────────
export const TailoredExperienceSchema = z.object({
  id: z.number().optional().describe("Original experience ID"),
  title: z.string().optional(),
  companyName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  currentlyWorking: z.boolean().optional(),
  workSummary: z.string().describe("Tailored HTML work summary"),
});

export const AutoTailorResponseSchema = z.object({
  summary: z.string().describe("Tailored professional summary"),
  experiences: z.array(TailoredExperienceSchema).describe("Tailored experiences"),
});

export type AutoTailorResponse = z.infer<typeof AutoTailorResponseSchema>;

// ── ATS Matcher ──────────────────────────────────────────────────────────────
export const AtsKeywordSchema = z.object({
  keyword: z.string().describe("The keyword or phrase"),
  found: z.boolean().describe("Whether it was found in the resume"),
  importance: z.enum(["Critical", "Important", "Nice-to-have"]).describe("Importance level"),
});

export const AtsMatchResponseSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall ATS match score"),
  matchedKeywords: z.array(AtsKeywordSchema).describe("Keywords analysis"),
  missingSections: z.array(z.string()).describe("Important resume sections missing"),
  suggestions: z.array(z.string()).describe("Actionable improvement suggestions"),
});

export type AtsMatchResponse = z.infer<typeof AtsMatchResponseSchema>;

// ── Resume Import (Section Detection) ────────────────────────────────────────
export const DetectedSectionSchema = z.object({
  type: z.enum([
    "personal_info",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "other",
  ]).describe("Section type"),
  content: z.string().describe("The raw text content of this section"),
});

export const SectionDetectionResponseSchema = z.object({
  sections: z.array(DetectedSectionSchema).describe("Detected resume sections"),
});

export type SectionDetectionResponse = z.infer<typeof SectionDetectionResponseSchema>;

// ── Resume Import (Personal Info Extraction) ─────────────────────────────────
export const PersonalInfoExtractionSchema = z.object({
  firstName: z.string().describe("First name"),
  lastName: z.string().describe("Last name"),
  jobTitle: z.string().describe("Current or target job title"),
  address: z.string().describe("Location / address"),
  phone: z.string().describe("Phone number"),
  email: z.string().describe("Email address"),
});

export type PersonalInfoExtraction = z.infer<typeof PersonalInfoExtractionSchema>;

// ── Resume Import (Experience Extraction) ────────────────────────────────────
export const ExperienceExtractionSchema = z.object({
  title: z.string().describe("Job title"),
  companyName: z.string().describe("Company name"),
  city: z.string().describe("City"),
  state: z.string().describe("State or region"),
  startDate: z.string().nullable().describe("Start date as YYYY-MM-DD or null"),
  endDate: z.string().nullable().describe("End date as YYYY-MM-DD or null"),
  currentlyWorking: z.boolean().describe("Whether currently working here"),
  responsibilities: z.array(z.string()).describe("List of responsibilities and achievements"),
});

export const ExperiencesExtractionSchema = z.object({
  experiences: z.array(ExperienceExtractionSchema).describe("All work experiences"),
});

export type ExperiencesExtraction = z.infer<typeof ExperiencesExtractionSchema>;

// ── Resume Import (Education Extraction) ─────────────────────────────────────
export const EducationExtractionSchema = z.object({
  universityName: z.string().describe("University or institution name"),
  degree: z.string().describe("Degree (e.g. Bachelor of Science)"),
  major: z.string().describe("Major or field of study"),
  startDate: z.string().nullable().describe("Start date as YYYY-MM-DD or null"),
  endDate: z.string().nullable().describe("End date as YYYY-MM-DD or null"),
  description: z.string().describe("Additional details (GPA, honors, etc.)"),
});

export const EducationsExtractionSchema = z.object({
  educations: z.array(EducationExtractionSchema).describe("All education entries"),
});

export type EducationsExtraction = z.infer<typeof EducationsExtractionSchema>;

// ── Resume Import (Skills Extraction) ────────────────────────────────────────
export const SkillExtractionSchema = z.object({
  name: z.string().describe("Skill name"),
  rating: z.number().min(1).max(5).describe("Proficiency rating (1-5)"),
});

export const SkillsExtractionSchema = z.object({
  skills: z.array(SkillExtractionSchema).describe("All skills"),
});

export type SkillsExtraction = z.infer<typeof SkillsExtractionSchema>;

// ── Resume Import (Summary Extraction) ───────────────────────────────────────
export const SummaryExtractionSchema = z.object({
  summary: z.string().describe("Professional summary or objective statement"),
});

export type SummaryExtraction = z.infer<typeof SummaryExtractionSchema>;

// ── Market Data ──────────────────────────────────────────────────────────────
export const MarketStatSchema = z.object({
  label: z.string().describe("Stat label"),
  value: z.string().describe("Stat value"),
  detail: z.string().describe("Additional detail or trend"),
});

export const TrendingSkillSchema = z.object({
  skill: z.string().describe("Skill name"),
  demand: z.number().min(0).max(100).describe("Demand percentage"),
  context: z.string().describe("Why this skill is trending"),
});

export const MarketRoleSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  location: z.string().describe("Location or remote"),
  range: z.string().describe("Salary range"),
});

export const MarketDataResponseSchema = z.object({
  stats: z.array(MarketStatSchema).min(3).max(5),
  skills: z.array(TrendingSkillSchema).min(3).max(6),
  roles: z.array(MarketRoleSchema).min(2).max(5),
});

export type MarketDataResponse = z.infer<typeof MarketDataResponseSchema>;

// ── Career Roadmap ───────────────────────────────────────────────────────────
export const RoadmapNodeSchema = z.object({
  year: z.string().describe("Timeline label (e.g. 'Now', '12 mo', '24 mo')"),
  status: z.string().describe("Status label (e.g. 'Current', 'Next', 'Projected')"),
  role: z.string().describe("Target role title"),
  company: z.string().describe("Type of company or team"),
  milestones: z.array(z.string()).min(1).max(4).describe("Key milestones to achieve"),
  active: z.boolean().describe("Whether this is the current stage"),
});

export const CareerRoadmapResponseSchema = z.object({
  roadmap: z.array(RoadmapNodeSchema).min(3).max(5),
  skillAccelerators: z.array(z.string()).min(1).max(4).describe("Recommended certifications or courses"),
});

export type CareerRoadmapResponse = z.infer<typeof CareerRoadmapResponseSchema>;

// ── Resume Doctor (AI Audit) ─────────────────────────────────────────────────
export const DoctorIssueSchema = z.object({
  type: z.enum(["critical", "warning", "optimization"]).describe("Issue severity"),
  message: z.string().describe("Short issue title"),
  detail: z.string().describe("Detailed explanation"),
  autoFix: z.string().optional().describe("Suggested auto-fix text"),
});

export const ResumeDoctorResponseSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall health score"),
  issues: z.array(DoctorIssueSchema).describe("Identified issues"),
  aiInsight: z.string().describe("High-level AI insight about the resume"),
});

export type ResumeDoctorResponse = z.infer<typeof ResumeDoctorResponseSchema>;

// ── Company Culture Fit Analyzer ─────────────────────────────────────────────
export const CultureSignalSchema = z.object({
  label: z.string().describe("Short signal description"),
  source: z.enum(["glassdoor", "linkedin", "news", "blog", "general"]).describe("Where this signal would come from"),
});

export const ValuesAlignmentSchema = z.object({
  dimension: z.enum([
    "engineering_culture",
    "work_life_balance",
    "career_growth",
    "compensation",
    "leadership_trust",
  ]),
  score: z.number().min(1).max(5).describe("Alignment score 1-5"),
  note: z.string().describe("One-line evidence summary"),
});

export const CultureFitResponseSchema = z.object({
  company: z.string(),
  overallScore: z.number().min(0).max(100).describe("Overall fit 0-100"),
  confidence: z.enum(["low", "medium", "high"]).describe("How confident the analysis is"),
  headline: z.string().describe("One-line punchy insight"),
  pros: z.array(CultureSignalSchema).min(1).max(6),
  cons: z.array(CultureSignalSchema).min(1).max(6),
  valuesAlignment: z.array(ValuesAlignmentSchema).length(5),
});

export type CultureFitResponse = z.infer<typeof CultureFitResponseSchema>;

// ── Job Offer Comparison ─────────────────────────────────────────────────────
export const OfferRecommendationSchema = z.object({
  recommendedOfferId: z.string().describe("The id of the recommended offer"),
  reasoning: z.string().describe("Why this offer wins for this candidate"),
  tradeoffs: z.array(z.string()).min(1).max(6),
  riskFlags: z.array(z.string()).max(6),
});

export type OfferRecommendation = z.infer<typeof OfferRecommendationSchema>;
