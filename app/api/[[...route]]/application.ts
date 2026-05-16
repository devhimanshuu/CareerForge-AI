import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { applicationTable, coverLetterTable, documentTable } from "@/db/schema";
import { getAuthUser } from "@/lib/clerk";
import { AIChatSession } from "@/lib/groq-model";

const applicationRoute = new Hono()
  .get("/all", getAuthUser, async (c) => {
    try {
      const user = c.get("user");
      const userId = user.id;
      const applications = await db
        .select()
        .from(applicationTable)
        .where(eq(applicationTable.userId, userId))
        .orderBy(desc(applicationTable.updatedAt));
      
      return c.json({ success: true, data: applications });
    } catch (error) {
      console.error("Fetch Applications Error:", error);
      return c.json({ 
        success: false, 
        message: "Failed to fetch applications",
        error: error instanceof Error ? error.message : error
      }, 500);
    }
  })
  .post(
    "/create",
    zValidator(
      "json",
      z.object({
        documentId: z.string(),
        jobTitle: z.string(),
        company: z.string(),
        status: z.enum(["wishlist", "applied", "interviewing", "offer", "rejected"]).optional(),
        notes: z.string().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      try {
        const user = c.get("user");
        const userId = user.id;
        const values = c.req.valid("json");

        const [data] = await db
          .insert(applicationTable)
          .values({
            userId,
            ...values,
          })
          .returning();
        
        return c.json({ success: true, data });
      } catch (error) {
        console.error("Create Application Error:", error);
        return c.json({ 
            success: false, 
            message: "Failed to create application",
            error: error instanceof Error ? error.message : error
        }, 500);
      }
    }
  )
  .patch(
    "/update/:id",
    zValidator(
      "param",
      z.object({ id: z.string() })
    ),
    zValidator(
      "json",
      z.object({
        status: z.enum(["wishlist", "applied", "interviewing", "offer", "rejected"]).optional(),
        notes: z.string().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const values = c.req.valid("json");
        const user = c.get("user");

        const [data] = await db
          .update(applicationTable)
          .set({ ...values, updatedAt: new Date().toISOString() })
          .where(and(eq(applicationTable.id, parseInt(id)), eq(applicationTable.userId, user.id)))
          .returning();
        
        return c.json({ success: true, data });
      } catch (error) {
        console.error("Update Application Error:", error);
        return c.json({ 
            success: false, 
            message: "Failed to update application",
            error: error instanceof Error ? error.message : error
        }, 500);
      }
    }
  )
  .post(
    "/generate-cover-letter",
    zValidator(
      "json",
      z.object({
        documentId: z.string(),
        jobDescription: z.string(),
        tone: z.enum(["Confident", "Enthusiastic", "Formal", "Direct"]),
      })
    ),
    getAuthUser,
    async (c) => {
      try {
        const { documentId, jobDescription, tone } = c.req.valid("json");
        const user = c.get("user");

        // Fetch resume content for context
        const resume = await db.query.documentTable.findFirst({
          where: and(eq(documentTable.documentId, documentId), eq(documentTable.userId, user.id)),
          with: {
            personalInfo: true,
            experiences: true,
            educations: true,
            skills: true,
          },
        });

        if (!resume) return c.json({ error: "Resume not found" }, 404);

        const prompt = `
          Generate a high-quality, professional, and non-robotic cover letter based on the following context:
          
          RESUME CONTENT:
          Name: ${resume.personalInfo?.firstName} ${resume.personalInfo?.lastName}
          Role: ${resume.personalInfo?.jobTitle}
          Experience: ${resume.experiences?.map(e => `${e.title} at ${e.companyName}: ${e.workSummary}`).join("\n")}
          Skills: ${resume.skills?.map(s => s.name).join(", ")}
          
          TARGET JOB DESCRIPTION:
          ${jobDescription}
          
          TONE: ${tone}
          
          Please write a cover letter that is tailored specifically to this job description, highlighting the most relevant skills and experiences from the resume. Ensure it sounds natural and compelling.
        `;

        const aiResponse = await AIChatSession.sendMessage(prompt);
        const content = aiResponse.response.text();

        return c.json({ success: true, content });
      } catch (error) {
        console.error("AI Error:", error);
        return c.json({ success: false, message: "Failed to generate cover letter" }, 500);
      }
    }
  )
  .delete(
    "/delete/:id",
    zValidator("param", z.object({ id: z.string() })),
    getAuthUser,
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const user = c.get("user");

        await db
          .delete(applicationTable)
          .where(and(eq(applicationTable.id, parseInt(id)), eq(applicationTable.userId, user.id)));

        return c.json({ success: true, message: "Deleted successfully" });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete application" }, 500);
      }
    }
  );


export default applicationRoute;
