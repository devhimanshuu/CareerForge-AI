"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Palette,
  Share2,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Target,
  FileText,
  ListTodo,
} from "lucide-react";

export const BentoItem = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty("--mouse-x", `${x}px`);
      item.style.setProperty("--mouse-y", `${y}px`);
    };

    item.addEventListener("mousemove", handleMouseMove);

    return () => {
      item.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={itemRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 p-8 glass group transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
};

export const CyberneticBentoGrid = () => {
  return (
    <div className="w-full max-w-6xl mx-auto z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-border mb-4 glass">
          <Zap size="14px" className="text-indigo-500" />
          The Complete Career Arsenal
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Get Hired
          </span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          From AI-powered content generation and live market intelligence to interview prep and visual job tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
        {/* Large Feature Item - Resume Parser & AI Builder */}
        <BentoItem className="md:col-span-2 md:row-span-2 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Bot className="text-indigo-500" size="24px" />
            </div>
            <h2 className="text-3xl font-bold">AI Parser & Resume Builder</h2>
            <p className="mt-3 text-muted-foreground text-lg leading-relaxed max-w-xl">
              Import seamlessly from LinkedIn or paste raw text. Our advanced LangGraph parser structures your work history, generates high-impact bullet points, and provides drag-and-drop ordering for an elegant design.
            </p>
          </div>
          <div className="mt-8 h-56 w-full bg-gradient-to-t from-indigo-500/10 to-transparent rounded-xl border border-indigo-500/20 flex items-end justify-center overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="w-[80%] mx-auto h-[80%] bg-background rounded-t-xl border-x border-t border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4 animate-slide-in-right">
                <div className="h-5 w-1/3 bg-indigo-500/20 rounded-full" />
                <div className="space-y-2 mt-2">
                  <div className="h-3 w-full bg-muted rounded-full" />
                  <div className="h-3 w-5/6 bg-muted rounded-full" />
                  <div className="h-3 w-4/6 bg-muted rounded-full" />
                </div>
                <div className="mt-auto flex justify-end">
                  <div className="px-3 py-1.5 bg-indigo-500 text-white text-[10px] rounded-lg flex items-center gap-1 font-semibold">
                    <Sparkles size={12} /> AI Parse: Success
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BentoItem>

        {/* Job Tracker */}
        <BentoItem className="md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
            <ListTodo className="text-blue-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Kanban Application Tracker</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your entire application pipeline visually. Move job cards from Applied to Interviewing to Offer while the dashboard updates your metrics in real-time.
          </p>
          <div className="mt-4 flex gap-2">
            <div className="h-2 flex-1 bg-blue-500/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-blue-500 rounded-full" />
            </div>
            <div className="h-2 flex-1 bg-orange-500/20 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-orange-500 rounded-full" />
            </div>
            <div className="h-2 flex-1 bg-green-500/20 rounded-full overflow-hidden">
              <div className="w-1/4 h-full bg-green-500 rounded-full" />
            </div>
          </div>
        </BentoItem>

        {/* ATS URL Scraper */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
            <FileText className="text-orange-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">ATS URL Scraper</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Paste any job link. Our optimized scraper bypasses standard WAF walls to pull requirements and score your resume alignment.
          </p>
        </BentoItem>

        {/* ATS Optimized Templates */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Shield className="text-cyan-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">ATS-Friendly Layouts</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Clean, professional designs that parser engines love. Avoid parsing errors with schemas built for modern screeners.
          </p>
        </BentoItem>

        {/* Interview Prep Lab */}
        <BentoItem className="md:col-span-2 md:row-span-2 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
            <Trophy className="text-rose-500" size="24px" />
          </div>
          <h2 className="text-3xl font-bold">AI Mock Interview Lab</h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-sm">
            Simulate real face-to-face interviews. Features an interactive camera overlay, voice-synthesized recruiter questions, and dynamic mute/unmute control.
          </p>
          <div className="mt-8 flex-1 bg-gradient-to-t from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 flex flex-col justify-end p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Trophy size={120} className="text-rose-500" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="bg-background/80 backdrop-blur p-3 rounded-lg border shadow-sm self-start max-w-[80%] text-xs border-rose-500/30">
                &quot;Can you describe a challenging technical problem you solved recently?&quot;
              </div>
              <div className="bg-rose-500 text-white p-3 rounded-lg shadow-sm self-end max-w-[80%] text-xs ml-auto">
                &quot;Sure, in my last project I optimized database queries...&quot;
              </div>
            </div>
          </div>
        </BentoItem>

        {/* Live Career Intel */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
            <Sparkles className="text-purple-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Live Market Intel</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Get live salary updates, market demands, and regional hiring trends powered by real-time web search.
          </p>
        </BentoItem>
 
        {/* Secure PDF Print Engine */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Shield className="text-emerald-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Secure PDF Engine</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Export pixel-perfect PDFs. Employs dynamic server-port checks and Clerk key validation for secure printing.
          </p>
        </BentoItem>
 
        {/* AI Podcast Resume Maker */}
        <BentoItem className="md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
            <Target className="text-yellow-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">AI Podcast Resume Maker</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Transform dry resume pages into an engaging dual-voice conversation. Features host and candidate voices synthesized sequentially with distinct rates and pitches.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-[10px] font-medium text-indigo-500 border border-indigo-500/20">
              Host Role
            </span>
            <span className="px-2 py-1 rounded-md bg-purple-500/10 text-[10px] font-medium text-purple-500 border border-purple-500/20">
              Candidate Role
            </span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
              Dual Voice
            </span>
             <span className="px-2 py-1 rounded-md bg-amber-500/10 text-[10px] font-medium text-amber-500 border border-amber-500/20">
              Sequential Player
            </span>
          </div>
        </BentoItem>
      </div>
    </div>
  );
};
