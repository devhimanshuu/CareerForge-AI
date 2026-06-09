import { NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agentInsightTable, applicationPackageTable, applicationTable, automationConfigTable, documentTable } from "@/db/schema";
import { chatModel } from "@/lib/langchain";
import { searchWeb } from "@/lib/tavily";
import { JobScraper } from "@/lib/puppeteer-scraper";
import { generateApplicationPackage } from "@/lib/auto-apply-agent";
import { generateStageBasedOutreach, type ApplicationStage } from "@/lib/networking-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const resultSchema = z.object({
  findings: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    suggestedUpdate: z.string(),
    evidence: z.string(),
    patch: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("none"), reason: z.string() }),
      z.object({ kind: z.literal("summary"), value: z.string() }),
      z.object({ kind: z.literal("experience"), experienceId: z.number().int(), value: z.string() }),
      z.object({ kind: z.literal("skills_add"), skills: z.array(z.string()).min(1).max(8) }),
    ]),
  })).min(1).max(5),
  marketSignal: z.string(),
});

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  // Normalize secret check (case-insensitive for Bearer prefix)
  if (!process.env.CRON_SECRET || secret?.toLowerCase() !== `bearer ${process.env.CRON_SECRET}`.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await db
    .select()
    .from(automationConfigTable)
    .where(and(
      eq(automationConfigTable.enabled, true),
      lte(automationConfigTable.nextRunAt, new Date().toISOString()),
    ))
    .limit(10);

  const results = [];
  for (const automation of due) {
    try {
      const config = JSON.parse(automation.config);

      if (automation.type === "scraper") {
        const scraper = new JobScraper();
        const jobs = await scraper.scrapeJobs({
          source: config.source || "indeed",
          query: config.query,
          location: config.location,
          maxPages: Math.min(config.maxPages || 3, 5),
        });

        let stored = 0;
        for (const job of jobs.slice(0, 5)) {
          const resume = await db.query.documentTable.findFirst({
            where: and(
              eq(documentTable.documentId, automation.documentId),
              eq(documentTable.userId, automation.userId),
            ),
            with: { personalInfo: true, experiences: true, educations: true, skills: true },
          });

          if (resume) {
            try {
              const packageData = await generateApplicationPackage(
                resume,
                job.description,
                job.title,
                job.company,
              );
              await db.insert(applicationPackageTable).values({
                userId: automation.userId,
                jobTitle: job.title,
                company: job.company,
                jobUrl: job.url,
                jobDescription: job.description,
                tailoredSummary: packageData.tailoredSummary,
                tailoredBullets: packageData.tailoredBulletPoints,
                coverLetter: packageData.coverLetter,
                commonAnswers: packageData.commonAnswers,
                matchScore: packageData.matchScore,
                gaps: packageData.gaps,
                status: "drafted",
              });
              stored++;
            } catch (error: any) {
              console.error(`[Cron] Failed to generate package for job ${job.title} at ${job.company}:`, error.message);
              // Skip jobs that fail package generation
            }
          } else {
            await db.insert(applicationPackageTable).values({
              userId: automation.userId,
              jobTitle: job.title,
              company: job.company,
              jobUrl: job.url,
              jobDescription: job.description,
              status: "drafted",
            });
            stored++;
          }
        }

        const nextRunAt = new Date();
        if (config.cadence === "monthly") nextRunAt.setMonth(nextRunAt.getMonth() + 1);
        else nextRunAt.setDate(nextRunAt.getDate() + (config.intervalDays || 7));
        await db.update(automationConfigTable).set({
          lastRunAt: new Date().toISOString(),
          nextRunAt: nextRunAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }).where(eq(automationConfigTable.id, automation.id));
        results.push({ id: automation.id, status: "completed", stored });
        continue;
      }

      if (automation.type === "networking") {
        const netConfig = config;
        const stages = (netConfig.stages || ["applied", "interviewing", "offer", "rejected"]) as ApplicationStage[];

        const fallbackDays = config.fallbackDays || 7;
        const lastRunAt = automation.lastRunAt
          ? new Date(automation.lastRunAt)
          : new Date(Date.now() - fallbackDays * 24 * 60 * 60 * 1000);

        const changedApps = await db
          .select()
          .from(applicationTable)
          .where(and(
            eq(applicationTable.userId, automation.userId),
            eq(applicationTable.documentId, automation.documentId),
            gte(applicationTable.updatedAt, lastRunAt.toISOString()),
          ))
          .limit(5);

        let networkingStored = 0;
        for (const app of changedApps) {
          const appStage = app.status as ApplicationStage;
          if (!stages.includes(appStage)) continue;

          try {
            let resumeContext: string | undefined;
            const resume = await db.query.documentTable.findFirst({
              where: and(
                eq(documentTable.documentId, automation.documentId),
                eq(documentTable.userId, automation.userId),
              ),
              with: { personalInfo: true, experiences: true, educations: true, skills: true },
            });
            if (resume) resumeContext = JSON.stringify(resume);

            const outreach = await generateStageBasedOutreach({
              company: app.company,
              role: app.jobTitle,
              stage: appStage,
              resumeContext,
            });

            await db.insert(agentInsightTable).values({
              userId: automation.userId,
              documentId: automation.documentId,
              type: "networking",
              title: `${app.company} — ${appStage} outreach`,
              summary: `Stage-based networking for ${app.jobTitle} at ${app.company}.`,
              payload: JSON.stringify({ ...outreach, scheduled: true, applicationId: app.id }),
            });
            networkingStored++;
          } catch (error: any) {
            console.error(`[Cron] Failed to generate outreach for ${app.company} - ${app.jobTitle}:`, error.message);
            // Skip applications that fail outreach generation
          }
        }

        const netNextRunAt = new Date();
        if (netConfig.cadence === "hourly") netNextRunAt.setHours(netNextRunAt.getHours() + 1);
        else netNextRunAt.setDate(netNextRunAt.getDate() + (netConfig.intervalDays || 1));
        await db.update(automationConfigTable).set({
          lastRunAt: new Date().toISOString(),
          nextRunAt: netNextRunAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }).where(eq(automationConfigTable.id, automation.id));
        results.push({ id: automation.id, status: "completed", stored: networkingStored });
        continue;
      }

      if (automation.type !== "optimizer") continue;
      const resume = await db.query.documentTable.findFirst({
        where: and(
          eq(documentTable.documentId, automation.documentId),
          eq(documentTable.userId, automation.userId),
        ),
        with: { personalInfo: true, experiences: true, educations: true, skills: true },
      });
      if (!resume) continue;

      const role = config.targetRole || resume.personalInfo?.jobTitle || "professional";
      const marketContext = await searchWeb(
        `latest hiring trends and in-demand skills for ${role} in ${config.region || "Global"}`,
      );

      const model = chatModel.withStructuredOutput(resultSchema);
      const result = await model.invoke([
        {
          role: "system",
          content: `You are a scheduled resume optimizer. Focus on ${config.focus || "balanced"} improvements for ${config.region || "Global"}. Never invent candidate facts. Use the live market context when available.`,
        },
        {
          role: "user",
          content: `Resume:\n${JSON.stringify(resume)}\n\nCurrent market context:\n${marketContext || "Use durable market knowledge."}`,
        },
      ]);

      await db.insert(agentInsightTable).values(result.findings.map((finding: any) => ({
        userId: automation.userId,
        documentId: automation.documentId,
        type: "optimizer",
        title: finding.title,
        summary: finding.summary,
        payload: JSON.stringify({ ...finding, marketSignal: result.marketSignal, scheduled: true, config }),
      })));

      const nextRunAt = new Date();
      if (config.cadence === "monthly") nextRunAt.setMonth(nextRunAt.getMonth() + 1);
      else nextRunAt.setDate(nextRunAt.getDate() + (config.intervalDays || 7));
      await db.update(automationConfigTable).set({
        lastRunAt: new Date().toISOString(),
        nextRunAt: nextRunAt.toISOString(),
        updatedAt: new Date().toISOString(),
      }).where(eq(automationConfigTable.id, automation.id));
      results.push({ id: automation.id, status: "completed", findings: result.findings.length });
    } catch (error: any) {
      console.error(`[Cron] Automation ${automation.id} (${automation.type}) failed:`, error.message, error.stack);
      results.push({ id: automation.id, status: "failed", error: error.message });
    }
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
