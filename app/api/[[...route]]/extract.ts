import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { AIChatSession } from "@/lib/groq-model";

const extractRoute = new Hono()
  .post("/resume", getAuthUser, async (c) => {
    try {
      // Dynamic import to avoid top-level bundling crashes
      const { PDFParse } = await import("pdf-parse");
      
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return c.json({ success: false, message: "No file provided" }, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 1. Parse PDF to Text
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      await parser.destroy();
      const rawText = pdfData.text;

      if (!rawText || rawText.trim().length < 50) {
        return c.json({ success: false, message: "Could not extract enough text from PDF" }, 400);
      }

      // 2. Use AI to structure the text
      const prompt = `
        You are an expert resume parser. Extract all information from the following raw resume text and format it into a valid JSON object matching the schema below.
        
        RAW TEXT:
        ${rawText}
        
        SCHEMA:
        {
          "personalInfo": {
            "firstName": "",
            "lastName": "",
            "jobTitle": "",
            "address": "",
            "phone": "",
            "email": ""
          },
          "summary": "",
          "experiences": [
            {
              "title": "",
              "companyName": "",
              "city": "",
              "state": "",
              "startDate": "",
              "endDate": "",
              "currentlyWorking": false,
              "workSummary": ""
            }
          ],
          "educations": [
            {
              "universityName": "",
              "degree": "",
              "major": "",
              "startDate": "",
              "endDate": "",
              "description": ""
            }
          ],
          "skills": [
            { "name": "", "rating": 5 }
          ]
        }
        
        RULES:
        - Be precise. If a field is missing, leave it empty.
        - Format dates as "Month Year" if possible.
        - Output ONLY the valid JSON object. No extra text.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonStr = aiResponse.response.text().match(/\{[\s\S]*\}/)?.[0] || "";
      const extractedData = JSON.parse(jsonStr);

      return c.json({ success: true, data: extractedData });
    } catch (error: any) {
      console.error("Extraction Error:", error);
      return c.json({ success: false, message: error.message || "Failed to extract resume data" }, 500);
    }
  });

export default extractRoute;
