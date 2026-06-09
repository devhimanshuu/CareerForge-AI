"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  User, 
  Bot, 
  Loader2, 
  Mail, 
  Linkedin,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  content: string;
}

const PortfolioChatbot = ({ resumeInfo }: { resumeInfo: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: `Hi there! I'm ${resumeInfo?.personalInfo?.firstName}'s AI assistant. Ask me anything about their experience, skills, or projects!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLeadGen, setShowLeadGen] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ email: "", linkedin: "" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/public-portfolio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: resumeInfo.documentId, question: userMessage }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Portfolio assistant failed");
      const responseText = result.text;
      setMessages(prev => [...prev, { role: "bot", content: responseText }]);

      // Trigger lead gen after 3 messages
      if (messages.length >= 4 && !showLeadGen) {
        setTimeout(() => setShowLeadGen(true), 1500);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I encountered an error. Please try again or reach out directly!" }]);
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: resumeInfo.documentId,
          email: leadInfo.email,
          linkedin: leadInfo.linkedin,
          message: messages
            .slice(-6)
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n"),
        }),
      });
      setShowLeadGen(false);
      setMessages(prev => [...prev, { role: "bot", content: "Thanks for sharing! I've noted your interest. Would you like to know anything else about my experience?" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "bot", content: "I couldn't save those details right now. Please use the contact information on the page instead." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-background border rounded-3xl shadow-2xl flex flex-col overflow-hidden glass shadow-indigo-500/10"
          >
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Recruiter Assistant</h3>
                  <p className="text-[10px] opacity-70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI Powered
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "user" ? "bg-indigo-500 text-white" : "bg-white dark:bg-slate-800 border"
                  )}>
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === "user" 
                      ? "bg-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-500/20" 
                      : "bg-white dark:bg-slate-800 border rounded-tl-none shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center shrink-0">
                    <Loader2 size={14} className="animate-spin text-indigo-500" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border rounded-tl-none flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce delay-75" />
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce delay-150" />
                  </div>
                </div>
              )}

              {showLeadGen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-indigo-500 text-white space-y-4 shadow-xl shadow-indigo-500/20"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <h4 className="font-bold text-sm">Interested in hiring?</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-90">Leave your details and I&apos;ll make sure {resumeInfo?.personalInfo?.firstName} sees them!</p>
                  <form onSubmit={submitLead} className="space-y-2">
                    <div className="relative">
                      <Mail size={12} className="absolute left-3 top-3 opacity-50" />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        required
                        className="w-full bg-white/10 border-none rounded-xl py-2 pl-9 text-[10px] focus:ring-2 ring-white/30 placeholder:text-white/50"
                        value={leadInfo.email}
                        onChange={e => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <Linkedin size={12} className="absolute left-3 top-3 opacity-50" />
                      <input 
                        type="text" 
                        placeholder="LinkedIn Profile URL" 
                        className="w-full bg-white/10 border-none rounded-xl py-2 pl-9 text-[10px] focus:ring-2 ring-white/30 placeholder:text-white/50"
                        value={leadInfo.linkedin}
                        onChange={e => setLeadInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold gap-2 text-[10px]">
                      Send Inquiry
                      <ArrowRight size={12} />
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your question..." 
                  className="flex-1 rounded-xl h-10 text-xs border-none bg-muted/50 focus:ring-2 ring-indigo-500/20"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                />
                <Button 
                  size="icon" 
                  className="rounded-xl h-10 w-10 bg-indigo-600 hover:bg-indigo-700 shrink-0"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        size="lg" 
        className={cn(
          "rounded-full w-14 h-14 shadow-2xl transition-all duration-500 group",
          isOpen ? "rotate-90 bg-slate-800 scale-90" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-110"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : (
          <>
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black animate-bounce">1</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default PortfolioChatbot;
