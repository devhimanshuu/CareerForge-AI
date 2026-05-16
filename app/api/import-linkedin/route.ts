import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { AIChatSession } from "@/lib/groq-model";

const IMPORT_PROMPT = `
You are an expert resume parser. I will provide you with the raw text extracted from a LinkedIn PDF profile.
Extract the following information and return it strictly as a JSON object matching this structure. Do not return any other text, markdown, or explanations—only the JSON object.

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
      "endDate": "YYYY-MM-DD", // or leave empty if present
      "currentlyWorking": boolean,
      "workSummary": "<li>...</li><li>...</li>" // HTML bullet points
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

    // Pass to Groq AI
    const prompt = IMPORT_PROMPT.replace("{TEXT}", text);
    const result = await AIChatSession.sendMessage(prompt);
    let aiResponse = await result.response.text();
    
    // Clean JSON response
    aiResponse = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(aiResponse);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("LinkedIn Import Error:", error);
    return NextResponse.json({ error: "Failed to parse LinkedIn profile" }, { status: 500 });
  }
}
