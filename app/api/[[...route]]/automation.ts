import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  agentInsightTable,
  automationConfigTable,
  documentTable,
  experienceTable,
  integrationSnapshotTable,
  skillsTable,
} from "@/db/schema";
import { getAuthUser } from "@/lib/clerk";
import { chatModel } from "@/lib/langchain";
import { searchWeb } from "@/lib/tavily";

const optimizerSchema = z.object({
  findings: z.array(
    z.object({
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
    }),
  ).min(2).max(6),
  marketSignal: z.string(),
});

const networkingSchema = z.object({
  companyBrief: z.string(),
  recruiterTargets: z.array(
    z.object({
      title: z.string(),
      searchStrategy: z.string(),
      reason: z.string(),
    }),
  ).min(2).max(5),
  linkedinMessage: z.string(),
  emailMessage: z.string(),
  followUps: z.array(z.string()).min(1).max(4),
});

const automationRoute = new Hono()
  .get("/insights", getAuthUser, async (c) => {
    const user = c.get("user");
    const insights = await db
      .select()
      .from(agentInsightTable)
      .where(eq(agentInsightTable.userId, user.id))
      .orderBy(desc(agentInsightTable.createdAt))
      .limit(100);
    return c.json({ success: true, insights: insights.map(parseInsight) });
  })
  .patch(
    "/insights/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    zValidator("json", z.object({ status: z.enum(["new", "accepted", "dismissed", "completed"]) })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");
      const [insight] = await db
        .update(agentInsightTable)
        .set({ status, updatedAt: new Date().toISOString() })
        .where(and(eq(agentInsightTable.id, id), eq(agentInsightTable.userId, user.id)))
        .returning();
      if (!insight) return c.json({ error: "Insight not found" }, 404);
      return c.json({ success: true, insight: parseInsight(insight) });
    },
  )
  .post(
    "/insights/:id/apply",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      const insight = await db.query.agentInsightTable.findFirst({
        where: and(eq(agentInsightTable.id, id), eq(agentInsightTable.userId, user.id)),
      });
      if (!insight?.documentId) return c.json({ error: "Applicable insight not found" }, 404);
      const resume = await getOwnedResume(insight.documentId, user.id);
      if (!resume) return c.json({ error: "Resume not found" }, 404);
      const patch = (safeJson(insight.payload) as any)?.patch;
      if (!patch) return c.json({ error: "This insight does not contain an applicable patch" }, 400);

      if (patch.kind === "summary") {
        await db.update(documentTable).set({ summary: patch.value, updatedAt: new Date().toISOString() }).where(eq(documentTable.id, resume.id));
      } else if (patch.kind === "experience") {
        const [experience] = await db.select({ id: experienceTable.id }).from(experienceTable).where(and(eq(experienceTable.id, patch.experienceId), eq(experienceTable.docId, resume.id))).limit(1);
        if (!experience) return c.json({ error: "Target experience no longer exists" }, 409);
        await db.update(experienceTable).set({ workSummary: patch.value }).where(eq(experienceTable.id, patch.experienceId));
      } else if (patch.kind === "skills_add") {
        const existing = new Set((resume.skills || []).map((skill) => skill.name?.toLowerCase()));
        const additions = patch.skills
          .filter((skill: string) => !existing.has(skill.toLowerCase()))
          .map((skill: string) => ({ docId: resume.id, name: skill, rating: 3 }));
        if (additions.length) await db.insert(skillsTable).values(additions);
      } else if (patch.kind !== "none") {
        return c.json({ error: "Unsupported patch type" }, 400);
      }

      await db.update(agentInsightTable).set({ status: "completed", updatedAt: new Date().toISOString() }).where(eq(agentInsightTable.id, id));
      return c.json({ success: true, patch });
    },
  )
  .post(
    "/optimizer",
    zValidator(
      "json",
      z.object({
        documentId: z.string().min(1),
        region: z.string().max(100).default("Global"),
        targetRole: z.string().max(255).optional(),
        cadence: z.enum(["manual", "weekly", "monthly"]).default("manual"),
        focus: z.enum(["ats", "impact", "skills", "balanced"]).default("balanced"),
      }),
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");
      const resume = await getOwnedResume(input.documentId, user.id);
      if (!resume) return c.json({ error: "Resume not found" }, 404);

      const role = input.targetRole || resume.personalInfo?.jobTitle || "professional";
      const marketContext = await searchWeb(
        `latest hiring trends and in-demand skills for ${role} in ${input.region}`,
      );
      const model = chatModel.withStructuredOutput(optimizerSchema);
      const result = await model.invoke([
        {
          role: "system",
          content: `You are a proactive resume optimizer. Compare the resume with current market evidence.
Focus mode: ${input.focus}. Cadence: ${input.cadence}. Never invent candidate facts.
Each suggested update must be directly actionable and written so a candidate can approve it.
Include a safe machine-applicable patch. Use kind "none" whenever applying automatically could alter facts.`,
        },
        {
          role: "user",
          content: `Resume:\n${JSON.stringify(resume)}\n\nCurrent market context:\n${marketContext || "Use durable market knowledge."}`,
        },
      ]);

      const inserted = await db
        .insert(agentInsightTable)
        .values(
          result.findings.map((finding: any) => ({
            userId: user.id,
            documentId: input.documentId,
            type: "optimizer",
            title: finding.title,
            summary: finding.summary,
            payload: JSON.stringify({ ...finding, marketSignal: result.marketSignal, config: input }),
          })),
        )
        .returning();

      if (input.cadence === "manual") {
        await db
          .delete(automationConfigTable)
          .where(and(
            eq(automationConfigTable.userId, user.id),
            eq(automationConfigTable.documentId, input.documentId),
            eq(automationConfigTable.type, "optimizer"),
          ));
      } else {
        const nextRunAt = getNextRunAt(input.cadence);
        await db
          .insert(automationConfigTable)
          .values({
            userId: user.id,
            documentId: input.documentId,
            type: "optimizer",
            config: JSON.stringify(input),
            nextRunAt,
          })
          .onConflictDoUpdate({
            target: [
              automationConfigTable.userId,
              automationConfigTable.documentId,
              automationConfigTable.type,
            ],
            set: {
              config: JSON.stringify(input),
              enabled: true,
              nextRunAt,
              updatedAt: new Date().toISOString(),
            },
          });
      }

      return c.json({ success: true, marketSignal: result.marketSignal, insights: inserted.map(parseInsight) });
    },
  )
  .post(
    "/networking",
    zValidator(
      "json",
      z.object({
        documentId: z.string().min(1),
        company: z.string().trim().min(2).max(255),
        targetRole: z.string().trim().min(2).max(255),
        tone: z.enum(["warm", "direct", "executive", "curious"]).default("warm"),
        goal: z.enum(["referral", "informational", "recruiter_intro", "follow_up"]).default("recruiter_intro"),
      }),
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");
      const resume = await getOwnedResume(input.documentId, user.id);
      if (!resume) return c.json({ error: "Resume not found" }, 404);

      const companyContext = await searchWeb(
        `${input.company} recent news strategy hiring talent acquisition ${input.targetRole}`,
      );
      const model = chatModel.withStructuredOutput(networkingSchema);
      const result = await model.invoke([
        {
          role: "system",
          content: `You are an expert networking strategist. Draft specific, non-spammy outreach.
Tone: ${input.tone}. Goal: ${input.goal}. Do not claim a personal connection that does not exist.
Recruiter targets must be job-title/search strategies, not invented people.`,
        },
        {
          role: "user",
          content: `Candidate resume:\n${JSON.stringify(resume)}\n\nTarget company: ${input.company}\nTarget role: ${input.targetRole}\n\nCompany research:\n${companyContext || "No live search context available."}`,
        },
      ]);

      const [insight] = await db
        .insert(agentInsightTable)
        .values({
          userId: user.id,
          documentId: input.documentId,
          type: "networking",
          title: `${input.company} outreach kit`,
          summary: result.companyBrief,
          payload: JSON.stringify({ ...result, config: input }),
        })
        .returning();
      return c.json({ success: true, kit: result, insight: parseInsight(insight) });
    },
  )
  .post(
    "/developer-sync",
    zValidator(
      "json",
      z.object({
        provider: z.enum(["github", "leetcode"]),
        documentId: z.string().min(1).optional(),
        username: z.string().trim().regex(/^[a-zA-Z0-9_-]{1,80}$/),
        repoLimit: z.number().int().min(1).max(20).default(6),
        includeForks: z.boolean().default(false),
      }),
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");
      const data = input.provider === "github"
        ? await syncGithub(input.username, input.repoLimit, input.includeForks)
        : await syncLeetCode(input.username);

      await db
        .insert(integrationSnapshotTable)
        .values({
          userId: user.id,
          documentId: input.documentId || null,
          provider: input.provider,
          username: input.username,
          data: JSON.stringify(data),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [
            integrationSnapshotTable.userId,
            integrationSnapshotTable.provider,
            integrationSnapshotTable.username,
          ],
          set: { documentId: input.documentId || null, data: JSON.stringify(data), updatedAt: new Date().toISOString() },
        });

      return c.json({ success: true, provider: input.provider, data });
    },
  )
  .get("/snapshots", getAuthUser, async (c) => {
    const user = c.get("user");
    const rows = await db
      .select()
      .from(integrationSnapshotTable)
      .where(eq(integrationSnapshotTable.userId, user.id))
      .orderBy(desc(integrationSnapshotTable.updatedAt));
    return c.json({
      success: true,
      snapshots: rows.map((row) => ({ ...row, data: safeJson(row.data) })),
    });
  })
  .get(
    "/public-snapshots/:documentId",
    zValidator("param", z.object({ documentId: z.string().min(1) })),
    async (c) => {
      const { documentId } = c.req.valid("param");
      const document = await db.query.documentTable.findFirst({
        where: and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")),
      });
      if (!document) return c.json({ error: "Portfolio not found" }, 404);
      const rows = await db
        .select()
        .from(integrationSnapshotTable)
        .where(eq(integrationSnapshotTable.documentId, documentId))
        .orderBy(desc(integrationSnapshotTable.updatedAt));
      return c.json({
        success: true,
        snapshots: rows.map((row) => ({
          provider: row.provider,
          username: row.username,
          updatedAt: row.updatedAt,
          data: safeJson(row.data),
        })),
      });
    },
  )
  .get("/configs", getAuthUser, async (c) => {
    const user = c.get("user");
    const configs = await db
      .select()
      .from(automationConfigTable)
      .where(eq(automationConfigTable.userId, user.id))
      .orderBy(desc(automationConfigTable.updatedAt));
    return c.json({ success: true, configs: configs.map((config) => ({ ...config, config: safeJson(config.config) })) });
  })
  .patch(
    "/configs/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    zValidator("json", z.object({ enabled: z.boolean() })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      const { enabled } = c.req.valid("json");
      const [config] = await db
        .update(automationConfigTable)
        .set({ enabled, updatedAt: new Date().toISOString() })
        .where(and(eq(automationConfigTable.id, id), eq(automationConfigTable.userId, user.id)))
        .returning();
      if (!config) return c.json({ error: "Automation config not found" }, 404);
      return c.json({ success: true, config });
    },
  )
  .delete(
    "/configs/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      await db.delete(automationConfigTable).where(and(eq(automationConfigTable.id, id), eq(automationConfigTable.userId, user.id)));
      return c.json({ success: true });
    },
  );

