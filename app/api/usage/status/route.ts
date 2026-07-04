import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const KNOWN_KEYS = [
  { key: "TAVILY_API_KEY", label: "Live market search & job scraping" },
  { key: "ELEVENLABS_API_KEY", label: "Audio synthesis & transcription" },
  { key: "OPENAI_API_KEY", label: "Advanced AI features" },
] as const;

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingKeys = KNOWN_KEYS
      .filter((k) => !process.env[k.key])
      .map((k) => ({ key: k.key, label: k.label }));

    return NextResponse.json({ success: true, missingKeys });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ missingKeys: [] });
  }
}
