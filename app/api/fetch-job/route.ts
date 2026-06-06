import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { lookup } from "dns/promises";
import { isIP } from "net";

const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

const isPrivateIp = (address: string) => {
  if (address.startsWith("10.")) return true;
  if (address.startsWith("127.")) return true;
  if (address.startsWith("169.254.")) return true;
  if (address.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) return true;
  if (address === "::1" || address.toLowerCase().startsWith("fc") || address.toLowerCase().startsWith("fd")) return true;
  return false;
};

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req as any);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only http and https URLs are supported" }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (PRIVATE_HOSTS.has(hostname) || isPrivateIp(hostname)) {
      return NextResponse.json({ error: "This URL is not allowed" }, { status: 400 });
    }

    const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
    if (addresses.some((entry) => isPrivateIp(entry.address))) {
      return NextResponse.json({ error: "This URL resolves to a private network" }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1"
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = (await response.text()).slice(0, 500_000);

    // Basic extraction: remove scripts, styles, and html tags
    const bodyContentMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyContentMatch ? bodyContentMatch[1] : html;

    bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    bodyContent = bodyContent.replace(/<[^>]+>/g, " ");
    
    // Clean up whitespace
    const textContent = bodyContent.replace(/\s+/g, " ").trim();

    // Limit length to avoid token limits
    const truncatedText = textContent.slice(0, 15000);

    return NextResponse.json({ text: truncatedText });
  } catch (error: any) {
    console.error("Fetch job error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job description" },
      { status: 500 }
    );
  }
}
