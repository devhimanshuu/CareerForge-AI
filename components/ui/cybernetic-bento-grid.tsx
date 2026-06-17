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
  Linkedin,
  DollarSign,
  Globe,
  SplitSquareHorizontal,
} from "lucide-react";

export const BentoItem = ({
  className,
  children,
  innerClassName = "flex-col",
}: {
  className?: string;
  children: React.ReactNode;
  innerClassName?: string;
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
      <div className={cn("relative z-10 flex h-full", innerClassName)}>{children}</div>
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
          From AI-powered content generation and live market intelligence to portfolio generation and visual job tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
        {/* 1. Large Feature Item - Resume Parser & AI Builder (2x2) */}
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

        {/* 2. Job Tracker (2x1) */}
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

        {/* 3. Salary Negotiation Simulator (1x1) - Replaces ATS Scraper */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <DollarSign className="text-emerald-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Salary Simulator</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Roleplay with an AI tech recruiter. Practice anchoring higher and leveraging offers based on real market bands.
          </p>
        </BentoItem>

        {/* 4. ATS Optimized Templates (1x1) */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Shield className="text-cyan-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">ATS-Friendly Layouts</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Clean, professional designs that parser engines love. Avoid parsing errors with schemas built for modern screeners.
          </p>
        </BentoItem>

        {/* 5. Personal Portfolio Generator (2x2) - Replaces Mock Interview */}
        <BentoItem className="md:col-span-2 md:row-span-2 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
            <Globe className="text-purple-500" size="24px" />
          </div>
          <h2 className="text-3xl font-bold">Personal Portfolio Generator</h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-sm">
            Turn your resume into a stunning, multi-page portfolio website instantly. Support for custom vanity domains, global themes, and Google Analytics.
          </p>
          <div className="mt-8 flex-1 bg-gradient-to-t from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 flex flex-col justify-end p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Globe size={120} className="text-purple-500" />
            </div>
            <div className="relative z-10 w-[80%] mx-auto h-[70%] bg-background rounded-t-xl border-x border-t border-purple-500/30 shadow-2xl p-4 flex flex-col gap-2">
              <div className="w-full flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-bold">johndoe.com</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="w-1/2 h-3 bg-muted rounded-full mt-2" />
              <div className="w-3/4 h-2 bg-muted/50 rounded-full" />
            </div>
          </div>
        </BentoItem>

        {/* 6. Live Career Intel (1x1) */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 border border-violet-500/20">
            <Sparkles className="text-violet-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Live Market Intel</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Get live salary updates, market demands, and regional hiring trends powered by real-time web search.
          </p>
        </BentoItem>
 
        {/* 7. Secure PDF Print Engine (1x1) */}
        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <FileText className="text-emerald-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Secure PDF Engine</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Export pixel-perfect PDFs. Employs dynamic server-port checks and Clerk key validation for secure printing.
          </p>
        </BentoItem>
 
        {/* 8. LinkedIn Profile Optimizer (2x1) - Replaces Podcast */}
        <BentoItem className="md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4 border border-blue-600/20">
            <Linkedin className="text-blue-600" size="20px" />
          </div>
          <h2 className="text-xl font-bold">LinkedIn Profile Optimizer</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            One-click sync analyzes your resume against LinkedIn algorithms to auto-craft SEO-optimized headlines and rewrite your experiences for scrolling.
          </p>
        </BentoItem>

        {/* 9. A/B Testing Engine (4x1) - Spans full width at bottom */}
        <BentoItem 
          className="md:col-span-4"
          innerClassName="flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <SplitSquareHorizontal className="text-amber-500" size="20px" />
            </div>
            <h2 className="text-2xl font-bold">A/B Testing Engine</h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
              Run simultaneous job applications using two variations of your resume. We automatically track which variant yields more interview callbacks and suggest data-driven optimizations.
            </p>
          </div>
          <div className="w-full md:w-2/5 flex gap-4 relative">
            {/* Variant A Card */}
            <div className="flex-1 p-5 rounded-2xl border border-muted-foreground/15 bg-muted/5 text-center relative group/card transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-500/5 flex flex-col justify-between min-h-[125px]">
              <div>
                <span className="text-[10px] tracking-wider font-extrabold text-muted-foreground uppercase">Variant A</span>
                <div className="text-3xl font-black mt-1 text-foreground">12%</div>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div className="w-[12%] h-full bg-amber-500 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                  <span>Callback Rate</span>
                  <span>Low CTR</span>
                </div>
              </div>
            </div>

            {/* Variant B Card (Winner) */}
            <div className="flex-1 p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 text-center relative group/card transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col justify-between min-h-[125px]">
              {/* Pulsing Winner Badge */}
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-background text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                Winner
              </div>
              <div>
                <span className="text-[10px] tracking-wider font-extrabold text-emerald-400 uppercase">Variant B</span>
                <div className="text-3xl font-black mt-1 text-emerald-400">28%</div>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="h-1.5 w-full bg-emerald-950/50 rounded-full overflow-hidden">
                  <div className="w-[28%] h-full bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-emerald-400">
                  <span>Callback Rate</span>
                  <span className="font-bold">+133% Lift</span>
                </div>
              </div>
            </div>
          </div>
        </BentoItem>
      </div>
    </div>
  );
};