async function getOwnedResume(documentId: string, userId: string) {
  return db.query.documentTable.findFirst({
    where: and(eq(documentTable.documentId, documentId), eq(documentTable.userId, userId)),
    with: { personalInfo: true, experiences: true, educations: true, skills: true },
  });
}

async function syncGithub(username: string, repoLimit: number, includeForks: boolean) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CareerForgeAI",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${repoLimit * 2}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`, { headers }),
  ]);
  if (!profileResponse.ok || !reposResponse.ok) throw new Error("GitHub profile could not be loaded");

  const profile = await profileResponse.json();
  const repos = (await reposResponse.json())
    .filter((repo: any) => includeForks || !repo.fork)
    .slice(0, repoLimit)
    .map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
    }));
  const events = eventsResponse.ok ? await eventsResponse.json() : [];
  const contributionGrid = buildContributionGrid(events);

  return {
    profile: {
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      url: profile.html_url,
      followers: profile.followers,
      publicRepos: profile.public_repos,
    },
    recentPublicContributions: events.length,
    contributionGrid,
    repositories: repos,
  };
}

function buildContributionGrid(events: { type: string; created_at: string; payload?: { commits?: unknown[] } }[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const day = event.created_at.slice(0, 10);
    const commits = event.payload?.commits?.length || 1;
    counts.set(day, (counts.get(day) || 0) + commits);
  }

  const grid: { date: string; count: number }[] = [];
  const today = new Date();
  for (let offset = 83; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    grid.push({ date: key, count: counts.get(key) || 0 });
  }
  return grid;
}

async function syncLeetCode(username: string) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: `https://leetcode.com/${username}/` },
    body: JSON.stringify({
      query: `query profile($username: String!) {
        matchedUser(username: $username) {
          username
          profile { realName ranking aboutMe }
          submitStatsGlobal { acSubmissionNum { difficulty count submissions } }
        }
        userContestRanking(username: $username) { attendedContestsCount rating globalRanking topPercentage }
      }`,
      variables: { username },
    }),
  });
  if (!response.ok) throw new Error("LeetCode profile could not be loaded");
  const result = await response.json();
  if (!result.data?.matchedUser) throw new Error("LeetCode user not found");
  return result.data;
}

function parseInsight<T extends { payload: string | null }>(insight: T) {
  return { ...insight, payload: safeJson(insight.payload) };
}

function safeJson(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getNextRunAt(cadence: "weekly" | "monthly") {
  const date = new Date();
  if (cadence === "weekly") date.setDate(date.getDate() + 7);
  else date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export default automationRoute;
