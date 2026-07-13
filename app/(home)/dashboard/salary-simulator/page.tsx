"use client";

import React, { useState, useRef, useEffect } from "react";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Send, 
  Briefcase, 
  DollarSign, 
  Building, 
  Lightbulb, 
  Bot, 
  User, 
  ChevronRight,
  TrendingUp,
  Award,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function SalarySimulator() {
  const [started, setStarted] = useState(false);
  const [scenario, setScenario] = useState({
    role: "Senior Software Engineer",
    company: "Acme Corp",
    marketBand: "$140,000 - $160,000",
    initialOffer: "$135,000",
  });

  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live Coaching Overlay state
  const [coachingTip, setCoachingTip] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated live coaching based on input text
  useEffect(() => {
    const text = input.toLowerCase();
    if (text.length < 5) {
      setCoachingTip(null);
      return;
    }

    if (text.includes("competing offer") || text.includes("another offer")) {
      setCoachingTip("Great tactic! Mentioning competing offers creates leverage. Don't reveal the exact amount unless it's very high.");
    } else if (text.includes("sign-on bonus") || text.includes("equity")) {
      setCoachingTip("Smart pivot. If base salary is capped, recruiters often have more flexibility with bonuses or equity.");
    } else if (text.includes("i want more") || text.includes("that's too low")) {
      setCoachingTip("Careful. Try to anchor your counter-offer to market data or the specific value you bring, rather than just demanding more.");
    } else if (text.includes("excited") || text.includes("love to join")) {
      setCoachingTip("Excellent. Reaffirming your excitement keeps the negotiation collaborative rather than adversarial.");
    } else {
      setCoachingTip(null);
    }
  }, [input]);

  const startSimulation = () => {
    setMessages([
      { 
        role: "assistant", 
        content: `Hi there! I'm the recruiter for ${scenario.company}. We're thrilled to extend you an offer for the ${scenario.role} position! Our initial offer is ${scenario.initialOffer} base salary. How does that sound?` 
      }
    ]);
    setStarted(true);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newHistory = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/salary-simulator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          scenario
        })
      });

      if (res.ok) {
        const json = await res.json();
        setMessages([...newHistory, { role: "assistant", content: json.reply }]);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Error",
        description: "Failed to get AI response. The simulation will continue with offline mode.",
        variant: "destructive",
      });
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. You can still practice by writing your responses — I'll respond when I reconnect." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Interview Prep"
        title="Salary Negotiation Simulator"
        description="Roleplay with an AI recruiter to practice your negotiation skills and maximize your next offer."
        icon={<DollarSign size={13} />}
      />

      {!started ? (
        <div className="mt-8 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-2xl font-black">Configure Your Scenario</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Set the context for your upcoming negotiation. The AI recruiter will use this data to anchor the conversation.
            </p>
          </div>

          <PremiumPanel className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Briefcase size={14} /> Target Role
                </label>
                <Input 
                  value={scenario.role} 
                  onChange={(e) => setScenario({...scenario, role: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Building size={14} /> Company
                </label>
                <Input 
                  value={scenario.company} 
                  onChange={(e) => setScenario({...scenario, company: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <TrendingUp size={14} /> Market Band
                </label>
                <Input 
                  value={scenario.marketBand} 
                  onChange={(e) => setScenario({...scenario, marketBand: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                  <Award size={14} /> Initial Offer
                </label>
                <Input 
                  value={scenario.initialOffer} 
                  onChange={(e) => setScenario({...scenario, initialOffer: e.target.value})}
                  className="rounded-xl border-emerald-500/30 focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>

            <Button 
              onClick={startSimulation}
              className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-6 text-lg"
            >
              Start Negotiation
            </Button>
          </PremiumPanel>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
          
          {/* Chat Area */}
          <PremiumPanel className="lg:col-span-3 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">AI Recruiter</h3>
                  <p className="text-xs text-muted-foreground">from {scenario.company}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStarted(false)} className="text-xs">
                End Simulation
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl p-4",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "bg-muted rounded-bl-none"
                  )}>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-muted rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">Recruiter is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border/50 bg-background shrink-0 space-y-4">
              {/* Live Coaching Overlay */}
              <AnimatePresence>
                {coachingTip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium"
                  >
                    <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-500" />
                    <p>{coachingTip}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2">
                <Textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your counter-offer or response..."
                  className="min-h-[80px] rounded-xl resize-none"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="h-[80px] w-[80px] shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send size={24} />
                </Button>
              </div>
            </div>
          </PremiumPanel>

          {/* Context Sidebar */}
          <div className="hidden lg:block space-y-6">
            <PremiumPanel className="p-6">
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Scenario Context</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Role</p>
                  <p className="text-sm font-bold">{scenario.role}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Company</p>
                  <p className="text-sm font-bold">{scenario.company}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Band</p>
                  <p className="text-sm font-bold">{scenario.marketBand}</p>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Initial Offer</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{scenario.initialOffer}</p>
                </div>
              </div>
            </PremiumPanel>

            <PremiumPanel className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Award size={16} className="text-indigo-500" />
                Pro Tips
              </h3>
              <ul className="text-xs text-muted-foreground space-y-2 mt-4 list-disc list-inside">
                <li>Never accept the first offer immediately.</li>
                <li>Express excitement before countering.</li>
                <li>Anchor to market data, not personal needs.</li>
                <li>If base is firm, ask about sign-on bonuses.</li>
              </ul>
            </PremiumPanel>
          </div>

        </div>
      )}
    </PremiumPage>
  );
}
