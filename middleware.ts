import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)", 
  "/p/(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/cookies(.*)",
]);

export default clerkMiddleware((auth, request) => {
  const url = request.nextUrl.clone();
  const hostHeader = request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0];

  // Check custom domain rewrite
  const primaryDomains = [
    "localhost",
    "careerforge.ai",
    "www.careerforge.ai",
    "career-forge-ai.vercel.app"
  ];

  const isCustomDomain = hostname && 
    !primaryDomains.some((d) => hostname === d) && 
    !hostname.endsWith(".vercel.app");

  if (isCustomDomain) {
    // Avoid rewriting api requests or assets
    if (!url.pathname.startsWith("/api") && !url.pathname.startsWith("/_next") && !url.pathname.includes(".")) {
      url.pathname = `/p/domain/${hostname}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
