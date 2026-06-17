import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { chatModel } from "@/lib/langchain";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, history, scenario } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Default scenario if none provided
    const context = scenario || {
      role: "Senior Software Engineer",
      company: "Acme Corp",
      marketBand: "$140,000 - $160,000",
      initialOffer: "$135,000",
    };

    const systemPrompt = `
      You are an expert technical recruiter for ${context.company}. You are currently negotiating an offer with a candidate for the role of ${context.role}.
      
      The market band for this role is ${context.marketBand}, but your initial offer to the candidate is ${context.initialOffer}.
      
      Your goal: Negotiate an agreement. You are fair but firm. You want to save the company money, so you won't immediately jump to the top of the band unless the candidate provides excellent, well-reasoned arguments (e.g., competing offers, specific rare skills, anchoring high).
      
      Rules:
      1. Stay completely in character as the recruiter.
      2. Do not break the fourth wall. 
      3. Respond conversationally, like you are on a phone call.
      4. If the candidate asks for an unreasonable amount (way above the band), push back respectfully.
      5. If they negotiate well, you can incrementally increase the offer or offer sign-on bonuses/equity instead of base salary.
      6. End the negotiation if an agreement is reached or if the candidate is too rigid after several rounds.
    `;

    // Reconstruct the message history for LangChain
    const messages = [new SystemMessage(systemPrompt)];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    // Add the latest user message
    messages.push(new HumanMessage(message));

    const response = await chatModel.invoke(messages);
    
    return NextResponse.json({ 
      success: true, 
      reply: typeof response.content === "string" ? response.content : JSON.stringify(response.content) 
    });

  } catch (error: any) {
    console.error("[Salary Simulator API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
