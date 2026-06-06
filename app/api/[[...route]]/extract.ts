import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { PDFParse } from "pdf-parse";
import { parseResumeTextFallback } from "@/lib/resume-import";
import { extractResumeData } from "@/lib/langchain";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const extractRoute = new Hono()
  .post("/resume", getAuthUser, async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return c.json({ success: false, message: "No file provided" }, 400);
      }

      const isPdf =
        file.type === "application/pdf" ||
        file.type === "application/octet-stream" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return c.json({ success: false, message: "Only PDF resumes are supported." }, 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return c.json({ success: false, message: "Resume PDF must be 5MB or smaller." }, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      const parser = new PDFParse({ data: pdfBuffer });
      let rawText = "";
      try {
        const parseResult = await parser.getText();
        rawText = parseResult.text?.trim() || "";
      } finally {
        await parser.destroy();
      }

      if (rawText.length < 50) {
        return c.json(
          {
            success: false,
            message:
              "We could not read enough text from this PDF. Please upload a text-based PDF instead of a scanned image.",
          },
          400
        );
      }

      let extractedData;
      try {
        extractedData = await extractResumeData(rawText);
      } catch (error) {
        console.warn("LangGraph resume extraction failed, using local fallback:", error);
        extractedData = parseResumeTextFallback(rawText);
      }

      return c.json({ success: true, data: extractedData });
    } catch (error: any) {
      console.error("Extraction Error:", error);
      return c.json({ success: false, message: error.message || "Failed to extract resume data" }, 500);
    }
  });

export default extractRoute;
