import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { AIChatSession } from "@/lib/groq-model";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

const extractRoute = new Hono()
  .post("/resume", getAuthUser, async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return c.json({ success: false, message: "No file provided" }, 400);
      }

      // Convert the uploaded File object to a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      // Parse raw text locally using modern PDFParse (Instantaneous & robust!)
      console.log("Parsing PDF locally using PDFParse...");
      const parser = new PDFParse({ data: pdfBuffer });
      const parseResult = await parser.getText();
      const rawText = parseResult.text;
      
      // Clean up resources immediately to prevent memory leaks
      await parser.destroy();

      if (!rawText) {
        throw new Error("Failed to extract text from the uploaded PDF.");
      }


      // 2. Use AI to structure the text
      const prompt = `
        You are an expert resume parser. Extract all information from the following parsed resume text and format it into a valid JSON object matching the schema below.
        
        RESUME TEXT:
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
