import { z } from "zod";
import { chatModel } from "@/lib/langchain";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface NetworkingMessage {
  type: "follow_up" | "thank_you" | "negotiation_prep" | "referral_request";
  channel: "linkedin" | "email";
  subject?: string;
  body: string;
  timing: string;
}

export interface NetworkingOutput {
  company: string;
  role: string;
  stage: string;
  messages: NetworkingMessage[];
  recruiterTargets: string[];
  tips: string[];
}

export type ApplicationStage = "applied" | "interviewing" | "offer" | "rejected";

// ---------------------------------------------------------------------------
// Zod schema for structured LLM output
// ---------------------------------------------------------------------------

const networkingOutputSchema = z.object({
  messages: z.array(
    z.object({
      type: z.enum(["follow_up", "thank_you", "negotiation_prep", "referral_request"]),
      channel: z.enum(["linkedin", "email"]),
      subject: z.string().optional(),
      body: z.string(),
      timing: z.string(),
    }),
  ).min(1).max(6),
  recruiterTargets: z.array(z.string()).min(1).max(5),
  tips: z.array(z.string()).min(1).max(5),
});

// ---------------------------------------------------------------------------
// Stage-specific system prompts
// ---------------------------------------------------------------------------

const STAGE_PROMPTS: Record<ApplicationStage, string> = {
  applied: `You are an expert networking strategist for job seekers who just applied to a position.
Generate outreach that helps the candidate stand out after applying:
- A follow-up message to a recruiter or hiring manager expressing continued interest
- A referral request message for connections who work at the target company
- Timing guidance for when each message should be sent
Messages should be genuine, not spammy. Never claim a personal connection that does not exist.`,

  interviewing: `You are an expert networking strategist for job seekers currently in the interview process.
Generate outreach appropriate for the interview stage:
- A thank-you note after an interview round
- Preparation tips and talking points for the next round
- A follow-up that keeps momentum without being pushy
Messages should be professional and appreciative. Never claim a personal connection that does not exist.`,

  offer: `You are an expert networking strategist for job seekers who received a job offer.
Generate outreach for the offer/negotiation stage:
- Negotiation talking points and strategy
- A counter-offer template that is respectful and data-driven
- A thank-you message to everyone involved in the process
Messages should be confident but collaborative. Never claim a personal connection that does not exist.`,

  rejected: `You are an expert networking strategist for job seekers who were not selected.
Generate graceful post-rejection outreach:
- A professional close message thanking them for the opportunity
- A request for constructive feedback
- A "keep in touch" note that leaves the door open for future roles
Messages should be gracious and forward-looking. Never claim a personal connection that does not exist.`,
};

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export async function generateStageBasedOutreach(params: {
  company: string;
  role: string;
  stage: ApplicationStage;
  resumeContext?: string;
  previousOutreach?: string[];
}): Promise<NetworkingOutput> {
  const { company, role, stage, resumeContext, previousOutreach } = params;

  const model = chatModel.withStructuredOutput(networkingOutputSchema);

  const previousOutreachBlock = previousOutreach && previousOutreach.length > 0
    ? `\n\nPrevious outreach already sent:\n${previousOutreach.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\nDo NOT duplicate the same messaging. Adapt and add new angles.`
    : "";

  const resumeBlock = resumeContext
    ? `\n\nCandidate background context:\n${resumeContext}`
    : "";

  const result = await model.invoke([
    {
      role: "system",
      content: STAGE_PROMPTS[stage],
    },
    {
      role: "user",
      content: `Company: ${company}\nRole: ${role}\nStage: ${stage}${resumeBlock}${previousOutreachBlock}`,
    },
  ]);

  return {
    company,
    role,
    stage,
    messages: result.messages.map((m: { type: string; channel: string; subject?: string; body: string; timing: string }) => ({
      type: m.type,
      channel: m.channel,
      subject: m.subject,
      body: m.body,
      timing: m.timing,
    })),
    recruiterTargets: result.recruiterTargets,
    tips: result.tips,
  };
}
