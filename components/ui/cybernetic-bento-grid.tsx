"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Bot, Palette, Download, Share2, Shield, Zap } from "lucide-react";

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
        className
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
          Next-Gen Features
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Get Hired
          </span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          From AI-powered content generation to beautiful templates, Resumify
          has all the tools to make your resume shine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* Large Feature Item */}
        <BentoItem className="md:col-span-2 md:row-span-2 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Bot className="text-indigo-500" size="24px" />
            </div>
            <h2 className="text-3xl font-bold">AI Content Generation</h2>
            <p className="mt-3 text-muted-foreground text-lg leading-relaxed max-w-xl">
              Writer&apos;s block? Let our advanced AI analyze your role and
              instantly generate professional, tailored summaries and
              impact-driven bullet points that grab recruiters&apos; attention.
            </p>
          </div>
          <div className="mt-8 h-56 w-full bg-gradient-to-t from-indigo-500/10 to-transparent rounded-xl border border-indigo-500/20 flex items-end justify-center overflow-hidden">
            <div className="w-[80%] h-[80%] bg-background rounded-t-xl border-x border-t border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
              <div className="h-5 w-1/3 bg-indigo-500/20 rounded-full" />
              <div className="space-y-2 mt-2">
                <div className="h-3 w-full bg-muted rounded-full" />
                <div className="h-3 w-5/6 bg-muted rounded-full" />
                <div className="h-3 w-4/6 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </BentoItem>

        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
            <Palette className="text-purple-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Custom Themes</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Personalize your resume with a curated palette of professional color
            themes that stand out.
          </p>
        </BentoItem>

        <BentoItem>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Shield className="text-cyan-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">ATS-Optimized</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Our templates are engineered to parse flawlessly through modern
            Applicant Tracking Systems.
          </p>
        </BentoItem>

        <BentoItem className="md:row-span-2 flex flex-col">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Share2 className="text-emerald-500" size="20px" />
          </div>
          <h2 className="text-2xl font-bold">Shareable Links</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Create a unique, dynamic web link for your resume. Perfect for
            portfolios, cold emails, and instant sharing.
          </p>
          <div className="mt-6 flex-1 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 flex items-center justify-center p-4">
            <div className="px-4 py-2 bg-background rounded-full border border-emerald-500/30 text-xs text-emerald-500 flex items-center gap-2 shadow-lg">
              <Share2 size="12px" />
              resumify.com/p/john-doe
            </div>
          </div>
        </BentoItem>

        <BentoItem className="md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 border border-pink-500/20">
            <Download className="text-pink-500" size="20px" />
          </div>
          <h2 className="text-xl font-bold">Export to PDF</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Download your polished resume as a high-quality, pixel-perfect PDF,
            ready to submit anywhere with one click.
          </p>
        </BentoItem>
      </div>
    </div>
  );
};
