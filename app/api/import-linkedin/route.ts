if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {};
}

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { extractResumeData } from "@/lib/langchain";

const IMPORT_PROMPT = `
You are an expert resume parser. I will provide you with the raw text extracted from a LinkedIn PDF profile.
Extract the following information and return it strictly as a JSON object matching this structure. Do not return any other text, markdown, or explanations—only the JSON object.

Format instructions:
- "startDate" and "endDate" must be formatted as "YYYY-MM-DD" or empty string if not applicable.
- "currentlyWorking" must be a boolean (true or false).
- "workSummary" must contain the experience description formatted as HTML list items (e.g. "<li>Accomplished X</li><li>Led Y</li>").
- "rating" for skills must be a number between 0 and 5.
- Do not include any JSON comments (like // comments) in the final JSON response.

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
  "experience": [
    {
      "title": "",
      "companyName": "",
      "city": "",
      "state": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "currentlyWorking": false,
      "workSummary": ""
    }
  ],
  "education": [
    {
      "universityName": "",
      "degree": "",
      "major": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": ""
    }
  ],
  "skills": [
    {
      "name": "",
      "rating": 5
    }
  ]
}

Raw LinkedIn Profile Text:
{TEXT}
`;

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract text using pdf-parse
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    // Pass to our unified LangGraph resume extractor
    const extractedData = await extractResumeData(text);

    // Provide both singular and plural keys for maximum frontend compatibility
    const responseData = {
      ...extractedData,
      experience: extractedData.experiences,
      education: extractedData.educations,
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("LinkedIn Import Error:", error);
    return NextResponse.json({ error: "Failed to parse LinkedIn profile" }, { status: 500 });
  }
}
