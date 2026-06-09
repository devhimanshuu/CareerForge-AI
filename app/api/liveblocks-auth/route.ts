import { Liveblocks } from "@liveblocks/node";
import { auth, currentUser } from "@clerk/nextjs/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  // If LIVEBLOCKS_SECRET_KEY is not configured, return a fallback anonymous session
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    // Generate a pseudo-anonymous session so presence still works locally
    const fallbackId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const session = liveblocks.prepareSession(fallbackId);
    // Allow all rooms with read-only presence for anonymous users
    session.allow("*", ["room:read", "room:presence:write"]);
    const { body, status } = await session.authorize();
    return new Response(body, { status });
  }

  // Get Clerk auth data
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Create Liveblocks session for the authenticated user
  const session = liveblocks.prepareSession(userId);

  // Give the user full access to rooms matching their documentId pattern
  // In practice, room IDs are `document-{documentId}`
  // For now, allow access to all rooms (access control can be refined later)
  session.allow("*", ["room:write", "room:presence:write"]);

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}